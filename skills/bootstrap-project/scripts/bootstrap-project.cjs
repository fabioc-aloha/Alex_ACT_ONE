#!/usr/bin/env node
'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const RESOURCE_ROOT = path.resolve(__dirname, '..', 'resources');
const RESOURCE_FILES = Object.freeze({
    'AGENTS.md': 'AGENTS.md',
    'CLAUDE.md': 'CLAUDE.md',
    'GEMINI.md': 'GEMINI.md',
    'HANDOFF.md': 'HANDOFF.md',
    '.github/episodic/README.md': 'episodic-README.md',
});

function sha256(value) {
    return crypto.createHash('sha256').update(value).digest('hex');
}

function parseArgs(args) {
    const options = { apply: false, repositoryRoot: null };
    for (let index = 0; index < args.length; index++) {
        const value = args[index];
        if (value === '--apply') options.apply = true;
        else if (value === '--repository-root') {
            if (!args[index + 1] || args[index + 1].startsWith('--')) {
                throw new Error('--repository-root requires a value');
            }
            options.repositoryRoot = path.resolve(args[++index]);
        } else throw new Error(`unknown argument: ${value}`);
    }
    if (!options.repositoryRoot) throw new Error('--repository-root is required');
    if (!fs.existsSync(options.repositoryRoot)
        || !fs.statSync(options.repositoryRoot).isDirectory()) {
        throw new Error('repository root must be an existing directory');
    }
    return options;
}

function analyzeJsonc(text) {
    let output = '';
    let inString = false;
    let escaped = false;
    let lineComment = false;
    let blockComment = false;
    let hadComments = false;
    for (let index = 0; index < text.length; index++) {
        const character = text[index];
        const next = text[index + 1];
        if (lineComment) {
            if (character === '\n' || character === '\r') {
                lineComment = false;
                output += character;
            }
            continue;
        }
        if (blockComment) {
            if (character === '*' && next === '/') {
                blockComment = false;
                index++;
            }
            continue;
        }
        if (inString) {
            output += character;
            if (escaped) escaped = false;
            else if (character === '\\') escaped = true;
            else if (character === '"') inString = false;
            continue;
        }
        if (character === '"') {
            inString = true;
            output += character;
        } else if (character === '/' && next === '/') {
            hadComments = true;
            lineComment = true;
            index++;
        } else if (character === '/' && next === '*') {
            hadComments = true;
            blockComment = true;
            index++;
        } else output += character;
    }
    return { value: JSON.parse(stripTrailingCommas(output)), hadComments };
}

function stripTrailingCommas(text) {
    let output = '';
    let inString = false;
    let escaped = false;
    for (let index = 0; index < text.length; index++) {
        const character = text[index];
        if (inString) {
            output += character;
            if (escaped) escaped = false;
            else if (character === '\\') escaped = true;
            else if (character === '"') inString = false;
            continue;
        }
        if (character === '"') {
            inString = true;
            output += character;
            continue;
        }
        if (character === ',') {
            let next = index + 1;
            while (/\s/.test(text[next] || '')) next++;
            if (text[next] === '}' || text[next] === ']') continue;
        }
        output += character;
    }
    return output;
}

function isPlainObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function mergeMissing(current, desired, pathPrefix = '') {
    const merged = isPlainObject(current) ? { ...current } : {};
    const changes = [];
    for (const [key, value] of Object.entries(desired)) {
        const keyPath = pathPrefix ? `${pathPrefix}.${key}` : key;
        if (!Object.hasOwn(merged, key)) {
            merged[key] = value;
            changes.push({ key: keyPath, action: 'add', value });
        } else if (isPlainObject(value) && isPlainObject(merged[key])) {
            const nested = mergeMissing(merged[key], value, keyPath);
            merged[key] = nested.merged;
            changes.push(...nested.changes);
        }
    }
    return { merged, changes };
}

function resource(relativePath) {
    const file = path.join(RESOURCE_ROOT, relativePath);
    if (!fs.existsSync(file)) throw new Error(`project bootstrap resource missing: ${relativePath}`);
    return fs.readFileSync(file);
}

function nestedAgents(root, current = root, output = []) {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
        if (entry.name === '.git') continue;
        const target = path.join(current, entry.name);
        if (entry.isDirectory()) nestedAgents(root, target, output);
        else if (entry.isFile() && entry.name === 'AGENTS.md' && current !== root) {
            output.push(path.relative(root, target).replace(/\\/g, '/'));
        }
    }
    return output.sort();
}

function classify(root) {
    const singular = path.join(root, 'AGENT.md');
    const plural = path.join(root, 'AGENTS.md');
    const hasSingular = fs.existsSync(singular);
    const hasPlural = fs.existsSync(plural);
    if (hasSingular && hasPlural
        && !fs.readFileSync(singular).equals(fs.readFileSync(plural))) {
        return 'agent-source-conflict';
    }
    if (hasSingular && hasPlural) return 'redundant-sources';
    if (hasSingular) return 'legacy-singular';
    if (nestedAgents(root).length > 0) return 'nested-contracts-present';
    if (fs.readdirSync(root).length === 0) return 'repository-empty';
    if (!fs.existsSync(path.join(root, '.git'))) return 'git-absent';
    if (!hasPlural) return 'repository-unconfigured';
    return 'canonical-present';
}

function planGitignore(root) {
    const file = path.join(root, '.gitignore');
    if (!fs.existsSync(file)) {
        return {
            action: 'create',
            content: '.vscode/*\n!.vscode/settings.json\n',
        };
    }
    const original = fs.readFileSync(file, 'utf8');
    const lines = original.split(/\r?\n/);
    const broad = /^(?:\/)?\.vscode\/?$/;
    const stylesheetException = /^!\.vscode\/markdown-(?:light|preview)\.css$/;
    const filtered = lines.filter((line) => !stylesheetException.test(line.trim()));
    const removedStylesheetException = filtered.length !== lines.length;
    if (!filtered.some((line) => broad.test(line.trim()))) {
        return removedStylesheetException
            ? { action: 'remove-css-exception', content: `${filtered.join('\n').replace(/\n+$/, '')}\n` }
            : { action: 'preserve' };
    }
    const output = [];
    let replaced = false;
    for (const line of filtered) {
        if (broad.test(line.trim())) {
            if (!replaced) output.push('.vscode/*', '!.vscode/settings.json');
            replaced = true;
        } else output.push(line);
    }
    return {
        action: 'narrow-vscode-rule',
        content: `${output.join('\n').replace(/\n+$/, '')}\n`,
    };
}

function buildPlan(options) {
    const root = options.repositoryRoot;
    const classification = classify(root);
    const blocked = classification === 'agent-source-conflict';
    const creates = [];
    for (const [relativePath, resourceName] of Object.entries(RESOURCE_FILES)) {
        if (!fs.existsSync(path.join(root, relativePath))) {
            const bytes = resource(resourceName);
            creates.push({ relativePath, sha256: sha256(bytes), _bytes: bytes });
        }
    }
    const settingsFile = path.join(root, '.vscode', 'settings.json');
    const desiredSettings = JSON.parse(resource('project-settings.json').toString('utf8'));
    let settings = { action: 'create', changes: [], hadComments: false, _value: desiredSettings };
    if (fs.existsSync(settingsFile)) {
        const parsed = analyzeJsonc(fs.readFileSync(settingsFile, 'utf8'));
        const merged = mergeMissing(parsed.value, desiredSettings);
        settings = {
            action: merged.changes.length ? 'merge' : 'preserve',
            changes: merged.changes,
            hadComments: parsed.hadComments,
            _value: merged.merged,
        };
    }
    return {
        schemaVersion: 1,
        apply: options.apply,
        classification,
        blocked,
        nestedAgents: nestedAgents(root),
        creates,
        settings,
        gitignore: planGitignore(root),
        _root: root,
    };
}

function writeAtomic(file, content) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    const temporary = `${file}.tmp-${process.pid}`;
    fs.writeFileSync(temporary, content, { flag: 'wx' });
    fs.renameSync(temporary, file);
}

function applyPlan(plan) {
    if (plan.blocked) throw new Error(`project bootstrap blocked: ${plan.classification}`);
    if (plan.settings.hadComments && plan.settings.action === 'merge') {
        throw new Error('workspace settings contain comments; merge the reported keys manually');
    }
    for (const entry of plan.creates) {
        const destination = path.join(plan._root, entry.relativePath);
        if (!fs.existsSync(destination)) writeAtomic(destination, entry._bytes);
    }
    if (plan.settings.action === 'create' || plan.settings.action === 'merge') {
        writeAtomic(path.join(plan._root, '.vscode', 'settings.json'),
            `${JSON.stringify(plan.settings._value, null, 2)}\n`);
    }
    if (plan.gitignore.action !== 'preserve') {
        writeAtomic(path.join(plan._root, '.gitignore'), plan.gitignore.content);
    }
    const verification = buildPlan({
        repositoryRoot: plan._root,
        apply: false,
    });
    plan.verification = {
        pendingCreates: verification.creates.length,
        pendingSettingsChanges: verification.settings.changes.length,
    };
    return plan;
}

function publicPlan(plan) {
    return {
        schemaVersion: plan.schemaVersion,
        apply: plan.apply,
        classification: plan.classification,
        blocked: plan.blocked,
        nestedAgents: plan.nestedAgents,
        creates: plan.creates.map(({ relativePath, sha256: hash }) => ({ relativePath, sha256: hash })),
        settings: {
            action: plan.settings.action,
            changes: plan.settings.changes,
            hadComments: plan.settings.hadComments,
        },
        gitignore: { action: plan.gitignore.action },
        ...(plan.verification ? { verification: plan.verification } : {}),
    };
}

function main() {
    try {
        const options = parseArgs(process.argv.slice(2));
        const plan = buildPlan(options);
        if (options.apply) applyPlan(plan);
        process.stdout.write(`${JSON.stringify(publicPlan(plan), null, 2)}\n`);
    } catch (error) {
        console.error(`ERROR: ${error.message}`);
        process.exitCode = 1;
    }
}

if (require.main === module) main();

module.exports = { applyPlan, buildPlan, parseArgs };
