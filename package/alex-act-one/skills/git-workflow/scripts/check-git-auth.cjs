#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const SAFE_HOST = /^[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?$/i;
const SAFE_USER = /^[a-z0-9][a-z0-9_-]{0,38}$/i;
const digest = data => crypto.createHash('sha256').update(data).digest('hex');

function parseArgs(args) {
    const options = { apply: false, repositoryRoot: process.cwd(), remote: 'origin', user: null,
        hostname: 'github.com', ghCommand: process.env.ALEX_ACT_ONE_GH_BIN || 'gh' };
    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--apply') { options.apply = true; continue; }
        const key = { '--repository-root': 'repositoryRoot', '--remote': 'remote', '--user': 'user',
            '--gh-command': 'ghCommand', '--hostname': 'hostname' }[args[i]];
        assert.ok(key && args[i + 1] && !args[i + 1].startsWith('--'), `Unsupported or incomplete argument: ${args[i]}`);
        options[key] = args[++i];
    }
    options.repositoryRoot = path.resolve(options.repositoryRoot);
    assert.match(options.remote, /^[a-z0-9._-]+$/i, 'Invalid remote name');
    assert.match(options.hostname, SAFE_HOST, 'Invalid GitHub hostname');
    if (options.user !== null) assert.match(options.user, SAFE_USER, 'Invalid GitHub username');
    return options;
}

function run(command, args, root, input, env = process.env) {
    const script = /\.[cm]?js$/i.test(command);
    const result = spawnSync(script ? process.execPath : command, script ? [command, ...args] : args, {
        cwd: root, input, env, encoding: 'utf8', timeout: 15000, windowsHide: true,
    });
    if (result.error) throw new Error(`Command failed to launch or timed out: ${path.basename(command)}`, { cause: result.error });
    return result;
}

function git(root, args, input) {
    const result = run('git', args, root, input, { ...process.env, GIT_TERMINAL_PROMPT: '0', GCM_INTERACTIVE: 'Never' });
    assert.equal(result.status, 0, `Git command failed: ${args[0]}`);
    return result.stdout;
}

function configValues(root, key) {
    const result = run('git', ['config', '--local', '--get-all', key], root);
    if (result.status === 1) return [];
    assert.equal(result.status, 0, `Git config read failed: ${key}`);
    return result.stdout.replace(/\r?\n$/, '').split(/\r?\n/);
}

function parseRemoteUrl(raw) {
    if (!raw) return null;
    const text = raw.trim();
    if (/^https?:\/\//i.test(text)) {
        const url = new URL(text);
        const segments = url.pathname.replace(/^\/|\/$/g, '').split('/');
        assert.ok(segments.length >= 2 && !url.password && !url.search && !url.hash, 'Unsupported remote URL');
        assert.ok(segments.every(value => /^[a-z0-9._-]+$/i.test(value)), 'Invalid remote repository path');
        return { protocol: url.protocol.slice(0, -1), host: url.hostname.toLowerCase(),
            owner: segments[0], repo: segments[1].replace(/\.git$/i, '') };
    }
    const ssh = text.match(/^[^@]+@([a-z0-9.-]+):([^/]+)\/(.+?)(?:\.git)?$/i);
    return ssh ? { protocol: 'ssh', host: ssh[1], owner: ssh[2], repo: ssh[3] } : null;
}

function parseGhAuthStatus(output, hostname) {
    const parsed = JSON.parse(output);
    assert.ok(parsed.hosts && Array.isArray(parsed.hosts[hostname]), 'Unsupported gh auth JSON response');
    const accounts = parsed.hosts[hostname].map(account => {
        assert.match(account.login, SAFE_USER, 'Invalid authenticated login');
        assert.equal(typeof account.active, 'boolean', 'Invalid active-account state');
        assert.ok(typeof account.state === 'string', 'Missing authentication state');
        return { user: account.login, active: account.active, authenticated: account.state === 'success' };
    });
    return { accounts, activeAccount: accounts.find(account => account.active)?.user || null,
        multiAccount: accounts.length > 1 };
}

function inspectCredentialHelpers(root, hostname) {
    const values = configValues(root, `credential.https://${hostname}.helper`);
    const pinned = values.find(value => value.includes('auth token') && value.includes('auth git-credential'));
    return { localConfigured: values[0] === '' && Boolean(pinned),
        localPinnedUser: pinned?.match(/--user\s+([a-z0-9_-]+)/i)?.[1] || null };
}

function buildPinnedHelperCommand(command, hostname, user) {
    assert.match(hostname, SAFE_HOST, 'Unsafe host');
    assert.match(user, SAFE_USER, 'Unsafe user');
    const quote = value => {
        assert.ok(!/['`\r\n\0]/.test(value), 'Executable path contains unsupported characters');
        return `'${value.replace(/\\/g, '/')}'`;
    };
    const invocation = /\.[cm]?js$/i.test(command) ? `${quote(process.execPath)} ${quote(command)}` : quote(command);
    // Stop on token lookup failure; do not fall back to a different globally active account.
    return `!f() { token=$(${invocation} auth token --hostname ${hostname} --user ${user}) || return; ` +
        `GH_TOKEN="$token" GH_ENTERPRISE_TOKEN="$token" ${invocation} auth git-credential "$@"; }; f`;
}

function selectedCredentials(options, ghCommand, hostname, user) {
    const token = run(ghCommand, ['auth', 'token', '--hostname', hostname, '--user', user], options.repositoryRoot);
    assert.ok(token.status === 0 && token.stdout.trim(), 'Selected account token lookup failed; credentials were not modified');
    const env = { ...process.env, GH_TOKEN: token.stdout.trim(), GH_ENTERPRISE_TOKEN: token.stdout.trim() };
    const identity = run(ghCommand, ['api', 'user', '--hostname', hostname, '--jq', '.login'], options.repositoryRoot, undefined, env);
    assert.ok(identity.status === 0 && identity.stdout.trim().toLowerCase() === user.toLowerCase(),
        'Selected token identity verification failed; credentials were not modified');
    return { token: token.stdout.trim(), env };
}

function credentialProbe(root, remote, token, helper) {
    const overrides = helper === undefined ? [] :
        ['-c', `credential.https://${remote.host}.helper=`, '-c', `credential.https://${remote.host}.helper=${helper}`];
    const result = run('git', [...overrides, '-c', 'credential.interactive=never', 'credential', 'fill'], root,
        `url=https://${remote.host}/${remote.owner}/${remote.repo}\n\n`,
        { ...process.env, GIT_TERMINAL_PROMPT: '0', GCM_INTERACTIVE: 'Never' });
    // Never include credential-helper output or token-bearing stderr in reports.
    const password = result.stdout?.match(/^password=(.*)\r?$/m)?.[1]?.replace(/\r$/, '');
    return result.status === 0 && password === token;
}

function inspectRepositoryAuth(input) {
    const options = { hostname: 'github.com', ghCommand: 'gh', remote: 'origin', user: null, ...input };
    options.repositoryRoot = fs.realpathSync(git(options.repositoryRoot, ['rev-parse', '--show-toplevel']).trim());
    const remoteResult = run('git', ['remote', 'get-url', options.remote], options.repositoryRoot);
    assert.equal(remoteResult.status, 0, 'Configured remote is missing or invalid');
    const remote = parseRemoteUrl(remoteResult.stdout);
    if (!remote || remote.protocol !== 'https' || remote.host !== options.hostname) {
        return { schemaVersion: 2, apply: false, status: 'not-applicable', remote,
            problems: [], remediation: null, verification: { identity: false, credentialHelper: false, repositoryReadAccess: false } };
    }
    let ghCommand = options.ghCommand || 'gh';
    if (process.platform === 'win32' && !path.isAbsolute(ghCommand)) {
        const lookup = run('where.exe', ['gh.exe'], options.repositoryRoot);
        assert.equal(lookup.status, 0, 'GitHub CLI executable is unavailable');
        ghCommand = lookup.stdout.split(/\r?\n/).find(Boolean);
    }
    const status = run(ghCommand, ['auth', 'status', '--hostname', remote.host, '--no-refresh', '--json', 'hosts'], options.repositoryRoot);
    assert.equal(status.status, 0, 'GitHub CLI authentication status probe failed');
    const accounts = parseGhAuthStatus(status.stdout, remote.host);
    const helper = inspectCredentialHelpers(options.repositoryRoot, remote.host);
    const user = options.user || helper.localPinnedUser ||
        (accounts.accounts.length === 1 ? accounts.accounts[0].user : null);
    const report = { schemaVersion: 2, apply: false, status: 'account-selection-required', remote,
        gh: { ...accounts, targetAccount: user }, credentialHelper: helper, problems: [],
        remediation: 'Select the authenticating account explicitly with --user; repository owners may be organizations.',
        verification: { identity: false, credentialHelper: false, repositoryReadAccess: false } };
    if (!user) return report;
    assert.match(user, SAFE_USER, 'Invalid GitHub username');
    if (!accounts.accounts.some(account => account.authenticated && account.user.toLowerCase() === user.toLowerCase())) {
        return { ...report, status: 'account-not-authenticated', remediation: 'Authenticate the selected account before configuring Git.' };
    }
    const credentials = selectedCredentials(options, ghCommand, remote.host, user);
    const access = run(ghCommand, ['api', `repos/${remote.owner}/${remote.repo}`, '--hostname', remote.host, '--jq', '.permissions.push'],
        options.repositoryRoot, undefined, credentials.env);
    assert.equal(access.status, 0, 'Selected account cannot read this repository; credentials were not modified');
    report.verification = { identity: true, repositoryReadAccess: true,
        credentialHelper: credentialProbe(options.repositoryRoot, remote, credentials.token),
        repositoryPushPermission: access.stdout.trim() === 'true', branchPolicyVerified: false };
    report.status = report.verification.credentialHelper &&
        (!accounts.multiAccount || helper.localPinnedUser?.toLowerCase() === user.toLowerCase()) ? 'ok' : 'needs-repo-pin';
    report.problems = report.status === 'ok' ? [] : [{ id: 'credential-helper-unverified',
        summary: 'The helper did not resolve the selected token or multi-account authentication is not pinned locally.' }];
    report.remediation = report.status === 'ok' ? null : 'Preview the selected account, then use --apply after explicit consent.';
    const configPath = path.resolve(options.repositoryRoot, git(options.repositoryRoot, ['rev-parse', '--git-path', 'config']).trim());
    return { ...report, _options: options, _ghExecutable: ghCommand, _configPath: configPath,
        _configHash: digest(fs.readFileSync(configPath)) };
}

function applyRepositoryPin(report) {
    assert.ok(report._options && ['ok', 'needs-repo-pin'].includes(report.status), 'Cannot pin an unverified or ambiguous account');
    const { _options: options, _configPath: config, _ghExecutable: ghCommand } = report;
    assert.equal(digest(fs.readFileSync(config)), report._configHash, 'Git config changed after preview; preview again');
    const hostname = report.remote.host;
    const user = report.gh.targetAccount;
    const credentials = selectedCredentials(options, ghCommand, hostname, user);
    const helper = buildPinnedHelperCommand(ghCommand, hostname, user);
    assert.ok(credentialProbe(options.repositoryRoot, report.remote, credentials.token, helper),
        'Prepared credential helper verification failed; existing Git configuration was preserved');
    const prior = fs.readFileSync(config);
    const staging = fs.mkdtempSync(path.join(path.dirname(config), '.alex-auth-'));
    const next = path.join(staging, 'config');
    const lock = `${config}.lock`;
    let locked = false;
    let committed = false;
    let retainRecovery = false;
    try {
        fs.writeFileSync(lock, '', { flag: 'wx' });
        locked = true;
        fs.writeFileSync(next, prior, { flag: 'wx', mode: fs.statSync(config).mode });
        const key = `credential.https://${hostname}.helper`;
        for (const args of [['--replace-all', key, ''], ['--add', key, helper]]) {
            git(options.repositoryRoot, ['config', '--file', next, ...args]);
        }
        const username = run('git', ['config', '--file', next, '--unset-all', `credential.https://${hostname}.username`], options.repositoryRoot);
        assert.ok([0, 5].includes(username.status), 'Prepared username configuration failed');
        assert.equal(digest(fs.readFileSync(config)), report._configHash, 'Git config changed after preview; preview again');
        fs.renameSync(next, config);
        committed = true;
        const verified = inspectRepositoryAuth(options);
        assert.equal(verified.status, 'ok', 'Post-apply authentication verification failed');
        return { ...verified, apply: true };
    } catch (error) {
        if (committed) {
            try {
                fs.writeFileSync(next, prior, { flag: 'wx', mode: fs.statSync(config).mode });
                fs.renameSync(next, config);
            } catch (rollbackError) {
                retainRecovery = true;
                throw new AggregateError([error, rollbackError], `Authentication rollback failed; prior config retained at ${next}`);
            }
        }
        throw error;
    } finally {
        if (locked) fs.unlinkSync(lock);
        if (!retainRecovery) fs.rmSync(staging, { recursive: true, force: true });
    }
}

function publicReport(report) {
    return Object.fromEntries(Object.entries(report).filter(([key]) => !key.startsWith('_')));
}

if (require.main === module) {
    try {
        const options = parseArgs(process.argv.slice(2));
        const preview = inspectRepositoryAuth(options);
        const report = options.apply ? applyRepositoryPin(preview) : preview;
        console.log(JSON.stringify(publicReport(report), null, 2));
        process.exitCode = ['ok', 'not-applicable'].includes(report.status) ? 0 : 1;
    } catch (error) {
        console.error(`Git authentication check failed: ${error.message}`);
        process.exitCode = 2;
    }
}

module.exports = { applyRepositoryPin, buildPinnedHelperCommand, inspectRepositoryAuth, parseArgs,
    parseGhAuthStatus, parseRemoteUrl, publicReport };
