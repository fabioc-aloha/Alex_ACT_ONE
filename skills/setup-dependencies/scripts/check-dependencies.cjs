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

const { TOOLS, PLUGINS, platformKey } = require('../../../scripts/shared/dependencies.cjs');

const APPLY = process.argv.includes('--apply');
const JSON_OUT = process.argv.includes('--json');
const PLATFORM_LABEL = { win32: 'Windows', darwin: 'macOS', linux: 'Linux' }[platformKey()];

const MCP_RUNTIME = path.join(os.homedir(), '.copilot', 'plugin-data', 'alex-act-one', 'runtime');
const MCP_PACKAGES = ['flint-chart-mcp', 'replicate-mcp', path.join('@playwright', 'mcp')];

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
    const missing = MCP_PACKAGES.filter((p) => !fs.existsSync(path.join(MCP_RUNTIME, 'node_modules', p)));
    return { provisioned: missing.length === 0, missing, root: MCP_RUNTIME };
}

/**
 * Plugin visibility depends on which store the host points at: `copilot plugin
 * list` reads COPILOT_HOME when set, otherwise ~/.copilot. Different apps set
 * different stores, so the store is reported alongside the result. Without it a
 * reader cannot tell "not installed" from "installed somewhere else".
 */
function detectPlugins() {
    const store = process.env.COPILOT_HOME || path.join(os.homedir(), '.copilot');
    // Resolve the executable rather than passing shell:true with arguments,
    // which triggers Node DEP0190 and concatenates args unescaped.
    let bin = 'copilot';
    if (process.platform === 'win32') {
        const which = spawnSync('where.exe', ['copilot'], { encoding: 'utf8' });
        if (which.status !== 0 || !which.stdout) return { store, available: false, installed: new Set() };
        const candidates = which.stdout.split(/\r?\n/).filter(Boolean).map((l) => l.trim());
        bin = candidates.find((c) => /\.(cmd|exe|bat)$/i.test(c)) || candidates[0];
    }
    const probe = spawnSync(bin, ['plugin', 'list'], { encoding: 'utf8' });
    if (probe.status !== 0 || !probe.stdout) {
        return { store, available: false, installed: new Set() };
    }
    const installed = new Set();
    for (const line of probe.stdout.split(/\r?\n/)) {
        const m = line.match(/^\s*[•*-]\s*([a-z0-9-]+)/i);
        if (m) installed.add(m[1].toLowerCase());
    }
    return { store, available: true, installed };
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
    console.log(JSON.stringify({ platform: platformKey(), tools: rows, mcp, plugins: { store: plugins.store, detected: plugins.available, groups: pluginReport } }, null, 2));
    process.exit(0);
}

console.log(`Dependency check  (${PLATFORM_LABEL})\n`);
console.log('Nothing below is needed to use this package. Most of it runs on Node');
console.log('alone. Each item is required, or not, for the specific skills that\ncall it.\n');

const pad = Math.max(...rows.map((r) => r.label.length), 'MCP servers'.length) + 2;

// Grouped by tier so the difference is visible in the report, not just encoded
// in the data. A flat list makes a missing Pandoc look like a missing jszip,
// and those cost very different things.
const required = rows.filter((r) => r.tier === 'required');
const enhances = rows.filter((r) => r.tier === 'enhances');

console.log('REQUIRED for the skills that use them');
console.log('  Without these, those skills cannot run.\n');
for (const r of required) {
    console.log(`  ${r.present ? 'ok     ' : 'MISSING'} ${r.label.padEnd(pad)} ${r.present ? '' : r.unlocks}`);
}
console.log(`  ${mcp.provisioned ? 'ok     ' : 'MISSING'} ${'MCP servers'.padEnd(pad)} ${mcp.provisioned ? '' : 'charts, image generation, and browser verification'}`);

console.log('\nRECOMMENDED enhancements');
console.log('  The skills work without these and produce less.\n');
for (const r of enhances) {
    console.log(`  ${r.present ? 'ok     ' : 'absent '} ${r.label.padEnd(pad)} ${r.present ? '' : r.unlocks}`);
}

const missingTools = rows.filter((r) => !r.present);

console.log('\nADD-ONS (separate plugins)');
console.log('  These block nothing. They add capability this package does not have.\n');
for (const group of Object.values(PLUGINS)) {
    const have = group.entries.filter((e) => plugins.installed.has(e.name.toLowerCase())).length;
    console.log(`  ${String(have).padStart(2)}/${group.entries.length}     ${group.label}`);
    console.log(`         adds: ${group.adds}`);
    console.log(`         install via: /alex-act-one ${group.owner}`);
}
if (!plugins.available) {
    console.log('\n  Could not read the plugin list, so the counts above may be wrong.');
} else {
    console.log(`\n  Plugin store read: ${plugins.store}`);
    console.log('  Apps can point at different stores, so a plugin installed for one');
    console.log('  app may not appear here.');
}

const missingRequired = required.filter((r) => !r.present).length + (mcp.provisioned ? 0 : 1);
if (missingTools.length === 0 && mcp.provisioned) {
    console.log('\nEverything is present. No action needed.');
    process.exit(0);
}
if (missingRequired === 0) {
    console.log('\nNothing required is missing. The items below are enhancements.');
}

console.log('\nTo install what is missing:\n');
for (const r of missingTools) console.log(`  ${r.install}`);
if (!mcp.provisioned) {
    console.log(`  node <this-skill>/scripts/provision-runtime.mjs --apply`);
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
if (!mcp.provisioned) console.log(`  node <this-skill>/scripts/provision-runtime.mjs --apply`);
process.exit(failed > 0 ? 1 : 0);
