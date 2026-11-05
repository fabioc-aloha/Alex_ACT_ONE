import assert from 'node:assert/strict';
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { test } from 'node:test';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = file => readFileSync(join(ROOT, file), 'utf8').replace(/\r\n/g, '\n');
const manifest = JSON.parse(read('manifest.json'));
const script = join(ROOT, 'scripts', 'update-docs.mjs');
const labels = { skills: 'SKILL TABLE', prompts: 'PROMPT TABLE', instructions: 'INSTRUCTION TABLE' };

function section(label) {
    const text = read('README.md');
    const start = `<!-- BEGIN GENERATED ${label} -->`;
    const end = `<!-- END GENERATED ${label} -->`;
    assert.ok(text.includes(start) && text.includes(end), `Missing generated ${label}`);
    return text.split(start)[1].split(end)[0];
}

for (const kind of Object.keys(labels)) {
    test(`README ${kind} table lists every declared asset exactly once with its source link`, () => {
        const table = section(labels[kind]);
        const rows = [...table.matchAll(/^\| \[`([^`]+)`\]\(([^)]+)\)/gm)];
        assert.deepEqual(rows.map(row => row[1]).sort(), manifest.assets[kind].map(entry => entry.name).sort());
        for (const entry of manifest.assets[kind]) {
            assert.equal(rows.find(row => row[1] === entry.name)?.[2], entry.path);
        }
        if (kind !== 'skills') {
            for (const entry of manifest.assets[kind]) {
                const source = read(entry.path);
                const [, owner] = source.match(/\]\(\.\.\/skills\/([a-z0-9-]+)\/SKILL\.md\)/) || [];
                assert.ok(owner, entry.name);
                const row = table.split('\n').find(line => line.startsWith(`| [\`${entry.name}\`]`));
                assert.ok(row.includes(`](skills/${owner}/SKILL.md)`), `${entry.name} lost its execution owner`);
                if (kind === 'instructions') assert.ok(row.includes(`\`${entry.applyTo}\``));
            }
        }
    });
}

test('one generated inventory derives source counts from the manifest and server registrations', () => {
    const inventory = section('INVENTORY');
    const plugin = JSON.parse(read('plugin.json'));
    for (const [label, count] of [
        ['Skills', manifest.assets.skills.length],
        ['Prompts / command aliases', manifest.assets.prompts.length],
        ['Resident instructions', manifest.assets.instructions.length],
        ['MCP servers', Object.keys(plugin.mcpServers).length],
    ]) {
        assert.ok(inventory.includes(`| ${label} | ${count} |`), label);
    }
});

test('the documentation generator has no drift and --check performs no writes', async () => {
    assert.ok(existsSync(script), 'Missing reproducible documentation generation');
    const { generateSections, replaceSections } = await import(pathToFileURL(script));
    const sections = generateSections(ROOT);
    assert.equal(replaceSections(read('README.md'), sections), read('README.md'));
    assert.throws(() => replaceSections('No markers here', sections), /marker/i);
    const before = readFileSync(join(ROOT, 'README.md'));
    const manifestBefore = readFileSync(join(ROOT, 'manifest.json'));
    const result = spawnSync(process.execPath, [script, '--check'], { cwd: ROOT, encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr);
    assert.deepEqual(readFileSync(join(ROOT, 'README.md')), before);
    assert.deepEqual(readFileSync(join(ROOT, 'manifest.json')), manifestBefore);
});

test('instruction role metadata is derived from canonical descriptions, not an independent procedure', async () => {
    const { canonicalManifest } = await import(pathToFileURL(script));
    assert.equal(typeof canonicalManifest, 'function');
    const generated = canonicalManifest(ROOT);
    for (const entry of manifest.assets.instructions) {
        const raw = read(entry.path).match(/^description: (.+)$/m)[1];
        const expected = /^(['"])[\s\S]*\1$/.test(raw) ? raw.slice(1, -1) : raw;
        assert.equal(entry.role, expected, entry.name);
        assert.equal(generated.assets.instructions.find(item => item.name === entry.name).role, expected);
    }
});

test('stale instruction role metadata fails the read-only drift check', async t => {
    const { validateInstructionRoles } = await import(pathToFileURL(script));
    assert.equal(typeof validateInstructionRoles, 'function');
    const fixture = mkdtempSync(join(tmpdir(), 'one-role-drift-'));
    t.after(() => rmSync(fixture, { recursive: true, force: true }));
    cpSync(join(ROOT, 'instructions'), join(fixture, 'instructions'), { recursive: true });
    const changed = structuredClone(manifest);
    changed.assets.instructions[0].role = 'stale fixture description';
    writeFileSync(join(fixture, 'manifest.json'), JSON.stringify(changed));
    assert.throws(() => validateInstructionRoles(fixture), /role.*stale|stale.*role/i);
});

test('generation rejects a prompt routed to a missing owner before producing misleading tables', async (t) => {
    assert.ok(existsSync(script), 'Missing reproducible documentation generation');
    const { generateSections } = await import(pathToFileURL(script));
    const fixture = mkdtempSync(join(tmpdir(), 'one-docs-'));
    t.after(() => rmSync(fixture, { recursive: true, force: true }));
    for (const name of ['manifest.json', 'plugin.json', 'skills', 'prompts', 'instructions']) {
        cpSync(join(ROOT, name), join(fixture, name), { recursive: true });
    }
    const entry = manifest.assets.prompts.find(entry => entry.name === 'status');
    writeFileSync(join(fixture, entry.path), read(entry.path).replace('../skills/project-status/', '../skills/missing-owner/'));
    assert.throws(() => generateSections(fixture), /missing.owner|undeclared.*owner/i);
});

test('current docs distinguish shipped optimization from source-only chart additions', () => {
    const readme = read('README.md');
    assert.match(readme, /## Native-first.*optimization/i);
    for (const owner of ['critical-thinking', 'code-review', 'big-idea', 'convert', 'proactive-awareness', 'compile-brain']) {
        assert.ok(readme.includes(`](skills/${owner}/SKILL.md)`), owner);
    }
    assert.match(readme, /published.*v0\.8\.0|v0\.8\.0.*published/i);
    assert.match(readme, /source.only|not yet released/i);
    for (const demo of ['flint-showcase.html', 'flint-experimental.html']) {
        assert.ok(readme.includes(`](docs/${demo})`), demo);
    }
    assert.match(readme, /build-flint-showcase\.mjs/);
    assert.match(read('RELEASE-CHECKLIST.md'), /update-docs\.mjs --check/);
});
