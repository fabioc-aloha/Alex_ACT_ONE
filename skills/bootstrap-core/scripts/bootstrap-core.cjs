#!/usr/bin/env node
'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

// ONE ships skills at the package root (skills/<name>/scripts/), not under
// .github/, so the package root is three levels up rather than four, and the
// instruction sources sit at instructions/ rather than .github/instructions/.
const CORE_ROOT = path.resolve(__dirname, '..', '..', '..');
const SOURCE_ROOT = path.join(CORE_ROOT, 'instructions');
const MANIFEST_PATH = path.join(CORE_ROOT, 'manifest.json');
const RECEIPT_NAME = '.alex-act-one-bootstrap.json';
const LEGACY_RECEIPT_NAME = '.alex-act-bootstrap.json';

function sha256(value) {
    return crypto.createHash('sha256').update(value).digest('hex');
}

function safeInstructionName(value) {
    return typeof value === 'string'
        && /^[a-z0-9][a-z0-9._-]*\.instructions\.md$/.test(value)
        && path.basename(value) === value;
}

function writeAtomic(file, content) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    const temporary = `${file}.tmp-${process.pid}`;
    fs.writeFileSync(temporary, content, { flag: 'wx' });
    fs.renameSync(temporary, file);
}

function readJson(file, fallback = null) {
    if (!fs.existsSync(file)) return fallback;
    return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function defaultTargetInstructions() {
    const copilotHome = process.env.COPILOT_HOME?.trim();
    if (copilotHome) {
        if (!path.isAbsolute(copilotHome)) {
            throw new Error('COPILOT_HOME must be an absolute path');
        }
        return {
            path: path.join(copilotHome, 'instructions'),
            source: 'COPILOT_HOME',
        };
    }
    return {
        path: path.join(os.homedir(), '.copilot', 'instructions'),
        source: 'home-directory',
    };
}

function parseArgs(args) {
    const plugin = readJson(path.join(CORE_ROOT, 'plugin.json'));
    const defaultTarget = defaultTargetInstructions();
    const options = {
        apply: false,
        remove: false,
        targetInstructions: defaultTarget.path,
        targetSource: defaultTarget.source,
        workspaceInstructions: null,
        coreVersion: plugin?.version,
    };
    const values = new Map([
        ['--target-instructions', 'targetInstructions'],
        ['--workspace-instructions', 'workspaceInstructions'],
        ['--core-version', 'coreVersion'],
    ]);
    for (let index = 0; index < args.length; index++) {
        const value = args[index];
        if (value === '--apply') options.apply = true;
        else if (value === '--remove') options.remove = true;
        else if (values.has(value)) {
            if (!args[index + 1] || args[index + 1].startsWith('--')) {
                throw new Error(`${value} requires a value`);
            }
            options[values.get(value)] = args[++index];
            if (value === '--target-instructions') options.targetSource = 'explicit';
        } else throw new Error(`unknown argument: ${value}`);
    }
    if (!options.coreVersion) throw new Error('plugin version is unavailable');
    options.targetInstructions = path.resolve(options.targetInstructions);
    if (options.workspaceInstructions) {
        options.workspaceInstructions = path.resolve(options.workspaceInstructions);
    }
    return options;
}

function expectedFiles() {
    if (!fs.existsSync(SOURCE_ROOT)) throw new Error('canonical instruction source is missing');
    const names = fs.readdirSync(SOURCE_ROOT)
        .filter((name) => name.endsWith('.instructions.md'))
        .sort();
    if (names.length !== 15 || !names.every(safeInstructionName)) {
        throw new Error(`expected 15 canonical instructions, found ${names.length}`);
    }
    const manifest = readJson(MANIFEST_PATH);
    if (!Array.isArray(manifest?.assets?.instructions)) {
        throw new Error('manifest instruction inventory is missing');
    }
    const declaredNames = manifest.assets.instructions.map((entry) => {
        if (!entry || typeof entry.name !== 'string'
            || typeof entry.path !== 'string'
            || typeof entry.install_to !== 'string') {
            throw new Error('manifest instruction entry is invalid');
        }
        // ONE keeps instruction sources at instructions/ in the package root and
        // installs them to the user's .github/instructions/, so source and target
        // paths differ here where Core's were identical.
        const expectedPath = `instructions/${entry.name}.instructions.md`;
        const expectedInstallTo = `.github/instructions/${entry.name}.instructions.md`;
        if (entry.path !== expectedPath || entry.install_to !== expectedInstallTo) {
            throw new Error(`manifest instruction path is invalid for ${entry.name}`);
        }
        return `${entry.name}.instructions.md`;
    }).sort();
    if (declaredNames.length !== 15
        || new Set(declaredNames).size !== declaredNames.length
        || JSON.stringify(declaredNames) !== JSON.stringify(names)) {
        throw new Error('manifest instruction inventory differs from canonical sources');
    }
    return names.map((sourceName) => ({
        name: `alex-act-${sourceName}`,
        owner: 'alex-act-core',
        sourceRelativePath: `.github/instructions/${sourceName}`,
        bytes: fs.readFileSync(path.join(SOURCE_ROOT, sourceName)),
    }));
}

function normalizedReceiptFile(file) {
    return {
        name: file.name,
        owner: file.owner,
        sourceRelativePath: file.sourceRelativePath,
        sha256: sha256(file.bytes),
    };
}

function receiptCurrent(receipt, options, files) {
    if (!receipt || receipt.schemaVersion !== 2
        || receipt.bootstrappedBy !== 'alex-act-core'
        || receipt.coreVersion !== options.coreVersion
        || !Array.isArray(receipt.files) || receipt.files.length !== files.length) return false;
    const expected = new Map(files.map((file) => [file.name, normalizedReceiptFile(file)]));
    const names = new Set(receipt.files.map((entry) => entry?.name));
    if (names.size !== files.length) return false;
    return receipt.files.every((entry) => {
        const source = expected.get(entry.name);
        return source && entry.owner === 'alex-act-core'
            && entry.sourceRelativePath === source.sourceRelativePath
            && entry.sha256 === source.sha256;
    });
}

function validatedOwnedReceipt(receipt, files) {
    if (!receipt || receipt.schemaVersion !== 2
        || receipt.bootstrappedBy !== 'alex-act-core'
        || !Array.isArray(receipt.files)
        || receipt.files.length !== files.length) {
        throw new Error('bootstrap receipt is invalid');
    }
    const expected = new Map(files.map((file) => [file.name, normalizedReceiptFile(file)]));
    const names = new Set();
    for (const entry of receipt.files) {
        const source = expected.get(entry?.name);
        if (!source || names.has(entry.name)
            || !safeInstructionName(entry.name)
            || entry.owner !== 'alex-act-core'
            || entry.sourceRelativePath !== source.sourceRelativePath
            || typeof entry.sha256 !== 'string'
            || !/^[a-f0-9]{64}$/.test(entry.sha256)) {
            throw new Error('bootstrap receipt contains unsafe or unowned entries');
        }
        names.add(entry.name);
    }
    return receipt.files;
}

function legacyEvidence(file) {
    const receipt = readJson(file);
    if (!receipt || !Array.isArray(receipt.files)) return null;
    const entries = receipt.files.map((entry) => typeof entry === 'string'
        ? { name: entry, owner: null }
        : { name: entry.name, owner: entry.owner || null });
    return {
        present: true,
        coreEntries: entries.filter((entry) => entry.owner === 'alex-act-core'
            || (entry.owner === null && entry.name !== 'alex-act-greeting-checkin.instructions.md')).length,
        managerEntries: entries.filter((entry) => entry.owner === 'alex-act-manager'
            || entry.name === 'alex-act-greeting-checkin.instructions.md').length,
    };
}

function overlapReport(directory, files) {
    if (!directory || !fs.existsSync(directory)) return [];
    const existing = new Set();
    const visit = (current) => {
        for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
            const target = path.join(current, entry.name);
            if (entry.isDirectory()) visit(target);
            else if (entry.isFile()) existing.add(entry.name);
        }
    };
    visit(directory);
    return files.filter((file) => {
        const sourceName = file.name.replace(/^alex-act-/, '');
        return existing.has(file.name) || existing.has(sourceName);
    }).map((file) => file.name);
}

function buildPlan(options) {
    const files = expectedFiles();
    const receiptPath = path.join(options.targetInstructions, RECEIPT_NAME);
    const receipt = readJson(receiptPath);
    if (options.remove) {
        const owned = receipt ? validatedOwnedReceipt(receipt, files) : [];
        const actions = owned.map((entry) => {
            const destination = path.join(options.targetInstructions, entry.name);
            if (!fs.existsSync(destination)) return { name: entry.name, action: 'absent' };
            return {
                name: entry.name,
                action: sha256(fs.readFileSync(destination)) === entry.sha256
                    ? 'remove'
                    : 'preserve-modified',
            };
        });
        return {
            schemaVersion: 1,
            apply: options.apply,
            mode: 'remove',
            coreVersion: options.coreVersion,
            targetInstructions: options.targetInstructions,
            targetSource: options.targetSource,
            expectedFiles: files.length,
            files: actions,
            receipt: { action: receipt ? 'remove-when-clean' : 'absent' },
            _receiptPath: receiptPath,
        };
    }
    const actions = files.map((file) => {
        const destination = path.join(options.targetInstructions, file.name);
        const sourceHash = sha256(file.bytes);
        if (!fs.existsSync(destination)) return { name: file.name, action: 'create', sha256: sourceHash };
        return {
            name: file.name,
            action: sha256(fs.readFileSync(destination)) === sourceHash ? 'preserve' : 'replace',
            sha256: sourceHash,
        };
    });
    return {
        schemaVersion: 1,
        apply: options.apply,
        mode: 'activate',
        coreVersion: options.coreVersion,
        targetInstructions: options.targetInstructions,
        targetSource: options.targetSource,
        expectedFiles: files.length,
        files: actions,
        receipt: {
            action: receiptCurrent(receipt, options, files)
                ? 'preserve'
                : receipt ? 'refresh' : 'create',
        },
        overlap: overlapReport(options.workspaceInstructions, files),
        legacy: legacyEvidence(path.join(options.targetInstructions, LEGACY_RECEIPT_NAME)),
        _files: files,
        _receiptPath: receiptPath,
    };
}

function applyPlan(plan, options) {
    if (plan.mode === 'remove') {
        for (const entry of plan.files) {
            if (entry.action === 'remove') {
                fs.rmSync(path.join(options.targetInstructions, entry.name));
            }
        }
        if (!plan.files.some((entry) => entry.action === 'preserve-modified')) {
            fs.rmSync(plan._receiptPath, { force: true });
        }
        for (const entry of plan.files) {
            const destination = path.join(options.targetInstructions, entry.name);
            if (entry.action === 'remove' && fs.existsSync(destination)) {
                throw new Error(`removal verification failed for ${entry.name}`);
            }
            if (entry.action === 'preserve-modified' && !fs.existsSync(destination)) {
                throw new Error(`modified instruction was not preserved: ${entry.name}`);
            }
        }
        const preservedModified = plan.files
            .filter((entry) => entry.action === 'preserve-modified')
            .map((entry) => entry.name);
        const receiptRemoved = !fs.existsSync(plan._receiptPath);
        if (preservedModified.length > 0 && receiptRemoved) {
            throw new Error('receipt must remain while modified owned files are preserved');
        }
        plan.verification = {
            removed: plan.files.filter((entry) => entry.action === 'remove').length,
            preservedModified,
            receiptRemoved,
        };
        return plan;
    }
    for (const file of plan._files) {
        const action = plan.files.find((entry) => entry.name === file.name)?.action;
        if (action === 'create' || action === 'replace') {
            writeAtomic(path.join(options.targetInstructions, file.name), file.bytes);
        }
    }
    if (plan.receipt.action !== 'preserve') {
        const receipt = {
            schemaVersion: 2,
            bootstrappedBy: 'alex-act-core',
            coreVersion: options.coreVersion,
            timestamp: new Date().toISOString(),
            files: plan._files.map(normalizedReceiptFile),
        };
        writeAtomic(plan._receiptPath, `${JSON.stringify(receipt, null, 2)}\n`);
    }
    for (const file of plan._files) {
        if (sha256(fs.readFileSync(path.join(options.targetInstructions, file.name))) !== sha256(file.bytes)) {
            throw new Error(`destination verification failed for ${file.name}`);
        }
    }
    const verifiedReceipt = readJson(plan._receiptPath);
    if (!receiptCurrent(verifiedReceipt, options, plan._files)) {
        throw new Error('receipt verification failed after apply');
    }
    plan.verification = {
        destinationHashes: plan._files.length,
        receiptCurrent: true,
    };
    return plan;
}

function publicPlan(plan) {
    const { _files, _receiptPath, ...output } = plan;
    return output;
}

function main() {
    try {
        const options = parseArgs(process.argv.slice(2));
        const plan = buildPlan(options);
        if (options.apply) applyPlan(plan, options);
        process.stdout.write(`${JSON.stringify(publicPlan(plan), null, 2)}\n`);
    } catch (error) {
        console.error(`ERROR: ${error.message}`);
        process.exitCode = 1;
    }
}

if (require.main === module) main();

module.exports = { applyPlan, buildPlan, parseArgs };
