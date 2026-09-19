import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const READINESS = join(ROOT, 'skills', 'bootstrap-core', 'scripts', 'host-readiness.cjs');

function files(root) {
    if (!readdirSync(root, { withFileTypes: true })) return [];
    return readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
        const file = join(root, entry.name);
        return entry.isDirectory()
            ? files(file)
            : [[relative(root, file), readFileSync(file).toString('base64')]];
    }).sort(([a], [b]) => a.localeCompare(b));
}

function fixture(t, { scoutInstalled = false } = {}) {
    const root = mkdtempSync(join(tmpdir(), 'alex-act-readiness-'));
    const instructions = join(root, 'instructions');
    const scoutHome = join(root, 'scout');
    mkdirSync(instructions);
    if (scoutInstalled) {
        mkdirSync(scoutHome);
        writeFileSync(join(scoutHome, 'm-mcp-servers.json'), '{"servers":{}}\n');
    }
    t.after(() => rmSync(root, { recursive: true, force: true }));
    return { instructions, scoutHome };
}

function run(args, env = {}) {
    const result = spawnSync(process.execPath, [READINESS, ...args], {
        encoding: 'utf8',
        timeout: 30000,
        env: { ...process.env, ...env },
    });
    assert.ifError(result.error);
    return { ...result, output: result.stdout + result.stderr };
}

test('rejects an unknown host without writing', (t) => {
    const { instructions } = fixture(t);
    const before = files(instructions);
    const result = run(['--host', 'unknown-host', '--json', '--target-instructions', instructions]);

    assert.notEqual(result.status, 0, result.output);
    assert.match(result.output, /unknown host/i);
    assert.deepEqual(files(instructions), before);
});

test('reports a no-write Copilot CLI instruction preview', (t) => {
    const { instructions } = fixture(t);
    const before = files(instructions);
    const result = run(['--host', 'copilot-cli', '--json', '--target-instructions', instructions]);

    assert.equal(result.status, 0, result.output);
    const report = JSON.parse(result.stdout);
    assert.equal(report.host, 'copilot-cli');
    assert.equal(report.writeMode, 'preview');
    assert.equal(report.instructionActivation.targetInstructions, instructions);
    assert.equal(report.instructionActivation.observedByHost, false);
    assert.equal(report.discovery.state, 'not-applicable');
    assert.deepEqual(files(instructions), before);
});

test('reports Scout discovery, registry preview, and restart separately', (t) => {
    const { instructions, scoutHome } = fixture(t, { scoutInstalled: true });
    const beforeInstructions = files(instructions);
    const beforeScout = files(scoutHome);
    const result = run([
        '--host', 'scout', '--json', '--target-instructions', instructions,
        '--scout-home', scoutHome,
    ]);

    assert.equal(result.status, 0, result.output);
    const report = JSON.parse(result.stdout);
    assert.equal(report.discovery.state, 'manual-required');
    assert.match(report.discovery.action, /Load Copilot CLI skills/);
    assert.equal(report.mcpRegistration.mode, 'preview');
    assert.equal(report.restart.state, 'required');
    assert.equal(report.instructionActivation.observedByHost, false);
    assert.deepEqual(files(instructions), beforeInstructions);
    assert.deepEqual(files(scoutHome), beforeScout);
});

test('reports an absent Scout registry without pretending activation succeeded', (t) => {
    const { instructions, scoutHome } = fixture(t);
    const result = run([
        '--host', 'scout', '--json', '--target-instructions', instructions,
        '--scout-home', scoutHome,
    ]);

    assert.equal(result.status, 0, result.output);
    const report = JSON.parse(result.stdout);
    assert.equal(report.mcpRegistration.state, 'scout-not-installed');
    assert.equal(report.instructionActivation.observedByHost, false);
});