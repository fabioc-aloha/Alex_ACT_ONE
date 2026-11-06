'use strict';

const { spawnSync } = require('node:child_process');
const { existsSync, readFileSync } = require('node:fs');
const { basename, dirname, isAbsolute, join, relative, resolve, sep } = require('node:path');
const { TOOLS } = require('./dependencies.cjs');

const commandCaches = new WeakMap();
const LOOKUP_TIMEOUT_MS = 30000;

function resolveWindowsCommand(command, {
    platform = process.platform, locate = spawnSync, cwd = process.cwd(), env = process.env,
} = {}) {
    if (platform !== 'win32' || isAbsolute(command)) return command;
    const environment = Object.fromEntries(Object.entries(env).map(([key, value]) => [key.toUpperCase(), value]));
    const key = JSON.stringify([command, resolve(cwd), environment.PATH, environment.PATHEXT]);
    let cache = commandCaches.get(locate);
    if (!cache) { cache = new Map(); commandCaches.set(locate, cache); }
    const cached = cache.get(key);
    if (cached && existsSync(cached)) return cached;
    cache.delete(key);
    const result = locate('where.exe', [command], {
        cwd, env, encoding: 'utf8', shell: false, windowsHide: true, timeout: LOOKUP_TIMEOUT_MS,
    });
    if (result.error) {
        throw new Error(`Command lookup failed for ${command} (budget ${LOOKUP_TIMEOUT_MS} ms): ${result.error.message}`,
            { cause: result.error });
    }
    if (result.status !== 0) return command;
    const candidates = String(result.stdout || '').split(/\r?\n/).map(line => line.trim()).filter(Boolean);
    const selected = candidates.find(file => /\.cmd$/i.test(file)) ||
        candidates.find(file => /\.exe$/i.test(file)) ||
        candidates.find(file => /\.bat$/i.test(file)) || candidates[0];
    if (selected) cache.set(key, selected);
    return selected || command;
}

function resolveInvocation(command, args, options = {}, {
    platform = process.platform,
    locate = spawnSync,
    fileExists = existsSync,
    prefixProbe = spawnSync,
    readMetadata = file => JSON.parse(readFileSync(file, 'utf8')),
} = {}) {
    const resolved = resolveWindowsCommand(command, { platform, locate, cwd: options.cwd, env: options.env });
    if (platform !== 'win32' || !/\.(?:cmd|bat|ps1)$/i.test(resolved)) {
        return { command: resolved, args };
    }
    const name = basename(command).replace(/\.(?:cmd|bat|ps1)$/i, '').toLowerCase();
    const npmEntrypoint = { npm: 'npm-cli.js', npx: 'npx-cli.js' }[name];
    if (npmEntrypoint) {
        let cli = join(dirname(resolved), 'node_modules', 'npm', 'bin', npmEntrypoint);
        const helper = join(dirname(resolved), 'node_modules', 'npm', 'bin', 'npm-prefix.js');
        if (fileExists(helper)) {
            const prefix = prefixProbe(process.execPath, [helper], {
                cwd: options.cwd, env: options.env, encoding: 'utf8',
                shell: false, windowsHide: true, timeout: 30000,
            });
            if (prefix.error || prefix.status !== 0 || !String(prefix.stdout || '').trim()) {
                throw new Error(`npm prefix discovery failed: ${prefix.error?.message || prefix.stderr || 'empty prefix'}`);
            }
            const candidate = join(String(prefix.stdout).trim(), 'node_modules', 'npm', 'bin', npmEntrypoint);
            if (fileExists(candidate)) cli = candidate;
        }
        if (!fileExists(cli)) throw new Error(`${name} CLI entry point not found beside shim: ${cli}`);
        return { command: process.execPath, args: [cli, ...args] };
    }
    const tool = name === 'copilot' ? { kind: 'npm-global', package: '@github/copilot' } : TOOLS[name];
    if (!tool || !['npm-global', 'npm-module'].includes(tool.kind)) {
        throw new Error(`refusing shell execution for unsupported command shim: ${resolved}`);
    }
    const candidates = [
        join(dirname(resolved), 'node_modules', ...tool.package.split('/')),
        join(dirname(resolved), '..', ...tool.package.split('/')),
    ];
    const directory = candidates.find(folder => fileExists(join(folder, 'package.json')));
    if (!directory) throw new Error(`${name} package metadata not found beside shim: ${resolved}`);
    const metadata = readMetadata(join(directory, 'package.json'));
    if (metadata.name !== tool.package) throw new Error(`${name} package identity mismatch at ${directory}`);
    const bin = typeof metadata.bin === 'string' ? metadata.bin : metadata.bin?.[name];
    if (typeof bin !== 'string' || !bin) throw new Error(`${name} package declares no usable bin`);
    const entrypoint = resolve(directory, bin);
    const location = relative(resolve(directory), entrypoint);
    if (!location || location === '..' || location.startsWith('..' + sep) || isAbsolute(location)) {
        throw new Error(`${name} package bin escapes outside its package`);
    }
    if (!fileExists(entrypoint)) throw new Error(`${name} package bin is missing: ${entrypoint}`);
    return { command: process.execPath, args: [entrypoint, ...args] };
}

module.exports = { resolveWindowsCommand, resolveInvocation };
