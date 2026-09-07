#!/usr/bin/env node
// @ts-check
'use strict';

/**
 * Reports which of this plugin's optional dependencies are present, what each
 * missing one costs, and how to install it. With --apply, installs the ones
 * that can be installed non-interactively (npm packages) and prints the exact
 * command for the ones that need a system package manager.
 *
 * Reads the same registry `tool-runner.cjs` uses for its error messages, so the
 * remedy a user is shown when a conversion fails is the remedy this script
 * offers. Two lists would drift, and a wrong remedy is worse than none.
 *
 * Usage:
 *   node check-dependencies.cjs            preview
 *   node check-dependencies.cjs --apply    install what can be automated
 *   node check-dependencies.cjs --json     machine-readable
 */

const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { TOOLS, MCP_SERVERS, PLUGINS, platformKey } = require('../../../scripts/shared/dependencies.cjs');

const APPLY = process.argv.includes('--apply');
const JSON_OUT = process.argv.includes('--json');
const PLATFORM_LABEL = { win32: 'Windows', darwin: 'macOS', linux: 'Linux' }[platformKey()];

const MCP_RUNTIME = path.join(os.homedir(), '.copilot', 'plugin-data', 'alex-act-one', 'runtime');

function onPath(bin) {
    const probe = process.platform === 'win32'
        ? spawnSync('where.exe', [bin], { encoding: 'utf8' })
        : spawnSync('which', [bin], { encoding: 'utf8' });
    return probe.status === 0 && Boolean(probe.stdout && probe.stdout.trim());
}

function moduleResolvable(name) {
    try { require.resolve(name); return true; } catch { /* fall through */ }
    // Also check the plugin-data runtime, which is where --apply installs local
    // modules and where the consuming skills look for them.
    try { require.resolve(path.join(MCP_RUNTIME, 'node_modules', name)); return true; } catch { return false; }
}

function pythonModulePresent(name) {
    for (const py of ['python', 'python3']) {
        const probe = spawnSync(py, ['-c', `import ${name}`], { stdio: 'ignore' });
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
        rows.push({ key, label: tool.label, kind: tool.kind, tier: tool.tier, present, unlocks: tool.unlocks, install: tool.install[platformKey()] });
    }
    return rows;
}

function detectMcp() {
    const rows = [];
    for (const [key, srv] of Object.entries(MCP_SERVERS)) {
        // The package name may contain a scope, which is a real subdirectory.
        const dir = path.join(MCP_RUNTIME, 'node_modules', ...srv.package.split('/'));
        rows.push({ key, ...srv, present: fs.existsSync(dir) });
    }
    return { servers: rows, root: MCP_RUNTIME, allPresent: rows.every((r) => r.present) };
}

// Resolve the executable rather than passing shell:true with arguments,
// which triggers Node DEP0190 and concatenates args unescaped.
function resolveCopilotBin() {
    if (process.platform !== 'win32') return 'copilot';
    const which = spawnSync('where.exe', ['copilot'], { encoding: 'utf8' });
    if (which.status !== 0 || !which.stdout) return null;
    const candidates = which.stdout.split(/\r?\n/).filter(Boolean).map((l) => l.trim());
    return candidates.find((c) => /\.(cmd|exe|bat)$/i.test(c)) || candidates[0];
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
function detectPlugins() {
    const bin = resolveCopilotBin();
    const stores = [];
    const installed = new Set();
    if (!bin) return { stores, available: false, installed };

    let anyRead = false;
    for (const store of candidateStores()) {
        const probe = spawnSync(bin, ['plugin', 'list'], {
            encoding: 'utf8',
            env: { ...process.env, COPILOT_HOME: store },
        });
        if (probe.status !== 0 || !probe.stdout) {
            stores.push({ path: store, available: false, count: 0 });
            continue;
        }
        anyRead = true;
        let count = 0;
        for (const line of probe.stdout.split(/\r?\n/)) {
            const m = line.match(/^\s*[•*-]\s*([a-z0-9-]+)/i);
            if (m) {
                installed.add(m[1].toLowerCase());
                count += 1;
            }
        }
        stores.push({ path: store, available: true, count });
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
// while Playwright has a fallback and Replicate needs a paid account.
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
    console.log(`      provisions all three servers together: ${missingMcp.map((s) => s.label).join(', ')} missing`);
}

if (!APPLY) {
    console.log('\nPreview only. Nothing was installed or changed.');
    console.log('Re-run with --apply to install the package-manager items automatically.');
    console.log('System packages still need their own command above, which cannot run without your consent.');
    process.exit(0);
}

// --apply installs only what npm can do without a system package manager.
// Installing a system package silently is a surprise change to the machine,
// so those stay a printed command the user chooses to run.
//
// Local modules go into the plugin-data runtime, the same place the MCP
// servers live. A bare `npm install` would land in whatever directory the user
// happened to invoke from, which the consuming skill then cannot find — an
// install that does not fix the problem is worse than no install.
let installed = 0;
let failed = 0;
for (const r of missingTools.filter((x) => x.kind !== 'system')) {
    console.log(`\ninstalling: ${r.label}`);
    let cmd = 'npm';
    let args;
    if (r.kind === 'npm-global') args = ['install', '-g', r.install.split(' ').pop()];
    else if (r.kind === 'python-module') { cmd = 'pip'; args = ['install', r.key]; }
    else args = ['install', '--prefix', MCP_RUNTIME, '--no-audit', '--no-fund', r.key];
    const res = spawnSync(cmd, args, { stdio: 'inherit', shell: process.platform === 'win32' });
    if (res.status === 0) installed += 1;
    else { failed += 1; console.error(`FAILED: ${r.label}`); }
}

const systemLeft = missingTools.filter((x) => x.kind === 'system');
console.log(`\ninstalled: ${installed}   failed: ${failed}   needs your package manager: ${systemLeft.length}`);
for (const r of systemLeft) console.log(`  ${r.install}`);
if (missingMcp.length) console.log(`  node <this-skill>/scripts/provision-runtime.mjs --apply`);
process.exit(failed > 0 ? 1 : 0);
