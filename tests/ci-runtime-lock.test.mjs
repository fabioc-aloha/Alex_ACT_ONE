import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import deps from '../scripts/shared/dependencies.cjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
function profile() {
    const root = join(ROOT, 'ci', 'runtime');
    assert.ok(existsSync(join(root, 'package.json')), 'Missing isolated CI/demo build manifest');
    assert.ok(existsSync(join(root, 'package-lock.json')), 'Missing reviewed transitive CI/demo build lock');
    return {
        manifest: JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')),
        lock: JSON.parse(readFileSync(join(root, 'package-lock.json'), 'utf8')),
    };
}
test('isolated CI/runtime manifest agrees with every reviewed runtime and demo build pin', () => {
    const { manifest, lock } = profile();
    const expected = Object.fromEntries([
        ...deps.mcpPackages().map(pin => [pin.name, pin.version]),
        [deps.TOOLS.jszip.package, deps.TOOLS.jszip.version],
        ...deps.SHOWCASE_PACKAGES.map(pin => [pin.package, pin.version]),
    ]);
    assert.equal(manifest.private, true);
    assert.deepEqual(manifest.dependencies, expected);
    assert.deepEqual(lock.packages[''].dependencies, expected);
    assert.equal(lock.name, manifest.name);
    assert.equal(lock.version, manifest.version);
    for (const [name, version] of Object.entries(expected)) {
        assert.equal(lock.packages[`node_modules/${name}`].version, version);
    }
});
test('locked transitive graph has portable registry resolution and integrity without local paths or links', () => {
    const { lock } = profile();
    assert.equal(lock.lockfileVersion, 3);
    assert.ok(Object.keys(lock.packages).length > 100, 'Only top-level pins are not a transitive graph');
    for (const [name, entry] of Object.entries(lock.packages).filter(([name]) => name)) {
        assert.ok(name.startsWith('node_modules/') && !name.split('/').includes('..'), name);
        assert.equal(entry.link, undefined, name);
        assert.match(entry.version, /^\d+\.\d+\.\d+/, name);
        assert.match(entry.resolved, /^https:\/\/registry\.npmjs\.org\/[^?#]+\.tgz$/, name);
        assert.match(entry.integrity, /^sha(?:1|256|384|512)-[A-Za-z0-9+/]+={0,2}$/, name);
    }
});
test('hosted jobs consume the locked profile with npm ci, not drifting install resolution', () => {
    profile();
    const workflow = readFileSync(join(ROOT, '.github', 'workflows', 'verify.yml'), 'utf8');
    assert.match(workflow, /Copy-Item.*'ci'.*'runtime'.*'package\.json'/);
    assert.match(workflow, /Copy-Item.*'ci'.*'runtime'.*'package-lock\.json'/);
    assert.match(workflow, /npm ci --prefix \$env:ALEX_ACT_ONE_RUNTIME_ROOT --ignore-scripts/);
    assert.doesNotMatch(workflow, /provision-runtime\.mjs.*--apply|npm install --prefix/);
});
