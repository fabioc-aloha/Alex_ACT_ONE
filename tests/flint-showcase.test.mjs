import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Script } from 'node:vm';
import { test } from 'node:test';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = join(ROOT, 'docs', 'flint-showcase.html');

function document() {
    assert.ok(existsSync(output), 'Missing the requested offline Flint showcase');
    return readFileSync(output, 'utf8');
}

function dataBlock(html, id) {
    const block = html.match(new RegExp(`<script type="application/json" id="${id}">([\\s\\S]*?)</script>`));
    assert.ok(block, `Missing ${id}`);
    return JSON.parse(block[1]);
}

test('showcase is a self-contained HTML document with explicit offline and synthetic-data boundaries', () => {
    const html = document();
    assert.match(html, /^<!doctype html>/i);
    assert.match(html, /<html lang="en">/);
    assert.match(html, /name="viewport"/);
    assert.match(html, /synthetic/i);
    assert.match(html, /offline/i);
    assert.match(html, /connect-src 'none'/);
    assert.doesNotMatch(html, /<(?:script|link|img|iframe)\b[^>]*\b(?:src|href)=["']https?:/i);
    assert.doesNotMatch(html, /C:\\\\Users|C:\/Users|api[_-]?key|replicate_api_token/i);
    assert.ok(Buffer.byteLength(html) < 8 * 1024 * 1024, 'Avoid unbounded generated asset growth');
    assert.equal(html.includes('\r'), false, 'Generated files must be LF-only, including embedded license notices');
    assert.equal(/[ \t]+$/m.test(html), false, 'Embedded notices must not introduce trailing whitespace');
});

test('showcase embeds the actual pinned App UI and preserves third-party notices', () => {
    const html = document();
    const runtime = dataBlock(html, 'flint-runtime');
    const gallery = dataBlock(html, 'showcase-data');
    assert.equal(gallery.version, '1.0.1');
    assert.match(runtime, /ui\/initialize/);
    assert.match(runtime, /ontoolresult/);
    assert.match(runtime, /<div id="root">/);
    assert.ok(runtime.length > 1000000, 'A substitute renderer is not the pinned Flint App');
    assert.match(html, /Third-party notices/);
    assert.match(html, /Permission is hereby granted/);
    assert.match(html, /MIT License|MIT license/);
    assert.match(html, /sandbox="allow-scripts"/);
});

test('samples cover chart families, semantic types, gestures, themes, state updates, and links', () => {
    const data = dataBlock(document(), 'showcase-data');
    const samples = data.samples;
    assert.ok(samples.length >= 8);
    assert.equal(new Set(samples.map(sample => sample.id)).size, samples.length);
    for (const id of ['comparison', 'trend', 'composition', 'relationship', 'distribution', 'heatmap', 'updates', 'linked']) {
        assert.ok(samples.some(sample => sample.id === id), id);
    }
    for (const sample of samples) {
        assert.ok(sample.title && sample.description && sample.tryIt);
        assert.ok(sample.input.chart || sample.input.board);
        assert.match(sample.preview, /^<svg/);
        for (const theme of data.themes) {
            const result = sample.results[theme.id];
            assert.ok(result && !result.isError);
            const board = result.structuredContent?.flint?.board || result._meta?.flint?.board;
            assert.equal(board?.id, `showcase-${sample.id}-${theme.id}`);
        }
    }
    assert.ok(samples.some(sample => sample.input.chart?.updates?.length));
    assert.ok(samples.some(sample => sample.input.board?.link_spec?.fields.length));
    assert.ok(samples.some(sample => sample.input.chart?.interaction_spec?.interactions.some(item => item.type === 'brush-zoom')));
    assert.ok(samples.some(sample => sample.input.chart?.semantic_types?.month === 'YearMonth'));
});

test('one semantic input is actually rendered by the three supported MCP backends', () => {
    const data = dataBlock(document(), 'showcase-data');
    assert.deepEqual(data.backends.map(item => item.id), ['vegalite', 'echarts', 'chartjs']);
    for (const backend of data.backends) {
        assert.ok(backend.artifact.startsWith(backend.id === 'chartjs' ? 'data:image/png;base64,' : 'data:image/svg+xml;base64,'));
        assert.ok(backend.width > 0 && backend.height > 0);
        if (backend.id !== 'chartjs') {
            const svg = Buffer.from(backend.artifact.split(',')[1], 'base64').toString('utf8');
            assert.match(svg, /^<svg\b[\s\S]*<\/svg>\s*$/, `${backend.id} image contains report text outside the XML root`);
        }
    }
    for (const sample of data.samples) {
        assert.match(sample.preview, /^<svg\b[\s\S]*<\/svg>\s*$/, `${sample.id} preview contains non-SVG report text`);
    }
});

test('legend-toggle examples keep a persistent visible key across editorial themes', () => {
    const data = dataBlock(document(), 'showcase-data');
    for (const sample of data.samples.filter(sample =>
        sample.input.chart?.interaction_spec?.interactions.some(item => item.type === 'legend-toggle'))) {
        for (const theme of data.themes) {
            assert.deepEqual(sample.inputs[theme.id].chart.theme_spec,
                { extends: theme.id, ink: { series: { minContrast: { fill: 3, stroke: 3 } } },
                    geometry: { point: { opacity: 1 } },
                    dataLabels: { minContrast: 4.5 }, legend: { show: 'always', placement: ['top'] } },
                `${sample.id}/${theme.id} must retain a key after a series is hidden`);
        }
    }
});

test('bounded heatmap scores use numeric mapping and readable same-hue ramps', async () => {
    const { createSamples, demoTheme } = await import('../scripts/build-flint-showcase.mjs');
    const { contrastRatio } = await import('../scripts/flint-browser-acceptance.mjs');
    const input = createSamples().find(sample => sample.id === 'heatmap').input.chart;
    assert.equal(input.chart_spec.encodings.color.type, 'quantitative');
    assert.deepEqual(input.semantic_types.workload.intrinsicDomain, [1, 5]);
    for (const id of ['nyt', 'economist', 'swiss']) {
        const theme = demoTheme(id, 'Heatmap');
        assert.equal(theme.ink.series.sequential.space, 'rgb');
        const channels = theme.ink.series.sequential.stops.map(color =>
            [1, 3, 5].map(index => parseInt(color.slice(index, index + 2), 16)));
        assert.ok(channels.every(color => contrastRatio(color, [255, 255, 255]) >= 4.5));
        assert.ok(channels[1].every((channel, index) => channel <= channels[0][index]),
            'RGB interpolation must not introduce a lighter interior stop');
    }
    assert.throws(() => demoTheme('unreviewed', 'Heatmap'), /reviewed/);
});

test('the offline host bridge restricts messages and does not pretend to run a backend', () => {
    const html = document();
    const source = html.match(/<script id="showcase-script">([\s\S]*?)<\/script>/)?.[1];
    assert.ok(source);
    assert.doesNotThrow(() => new Script(source));
    assert.match(source, /event\.source !== frame\.contentWindow/);
    assert.match(source, /ui\/initialize/);
    assert.match(source, /ui\/notifications\/tool-result/);
    assert.match(source, /ui\/update-model-context/);
    assert.match(source, /unsupported|not available/i);
    assert.doesNotMatch(source, /\bfetch\s*\(|XMLHttpRequest|new WebSocket/);
    for (const id of ['sample-select', 'theme-select', 'reset-example', 'live-status', 'spec-output', 'state-output']) {
        assert.ok(html.includes(`id="${id}"`), id);
    }
});

test('gallery generation is reproducible and pinned rather than fetching a moving library', () => {
    const source = readFileSync(join(ROOT, 'scripts', 'build-flint-showcase.mjs'), 'utf8');
    assert.match(source, /MCP_SERVERS/);
    assert.match(source, /InMemoryTransport/);
    assert.match(source, /validate_chart/);
    assert.match(source, /validate_board/);
    assert.match(source, /render_chart/);
    assert.match(source, /--check/);
    assert.doesNotMatch(source, /\bnpx\b|\bnpm install\b|\bfetch\s*\(/);
    assert.match(readFileSync(join(ROOT, 'README.md'), 'utf8'), /docs\/flint-showcase\.html/);
});

test('stale artifact diagnostics identify a bounded first difference instead of hiding the cause', async t => {
    const { assertCurrentArtifact } = await import('../scripts/build-flint-showcase.mjs');
    assert.equal(typeof assertCurrentArtifact, 'function');
    const root = mkdtempSync(join(tmpdir(), 'one-artifact-diff-'));
    t.after(() => rmSync(root, { recursive: true, force: true }));
    const file = join(root, 'fixture.html');
    writeFileSync(file, 'same-prefix old value ' + 'x'.repeat(10000));
    assert.throws(() => assertCurrentArtifact(file, 'same-prefix new value ' + 'x'.repeat(10000)), error =>
        /offset 12/.test(error.message) && /old value/.test(error.message) &&
        /new value/.test(error.message) && error.message.length < 1200);
    assert.doesNotThrow(() => assertCurrentArtifact(file, readFileSync(file, 'utf8')));
});
