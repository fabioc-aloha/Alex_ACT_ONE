import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { spawn } from 'node:child_process';
import { test } from 'node:test';

const runtime = process.env.FLINT_COMPATIBILITY_RUNTIME_ROOT || process.env.ALEX_ACT_ONE_RUNTIME_ROOT ||
    join(homedir(), '.copilot', 'plugin-data', 'alex-act-one', 'runtime');
const metadata = join(runtime, 'node_modules', 'flint-chart-mcp', 'package.json');

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
