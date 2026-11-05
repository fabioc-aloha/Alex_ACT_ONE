import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import * as builder from '../scripts/build-flint-showcase.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const deps = require('../scripts/shared/dependencies.cjs');
const pins = [
    { package: '@napi-rs/canvas', version: '1.0.10' },
    { package: 'chart.js', version: '4.5.1' },
    { package: '@modelcontextprotocol/sdk', version: '1.32.1' },
];
test('canonical demo builds have explicit reviewed renderer and protocol pins, separate from runtime upgrades', () => {
    assert.deepEqual(deps.SHOWCASE_PACKAGES, pins);
    assert.deepEqual(deps.mcpPackages(['flint']), [
        { name: 'flint-chart-mcp', version: '1.0.1', route: 'flint' },
        { name: 'flint-chart', version: '1.0.1', route: null },
    ]);
});
test('demo environment validation rejects floating renderer drift before generating any artifacts', () => {
    assert.equal(typeof builder.validateRendererEnvironment, 'function');
    const packages = Object.fromEntries(pins.map(pin => [pin.package, pin.version]));
    assert.doesNotThrow(() => builder.validateRendererEnvironment({ packages }));
    for (const pin of pins) {
        const changed = structuredClone(packages);
        changed[pin.package] = '9.9.9-fixture';
        assert.throws(() => builder.validateRendererEnvironment({ packages: changed }), error =>
            error.message.includes(pin.package) && error.message.includes(pin.version) && /mismatch/i.test(error.message));
    }
});
test('CI installs demo build pins only on the disposable runner before exact artifact checks', () => {
    const workflow = readFileSync(join(ROOT, '.github', 'workflows', 'verify.yml'), 'utf8');
    assert.match(workflow, /SHOWCASE_PACKAGES/);
    assert.match(workflow, /npm install --prefix \$env:ALEX_ACT_ONE_RUNTIME_ROOT --save-exact --ignore-scripts.*@showcase/);
    assert.ok(workflow.indexOf('SHOWCASE_PACKAGES') < workflow.indexOf('Check canonical Windows demo rebuilds'));
    const source = readFileSync(join(ROOT, 'scripts', 'build-flint-showcase.mjs'), 'utf8');
    assert.ok(source.includes('validateRendererEnvironment(rendererEnvironment(runtime))'));
    assert.ok(source.indexOf('validateRendererEnvironment(rendererEnvironment(runtime))') <
        source.indexOf('const { createServer } ='));
});
