import { spawn, execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, isAbsolute, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import runtime from './shared/runtime-status.cjs';
import deps from './shared/dependencies.cjs';
import tools from './shared/tool-runner.cjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const RUNTIME_TESTS = new Set(['installed-runtime.test.mjs', 'flint-runtime.test.mjs', 'conversion-runtime.test.cjs']);
export const PANDOC_VERSION = '3.13';

export function laneSelection(root, lane, platform = process.platform) {
    if (!['structural', 'integration'].includes(lane)) throw new Error(`Unknown test lane: ${lane}`);
    const files = [], excluded = [];
    for (const name of readdirSync(join(root, 'tests')).filter(name => /\.test\.(?:cjs|mjs)$/.test(name)).sort()) {
        const file = join(root, 'tests', name);
        if (RUNTIME_TESTS.has(name) !== (lane === 'integration')) {
            excluded.push({ file, reason: RUNTIME_TESTS.has(name) ? 'Provisioned integration lane' : 'Structural lane' });
        } else if (name === 'tool-shims.test.cjs' && platform !== 'win32') {
            excluded.push({ file, reason: 'Actual Windows npm shim layouts are exercised on Windows' });
        } else files.push(file);
    }
    if (!files.length) throw new Error(`Empty ${lane} lane`);
    return { files, excluded };
}

export function verifyTap(tap, exitCode) {
    const result = {};
    for (const field of ['tests', 'pass', 'fail', 'cancelled', 'skipped', 'todo']) {
        const matches = [...tap.matchAll(new RegExp(`^# ${field} (\\d+)[ \\t]*\\r?$`, 'gm'))];
        if (matches.length !== 1) throw new Error(`Missing or ambiguous TAP summary: ${field}`);
        const value = Number(matches[0][1]);
        if (!Number.isSafeInteger(value)) throw new Error(`Invalid TAP total: ${field}`);
        result[field] = value;
    }
    if (exitCode !== 0 || result.fail || result.cancelled) throw new Error(`Test process failed: exit=${exitCode}, failed=${result.fail}, cancelled=${result.cancelled}`);
    if (result.skipped || result.todo) throw new Error(`Required lane has skipped=${result.skipped}, todo=${result.todo}`);
    if (!result.tests) throw new Error('Empty test run');
    if (result.pass !== result.tests) throw new Error('Inconsistent TAP totals');
    return result;
}

export function runTests(files, { cwd = ROOT, env = process.env, output = text => process.stdout.write(text) } = {}) {
    return new Promise((resolve, reject) => {
        const testEnv = { ...env };
        // A fresh test CLI must not inherit the parent's binary worker protocol.
        delete testEnv.NODE_TEST_CONTEXT;
        const child = spawn(process.execPath, ['--test', '--test-reporter=tap', '--test-concurrency=2', ...files], {
            cwd, env: testEnv, stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true, timeout: 600000,
        });
        let tap = '';
        child.stdout.on('data', data => { tap += data.toString(); output(data.toString()); });
        child.stderr.on('data', data => output(data.toString()));
        child.on('error', reject);
        child.on('close', code => {
            try { resolve(verifyTap(tap, code)); } catch (error) { reject(error); }
        });
    });
}

function command(command, args) {
    return tools.runTool(command, args, { encoding: 'utf8', timeout: 30000 }).trim();
}

function structuralPrerequisites() {
    command('git', ['--version']);
    command('pwsh', ['-NoProfile', '-Command', '$PSVersionTable.PSVersion.ToString()']);
    if (process.platform === 'win32') command('powershell', ['-NoProfile', '-Command', '$PSVersionTable.PSVersion.ToString()']);
    console.log(execFileSync(process.execPath, [join(ROOT, 'scripts', 'update-docs.mjs'), '--check'],
        { encoding: 'utf8', timeout: 30000 }).trim());
    const report = JSON.parse(execFileSync(process.execPath, [join(ROOT, 'scripts', 'assess-brain.cjs'), '--root', ROOT],
        { encoding: 'utf8', timeout: 30000 }));
    if (!report.immutability.preserved || report.findings.some(finding => finding.severity === 'error')) {
        throw new Error(`Structural assessment failed: ${JSON.stringify(report.findings)}`);
    }
    console.log(`Structural assessment: ${report.findings.length} findings; assessed bytes preserved.`);
}

function integrationPrerequisites() {
    const root = process.env.ALEX_ACT_ONE_RUNTIME_ROOT;
    if (!root || !isAbsolute(root)) throw new Error('Required runtime must be explicitly selected with an absolute ALEX_ACT_ONE_RUNTIME_ROOT');
    for (const route of Object.keys(deps.MCP_SERVERS)) {
        const state = runtime.checkRuntime(route, root);
        if (!state.present) throw new Error(`Required runtime ${route} is not ready: ${state.errors.join('; ')}`);
        console.log(`${route}: exact versions and launch probe verified; host connection not observed.`);
    }
    const zip = join(root, 'node_modules', 'jszip', 'package.json');
    if (!existsSync(zip) || JSON.parse(readFileSync(zip, 'utf8')).version !== deps.TOOLS.jszip.version) {
        throw new Error(`Required converter package jszip@${deps.TOOLS.jszip.version} is missing or mismatched`);
    }
    const pandoc = command('pandoc', ['--version']).split(/\r?\n/)[0];
    if (pandoc !== `pandoc ${PANDOC_VERSION}`) throw new Error(`Required pandoc ${PANDOC_VERSION}; found ${pandoc}`);
    console.log(`Converter prerequisites: ${pandoc}; jszip ${deps.TOOLS.jszip.version}.`);
}

async function main() {
    const args = process.argv.slice(2);
    if (args.length !== 2 || args[0] !== '--lane') throw new Error('Usage: node scripts\\verification-gate.mjs --lane structural|integration');
    if (Number(process.versions.node.split('.')[0]) < 24) throw new Error('The verification gate requires Node 24 or newer');
    const lane = args[1];
    const selection = laneSelection(ROOT, lane);
    console.log(`Environment: ${process.platform}/${process.arch}, Node ${process.versions.node}; lane=${lane}`);
    for (const exclusion of selection.excluded) console.log(`Excluded ${exclusion.file}: ${exclusion.reason}`);
    if (lane === 'structural') structuralPrerequisites();
    else integrationPrerequisites();
    const scratch = lane === 'structural' ? mkdtempSync(join(tmpdir(), 'one structural-gate-')) : null;
    try {
        const env = scratch ? {
            ...process.env, ALEX_ACT_ONE_RUNTIME_ROOT: join(scratch, 'absent-runtime'),
            COPILOT_HOME: join(scratch, 'profile'), HOME: scratch, USERPROFILE: scratch,
        } : process.env;
        const summary = await runTests(selection.files, { env });
        console.log(`Verified ${lane} lane: ${summary.pass} passed; no skips, todos, or cancellations.`);
    } finally {
        if (scratch) rmSync(scratch, { recursive: true, force: true });
    }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    main().catch(error => { console.error(`FAIL: ${error.message}`); process.exitCode = 1; });
}
