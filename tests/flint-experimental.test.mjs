import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = join(ROOT, 'docs', 'flint-experimental.html');

function document() {
    assert.ok(existsSync(output), 'Keep the editorial gallery and create a separate interaction lab');
    return readFileSync(output, 'utf8');
}

function gallery() {
    const block = document().match(/<script type="application\/json" id="showcase-data">([\s\S]*?)<\/script>/);
    assert.ok(block);
    return JSON.parse(block[1]);
}

test('experimental page is a distinct offline lab, not a replacement for the editorial gallery', () => {
    const html = document();
    assert.ok(existsSync(join(ROOT, 'docs', 'flint-showcase.html')));
    assert.match(html, /data-mode="experimental"/);
    assert.match(html, /Interaction lab/);
    assert.match(html, /flint-showcase\.html/);
    assert.match(html, /connect-src 'none'/);
    assert.doesNotMatch(html, /<(?:script|link|img|iframe)\b[^>]*\b(?:src|href)=["']https?:/i);
    assert.ok(Buffer.byteLength(html) < 8 * 1024 * 1024);
});

test('lab uses less-conventional actual chart types and meaningful gesture contracts', () => {
    const data = gallery();
    assert.equal(data.mode, 'experimental');
    assert.equal(data.version, '1.0.1');
    assert.equal(data.samples.length, 7);
    assert.deepEqual(data.themes.map(theme => theme.id), ['swiss', 'pop', 'de-stijl']);
    const types = data.samples.flatMap(sample =>
        sample.input.chart ? [sample.input.chart.chart_spec.chartType] : sample.input.board.charts.map(chart => chart.chart_spec.chartType));
    for (const type of ['Connected Scatter Plot', 'Ridgeline Plot', 'Bump Chart', 'Rose Chart', 'Lollipop Chart', 'ECDF Plot']) {
        assert.ok(types.includes(type), type);
    }
    const inputs = data.samples.flatMap(sample => sample.input.chart ? [sample.input.chart] : sample.input.board.charts);
    const presets = inputs.flatMap(input => input.interaction_spec?.interactions.map(item => item.type) || []);
    for (const type of ['brush-angle', 'drag-reorder', 'hover-group-focus', 'filter-controls', 'brush-zoom']) {
        assert.ok(presets.includes(type), type);
    }
    for (const sample of data.samples) {
        assert.ok(sample.tryIt && sample.description);
        for (const theme of data.themes) {
            assert.ok(sample.results[theme.id]?._meta?.flint?.board);
            assert.ok(sample.inputs[theme.id]);
            for (const chart of sample.inputs[theme.id].chart ? [sample.inputs[theme.id].chart] : sample.inputs[theme.id].board.charts) {
                if (['Bump Chart', 'Connected Scatter Plot', 'ECDF Plot'].includes(chart.chart_spec.chartType)) {
                    assert.deepEqual(chart.theme_spec, { extends: theme.id,
                        ink: { series: { minContrast: { fill: 3, stroke: 3 } } },
                        geometry: { point: { opacity: 1 } },
                        dataLabels: { minContrast: 4.5 }, legend: { show: 'never' } });
                }
            }
        }
    }
});

test('reader-driven story beats are real prevalidated ChartUpdate layers, not a CSS animation', () => {
    const data = gallery();
    const story = data.samples.find(sample => sample.id === 'story');
    assert.ok(story.steps.length >= 2);
    for (const step of story.steps) {
        assert.deepEqual(step.input.chart.data, story.input.chart.data);
        assert.ok(step.input.chart.updates.some(layer => layer.ops.length));
        for (const theme of data.themes) {
            const result = step.results[theme.id];
            assert.ok(result._meta.flint.board);
            assert.ok(result.content.some(item => item.type === 'text' && /✓/.test(item.text)));
        }
    }
    assert.match(document(), /id="step-select"/);
});

test('linked scene uses three views of an explicit shared synthetic population', () => {
    const linked = gallery().samples.find(sample => sample.id === 'linked-lab').input.board;
    assert.equal(linked.charts.length, 3);
    assert.deepEqual(linked.link_spec.fields, ['cohort']);
    for (const chart of linked.charts) {
        assert.ok(chart.data.values.length > 0);
        assert.ok(Object.values(chart.chart_spec.encodings).some(encoding => encoding.field === 'cohort'));
        assert.equal(chart.layout?.height, undefined, 'Fixed tall cells prevent the three-view board from fitting a narrow screen');
    }
    const populations = linked.charts.map(chart => [...new Set(chart.data.values.map(row => row.cohort))].sort());
    assert.deepEqual(populations[1], populations[0]);
    assert.deepEqual(populations[2], populations[0]);
});

test('cohort instructions describe the rendered toggle buttons rather than nonexistent checkboxes', () => {
    const lens = gallery().samples.find(sample => sample.id === 'lens');
    assert.doesNotMatch(lens.description + ' ' + lens.tryIt, /checkbox|uncheck/i);
    assert.match(lens.tryIt, /select.*team|click.*team/i);
    assert.match(lens.tryIt, /All/);
});
