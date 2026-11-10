#!/usr/bin/env node
// @ts-check
'use strict';

/**
 * Reports which of this plugin's optional dependencies are present, what each
 * missing one costs, and how to install it. This checker is read-only;
 * the unified root helper and MCP provisioner own consented installation.
 *
 * Reads the same registry `tool-runner.cjs` uses for its error messages, so the
 * remedy a user is shown when a conversion fails is the remedy this script
 * offers. Two lists would drift, and a wrong remedy is worse than none.
 *
 * Usage:
 *   node check-dependencies.cjs            inspect
 *   node check-dependencies.cjs --json     machine-readable
 */

const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { TOOLS, MCP_SERVERS, PLUGINS, platformKey, specOf, installMap } = require('../../../scripts/shared/dependencies.cjs');
const { runtimeRoot, checkRuntime } = require('../../../scripts/shared/runtime-status.cjs');
const { resolveInvocation } = require('../../../scripts/shared/process-command.cjs');

const JSON_OUT = process.argv.includes('--json');
const PLATFORM_LABEL = { win32: 'Windows', darwin: 'macOS', linux: 'Linux' }[platformKey()];
let selectedRuntime;
for (let index = 2; index < process.argv.length; index++) {
    const arg = process.argv[index];
    if (arg === '--runtime-root') {
        selectedRuntime = process.argv[++index];
        if (!selectedRuntime || selectedRuntime.startsWith('--')) throw new Error('--runtime-root requires a path');
    } else if (arg === '--apply') {
        throw new Error('check-dependencies.cjs is read-only. Use install-and-check.ps1 -Apply for consented setup, or provision-runtime.mjs --apply for MCP-only provisioning.');
    } else if (arg !== '--json') throw new Error(`Unknown argument: ${arg}`);
}
const MCP_RUNTIME = runtimeRoot(selectedRuntime);

function onPath(bin) {
    const probe = process.platform === 'win32'
        ? spawnSync('where.exe', [bin], { encoding: 'utf8', timeout: 5000 })
        : spawnSync('which', [bin], { encoding: 'utf8', timeout: 5000 });
    return probe.status === 0 && Boolean(probe.stdout && probe.stdout.trim());
}

function moduleResolvable(name) {
    try { require.resolve(name); return true; } catch { /* fall through */ }
    // Also check the plugin-data runtime, where the setup helper installs local
    // modules and where the consuming skills look for them.
    try { require.resolve(path.join(MCP_RUNTIME, 'node_modules', name)); return true; } catch { return false; }
}

function pythonModulePresent(name) {
    for (const py of ['python', 'python3']) {
        const probe = spawnSync(py, ['-B', '-c', `import ${name}`], { stdio: 'ignore', timeout: 5000 });
        if (probe.status === 0) return true;
    }
    return false;
}

function detect() {
    const rows = [];
    for (const [key, tool] of Object.entries(TOOLS)) {
        let present;
        if (tool.kind === 'npm-module') present = moduleResolvable(key);
        else if (tool.kind === 'python-module') present = pythonModulePresent(tool.importName || key);
        else present = onPath(key);
        rows.push({ key, label: tool.label, kind: tool.kind, tier: tool.tier, present, unlocks: tool.unlocks, install: installMap(tool)[platformKey()], spec: specOf(tool) });
    }
    return rows;
}

function detectMcp() {
    const rows = [];
    for (const key of Object.keys(MCP_SERVERS)) {
        rows.push(checkRuntime(key, MCP_RUNTIME));
    }
    return { servers: rows, root: MCP_RUNTIME, allPresent: rows.every((r) => r.present) };
}

function candidateStores() {
    const seen = new Set();
    const out = [];
    for (const p of [process.env.COPILOT_HOME, path.join(os.homedir(), '.copilot')]) {
        if (!p) continue;
        const abs = path.resolve(p);
        const key = process.platform === 'win32' ? abs.toLowerCase() : abs;
        if (seen.has(key)) continue;
        seen.add(key);
        out.push(abs);
    }
    return out;
}

/**
 * Plugin visibility is store-dependent: `copilot plugin list` reads COPILOT_HOME
 * when set, otherwise ~/.copilot. Hosts disagree about which store they load
 * from. Scout sets COPILOT_HOME to its own directory while still loading plugins
 * installed under ~/.copilot, so reading only the COPILOT_HOME store reports
 * zero plugins on a machine that has them all.
 *
 * Every candidate store is therefore read and the results unioned. Per-store
 * counts are reported so "not installed anywhere" stays distinguishable from
 * "installed in the store this host does not point at".
 */
/**
 * `copilot plugin list` reports only the CLI's own `installed-plugins/` layout.
 * Scout installs through a marketplace instead and keeps its packages under
 * `cache/marketplaces/`, which that command does not look at — so a store
 * holding a full set of Scout plugins reports zero. Counting the marketplace
 * directory as well keeps the per-store line describing what is actually there.
 */
function marketplacePlugins(store) {
    const dir = path.join(store, 'cache', 'marketplaces');
    const names = new Set();
    let entries;
    try {
        entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
        return names;
    }
    for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        // A marketplace folder is a plugin only if it carries a manifest, and the
        // manifest's own `name` is the identity `copilot plugin list` prints.
        // Deriving it from the folder instead would yield `alex_act_one` where
        // the CLI says `alex-act-one`, and the union would count one plugin twice.
        const manifest = path.join(dir, entry.name, 'plugin.json');
        try {
            const name = JSON.parse(fs.readFileSync(manifest, 'utf8')).name;
            if (name) names.add(String(name).toLowerCase());
        } catch {
            // No manifest, or unreadable: not a usable plugin, so not counted.
        }
    }
    return names;
}

function detectPlugins() {
    const stores = [];
    const installed = new Set();

    let anyRead = false;
    for (const store of candidateStores()) {
        const fromMarketplace = marketplacePlugins(store);
        for (const name of fromMarketplace) installed.add(name);

        const options = {
            encoding: 'utf8',
            env: { ...process.env, COPILOT_HOME: store },
            timeout: 15000,
            shell: false,
        };
        let probe;
        try {
            const invocation = resolveInvocation('copilot', ['plugin', 'list'], options);
            probe = spawnSync(invocation.command, invocation.args, options);
        } catch (error) {
            probe = { status: null, error };
        }
        if (probe.status !== 0 || !probe.stdout) {
            const error = probe.error?.message || String(probe.stderr || '').trim() ||
                `Copilot plugin inventory returned exit ${probe.status} with no usable output`;
            stores.push({ path: store, available: fromMarketplace.size > 0, count: fromMarketplace.size, error });
            if (fromMarketplace.size) anyRead = true;
            continue;
        }
        anyRead = true;
        const listed = new Set();
        for (const line of probe.stdout.split(/\r?\n/)) {
            const m = line.match(/^\s*[•*-]\s*([a-z0-9-]+)/i);
            if (m) {
                installed.add(m[1].toLowerCase());
                listed.add(m[1].toLowerCase());
            }
        }
        // Union, not sum: a plugin present in both layouts is one plugin.
        for (const name of fromMarketplace) listed.add(name);
        stores.push({ path: store, available: true, count: listed.size });
    }
    return { stores, available: anyRead, installed };
}

const rows = detect();
const mcp = detectMcp();
const plugins = detectPlugins();

if (JSON_OUT) {
    const pluginReport = {};
    for (const [key, group] of Object.entries(PLUGINS)) {
        pluginReport[key] = {
            label: group.label,
            owner: group.owner,
            entries: group.entries.map((e) => ({ ...e, installed: plugins.installed.has(e.name.toLowerCase()) })),
        };
    }
    console.log(JSON.stringify({ platform: platformKey(), tools: rows, mcp, plugins: { stores: plugins.stores, detected: plugins.available, groups: pluginReport } }, null, 2));
    process.exit(0);
}

console.log(`Dependency check  (${PLATFORM_LABEL})\n`);
console.log('Nothing below is needed to use this package. Most of it runs on Node');
console.log('alone. Each item is required, or not, for the specific skills that\ncall it.\n');

const pad = Math.max(...rows.map((r) => r.label.length), ...mcp.servers.map((s) => s.label.length)) + 2;

// Grouped by tier so the difference is visible in the report, not just encoded
// in the data. A flat list makes a missing Pandoc look like a missing jszip,
// and those cost very different things. MCP servers are merged into the same
// tiers rather than listed as one block, because Flint is required for charts
// while Playwright has a native-browser fallback.
const byTier = (t) => [
    ...rows.filter((r) => r.tier === t),
    ...mcp.servers.filter((s) => s.tier === t),
];

const line = (r, missingMark) => `  ${r.present ? 'ok     ' : missingMark} ${r.label.padEnd(pad)} ${r.present ? '' : r.unlocks}`;

console.log('REQUIRED for the skills that use them');
console.log('  Without these, those skills cannot run.\n');
for (const r of byTier('required')) console.log(line(r, 'MISSING'));

console.log('\nRECOMMENDED enhancements');
console.log('  The skills work without these and produce less.\n');
for (const r of byTier('enhances')) console.log(line(r, 'absent '));
console.log(`\nMCP runtime: ${MCP_RUNTIME}`);
for (const state of mcp.servers) {
    console.log(`  ${state.key}: installed=${state.installed}, versionMatched=${state.versionMatched}, launchable=${state.launchable}; host connection not observed`);
    for (const error of state.errors) console.log(`    ${error}`);
}

const addonTools = byTier('addon');

const missingTools = rows.filter((r) => !r.present);
const missingMcp = mcp.servers.filter((s) => !s.present);

console.log('\nADD-ONS');
console.log('  These block nothing. They add capability the package does not have.\n');
for (const r of addonTools) console.log(line(r, 'absent '));
if (addonTools.length) console.log('');
for (const group of Object.values(PLUGINS)) {
    const have = group.entries.filter((e) => plugins.installed.has(e.name.toLowerCase())).length;
    console.log(`  ${String(have).padStart(2)}/${group.entries.length}     ${group.label}`);
    console.log(`         adds: ${group.adds}`);
    console.log(`         install via: /alex-act-one ${group.owner}`);
}
if (!plugins.available) {
    console.log('\n  Could not read the plugin list, so the counts above may be wrong.');
} else {
    console.log(`\n  Plugin store${plugins.stores.length > 1 ? 's' : ''} read:`);
    for (const s of plugins.stores) {
        const detail = s.available ? `${s.count} plugin${s.count === 1 ? '' : 's'}` : 'unreadable';
        console.log(`    ${s.path}  (${detail})`);
    }
    if (plugins.stores.length > 1) {
        console.log('  Hosts point at different stores, so all are read and combined.');
    }
}
for (const store of plugins.stores) {
    if (store.error) console.error(`  Plugin inventory unavailable at ${store.path}: ${store.error}`);
}

const missingRequired = byTier('required').filter((r) => !r.present).length;
if (missingTools.length === 0 && missingMcp.length === 0) {
    console.log('\nEverything is present. No action needed.');
    process.exit(0);
}
if (missingRequired === 0) {
    console.log('\nNothing required is missing. The items below are enhancements or add-ons.');
}

console.log('\nTo install what is missing:\n');
for (const r of missingTools) console.log(`  ${r.install}`);
if (missingMcp.length) {
    console.log(`  node <this-skill>/scripts/provision-runtime.mjs --apply`);
    console.log(`      provisions ${mcp.servers.length} configured MCP servers: ${missingMcp.map((s) => s.label).join(', ')} missing`);
}

console.log('\nRead-only inspection. Nothing was installed or changed.');
console.log('Use install-and-check.ps1 to report setup status; add -Apply only after reviewing its installation scopes.');
console.log('For MCP-only installation, preview provision-runtime.mjs and explicitly approve --apply.');
