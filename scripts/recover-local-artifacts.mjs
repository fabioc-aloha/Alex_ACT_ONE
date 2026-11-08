import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, realpathSync, writeFileSync } from 'node:fs';
import { dirname, extname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { sanitizeText } from './session-recovery.mjs';

const TEXT = new Set(['.md', '.cjs', '.mjs', '.js', '.ps1', '.py', '.json', '.jsonl', '.log', '.txt', '.svg']);
const SKIP = new Set(['.git', 'node_modules', '.venv', 'venv', '__pycache__', 'logs',
    'dashboard-tools', 'pdf-tools', 'release-clean-clone', 'one-review-5ef51f2']);
const hash = data => createHash('sha256').update(data).digest('hex');
const portable = value => value.split(sep).join('/');

function inside(root, target) {
    const value = relative(root, target);
    return value === '' || (value !== '..' && !value.startsWith(`..${sep}`) && !isAbsolute(value));
}

function checkedPath(root, name, existing = true) {
    assert.ok(typeof name === 'string' && name && !isAbsolute(name) && !name.includes('\\'),
        'Use a nonempty portable relative path');
    const target = resolve(root, name);
    assert.ok(inside(root, target), 'Path escapes approved root');
    for (let current = target; current !== root; current = dirname(current)) {
        if (existsSync(current)) assert.ok(!lstatSync(current).isSymbolicLink(), 'Linked path is unsupported');
    }
    if (existing) assert.ok(inside(realpathSync(root), realpathSync(target)), 'Real path escapes approved root');
    return target;
}

function walk(root, current = root, files = [], excluded = []) {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
        const target = join(current, entry.name);
        const name = portable(relative(root, target));
        if (entry.isSymbolicLink()) excluded.push({ path: name, reason: 'linked-source-not-followed' });
        else if (entry.isDirectory()) {
            if (SKIP.has(entry.name) || /\.dist-info$/.test(entry.name)) {
                excluded.push({ path: name, reason: 'runtime-or-disposable-snapshot-directory' });
            } else walk(root, target, files, excluded);
        } else if (entry.isFile()) files.push(name);
        else excluded.push({ path: name, reason: 'non-regular-file' });
    }
    return { files: files.sort(), excluded };
}

function sessionForRoot(metadata, root) {
    for (const key of ['git_root', 'cwd']) {
        const value = metadata.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'))?.[1]?.trim().replace(/^["']|["']$/g, '');
        if (value && resolve(value).toLowerCase() === root.toLowerCase()) return true;
    }
    return false;
}

function formatReason(name, data, reviewedPngHashes) {
    if (/(?:^|\/)(?:invocation\.json|stdout\.jsonl)$/.test(name)
        || /\.(?:lock|pyc|bin|patch)$/.test(name) || /^release-(?:commit|tag).*\.(?:txt|md)$/.test(name)) {
        return 'disposable-runtime-or-command-input';
    }
    if (/(?:^|\/)(?:raw|transcripts|attachments)(?:\/|$)/i.test(name)) return 'raw-source-retention-not-authorized';
    const ext = extname(name).toLowerCase();
    if (ext === '.png' && reviewedPngHashes.has(hash(data))) {
        assert.ok(data.subarray(0, 8).equals(Buffer.from('89504e470d0a1a0a', 'hex')), 'Reviewed PNG has an invalid signature');
        return null;
    }
    if (!TEXT.has(ext)) return 'format-requires-separate-retention-review';
    if (data.length === 0) return 'empty-failed-output';
    const text = new TextDecoder('utf-8', { fatal: true }).decode(data);
    if (/\bBearer\s+[a-z0-9._-]{16,}|\b(?:ghp_|github_pat_|sk-)[a-z0-9_-]{12,}|["']?(?:[a-z0-9_]*(?:api[_-]?key|access[_-]?token|_token|_secret)|password|connectionstring)["']?\s*[:=]\s*["']?[a-z0-9/+_-]{16,}|\beyJ[a-zA-Z0-9_-]{30,}\.[a-zA-Z0-9_-]+\./i.test(text)) {
        return 'credential-like-content-not-copied';
    }
    if (ext === '.json') {
        const data = JSON.parse(text);
        function hasIdentities(value) {
            if (!value || typeof value !== 'object') return false;
            return Object.entries(value).some(([key, child]) =>
                /^(?:UserGuid|UserPrincipalName|uniqueName|emailAddress|viewerId|roster|members|workspaceRoles|flaggedAccess)$/i.test(key)
                    && typeof child !== 'number' || hasIdentities(child));
        }
        if (hasIdentities(data)) {
            return 'identity-or-roster-data-not-copied';
        }
        if (/"payloadType"\s*:\s*"InlineBase64"/i.test(text)) return 'encoded-source-payload-requires-separate-review';
    }
    if (name.startsWith('rawfeed/') && !name.endsWith('.ps1')) return 'raw-production-definition-not-copied';
    if (/Binary\.FromText\(\s*["'][a-z0-9+/=]{100,}|Table\.FromRows\s*\(\s*Json\.Document\s*\(\s*Binary\.Decompress/i.test(text)) {
        return 'embedded-data-payload-requires-separate-review';
    }
    return null;
}

function existingIndex(root, lengths) {
    const exact = new Map();
    const normalized = new Map();
    const files = walk(root).files;
    for (const name of files) {
        const file = checkedPath(root, name);
        if (!lengths.has(lstatSync(file).size) && !TEXT.has(extname(name).toLowerCase())) continue;
        if (!TEXT.has(extname(name).toLowerCase()) && !lengths.has(lstatSync(file).size)) continue;
        const data = readFileSync(file);
        exact.set(hash(data), name);
        if (TEXT.has(extname(name).toLowerCase())) {
            normalized.set(hash(Buffer.from(data.toString('utf8').replace(/\r\n/g, '\n'))), name);
        }
    }
    for (const name of files.filter(value => /(?:manifest|session-audit)\.json$/i.test(value)
        && /recover/i.test(value))) {
        const manifest = JSON.parse(readFileSync(checkedPath(root, name), 'utf8'));
        const records = manifest.artifacts || manifest.files || manifest.recovered || [];
        assert.ok(Array.isArray(records), 'Unsupported existing recovery inventory');
        for (const record of records) {
            const original = record.sourceSha256 || record.original_sha256;
            const recovered = record.sha256;
            const target = record.path;
            if (!original || !recovered || !target) continue;
            const destination = manifest.destination && target.startsWith(`${manifest.destination}/`)
                ? target : portable(relative(root, resolve(dirname(join(root, name)), target)));
            const data = readFileSync(checkedPath(root, destination));
            assert.equal(hash(data), recovered, `Existing recovery hash mismatch: ${destination}`);
            exact.set(original, destination);
        }
    }
    return { exact, normalized };
}

function rebaseMarkdown(text, source, destination, root, sourceDestinations) {
    let fence = false;
    return text.split('\n').map(line => {
        if (/^\s*(?:```|~~~)/.test(line)) fence = !fence;
        if (fence) return line;
        return line.replace(/(\[[^\]\n]*\])\((<[^>]+>|[^)\s]+)\)/g, (link, label, raw) => {
            const target = raw.replace(/^<|>$/g, '');
            if (/^(?:https?:|mailto:|#)/i.test(target)) return link;
            const [name, fragment] = target.split('#');
            const resolved = resolve(dirname(source), decodeURIComponent(name.replace(/:\d+$/, '')));
            const mapped = sourceDestinations.get(resolved) ||
                (inside(root, resolved) && existsSync(resolved) ? portable(relative(root, resolved)) : null);
            if (!mapped) return `${label} (historical source: \`${target}\`)`;
            return `${label}(${portable(relative(dirname(destination), join(root, mapped)))}${fragment ? `#${fragment}` : ''})`;
        });
    }).join('\n');
}

export function previewRecovery({ repositoryRoot, sessionRoot, destination, reviewedPngHashes = [] }) {
    const root = realpathSync(repositoryRoot);
    const sessions = realpathSync(sessionRoot);
    assert.equal(realpathSync(execFileSync('git', ['rev-parse', '--show-toplevel'], {
        cwd: root, encoding: 'utf8', timeout: 10000,
    }).trim()), root, 'Select the exact Git worktree root');
    checkedPath(root, destination, false);
    const candidates = [];
    const excluded = [];
    const matchedSessions = [];
    for (const entry of readdirSync(sessions, { withFileTypes: true })) {
        if (!entry.isDirectory() || entry.isSymbolicLink()) continue;
        const metadata = join(sessions, entry.name, 'workspace.yaml');
        if (!existsSync(metadata)) continue;
        checkedPath(sessions, `${entry.name}/workspace.yaml`);
        if (!sessionForRoot(readFileSync(metadata, 'utf8'), root)) continue;
        matchedSessions.push(entry.name);
        const area = join(sessions, entry.name, 'files');
        if (!existsSync(area)) continue;
        checkedPath(sessions, `${entry.name}/files`);
        const inventory = walk(area);
        excluded.push(...inventory.excluded.map(item => ({ session: entry.name, ...item })));
        for (const name of inventory.files) {
            const data = readFileSync(checkedPath(area, name));
            const reason = formatReason(name, data, new Set(reviewedPngHashes));
            if (reason) excluded.push({ session: entry.name, path: name, reason });
            else candidates.push({ session: entry.name, sourcePath: name, sourceSha256: hash(data),
                sourceBytes: data.length, source: join(area, name), data });
        }
    }
    const index = existingIndex(root, new Set(candidates.map(item => item.sourceBytes)));
    const copies = [];
    const accounted = [];
    const targets = new Map();
    for (const item of candidates) {
        const existing = index.exact.get(item.sourceSha256) ||
            index.normalized.get(hash(Buffer.from(item.data.toString('utf8').replace(/\r\n/g, '\n'))));
        if (existing) {
            accounted.push({ session: item.session, sourcePath: item.sourcePath,
                sourceSha256: item.sourceSha256, path: existing });
            targets.set(item.source, existing);
        } else {
            const target = `${destination}/history/${item.session.slice(0, 8)}/${item.sourcePath}`;
            checkedPath(root, target, false);
            assert.ok(!existsSync(join(root, target)), 'Refusing to overwrite a recovery destination');
            assert.ok(!copies.some(copy => copy.path === target), 'Colliding session prefixes');
            copies.push({ ...item, path: target });
            targets.set(item.source, target);
            index.exact.set(item.sourceSha256, target);
        }
    }
    for (const item of copies) {
        if (extname(item.path).toLowerCase() === '.png') {
            item.edits = [];
            item.bytes = item.data.length;
            item.sha256 = item.sourceSha256;
            item.retention = 'reviewed-historical-game-screenshot';
            continue;
        }
        const text = item.data.toString('utf8');
        let sanitized = sanitizeText(text);
        item.edits = sanitized === text ? [] : ['environment-path-and-email-redaction'];
        if (extname(item.path).toLowerCase() === '.md') {
            const eol = text.includes('\r\n') ? '\r\n' : '\n';
            sanitized = `> Historical recovery; not a current verdict or authorization to execute helpers.${eol}${eol}` +
                rebaseMarkdown(sanitized, item.source, join(root, item.path), root, targets);
            item.edits.push('historical-status-and-local-link-rebasing');
        }
        item.data = Buffer.from(sanitized);
        item.bytes = item.data.length;
        item.sha256 = hash(item.data);
    }
    return { root, sessions, destination, matchedSessions, copies, accounted, excluded };
}

export function applyRecovery(plan) {
    const { root, destination } = plan;
    assert.ok(!existsSync(join(root, destination, 'manifest.json')), 'Existing recovery cannot be overwritten');
    for (const item of plan.copies) {
        assert.equal(hash(readFileSync(item.source)), item.sourceSha256, 'Source changed after preview');
        checkedPath(root, item.path, false);
        assert.ok(!existsSync(join(root, item.path)), 'Destination changed after preview');
    }
    const artifacts = [];
    for (const item of plan.copies) {
        const target = checkedPath(root, item.path, false);
        mkdirSync(dirname(target), { recursive: true });
        writeFileSync(target, item.data, { flag: 'wx' });
        assert.equal(hash(readFileSync(checkedPath(root, item.path))), item.sha256, 'Copy verification failed');
        const { source, data, ...record } = item;
        artifacts.push(record);
    }
    const directory = checkedPath(root, destination, false);
    mkdirSync(directory, { recursive: true });
    const manifest = {
        schemaVersion: 1, status: 'historical-local-recovery-not-publication',
        repository: portable(relative(dirname(root), root)), destination,
        matchedSessions: plan.matchedSessions, artifacts,
        accounted: plan.accounted, excluded: plan.excluded,
        supportingArtifacts: [],
    };
    const inspection = join(directory, 'inspection');
    if (existsSync(inspection)) {
        manifest.supportingArtifacts = walk(inspection).files.map(name => {
            const target = `${destination}/inspection/${name}`;
            const data = readFileSync(checkedPath(root, target));
            return { path: target, bytes: data.length, sha256: hash(data) };
        });
    }
    writeFileSync(join(directory, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, { flag: 'wx' });
    const entries = artifacts.map(item => `| [${item.sourcePath.replace(/\|/g, '\\|')}](${portable(relative(directory, join(root, item.path)))}) | ${item.sourceSha256.slice(0, 12)} |`);
    const readme = `# Local session artifact recovery\n\nStatus: Historical, local, not published. Originals are retained.\n\n` +
        `Recovered helpers are not active automation. Inspect and separately authorize any execution.\n` +
        `No current source, manuscript, deployment, database, or installed package was changed.\n\n` +
        `[manifest.json](manifest.json) records original and recovered SHA-256 hashes, declared\n` +
        `privacy/link edits, existing repository copies, and excluded runtime/data files.\n` +
        `Excluded or unsupported sources remain outside the repository; they are not certified absent.\n\n` +
        `## Recovered files\n\n| Artifact | Original SHA-256 prefix |\n| --- | --- |\n${entries.join('\n')}\n\n` +
        (manifest.supportingArtifacts.length ? `## Retention inspection\n\n` +
            manifest.supportingArtifacts.map(item => `- [${relative(inspection, join(root, item.path))}](inspection/${portable(relative(inspection, join(root, item.path)))})`).join('\n') + '\n\n' : '') +
        `## Scope and verification\n\nThis inspection covers the files areas of local sessions matching this exact worktree.\n` +
        `It does not include event databases, deleted saved edits, remote-only sessions, or attachments.\n` +
        `Every copied file is checked against its recorded hash. Original session bytes remain unchanged.\n` +
        `Existing artifact copies are not refreshed. Credential-like content, raw data, runtime packages,\n` +
        `unsupported formats, and disposable snapshots are excluded for separate review.\n` +
        `Images and PDFs require a separate visual/privacy retention review; they are not automatically imported.\n` +
        (artifacts.some(item => item.retention) ? `The retained PNGs were reviewed as historical synthetic game screenshots; see the inspection contact sheet.\n` : '');
    writeFileSync(join(directory, 'README.md'), readme, { flag: 'wx' });
    for (const item of plan.copies) {
        assert.equal(hash(readFileSync(item.source)), item.sourceSha256, 'Original changed during recovery');
    }
    return verifyRecovery(root, destination);
}

export function verifyRecovery(repositoryRoot, destination) {
    const root = realpathSync(repositoryRoot);
    const manifest = JSON.parse(readFileSync(checkedPath(root, `${destination}/manifest.json`), 'utf8'));
    assert.equal(manifest.schemaVersion, 1, 'Unsupported recovery manifest');
    assert.equal(manifest.destination, destination, 'Wrong recovery destination');
    const paths = new Set();
    for (const item of manifest.artifacts) {
        assert.ok(!paths.has(item.path), 'Duplicate recovery output');
        paths.add(item.path);
        const data = readFileSync(checkedPath(root, item.path));
        assert.equal(data.length, item.bytes, 'Recovered byte length differs');
        assert.equal(hash(data), item.sha256, 'Recovered hash differs');
        assert.match(item.sourceSha256, /^[a-f0-9]{64}$/, 'Missing original hash');
        if (extname(item.path).toLowerCase() !== '.png') {
            assert.equal(sanitizeText(data.toString('utf8')), data.toString('utf8'), 'Unsanitized recovery content');
        } else {
            assert.equal(item.retention, 'reviewed-historical-game-screenshot', 'PNG lacks a retention decision');
            assert.equal(item.sha256, item.sourceSha256, 'Reviewed PNG bytes changed');
        }
    }
    for (const item of manifest.accounted) checkedPath(root, item.path);
    for (const item of manifest.supportingArtifacts || []) {
        const data = readFileSync(checkedPath(root, item.path));
        assert.equal(data.length, item.bytes, 'Supporting artifact byte length differs');
        assert.equal(hash(data), item.sha256, 'Supporting artifact hash differs');
    }
    const history = join(root, destination, 'history');
    if (existsSync(history)) assert.deepEqual(walk(history).files.map(name => `${destination}/history/${name}`).sort(),
        [...paths].sort(), 'Unregistered recovery output');
    return { copied: manifest.artifacts.length, accounted: manifest.accounted.length,
        excluded: manifest.excluded.length, hashesVerified: true };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    try {
        const args = process.argv.slice(2);
        const options = {};
        let mode = 'preview';
        for (let i = 0; i < args.length; i++) {
            if (args[i] === '--apply' || args[i] === '--verify') mode = args[i].slice(2);
            else {
                const keys = { '--repository-root': 'repositoryRoot', '--session-root': 'sessionRoot', '--destination': 'destination' };
                assert.ok(keys[args[i]] && args[i + 1] && !args[i + 1].startsWith('--'), 'Unsupported or incomplete arguments');
                options[keys[args[i]]] = args[++i];
            }
        }
        assert.ok(isAbsolute(options.repositoryRoot), 'An explicit absolute repository root is required');
        if (mode === 'verify') console.log(JSON.stringify(verifyRecovery(options.repositoryRoot, options.destination)));
        else {
            assert.ok(isAbsolute(options.sessionRoot), 'An explicit absolute session root is required');
            const plan = previewRecovery(options);
            console.log(JSON.stringify(mode === 'apply' ? applyRecovery(plan) : {
                copies: plan.copies.map(({ source, data, ...item }) => item),
                accounted: plan.accounted, excluded: plan.excluded, matchedSessions: plan.matchedSessions,
            }));
        }
    } catch (error) {
        console.error(`Recovery failed: ${error.message}`);
        process.exitCode = 1;
    }
}
