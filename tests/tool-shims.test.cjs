const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { test } = require('node:test');
const { runTool } = require('../scripts/shared/tool-runner.cjs');

function fixture(t, { tool = 'mmdc', local = false, badBin = false } = {}) {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'one tool-shims-'));
    t.after(() => fs.rmSync(root, { recursive: true, force: true }));
    const prefix = path.join(root, 'prefix with spaces');
    const modules = path.join(prefix, 'node_modules');
    const bin = local ? path.join(modules, '.bin') : prefix;
    const packageName = tool === 'mmdc' ? '@mermaid-js/mermaid-cli' : 'svgexport';
    const directory = path.join(modules, ...packageName.split('/'));
    fs.mkdirSync(bin, { recursive: true });
    fs.mkdirSync(directory, { recursive: true });
    const shim = path.join(bin, tool + '.cmd');
    fs.writeFileSync(shim, '@echo off\r\necho THE_SHELL_SHIM_MUST_NOT_RUN\r\n');
    fs.writeFileSync(path.join(directory, 'package.json'), JSON.stringify({
        name: packageName, bin: { [tool]: badBin ? '../outside.cjs' : 'cli.cjs' },
    }));
    fs.writeFileSync(path.join(directory, 'cli.cjs'), 'console.log(JSON.stringify(process.argv.slice(2)));\n');
    return { shim, directory };
}
const windows = { skip: process.platform === 'win32' ? false : 'Real npm .cmd layout is Windows-specific' };
const args = ['path with spaces.svg', '& whoami', 'literal%PATH%', 'a!b', '`literal`', 'quote"value'];

for (const options of [{}, { local: true }, { tool: 'svgexport' }]) {
    test(`Windows sync tool launch resolves the installed package bin: ${JSON.stringify(options)}`, windows, t => {
        const { shim } = fixture(t, options);
        const output = runTool(shim, args, { encoding: 'utf8', timeout: 5000 });
        assert.deepEqual(JSON.parse(output), args);
    });
}
test('Windows async tool launch uses the same shell-free package resolution', windows, async t => {
    const { shim } = fixture(t);
    const { spawnCommand } = await import('../scripts/process-launch.mjs');
    const child = spawnCommand(shim, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    const output = await new Promise((resolve, reject) => {
        let text = '';
        child.stdout.on('data', data => { text += data; });
        child.on('error', reject);
        child.on('close', code => code === 0 ? resolve(text) : reject(new Error(`fixture tool exited ${code}`)));
    });
    assert.deepEqual(JSON.parse(output), args);
});
test('a package bin escaping its package is rejected instead of running a shell', windows, t => {
    const { shim } = fixture(t, { badBin: true });
    assert.throws(() => runTool(shim, []), /bin.*(?:outside|escap)|(?:outside|escap).*bin/i);
});
test('native executables still receive literal arguments', () => {
    assert.deepEqual(JSON.parse(runTool(process.execPath, ['-e',
        'console.log(JSON.stringify(process.argv.slice(1)))', ...args], { encoding: 'utf8' })), args);
});
