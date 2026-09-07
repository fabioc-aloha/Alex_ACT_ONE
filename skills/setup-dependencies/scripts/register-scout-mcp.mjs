#!/usr/bin/env node

/**
 * Register this package's MCP servers with Microsoft Scout.
 *
 * Copilot CLI and VS Code read `plugin.json` -> `mcpServers` directly. Scout does
 * not: it keeps its own registry at ~/.scout/m-mcp-servers.json and ignores the
 * plugin manifest entirely. Without this step Scout loads every skill but none
 * of the servers those skills call, which looks like a broken package rather
 * than an unregistered one.
 *
 * Two shape differences matter when translating a manifest entry into Scout's
 * registry, and both are silent failures if missed:
 *
 *   1. Scout wraps the launch spec in `config` and expects `type: "command"`,
 *      not the manifest's flat `type: "stdio"`.
 *   2. Scout resolves nothing relative to the plugin. Manifest args carry
 *      package-relative script paths; they must be made absolute here.
 *
 * Previews by default. Writes only with --apply, and only after backing the
 * existing registry up.
 */

import { existsSync, readFileSync, writeFileSync, copyFileSync, mkdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, isAbsolute, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const PLUGIN_ROOT = resolve(HERE, '..', '..', '..');
const MANIFEST = join(PLUGIN_ROOT, 'plugin.json');

const SCOUT_HOME = process.env.ALEX_ACT_ONE_SCOUT_HOME || join(homedir(), '.scout');
const REGISTRY = join(SCOUT_HOME, 'm-mcp-servers.json');

const args = process.argv.slice(2);
const APPLY = args.includes('--apply');
const FORCE = args.includes('--force');
const JSON_OUT = args.includes('--json');

function fail(message, code = 1) {
    if (JSON_OUT) console.log(JSON.stringify({ ok: false, error: message }, null, 2));
    else console.error(message);
    process.exit(code);
}

if (!existsSync(MANIFEST)) fail(`Cannot find plugin.json at ${MANIFEST}`);

let manifestServers;
try {
    manifestServers = JSON.parse(readFileSync(MANIFEST, 'utf8')).mcpServers || {};
} catch (error) {
    fail(`plugin.json is not readable as JSON: ${error.message}`);
}

if (!Object.keys(manifestServers).length) fail('plugin.json declares no mcpServers.');

if (!existsSync(SCOUT_HOME)) {
    const msg = `Microsoft Scout does not appear to be installed (${SCOUT_HOME} not found). Nothing to register.`;
    if (JSON_OUT) console.log(JSON.stringify({ ok: true, skipped: 'scout-not-installed', path: SCOUT_HOME }, null, 2));
    else console.log(msg);
    process.exit(0);
}

/**
 * Absolute-ise a manifest arg. Only the script path needs it; flags such as
 * --headless and values such as msedge must survive untouched, so anything that
 * does not look like a package-relative path is passed through.
 */
function resolveArg(arg) {
    if (typeof arg !== 'string') return arg;
    if (arg.startsWith('-')) return arg;
    if (isAbsolute(arg)) return arg;
    if (!/[\\/]/.test(arg)) return arg;
    return join(PLUGIN_ROOT, arg);
}

/**
 * `${env:NAME}` is VS Code manifest syntax. Scout stores the registry as literal
 * JSON and never expands it, so a placeholder written verbatim reaches the
 * server as the eight characters of its own name. Expand here instead, and
 * report the variable as missing when it has no value — a server registered
 * without its credential fails at call time with an opaque auth error, which is
 * a worse outcome than not registering it.
 */
function expandEnv(envSpec) {
    const resolved = {};
    const missing = [];
    for (const [key, raw] of Object.entries(envSpec)) {
        const value = String(raw).replace(/\$\{env:([A-Za-z_][A-Za-z0-9_]*)\}/g, (_, name) => process.env[name] ?? '');
        if (!value) missing.push(String(raw).match(/\$\{env:([A-Za-z_][A-Za-z0-9_]*)\}/)?.[1] || key);
        else resolved[key] = value;
    }
    return { resolved, missing };
}

function toScoutEntry(name, spec) {
    const entry = {
        builtin: false,
        config: {
            name,
            type: 'command',
            command: spec.command,
            args: (spec.args || []).map(resolveArg),
        },
        // Scout populates this by handshaking the server on startup. An empty
        // array is the correct initial state; inventing tool names here would
        // advertise capabilities that may not exist.
        tools: [],
    };
    if (spec.env) {
        const { resolved } = expandEnv(spec.env);
        if (Object.keys(resolved).length) entry.config.env = resolved;
    }
    return entry;
}

let registry = { servers: {} };
if (existsSync(REGISTRY)) {
    try {
        const parsed = JSON.parse(readFileSync(REGISTRY, 'utf8'));
        registry = parsed && typeof parsed === 'object' ? parsed : registry;
        if (!registry.servers || typeof registry.servers !== 'object') registry.servers = {};
    } catch (error) {
        fail(`Scout registry exists but is not valid JSON: ${REGISTRY}\n${error.message}\nRefusing to overwrite it.`);
    }
}

const existing = registry.servers;
const plan = [];

for (const [name, spec] of Object.entries(manifestServers)) {
    if (spec.env) {
        const { missing } = expandEnv(spec.env);
        if (missing.length) {
            plan.push({ name, action: 'skip', reason: `${missing.join(', ')} not set in this environment` });
            continue;
        }
    }
    const current = existing[name];
    if (!current) {
        plan.push({ name, action: 'add', entry: toScoutEntry(name, spec) });
        continue;
    }
    if (current.builtin) {
        plan.push({ name, action: 'skip', reason: 'Scout ships a built-in server under this name' });
        continue;
    }
    const next = toScoutEntry(name, spec);
    const same = JSON.stringify(current.config || {}) === JSON.stringify(next.config);
    if (same) plan.push({ name, action: 'unchanged' });
    else if (FORCE) plan.push({ name, action: 'update', entry: next });
    else plan.push({ name, action: 'conflict', reason: 'already registered with a different config; use --force to replace' });
}

const changes = plan.filter((p) => p.action === 'add' || p.action === 'update');

if (JSON_OUT) {
    console.log(JSON.stringify({ ok: true, registry: REGISTRY, applied: APPLY && changes.length > 0, plan }, null, 2));
} else {
    console.log(`Scout MCP registration\n`);
    console.log(`  plugin root : ${PLUGIN_ROOT}`);
    console.log(`  registry    : ${REGISTRY}\n`);
    for (const p of plan) {
        const note = p.reason ? `  (${p.reason})` : '';
        console.log(`  ${p.action.padEnd(10)} ${p.name}${note}`);
    }
    console.log('');
}

if (!changes.length) {
    if (!JSON_OUT) console.log('Nothing to change.');
    process.exit(0);
}

if (!APPLY) {
    if (!JSON_OUT) {
        console.log('This was a preview. Nothing was written.');
        console.log('Re-run with --apply to write, then fully restart Scout so it');
        console.log('handshakes the new servers and populates their tool lists.');
    }
    process.exit(0);
}

if (existsSync(REGISTRY)) {
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backup = `${REGISTRY}.bak-alex-act-one-${stamp}`;
    copyFileSync(REGISTRY, backup);
    if (!JSON_OUT) console.log(`Backed up existing registry to:\n  ${backup}\n`);
} else {
    mkdirSync(dirname(REGISTRY), { recursive: true });
}

for (const change of changes) existing[change.name] = change.entry;
registry.servers = existing;
writeFileSync(REGISTRY, `${JSON.stringify(registry, null, 2)}\n`, 'utf8');

if (!JSON_OUT) {
    console.log(`Wrote ${changes.length} server(s) to the Scout registry.`);
    console.log('Restart Scout completely — not just a new conversation — so it');
    console.log('starts the servers and discovers their tools.');
}
