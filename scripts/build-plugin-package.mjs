import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { rewriteLinks } from './archive-maintainer-docs.mjs';
import links from '../skills/compile-brain/scripts/check-links.cjs';
import publication from './shared/output-publication.cjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ROOT_FILES = ['plugin.json', 'manifest.json', 'LICENSE', 'README.md',
    'install-optional-dependencies.ps1', 'reinstall-and-check.ps1'];
const DOCS = ['docs/README.md', 'docs/package.md', 'docs/getting-started.md', 'docs/install.md', 'docs/testing.md',
    'docs/flint-showcase.html', 'docs/flint-experimental.html', 'docs/launch/evaluation-guide.md',
    'docs/verification/README.md', 'docs/verification/flint-browser.md', 'docs/verification/skill-scenarios.json'];
const MAINTAINER_SCRIPTS = new Set(['scripts/session-recovery.mjs', 'scripts/recover-local-artifacts.mjs',
    'scripts/archive-maintainer-docs.mjs', 'scripts/build-plugin-package.mjs',
    'scripts/verification-gate.mjs', 'scripts/update-docs.mjs']);
const sha256 = data => createHash('sha256').update(data).digest('hex');
const portable = value => value.split(sep).join('/');
const contentHash = data => {
    try { return sha256(Buffer.from(new TextDecoder('utf-8', { fatal: true }).decode(data).replace(/\r\n/g, '\n'))); }
    catch { return sha256(data); }
};

function tree(root, name) {
    const full = join(root, name);
    assert.ok(!lstatSync(full).isSymbolicLink(), `Linked package source is unsupported: ${name}`);
    if (lstatSync(full).isFile()) return [name];
    return readdirSync(full).sort().flatMap(child => tree(root, `${name}/${child}`));
}

function within(root, target) {
    const name = relative(root, target);
    return name === '' || (name !== '..' && !name.startsWith(`..${sep}`) && !isAbsolute(name));
}

export function packageSources(root) {
    const selected = [...ROOT_FILES, ...DOCS, ...['skills', 'instructions', 'prompts', 'assets']
        .flatMap(name => tree(root, name)),
    ...tree(root, 'scripts').filter(name => !MAINTAINER_SCRIPTS.has(name)),
    'ci/runtime/package.json', 'ci/runtime/package-lock.json', 'tests/rich-email.test.cjs'];
    const manifest = JSON.parse(readFileSync(join(root, 'manifest.json'), 'utf8'));
    for (const group of ['skills', 'instructions', 'prompts']) {
        for (const entry of manifest.assets[group]) assert.ok(selected.includes(entry.path), `Missing declared ${group} asset: ${entry.path}`);
    }
    assert.equal(new Set(selected).size, selected.length, 'Duplicate package input');
    for (const name of selected) assert.ok(lstatSync(join(root, name)).isFile(), `Package input missing: ${name}`);
    return selected.sort();
}

function outputFile(root, name) {
    assert.ok(typeof name === 'string' && name && !isAbsolute(name) && !name.includes('\\'), 'Invalid package-relative path');
    const full = resolve(root, name);
    assert.ok(within(root, full), 'Package path escapes output');
    for (let current = full; current !== root; current = dirname(current)) {
        if (existsSync(current)) assert.ok(!lstatSync(current).isSymbolicLink(), 'Linked package path is unsupported');
    }
    return full;
}

export function verifyPackage(output, sourceRoot = null) {
    const receipt = JSON.parse(readFileSync(outputFile(output, 'package-receipt.json'), 'utf8'));
    assert.equal(receipt.schemaVersion, 1, 'Unsupported package receipt');
    assert.ok(['unreleased-source-candidate', 'release-payload'].includes(receipt.status), 'Unsupported package status');
    assert.ok(Array.isArray(receipt.files) && receipt.files.length > 0, 'Package inventory is empty');
    const expected = new Set();
    for (const record of receipt.files) {
        assert.ok(!expected.has(record.path), 'Duplicate package file');
        expected.add(record.path);
        const data = readFileSync(outputFile(output, record.path));
        assert.equal(data.length, record.bytes, `Package byte length differs: ${record.path}`);
        assert.equal(sha256(data), record.sha256, `Package hash differs: ${record.path}`);
        if (!record.edits.length) assert.equal(record.sourceSha256, record.sha256, 'Undeclared package edit');
        if (sourceRoot) assert.equal(contentHash(readFileSync(join(sourceRoot, record.path))), record.sourceContentSha256,
            `Package source changed since build: ${record.path}`);
        if (record.path.endsWith('.md')) assert.deepEqual(links.checkFile(join(output, record.path)).misses, [], `Broken package links: ${record.path}`);
    }
    const actual = tree(output, '.').map(name => name.replace(/^\.\//, '')).sort();
    assert.deepEqual(actual, [...expected, 'package-receipt.json'].sort(), 'Package contains unregistered files');
    assert.ok(![...expected].some(name => name.startsWith('archive/') || /(?:session|development|retention)-recovery/.test(name)),
        'Maintainer history leaked into the package');
    const manifest = JSON.parse(readFileSync(join(output, 'manifest.json'), 'utf8'));
    const plugin = JSON.parse(readFileSync(join(output, 'plugin.json'), 'utf8'));
    assert.equal(plugin.version, manifest.version, 'Package manifest version differs');
    for (const group of ['skills', 'instructions', 'prompts']) {
        for (const asset of manifest.assets[group]) assert.ok(expected.has(asset.path), 'Declared package asset missing');
    }
    return { files: expected.size, bytes: receipt.files.reduce((sum, record) => sum + record.bytes, 0),
        hashesVerified: true, pluginVersion: plugin.version, status: receipt.status };
}

export function buildPackage(root, output, { release = false } = {}) {
    root = resolve(root);
    output = resolve(output);
    assert.ok(output !== root && !within(output, root), 'Output cannot replace the source repository or an ancestor');
    assert.ok(!existsSync(output), 'Package output already exists; verify it or select a new candidate destination');
    const selected = packageSources(root);
    const directories = new Set(selected.flatMap(name => {
        const parts = name.split('/');
        return parts.slice(0, -1).map((_, index) => parts.slice(0, index + 1).join('/'));
    }));
    const repo = JSON.parse(readFileSync(join(root, 'plugin.json'), 'utf8')).repository.url.replace(/\.git$/, '');
    const mapTarget = target => {
        assert.ok(within(root, target), 'Package Markdown reference escapes source repository');
        const name = portable(relative(root, target));
        return selected.includes(name) || directories.has(name) ? join(output, name) : repo;
    };
    const prepared = selected.map(name => {
        const original = readFileSync(join(root, name));
        let data = original;
        const edits = [];
        if (name.endsWith('.md')) {
            const text = rewriteLinks(original.toString('utf8'), join(root, name), join(output, name), mapTarget);
            if (text !== original.toString('utf8')) edits.push('unshipped-maintainer-links-routed-to-source-repository');
            data = Buffer.from(text);
            if (name === 'README.md' || name === 'docs/testing.md') {
                const notice = (release ? `> Release payload for Alex ACT ONE. Publication and installation are independently verified in the source release record.\n` :
                    `> Unreleased source-candidate package. Declared version is not a new published release.\n`) +
                    `> Maintainer history and source-only CI tooling are not bundled; use the source repository for those commands.\n\n`;
                data = Buffer.from(notice.replace(/\n/g, text.includes('\r\n') ? '\r\n' : '\n') + text);
                edits.push('candidate-package-scope-notice');
            }
        }
        return { path: name, sourceSha256: sha256(original), sourceContentSha256: contentHash(original),
            sha256: sha256(data), bytes: data.length, edits, data };
    });
    mkdirSync(dirname(output), { recursive: true });
    const staging = mkdtempSync(join(dirname(output), '.alex-package-'));
    try {
        for (const entry of prepared) {
            const file = outputFile(staging, entry.path);
            mkdirSync(dirname(file), { recursive: true });
            writeFileSync(file, entry.data, { flag: 'wx' });
        }
        const receipt = { schemaVersion: 1, status: release ? 'release-payload' : 'unreleased-source-candidate',
            declaredPluginVersion: JSON.parse(readFileSync(join(root, 'plugin.json'), 'utf8')).version,
            sourceCommit: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(),
            sourceHasUncommittedChanges: Boolean(execFileSync('git', ['status', '--porcelain'], { cwd: root, encoding: 'utf8' }).trim()),
            files: prepared.map(({ data, ...record }) => record) };
        writeFileSync(join(staging, 'package-receipt.json'), `${JSON.stringify(receipt, null, 2)}\n`, { flag: 'wx' });
        verifyPackage(staging);
        for (const entry of prepared) {
            assert.equal(sha256(readFileSync(join(root, entry.path))), entry.sourceSha256, 'Source changed during packaging');
        }
        // Per-file publication avoids Windows directory-rename locks; the receipt is published last.
        mkdirSync(output);
        publication.publishFiles([...prepared.map(entry => ({
            source: join(staging, entry.path), destination: outputFile(output, entry.path),
        })), { source: join(staging, 'package-receipt.json'), destination: join(output, 'package-receipt.json') }]);
        verifyPackage(output);
        return receipt;
    } finally {
        if (existsSync(staging)) rmSync(staging, { recursive: true, force: true });
    }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    try {
        assert.ok(['--build', '--check'].includes(process.argv[2]), 'Use --build or --check');
        let output = join(ROOT, 'dist', 'alex-act-one');
        let release = false;
        for (let i = 3; i < process.argv.length; i++) {
            if (process.argv[i] === '--release') release = true;
            else if (process.argv[i] === '--out' && process.argv[i + 1]) output = resolve(process.argv[++i]);
            else throw new Error('Usage: build-plugin-package.mjs --build|--check [--out <directory>] [--release]');
        }
        assert.ok(within(ROOT, output), 'Candidate output must remain inside this source repository');
        if (process.argv[2] === '--build') buildPackage(ROOT, output, { release });
        console.log(JSON.stringify(verifyPackage(output, ROOT), null, 2));
    } catch (error) {
        console.error(`Plugin packaging failed: ${error.message}`);
        process.exitCode = 1;
    }
}
