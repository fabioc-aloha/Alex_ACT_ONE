import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const script = join(ROOT, 'skills', 'git-workflow', 'scripts', 'check-git-auth.cjs');
const gitAuth = require(script);

function createGitFixture(t, remoteUrl = 'https://github.com/fabioc-aloha/Alex_ACT_ONE.git') {
    const root = mkdtempSync(join(tmpdir(), 'one-git-auth-'));
    t.after(() => rmSync(root, { recursive: true, force: true }));
    const repo = join(root, 'repo');
    mkdirSync(repo, { recursive: true });
    assert.equal(spawnSync('git', ['init', '-q'], { cwd: repo }).status, 0);
    if (remoteUrl) {
        assert.equal(spawnSync('git', ['remote', 'add', 'origin', remoteUrl], { cwd: repo }).status, 0);
    }
    return { root, repo };
}

function createMockGh(root, statusOutput) {
    const mockScript = join(root, 'mock-gh.js');
    writeFileSync(mockScript, `#!/usr/bin/env node
const args = process.argv.slice(2);
if (args[0] === 'auth' && args[1] === 'status') {
    process.stdout.write(${JSON.stringify(statusOutput)});
    process.exit(0);
}
process.exit(1);
`);
    return mockScript;
}

test('parseGhAuthStatus handles standard and EMU underscore accounts without cross-contaminating active flags', () => {
    const sample = [
        'github.com',
        '  ✓ Logged in to github.com account fabioc-aloha (keyring)',
        '  - Active account: true',
        '  - Git operations protocol: https',
        '',
        '  ✓ Logged in to github.com account fabioc_microsoft (keyring)',
        '  - Active account: false',
        '  - Git operations protocol: https',
    ].join('\n');
    const parsed = gitAuth.parseGhAuthStatus(sample, 'github.com');
    assert.equal(parsed.activeAccount, 'fabioc-aloha');
    assert.equal(parsed.multiAccount, true);
    assert.deepEqual(parsed.accounts, [
        { user: 'fabioc-aloha', active: true },
        { user: 'fabioc_microsoft', active: false },
    ]);
});

test('preview detects active-account mismatch and multi-account unpinned state without modifying .git/config', t => {
    const { root, repo } = createGitFixture(t);
    const ghBin = createMockGh(root, [
        'github.com',
        '  ✓ Logged in to github.com account fabioc_microsoft (keyring)',
        '  - Active account: true',
        '  ✓ Logged in to github.com account fabioc-aloha (keyring)',
        '  - Active account: false',
    ].join('\n'));
    const gitConfigPath = join(repo, '.git', 'config');
    const before = readFileSync(gitConfigPath, 'utf8');

    const preview = gitAuth.inspectRepositoryAuth({
        apply: false,
        repositoryRoot: repo,
        remote: 'origin',
        user: null,
        ghCommand: ghBin,
    });

    assert.equal(preview.status, 'needs-repo-pin');
    assert.equal(preview.gh.activeAccount, 'fabioc_microsoft');
    assert.equal(preview.gh.targetAccount, 'fabioc-aloha');
    assert.ok(preview.problems.some(problem => problem.id === 'active-account-mismatch'));
    assert.equal(readFileSync(gitConfigPath, 'utf8'), before);
});

test('apply pins repository-local .git/config to the expected GitHub account and clears active-account mismatch', t => {
    const { root, repo } = createGitFixture(t);
    const ghBin = createMockGh(root, [
        'github.com',
        '  ✓ Logged in to github.com account fabioc_microsoft (keyring)',
        '  - Active account: true',
        '  ✓ Logged in to github.com account fabioc-aloha (keyring)',
        '  - Active account: false',
    ].join('\n'));

    const preview = gitAuth.inspectRepositoryAuth({
        apply: true,
        repositoryRoot: repo,
        remote: 'origin',
        user: 'fabioc-aloha',
        ghCommand: ghBin,
    });
    const applied = gitAuth.applyRepositoryPin(preview);
    assert.equal(applied.status, 'ok');
    assert.equal(applied.credentialHelper.localConfigured, true);
    assert.equal(applied.credentialHelper.localPinnedUser, 'fabioc-aloha');

    const secondPreview = gitAuth.inspectRepositoryAuth({
        apply: false,
        repositoryRoot: repo,
        remote: 'origin',
        user: null,
        ghCommand: ghBin,
    });
    assert.equal(secondPreview.status, 'ok');
    assert.deepEqual(secondPreview.problems, []);
});

test('rejects unsafe usernames, hosts, or unauthenticated accounts before touching git config', t => {
    assert.throws(() => gitAuth.parseArgs(['--user', 'bad;rm -rf /']), /invalid GitHub username/);
    assert.throws(() => gitAuth.buildPinnedHelperCommand('gh', 'github.com', 'bad$(whoami)'), /unsafe user/);
    assert.throws(() => gitAuth.buildPinnedHelperCommand("C:/bad'path/gh.exe", 'github.com', 'fabioc-aloha'), /unsupported characters/);

    const { root, repo } = createGitFixture(t);
    const ghBin = createMockGh(root, [
        'github.com',
        '  ✓ Logged in to github.com account other-account (keyring)',
        '  - Active account: true',
    ].join('\n'));
    const report = gitAuth.inspectRepositoryAuth({
        apply: false,
        repositoryRoot: repo,
        remote: 'origin',
        user: 'fabioc-aloha',
        ghCommand: ghBin,
    });
    assert.equal(report.status, 'account-not-authenticated');
    assert.throws(() => gitAuth.applyRepositoryPin(report), /cannot pin unauthenticated/);
});
