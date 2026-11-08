import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, renameSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import markdown from './shared/markdown-preprocessor.cjs';

export const ARCHIVE_MOVES = [
    ['docs/verification/session-recovery', 'archive/verification/session-recovery'],
    ['docs/verification/development-recovery', 'archive/verification/development-recovery'],
    ['docs/verification/recovery-retention-review', 'archive/verification/recovery-retention-review'],
    ['docs/plans/2026-11-04-native-first-copilot.md', 'archive/plans/2026-11-04-native-first-copilot.md'],
];
const sha = data => createHash('sha256').update(data).digest('hex');
const portable = value => value.split(sep).join('/');

export function relocatedPath(name) {
    const move = ARCHIVE_MOVES.find(([source]) => name === source || name.startsWith(`${source}/`));
    return move ? move[1] + name.slice(move[0].length) : name;
}

export function rewriteLinks(content, originalFile, finalFile, mapTarget) {
    const update = destination => {
        const wrapped = destination.startsWith('<');
        const raw = wrapped ? destination.slice(1, -1) : destination;
        if (/^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(raw)) return destination;
        const split = raw.search(/[?#]/);
        const pathname = split < 0 ? raw : raw.slice(0, split);
        const suffix = split < 0 ? '' : raw.slice(split);
        const target = resolve(dirname(originalFile), decodeURIComponent(pathname));
        const mapped = mapTarget(target);
        const result = mapped.startsWith('https://') ? mapped : portable(relative(dirname(finalFile), mapped)) + suffix;
        return wrapped ? `<${result}>` : result.replace(/ /g, '%20');
    };
    return markdown.transformOutsideMarkdownCode(content, prose => prose
        .replace(/(\]\(\s*)(<[^>]+>|[^\s)]+)(?=[\s)])/g, (_, prefix, target) => prefix + update(target))
        .replace(/^(\s{0,3}\[[^\]]+\]:\s*)(<[^>]+>|\S+)/gm, (_, prefix, target) => prefix + update(target)),
    { inlineCode: false });
}

function files(root, current = root) {
    return readdirSync(current, { withFileTypes: true }).flatMap(entry => {
        if (['.git', 'node_modules', 'dist'].includes(entry.name)) return [];
        const target = join(current, entry.name);
        if (entry.isSymbolicLink()) return [];
        return entry.isDirectory() ? files(root, target) : entry.isFile() ? [portable(relative(root, target))] : [];
    });
}

export function archiveDocs(root) {
    const receipt = join(root, 'archive', 'relocation.json');
    assert.ok(!existsSync(receipt), 'Archival relocation already has a receipt; do not repeat or overwrite it');
    for (const [source, destination] of ARCHIVE_MOVES) {
        assert.ok(existsSync(join(root, source)) && !lstatSync(join(root, source)).isSymbolicLink(), `Missing or linked archive source: ${source}`);
        assert.ok(!existsSync(join(root, destination)), `Archive destination already exists: ${destination}`);
    }
    const inventory = files(root);
    const changes = [];
    const prepared = [];
    for (const name of inventory) {
        const original = readFileSync(join(root, name));
        const destination = relocatedPath(name);
        let data = original;
        if (name.endsWith('.md')) {
            data = Buffer.from(rewriteLinks(original.toString('utf8'), join(root, name), join(root, destination),
                target => join(root, relocatedPath(portable(relative(root, target))))));
        }
        if (destination !== name || !data.equals(original)) {
            changes.push({ source: name, destination, originalSha256: sha(original), sha256: sha(data),
                originalBytes: original.length, bytes: data.length,
                edits: data.equals(original) ? [] : ['relative-link-rebasing'] });
            prepared.push({ source: name, destination, original, data });
        }
    }
    for (const item of prepared) assert.equal(sha(readFileSync(join(root, item.source))), sha(item.original), 'Archive input changed after planning');
    for (const [source, destination] of ARCHIVE_MOVES) {
        mkdirSync(dirname(join(root, destination)), { recursive: true });
        renameSync(join(root, source), join(root, destination));
    }
    for (const item of prepared) {
        const destination = join(root, item.destination);
        if (!item.data.equals(item.original)) writeFileSync(destination, item.data);
        assert.equal(sha(readFileSync(destination)), sha(item.data), 'Relocation hash verification failed');
    }
    const manifestPath = join(root, 'archive', 'verification', 'session-recovery', 'manifest.json');
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
    for (const entry of manifest.artifacts) {
        const old = `docs/verification/session-recovery/${entry.path}`;
        const change = changes.find(item => item.source === old);
        if (change && change.originalSha256 !== change.sha256) {
            entry.sha256 = change.sha256;
            entry.bytes = change.bytes;
            entry.edits.push('archive-relative-link-rebasing');
        }
    }
    for (const entry of manifest.pruned || []) {
        entry.sourceRepositoryPath = `docs/verification/session-recovery/${entry.path}`;
    }
    writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
    const manifestChange = changes.find(item => item.destination === 'archive/verification/session-recovery/manifest.json');
    if (manifestChange) {
        const data = readFileSync(manifestPath);
        manifestChange.sha256 = sha(data);
        manifestChange.bytes = data.length;
        manifestChange.edits.push('archival-custody-path-updates');
    }
    writeFileSync(receipt, `${JSON.stringify({ schemaVersion: 1,
        status: 'maintainer-history-relocated-not-a-plugin-release', moves: ARCHIVE_MOVES,
        verificationScope: 'Initial relocation hashes; later approved mutable-index or source edits are not frozen snapshots. Retained historical artifacts remain verified by the recovery manifest.',
        files: changes, frozenEvidenceMovedWithoutContentChanges: changes.filter(item =>
            item.source.includes('/session-recovery/history/') && item.originalSha256 === item.sha256).length }, null, 2)}\n`);
    return { moved: changes.filter(item => item.source !== item.destination).length,
        rebased: changes.filter(item => item.originalSha256 !== item.sha256).length,
        frozenEvidenceUnchanged: changes.filter(item => item.source.includes('/session-recovery/history/') &&
            item.originalSha256 === item.sha256).length };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    assert.equal(process.argv[2], '--apply', 'This scoped relocation requires explicit --apply');
    console.log(JSON.stringify(archiveDocs(resolve(dirname(fileURLToPath(import.meta.url)), '..'))));
}
