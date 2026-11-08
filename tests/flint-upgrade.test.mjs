import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const deps = require('../scripts/shared/dependencies.cjs');
const read = (...parts) => readFileSync(join(ROOT, ...parts), 'utf8');
const launcher = join(ROOT, 'skills', 'setup-dependencies', 'scripts', 'runtime-launcher.mjs');
const provisioner = join(ROOT, 'skills', 'setup-dependencies', 'scripts', 'provision-runtime.mjs');

test('Flint MCP and library are independently exact-pinned at 1.0.1', () => {
    assert.equal(deps.MCP_SERVERS.flint.version, '1.0.1');
    assert.deepEqual(deps.MCP_SERVERS.flint.library, { package: 'flint-chart', version: '1.0.1' });
});

test('shared runtime package selection includes the exact library without changing other routes', () => {
    assert.equal(typeof deps.mcpPackages, 'function');
    assert.deepEqual(deps.mcpPackages(['flint']), [
        { name: 'flint-chart-mcp', version: '1.0.1', route: 'flint' },
        { name: 'flint-chart', version: '1.0.1', route: null },
    ]);
    assert.deepEqual(deps.mcpPackages(['playwright']), [
        { name: '@playwright/mcp', version: '0.0.84', route: 'playwright' },
    ]);
    assert.throws(() => deps.mcpPackages(['unknown']), /unknown MCP/i);
});

for (const version of [null, '0.5.1', '1.0.1']) {
    test(`launcher verifies the Flint library before invoking the server: ${version}`, (t) => {
        const runtime = mkdtempSync(join(tmpdir(), 'one-flint-version-'));
        t.after(() => rmSync(runtime, { recursive: true, force: true }));
        const server = join(runtime, 'node_modules', 'flint-chart-mcp');
        mkdirSync(join(server, 'dist'), { recursive: true });
        writeFileSync(join(server, 'package.json'), JSON.stringify({ name: 'flint-chart-mcp', version: '1.0.1' }));
        writeFileSync(join(server, 'dist', 'cli.js'), 'console.log("server invoked");\n');
        if (version) {
            const library = join(runtime, 'node_modules', 'flint-chart');
            mkdirSync(library);
            writeFileSync(join(library, 'package.json'), JSON.stringify({ name: 'flint-chart', version }));
        }
        const result = spawnSync(process.execPath, [launcher, 'flint', '--version'], {
            encoding: 'utf8', env: { ...process.env, ALEX_ACT_ONE_RUNTIME_ROOT: runtime },
        });
        assert.equal(result.status, version === '1.0.1' ? 0 : version === null ? 3 : 4, result.stderr);
        if (version === '1.0.1') assert.match(result.stdout, /server invoked/);
        else {
            assert.match(result.stderr, /flint-chart/);
            assert.doesNotMatch(result.stdout, /server invoked/);
        }
    });
}

test('provisioner can preview only Flint and library without mutating a runtime', (t) => {
    const root = mkdtempSync(join(tmpdir(), 'one-flint-preview-'));
    t.after(() => rmSync(root, { recursive: true, force: true }));
    const runtime = join(root, 'absent-runtime');
    const result = spawnSync(process.execPath, [provisioner, '--server', 'flint', '--runtime-root', runtime],
        { encoding: 'utf8', timeout: 30000 });
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /flint-chart-mcp@1\.0\.1/);
    assert.match(result.stdout, /flint-chart@1\.0\.1/);
    assert.doesNotMatch(result.stdout, /@playwright\/mcp@|replicate-mcp@/);
    assert.match(result.stdout, /Preview only/);
    assert.equal(existsSync(runtime), false);
});

test('launcher rejects a stale nested Flint dependency even when the root library is current', (t) => {
    const runtime = mkdtempSync(join(tmpdir(), 'one-flint-nested-'));
    t.after(() => rmSync(runtime, { recursive: true, force: true }));
    const server = join(runtime, 'node_modules', 'flint-chart-mcp');
    mkdirSync(join(server, 'dist'), { recursive: true });
    writeFileSync(join(server, 'package.json'), JSON.stringify({ name: 'flint-chart-mcp', version: '1.0.1' }));
    writeFileSync(join(server, 'dist', 'cli.js'), 'console.log("server invoked");\n');
    for (const [location, version] of [[join(runtime, 'node_modules', 'flint-chart'), '1.0.1'],
        [join(server, 'node_modules', 'flint-chart'), '0.5.1']]) {
        mkdirSync(location, { recursive: true });
        writeFileSync(join(location, 'package.json'), JSON.stringify({ name: 'flint-chart', version }));
    }
    const result = spawnSync(process.execPath, [launcher, 'flint', '--version'], {
        encoding: 'utf8', env: { ...process.env, ALEX_ACT_ONE_RUNTIME_ROOT: runtime },
    });
    assert.equal(result.status, 4, result.stderr);
    assert.match(result.stderr, /flint-chart.*mismatch/);
    assert.doesNotMatch(result.stdout, /server invoked/);
});

test('provisioner rejects unsafe routing and unknown server selection before installing', () => {
    for (const args of [
        ['--server', 'unknown'],
        ['--server'],
        ['--registry-tarball-prefix', 'http://example.invalid/feed/'],
        ['--registry-tarball-prefix', 'https://fixture-user@example.invalid/feed/'],
        ['--registry-tarball-prefix', 'https://example.invalid/feed/?query=1'],
    ]) {
        const result = spawnSync(process.execPath, [provisioner, ...args], { encoding: 'utf8', timeout: 30000 });
        assert.notEqual(result.status, 0, args.join(' '));
        assert.doesNotMatch(result.stdout, /installing:/);
    }
});

test('current Flint routes load version-matched skills and use validate then show', () => {
    const chart = read('skills', 'flint-chart', 'SKILL.md');
    const theme = read('skills', 'flint-theme', 'SKILL.md');
    const orchestrator = read('skills', 'render-chart', 'SKILL.md');
    assert.match(chart, /1\.0\.1/);
    assert.match(chart, /get_flint_skill/);
    assert.match(chart, /validate_chart/);
    assert.match(chart, /show/);
    assert.match(theme, /get_flint_skill/);
    for (const text of [chart, theme, orchestrator]) {
        assert.doesNotMatch(text, /create_chart_view|author_flint_chart|author_flint_theme|0\.5\.1/);
    }
});

test('Chart Brief hints use exact chart names instead of unsupported snake_case', () => {
    const text = read('skills', 'chart-big-idea', 'SKILL.md');
    for (const invalid of ['bar_chart', 'stacked_bar_chart', 'lollipop_chart', 'strip_plot', 'scatter_plot', 'bullet_chart']) {
        assert.ok(!text.includes('`' + invalid + '`'), invalid);
    }
    assert.ok(text.includes('`Stacked Bar Chart`'));
    assert.match(text, /backend|catalog/);
});
