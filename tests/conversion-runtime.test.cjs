const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { test } = require('node:test');
const { runTool } = require('../scripts/shared/tool-runner.cjs');

const ROOT = path.resolve(__dirname, '..');
const available = name => spawnSync(process.platform === 'win32' ? 'where.exe' : 'which', [name],
    { encoding: 'utf8', timeout: 5000 }).status === 0;
const pandoc = available('pandoc');
for (const [skill, extension] of [['md-to-html', 'html'], ['md-to-word', 'docx']]) {
    test(`real ${skill} preserves literal inline/fenced code and renders tables and links`, {
        skip: pandoc ? false : 'Pandoc is not installed; no real conversion claimed',
    }, t => {
        const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'one converter-fidelity-'));
        t.after(() => fs.rmSync(fixture, { recursive: true, force: true }));
        const source = path.join(fixture, 'source with spaces.md');
        const output = path.join(fixture, 'output.' + extension);
        fs.writeFileSync(source, '# Fixture\n\nLiteral `\\alpha` and ``x==y==z with ` ticks``.\n\n' +
            'Prose ==marked== and [Example](https://example.invalid/fixture).\n\n' +
            '| Item | Count |\n| --- | --- |\n| North | 12 |\n\n' +
            '~~~text\n# literal heading\n- [ ] literal list\n\\beta\n~~~\n');
        const result = spawnSync(process.execPath, [
            path.join(ROOT, 'skills', skill, 'scripts', skill + '.cjs'), source, output,
        ], { encoding: 'utf8', timeout: 30000 });
        assert.equal(result.status, 0, result.stderr + result.stdout);
        assert.ok(fs.statSync(output).size > 0);
        const rendered = extension === 'html' ? fs.readFileSync(output, 'utf8')
            : runTool('pandoc', [output, '--to=plain'], { encoding: 'utf8', timeout: 10000 });
        assert.ok(rendered.includes('\\alpha'));
        assert.ok(rendered.includes('x==y==z'));
        assert.ok(rendered.includes('\\beta'));
        assert.ok(rendered.includes('North'));
        assert.ok(rendered.includes('Example'));
        if (extension === 'html') {
            assert.match(rendered, /<code>\\alpha<\/code>/);
            assert.match(rendered, /<table/);
            assert.match(rendered, /href="https:\/\/example\.invalid\/fixture"/);
        }
    });
}
test('the installed Mermaid npm CLI starts through the shared tool runner', {
    skip: available('mmdc') ? false : 'Mermaid CLI not installed',
}, () => {
    assert.match(runTool('mmdc', ['--version'], { encoding: 'utf8', timeout: 15000 }).trim(), /^\d+\.\d+\.\d+/);
});
