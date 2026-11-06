import assert from 'node:assert/strict';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { createServer } from 'node:net';
import { test } from 'node:test';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (...parts) => readFileSync(join(ROOT, ...parts), 'utf8');
const body = (text) => text.replace(/^---\r?\n[\s\S]*?\r?\n---\s*/, '');
const manifest = JSON.parse(read('manifest.json'));
const owners = {
    'assess-brain': 'assess-brain', banner: 'svg-banner', 'bootstrap-core': 'bootstrap-core',
    'bootstrap-project': 'bootstrap-project', 'compile-brain': 'compile-brain', convert: 'convert',
    'critical-thinking': 'critical-thinking', 'install-visual-companions': 'install-visual-companions',
    meditate: 'meditation', 'problem-framing-audit': 'problem-framing-audit',
    'render-chart': 'render-chart', 'rich-email': 'rich-email',
    'setup-dependencies': 'setup-dependencies', 'setup-enterprise': 'setup-enterprise-stack',
    status: 'project-status',
};

function fixture(t) {
    const root = mkdtempSync(join(tmpdir(), 'one-native-'));
    t.after(() => rmSync(root, { recursive: true, force: true }));
    return root;
}

function copyPlugin(source, destination) {
    for (const name of ['plugin.json', 'manifest.json', 'skills', 'instructions', 'scripts']) {
        cpSync(join(source, name), join(destination, name), { recursive: true });
    }
}

test('installed activation fixtures exclude concurrent test scratch state', async t => {
    const root = fixture(t);
    const source = join(root, 'source');
    const destination = join(root, 'installed plugin');
    for (const name of ['skills', 'instructions', 'scripts', '.test-optional-deps-fixture']) {
        mkdirSync(join(source, name), { recursive: true });
        writeFileSync(join(source, name, 'marker'), 'fixture');
    }
    for (const name of ['plugin.json', 'manifest.json']) writeFileSync(join(source, name), '{}');
    const server = process.platform === 'win32' ? null : createServer();
    try {
        if (server) {
            await new Promise((resolve, reject) => {
                server.once('error', reject);
                server.listen(join(source, '.test-optional-deps-fixture', 'diagnostic.socket'), resolve);
            });
        }
        copyPlugin(source, destination);
        assert.equal(existsSync(join(destination, '.test-optional-deps-fixture')), false);
        for (const name of ['skills', 'instructions', 'scripts', 'plugin.json', 'manifest.json']) {
            assert.ok(existsSync(join(destination, name)), name);
        }
    } finally {
        if (server?.listening) await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
    }
});

for (const [command, owner] of Object.entries(owners)) {
    test(`compatibility command ${command} is a thin route to ${owner}`, () => {
        const text = read('prompts', `${command}.prompt.md`);
        assert.ok(body(text).length < 1600, `${command} still duplicates its workflow`);
        assert.ok(text.includes(`](../skills/${owner}/SKILL.md)`), 'missing owning-skill route');
        assert.match(text, /load.*follow/i);
        assert.match(text, /arguments|inputs|constraints/i);
        assert.match(text, /missing|unavailable/i);
        assert.ok(existsSync(join(ROOT, 'skills', owner, 'SKILL.md')));
    });
}

test('all resident instructions are short activation contracts with installed-source routing', () => {
    for (const instruction of manifest.assets.instructions) {
        const text = read(instruction.path);
        assert.ok(body(text).length < 3500, `${instruction.name} still embeds a procedure`);
        assert.match(text, /load.*follow/i, instruction.name);
        assert.match(text, /canonicalRoot|canonical installed/i, instruction.name);
        assert.match(text, /missing|unavailable/i, instruction.name);
        assert.match(text, /\]\(\.\.\/skills\/[\w-]+\/SKILL\.md\)/, instruction.name);
    }
});

for (const [alias, owner, mode] of [
    ['problem-framing-audit', 'critical-thinking', 'framing'],
    ['adversarial-review', 'critical-thinking', 'adversarial'],
    ['risk-analysis', 'critical-thinking', 'curation'],
    ['deep-review', 'code-review', 'deep'],
]) {
    test(`${alias} selects a canonical mode without a second procedure`, () => {
        const text = read('skills', alias, 'SKILL.md');
        assert.ok(body(text).length < 2000, alias);
        assert.ok(text.includes(`](../${owner}/SKILL.md)`));
        assert.match(text, new RegExp(mode, 'i'));
        const ownerText = read('skills', owner, 'SKILL.md');
        assert.doesNotMatch(ownerText, new RegExp(`load.*\\]\\(\\.\\./${alias}/SKILL\\.md\\)`, 'i'));
    });
}

test('ACT has a materiality-first procedure and optional non-code critique methods', () => {
    const text = read('skills', 'critical-thinking', 'SKILL.md');
    assert.match(text, /materiality first/i);
    assert.match(text, /framing/i);
    assert.match(text, /no code diff|without a code diff/i);
    assert.ok(text.includes('references/runtime-act-pass.md'));
    assert.ok(text.includes('references/adversarial-methods.md'));
    assert.match(text, /only.*selected|selected.*only/i);
});

test('native planning has no compulsory project file or prewritten implementation', () => {
    const text = read('skills', 'plan', 'SKILL.md');
    assert.ok(body(text).length < 3500);
    assert.match(text, /native.*plan|plan.*native/i);
    assert.match(text, /MCP|external tools/);
    assert.match(text, /explicitly requests|explicitly asks/);
    assert.doesNotMatch(text, /Each task = 2-5|Every plan MUST|complete code/i);
});

test('browser routing prefers native tools but retains an honest fallback', () => {
    const text = read('skills', 'browser-tools', 'SKILL.md');
    assert.match(text, /native/i);
    assert.match(text, /console/i);
    assert.match(text, /alex-playwright/);
    assert.match(text, /unavailable|unsupported/i);
    assert.ok(body(text).length < 3500);
});

test('Humanizer keeps its modes and loads its catalog as a reference', () => {
    const text = read('skills', 'humanizer', 'SKILL.md');
    assert.ok(text.includes('references/pattern-catalog.md'));
    assert.doesNotMatch(text, /^## CONTENT PATTERNS/m);
    assert.match(text, /Audit-only mode/);
    assert.match(text, /Copywriter Mode/);
    assert.match(text, /Practitioner-Editor Default/);
    assert.match(text, /approval/i);
    const catalog = read('skills', 'humanizer', 'references', 'pattern-catalog.md');
    assert.match(catalog, /CONTENT PATTERNS/);
    assert.match(catalog, /LANGUAGE AND GRAMMAR PATTERNS/);
    assert.match(catalog, /FILLER AND HEDGING/);
    assert.match(catalog, /Performance/);
});

test('ordinary code review does not inline deep or specialist checklists', () => {
    const text = read('skills', 'code-review', 'SKILL.md');
    assert.ok(text.includes('references/advanced-audits.md'));
    assert.ok(text.includes('references/deep-review.md'));
    assert.match(text, /ordinary|routine/i);
    assert.match(text, /read.only|do not modify/i);
    assert.doesNotMatch(text, /## Mission-Critical Review/);
});

test('read-only recovery is shared without inheriting meditation writes', () => {
    const text = read('skills', 'proactive-awareness', 'SKILL.md');
    assert.match(text, /read.only/i);
    assert.match(text, /authoritative task/i);
    assert.match(text, /native.*history|history.*native/i);
    assert.doesNotMatch(text, /Read `\/memories\/session\/`/);
    for (const owner of ['project-status', 'meditation']) {
        assert.ok(read('skills', owner, 'SKILL.md').includes('](../proactive-awareness/SKILL.md)'));
    }
    assert.match(read('skills', 'meditation', 'SKILL.md'), /does not authorize skill creation|does not authorize.*capabilit/i);
});

test('new workflow owners are declared without retiring the original commands', () => {
    for (const name of ['convert', 'render-chart', 'project-status']) {
        assert.ok(manifest.assets.skills.some((entry) => entry.name === name));
    }
    assert.equal(manifest.assets.prompts.length, Object.keys(owners).length);
    assert.match(read('skills', 'render-chart', 'SKILL.md'), /Chart Brief/);
    assert.match(read('skills', 'render-chart', 'SKILL.md'), /same.*data|shared.*semantic/i);
    assert.match(read('skills', 'project-status', 'SKILL.md'), /read.only/i);
    assert.match(read('skills', 'convert', 'SKILL.md'), /md-to-word/);
});

test('activated copies expose canonical skill routes from an arbitrary working directory', (t) => {
    const root = fixture(t);
    const plugin = join(root, 'installed plugin');
    copyPlugin(ROOT, plugin);
    const script = join(plugin, 'skills', 'bootstrap-core', 'scripts', 'bootstrap-core.cjs');
    const target = join(root, 'instructions');
    const result = spawnSync(process.execPath, [script, '--apply', '--target-instructions', target],
        { cwd: root, encoding: 'utf8', timeout: 10000 });
    assert.equal(result.status, 0, result.stderr);
    const preview = JSON.parse(result.stdout);
    assert.equal(preview.routing.canonicalRoot, plugin);
    assert.ok(preview.routing.skillRoutes.length >= manifest.assets.instructions.length);
    for (const route of preview.routing.skillRoutes) {
        assert.ok(existsSync(route.resolvedPath), route.resolvedPath);
        assert.ok(route.resolvedPath.startsWith(plugin));
        assert.match(readFileSync(join(target, route.instruction), 'utf8'), /routing\.skillRoutes/);
    }
    assert.equal(existsSync(join(root, 'skills')), false);
    assert.equal(readdirSync(target).length, manifest.assets.instructions.length + 1);
    const victim = preview.routing.skillRoutes[0].resolvedPath;
    rmSync(victim);
    const failed = spawnSync(process.execPath, [script, '--target-instructions', target],
        { cwd: root, encoding: 'utf8', timeout: 10000 });
    assert.notEqual(failed.status, 0);
    assert.match(failed.stderr, /missing.*skill|skill.*missing/i);
    assert.ok(existsSync(join(target, '.alex-act-one-bootstrap.json')));
});

test('native availability does not silently remove legacy integrations', () => {
    const plugin = JSON.parse(read('plugin.json'));
    assert.ok(plugin.mcpServers['alex-playwright']);
    assert.equal(plugin.commands, 'prompts');
    assert.match(read('skills', 'bootstrap-core', 'SKILL.md'), /legacy|compatibility/i);
    assert.doesNotMatch(read('README.md'), /Copilot CLI has no browser at all/);
});

test('activation rejects an externally redirected owner before writing instructions', (t) => {
    const root = fixture(t);
    const plugin = join(root, 'plugin');
    copyPlugin(ROOT, plugin);
    const owner = join(plugin, 'skills', 'critical-thinking');
    const outside = join(root, 'outside');
    mkdirSync(outside);
    writeFileSync(join(outside, 'SKILL.md'), '# Foreign owner\n');
    rmSync(owner, { recursive: true });
    symlinkSync(outside, owner, 'junction');
    const target = join(root, 'instructions');
    const script = join(plugin, 'skills', 'bootstrap-core', 'scripts', 'bootstrap-core.cjs');
    const result = spawnSync(process.execPath, [script, '--apply', '--target-instructions', target],
        { cwd: root, encoding: 'utf8', timeout: 10000 });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /outside the canonical plugin/i);
    assert.equal(existsSync(target), false);
    assert.equal(readFileSync(join(outside, 'SKILL.md'), 'utf8'), '# Foreign owner\n');
});

for (const name of ['git-workflow', 'systematic-debugging', 'test-driven-development',
    'spike', 'meditation', 'install-visual-companions']) {
    test(`${name} retains its contract without loading its entire execution essay`, () => {
        const text = read('skills', name, 'SKILL.md');
        assert.ok(body(text).length < 4000, name);
        assert.ok(text.includes('references/execution-details.md'), name);
        assert.ok(existsSync(join(ROOT, 'skills', name, 'references', 'execution-details.md')));
        assert.match(text, /approval|consent/i);
    });
}
