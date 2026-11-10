import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const root = fileURLToPath(new URL('..', import.meta.url));

function fixture(t) {
    const directory = mkdtempSync(join(tmpdir(), 'one-dependency-checker-'));
    t.after(() => rmSync(directory, { recursive: true, force: true }));
    const script = join(directory, 'skills', 'setup-dependencies', 'scripts', 'check-dependencies.cjs');
    const shared = join(directory, 'scripts', 'shared');
    mkdirSync(dirname(script), { recursive: true });
    mkdirSync(shared, { recursive: true });
    writeFileSync(script, readFileSync(join(root, 'skills', 'setup-dependencies', 'scripts', 'check-dependencies.cjs')));
    writeFileSync(join(shared, 'dependencies.cjs'), readFileSync(join(root, 'scripts', 'shared', 'dependencies.cjs')));
    writeFileSync(join(shared, 'runtime-status.cjs'), `
const deps = require('./dependencies.cjs');
module.exports = {
    runtimeRoot: () => process.env.FIXTURE_RUNTIME,
    checkRuntime: key => ({ key, ...deps.MCP_SERVERS[key], present: false, installed: false,
        versionMatched: false, launchable: false, errors: ['Synthetic missing runtime'] }),
};
`);
    const inventory = join(directory, 'inventory.cjs');
    writeFileSync(inventory, `
require('node:fs').appendFileSync(process.env.FIXTURE_COMMAND_LOG, JSON.stringify(process.argv.slice(2)) + '\\n');
if (process.argv.slice(2).join(' ') !== 'plugin list') throw Error('Unexpected non-inspection command');
console.log('No plugins installed');
`);
    writeFileSync(join(shared, 'process-command.cjs'), `
module.exports = { resolveInvocation: (command, args) => {
    if (command !== 'copilot' || args.join(' ') !== 'plugin list') throw Error('Unexpected package-manager command');
    return { command: process.execPath, args: [${JSON.stringify(inventory)}, ...args] };
} };
`);
    const log = join(directory, 'commands.jsonl');
    const runtime = join(directory, 'runtime');
    const preload = join(directory, 'isolated-home.cjs');
    writeFileSync(preload, `require('node:os').homedir = () => ${JSON.stringify(join(directory, 'home'))};`);
    const env = { ...process.env, PATH: '', COPILOT_HOME: join(directory, 'copilot-home'),
        FIXTURE_RUNTIME: runtime, FIXTURE_COMMAND_LOG: log };
    const run = args => spawnSync(process.execPath, ['--require', preload, script, ...args], {
        cwd: directory, env, encoding: 'utf8', timeout: 15000,
    });
    return { directory, log, runtime, run };
}

for (const args of [[], ['--json']]) {
    test(`dependency checker ${args.length ? 'JSON' : 'text'} mode inspects without package or runtime writes`, t => {
        const { run, log, runtime } = fixture(t);
        const result = run(args);
        assert.equal(result.status, 0, result.stderr);
        assert.equal(existsSync(runtime), false);
        const commands = readFileSync(log, 'utf8').trim().split(/\r?\n/).map(line => JSON.parse(line));
        assert.ok(commands.length > 0);
        assert.ok(commands.every(args => args.join(' ') === 'plugin list'));
        if (args.length) {
            const report = JSON.parse(result.stdout);
            assert.deepEqual(report.mcp.servers.map(server => server.key).sort(), ['flint', 'playwright']);
        } else {
            assert.match(result.stdout, /2 configured MCP servers/);
            assert.doesNotMatch(result.stdout, /all three servers|Re-run with --apply/);
            assert.match(result.stdout, /install-and-check\.ps1/);
        }
    });
}

for (const args of [['--apply'], ['--json', '--apply']]) {
    test(`dependency checker rejects legacy ${args.join(' ')} before any inspection or installation`, t => {
        const { run, log, runtime } = fixture(t);
        const result = run(args);
        assert.notEqual(result.status, 0);
        assert.match(result.stderr, /read.only/i);
        assert.match(result.stderr, /install-and-check\.ps1 -Apply/);
        assert.equal(existsSync(log), false);
        assert.equal(existsSync(runtime), false);
    });
}

test('active Word CI example derives optional npm tool pins from the shared registry', () => {
    const source = readFileSync(join(root, 'skills', 'md-to-word', 'SKILL.md'), 'utf8');
    assert.doesNotMatch(source, /@mermaid-js\/mermaid-cli@\d/);
    const example = source.match(/<!-- dependency-pin-example:start -->\r?\n```javascript\r?\n([\s\S]*?)```\r?\n<!-- dependency-pin-example:end -->/);
    assert.ok(example, 'Missing bounded executable dependency-pin example');
    const observed = execFileSync(process.execPath, ['-e', example[1]], { cwd: root, encoding: 'utf8' }).trim();
    const deps = JSON.parse(execFileSync(process.execPath, ['-e',
        'const d=require("./scripts/shared/dependencies.cjs"); console.log(JSON.stringify(["mmdc","svgexport"].map(k=>d.specOf(d.TOOLS[k]))))'],
    { cwd: root, encoding: 'utf8' }));
    assert.deepEqual(JSON.parse(observed), deps);
});

test('integration CI does not provision a global renderer merely to check its version', () => {
    const workflow = readFileSync(join(root, '.github', 'workflows', 'verify.yml'), 'utf8');
    const gate = readFileSync(join(root, 'scripts', 'verification-gate.mjs'), 'utf8');
    assert.doesNotMatch(workflow, /npm install --global/);
    assert.doesNotMatch(gate, /command\('mmdc'/);
    const setup = readFileSync(join(root, 'install-and-check.ps1'), 'utf8');
    assert.match(setup, /fs\.writeFileSync\(diagram, 'graph TD/);
    assert.match(setup, /did not create render output/);
    assert.match(setup, /created invalid render output/);
});
