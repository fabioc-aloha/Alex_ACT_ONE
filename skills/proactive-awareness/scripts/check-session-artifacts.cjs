#!/usr/bin/env node
'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const DELIVERABLE_EXTENSIONS = new Set([
    '.md', '.cjs', '.mjs', '.js', '.ps1', '.py', '.html', '.svg', '.png', '.docx', '.pdf', '.eml', '.json', '.jsonl', '.log', '.txt',
]);
const BINARY_EXTENSIONS = new Set(['.png', '.docx', '.pdf']);

function sha256(buffer) {
    return crypto.createHash('sha256').update(buffer).digest('hex');
}

function normalizedTextSha256(buffer) {
    try {
        const text = new TextDecoder('utf-8', { fatal: true }).decode(buffer).replace(/\r\n/g, '\n');
        return sha256(Buffer.from(text, 'utf8'));
    } catch {
        return null;
    }
}

function portable(filePath) {
    return filePath.split(path.sep).join('/');
}

function parseArgs(args) {
    const defaultSessionRoot = process.env.ALEX_ACT_ONE_SESSION_ROOT
        ? path.resolve(process.env.ALEX_ACT_ONE_SESSION_ROOT)
        : path.join(os.homedir(), '.copilot', 'session-state');
    const options = {
        repositoryRoot: null,
        sessionRoot: defaultSessionRoot,
    };
    for (let index = 0; index < args.length; index++) {
        const value = args[index];
        if (value === '--repository-root' || value === '--session-root') {
            const next = args[index + 1];
            if (!next || next.startsWith('--')) throw new Error(`${value} requires a value`);
            if (value === '--repository-root') options.repositoryRoot = path.resolve(next);
            else options.sessionRoot = path.resolve(next);
            index++;
        } else {
            throw new Error(`unknown argument: ${value}`);
        }
    }
    if (!options.repositoryRoot) throw new Error('--repository-root is required');
    if (!fs.existsSync(options.repositoryRoot) || !fs.statSync(options.repositoryRoot).isDirectory()) {
        throw new Error('repository root must be an existing directory');
    }
    return options;
}

function isDisposableSessionFile(relativePath) {
    if (relativePath.startsWith('release-clean-clone/')) return true;
    if (relativePath.split('/').includes('logs') || relativePath.endsWith('.lock')) return true;
    if (relativePath.endsWith('invocation.json') || relativePath.endsWith('stdout.jsonl')) return true;
    if (/^release-(?:commit|tag).*\.txt$/i.test(relativePath)) return true;
    const ext = path.extname(relativePath).toLowerCase();
    return !DELIVERABLE_EXTENSIONS.has(ext);
}

function readRepositorySlug(repositoryRoot) {
    const gitConfig = path.join(repositoryRoot, '.git', 'config');
    if (!fs.existsSync(gitConfig) || !fs.statSync(gitConfig).isFile()) return null;
    const text = fs.readFileSync(gitConfig, 'utf8');
    const match = text.match(/url\s*=\s*(?:https:\/\/github\.com\/|git@github\.com:)([^/\s]+\/[^/\s]+?)(?:\.git)?\s*$/im);
    return match ? match[1].toLowerCase() : null;
}

function sessionMatchesRepository(workspaceYamlPath, repositoryRoot, repositorySlug) {
    if (!fs.existsSync(workspaceYamlPath) || !fs.statSync(workspaceYamlPath).isFile()) return false;
    const text = fs.readFileSync(workspaceYamlPath, 'utf8');
    const normalizedRoot = path.resolve(repositoryRoot).replace(/\\/g, '/').toLowerCase();
    for (const key of ['cwd', 'git_root']) {
        const match = text.match(new RegExp(`^${key}:\\s*(.+?)\\s*$`, 'im'));
        if (match) {
            const candidate = match[1].trim().replace(/^['"]|['"]$/g, '').replace(/\\/g, '/').toLowerCase();
            if (candidate === normalizedRoot) return true;
        }
    }
    if (repositorySlug) {
        const repoMatch = text.match(/^repository:\s*(.+?)\s*$/im);
        if (repoMatch && repoMatch[1].trim().toLowerCase() === repositorySlug) return true;
    }
    return false;
}

function collectFiles(root, current = root, out = []) {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
        if (entry.isSymbolicLink()) continue;
        const full = path.join(current, entry.name);
        if (entry.isDirectory()) {
            if (entry.name === '.git' || entry.name === 'node_modules') continue;
            collectFiles(root, full, out);
        } else if (entry.isFile()) {
            out.push(portable(path.relative(root, full)));
        }
    }
    return out.sort();
}

function buildRepositoryIndex(repositoryRoot) {
    const exactHashes = new Set();
    const normalizedHashes = new Set();
    const manifestSources = new Set();

    const recoveryManifestPath = path.join(
        repositoryRoot,
        'docs',
        'verification',
        'session-recovery',
        'manifest.json',
    );
    if (fs.existsSync(recoveryManifestPath) && fs.statSync(recoveryManifestPath).isFile()) {
        try {
            const manifest = JSON.parse(fs.readFileSync(recoveryManifestPath, 'utf8'));
            for (const artifact of manifest.artifacts || []) {
                if (artifact.sourceSha256) exactHashes.add(artifact.sourceSha256);
                if (artifact.sha256) exactHashes.add(artifact.sha256);
                if (artifact.session && artifact.sourcePath) {
                    manifestSources.add(`${artifact.session}:${artifact.sourcePath}`);
                }
            }
        } catch {
            // Ignore malformed manifest here; session-recovery.mjs validates it directly.
        }
    }

    for (const relativePath of collectFiles(repositoryRoot)) {
        const ext = path.extname(relativePath).toLowerCase();
        if (!DELIVERABLE_EXTENSIONS.has(ext)) continue;
        const buffer = fs.readFileSync(path.join(repositoryRoot, relativePath));
        exactHashes.add(sha256(buffer));
        if (!BINARY_EXTENSIONS.has(ext)) {
            const normalized = normalizedTextSha256(buffer);
            if (normalized) normalizedHashes.add(normalized);
        }
    }

    return { exactHashes, normalizedHashes, manifestSources };
}

function checkSessionArtifacts(options) {
    const repositoryRoot = fs.realpathSync(options.repositoryRoot);
    if (!fs.existsSync(options.sessionRoot) || !fs.statSync(options.sessionRoot).isDirectory()) {
        return {
            schemaVersion: 1,
            status: 'session-root-absent',
            matchedSessions: 0,
            totalCandidates: 0,
            accountedCount: 0,
            strandedCount: 0,
            stranded: [],
        };
    }

    const sessionRoot = fs.realpathSync(options.sessionRoot);
    const repositorySlug = readRepositorySlug(repositoryRoot);
    const index = buildRepositoryIndex(repositoryRoot);
    const stranded = [];
    let matchedSessions = 0;
    let totalCandidates = 0;
    let accountedCount = 0;

    const sessionDirs = fs.readdirSync(sessionRoot, { withFileTypes: true })
        .filter(entry => entry.isDirectory() && !entry.isSymbolicLink())
        .map(entry => entry.name)
        .sort();

    for (const sessionId of sessionDirs) {
        const sessionDir = path.join(sessionRoot, sessionId);
        const workspaceYaml = path.join(sessionDir, 'workspace.yaml');
        if (!sessionMatchesRepository(workspaceYaml, repositoryRoot, repositorySlug)) continue;
        matchedSessions++;

        const filesDir = path.join(sessionDir, 'files');
        if (!fs.existsSync(filesDir) || !fs.statSync(filesDir).isDirectory()) continue;

        for (const relativePath of collectFiles(filesDir)) {
            if (isDisposableSessionFile(relativePath)) continue;
            totalCandidates++;
            const fullPath = path.join(filesDir, relativePath);
            const buffer = fs.readFileSync(fullPath);
            const exact = sha256(buffer);
            const ext = path.extname(relativePath).toLowerCase();
            const normalized = !BINARY_EXTENSIONS.has(ext) ? normalizedTextSha256(buffer) : null;

            const accounted = index.manifestSources.has(`${sessionId}:${relativePath}`)
                || index.exactHashes.has(exact)
                || (normalized !== null && index.normalizedHashes.has(normalized));

            if (accounted) {
                accountedCount++;
            } else {
                stranded.push({
                    sessionId,
                    relativePath,
                    bytes: buffer.length,
                    sha256: exact,
                });
            }
        }
    }

    return {
        schemaVersion: 1,
        status: stranded.length > 0 ? 'stranded-artifacts-found' : 'clean',
        matchedSessions,
        totalCandidates,
        accountedCount,
        strandedCount: stranded.length,
        stranded,
    };
}

function main() {
    try {
        const options = parseArgs(process.argv.slice(2));
        const report = checkSessionArtifacts(options);
        process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
        if (report.strandedCount > 0) process.exitCode = 1;
    } catch (error) {
        console.error(`ERROR: ${error.message}`);
        process.exitCode = 1;
    }
}

if (require.main === module) main();

module.exports = {
    checkSessionArtifacts,
    isDisposableSessionFile,
    parseArgs,
    sessionMatchesRepository,
};
