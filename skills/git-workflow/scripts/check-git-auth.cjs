#!/usr/bin/env node
'use strict';

const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const SAFE_HOST = /^[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?$/i;
const SAFE_USER = /^[a-z0-9](?:[a-z0-9_-]{0,38})$/i;

function parseArgs(args) {
    const options = {
        apply: false,
        repositoryRoot: process.cwd(),
        remote: 'origin',
        user: null,
        ghCommand: process.env.ALEX_ACT_ONE_GH_BIN || null,
    };
    for (let index = 0; index < args.length; index++) {
        const value = args[index];
        if (value === '--apply') options.apply = true;
        else if (value === '--repository-root' || value === '--remote' || value === '--user' || value === '--gh-command') {
            const next = args[index + 1];
            if (!next || next.startsWith('--')) throw new Error(`${value} requires a value`);
            if (value === '--repository-root') options.repositoryRoot = path.resolve(next);
            else if (value === '--remote') options.remote = next;
            else if (value === '--user') options.user = next;
            else if (value === '--gh-command') options.ghCommand = next;
            index++;
        } else {
            throw new Error(`unknown argument: ${value}`);
        }
    }
    if (!fs.existsSync(options.repositoryRoot) || !fs.statSync(options.repositoryRoot).isDirectory()) {
        throw new Error('repository root must be an existing directory');
    }
    if (!/^[a-z0-9._-]+$/i.test(options.remote)) {
        throw new Error(`invalid remote name: ${options.remote}`);
    }
    if (options.user !== null && !SAFE_USER.test(options.user)) {
        throw new Error(`invalid GitHub username: ${options.user}`);
    }
    return options;
}

function runCommand(command, args, cwd, input = undefined) {
    const isJsScript = /\.[cm]?js$/i.test(command);
    const actualCommand = isJsScript ? process.execPath : command;
    const actualArgs = isJsScript ? [command, ...args] : args;
    const result = spawnSync(actualCommand, actualArgs, {
        cwd,
        input,
        encoding: 'utf8',
        timeout: 15000,
    });
    return {
        status: result.status ?? 1,
        stdout: result.stdout || '',
        stderr: result.stderr || '',
        error: result.error || null,
    };
}

function resolveGhExecutable(explicitCommand, cwd) {
    if (explicitCommand) return explicitCommand;
    if (process.platform === 'win32') {
        const probe = runCommand('where.exe', ['gh.exe'], cwd);
        if (probe.status === 0) {
            const first = probe.stdout.split(/\r?\n/).map(line => line.trim()).find(Boolean);
            if (first) return first;
        }
        const fallback = 'C:\\Program Files\\GitHub CLI\\gh.exe';
        if (fs.existsSync(fallback)) return fallback;
    } else {
        const probe = runCommand('which', ['gh'], cwd);
        if (probe.status === 0) {
            const first = probe.stdout.split(/\r?\n/).map(line => line.trim()).find(Boolean);
            if (first) return first;
        }
    }
    return 'gh';
}

function parseRemoteUrl(rawUrl) {
    if (!rawUrl) return null;
    const trimmed = rawUrl.trim();
    try {
        const parsed = new URL(trimmed);
        const segments = parsed.pathname.replace(/^\/+|\/+$/g, '').split('/');
        if (segments.length >= 2 && SAFE_HOST.test(parsed.hostname)) {
            return {
                protocol: parsed.protocol.replace(/:$/, ''),
                host: parsed.hostname.toLowerCase(),
                owner: segments[0],
                repo: segments[1].replace(/\.git$/i, ''),
            };
        }
    } catch {
        // Not an HTTP(S) URL; check SSH shorthand below.
    }
    const sshMatch = trimmed.match(/^[^@]+@([a-z0-9.-]+):([^/]+)\/(.+?)(?:\.git)?$/i);
    if (sshMatch && SAFE_HOST.test(sshMatch[1])) {
        return {
            protocol: 'ssh',
            host: sshMatch[1].toLowerCase(),
            owner: sshMatch[2],
            repo: sshMatch[3],
        };
    }
    return null;
}

function parseGhAuthStatus(output, targetHost) {
    const accounts = [];
    let currentHost = null;
    let currentUser = null;
    for (const rawLine of output.split(/\r?\n/)) {
        const hostMatch = rawLine.match(/^([a-z0-9.-]+)\s*$/i);
        if (hostMatch && !rawLine.startsWith(' ')) {
            currentHost = hostMatch[1].toLowerCase();
            currentUser = null;
            continue;
        }
        if (/Logged in to /i.test(rawLine)) {
            currentUser = null;
        }
        const accountMatch = rawLine.match(/Logged in to ([a-z0-9.-]+) account ([a-z0-9_-]+)\b/i);
        if (accountMatch) {
            currentHost = accountMatch[1].toLowerCase();
            currentUser = {
                host: currentHost,
                user: accountMatch[2],
                active: false,
            };
            accounts.push(currentUser);
            continue;
        }
        const activeMatch = rawLine.match(/^\s*-\s*Active account:\s*(true|false)\b/i);
        if (activeMatch && currentUser) {
            currentUser.active = activeMatch[1].toLowerCase() === 'true';
        }
    }
    const hostAccounts = accounts.filter(entry => entry.host === targetHost.toLowerCase());
    const active = hostAccounts.find(entry => entry.active) || null;
    return {
        accounts: hostAccounts.map(entry => ({ user: entry.user, active: entry.active })),
        activeAccount: active ? active.user : null,
        multiAccount: hostAccounts.length > 1,
    };
}

function inspectCredentialHelpers(root, host) {
    const hostKey = `credential.https://${host}.helper`;
    const local = runCommand('git', ['config', '--local', '--get-all', hostKey], root);
    const localHelpers = local.status === 0
        ? local.stdout.split(/\r?\n/).map(line => line.trim())
        : [];
    const global = runCommand('git', ['config', '--global', '--get-all', hostKey], root);
    const globalHelpers = global.status === 0
        ? global.stdout.split(/\r?\n/).map(line => line.trim())
        : [];
    const pinnedHelper = localHelpers.find(line =>
        line.includes('auth token') && line.includes('auth git-credential'));
    const pinnedMatch = pinnedHelper
        ? pinnedHelper.match(/--user\s+([a-z0-9_-]+)/i)
        : null;
    const localResetsChain = localHelpers.length > 0 && localHelpers[0] === '';
    const globalUsesGh = globalHelpers.some(line => line.includes('auth git-credential'));
    return {
        localConfigured: Boolean(pinnedHelper && localResetsChain),
        localPinnedUser: pinnedMatch ? pinnedMatch[1] : null,
        globalConfigured: globalUsesGh,
        usesSystemManagerOnly: !pinnedHelper && !globalUsesGh,
    };
}

function buildPinnedHelperCommand(ghExecutable, host, user) {
    if (!SAFE_HOST.test(host)) throw new Error(`unsafe host for credential helper: ${host}`);
    if (!SAFE_USER.test(user)) throw new Error(`unsafe user for credential helper: ${user}`);
    const normalizedGh = ghExecutable.replace(/\\/g, '/');
    if (/['`\r\n\0]/.test(normalizedGh)) {
        throw new Error('gh executable path contains unsupported characters');
    }
    return `!GH_TOKEN=$('${normalizedGh}' auth token --hostname ${host} --user ${user}) '${normalizedGh}' auth git-credential`;
}

function inspectRepositoryAuth(options) {
    const root = options.repositoryRoot;
    const gitCheck = runCommand('git', ['rev-parse', '--git-dir'], root);
    if (gitCheck.status !== 0) {
        throw new Error('repository root is not a Git repository');
    }
    const remoteResult = runCommand('git', ['config', '--get', `remote.${options.remote}.url`], root);
    const remote = parseRemoteUrl(remoteResult.status === 0 ? remoteResult.stdout : '');
    if (!remote || remote.protocol !== 'https') {
        return {
            schemaVersion: 1,
            apply: false,
            status: 'not-applicable',
            remote: remote || { name: options.remote, protocol: 'unknown' },
            problems: [],
            remediation: null,
        };
    }

    const ghExecutable = resolveGhExecutable(options.ghCommand, root);
    const ghStatus = runCommand(ghExecutable, ['auth', 'status', '--hostname', remote.host], root);
    const combinedGhOutput = `${ghStatus.stdout}\n${ghStatus.stderr}`;
    const parsedGh = parseGhAuthStatus(combinedGhOutput, remote.host);
    const ghAvailable = !ghStatus.error && parsedGh.accounts.length > 0;

    const targetUser = options.user
        || (parsedGh.accounts.some(entry => entry.user.toLowerCase() === remote.owner.toLowerCase())
            ? parsedGh.accounts.find(entry => entry.user.toLowerCase() === remote.owner.toLowerCase()).user
            : parsedGh.accounts.length === 1 ? parsedGh.accounts[0].user : remote.owner);

    const matchingAccount = parsedGh.accounts.find(
        entry => entry.user.toLowerCase() === targetUser.toLowerCase(),
    ) || null;

    const helpers = inspectCredentialHelpers(root, remote.host);
    const problems = [];

    if (!ghAvailable || !matchingAccount) {
        problems.push({
            id: 'owner-account-not-logged-in',
            summary: `GitHub CLI has no authenticated account matching '${targetUser}' on ${remote.host}.`,
        });
    } else {
        if (helpers.usesSystemManagerOnly) {
            problems.push({
                id: 'missing-gh-credential-helper',
                summary: 'Git has no GitHub CLI credential helper configured and falls back to interactive Credential Manager, which fails in non-interactive Copilot shells.',
            });
        }
        if (parsedGh.activeAccount && parsedGh.activeAccount.toLowerCase() !== matchingAccount.user.toLowerCase()
            && helpers.localPinnedUser?.toLowerCase() !== matchingAccount.user.toLowerCase()) {
            problems.push({
                id: 'active-account-mismatch',
                summary: `Active gh account is '${parsedGh.activeAccount}', but this repository expects '${matchingAccount.user}'. Unpinned git push/fetch will fail or use the wrong account.`,
            });
        } else if (parsedGh.multiAccount
            && helpers.localPinnedUser?.toLowerCase() !== matchingAccount.user.toLowerCase()) {
            problems.push({
                id: 'unpinned-multi-account',
                summary: `Multiple gh accounts exist on ${remote.host}, and this repository is not pinned to '${matchingAccount.user}' in .git/config.`,
            });
        }
    }

    const status = !ghAvailable || !matchingAccount
        ? 'account-not-authenticated'
        : problems.length === 0 ? 'ok' : 'needs-repo-pin';

    return {
        schemaVersion: 1,
        apply: false,
        status,
        remote: {
            name: options.remote,
            protocol: remote.protocol,
            host: remote.host,
            owner: remote.owner,
            repo: remote.repo,
        },
        gh: {
            available: ghAvailable,
            activeAccount: parsedGh.activeAccount,
            accounts: parsedGh.accounts,
            targetAccount: matchingAccount ? matchingAccount.user : targetUser,
            multiAccount: parsedGh.multiAccount,
        },
        credentialHelper: helpers,
        problems,
        remediation: status === 'needs-repo-pin'
            ? `node skills/git-workflow/scripts/check-git-auth.cjs --repository-root "<repo>" --user ${matchingAccount.user} --apply`
            : status === 'account-not-authenticated'
                ? `gh auth login --hostname ${remote.host} --git-protocol https`
                : null,
        _ghExecutable: ghExecutable,
        _root: root,
    };
}

function applyRepositoryPin(report) {
    if (report.status === 'not-applicable') {
        throw new Error('cannot apply GitHub CLI credential pinning to a non-HTTPS or missing remote');
    }
    if (report.status === 'account-not-authenticated') {
        throw new Error(`cannot pin unauthenticated GitHub account: ${report.gh.targetAccount}`);
    }
    const root = report._root;
    const host = report.remote.host;
    const user = report.gh.targetAccount;
    const helperKey = `credential.https://${host}.helper`;
    const usernameKey = `credential.https://${host}.username`;
    const helperCommand = buildPinnedHelperCommand(report._ghExecutable, host, user);

    runCommand('git', ['config', '--local', '--unset-all', usernameKey], root);
    const resetResult = runCommand('git', ['config', '--local', '--replace-all', helperKey, ''], root);
    if (resetResult.status !== 0) {
        throw new Error(`failed to reset ${helperKey}: ${resetResult.stderr.trim()}`);
    }
    const addResult = runCommand('git', ['config', '--local', '--add', helperKey, helperCommand], root);
    if (addResult.status !== 0) {
        throw new Error(`failed to configure ${helperKey}: ${addResult.stderr.trim()}`);
    }

    const verify = inspectCredentialHelpers(root, host);
    if (!verify.localConfigured || verify.localPinnedUser?.toLowerCase() !== user.toLowerCase()) {
        throw new Error('post-apply credential helper verification failed');
    }
    return {
        ...report,
        apply: true,
        status: 'ok',
        credentialHelper: verify,
        problems: [],
        remediation: null,
    };
}

function publicReport(report) {
    const copy = { ...report };
    delete copy._ghExecutable;
    delete copy._root;
    return copy;
}

function main() {
    try {
        const options = parseArgs(process.argv.slice(2));
        const report = inspectRepositoryAuth(options);
        const finalReport = options.apply ? applyRepositoryPin(report) : report;
        process.stdout.write(`${JSON.stringify(publicReport(finalReport), null, 2)}\n`);
    } catch (error) {
        console.error(`ERROR: ${error.message}`);
        process.exitCode = 1;
    }
}

if (require.main === module) main();

module.exports = {
    applyRepositoryPin,
    buildPinnedHelperCommand,
    inspectRepositoryAuth,
    parseArgs,
    parseGhAuthStatus,
    parseRemoteUrl,
    publicReport,
};
