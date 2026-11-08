#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const EXTENSIONS = new Set(['.md', '.cjs', '.mjs', '.js', '.ps1', '.py', '.html', '.svg',
    '.png', '.docx', '.pdf', '.eml', '.json', '.jsonl', '.log', '.txt']);
const BINARY = new Set(['.png', '.docx', '.pdf']);
const sha256 = data => crypto.createHash('sha256').update(data).digest('hex');
const portable = value => value.split(path.sep).join('/');
const pathKey = value => process.platform === 'win32' ? value.toLowerCase() : value;

function git(root, args) {
    return execFileSync('git', args, { cwd: root, encoding: 'utf8', timeout: 15000, maxBuffer: 8 * 1024 * 1024 });
}

function parseArgs(args) {
    const options = {
        repositoryRoot: null, sessionRoot: path.join(process.env.COPILOT_HOME || os.homedir(),
            process.env.COPILOT_HOME ? 'session-state' : '.copilot/session-state'),
        sessionIds: [],
    };
    if (process.env.ALEX_ACT_ONE_SESSION_ROOT) options.sessionRoot = process.env.ALEX_ACT_ONE_SESSION_ROOT;
    for (let i = 0; i < args.length; i++) {
        const key = { '--repository-root': 'repositoryRoot', '--session-root': 'sessionRoot', '--session': 'session' }[args[i]];
        if (!key || !args[i + 1] || args[i + 1].startsWith('--')) throw new Error(`Unsupported or incomplete argument: ${args[i]}`);
        const value = args[++i];
        if (key === 'session') {
            assert.match(value, /^[a-z0-9_-]+$/i, 'Invalid session ID');
            options.sessionIds.push(value);
        } else options[key] = path.resolve(value);
    }
    assert.ok(options.repositoryRoot, '--repository-root is required');
    return options;
}

function isDisposableSessionFile(name) {
    return name.startsWith('release-clean-clone/') || name.split('/').includes('logs')
        || /\.(?:lock|pyc)$/.test(name) || /(?:^|\/)(?:invocation\.json|stdout\.jsonl)$/.test(name)
        || /^release-(?:commit|tag).*\.txt$/.test(name);
}

function sessionMatchesRepository(metadataPath, root) {
    if (!fs.existsSync(metadataPath)) return false;
    assert.ok(!fs.lstatSync(metadataPath).isSymbolicLink(), 'Linked session metadata is unsupported');
    const text = fs.readFileSync(metadataPath, 'utf8');
    const cwd = text.match(/^cwd:\s*(.+?)\s*$/m)?.[1]?.replace(/^["']|["']$/g, '');
    const gitRoot = text.match(/^git_root:\s*(.+?)\s*$/m)?.[1]?.replace(/^["']|["']$/g, '');
    if (!cwd && !gitRoot) return false;
    const workspace = path.resolve(cwd || gitRoot);
    const canonical = fs.existsSync(workspace) ? fs.realpathSync(workspace) : workspace;
    // An explicit different cwd belongs to another worktree, even if git_root names this checkout.
    return pathKey(canonical) === pathKey(root);
}

function inside(root, target) {
    const relative = path.relative(root, target);
    return relative === '' || (relative !== '..' && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative));
}

function regularFile(root, name) {
    assert.ok(typeof name === 'string' && name && !path.isAbsolute(name), 'Recovery path must be relative');
    const target = path.resolve(root, name);
    assert.ok(inside(root, target), `Recovery path escapes repository: ${name}`);
    for (let current = target; current !== root; current = path.dirname(current)) {
        assert.ok(!fs.lstatSync(current).isSymbolicLink(), `Linked recovery path is unsupported: ${name}`);
    }
    assert.ok(fs.statSync(target).isFile() && inside(root, fs.realpathSync(target)), `Invalid recovery file: ${name}`);
    return target;
}

function normalizedHash(data) {
    return sha256(Buffer.from(new TextDecoder('utf-8', { fatal: true }).decode(data).replace(/\r\n/g, '\n')));
}

function buildRepositoryIndex(root, unsupported) {
    const files = [...new Set(git(root, ['ls-files', '-z', '--cached', '--others', '--exclude-standard'])
        .split('\0').filter(Boolean))];
    const exact = new Set();
    const normalized = new Set();
    for (const name of files) {
        if (!EXTENSIONS.has(path.extname(name).toLowerCase())) continue;
        const target = path.join(root, name);
        if (!fs.existsSync(target)) continue;
        if (fs.lstatSync(target).isSymbolicLink()) { unsupported.push({ area: 'repository', path: name, reason: 'linked-file' }); continue; }
        const data = fs.readFileSync(regularFile(root, name));
        exact.add(sha256(data));
        if (!BINARY.has(path.extname(name).toLowerCase())) normalized.add(normalizedHash(data));
    }
    const manifests = files.filter(name => /recover/i.test(name) && !/(?:^|\/)history\//.test(name)
        && /(?:^|\/)(?:manifest|recovery-manifest|session-audit)\.json$/.test(name));
    for (const conventional of ['docs/verification/session-recovery/manifest.json', 'archive/verification/session-recovery/manifest.json']) {
        if (fs.existsSync(path.join(root, conventional)) && !files.includes(conventional)) {
            throw new Error(`Recovery manifest is ignored: ${conventional}`);
        }
    }
    // Detect ignored alternate manifests without indexing ignored copies as delivery.
    for (const folder of ['docs/session-artifact-recovery', 'reports/session-recovery', 'operations/evidence/session-recovery']) {
        const base = path.join(root, folder);
        if (!fs.existsSync(base)) continue;
        const discover = directory => {
            assert.ok(!fs.lstatSync(directory).isSymbolicLink(), 'Linked recovery directory is unsupported');
            for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
                if (entry.name === 'history' || entry.name === 'sessions') continue;
                const full = path.join(directory, entry.name);
                if (entry.isDirectory()) discover(full);
                else if (/^(?:manifest|recovery-manifest|session-audit)\.json$/.test(entry.name)
                    && !files.includes(portable(path.relative(root, full)))) throw new Error('Recovery manifest is ignored');
            }
        };
        discover(base);
    }
    for (const name of manifests) {
        let manifest;
        try { manifest = JSON.parse(fs.readFileSync(regularFile(root, name), 'utf8')); }
        catch (error) { throw new Error(`Invalid recovery manifest: ${name}`, { cause: error }); }
        const records = manifest.artifacts || manifest.files;
        assert.ok(Array.isArray(records), `Unsupported recovery manifest schema: ${name}`);
        for (const record of records) {
            const sourceHash = record.sourceSha256 || record.original_sha256;
            assert.match(sourceHash, /^[a-f0-9]{64}$/, `Invalid original recovery hash: ${name}`);
            assert.match(record.sha256, /^[a-f0-9]{64}$/, `Invalid recovered hash: ${name}`);
            const target = manifest.destination && record.path?.startsWith(`${manifest.destination}/`)
                ? record.path : portable(path.relative(root, path.resolve(path.dirname(path.join(root, name)), record.path || '')));
            assert.ok(files.includes(target), `Missing or ignored recovery artifact: ${target}`);
            const data = fs.readFileSync(regularFile(root, target));
            assert.equal(sha256(data), record.sha256, `Recovery hash differs: ${target}`);
            if (record.bytes !== undefined) assert.equal(data.length, record.bytes, `Recovery size differs: ${target}`);
            exact.add(sourceHash);
        }
        for (const record of manifest.pruned || []) {
            assert.match(record.sourceSha256, /^[a-f0-9]{64}$/, 'Pruned recovery entry lacks its original hash');
            assert.ok(record.reason && record.sourceCommit && record.path, 'Pruned recovery entry lacks approval/custody evidence');
            exact.add(record.sourceSha256);
        }
    }
    return { exact, normalized };
}

function checkSessionArtifacts(options) {
    const root = fs.realpathSync(git(options.repositoryRoot, ['rev-parse', '--show-toplevel']).trim());
    const report = { schemaVersion: 2, status: 'clean', scope: 'matching local session files and Git-visible repository artifacts',
        matchedSessions: 0, totalCandidates: 0, accountedCount: 0, strandedCount: 0, stranded: [], unsupported: [] };
    if (!fs.existsSync(options.sessionRoot)) return { ...report, status: 'session-root-absent' };
    assert.ok(fs.statSync(options.sessionRoot).isDirectory() && !fs.lstatSync(options.sessionRoot).isSymbolicLink(),
        'Session root must be a non-linked directory');
    const index = buildRepositoryIndex(root, report.unsupported);
    for (const entry of fs.readdirSync(options.sessionRoot, { withFileTypes: true })) {
        if (options.sessionIds?.length && !options.sessionIds.includes(entry.name)) continue;
        if (entry.isSymbolicLink()) { report.unsupported.push({ area: 'sessions', path: entry.name, reason: 'linked-session' }); continue; }
        if (!entry.isDirectory()) continue;
        const directory = path.join(options.sessionRoot, entry.name);
        if (!sessionMatchesRepository(path.join(directory, 'workspace.yaml'), root)) continue;
        report.matchedSessions++;
        const files = path.join(directory, 'files');
        if (!fs.existsSync(files)) continue;
        const visit = current => {
            if (fs.lstatSync(current).isSymbolicLink()) {
                report.unsupported.push({ sessionId: entry.name, relativePath: portable(path.relative(directory, current)), reason: 'linked-directory' });
                return;
            }
            for (const item of fs.readdirSync(current, { withFileTypes: true })) {
                const full = path.join(current, item.name);
                const name = portable(path.relative(files, full));
                if (isDisposableSessionFile(name) || ['.git', 'node_modules', '__pycache__'].includes(item.name)) continue;
                if (item.isSymbolicLink()) { report.unsupported.push({ sessionId: entry.name, relativePath: name, reason: 'linked-file' }); continue; }
                if (item.isDirectory()) { visit(full); continue; }
                if (!item.isFile() || !EXTENSIONS.has(path.extname(name).toLowerCase())) {
                    report.unsupported.push({ sessionId: entry.name, relativePath: name, reason: 'unsupported-format' }); continue;
                }
                report.totalCandidates++;
                const data = fs.readFileSync(full);
                const digest = sha256(data);
                if (index.exact.has(digest) || (!BINARY.has(path.extname(name).toLowerCase()) && index.normalized.has(normalizedHash(data)))) {
                    report.accountedCount++;
                } else report.stranded.push({ sessionId: entry.name, relativePath: name, bytes: data.length, sha256: digest });
            }
        };
        visit(files);
    }
    report.strandedCount = report.stranded.length;
    report.status = report.unsupported.length ? 'incomplete' : report.strandedCount ? 'stranded-artifacts-found' :
        report.matchedSessions ? 'clean' : 'no-matching-sessions';
    return report;
}

if (require.main === module) {
    try {
        const report = checkSessionArtifacts(parseArgs(process.argv.slice(2)));
        console.log(JSON.stringify(report, null, 2));
        process.exitCode = report.status === 'clean' ? 0 : report.status === 'stranded-artifacts-found' ? 1 : 2;
    } catch (error) {
        console.error(`Session-artifact check failed: ${error.message}`);
        process.exitCode = 2;
    }
}

module.exports = { checkSessionArtifacts, isDisposableSessionFile, parseArgs, sessionMatchesRepository };
