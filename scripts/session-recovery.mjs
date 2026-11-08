import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, realpathSync, writeFileSync } from 'node:fs';
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ARCHIVE = 'docs/verification/session-recovery';
const SOURCES = [
    '11372d9c-45f0-4e30-8d17-f7c60c3eb4f9',
    '3e832a77-ed36-4c86-a4ee-070100b1c775',
    'e44f8ac4-782f-4503-882e-101a7945bddb',
    'e60bdb37-788d-480f-9bda-6211947df42c',
];
const DUPLICATE = '9fcdec8a-4839-44dd-ba35-1e5192fe13d0';
const EXTENSIONS = new Set(['.md', '.cjs', '.json', '.jsonl', '.log', '.txt', '.png']);
const sha256 = data => createHash('sha256').update(data).digest('hex');
const portable = path => path.split(sep).join('/');
const userPath = /(?:[a-z]:|[a-z]%3a)([\\/]+)Users([\\/]+)(?!<USER>)[^\\/\s"'<>]+/gi;
const email = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi;
const credential = /(?:\bBearer\s+[a-z0-9._-]{16,}|\b(?:ghp_|github_pat_|sk-)[a-z0-9_-]{12,}|["']?(?:api[_-]?key|access[_-]?token|password|connectionstring)["']?\s*[:=]\s*["']?[a-z0-9/+_-]{16,})/i;

function inside(root, target) {
    const path = relative(root, target);
    return path === '' || (path !== '..' && !path.startsWith(`..${sep}`) && !isAbsolute(path));
}

function containedFile(root, path) {
    assert.equal(typeof path, 'string', 'Artifact path must be a string');
    assert.ok(path && !path.includes('\\') && !isAbsolute(path), 'Use a repository-relative portable path');
    const target = resolve(root, path);
    assert.ok(inside(root, target), `Artifact escapes repository: ${path}`);
    for (let parent = target; parent !== root; parent = dirname(parent)) {
        assert.ok(!lstatSync(parent).isSymbolicLink(), `Linked artifact is unsupported: ${path}`);
    }
    assert.ok(inside(realpathSync(root), realpathSync(target)), `Artifact real path escapes repository: ${path}`);
    assert.ok(lstatSync(target).isFile(), `Artifact is not a regular file: ${path}`);
    return target;
}

function filesIn(root, current = root) {
    const files = [];
    for (const entry of readdirSync(current, { withFileTypes: true })) {
        assert.ok(!entry.isSymbolicLink(), `Linked recovery input is unsupported: ${entry.name}`);
        const path = join(current, entry.name);
        if (entry.isDirectory()) files.push(...filesIn(root, path));
        else {
            assert.ok(entry.isFile(), `Non-file recovery input is unsupported: ${entry.name}`);
            files.push(portable(relative(root, path)));
        }
    }
    return files.sort();
}

export function sanitizeText(text) {
    assert.ok(!credential.test(text), 'Credential-like content requires manual review; nothing may be archived');
    return text.replace(userPath, (match, first, second) => `${match.split(first)[0]}${first}Users${second}<USER>`)
        .replace(/file-c-3A-Users-[^-\\/\s]+-/gi, 'file-c-3A-Users-USER-')
        .replace(email, '<EMAIL>');
}

function rebaseMarkdown(text, sourceFile, destination, root, sourceRoot) {
    let inFence = false;
    const lines = text.split('\n').map(line => {
        if (/^\s*(```|~~~)/.test(line)) inFence = !inFence;
        if (inFence) return line;
        return line.replace(/(\[[^\]\n]*\])\((<[^>]+>|[^)\s]+)\)/g, (link, label, raw) => {
            const target = raw.replace(/^<|>$/g, '');
            if (/^(https?:|mailto:|#)/i.test(target)) return link;
            const [file, fragment] = target.split('#');
            const withoutLine = file.replace(/:\d+$/, '');
            const resolved = resolve(dirname(sourceFile), decodeURIComponent(withoutLine));
            let final;
            if (inside(sourceRoot, resolved) && existsSync(resolved)
                && !exclusion(portable(relative(sourceRoot, resolved)))) {
                final = join(dirname(destination), relative(dirname(sourceFile), resolved));
            } else if (inside(root, resolved) && existsSync(resolved)) final = resolved;
            if (!final) return `${label} (historical source: \`${target}\`)`;
            return `${label}(${portable(relative(dirname(destination), final))}${fragment ? `#${fragment}` : ''})`;
        });
    });
    return `> Historical recovery; not current certification or an active issue list.\n> See [current change history](${portable(relative(dirname(destination), join(root, 'CHANGELOG.md')))}).\n\n${lines.join('\n')}`;
}

function exclusion(path) {
    if (path.startsWith('release-clean-clone/')) return 'Disposable Git clone; published source is independently versioned';
    if (path.split('/').includes('logs') || path.endsWith('.lock')) return 'Runtime process log or lock';
    if (path.endsWith('invocation.json') || path.endsWith('stdout.jsonl')) return 'Runtime invocation or event stream; semantic observations retained where available';
    if (/^release-(commit|tag).*\.txt$/.test(path)) return 'Disposable Git command arguments';
    assert.ok(EXTENSIONS.has(path.slice(path.lastIndexOf('.'))), `Unclassified recovery input: ${path}`);
    return null;
}

export function recoverArchive(root, sessionRoot) {
    root = realpathSync(root);
    sessionRoot = realpathSync(sessionRoot);
    const archive = join(root, ARCHIVE);
    assert.ok(!existsSync(join(archive, 'history')) && !existsSync(join(archive, 'manifest.json')),
        'Recovery already exists or is partial; inspect it rather than overwriting frozen evidence');
    assert.ok(inside(root, realpathSync(archive)), 'Recovery directory must belong to the repository');
    const entries = [];
    const excluded = [];
    const inputs = [];
    const sources = [];
    const prepared = [];
    for (const id of SOURCES) {
        const session = join(sessionRoot, id);
        const metadata = readFileSync(containedFile(sessionRoot, `${id}/workspace.yaml`), 'utf8');
        assert.match(metadata, /^repository: fabioc-aloha\/Alex_ACT_ONE\s*$/m, 'Wrong recovery project');
        const source = realpathSync(join(session, 'files'));
        assert.ok(inside(sessionRoot, source), 'Session files escape the selected session root');
        sources.push({ id, role: 'historical-project-evidence' });
        for (const path of filesIn(source)) {
            const reason = exclusion(path);
            if (reason) {
                excluded.push({ session: id, path, reason });
                continue;
            }
            const file = containedFile(source, path);
            const original = readFileSync(file);
            const destination = `history/${id}/${path}`;
            let recovered = original;
            const edits = [];
            if (!path.endsWith('.png')) {
                const text = new TextDecoder('utf-8', { fatal: true }).decode(original);
                let sanitized = sanitizeText(text);
                if (sanitized !== text) edits.push('environment-path-and-email-redaction');
                if (path.endsWith('.md')) {
                    sanitized = rebaseMarkdown(sanitized, file, join(archive, destination), root, source);
                    edits.push('historical-status-and-local-link-rebasing');
                }
                recovered = Buffer.from(sanitized);
                if (path.endsWith('.json') && recovered.length > 0) JSON.parse(sanitized);
            }
            entries.push({
                path: destination, session: id, sourcePath: path,
                sourceBytes: original.length, sourceSha256: sha256(original),
                bytes: recovered.length, sha256: sha256(recovered), edits,
                formatStatus: path.endsWith('.json') && recovered.length === 0
                    ? 'empty-failed-producer-output' : 'historical',
            });
            prepared.push({ path: join(archive, destination), data: recovered });
            inputs.push({ file, hash: sha256(original) });
        }
    }
    const originalSource = join(sessionRoot, SOURCES[1], 'files');
    const duplicateSource = join(sessionRoot, DUPLICATE, 'files');
    assert.match(readFileSync(containedFile(sessionRoot, `${DUPLICATE}/workspace.yaml`), 'utf8'),
        /^repository: fabioc-aloha\/Alex_ACT_ONE\s*$/m, 'Wrong duplicate project');
    const originalFiles = filesIn(originalSource).filter(path => !exclusion(path));
    const duplicateFiles = filesIn(duplicateSource).filter(path => !exclusion(path));
    assert.deepEqual(duplicateFiles, originalFiles, 'Supposed duplicate contains additional evidence');
    for (const path of originalFiles) {
        assert.equal(sha256(readFileSync(containedFile(duplicateSource, path))),
            sha256(readFileSync(containedFile(originalSource, path))), `Duplicate differs: ${path}`);
    }
    sources.push({ id: DUPLICATE, duplicateOf: SOURCES[1], role: 'verified-byte-identical-copy' });
    const manifest = { schemaVersion: 1, status: 'historical-not-current-certification', sources, excluded, artifacts: entries };
    for (const input of inputs) assert.equal(sha256(readFileSync(input.file)), input.hash, 'Recovery input changed during preparation');
    for (const file of prepared) {
        mkdirSync(dirname(file.path), { recursive: true });
        assert.ok(inside(root, realpathSync(dirname(file.path))), 'Recovery destination escaped the repository');
        writeFileSync(file.path, file.data, { flag: 'wx' });
    }
    writeFileSync(join(archive, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, { flag: 'wx' });
    const verified = verifyArchive(root);
    for (const input of inputs) assert.equal(sha256(readFileSync(input.file)), input.hash, 'Recovery modified an original');
    return { ...verified, originalsPreserved: true, excludedFiles: excluded.length, duplicateSources: 1 };
}

export function verifyArchive(root) {
    root = realpathSync(root);
    const manifestPath = containedFile(root, `${ARCHIVE}/manifest.json`);
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
    assert.equal(manifest.schemaVersion, 1, 'Unsupported recovery manifest');
    assert.equal(manifest.status, 'historical-not-current-certification', 'Historical status is required');
    assert.ok(Array.isArray(manifest.artifacts) && manifest.artifacts.length > 0, 'Recovery inventory must not be empty');
    const paths = new Set();
    let bytes = 0;
    for (const artifact of manifest.artifacts) {
        assert.equal(typeof artifact.path, 'string', 'Missing artifact path');
        assert.ok(artifact.path.startsWith('history/'), 'Recovered files must be in history');
        const key = process.platform === 'win32' ? artifact.path.toLowerCase() : artifact.path;
        assert.ok(!paths.has(key), `Duplicate artifact: ${artifact.path}`);
        paths.add(key);
        assert.match(artifact.sourceSha256, /^[a-f0-9]{64}$/, 'Missing original hash');
        assert.match(artifact.sha256, /^[a-f0-9]{64}$/, 'Missing recovered hash');
        assert.ok(Number.isSafeInteger(artifact.bytes) && artifact.bytes >= 0, 'Invalid artifact size');
        assert.ok(Number.isSafeInteger(artifact.sourceBytes) && artifact.sourceBytes >= 0, 'Invalid original size');
        assert.ok(Array.isArray(artifact.edits), 'Declared edits must be an array');
        assert.ok(['historical', 'empty-failed-producer-output'].includes(artifact.formatStatus), 'Unsupported format status');
        if (artifact.formatStatus === 'empty-failed-producer-output') {
            assert.ok(artifact.path.endsWith('.json') && artifact.bytes === 0, 'Invalid failed-output marker');
        }
        if (artifact.edits.length === 0) {
            assert.equal(artifact.sourceSha256, artifact.sha256, 'Undeclared content change');
            assert.equal(artifact.sourceBytes, artifact.bytes, 'Undeclared size change');
        }
        const data = readFileSync(containedFile(root, `${ARCHIVE}/${artifact.path}`));
        assert.equal(data.length, artifact.bytes, `Artifact size differs: ${artifact.path}`);
        assert.equal(sha256(data), artifact.sha256, `Artifact hash differs: ${artifact.path}`);
        if (!artifact.path.endsWith('.png')) {
            const text = new TextDecoder('utf-8', { fatal: true }).decode(data);
            assert.equal(sanitizeText(text), text, `Unsanitized artifact: ${artifact.path}`);
            if (artifact.path.endsWith('.json') && data.length > 0) JSON.parse(text);
        }
        bytes += data.length;
    }
    const actual = filesIn(join(root, ARCHIVE, 'history'));
    assert.deepEqual(actual.map(path => `history/${path}`).sort(),
        manifest.artifacts.map(artifact => artifact.path).sort(), 'Recovery has unregistered or missing files');
    return { artifacts: manifest.artifacts.length, bytes, hashesVerified: true, status: manifest.status };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    try {
        const args = process.argv.slice(2);
        const root = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();
        let result;
        if (args.length === 0) result = verifyArchive(root);
        else {
            assert.ok(args.length === 3 && args[0] === '--recover' && args[1] === '--session-root' && isAbsolute(args[2]),
                'Usage: session-recovery.mjs [--recover --session-root <absolute authorized session root>]');
            result = recoverArchive(root, args[2]);
        }
        console.log(JSON.stringify(result, null, 2));
    } catch (error) {
        console.error(error.message);
        process.exitCode = 1;
    }
}
