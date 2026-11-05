import assert from 'node:assert/strict';
import { cpSync, existsSync, mkdtempSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const skill = readFileSync(join(ROOT, 'skills', 'rich-email', 'SKILL.md'), 'utf8');
const examples = {
    'rich-email-tests': 'tests/rich-email.test.cjs',
    'rich-email-validate': 'skills/rich-email/scripts/open-rich-outlook-draft.cjs',
};
const commands = {
    'rich-email-tests': 'node --test "<plugin-root>\\tests\\rich-email.test.cjs"',
    'rich-email-validate': 'node "<plugin-root>\\skills\\rich-email\\scripts\\open-rich-outlook-draft.cjs" "$env:TEMP\\message.eml" --validate-only',
};
function block(id, source = skill) {
    const marker = `<!-- executable-example: ${id} -->`;
    assert.ok(source.includes(marker), `Missing explicit runnable example ${id}`);
    const content = source.slice(source.indexOf(marker) + marker.length).match(/```powershell\r?\n([\s\S]*?)```/)?.[1];
    assert.ok(content, id);
    assert.equal(content.replace(/`\r?\n\s*/g, ' ').replace(/\s+/g, ' ').trim(), commands[id],
        'The documented command must match its reviewed safe execution contract');
    return content;
}
test('runnable rich-email commands are marked, portable, and backed by real shipped targets', () => {
    for (const [id, path] of Object.entries(examples)) {
        const content = block(id);
        assert.ok(content.includes('<plugin-root>'), 'Never assume the adopter has repository files');
        assert.ok(content.includes(path.replace(/\//g, '\\')), id);
        assert.ok(existsSync(join(ROOT, ...path.split('/'))), path);
    }
    assert.match(block('rich-email-validate'), /--validate-only/);
    assert.ok(skill.includes('<!-- illustrative-example: rich-email-open-draft -->'));
    assert.doesNotMatch(skill, /scripts\/test-rich-email\.cjs/);
});
test('additional flags or commands cannot masquerade as a reviewed executable example', () => {
    assert.throws(() => block('rich-email-validate', skill.replace('--validate-only', '--validate-only; unexpected-command')),
        /reviewed safe execution contract/);
});
test('new executable markers cannot silently bypass the curated safe command tests', () => {
    const found = [];
    function walk(dir) {
        for (const entry of readdirSync(dir, { withFileTypes: true })) {
            if (['.git', 'node_modules'].includes(entry.name)) continue;
            const file = join(dir, entry.name);
            if (entry.isDirectory()) walk(file);
            else if (entry.name.endsWith('.md')) {
                for (const match of readFileSync(file, 'utf8').matchAll(/<!-- executable-example: ([a-z0-9-]+) -->/g)) {
                    found.push(match[1]);
                }
            }
        }
    }
    walk(join(ROOT, 'skills'));
    assert.deepEqual(found.sort(), Object.keys(examples).sort());
});
test('documented commands run against an installed copy from an unrelated adopter directory', t => {
    block('rich-email-tests');
    block('rich-email-validate');
    const root = mkdtempSync(join(tmpdir(), 'one documented-example-'));
    t.after(() => rmSync(root, { recursive: true, force: true }));
    const plugin = join(root, 'installed plugin');
    const adopter = join(root, 'unrelated adopter');
    mkdirSync(adopter);
    for (const path of ['skills/rich-email', 'tests/rich-email.test.cjs']) {
        cpSync(join(ROOT, ...path.split('/')), join(plugin, ...path.split('/')), { recursive: true });
    }
    const testEnv = { ...process.env };
    delete testEnv.NODE_TEST_CONTEXT;
    const run = spawnSync(process.execPath, ['--test', '--test-reporter=tap', join(plugin, 'tests', 'rich-email.test.cjs')],
        { cwd: adopter, encoding: 'utf8', timeout: 20000, env: testEnv });
    assert.equal(run.status, 0, run.stderr + run.stdout);
    assert.match(run.stdout, /^# tests 4$/m);
    assert.match(run.stdout, /^# skipped 0$/m);
    const message = join(root, 'synthetic.eml');
    writeFileSync(message, 'To: demo@example.invalid\r\nSubject: Fixture\r\nContent-Type: text/html\r\n\r\n<html><body><p>Review this.</p></body></html>');
    const validation = spawnSync(process.execPath, [
        join(plugin, 'skills', 'rich-email', 'scripts', 'open-rich-outlook-draft.cjs'), message, '--validate-only',
    ], { cwd: adopter, encoding: 'utf8', timeout: 10000, env: { ...process.env, PATH: '' } });
    assert.equal(validation.status, 0, validation.stderr);
    assert.equal(JSON.parse(validation.stdout).unsent, true);
    assert.equal(existsSync(join(adopter, 'skills')), false);
    assert.deepEqual(readdirSync(adopter), []);
});
test('Replicate documentation points to the real manifest and environment reference', () => {
    const source = readFileSync(join(ROOT, 'skills', 'replicate-imagery', 'SKILL.md'), 'utf8');
    const plugin = JSON.parse(readFileSync(join(ROOT, 'plugin.json'), 'utf8'));
    assert.ok(source.includes('](../../plugin.json)'));
    assert.doesNotMatch(source, /shipped `\.vscode\/mcp\.json`/);
    assert.equal(plugin.mcpServers.replicate.env.REPLICATE_API_TOKEN, '${env:REPLICATE_API_TOKEN}');
});
