import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { verifyArchive } from '../../../../scripts/session-recovery.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '../../../..');
const PREFIX = 'docs/verification/session-recovery/';
const COMMIT = 'dd242ccefecbc8739937c9ddf4dfc56b40ff9627';
const hash = data => createHash('sha256').update(data).digest('hex');
const csv = readFileSync(join(HERE, 'files.csv'), 'utf8').trim().split('\n');
const rows = csv.slice(1).map(line => {
    const fields = [...line.matchAll(/"((?:[^"]|"")*)"(?:,|$)/g)].map(match => match[1].replace(/""/g, '"'));
    assert.equal(fields.length, 9, 'Unsupported approval CSV');
    return { id: fields[0], file: fields[1], decision: fields[3], sha256: fields[5], evidence: fields[6], reason: fields[7] };
});
const selected = rows.filter(row => ['DELETE', 'PRUNE'].includes(row.decision));
assert.equal(selected.length, 127, 'Approval scope differs from the 27 DELETE and 100 PRUNE decisions');
assert.ok(selected.every(row => row.id.startsWith('H') && row.file.startsWith(`${PREFIX}history/`)
    && !row.file.split('/').includes('..')), 'Cleanup escaped the approved historical inventory');
assert.equal(new Set(selected.map(row => row.file)).size, selected.length, 'Duplicate cleanup target');
const manifestPath = join(ROOT, PREFIX, 'manifest.json');
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
assert.ok(!manifest.pruned, 'Cleanup is already applied; do not rewrite custody history');
verifyArchive(ROOT);
const artifacts = new Map(manifest.artifacts.map(record => [PREFIX + record.path, record]));
for (const row of selected) {
    assert.ok(artifacts.has(row.file), 'Approved target is absent from the recovery manifest');
    assert.equal(hash(readFileSync(join(ROOT, row.file))), row.sha256, 'Approved file changed after review');
}
const removed = selected.map(row => ({ ...artifacts.get(row.file), reviewId: row.id,
    recommendation: row.decision, observedEvidence: row.evidence, reason: row.reason, sourceCommit: COMMIT }));
const remaining = manifest.artifacts.filter(record => !selected.some(row => row.file === PREFIX + record.path));
assert.equal(remaining.length, 93, 'Unexpected retained historical inventory');
const result = { sourceCommit: COMMIT, decision: 'Full lean cleanup explicitly approved 2026-11-08',
    removedArtifacts: 127, retainedHistoricalArtifacts: 93,
    removedBytes: removed.reduce((sum, record) => sum + record.bytes, 0),
    retainedBytes: remaining.reduce((sum, record) => sum + record.bytes, 0),
    preservedArchiveRecommendations: rows.filter(row => row.decision === 'ARCHIVE').length,
    noHistoryRewrite: true, externalOriginalsUntouched: true, removedReviewIds: selected.map(row => row.id) };
assert.ok(process.argv[2] === '--apply' || process.argv[2] === '--preview', 'Use --preview or --apply');
if (process.argv[2] === '--apply') {
    assert.ok(!existsSync(join(HERE, 'implementation.json')), 'Cleanup implementation receipt already exists');
    for (const row of selected) unlinkSync(join(ROOT, row.file));
    writeFileSync(manifestPath, `${JSON.stringify({ ...manifest, artifacts: remaining,
        originalArtifactCount: 220, pruned: removed }, null, 2)}\n`);
    const verified = verifyArchive(ROOT);
    assert.equal(verified.prunedArtifacts, 127);
    writeFileSync(join(HERE, 'implementation.json'), `${JSON.stringify({ ...result, hashesVerified: true }, null, 2)}\n`, { flag: 'wx' });
}
console.log(JSON.stringify(result, null, 2));
