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

const { TOOLS, platformKey } = require('../../../scripts/shared/dependencies.cjs');

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
        rows.push({ key, label: tool.label, kind: tool.kind, required: tool.required, present, unlocks: tool.unlocks, install: tool.install[platformKey()] });
    }
    return rows;
}

function detectMcp() {
    const missing = MCP_PACKAGES.filter((p) => !fs.existsSync(path.join(MCP_RUNTIME, 'node_modules', p)));
    return { provisioned: missing.length === 0, missing, root: MCP_RUNTIME };
}

const rows = detect();
const mcp = detectMcp();

if (JSON_OUT) {
    console.log(JSON.stringify({ platform: platformKey(), tools: rows, mcp }, null, 2));
    process.exit(0);
}

console.log(`Dependency check  (${PLATFORM_LABEL})\n`);
console.log('Most of this plugin needs nothing beyond Node. These are the extras.\n');

const pad = Math.max(...rows.map((r) => r.label.length)) + 2;
for (const r of rows) {
    const mark = r.present ? 'ok     ' : (r.required ? 'MISSING' : 'absent ');
    console.log(`  ${mark} ${r.label.padEnd(pad)} ${r.present ? '' : r.unlocks}`);
}
console.log(`  ${mcp.provisioned ? 'ok     ' : 'absent '} ${'MCP servers'.padEnd(pad)} ${mcp.provisioned ? '' : 'charts, image generation, and browser verification'}`);

const missingTools = rows.filter((r) => !r.present);
if (missingTools.length === 0 && mcp.provisioned) {
    console.log('\nEverything is present. No action needed.');
    process.exit(0);
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
