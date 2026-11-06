import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const script = join(ROOT, 'skills', 'bootstrap-project', 'scripts', 'bootstrap-project.cjs');
const require = createRequire(import.meta.url);
const bootstrap = require(script);

function fixture(t) {
    const root = mkdtempSync(join(ROOT, '.test-bootstrap-project-'));
    t.after(() => rmSync(root, { recursive: true, force: true }));
    return root;
}

function snapshot(root) {
    return readdirSync(root, { recursive: true, withFileTypes: true })
        .filter(entry => entry.isFile())
        .map(entry => {
            const file = join(entry.parentPath, entry.name);
            return [file.slice(root.length), readFileSync(file, 'base64')];
        }).sort(([a], [b]) => a.localeCompare(b));
}

function run(root, ...args) {
    return spawnSync(process.execPath, [script, '--repository-root', root, ...args],
        { encoding: 'utf8', timeout: 10000 });
}

test('legacy AGENT.md-only bootstrap blocks pending explicit migration without any writes', (t) => {
    const root = fixture(t);
    writeFileSync(join(root, 'AGENT.md'), '# Existing legacy authority\n');
    writeFileSync(join(root, '.gitignore'), '.vscode/\n');
    mkdirSync(join(root, '.vscode'));
    writeFileSync(join(root, '.vscode', 'settings.json'), '{"editor.fontSize":17}\n');
    const before = snapshot(root);
    const preview = run(root);
    assert.equal(preview.status, 0, preview.stderr);
    const plan = JSON.parse(preview.stdout);
    assert.equal(plan.classification, 'legacy-singular');
    assert.equal(plan.blocked, true);
    assert.deepEqual(snapshot(root), before);
    const result = run(root, '--apply');
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /legacy-singular|migration/i);
    assert.equal(existsSync(join(root, 'AGENTS.md')), false);
    assert.deepEqual(snapshot(root), before);
});

for (const divergent of [false, true]) {
    test(`existing paired guidance preserves bytes and blocks only divergent sources: ${divergent}`, (t) => {
        const root = fixture(t);
        writeFileSync(join(root, 'AGENT.md'), '# Existing project authority\n');
        writeFileSync(join(root, 'AGENTS.md'), divergent ? '# Different authority\n' : '# Existing project authority\n');
        const before = snapshot(root);
        const result = run(root, '--apply');
        if (divergent) {
            assert.notEqual(result.status, 0);
            assert.deepEqual(snapshot(root), before);
        } else {
            assert.equal(result.status, 0, result.stderr);
            assert.equal(readFileSync(join(root, 'AGENT.md'), 'utf8'), '# Existing project authority\n');
            assert.equal(readFileSync(join(root, 'AGENTS.md'), 'utf8'), '# Existing project authority\n');
        }
    });
}

test('normal project scaffolds verify unblocked and are byte-idempotent with project values preserved', (t) => {
    const root = fixture(t);
    mkdirSync(join(root, '.vscode'));
    writeFileSync(join(root, '.vscode', 'settings.json'), '{"editor.fontSize":17}\n');
    writeFileSync(join(root, 'HANDOFF.md'), '# Project-owned handoff\n');
    const result = run(root, '--apply');
    assert.equal(result.status, 0, result.stderr);
    const plan = JSON.parse(result.stdout);
    assert.equal(plan.verification.blocked, false);
    assert.equal(plan.verification.pendingCreates, 0);
    assert.equal(plan.verification.pendingSettingsChanges, 0);
    assert.equal(JSON.parse(readFileSync(join(root, '.vscode', 'settings.json'), 'utf8'))['editor.fontSize'], 17);
    assert.equal(readFileSync(join(root, 'HANDOFF.md'), 'utf8'), '# Project-owned handoff\n');
    const before = snapshot(root);
    const preview = JSON.parse(run(root).stdout);
    assert.equal(preview.blocked, false);
    assert.deepEqual(preview.creates, []);
    assert.equal(preview.settings.action, 'preserve');
    assert.equal(preview.gitignore.action, 'preserve');
    const again = run(root, '--apply');
    assert.equal(again.status, 0, again.stderr);
    assert.deepEqual(snapshot(root), before);
});

test('postapply refuses a newly conflicting guidance source rather than reporting success', (t) => {
    const root = fixture(t);
    const options = bootstrap.parseArgs(['--repository-root', root, '--apply']);
    const plan = bootstrap.buildPlan(options);
    const fs = require('node:fs');
    const rename = fs.renameSync;
    fs.renameSync = (...args) => {
        const result = rename(...args);
        if (args[1] === join(root, 'AGENTS.md')) {
            writeFileSync(join(root, 'AGENT.md'), '# Concurrent legacy authority\n');
        }
        return result;
    };
    try {
        assert.throws(() => bootstrap.applyPlan(plan), /verif|blocked|conflict/i);
    } finally {
        fs.renameSync = rename;
    }
    assert.equal(readFileSync(join(root, 'AGENT.md'), 'utf8'), '# Concurrent legacy authority\n');
});
