#!/usr/bin/env node
'use strict';

const { spawnSync } = require('node:child_process');
const path = require('node:path');

const CORE_ROOT = path.resolve(__dirname, '..', '..', '..');
const BOOTSTRAP = path.join(__dirname, 'bootstrap-core.cjs');
const SCOUT_REGISTRAR = path.join(CORE_ROOT, 'skills', 'setup-dependencies', 'scripts', 'register-scout-mcp.mjs');
const HOSTS = new Set(['copilot-cli', 'vscode', 'github-copilot-app', 'scout']);

function parseArgs(args) {
    const options = {
        host: null,
        json: false,
        targetInstructions: null,
        scoutHome: null,
    };
    for (let index = 0; index < args.length; index++) {
        const argument = args[index];
        if (argument === '--json') options.json = true;
        else if (argument === '--host' || argument === '--target-instructions' || argument === '--scout-home') {
            if (!args[index + 1] || args[index + 1].startsWith('--')) {
                throw new Error(`${argument} requires a value`);
            }
            const key = {
                '--host': 'host',
                '--target-instructions': 'targetInstructions',
                '--scout-home': 'scoutHome',
            }[argument];
            options[key] = args[++index];
        } else throw new Error(`unknown argument: ${argument}`);
    }
    if (!options.host) throw new Error('--host is required');
    if (!HOSTS.has(options.host)) throw new Error(`unknown host: ${options.host}`);
    return options;
}

function runJson(script, args, env = process.env) {
    const result = spawnSync(process.execPath, [script, ...args], {
        encoding: 'utf8',
        timeout: 60000,
        env,
    });
    if (result.error) throw new Error(`failed to launch ${path.basename(script)}: ${result.error.message}`);
    if (result.status !== 0) {
        const detail = (result.stderr || result.stdout || '').trim();
        throw new Error(`${path.basename(script)} failed${detail ? `: ${detail}` : ''}`);
    }
    try {
        return JSON.parse(result.stdout);
    } catch (error) {
        throw new Error(`${path.basename(script)} returned invalid JSON: ${error.message}`);
    }
}

function bootstrapPreview(options) {
    const args = [];
    if (options.targetInstructions) args.push('--target-instructions', options.targetInstructions);
    return runJson(BOOTSTRAP, args);
}

function instructionState(plan) {
    const current = plan.files.every((file) => file.action === 'preserve')
        && plan.receipt.action === 'preserve';
    return {
        state: current ? 'current' : 'ready-to-apply',
        targetInstructions: plan.targetInstructions,
        targetSource: plan.targetSource,
        expectedFiles: plan.expectedFiles,
        receiptAction: plan.receipt.action,
        fileActions: plan.files.map(({ name, action }) => ({ name, action })),
        observedByHost: false,
    };
}

function scoutRegistration(options) {
    const env = { ...process.env };
    if (options.scoutHome) env.ALEX_ACT_ONE_SCOUT_HOME = path.resolve(options.scoutHome);
    const preview = runJson(SCOUT_REGISTRAR, ['--json'], env);
    if (preview.skipped === 'scout-not-installed') {
        return { state: 'scout-not-installed', mode: 'preview', preview };
    }
    return { state: 'preview-available', mode: 'preview', preview };
}

function buildReport(options) {
    const bootstrap = bootstrapPreview(options);
    const report = {
        schemaVersion: 1,
        host: options.host,
        writeMode: 'preview',
        instructionActivation: instructionState(bootstrap),
        discovery: { state: 'not-applicable' },
        mcpRegistration: { state: 'manifest-managed', observedByHost: false },
        restart: { state: 'host-observation-required' },
        nextActions: [
            'Review the bootstrap preview, then run bootstrap-core --apply separately after consent.',
            'Reopen the selected host and verify an expected instruction or skill manually.',
        ],
    };

    if (options.host === 'scout') {
        report.discovery = {
            state: 'manual-required',
            action: 'Enable Load Copilot CLI skills in Scout settings.',
        };
        report.mcpRegistration = scoutRegistration(options);
        report.restart = report.mcpRegistration.state === 'scout-not-installed'
            ? { state: 'not-applicable' }
            : {
                state: 'required',
                action: 'Fully quit and restart Scout so it handshakes MCP servers and discovers tools.',
            };
        report.nextActions = [
            'Enable Load Copilot CLI skills in Scout settings.',
            'Review bootstrap-core and Scout MCP registration previews, then apply each separately after consent.',
            'Fully quit and restart Scout, then verify a named skill and expected MCP tool.',
        ];
    }
    return report;
}

function printHuman(report) {
    console.log(`Host activation readiness: ${report.host}`);
    console.log(`  instruction target : ${report.instructionActivation.targetInstructions}`);
    console.log(`  instruction state  : ${report.instructionActivation.state}`);
    console.log(`  discovery          : ${report.discovery.state}`);
    console.log(`  MCP registration   : ${report.mcpRegistration.state}`);
    console.log(`  restart            : ${report.restart.state}`);
    console.log('\nNext actions:');
    for (const action of report.nextActions) console.log(`  - ${action}`);
    console.log('\nThis report is a preview. It does not write host profiles or prove host observation.');
}

function main() {
    try {
        const options = parseArgs(process.argv.slice(2));
        const report = buildReport(options);
        if (options.json) console.log(JSON.stringify(report, null, 2));
        else printHuman(report);
    } catch (error) {
        console.error(`ERROR: ${error.message}`);
        process.exitCode = 1;
    }
}

if (require.main === module) main();

module.exports = { buildReport, parseArgs };