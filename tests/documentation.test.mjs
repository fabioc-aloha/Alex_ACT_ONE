import assert from 'node:assert/strict';
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { test } from 'node:test';
import mermaid from '../scripts/shared/mermaid-pipeline.cjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = file => readFileSync(join(ROOT, file), 'utf8').replace(/\r\n/g, '\n');
const manifest = JSON.parse(read('manifest.json'));
const script = join(ROOT, 'scripts', 'update-docs.mjs');
const labels = { skills: 'SKILL TABLE', prompts: 'PROMPT TABLE', instructions: 'INSTRUCTION TABLE' };

test('HTML and email guides distinguish supported Mermaid tables from source-retaining fallback', () => {
    const html = read('skills/md-to-html/SKILL.md');
    const email = read('skills/md-to-eml/SKILL.md');
    for (const [type, source] of [
        ['Sequence', 'sequenceDiagram\nAlice->>Bob: Hello'],
        ['Class', 'classDiagram\nclass Example'],
        ['State', 'stateDiagram-v2\n[*] --> Ready'],
        ['ER', 'erDiagram\nTEAM ||--o{ MEMBER : includes'],
        ['Pie', 'pie\n"Yes": 1'],
    ]) {
        assert.match(mermaid.mermaidToTableFallback(source), /Unsupported Mermaid fallback; original source retained/);
        const row = html.split('\n').find(line => line.startsWith(`| ${type} |`));
        assert.ok(row?.includes('Source retained'), type);
    }
    for (const text of [html, email]) assert.match(text, /unsupported.*source|source.*unsupported/is);
    assert.match(email, /Mermaid diagrams show as code blocks \| Warning/);
});

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

test('release docs include the interaction workflow without claiming exhaustive host verification', () => {
    const readme = read('README.md');
    assert.match(readme, /## Native-first.*optimization/i);
    for (const owner of ['critical-thinking', 'code-review', 'big-idea', 'convert', 'proactive-awareness', 'compile-brain']) {
        assert.ok(readme.includes(`](skills/${owner}/SKILL.md)`), owner);
    }
    assert.ok(readme.includes(`Release version: \`v${manifest.version}\``));
    assert.doesNotMatch(readme, /source-only \[flint-interactions\]|not yet released `flint-interactions`/);
    assert.match(readme, /unverified|not freshly verified/i);
    for (const demo of ['flint-showcase.html', 'flint-experimental.html']) {
        assert.ok(readme.includes(`](docs/${demo})`), demo);
    }
    assert.match(readme, /build-flint-showcase\.mjs/);
    assert.match(read('RELEASE-CHECKLIST.md'), /update-docs\.mjs --check/);
});

test('install reference separates repository source, Mall release, and optional runtime state', () => {
    const install = read('docs/install.md');
    assert.match(install, /^## Installation sources/m);
    for (const delivery of ['Repository', 'Mall', 'Optional runtime']) {
        assert.ok(install.includes(`| ${delivery} |`), delivery);
    }
    assert.match(install, /same.*version|version.*same/i);
    assert.match(install, /revision/);
    assert.match(install, /does not.*(?:activate|provision)/i);
    assert.match(read('README.md'), /\]\(docs\/install\.md#installation-sources\)/);
    assert.doesNotMatch(read('ROADMAP.md'), /source-only until a separately approved release and installation/);
});

test('release and testing docs cover the relocated host reference and current onboarding boundary', () => {
    const checklist = read('RELEASE-CHECKLIST.md');
    const testing = read('docs/testing.md');
    assert.ok(checklist.includes('](docs/install.md#where-alex-act-one-works)'));
    assert.doesNotMatch(checklist, /compatibility table in the README/);
    for (const source of [checklist, testing, read('README.md')]) {
        assert.ok(source.includes('tests\\onboarding.test.mjs'), 'Keep onboarding in the documented focused gate');
    }
    assert.match(testing, /disposable.*profile|profile.*disposable/i);
    assert.match(testing, /not.*(?:install|installation).*command|install.*commands.*not/is);
    const readme = read('README.md').split('## What Is Next')[1];
    assert.match(readme, /R7.*complete/is);
    assert.match(readme, /R8/);
    assert.match(read('ROADMAP.md'), /R8.*next|next.*R8/i);
});

test('roadmap is a pending-work plan with evidence links and explicit decision gates', () => {
    const roadmap = read('ROADMAP.md');
    for (const section of ['Now', 'Next', 'Watchlist', 'Completion rules']) {
        assert.ok(roadmap.includes(`## ${section}`), section);
    }
    assert.match(roadmap, /R8\./);
    assert.match(roadmap, /R9\./);
    assert.doesNotMatch(roadmap, /^### R(?:[1-7]|10|11)\./m);
    assert.doesNotMatch(roadmap, /^## (?:Review Baseline|Source Repairs Completed|Working Today)/m);
    for (const target of [
        'docs/verification/README.md', 'docs/verification/flint-browser.md',
        'docs/testing.md', 'RELEASE-CHECKLIST.md',
    ]) assert.ok(roadmap.includes(`](${target})`), target);
    assert.match(roadmap, /same.commit/i);
    assert.match(roadmap, /approval/);
    assert.match(roadmap, /rollback/);
    assert.match(roadmap, /screen.reader/);
    assert.match(roadmap, /not run/);
});

test('release notices match package metadata and keep historical candidate switching explicit', () => {
    const plugin = JSON.parse(read('plugin.json'));
    assert.equal(plugin.version, manifest.version);
    const escaped = manifest.version.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    for (const file of ['README.md', 'ROADMAP.md', 'docs/install.md', 'docs/getting-started.md']) {
        assert.match(read(file), new RegExp(`Release version: \`v?${escaped}\``, 'i'), file);
    }
    const install = read('docs/install.md');
    assert.match(install, /^## Testing the repository candidate$/m);
    for (const command of [
        'copilot plugin uninstall alex-act-one@alex-mall',
        'copilot plugin install fabioc-aloha/Alex_ACT_ONE',
        'copilot plugin list --json',
    ]) assert.ok(install.includes(command), command);
    assert.match(install, /uninstall.*does not.*(?:instruction|profile)/is);
    assert.match(install, /preview.*approval/is);
    assert.match(install, /not.*reinstall-and-check\.ps1/is);
    assert.match(install, /historical.*candidate|candidate.*historical/i);
});
