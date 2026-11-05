import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { homedir, tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const runtime = process.env.FLINT_COMPATIBILITY_RUNTIME_ROOT || process.env.ALEX_ACT_ONE_RUNTIME_ROOT ||
    join(homedir(), '.copilot', 'plugin-data', 'alex-act-one', 'runtime');
const metadata = join(runtime, 'node_modules', 'flint-chart-mcp', 'package.json');
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function client(t) {
    const server = spawn(process.execPath, [join(runtime, 'node_modules', 'flint-chart-mcp', 'dist', 'cli.js')],
        { windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'] });
    const pending = new Map();
    let id = 0, buffer = '', stderr = '';
    const fail = (error) => {
        for (const item of pending.values()) { clearTimeout(item.timer); item.reject(error); }
        pending.clear();
    };
    t.after(() => { fail(new Error('Flint test client closed')); server.kill(); });
    server.stderr.on('data', data => { stderr += data.toString(); });
    server.on('error', fail);
    server.on('exit', code => fail(new Error(`Flint exited ${code}: ${stderr}`)));
    server.stdout.on('data', data => {
        buffer += data.toString();
        let newline;
        while ((newline = buffer.indexOf('\n')) !== -1) {
            const line = buffer.slice(0, newline);
            buffer = buffer.slice(newline + 1);
            if (!line.trim()) continue;
            let value;
            try { value = JSON.parse(line); } catch (error) { fail(error); continue; }
            const item = pending.get(value.id);
            if (!item) continue;
            pending.delete(value.id);
            clearTimeout(item.timer);
            if (value.error) item.reject(new Error(JSON.stringify(value.error)));
            else item.resolve(value.result);
        }
    });
    const notify = (method, params) => server.stdin.write(JSON.stringify({ jsonrpc: '2.0', method, params }) + '\n');
    const request = (method, params = {}) => new Promise((resolve, reject) => {
        const key = ++id;
        const timer = setTimeout(() => { pending.delete(key); reject(new Error(`${method} timed out: ${stderr}`)); }, 30000);
        pending.set(key, { resolve, reject, timer });
        server.stdin.write(JSON.stringify({ jsonrpc: '2.0', id: key, method, params }) + '\n');
    });
    return { request, notify, call: (name, args) => request('tools/call', { name, arguments: args }) };
}

function jsonResult(result) {
    assert.ok(!result.isError, JSON.stringify(result.content));
    const primary = result.content.find(item => item.type === 'text');
    assert.ok(primary, 'Expected a primary JSON text result');
    const parsed = JSON.parse(primary.text);
    return Array.isArray(parsed) ? parsed[0] : parsed;
}

test('provisioned Flint 1.0.1 preserves the MCP and three-backend output contracts', {
    skip: existsSync(metadata) ? false : 'Flint runtime not provisioned',
}, async (t) => {
    assert.equal(JSON.parse(readFileSync(metadata, 'utf8')).version, '1.0.1');
    assert.equal(JSON.parse(readFileSync(join(runtime, 'node_modules', 'flint-chart', 'package.json'), 'utf8')).version, '1.0.1');
    const mcp = client(t);
    const initialized = await mcp.request('initialize', { protocolVersion: '2024-11-05', capabilities: {},
        clientInfo: { name: 'alex-flint-tests', version: '1' } });
    assert.equal(initialized.serverInfo.version, '1.0.1');
    mcp.notify('notifications/initialized');
    const tools = (await mcp.request('tools/list')).tools;
    for (const name of ['compile_chart', 'render_chart', 'validate_chart', 'show', 'get_flint_skill',
        'list_chart_types', 'list_themes', 'list_interaction_presets', 'validate_board']) {
        assert.ok(tools.some(tool => tool.name === name), `Missing tool: ${name}`);
    }
    assert.ok(!tools.some(tool => tool.name === 'create_chart_view'));
    const resources = (await mcp.request('resources/list')).resources;
    for (const uri of ['flint://agent-skill', 'flint://theme-skill', 'flint://interaction-skill', 'flint://board-skill']) {
        assert.ok(resources.some(resource => resource.uri === uri), uri);
    }
    const grammar = await mcp.call('get_flint_skill', { skill: 'chart' });
    assert.ok(!grammar.isError, JSON.stringify(grammar));
    assert.match(grammar.content.map(item => item.text || '').join('\n'), /ChartAssemblyInput|chart_spec/);

    const input = {
        data: { values: [{ category: 'Alpha', value: 12 }, { category: 'Beta', value: 7 }] },
        semantic_types: { category: 'Category', value: 'Quantity' },
        chart_spec: { chartType: 'Bar Chart', title: 'Compatibility fixture',
            encodings: { x: { field: 'category' }, y: { field: 'value' } } },
    };
    for (const backend of ['vegalite', 'echarts', 'chartjs']) {
        await t.test(`${backend}: catalog, validation, compilation, and real render`, async () => {
            const catalog = jsonResult(await mcp.call('list_chart_types', { backend }));
            assert.ok(catalog.chartTypes.some(chart => chart.chartType === 'Bar Chart'));
            const validation = jsonResult(await mcp.call('validate_chart', { ...input, backend }));
            assert.equal(validation.valid, true, JSON.stringify(validation));
            const compiled = jsonResult(await mcp.call('compile_chart', { ...input, backend }));
            assert.equal(compiled.backend, backend);
            assert.ok(compiled.spec && typeof compiled.spec === 'object', JSON.stringify(compiled));
            const serialized = JSON.stringify(compiled.spec);
            assert.match(serialized, /Alpha/);
            assert.match(serialized, /Beta/);
            const format = backend === 'chartjs' ? 'png' : 'svg';
            const rendered = await mcp.call('render_chart', { ...input, backend, format });
            assert.ok(!rendered.isError, JSON.stringify(rendered));
            if (format === 'svg') {
                const svg = rendered.content.filter(item => item.type === 'text').map(item => item.text).join('\n');
                assert.match(svg, /<svg/);
                assert.match(svg, /Alpha/);
                assert.match(svg, /Beta/);
                if (backend === 'vegalite') {
                    assert.equal([...svg.matchAll(/aria-roledescription="bar"/g)].length, 2);
                    assert.match(svg, /category: Alpha; value: 12/);
                    assert.match(svg, /category: Beta; value: 7/);
                }
            } else {
                const image = rendered.content.find(item => item.type === 'image');
                assert.equal(image?.mimeType, 'image/png');
                assert.deepEqual([...Buffer.from(image.data, 'base64').subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
            }
        });
    }
    await t.test('validated show accepts the complete chart input', async () => {
        const shown = await mcp.call('show', { chart: input });
        assert.ok(!shown.isError, JSON.stringify(shown));
        assert.ok(shown.content.length > 0);
    });
    await t.test('interaction grammar and chart-compatible discovery admit highlight plus keyboard navigation', async () => {
        const grammar = await mcp.call('get_flint_skill', { skill: 'interaction', section: 'Add interactions to the chart' });
        assert.ok(!grammar.isError, JSON.stringify(grammar));
        assert.match(grammar.content.map(item => item.text || '').join('\n'), /interaction_spec/);
        const presets = jsonResult(await mcp.call('list_interaction_presets', { chartType: 'Bar Chart' }));
        for (const type of ['click-highlight', 'accessible-navigation']) {
            assert.ok(presets.presets.some(preset => preset.type === type), type);
        }
        const chart = { ...input, interaction_spec: { interactions: [
            { type: 'click-highlight', options: { targets: ['mark'], reset: ['escape'] } },
            { type: 'accessible-navigation' },
        ] } };
        const validation = jsonResult(await mcp.call('validate_chart', { ...chart, backend: 'vegalite' }));
        assert.equal(validation.valid, true);
        assert.deepEqual(validation.errors, []);
        assert.deepEqual(validation.warnings, []);
        const shown = await mcp.call('show', { chart });
        assert.ok(!shown.isError, JSON.stringify(shown));
        assert.match(shown.content.map(item => item.text || '').join('\n'), /click-highlight/);
    });
    await t.test('a dropped interaction remains a warning even when the chart is valid', async () => {
        const validation = jsonResult(await mcp.call('validate_chart', { ...input, backend: 'vegalite',
            interaction_spec: { interactions: [{ type: 'legend-toggle' }] },
        }));
        assert.equal(validation.valid, true);
        assert.deepEqual(validation.errors, []);
        assert.ok(validation.warnings.some(warning => warning.code === 'unsupported_interaction' &&
            /discrete legend.*dropped/s.test(warning.message)), JSON.stringify(validation));
    });
    await t.test('unknown reset gestures are explicit errors rather than neutral-state fallbacks', async () => {
        const validation = jsonResult(await mcp.call('validate_chart', { ...input, backend: 'vegalite',
            interaction_spec: { interactions: [{ type: 'click-highlight', options: { reset: ['nonsense'] } }] },
        }));
        assert.equal(validation.valid, false);
        assert.ok(validation.errors.some(error => error.code === 'invalid_interaction_spec' &&
            /reset gesture.*unknown/.test(error.message)), JSON.stringify(validation));
    });
    await t.test('initial state and linked boards use their separate supported input surfaces', async () => {
        const updates = [{ id: 'initial-emphasis', ops: [
            { op: 'set-style', targets: [{ select: { key: { category: 'Alpha' } } }], value: { opacity: 0.35 } },
        ] }];
        const validation = jsonResult(await mcp.call('validate_chart', { ...input, updates, backend: 'vegalite' }));
        assert.equal(validation.valid, true, JSON.stringify(validation));
        assert.deepEqual(validation.errors, []);
        assert.deepEqual(validation.warnings, []);
        assert.deepEqual(validation.updates, [{
            id: 'initial-emphasis',
            ops: [{ op: 'set-style', text: 'styles marks where category = Alpha', ok: true }],
        }]);
        const boardGrammar = await mcp.call('get_flint_skill', { skill: 'board' });
        assert.ok(!boardGrammar.isError, JSON.stringify(boardGrammar));
        const board = {
            title: 'Synthetic linked interaction fixture',
            subtitle: 'Two synthetic categories and their fixture values',
            charts: [
                { ...input, id: 'source', interaction_spec: { interactions: [{ type: 'click-highlight' }] } },
                { ...input, id: 'recipient' },
            ],
            link_spec: { fields: ['category'] },
        };
        const checked = await mcp.call('validate_board', board);
        assert.ok(!checked.isError, JSON.stringify(checked));
        const report = checked.content.map(item => item.text || '').join('\n');
        assert.match(report, /✓ source: sends category by click-highlight; receives category/);
        assert.match(report, /✓ recipient: receives category; sends nothing/);
        assert.doesNotMatch(report, /✗/);
    });
    await t.test('offline export CLI is independent of the caller timezone and uses UTC date annotations', () => {
        const fixture = mkdtempSync(join(tmpdir(), 'one-flint-timezone-'));
        t.after(() => rmSync(fixture, { recursive: true, force: true }));
        const outputs = [];
        for (const zone of ['UTC', 'America/New_York']) {
            const output = join(fixture, zone === 'UTC' ? 'utc.html' : 'eastern.html');
            const env = { ...process.env, TZ: zone };
            delete env.NODE_TEST_CONTEXT;
            const built = spawnSync(process.execPath, [
                join(ROOT, 'scripts', 'build-flint-showcase.mjs'), '--runtime-root', runtime, '--out', output,
            ], { encoding: 'utf8', env, timeout: 60000 });
            assert.equal(built.status, 0, built.stderr);
            const bytes = readFileSync(output);
            outputs.push(createHash('sha256').update(bytes).digest('hex'));
            assert.equal(bytes.toString('utf8').includes('aria-label="month: May 31, 2025; revenue: 76000'), false);
        }
        assert.equal(outputs[0], outputs[1], 'The same reviewed build must not depend on the caller timezone');
    });
    await t.test('invalid snake_case names and missing fields remain explicit failures', async () => {
        const invalid = jsonResult(await mcp.call('validate_chart', {
            ...input, backend: 'vegalite', chart_spec: { ...input.chart_spec, chartType: 'stacked_bar_chart' },
        }));
        assert.equal(invalid.valid, false);
        const missing = jsonResult(await mcp.call('validate_chart', {
            ...input, backend: 'vegalite',
            chart_spec: { ...input.chart_spec, encodings: { x: { field: 'missing' }, y: { field: 'value' } } },
        }));
        assert.equal(missing.valid, false);
    });
});
