#!/usr/bin/env node

'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const repositoryRoot = path.resolve(__dirname, '..');

function componentSource(...candidates) {
    const resolved = candidates.map((candidate) => path.join(repositoryRoot, candidate)).find((candidate) => fs.existsSync(candidate));
    if (!resolved) throw new Error(`Missing bundled component: ${candidates.join(' or ')}`);
    return resolved;
}

const skillSource = componentSource('.github/skills/compile-brain/SKILL.md', 'skills/compile-brain/SKILL.md');
const promptSource = componentSource('prompts/compile-brain.prompt.md', '.github/prompts/compile-brain.prompt.md', 'commands/compile-brain.md');

const PLATFORM_FILES = {
    copilot: [
        { source: skillSource, target: '.github/skills/compile-brain/SKILL.md' },
        { source: promptSource, target: '.github/prompts/compile-brain.prompt.md' },
    ],
    'agent-skills': [
        { source: skillSource, target: '.agents/skills/compile-brain/SKILL.md' },
    ],
    'claude-code': [
        { source: skillSource, target: '.claude/skills/compile-brain/SKILL.md' },
    ],
    cursor: [
        { source: skillSource, target: '.cursor/skills/compile-brain/SKILL.md' },
    ],
    codex: [
        { source: skillSource, target: 'AGENTS.md', stripFrontmatter: true },
    ],
    'gemini-cli': [
        { source: skillSource, target: 'GEMINI.md', stripFrontmatter: true },
    ],
    chatgpt: [
        { source: skillSource, target: 'CHATGPT-COMPILE-BRAIN.md', stripFrontmatter: true },
    ],
};

function usage() {
    return 'Usage: scaffold-platform.cjs --platform <copilot|agent-skills|claude-code|cursor|codex|gemini-cli|chatgpt|all> --target <directory> [--apply] [--force]';
}

function parseArguments(argv) {
    const options = { platform: null, target: null, apply: false, force: false };
    for (let index = 0; index < argv.length; index += 1) {
        const argument = argv[index];
        if (argument === '--apply' || argument === '--force') {
            options[argument.slice(2)] = true;
            continue;
        }
        if (argument === '--help') return { help: true };
        if (!['--platform', '--target'].includes(argument)) throw new Error(usage());
        const value = argv[index + 1];
        if (!value || value.startsWith('--')) throw new Error(`Missing value for ${argument}`);
        options[argument.slice(2)] = value;
        index += 1;
    }
    if (!options.platform || !options.target) throw new Error(usage());
    if (options.force && !options.apply) throw new Error('--force requires --apply');
    return options;
}

function removeFrontmatter(content) {
    return content.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '');
}

function plannedFiles(platform) {
    const platforms = platform === 'all' ? Object.keys(PLATFORM_FILES) : [platform];
    if (platforms.some((name) => !Object.hasOwn(PLATFORM_FILES, name))) {
        throw new Error(`Unsupported platform: ${platform}`);
    }
    return platforms.flatMap((name) => PLATFORM_FILES[name].map((file) => ({ ...file, platform: name })));
}

function preflightDestination(root, destination) {
    const relative = path.relative(root, destination);
    if (relative === '' || relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
        throw new Error(`Destination is outside target: ${destination}`);
    }
    const segments = relative.split(path.sep);
    let current = root;
    for (let index = 0; index < segments.length; index += 1) {
        current = path.join(current, segments[index]);
        let stat;
        try {
            stat = fs.lstatSync(current);
        } catch (error) {
            if (error.code === 'ENOENT') return;
            throw error;
        }
        if (stat.isSymbolicLink()) throw new Error(`Refusing destination symbolic link or junction: ${current}`);
        if (index < segments.length - 1 && !stat.isDirectory()) {
            throw new Error(`Destination parent is not a directory: ${current}`);
        }
        if (index === segments.length - 1 && !stat.isFile()) {
            throw new Error(`Destination is not a regular file: ${current}`);
        }
    }
}

function writeAtomically(destination, content, overwrite) {
    const temporary = path.join(path.dirname(destination),
        `.${path.basename(destination)}.${process.pid}.${crypto.randomBytes(8).toString('hex')}.tmp`);
    try {
        fs.writeFileSync(temporary, content, { encoding: 'utf8', flag: 'wx' });
        if (overwrite) fs.renameSync(temporary, destination);
        else fs.linkSync(temporary, destination);
    } finally {
        fs.rmSync(temporary, { force: true });
    }
}

function main() {
    const options = parseArguments(process.argv.slice(2));
    if (options.help) {
        process.stdout.write(`${usage()}\n`);
        return;
    }

    const requestedTarget = path.resolve(options.target);
    if (!fs.existsSync(requestedTarget) || !fs.statSync(requestedTarget).isDirectory()) {
        throw new Error(`Target directory does not exist: ${requestedTarget}`);
    }
    const targetRoot = fs.realpathSync.native(requestedTarget);
    const files = plannedFiles(options.platform).map((file) => ({
        ...file,
        destination: path.resolve(targetRoot, file.target),
    }));
    const duplicateDestinations = files.filter((file, index) =>
        files.findIndex((candidate) => candidate.destination === file.destination) !== index);
    if (duplicateDestinations.length > 0) throw new Error('Platform selection creates duplicate destination files');

    for (const file of files) preflightDestination(targetRoot, file.destination);
    const existing = files.filter((file) => fs.existsSync(file.destination));
    if (options.apply && existing.length > 0 && !options.force) {
        throw new Error(`Refusing to overwrite existing files: ${existing.map((file) => file.target).join(', ')}`);
    }

    const report = {
        platform: options.platform,
        target: targetRoot,
        apply: options.apply,
        files: files.map((file) => ({
            platform: file.platform,
            path: file.target.replace(/\\/g, '/'),
            action: fs.existsSync(file.destination) ? (options.apply ? 'overwrite' : 'exists') : 'create',
        })),
    };
    if (options.apply) {
        const prepared = files.map((file) => {
            let content = fs.readFileSync(file.source, 'utf8');
            if (file.stripFrontmatter) content = removeFrontmatter(content);
            return { ...file, content };
        });
        for (const file of prepared) {
            fs.mkdirSync(path.dirname(file.destination), { recursive: true });
            preflightDestination(targetRoot, file.destination);
            writeAtomically(file.destination, file.content, options.force);
        }
    }
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
}

if (require.main === module) {
    try {
        main();
    } catch (error) {
        process.stderr.write(`scaffold-platform: ${error.message}\n`);
        process.exitCode = 1;
    }
}
