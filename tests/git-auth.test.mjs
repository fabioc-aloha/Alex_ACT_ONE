import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
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
    assert.equal(spawnSync('git', ['config', '--local', 'credential.https://github.com.helper', ''],
        { cwd: repo }).status, 0);
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
if (args[0] === 'auth' && args[1] === 'token') {
    process.stdout.write('fixture-' + args[args.indexOf('--user') + 1]);
    process.exit(0);
}
if (args[0] === 'api') {
    process.stdout.write(args[1] === 'user' ? process.env.GH_TOKEN.replace(/^fixture-/, '') : 'true');
    process.exit(0);
}
if (args[0] === 'auth' && args[1] === 'git-credential') {
    if (args[2] === 'get') process.stdout.write('username=x-access-token\\npassword=' + process.env.GH_TOKEN + '\\n');
    process.exit(0);
}
process.exit(1);
`);
    return mockScript;
}

const status = (active = 'fabioc_microsoft') => JSON.stringify({ hosts: { 'github.com': [
    { login: 'fabioc-aloha', active: active === 'fabioc-aloha', state: 'success' },
    { login: 'fabioc_microsoft', active: active === 'fabioc_microsoft', state: 'success' },
] } });

test('structured authentication state supports underscore accounts without conflating active and authenticated', () => {
    const sample = status('fabioc-aloha');
    const parsed = gitAuth.parseGhAuthStatus(sample, 'github.com');
    assert.equal(parsed.activeAccount, 'fabioc-aloha');
    assert.equal(parsed.multiAccount, true);
    assert.deepEqual(parsed.accounts, [
        { user: 'fabioc-aloha', active: true, authenticated: true },
        { user: 'fabioc_microsoft', active: false, authenticated: true },
    ]);
});

test('preview detects active-account mismatch and multi-account unpinned state without modifying .git/config', t => {
    const { root, repo } = createGitFixture(t);
    const ghBin = createMockGh(root, status());
    const gitConfigPath = join(repo, '.git', 'config');
    const before = readFileSync(gitConfigPath, 'utf8');

    const preview = gitAuth.inspectRepositoryAuth({
        apply: false,
        repositoryRoot: repo,
        remote: 'origin',
        user: 'fabioc-aloha',
        ghCommand: ghBin,
    });

    assert.equal(preview.status, 'needs-repo-pin');
    assert.equal(preview.gh.activeAccount, 'fabioc_microsoft');
    assert.equal(preview.gh.targetAccount, 'fabioc-aloha');
    assert.equal(preview.verification.identity, true);
    assert.equal(preview.verification.credentialHelper, false);
    assert.equal(readFileSync(gitConfigPath, 'utf8'), before);
});

test('apply pins repository-local .git/config to the expected GitHub account and clears active-account mismatch', t => {
    const { root, repo } = createGitFixture(t);
    const ghBin = createMockGh(root, status());

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
    assert.equal(applied.verification.credentialHelper, true);
    assert.equal(applied.verification.identity, true);
    assert.equal(JSON.stringify(gitAuth.publicReport(applied)).includes('fixture-fabioc'), false);

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
    assert.throws(() => gitAuth.parseArgs(['--user', 'bad;rm -rf /']), /invalid GitHub username/i);
    assert.throws(() => gitAuth.buildPinnedHelperCommand('gh', 'github.com', 'bad$(whoami)'), /unsafe user/i);
    assert.throws(() => gitAuth.buildPinnedHelperCommand("C:/bad'path/gh.exe", 'github.com', 'fabioc-aloha'), /unsupported characters/);

    const { root, repo } = createGitFixture(t);
    const ghBin = createMockGh(root, JSON.stringify({ hosts: { 'github.com': [
        { login: 'other-account', active: true, state: 'success' },
    ] } }));
    const report = gitAuth.inspectRepositoryAuth({
        apply: false,
        repositoryRoot: repo,
        remote: 'origin',
        user: 'fabioc-aloha',
        ghCommand: ghBin,
    });
    assert.equal(report.status, 'account-not-authenticated');
    assert.throws(() => gitAuth.applyRepositoryPin(report), /cannot pin/i);
});

test('organizations do not select a login and unrelated HTTPS hosts are not treated as GitHub', t => {
    const { root, repo } = createGitFixture(t, 'https://github.com/example-org/example.git');
    const ghBin = createMockGh(root, status());
    const options = { repositoryRoot: repo, remote: 'origin', ghCommand: ghBin };
    assert.equal(gitAuth.inspectRepositoryAuth(options).status, 'account-selection-required');
    assert.equal(spawnSync('git', ['remote', 'set-url', 'origin', 'https://dev.azure.com/example/project/repo'],
        { cwd: repo }).status, 0);
    const report = gitAuth.inspectRepositoryAuth(options);
    assert.equal(report.status, 'not-applicable');
});

test('stale previews and helper execution failures preserve the prior config', t => {
    const { root, repo } = createGitFixture(t);
    const ghBin = createMockGh(root, status());
    const options = { repositoryRoot: repo, remote: 'origin', user: 'fabioc-aloha', ghCommand: ghBin };
    const preview = gitAuth.inspectRepositoryAuth(options);
    assert.equal(spawnSync('git', ['config', 'test.concurrent', 'preserve'], { cwd: repo }).status, 0);
    const file = join(repo, '.git', 'config');
    const before = readFileSync(file);
    assert.throws(() => gitAuth.applyRepositoryPin(preview), /changed after preview/);
    assert.deepEqual(readFileSync(file), before);
    const fresh = gitAuth.inspectRepositoryAuth(options);
    const text = readFileSync(ghBin, 'utf8').replace("if (args[2] === 'get')", "if (false)");
    writeFileSync(ghBin, text);
    assert.throws(() => gitAuth.applyRepositoryPin(fresh), /helper verification failed/);
    assert.deepEqual(readFileSync(file), before);
});

test('a failed post-apply probe rolls back the entire prior configuration', t => {
    const { root, repo } = createGitFixture(t);
    const ghBin = createMockGh(root, status());
    const options = { repositoryRoot: repo, remote: 'origin', user: 'fabioc-aloha', ghCommand: ghBin };
    const preview = gitAuth.inspectRepositoryAuth(options);
    const config = join(repo, '.git', 'config');
    const before = readFileSync(config);
    const fs = require('node:fs');
    const rename = fs.renameSync;
    let injected = false;
    fs.renameSync = (source, target) => {
        const result = rename(source, target);
        if (target === config && !injected) {
            injected = true;
            writeFileSync(ghBin, readFileSync(ghBin, 'utf8').replace("if (args[0] === 'api')", "if (false)"));
        }
        return result;
    };
    try {
        assert.throws(() => gitAuth.applyRepositoryPin(preview), /identity verification failed/);
    } finally { fs.renameSync = rename; }
    assert.equal(injected, true);
    assert.deepEqual(readFileSync(config), before);
});
