import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import * as builder from '../scripts/build-flint-showcase.mjs';

const hash = value => createHash('sha256').update(value).digest('hex');
const environment = { packages: { 'flint-chart': '1.0.1' }, fonts: { 'fixture.ttf': hash('font') } };

test('provenance uses source/content digests rather than a wall clock, home path, or moving HEAD', () => {
    assert.equal(typeof builder.buildProvenance, 'function');
    const data = { mode: 'editorial', samples: [{ id: 'fixture' }] };
    const first = builder.buildProvenance(data, '<html>fixture</html>', environment);
    assert.deepEqual(builder.buildProvenance(structuredClone(data), '<html>fixture</html>', environment), first);
    assert.equal(first.schemaVersion, 1);
    assert.equal(first.sourceStatus, 'repository-source-demo');
    assert.equal(first.dataSha256, hash(JSON.stringify(data)));
    assert.equal(first.appUiSha256, hash('<html>fixture</html>'));
    for (const digest of Object.values(first.sourceInputs)) assert.match(digest, /^[a-f0-9]{64}$/);
    assert.ok(Object.keys(first.sourceInputs).includes('ci/runtime/package-lock.json'));
    assert.notEqual(builder.buildProvenance({ ...data, mode: 'experimental' }, '<html>fixture</html>', environment).dataSha256,
        first.dataSha256);
    assert.notEqual(builder.buildProvenance(data, '<html>changed</html>', environment).appUiSha256, first.appUiSha256);
    assert.doesNotMatch(JSON.stringify(first), /builtAt|timestamp|C:\\|\/Users\/|\/home\//);
});

test('both generated pages carry portable source status and machine-readable build provenance', () => {
    for (const file of ['flint-showcase.html', 'flint-experimental.html']) {
        const html = readFileSync(new URL(`../docs/${file}`, import.meta.url), 'utf8');
        const block = html.match(/<script type="application\/json" id="build-provenance">([\s\S]*?)<\/script>/);
        assert.ok(block, file);
        const provenance = JSON.parse(block[1]);
        assert.equal(provenance.sourceStatus, 'repository-source-demo');
        assert.match(html, /Source-built demonstration/);
        assert.match(html, /not.*released package/);
        assert.match(provenance.appUiSha256, /^[a-f0-9]{64}$/);
    }
});

test('live themed inputs leave dimensions to upstream responsive layout and expose a keyboard example', () => {
    for (const file of ['flint-showcase.html', 'flint-experimental.html']) {
        const html = readFileSync(new URL(`../docs/${file}`, import.meta.url), 'utf8');
        const gallery = JSON.parse(html.match(/<script type="application\/json" id="showcase-data">([\s\S]*?)<\/script>/)[1]);
        let keyboard = false;
        for (const sample of gallery.samples) {
            for (const variant of [sample, ...(sample.steps || [])]) {
                for (const input of Object.values(variant.inputs)) {
                    for (const chart of input.chart ? [input.chart] : input.board.charts) {
                        assert.equal(chart.chart_spec.baseSize, undefined, `${file}/${sample.id}: fixed base disables upstream relayout`);
                        assert.equal(chart.chart_spec.canvasSize, undefined, `${file}/${sample.id}: fixed ceiling disables upstream relayout`);
                        keyboard ||= chart.interaction_spec?.interactions.some(item => item.type === 'accessible-navigation');
                    }
                }
            }
        }
        assert.ok(keyboard, `${file}: no reader-accessible keyboard example`);
    }
});
