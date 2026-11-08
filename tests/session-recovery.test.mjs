import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { recoverArchive, sanitizeText, verifyArchive } from '../scripts/session-recovery.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const archivePath = 'archive/verification/session-recovery';
const hash = value => createHash('sha256').update(value).digest('hex');

function fixture(t) {
    const root = mkdtempSync(join(tmpdir(), 'one-session-recovery-'));
    t.after(() => rmSync(root, { recursive: true, force: true }));
    const archive = join(root, archivePath);
    mkdirSync(join(archive, 'history'), { recursive: true });
    const data = Buffer.from('Historical evidence\n');
    writeFileSync(join(archive, 'history', 'proof.txt'), data);
    const manifest = {
        schemaVersion: 1, status: 'historical-not-current-certification',
        artifacts: [{
            path: 'history/proof.txt', sourceBytes: data.length, sourceSha256: hash(data),
            bytes: data.length, sha256: hash(data), edits: [], formatStatus: 'historical',
        }],
    };
    const save = () => writeFileSync(join(archive, 'manifest.json'), JSON.stringify(manifest));
    save();
    return { root, archive, manifest, save };
}

test('recovery checker verifies known bytes and stays read-only', t => {
    const { root, archive } = fixture(t);
    const before = readFileSync(join(archive, 'manifest.json'));
    assert.deepEqual(verifyArchive(root), {
        artifacts: 1, bytes: Buffer.byteLength('Historical evidence\n'),
        hashesVerified: true, status: 'historical-not-current-certification',
    });
    assert.deepEqual(readFileSync(join(archive, 'manifest.json')), before);
});

for (const failure of ['missing', 'corrupted', 'unregistered', 'empty', 'unsupported', 'duplicate', 'escape', 'undeclared-edit']) {
    test(`recovery checker rejects ${failure} evidence`, t => {
        const { root, archive, manifest, save } = fixture(t);
        if (failure === 'missing') rmSync(join(archive, 'history', 'proof.txt'));
        if (failure === 'corrupted') writeFileSync(join(archive, 'history', 'proof.txt'), 'Historical evidence!\n');
        if (failure === 'unregistered') writeFileSync(join(archive, 'history', 'extra.txt'), 'unregistered');
        if (failure === 'empty') manifest.artifacts = [];
        if (failure === 'unsupported') manifest.schemaVersion = 2;
        if (failure === 'duplicate') manifest.artifacts.push({ ...manifest.artifacts[0] });
        if (failure === 'escape') manifest.artifacts[0].path = 'history/../../../../../../outside.txt';
        if (failure === 'undeclared-edit') manifest.artifacts[0].sourceSha256 = '0'.repeat(64);
        save();
        assert.throws(() => verifyArchive(root));
    });
}

test('recovery checker rejects junction escapes without following them', t => {
    const { root, archive, manifest, save } = fixture(t);
    const external = join(root, 'external');
    mkdirSync(external);
    writeFileSync(join(external, 'proof.txt'), 'Historical evidence\n');
    symlinkSync(external, join(archive, 'history', 'linked'), process.platform === 'win32' ? 'junction' : 'dir');
    manifest.artifacts[0].path = 'history/linked/proof.txt';
    save();
    assert.throws(() => verifyArchive(root), /linked/i);
});

test('redaction preserves JSON shape while removing user paths and email addresses', () => {
    const input = JSON.stringify({
        native: 'C:\\Users\\fixture-user\\evidence', portable: 'C:/Users/fixture-user/evidence',
        cache: 'file-c-3A-Users-fixture-copilot', email: 'fixture@example.invalid',
    });
    const recovered = JSON.parse(sanitizeText(input));
    assert.equal(recovered.native, 'C:\\Users\\<USER>\\evidence');
    assert.equal(recovered.portable, 'C:/Users/<USER>/evidence');
    assert.equal(recovered.cache, 'file-c-3A-Users-USER-copilot');
    assert.equal(recovered.email, '<EMAIL>');
    assert.equal(sanitizeText(sanitizeText(input)), sanitizeText(input));
    assert.throws(() => sanitizeText('Bearer fixturecredential12345678'), /manual review/);
});

test('authorized recovery preserves originals, deduplicates evidence, and refuses overwrite', t => {
    const root = mkdtempSync(join(tmpdir(), 'one-authorized-recovery-'));
    t.after(() => rmSync(root, { recursive: true, force: true }));
    const repo = join(root, 'repo');
    const sessions = join(root, 'sessions');
    mkdirSync(join(repo, archivePath), { recursive: true });
    writeFileSync(join(repo, 'CHANGELOG.md'), '# Changelog\n');
    const ids = [
        '11372d9c-45f0-4e30-8d17-f7c60c3eb4f9', '3e832a77-ed36-4c86-a4ee-070100b1c775',
        'e44f8ac4-782f-4503-882e-101a7945bddb', 'e60bdb37-788d-480f-9bda-6211947df42c',
        '9fcdec8a-4839-44dd-ba35-1e5192fe13d0',
    ];
    for (const id of ids) {
        const session = join(sessions, id);
        mkdirSync(join(session, 'files'), { recursive: true });
        writeFileSync(join(session, 'workspace.yaml'), 'repository: fabioc-aloha/Alex_ACT_ONE\n');
        writeFileSync(join(session, 'files', 'report.md'), '# Historical report\n');
    }
    const original = readFileSync(join(sessions, ids[0], 'files', 'report.md'));
    const result = recoverArchive(repo, sessions);
    assert.equal(result.artifacts, 4);
    assert.equal(result.duplicateSources, 1);
    assert.equal(result.originalsPreserved, true);
    assert.deepEqual(readFileSync(join(sessions, ids[0], 'files', 'report.md')), original);
    assert.throws(() => recoverArchive(repo, sessions), /overwriting/);
    assert.ok(existsSync(join(repo, archivePath, 'manifest.json')));
});

test('repository recovery is complete and independently verifiable without external session storage', () => {
    const result = verifyArchive(ROOT);
    assert.equal(result.artifacts, 93);
    assert.equal(result.prunedArtifacts, 127);
    assert.equal(result.originalArtifacts, 220);
    assert.equal(result.hashesVerified, true);
});

test('pruned custody entries require an approved decision, safe path, hash, and recovery commit', t => {
    const { root, archive, manifest, save } = fixture(t);
    const record = { ...manifest.artifacts[0], path: 'history/pruned.txt', reason: 'Approved redundant output',
        recommendation: 'PRUNE', sourceCommit: '1'.repeat(40) };
    manifest.pruned = [record];
    manifest.originalArtifactCount = 2;
    save();
    assert.equal(verifyArchive(root).prunedArtifacts, 1);
    record.path = 'history/../../outside';
    save();
    assert.throws(() => verifyArchive(root), /pruned artifact path/);
    record.path = 'history/pruned.txt';
    record.sourceCommit = '';
    save();
    assert.throws(() => verifyArchive(root), /recovery commit/);
    assert.ok(existsSync(join(archive, 'history', 'proof.txt')));
});
