import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';
import { Script } from 'node:vm';
import deps from '../scripts/shared/dependencies.cjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const script = join(ROOT, 'scripts', 'verification-gate.mjs');
async function api() {
    assert.ok(existsSync(script), 'Missing the enforceable CI test gate');
    assert.equal(existsSync(join(ROOT, 'scripts', 'test-gate.mjs')), false,
        'A production entrypoint named test-* is automatically executed by node --test');
    return import(pathToFileURL(script));
}
const tap = ({ tests = 1, passed = 1, failed = 0, skipped = 0, todo = 0, cancelled = 0 } = {}) =>
    `TAP version 13\n1..${tests}\n# tests ${tests}\n# pass ${passed}\n# fail ${failed}\n# cancelled ${cancelled}\n# skipped ${skipped}\n# todo ${todo}\n`;

test('gate rejects failures, skipped/todo/cancelled tests, empty runs, and absent or inconsistent totals', async () => {
    const { verifyTap } = await api();
    assert.equal(verifyTap(tap(), 0).tests, 1);
    for (const [output, code] of [
        [tap({ passed: 0, failed: 1 }), 1],
        [tap({ passed: 0, skipped: 1 }), 0],
        [tap({ passed: 0, todo: 1 }), 0],
        [tap({ passed: 0, cancelled: 1 }), 0],
        [tap({ tests: 0, passed: 0 }), 0],
        [tap({ tests: 4 }), 0],
        ['All good', 0],
        [tap(), 2],
    ]) assert.throws(() => verifyTap(output, code), /fail|skip|todo|cancel|empty|total|exit|summary/i);
});
test('lane selection covers every test file and explicitly records platform exclusions', async () => {
    const { laneSelection } = await api();
    const windows = laneSelection(ROOT, 'structural', 'win32');
    const linux = laneSelection(ROOT, 'structural', 'linux');
    const integration = laneSelection(ROOT, 'integration', 'linux');
    assert.ok(windows.files.some(file => file.endsWith('tool-shims.test.cjs')));
    assert.ok(!linux.files.some(file => file.endsWith('tool-shims.test.cjs')));
    assert.ok(linux.excluded.some(item => item.file.endsWith('tool-shims.test.cjs') && /Windows/i.test(item.reason)));
    for (const file of ['installed-runtime.test.mjs', 'flint-runtime.test.mjs', 'conversion-runtime.test.cjs']) {
        assert.ok(integration.files.some(path => path.endsWith(file)));
        assert.ok(!windows.files.some(path => path.endsWith(file)));
    }
    assert.throws(() => laneSelection(ROOT, 'unknown', 'linux'), /lane/i);
    assert.ok(existsSync(join(ROOT, 'tests', 'installed-runtime.test.mjs')));
    assert.doesNotMatch(readFileSync(join(ROOT, 'tests', 'smoke.test.mjs'), 'utf8'), /describe\('provisioned runtime'/);
});
test('the actual gate runner cannot turn a real skipped test into success', async t => {
    const { runTests } = await api();
    const root = mkdtempSync(join(tmpdir(), 'one gate-behavior-'));
    t.after(() => rmSync(root, { recursive: true, force: true }));
    const passing = join(root, 'pass.test.cjs');
    const skipped = join(root, 'skip.test.cjs');
    writeFileSync(passing, "require('node:test')('fixture passes',()=>{});\n");
    writeFileSync(skipped, "require('node:test')('fixture skipped',{skip:'missing required tool'},()=>{});\n");
    const result = await runTests([passing], { cwd: root, output: () => {} });
    assert.equal(result.tests, 1);
    await assert.rejects(runTests([skipped], { cwd: root, output: () => {} }), /skip/i);
});
test('integration gate fails before tests when the selected runtime is not provisioned', async t => {
    await api();
    const root = mkdtempSync(join(tmpdir(), 'one missing-ci-runtime-'));
    t.after(() => rmSync(root, { recursive: true, force: true }));
    const result = spawnSync(process.execPath, [script, '--lane', 'integration'], {
        encoding: 'utf8', timeout: 10000, env: { ...process.env, ALEX_ACT_ONE_RUNTIME_ROOT: root },
    });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /runtime.*not ready|required runtime/i);
    assert.doesNotMatch(result.stdout, /^TAP version/m);
});
test('workflow uses reviewed immutable actions, read-only permissions, direct-main triggers, and both lanes', async () => {
    const path = join(ROOT, '.github', 'workflows', 'verify.yml');
    assert.ok(existsSync(path), 'Missing repository-owned CI workflow');
    const workflow = readFileSync(path, 'utf8');
    assert.match(workflow, /push:/);
    assert.match(workflow, /workflow_dispatch:/);
    assert.doesNotMatch(workflow, /pull_request(?:_target)?:/);
    assert.match(workflow, /contents: read/);
    assert.match(workflow, /windows-2025/);
    assert.match(workflow, /ubuntu-24\.04/);
    assert.match(workflow, /schedule:/);
    assert.match(workflow, /node:.*github\.event_name == 'push'.*\["24"\].*\["24","26"\]/);
    const integration = workflow.split('\n  integration:')[1];
    assert.ok(integration);
    assert.doesNotMatch(integration, /needs: structural/);
    assert.match(integration, /cache: npm/);
    assert.match(integration, /cache-dependency-path: ci\/runtime\/package-lock\.json/);
    assert.match(workflow, /group:.*github\.event_name/);
    for (const action of workflow.matchAll(/uses: ([^\s]+)@([^\s]+)/g)) assert.match(action[2], /^[a-f0-9]{40}$/);
    assert.match(workflow, /--lane structural/);
    assert.match(workflow, /--lane integration/);
    assert.match(workflow, /RUNNER_TEMP/);
    assert.doesNotMatch(workflow, /registry-url:|allow-remote|pull_request_target/);
});

test('pushes use both OSes on the minimum Node while manual and scheduled runs retain full release coverage', () => {
    const workflow = readFileSync(join(ROOT, '.github', 'workflows', 'verify.yml'), 'utf8');
    const expression = workflow.match(/^\s+node: \$\{\{ (.+) \}\}$/m)?.[1];
    assert.ok(expression, 'Missing explicit event-based compatibility matrix');
    for (const [event, expected] of [
        ['push', ['24']], ['workflow_dispatch', ['24', '26']], ['schedule', ['24', '26']],
    ]) {
        const nodes = new Script(expression).runInNewContext({ github: { event_name: event }, fromJSON: JSON.parse });
        assert.deepEqual([...nodes], expected, event);
    }
    assert.match(workflow, /cancel-in-progress: \$\{\{ github.event_name == 'push' \}\}/);
});
test('Word optional-module loading honors an explicitly provisioned CI runtime', async t => {
    const root = mkdtempSync(join(tmpdir(), 'one-ci-jszip-'));
    t.after(() => rmSync(root, { recursive: true, force: true }));
    const runtime = join(root, 'runtime');
    const jszip = join(runtime, 'node_modules', 'jszip');
    mkdirSync(jszip, { recursive: true });
    writeFileSync(join(jszip, 'package.json'), JSON.stringify({ name: 'jszip', version: deps.TOOLS.jszip.version, main: 'index.cjs' }));
    writeFileSync(join(jszip, 'index.cjs'), 'module.exports = class FixtureZip {};\n');
    const source = join(ROOT, 'skills', 'md-to-word', 'scripts', 'md-to-word.cjs');
    const result = spawnSync(process.execPath, ['-e', `require(${JSON.stringify(source)});console.log('loaded');`], {
        cwd: root, encoding: 'utf8', timeout: 10000,
        env: { ...process.env, ALEX_ACT_ONE_RUNTIME_ROOT: runtime, NODE_PATH: '', USERPROFILE: root, HOME: root },
    });
    assert.equal(result.status, 0, result.stderr);
    assert.doesNotMatch(result.stderr, /jszip not found/);
});

test('generated offline pages retain LF endings on Windows checkouts for reproducible builds', () => {
    const result = spawnSync('git', ['check-attr', 'eol', '--', 'docs/flint-showcase.html', 'docs/flint-experimental.html'],
        { cwd: ROOT, encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr);
    assert.ok(result.stdout.trim().split(/\r?\n/).every(line => line.endsWith(': lf')));
});
