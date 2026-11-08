import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { applyRecovery, previewRecovery, verifyRecovery } from '../scripts/recover-local-artifacts.mjs';

function fixture(t) {
    const root = mkdtempSync(join(tmpdir(), 'local-recovery-'));
    t.after(() => rmSync(root, { recursive: true, force: true }));
    const repo = join(root, 'repo');
    const sessions = join(root, 'sessions');
    mkdirSync(repo);
    execFileSync('git', ['init', '-q'], { cwd: repo });
    const session = join(sessions, 'abcdef01-owned');
    mkdirSync(join(session, 'files'), { recursive: true });
    writeFileSync(join(session, 'workspace.yaml'), `cwd: ${repo}\ngit_root: ${repo}\n`);
    return { root, repo, sessions, session, options: {
        repositoryRoot: repo, sessionRoot: sessions, destination: 'docs/recovery',
    } };
}

test('local recovery is read-only in preview, preserves sources, and is independently verifiable', t => {
    const f = fixture(t);
    const original = '# Dated report\n\n[Proof](proof.json)\n';
    writeFileSync(join(f.session, 'files', 'report.md'), original);
    writeFileSync(join(f.session, 'files', 'proof.json'), '{"checks":4}\n');
    const plan = previewRecovery(f.options);
    assert.equal(plan.copies.length, 2);
    assert.equal(execFileSync('git', ['status', '--porcelain'], { cwd: f.repo, encoding: 'utf8' }), '');
    const result = applyRecovery(plan);
    assert.equal(result.copied, 2);
    assert.equal(result.hashesVerified, true);
    assert.equal(readFileSync(join(f.session, 'files', 'report.md'), 'utf8'), original);
    assert.match(readFileSync(join(f.repo, 'docs/recovery/history/abcdef01/report.md'), 'utf8'), /\]\(proof\.json\)/);
    assert.equal(verifyRecovery(f.repo, 'docs/recovery').copied, 2);
    assert.throws(() => applyRecovery(plan), /overwritten/);
    assert.equal(previewRecovery(f.options).copies.length, 0);
});

test('local recovery deduplicates exact and line-ending-only copies and isolates worktrees', t => {
    const f = fixture(t);
    writeFileSync(join(f.repo, 'existing.md'), '# Existing\r\n');
    writeFileSync(join(f.session, 'files', 'old-name.md'), '# Existing\n');
    const other = join(f.sessions, 'other');
    mkdirSync(join(other, 'files'), { recursive: true });
    writeFileSync(join(other, 'workspace.yaml'), `cwd: ${f.repo}-sibling\n`);
    writeFileSync(join(other, 'files', 'foreign.md'), '# Not this project\n');
    const plan = previewRecovery(f.options);
    assert.equal(plan.copies.length, 0);
    assert.equal(plan.accounted.length, 1);
    assert.deepEqual(plan.matchedSessions, ['abcdef01-owned']);
});

test('local recovery excludes credentials, raw identities, packages, and unreviewed binary sources', t => {
    const f = fixture(t);
    writeFileSync(join(f.session, 'files', 'secret.txt'), 'Bearer abcdefghijklmnopqrstuvwxyz\n');
    writeFileSync(join(f.session, 'files', 'roster.json'), '{"UserPrincipalName":"person@example.invalid"}');
    writeFileSync(join(f.session, 'files', 'screenshot.png'), 'Unreviewed binary');
    mkdirSync(join(f.session, 'files', 'node_modules'));
    writeFileSync(join(f.session, 'files', 'node_modules', 'vendor.js'), 'Third party');
    const plan = previewRecovery(f.options);
    assert.equal(plan.copies.length, 0);
    assert.equal(plan.excluded.length, 4);
});

test('local recovery rejects escapes and detects stale source bytes and corrupt recovered evidence', t => {
    const f = fixture(t);
    writeFileSync(join(f.session, 'files', 'helper.py'), 'print("fixture")\n');
    assert.throws(() => previewRecovery({ ...f.options, destination: '../outside' }), /escapes/);
    const stale = previewRecovery(f.options);
    writeFileSync(join(f.session, 'files', 'helper.py'), 'print("changed")\n');
    assert.throws(() => applyRecovery(stale), /changed after preview/);
    const fresh = previewRecovery(f.options);
    applyRecovery(fresh);
    writeFileSync(join(f.repo, fresh.copies[0].path), 'Corrupted');
    assert.throws(() => verifyRecovery(f.repo, f.options.destination), /differs/);
});

test('local recovery reports linked sources without following them', t => {
    const f = fixture(t);
    const outside = join(f.root, 'external');
    mkdirSync(outside);
    writeFileSync(join(outside, 'private.txt'), 'Outside the boundary');
    symlinkSync(outside, join(f.session, 'files', 'linked'), process.platform === 'win32' ? 'junction' : 'dir');
    const plan = previewRecovery(f.options);
    assert.equal(plan.copies.length, 0);
    assert.match(plan.excluded[0].reason, /linked/);
});

test('local recovery preserves synthetic cohort counts but blocks encoded data and literal API tokens', t => {
    const f = fixture(t);
    writeFileSync(join(f.session, 'files', 'game.json'), '{"live":{"members":10000}}\n');
    writeFileSync(join(f.session, 'files', 'encoded.json'), '{"payloadType":"InlineBase64","payload":"e30="}\n');
    writeFileSync(join(f.session, 'files', 'api.txt'), 'QUALTRICS_API_TOKEN="abcdefghijklmnopqrstuv"\n');
    const plan = previewRecovery(f.options);
    assert.equal(plan.copies.length, 1);
    assert.equal(plan.copies[0].sourcePath, 'game.json');
    assert.equal(plan.excluded.length, 2);
});
