import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const require = createRequire(import.meta.url);
const deps = require('../scripts/shared/dependencies.cjs');

test('retired image provider is absent from declared assets, provisioning, and CI runtime', () => {
    const plugin = JSON.parse(readFileSync(join(root, 'plugin.json'), 'utf8'));
    const manifest = JSON.parse(readFileSync(join(root, 'manifest.json'), 'utf8'));
    const runtime = JSON.parse(readFileSync(join(root, 'ci', 'runtime', 'package.json'), 'utf8'));
    assert.deepEqual(Object.keys(plugin.mcpServers).sort(), ['alex-playwright', 'flint']);
    assert.equal(deps.MCP_SERVERS.replicate, undefined);
    assert.equal(runtime.dependencies['replicate-mcp'], undefined);
    assert.ok(manifest.assets.skills.every(asset => asset.name !== 'replicate-imagery'));
    assert.equal(existsSync(join(root, 'skills', 'replicate-imagery', 'SKILL.md')), false);
    assert.ok(deps.mcpPackages().every(pkg => !/replicate/i.test(pkg.name)));
    assert.throws(() => deps.mcpPackages(['replicate']), /unknown MCP/i);
});

test('active runtime guidance contains no retired provider installation or routing instructions', () => {
    for (const name of [
        'install-optional-dependencies.ps1', 'docs/install.md', 'skills/setup-dependencies/SKILL.md',
        'skills/chart-vocabulary/SKILL.md',
    ]) {
        assert.doesNotMatch(readFileSync(join(root, name), 'utf8'), /replicate-imagery|replicate-mcp|REPLICATE_API_TOKEN|IncludeReplicate/);
    }
});
