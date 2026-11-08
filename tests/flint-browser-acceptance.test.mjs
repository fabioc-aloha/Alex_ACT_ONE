import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { Script } from 'node:vm';

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

test('chart contrast uses the actual backdrop, opacity, and text-size threshold', async () => {
    const { measureChartContrast } = await api();
    const text = { kind: 'text', foreground: 'rgb(119,119,119)', background: 'rgb(255,255,255)',
        canvas: 'rgb(255,255,255)', backgroundOpacity: 1, opacity: 1, fontSize: 12, fontWeight: 400 };
    assert.equal(measureChartContrast(text).passed, false);
    assert.equal(measureChartContrast({ ...text, fontSize: 24 }).required, 3);
    assert.equal(measureChartContrast({ ...text, fontSize: 19, fontWeight: 700 }).passed, true);
    assert.equal(measureChartContrast({ ...text, fontSize: 19 }).passed, false);
    const label = { ...text, foreground: 'rgb(255,255,255)', background: 'rgb(0,0,0)' };
    assert.equal(measureChartContrast(label).ratio, 21);
    assert.equal(measureChartContrast({ ...label, backgroundOpacity: 0 }).ratio, 1);
    const mark = { ...text, kind: 'mark', foreground: 'rgb(0,0,0)', opacity: 0.5 };
    const measured = measureChartContrast(mark);
    assert.equal(measured.required, 3);
    assert.ok(Math.abs(measured.ratio - 3.976653024912438) < 0.000001);
    assert.equal(measured.passed, true);
    const outlined = measureChartContrast({ ...mark, foreground: 'rgb(230,230,230)', opacity: 1,
        stroke: 'rgb(0,0,0)', strokeWidth: 1, strokeOpacity: 1 });
    assert.ok(outlined.fillRatio < 3);
    assert.equal(outlined.strokeRatio, 21);
    assert.equal(outlined.passed, true, 'A visible contrasting outline identifies a faint filled mark');
    assert.equal(measureChartContrast({ ...mark, foreground: 'rgb(230,230,230)', opacity: 1,
        stroke: 'rgb(0,0,0)', strokeWidth: 0, strokeOpacity: 1 }).passed, false);
});

test('chart contrast rejects unsupported paints and invalid measurements explicitly', async () => {
    const { measureChartContrast } = await api();
    const sample = { kind: 'mark', foreground: 'rgb(0,0,0)', background: 'rgb(255,255,255)',
        canvas: 'rgb(255,255,255)', backgroundOpacity: 1, opacity: 1 };
    for (const foreground of ['url(#gradient)', 'none', 'rgb(-1,0,0)', 'rgba(0,0,0,2)']) {
        assert.throws(() => measureChartContrast({ ...sample, foreground }), /color|paint/i);
    }
    for (const opacity of [NaN, -1, 2]) {
        assert.throws(() => measureChartContrast({ ...sample, opacity }), /opacity/i);
    }
    assert.throws(() => measureChartContrast({ ...sample, kind: 'axis' }), /kind/i);
    assert.throws(() => measureChartContrast({ ...sample, kind: 'text', fontSize: NaN, fontWeight: 400 }), /font/i);
});

test('SVG sampling resolves labels against painted marks, ignoring transparent overlays', async () => {
    const { collectChartContrastSamples } = await api();
    const baseStyle = { opacity: '1', fillOpacity: '1', strokeOpacity: '1', stroke: 'none',
        strokeWidth: '0px', fontSize: '12px', fontWeight: '700', backgroundColor: 'rgba(0, 0, 0, 0)' };
    const chart = { getAttribute: () => 'fixture-chart' };
    const svg = { parentElement: null, style: { ...baseStyle, backgroundColor: 'rgb(255,255,255)' },
        closest: () => chart, matches: () => false };
    const node = (tagName, fill, extra = {}) => ({
        tagName, textContent: tagName === 'text' ? '120' : '', parentElement: svg,
        style: { ...baseStyle, fill, ...extra },
        getBoundingClientRect: () => ({ x: 10, y: 10, width: 40, height: 20 }),
        getAttribute: () => 'team: A; revenue: 120', closest: () => svg,
        matches: () => tagName === 'path',
    });
    const label = node('text', 'rgb(255,255,255)');
    const hidden = node('path', 'rgb(0,0,0)', { opacity: '0' });
    const mark = node('path', 'rgb(47,107,154)');
    svg.querySelectorAll = selector => selector === 'text' ? [label] : [mark];
    const collect = new Script('(' + String(collectChartContrastSamples) + ')').runInNewContext({
        document: { querySelectorAll: () => [svg], elementsFromPoint: () => [label, hidden, mark, svg] },
        getComputedStyle: element => element.style, innerWidth: 500, innerHeight: 500,
    });
    const samples = collect();
    assert.equal(samples[0].background, 'rgb(47,107,154)');
    assert.equal(samples[1].background, 'rgb(255,255,255)');
    assert.equal(samples[0].backgroundOpacity, 1);
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
        locator: () => ({ scrollIntoViewIfNeeded: async () => {},
            evaluate: async () => [1198, 1183, 1183][Math.min(reads++, 2)] }),
        waitForTimeout: async () => {},
    };
    const frame = { evaluate: async () => 1183 };
    assert.equal(await waitForFrameViewport(page, frame), 1183);
    assert.equal(reads, 3, 'Require repeated exact agreement with the current parent after its width changes');
    await assert.rejects(waitForFrameViewport(page, { evaluate: async () => NaN }), /viewport/i);
});

test('iframe settling brings the resized viewer onscreen before measuring frame-timed behavior', async () => {
    const { waitForFrameViewport } = await api();
    let visible = false;
    const page = {
        locator: () => ({
            scrollIntoViewIfNeeded: async () => { visible = true; },
            evaluate: async () => {
                assert.equal(visible, true, 'An offscreen cross-origin iframe can have suspended resize work');
                return 320;
            },
        }),
        waitForTimeout: async () => {},
    };
    assert.equal(await waitForFrameViewport(page, { evaluate: async () => 320 }), 320);
});

test('resize settling cannot accept stale fitting plots before the pinned renderer debounce', async () => {
    const { waitForChartLayout } = await api();
    let predicate;
    await waitForChartLayout({ waitForFunction: async fn => { predicate = fn; } });
    let time = 0;
    const bounds = { x: 20, y: 0, left: 20, right: 494, width: 474, height: 395 };
    const clip = { left: 20, right: 660 };
    const parent = { parentElement: null, getBoundingClientRect: () => clip };
    const svg = { parentElement: parent, getBoundingClientRect: () => bounds };
    const stable = new Script('(' + String(predicate) + ')').runInNewContext({
        document: { querySelectorAll: () => [svg] },
        getComputedStyle: () => ({ overflowX: 'hidden' }),
        innerWidth: 680, performance: { now: () => time },
    });
    assert.equal(stable(), false);
    time = 100;
    assert.equal(stable(), false, 'Two polls are earlier than Flint 1.0.1 relayout debounce (150 ms)');
    time = 200;
    Object.assign(bounds, { right: 660, width: 640 });
    assert.equal(stable(), false);
    time = 400;
    assert.equal(stable(), false);
    time = 500;
    assert.equal(stable(), true);
    clip.right = 300;
    time = 900;
    assert.equal(stable(), false, 'Stable clipping must never pass');
    clip.right = 660;
    bounds.right = 661;
    time = 1000;
    assert.equal(stable(), false);
    time = 1300;
    assert.equal(stable(), true, 'Keep the existing one-pixel clipping tolerance');
    bounds.right = 661.01;
    time = 1400;
    assert.equal(stable(), false);
    time = 1700;
    assert.equal(stable(), false, 'Overflow beyond one pixel must fail even when settled');
});
