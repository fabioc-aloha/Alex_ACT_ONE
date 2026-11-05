const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { test } = require('node:test');
const helper = path.resolve(__dirname, '..', 'skills', 'rich-email', 'scripts', 'open-rich-outlook-draft.cjs');
const { buildOutlookDraftEml, parseEml, countBodyWords } = require(helper);
const fixture = '<html><body><h1>Fixture</h1><p>Review this synthetic draft.</p></body></html>';
const eml = (body = fixture) => [
    'To: demo@example.invalid', 'Subject: Fixture draft', 'MIME-Version: 1.0',
    'Content-Type: text/html; charset=UTF-8', 'Content-Transfer-Encoding: base64', '',
    Buffer.from(body).toString('base64'),
].join('\r\n');

test('draft preparation is unsent, preserves content, and inserts the spacer only once', () => {
    const prepared = buildOutlookDraftEml(eml());
    assert.match(prepared, /^X-Unsent: 1$/m);
    const parsed = parseEml(prepared);
    assert.deepEqual(parsed.to, ['demo@example.invalid']);
    assert.equal(parsed.subject, 'Fixture draft');
    assert.ok(parsed.html.includes('<p>Review this synthetic draft.</p>'));
    assert.equal((parsed.html.match(/data-rich-email-spacer/g) || []).length, 1);
    assert.equal(buildOutlookDraftEml(prepared), prepared);
});
test('unsupported multipart and malformed recipient headers fail explicitly', () => {
    assert.throws(() => parseEml(eml().replace('text/html; charset=UTF-8', 'multipart/mixed; boundary=fixture')),
        /multipart.*refused/i);
    assert.throws(() => parseEml(eml().replace('demo@example.invalid', '"demo@example.invalid"')), /recipient/i);
});
test('word counting excludes styles and script bodies', () => {
    assert.equal(countBodyWords('<style>ignore these words</style><script>ignore();</script><p>One &amp; two</p>'), 3);
});
test('validation-only CLI runs without Outlook, does not alter the EML, and creates no draft', t => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'one-email-validation-'));
    t.after(() => fs.rmSync(root, { recursive: true, force: true }));
    const input = path.join(root, 'fixture.eml');
    const original = eml();
    fs.writeFileSync(input, original);
    const result = spawnSync(process.execPath, [helper, input, '--validate-only'], {
        cwd: root, encoding: 'utf8', timeout: 10000, env: { ...process.env, PATH: '' },
    });
    assert.equal(result.status, 0, result.stderr);
    const report = JSON.parse(result.stdout);
    assert.equal(report.unsent, true);
    assert.equal(report.spacerLines, 2);
    assert.equal(report.subjectChars, 'Fixture draft'.length);
    assert.equal(report.bodyWords, 5);
    assert.equal(fs.readFileSync(input, 'utf8'), original);
    assert.deepEqual(fs.readdirSync(root), ['fixture.eml']);
});
