import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, mkdtempSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const script = join(ROOT, 'skills', 'bootstrap-core', 'scripts', 'bootstrap-core.cjs');
const bootstrap = require(script);
const name = 'alex-act-act-pass.instructions.md';
const receiptName = '.alex-act-one-bootstrap.json';
const hash = value => createHash('sha256').update(value).digest('hex');
function fixture(t) {
    const root = mkdtempSync(join(tmpdir(), 'one-activation-conflict-'));
    const target = join(root, 'instructions');
    mkdirSync(target);
    t.after(() => rmSync(root, { recursive: true, force: true }));
    return target;
}
function run(target, ...args) {
    return spawnSync(process.execPath, [script, '--target-instructions', target, ...args],
        { encoding: 'utf8', timeout: 10000 });
}
function apply(target) {
    const result = run(target, '--apply');
    assert.equal(result.status, 0, result.stderr);
    return JSON.parse(result.stdout);
}
const snapshot = target => readdirSync(target).sort().map(file => [file, readFileSync(join(target, file), 'base64')]);

test('foreign instruction blocks the whole activation and does not create other files or a receipt', (t) => {
    const target = fixture(t);
    writeFileSync(join(target, name), '# Synthetic custom instruction\n');
    const before = snapshot(target);
    const preview = run(target);
    assert.equal(preview.status, 0, preview.stderr);
    const plan = JSON.parse(preview.stdout);
    assert.equal(plan.blocked, true);
    assert.equal(plan.conflicts.find(file => file.name === name).reason, 'unowned');
    assert.deepEqual(snapshot(target), before);
    const blocked = run(target, '--apply');
    assert.notEqual(blocked.status, 0);
    assert.match(blocked.stderr, /conflict|blocked/i);
    assert.deepEqual(snapshot(target), before);
});

test('modified owned instructions and their receipt are preserved on blocked apply', (t) => {
    const target = fixture(t);
    apply(target);
    writeFileSync(join(target, name), '# Synthetic user customization\n');
    const before = snapshot(target);
    const plan = JSON.parse(run(target).stdout);
    assert.equal(plan.conflicts.find(file => file.name === name).reason, 'modified-owned');
    assert.notEqual(run(target, '--apply').status, 0);
    assert.deepEqual(snapshot(target), before);
});

test('explicit conflict overwrite has a read-only preview and then verifies canonical bytes', (t) => {
    const target = fixture(t);
    writeFileSync(join(target, name), '# Approved fixture replacement\n');
    const before = snapshot(target);
    const preview = run(target, '--overwrite-conflicts');
    assert.equal(preview.status, 0, preview.stderr);
    const plan = JSON.parse(preview.stdout);
    assert.equal(plan.blocked, false);
    assert.equal(plan.overwriteConflicts, true);
    assert.equal(plan.conflicts.length, 1);
    assert.deepEqual(snapshot(target), before);
    const result = run(target, '--overwrite-conflicts', '--apply');
    assert.equal(result.status, 0, result.stderr);
    assert.equal(JSON.parse(result.stdout).verification.receiptCurrent, true);
    assert.equal(readFileSync(join(target, name), 'utf8'),
        readFileSync(join(ROOT, 'instructions', 'act-pass.instructions.md'), 'utf8'));
    assert.equal(JSON.parse(run(target).stdout).receipt.action, 'preserve');
});

test('an unchanged receipt-owned older instruction upgrades without an overwrite flag', (t) => {
    const target = fixture(t);
    apply(target);
    const old = '# Synthetic prior canonical version\n';
    writeFileSync(join(target, name), old);
    const receiptPath = join(target, receiptName);
    const receipt = JSON.parse(readFileSync(receiptPath, 'utf8'));
    receipt.files.find(file => file.name === name).sha256 = hash(old);
    receipt.coreVersion = '0.0.0-fixture';
    writeFileSync(receiptPath, JSON.stringify(receipt));
    const preview = JSON.parse(run(target).stdout);
    assert.equal(preview.blocked, false);
    assert.deepEqual(preview.conflicts, []);
    assert.equal(preview.files.find(file => file.name === name).action, 'replace');
    apply(target);
});

test('receipt migration cannot claim mixed or foreign ownership, even with overwrite enabled', (t) => {
    const target = fixture(t);
    apply(target);
    const receiptPath = join(target, receiptName);
    const receipt = JSON.parse(readFileSync(receiptPath, 'utf8'));
    receipt.files[0].owner = 'foreign-fixture';
    writeFileSync(receiptPath, JSON.stringify(receipt));
    const before = snapshot(target);
    const result = run(target, '--apply', '--overwrite-conflicts');
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /receipt|unowned/i);
    assert.deepEqual(snapshot(target), before);
});

test('a late destination change invalidates an in-memory plan before any writes', (t) => {
    const target = fixture(t);
    const options = bootstrap.parseArgs(['--target-instructions', target, '--apply']);
    const plan = bootstrap.buildPlan(options);
    writeFileSync(join(target, name), '# Concurrent fixture owner\n');
    const before = snapshot(target);
    assert.throws(() => bootstrap.applyPlan(plan, options), /changed|conflict|stale/i);
    assert.deepEqual(snapshot(target), before);
    assert.equal(existsSync(join(target, receiptName)), false);
});

test('overwrite policy does not bypass removal ownership rules', (t) => {
    const target = fixture(t);
    const result = run(target, '--remove', '--overwrite-conflicts', '--apply');
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /overwrite-conflicts.*remov|remov.*overwrite-conflicts/i);
    assert.deepEqual(snapshot(target), []);
});

test('a failed apply does not claim incomplete ownership and can be explicitly recovered', (t) => {
    const target = fixture(t);
    const options = bootstrap.parseArgs(['--target-instructions', target, '--apply']);
    const plan = bootstrap.buildPlan(options);
    const fs = require('node:fs');
    const rename = fs.renameSync;
    let writes = 0;
    fs.renameSync = (...args) => {
        if (++writes === 2) throw new Error('fixture rename failure');
        return rename(...args);
    };
    try {
        assert.throws(() => bootstrap.applyPlan(plan, options), /fixture rename failure/);
    } finally {
        fs.renameSync = rename;
    }
    assert.equal(existsSync(join(target, receiptName)), false);
    assert.equal(readdirSync(target).some(file => file.includes('.tmp-')), false);
    assert.notEqual(run(target, '--apply').status, 0, 'A partial write is not proof of receipt ownership');
    const recovered = run(target, '--overwrite-conflicts', '--apply');
    assert.equal(recovered.status, 0, recovered.stderr);
    assert.equal(JSON.parse(recovered.stdout).verification.receiptCurrent, true);
});

test('host readiness reports activation conflicts as blocked rather than ready to apply', (t) => {
    const target = fixture(t);
    writeFileSync(join(target, name), '# Synthetic foreign instruction\n');
    const result = spawnSync(process.execPath, [
        join(ROOT, 'skills', 'bootstrap-core', 'scripts', 'host-readiness.cjs'),
        '--host', 'copilot-cli', '--json', '--target-instructions', target,
    ], { encoding: 'utf8', timeout: 10000 });
    assert.equal(result.status, 0, result.stderr);
    const report = JSON.parse(result.stdout);
    assert.equal(report.instructionActivation.state, 'blocked');
    assert.equal(report.instructionActivation.conflicts[0].reason, 'unowned');
    assert.match(report.nextActions[0], /conflict/i);
});

test('foreign ownership in a retired receipt entry cannot bypass activation or removal validation', (t) => {
    const target = fixture(t);
    apply(target);
    const receiptPath = join(target, receiptName);
    const receipt = JSON.parse(readFileSync(receiptPath, 'utf8'));
    const retired = 'alex-act-retired.instructions.md';
    const custom = '# Foreign retired fixture\n';
    writeFileSync(join(target, retired), custom);
    receipt.files.push({ name: retired, owner: 'foreign-fixture',
        sourceRelativePath: 'instructions/retired.instructions.md', sha256: hash(custom) });
    writeFileSync(receiptPath, JSON.stringify(receipt));
    const before = snapshot(target);
    for (const flags of [['--apply', '--overwrite-conflicts'], ['--remove', '--apply']]) {
        const result = run(target, ...flags);
        assert.notEqual(result.status, 0);
        assert.match(result.stderr, /receipt.*unowned|unowned.*receipt/i);
        assert.deepEqual(snapshot(target), before);
    }
});

for (const legacy of [false, true]) test(`upgrading preserves retired ownership for later removal: legacy=${legacy}`, (t) => {
    const target = fixture(t);
    apply(target);
    const receiptPath = join(target, receiptName);
    const receipt = JSON.parse(readFileSync(receiptPath, 'utf8'));
    const retired = 'alex-act-retired.instructions.md';
    const old = '# Retired canonical fixture\n';
    writeFileSync(join(target, retired), old);
    receipt.files.push({ name: retired, owner: 'alex-act-one',
        sourceRelativePath: 'instructions/retired.instructions.md', sha256: hash(old) });
    if (legacy) {
        receipt.bootstrappedBy = 'alex-act-core';
        for (const entry of receipt.files) {
            entry.owner = 'alex-act-core';
            entry.sourceRelativePath = entry.sourceRelativePath.replace(/^instructions\//, '.github/instructions/');
        }
    }
    writeFileSync(receiptPath, JSON.stringify(receipt));
    apply(target);
    assert.ok(JSON.parse(readFileSync(receiptPath, 'utf8')).files.some(file => file.name === retired));
    assert.equal(JSON.parse(run(target).stdout).receipt.action, 'preserve');
    const removed = run(target, '--remove', '--apply');
    assert.equal(removed.status, 0, removed.stderr);
    assert.equal(existsSync(join(target, retired)), false);
});
