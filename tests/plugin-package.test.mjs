import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { spawnSync } from 'node:child_process';
import { buildPackage, packageSources, verifyPackage } from '../scripts/build-plugin-package.mjs';
import { ARCHIVE_MOVES, archiveDocs, relocatedPath, rewriteLinks } from '../scripts/archive-maintainer-docs.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

test('archival moves keep literal code and rebase live Markdown routes', () => {
    assert.equal(relocatedPath('docs/verification/session-recovery/history/proof.txt'),
        'archive/verification/session-recovery/history/proof.txt');
    const text = '[Evidence](docs/verification/session-recovery/README.md)\n```\n[x](docs/verification/session-recovery/README.md)\n```\n';
    const result = rewriteLinks(text, join(ROOT, 'README.md'), join(ROOT, 'README.md'),
        target => join(ROOT, relocatedPath(target.slice(ROOT.length + 1).replace(/\\/g, '/'))));
    assert.match(result, /^\[Evidence\]\(archive\/verification/);
    assert.match(result, /```\n\[x\]\(docs\/verification/);
});

test('archive custody preserves historical bytes and refuses conflicting destinations', t => {
    const root = mkdtempSync(join(tmpdir(), 'one-archive-custody-'));
    t.after(() => rmSync(root, { recursive: true, force: true }));
    for (const [source] of ARCHIVE_MOVES) {
        if (source.endsWith('.md')) {
            mkdirSync(dirname(join(root, source)), { recursive: true });
            writeFileSync(join(root, source), '# Historical plan\n');
        } else mkdirSync(join(root, source), { recursive: true });
    }
    const history = join(root, 'docs/verification/session-recovery/history');
    mkdirSync(history);
    const original = Buffer.from('Historical byte stream\r\n');
    writeFileSync(join(history, 'proof.txt'), original);
    const hash = createHash('sha256').update(original).digest('hex');
    writeFileSync(join(root, 'docs/verification/session-recovery/manifest.json'),
        JSON.stringify({ artifacts: [{ path: 'history/proof.txt', sha256: hash, bytes: original.length, edits: [] }] }));
    const result = archiveDocs(root);
    assert.equal(result.frozenEvidenceUnchanged, 1);
    assert.deepEqual(readFileSync(join(root, 'archive/verification/session-recovery/history/proof.txt')), original);
    assert.throws(() => archiveDocs(root), /receipt/);
});

test('package allowlist includes all runtime owners and both demos but excludes maintainer history', () => {
    const selected = packageSources(ROOT);
    assert.ok(selected.includes('docs/flint-showcase.html'));
    assert.ok(selected.includes('docs/flint-experimental.html'));
    assert.ok(selected.includes('docs/verification/skill-scenarios.json'));
    assert.ok(selected.includes('tests/rich-email.test.cjs'));
    assert.ok(selected.includes('scripts/assess-brain.cjs'));
    assert.ok(!selected.some(name => name.startsWith('archive/') || /recovery-retention|session-recovery|development-recovery|docs\/plans/.test(name)));
    assert.ok(!selected.includes('scripts/session-recovery.mjs'));
});

test('lean package verifies, activates only a disposable profile, and detects tampering', t => {
    const temporary = mkdtempSync(join(tmpdir(), 'one-lean-package-'));
    t.after(() => rmSync(temporary, { recursive: true, force: true }));
    const output = join(temporary, 'package');
    const receipt = buildPackage(ROOT, output);
    assert.equal(receipt.status, 'unreleased-source-candidate');
    assert.ok(verifyPackage(output).files > 0);
    assert.ok(verifyPackage(output, ROOT).hashesVerified);
    const staleSource = join(temporary, 'stale-source');
    const first = receipt.files[0].path;
    mkdirSync(dirname(join(staleSource, first)), { recursive: true });
    writeFileSync(join(staleSource, first), 'Changed source after packaging');
    assert.throws(() => verifyPackage(output, staleSource), /Package source changed/);
    assert.throws(() => buildPackage(ROOT, output), /already exists/);
    assert.throws(() => buildPackage(ROOT, ROOT), /replace the source/);
    for (const name of ['flint-showcase.html', 'flint-experimental.html']) {
        assert.deepEqual(readFileSync(join(output, 'docs', name)), readFileSync(join(ROOT, 'docs', name)));
    }
    const script = join(output, 'skills', 'bootstrap-core', 'scripts', 'bootstrap-core.cjs');
    const profile = join(temporary, 'profile');
    const invoke = args => spawnSync(process.execPath, [script, '--target-instructions', profile, ...args],
        { cwd: temporary, encoding: 'utf8', timeout: 15000 });
    const preview = invoke([]);
    assert.equal(preview.status, 0, preview.stderr);
    assert.equal(existsSync(profile), false);
    const apply = invoke(['--apply']);
    assert.equal(apply.status, 0, apply.stderr);
    assert.equal(JSON.parse(apply.stdout).verification.receiptCurrent, true);
    assert.equal(JSON.parse(invoke([]).stdout).receipt.action, 'preserve');
    rmSync(join(output, 'docs', 'flint-showcase.html'));
    assert.throws(() => verifyPackage(output), /missing|ENOENT|Broken package links/);
});

test('release payload is distinct from publication and survives source checkout line-ending conversion', t => {
    const temporary = mkdtempSync(join(tmpdir(), 'one-release-payload-'));
    t.after(() => rmSync(temporary, { recursive: true, force: true }));
    const output = join(temporary, 'package');
    const receipt = buildPackage(ROOT, output, { release: true });
    assert.equal(receipt.status, 'release-payload');
    assert.doesNotMatch(readFileSync(join(output, 'README.md'), 'utf8').split('\n')[0], /Unreleased source-candidate/);
    const source = join(temporary, 'source');
    for (const record of receipt.files) {
        mkdirSync(dirname(join(source, record.path)), { recursive: true });
        const raw = readFileSync(join(ROOT, record.path));
        let data = raw;
        try {
            data = Buffer.from(new TextDecoder('utf-8', { fatal: true }).decode(raw).replace(/\r\n/g, '\n'));
        } catch { /* Binary sources retain their exact bytes. */ }
        writeFileSync(join(source, record.path), data);
    }
    assert.ok(verifyPackage(output, source).hashesVerified);
});
