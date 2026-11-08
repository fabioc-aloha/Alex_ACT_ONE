import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const { checkSessionArtifacts } = require(join(ROOT, 'skills', 'proactive-awareness', 'scripts', 'check-session-artifacts.cjs'));
const read = path => readFileSync(join(ROOT, path), 'utf8');
const contract = 'skills/proactive-awareness/references/project-artifact-storage.md';

test('storage contract covers deliverables, internal plans, privacy, containment, and honest delivery', () => {
    const text = read(contract);
    for (const requirement of [
        /one-off helpers/, /supporting sources/, /Private planning storage.*internal reasoning/is,
        /subagents/, /credentials/, /frozen evidence/, /junctions/, /ignore state/,
        /staged, committed, pushed/, /not universal filesystem enforcement/, /Plan-only and/,
        /never.*evade/is, /missing, blocked, deliberately excluded/,
    ]) assert.match(text, requirement);
});

test('repository guidance and project bootstrap both retain project deliverables inside the repository', () => {
    for (const path of ['AGENTS.md', 'skills/bootstrap-project/resources/AGENTS.md']) {
        const text = read(path);
        assert.match(text, /## Project artifact storage/);
        assert.match(text, /never solely|never the sole/);
        assert.match(text, /useful.*helpers/);
        assert.match(text, /Git state/);
        assert.match(text, /credentials/);
    }
});

test('activated resident floor routes delivery checks through the canonical read-only owner', () => {
    const instruction = read('instructions/session-health-monitoring.instructions.md');
    assert.match(instruction, /supporting evidence/);
    assert.match(instruction, /delivery-check/);
    assert.match(instruction, /instruction-level safeguard/);
    const owner = read('skills/proactive-awareness/SKILL.md');
    assert.match(owner, /delivery-check/i);
    assert.match(owner, /references\/project-artifact-storage\.md/);
    assert.match(owner, /mode is also read-only/);
});

test('all directly coupled workflow owners explicitly route to the shared storage contract', () => {
    for (const owner of ['plan', 'bootstrap-core', 'bootstrap-project', 'meditation', 'render-verify', 'git-workflow']) {
        assert.ok(read(`skills/${owner}/SKILL.md`).includes('../proactive-awareness/references/project-artifact-storage.md'), owner);
    }
    assert.match(read('skills/plan/SKILL.md'), /only for internal reasoning/);
    assert.match(read('skills/plan/SKILL.md'), /blocks.*document write/);
    assert.match(read('skills/render-verify/SKILL.md'), /final repository copy/);
});

test('frozen log evidence is discoverable in Git and protected from newline rewriting', () => {
    assert.match(read('.gitignore'), /!archive\/verification\/session-recovery\/history\/\*\*\/\*\.log/);
    assert.match(read('.gitattributes'), /archive\/verification\/session-recovery\/history\/\*\* -text -whitespace/);
});

test('session-artifact checker detects stranded deliverables and recognizes recovered or repository-owned files', t => {
    const temp = mkdtempSync(join(tmpdir(), 'one-session-check-'));
    t.after(() => rmSync(temp, { recursive: true, force: true }));
    const repo = join(temp, 'repo');
    const sessions = join(temp, 'sessions');
    mkdirSync(repo, { recursive: true });
    execFileSync('git', ['init', '-q'], { cwd: repo });
    writeFileSync(join(repo, 'saved-report.md'), '# Already in repo\r\n');

    const matchingSession = join(sessions, 'session-1');
    mkdirSync(join(matchingSession, 'files', 'logs'), { recursive: true });
    writeFileSync(join(matchingSession, 'workspace.yaml'), `cwd: ${repo}\nrepository: fabioc-aloha/example\n`);
    writeFileSync(join(matchingSession, 'files', 'saved-report.md'), '# Already in repo\n');
    writeFileSync(join(matchingSession, 'files', 'stranded-plan.md'), '# Left in session storage\n');
    writeFileSync(join(matchingSession, 'files', 'logs', 'process.log'), 'disposable runtime log\n');
    writeFileSync(join(matchingSession, 'files', 'stdout.jsonl'), '{"type":"ephemeral"}\n');

    const otherSession = join(sessions, 'session-2');
    mkdirSync(join(otherSession, 'files'), { recursive: true });
    writeFileSync(join(otherSession, 'workspace.yaml'), 'cwd: C:\\Other\\Repo\nrepository: fabioc-aloha/other\n');
    writeFileSync(join(otherSession, 'files', 'other-project.md'), '# Unrelated repo\n');

    const report = checkSessionArtifacts({ repositoryRoot: repo, sessionRoot: sessions });
    assert.equal(report.status, 'stranded-artifacts-found', JSON.stringify({
        repo, gitRoot: execFileSync('git', ['rev-parse', '--show-toplevel'], { cwd: repo, encoding: 'utf8' }).trim(),
        metadata: readFileSync(join(matchingSession, 'workspace.yaml'), 'utf8'), report,
    }));
    assert.equal(report.matchedSessions, 1);
    assert.equal(report.totalCandidates, 2);
    assert.equal(report.accountedCount, 1);
    assert.equal(report.strandedCount, 1);
    assert.equal(report.stranded[0].sessionId, 'session-1');
    assert.equal(report.stranded[0].relativePath, 'stranded-plan.md');

    writeFileSync(join(repo, 'stranded-plan.md'), '# Left in session storage\n');
    const cleanReport = checkSessionArtifacts({ repositoryRoot: repo, sessionRoot: sessions });
    assert.equal(cleanReport.status, 'clean');
    assert.equal(cleanReport.strandedCount, 0);
});

function detectorFixture(t) {
    const temp = mkdtempSync(join(tmpdir(), 'one-detector-negative-'));
    t.after(() => rmSync(temp, { recursive: true, force: true }));
    const repo = join(temp, 'repo');
    const sessions = join(temp, 'sessions');
    const files = join(sessions, 'owned', 'files');
    mkdirSync(repo);
    execFileSync('git', ['init', '-q'], { cwd: repo });
    mkdirSync(files, { recursive: true });
    writeFileSync(join(sessions, 'owned', 'workspace.yaml'), `cwd: ${repo}\n`);
    writeFileSync(join(files, 'report.md'), '# Original\n');
    const archive = join(repo, 'docs', 'session-artifact-recovery', 'dated');
    mkdirSync(archive, { recursive: true });
    const digest = data => createHash('sha256').update(data).digest('hex');
    const record = {
        path: 'report.md', sourceSha256: digest('# Original\n'),
        sha256: digest('# Recovered\n'), bytes: Buffer.byteLength('# Recovered\n'),
    };
    const save = () => writeFileSync(join(archive, 'manifest.json'),
        JSON.stringify({ schemaVersion: 1, artifacts: [record] }));
    writeFileSync(join(archive, 'report.md'), '# Recovered\n');
    save();
    return { repo, sessions, files, archive, record, save, options: { repositoryRoot: repo, sessionRoot: sessions } };
}

test('detector verifies alternate manifests and notices changed originals after recovery', t => {
    const f = detectorFixture(t);
    assert.equal(checkSessionArtifacts(f.options).status, 'clean');
    writeFileSync(join(f.files, 'report.md'), '# Changed after recovery\n');
    assert.equal(checkSessionArtifacts(f.options).strandedCount, 1);
});

for (const fault of ['missing', 'corrupt', 'malformed', 'escaping', 'ignored']) {
    test(`detector fails explicitly on ${fault} recovery evidence`, t => {
        const f = detectorFixture(t);
        if (fault === 'missing') rmSync(join(f.archive, 'report.md'));
        if (fault === 'corrupt') writeFileSync(join(f.archive, 'report.md'), 'corrupted');
        if (fault === 'malformed') writeFileSync(join(f.archive, 'manifest.json'), 'invalid JSON');
        if (fault === 'escaping') { f.record.path = '../../../../outside.md'; f.save(); }
        if (fault === 'ignored') writeFileSync(join(f.repo, '.gitignore'), 'docs/session-artifact-recovery/\n');
        assert.throws(() => checkSessionArtifacts(f.options), /manifest|recovery|ignored|escap|ENOENT/i);
    });
}

test('ignored and linked copies cannot satisfy delivery and unavailable scope is not clean', t => {
    const f = detectorFixture(t);
    rmSync(join(f.archive, 'manifest.json'));
    writeFileSync(join(f.repo, 'ignored.md'), '# Original\n');
    writeFileSync(join(f.repo, '.gitignore'), 'ignored.md\n');
    assert.equal(checkSessionArtifacts(f.options).strandedCount, 1);
    const outside = join(f.repo, '..', 'outside');
    mkdirSync(outside);
    writeFileSync(join(outside, 'report.md'), '# Original\n');
    symlinkSync(outside, join(f.files, 'linked'), process.platform === 'win32' ? 'junction' : 'dir');
    const report = checkSessionArtifacts(f.options);
    assert.equal(report.status, 'incomplete');
    assert.ok(report.unsupported.length > 0);
    assert.equal(checkSessionArtifacts({ ...f.options, sessionRoot: join(f.repo, 'absent') }).status, 'session-root-absent');
});

test('session scope canonicalizes existing workspace aliases consistently with the Git root', t => {
    const f = detectorFixture(t);
    const alias = join(f.repo, '..', 'workspace-alias');
    symlinkSync(f.repo, alias, process.platform === 'win32' ? 'junction' : 'dir');
    writeFileSync(join(f.sessions, 'owned', 'workspace.yaml'), `cwd: ${alias}\n`);
    assert.equal(checkSessionArtifacts(f.options).status, 'clean');
});
