import assert from 'node:assert/strict';
import { cpSync, existsSync, mkdtempSync, mkdirSync, readFileSync, readdirSync, realpathSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = file => readFileSync(join(ROOT, file), 'utf8').replace(/\r\n/g, '\n');
const require = createRequire(import.meta.url);
const { checkFile, headingSlugs } = require('../skills/compile-brain/scripts/check-links.cjs');
const guidePath = 'docs/getting-started.md';
const referencePath = 'docs/install.md';

function guide() {
    assert.ok(existsSync(join(ROOT, guidePath)), 'R7 needs one short first-workflow guide');
    return read(guidePath);
}

test('one short guide covers install, consented activation, verification, and a dependency-free first workflow', () => {
    const text = guide();
    assert.ok(text.split(/\s+/).length <= 700, 'Keep the first session separate from setup reference');
    for (const heading of ['Install', 'Activate', 'Verify', 'Try one workflow']) {
        assert.match(text, new RegExp(`^## \\d\\. ${heading}`, 'm'));
    }
    assert.match(text, /copilot plugin install alex-act-one@alex-mall/);
    assert.doesNotMatch(text, /copilot plugin install fabioc-aloha\/Alex_ACT_ONE/);
    assert.ok(text.includes('](install.md#mall-option)'));
    const reference = read(referencePath);
    const marketplace = read('install-and-check.ps1').match(/MarketplaceSource = '([^']+)'/)?.[1];
    assert.ok(marketplace, 'Use the same reviewed marketplace as the repository installer');
    const register = `copilot plugin marketplace add ${marketplace}`;
    assert.ok(text.includes(register), 'A fresh profile must register Mall before using its install command');
    assert.ok(text.indexOf(register) < text.indexOf('copilot plugin install alex-act-one@alex-mall'));
    const installSection = reference.split('### 1. Install the plugin')[1]?.split('### 2.')[0];
    assert.ok(installSection, 'Missing the detailed install section');
    const mall = installSection.indexOf('#### Mall option');
    const direct = installSection.indexOf('copilot plugin install fabioc-aloha/Alex_ACT_ONE');
    assert.ok(mall >= 0 && direct > mall, 'Lead the reference install section with Mall, not deprecated direct installation');
    assert.ok(installSection.indexOf(register) > mall);
    assert.ok(installSection.indexOf(register) < installSection.indexOf('copilot plugin install alex-act-one@alex-mall'));
    for (const source of [text, reference]) {
        assert.match(source, /repository\s+source/);
        assert.match(source, /unreleased/);
        assert.match(source, /reviewed release/);
    }
    assert.match(text, /\/alex-act-one bootstrap-core/);
    assert.match(text, /preview/i);
    assert.match(text, /approval/i);
    for (const signal of ['expectedFiles', 'preserve', 'receipt', 'version', 'target']) {
        assert.ok(text.includes(signal), `Missing activation success signal: ${signal}`);
    }
    assert.match(text, /host.*(?:observ|load)|(?:observ|load).*host/i);
    assert.match(text, /no optional.*tools/i);
    assert.ok(text.includes(`Release version: \`${JSON.parse(read('plugin.json')).version}\``));
    assert.match(text, /demo.only/i);
});

test('the first-workflow prompt is synthetic and read-only with a semantic success rubric', () => {
    const text = guide();
    const prompt = text.match(/<!-- first-workflow -->\s*```text\n([\s\S]*?)```/)?.[1];
    assert.ok(prompt, 'Readers need a copyable request, not just a skill name');
    assert.match(prompt, /critical-thinking/);
    assert.match(prompt, /synthetic/i);
    assert.match(prompt, /do not.*(?:edit|write)/i);
    assert.match(prompt, /do not.*(?:tools|commands)/i);
    assert.match(prompt, /apart from loading.*guidance/i);
    assert.match(prompt, /hypothes|explanations/i);
    assert.match(prompt, /disconfirm|rule.*out/i);
    assert.match(prompt, /unknown|not.*measur/i);
    assert.match(text, /success.*(?:not|does not)|does not prove/i);
});

test('README routes to onboarding before its catalogs and keeps setup reference separate', () => {
    const readme = read('README.md');
    const entry = readme.indexOf(`](${guidePath})`);
    assert.ok(entry >= 0 && entry < readme.indexOf('## The Skills'));
    assert.ok(readme.includes(`](${referencePath})`));
    const install = readme.indexOf('copilot plugin install alex-act-one@alex-mall');
    assert.ok(install >= 0 && install < entry, 'Lead with marketplace installation before the guide');
    const start = readme.slice(readme.indexOf('## Start here'), readme.indexOf('## What You Can Do'));
    assert.match(start, /copilot plugin marketplace add fabioc-aloha\/Alex_Skill_Mall/);
    assert.doesNotMatch(start, /copilot plugin install fabioc-aloha\/Alex_ACT_ONE/);
    assert.match(start, /deprecat/i);
    assert.match(start, /Existing installations do not update automatically/);
    assert.doesNotMatch(readme, /under Install\.\./);
    const reference = read(referencePath);
    for (const section of ['Where Alex ACT ONE Works', 'Install', 'On Microsoft Scout, register the MCP servers',
        'Optional: extra tools for a few skills', 'Scripts for reinstalling and optional setup']) {
        assert.ok(reference.includes(section), section);
    }
    assert.match(reference, /historical host evidence/);
    assert.match(reference, /^> all 60 skills surfaced/m);
});

test('install guidance preserves observed deprecation instead of treating command availability as a support promise', () => {
    const reference = read(referencePath);
    assert.ok(reference.includes('Warning: Direct plugin installs (repos, URLs, local paths) are deprecated. Only plugin@marketplace installs will be supported in a future release.'));
    assert.match(reference, /installation succeeded/i);
    assert.match(reference, /(?:removal|retirement).*(?:date|version)|(?:date|version).*removal/i);
    assert.match(reference, /help.*not.*deprecat|deprecat.*help/is);
    assert.match(read('ROADMAP.md'), /marketplace.*candidate|candidate.*marketplace/i);
    for (const file of ['RELEASE-CHECKLIST.md', 'docs/testing.md']) {
        const source = read(file);
        assert.doesNotMatch(source, /repository-first|leads with direct repository|starts with direct repository/i);
        assert.match(source, /Mall-first|marketplace-first/i);
    }
});

test('onboarding links and legacy README setup anchors still resolve', () => {
    guide();
    for (const file of ['README.md', guidePath, referencePath, 'ROADMAP.md']) {
        assert.deepEqual(checkFile(join(ROOT, file)).misses, [], file);
    }
    const anchors = headingSlugs(read('README.md'));
    for (const anchor of ['quick-install', 'where-alex-act-one-works', 'install',
        '1-install-the-plugin', '2-turn-on-the-always-on-instructions-once-in-each-app',
        'what-you-get-after-each-step', 'using-claude-code-instead',
        'on-microsoft-scout-register-the-mcp-servers', 'optional-extra-tools-for-a-few-skills',
        'scripts-for-reinstalling-and-optional-setup', 'reinstall-and-verify-one',
        'install-or-check-optional-dependencies']) {
        assert.ok(anchors.has(anchor), `Preserve existing inbound link #${anchor}`);
    }
});

test('documented activation signals work from an installed copy without touching an adopter workspace', t => {
    guide();
    const root = realpathSync(mkdtempSync(join(tmpdir(), 'one onboarding-')));
    t.after(() => rmSync(root, { recursive: true, force: true }));
    const plugin = join(root, 'installed plugin');
    const adopter = join(root, 'adopter workspace');
    const profile = join(root, 'isolated profile');
    const target = join(profile, 'instructions');
    mkdirSync(adopter);
    for (const path of ['plugin.json', 'manifest.json', 'instructions', 'skills']) {
        cpSync(join(ROOT, path), join(plugin, path), { recursive: true });
    }
    const script = join(plugin, 'skills', 'bootstrap-core', 'scripts', 'bootstrap-core.cjs');
    function run(...args) {
        const result = spawnSync(process.execPath, [script, '--target-instructions', target, ...args], {
            cwd: adopter, encoding: 'utf8', timeout: 10000,
            env: { ...process.env, COPILOT_HOME: profile, PATH: '' },
        });
        assert.equal(result.status, 0, result.stderr);
        return JSON.parse(result.stdout);
    }
    const manifest = JSON.parse(read('manifest.json'));
    const preview = run();
    assert.equal(preview.apply, false);
    assert.equal(existsSync(target), false, 'A preview cannot create instructions');
    assert.equal(preview.expectedFiles, manifest.assets.instructions.length);
    assert.equal(preview.coreVersion, JSON.parse(read('plugin.json')).version);
    assert.equal(preview.routing.canonicalRoot, plugin);
    const applied = run('--apply');
    assert.equal(applied.verification.destinationHashes, preview.expectedFiles);
    assert.equal(applied.verification.receiptCurrent, true);
    const before = readdirSync(target).sort().map(file => [file, readFileSync(join(target, file), 'base64')]);
    const verified = run();
    assert.equal(verified.coreVersion, preview.coreVersion);
    assert.equal(verified.targetInstructions, preview.targetInstructions);
    assert.ok(verified.files.every(file => file.action === 'preserve'));
    assert.equal(verified.receipt.action, 'preserve');
    assert.deepEqual(readdirSync(target).sort().map(file => [file, readFileSync(join(target, file), 'base64')]), before);
    assert.deepEqual(readdirSync(adopter), []);
});
