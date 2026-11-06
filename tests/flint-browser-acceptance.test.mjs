import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

async function api() {
    assert.ok(existsSync(new URL('../scripts/flint-browser-acceptance.mjs', import.meta.url)), 'Missing reusable browser acceptance harness');
    return import('../scripts/flint-browser-acceptance.mjs');
}

test('contrast measurement matches known endpoints and rejects unsupported colors', async () => {
    const { contrastRatio } = await api();
    assert.equal(contrastRatio([0, 0, 0], [255, 255, 255]), 21);
    assert.equal(contrastRatio([70, 80, 90], [70, 80, 90]), 1);
    assert.throws(() => contrastRatio([NaN, 0, 0], [0, 0, 0]), /color/i);
    assert.throws(() => contrastRatio([256, 0, 0], [0, 0, 0]), /color/i);
    assert.throws(() => contrastRatio([0, 0], [0, 0, 0]), /color/i);
});

test('a saved spec must equal the selected semantic starting input, not merely parse as JSON', async () => {
    const { validateDownloadedSpec } = await api();
    const expected = { chart: { data: { values: [{ team: 'A', value: 0 }] } } };
    assert.doesNotThrow(() => validateDownloadedSpec(JSON.stringify(expected), expected));
    assert.throws(() => validateDownloadedSpec('not JSON', expected));
    assert.throws(() => validateDownloadedSpec('{"chart":{}}', expected));
    assert.throws(() => validateDownloadedSpec('{"ok":true}', expected));
});

test('browser summary cannot pass with a missing, duplicated, failed, or blocked required check', async () => {
    const { requiredChecks, summarizeAcceptance } = await api();
    const checks = requiredChecks.map(id => ({ id, status: 'passed', details: 'fixture' }));
    assert.equal(summarizeAcceptance(checks).passed, true);
    for (const status of ['failed', 'blocked']) {
        assert.equal(summarizeAcceptance([{ ...checks[0], status }, ...checks.slice(1)]).passed, false);
    }
    assert.throws(() => summarizeAcceptance(checks.slice(1)), /missing/i);
    assert.throws(() => summarizeAcceptance([...checks, checks[0]]), /duplicate/i);
    assert.throws(() => summarizeAcceptance([{ ...checks[0], status: 'skipped' }, ...checks.slice(1)]), /status/i);
});

test('the actual CLI executes and rejects invalid input before resolving optional browser dependencies', async () => {
    await api();
    const script = fileURLToPath(new URL('../scripts/flint-browser-acceptance.mjs', import.meta.url));
    const result = spawnSync(process.execPath, [script, '--invalid', 'fixture'], { encoding: 'utf8', timeout: 10000 });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /Unknown option: --invalid/);
});

test('iframe settling compares current dimensions rather than waiting for a stale pre-scrollbar width', async () => {
    const { waitForFrameViewport } = await api();
    assert.equal(typeof waitForFrameViewport, 'function');
    let reads = 0;
    const page = {
        locator: () => ({ evaluate: async () => [1198, 1183, 1183][Math.min(reads++, 2)] }),
        waitForTimeout: async () => {},
    };
    const frame = { evaluate: async () => 1183 };
    assert.equal(await waitForFrameViewport(page, frame), 1183);
    assert.equal(reads, 3, 'Require repeated exact agreement with the current parent after its width changes');
    await assert.rejects(waitForFrameViewport(page, { evaluate: async () => NaN }), /viewport/i);
});
