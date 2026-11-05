import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const { MCP_SERVERS } = require('./shared/dependencies.cjs');
const THEMES = [
    { id: 'nyt', label: 'Newsroom' },
    { id: 'economist', label: 'Print weekly' },
    { id: 'swiss', label: 'Swiss' },
];
const html = value => String(value).replace(/[&<>"']/g, char =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const json = value => JSON.stringify(value).replace(/</g, '\\u003c');

export function createSamples() {
    const stores = [
        ['North', 'N1', 18, 58], ['North', 'N2', 26, 70],
        ['South', 'S1', 14, 44], ['South', 'S2', 20, 52],
        ['East', 'E1', 16, 48], ['East', 'E2', 24, 64],
        ['West', 'W1', 28, 72], ['West', 'W2', 34, 82],
    ].map(([region, store, hours, orders]) => ({ region, store, hours, orders }));
    const regions = [...new Set(stores.map(row => row.region))].map(region => ({
        region, orders: stores.filter(row => row.region === region).reduce((sum, row) => sum + row.orders, 0),
    }));
    const chart = (chartType, title, subtitle, values, encodings, semantic_types, interactions = []) => ({
        chart_spec: { chartType, title, subtitle, source: 'Synthetic demonstration data',
            baseSize: { width: 540, height: 320 }, canvasSize: { width: 740, height: 460 }, encodings },
        data: { values }, semantic_types,
        ...(interactions.length ? { interaction_spec: { interactions } } : {}),
    });
    const keyboard = { type: 'accessible-navigation', options: { sections: ['data'], caption: true } };
    const highlight = { type: 'click-highlight', options: { targets: ['mark'], reset: ['escape', 'click-none'] } };
    const comparison = chart('Bar Chart', 'West fulfils the most orders',
        'Orders by region; one synthetic week', regions,
        { x: { field: 'region' }, y: { field: 'orders' } },
        { region: 'Region', orders: 'Count' }, [highlight, keyboard]);
    const months = ['2025-01', '2025-02', '2025-03', '2025-04', '2025-05', '2025-06'];
    const series = { North: [42, 48, 53, 61, 68, 76], South: [38, 40, 44, 43, 47, 51] };
    const monthly = Object.entries(series).flatMap(([region, values]) =>
        months.map((month, i) => ({ month, region, revenue: values[i] * 1000 })));
    const trend = chart('Line Chart', 'North gains more revenue over six months',
        'Monthly revenue in USD; synthetic January-June 2025', monthly,
        { x: { field: 'month' }, y: { field: 'revenue' }, color: { field: 'region' } },
        { month: 'YearMonth', revenue: { semanticType: 'Amount', unit: 'USD' }, region: 'Region' },
        [{ type: 'legend-toggle' }, { type: 'inspect-index' }, keyboard]);
    const composition = chart('Stacked Bar Chart', 'Core remains the largest product line',
        'Orders by quarter and product; synthetic 2025', [
            { quarter: 'Q1', product: 'Core', orders: 50 }, { quarter: 'Q1', product: 'Plus', orders: 30 },
            { quarter: 'Q1', product: 'Services', orders: 20 }, { quarter: 'Q2', product: 'Core', orders: 58 },
            { quarter: 'Q2', product: 'Plus', orders: 42 }, { quarter: 'Q2', product: 'Services', orders: 24 },
        ], { x: { field: 'quarter' }, y: { field: 'orders' }, color: { field: 'product' } },
        { quarter: 'Category', product: 'Category', orders: 'Count' }, [{ type: 'legend-toggle' }, keyboard]);
    const scatter = chart('Scatter Plot', 'Busier stores fulfil more orders in this sample',
        'Eight synthetic stores; staff hours and orders in one week', stores,
        { x: { field: 'hours' }, y: { field: 'orders' }, color: { field: 'region' }, detail: { field: 'store' } },
        { hours: { semanticType: 'Quantity', unit: 'hr' }, orders: 'Count', region: 'Region', store: 'ID' },
        [{ type: 'brush-zoom', options: { axes: 'xy', reset: ['escape', 'double-click'],
            transition: { duration: 0 }, resetTransition: { duration: 0 } } }, keyboard]);
    const distribution = chart('Histogram', 'Shorter waits are more common in this sample',
        'Wait time in minutes; 30 synthetic visits', [
            3, 5, 4, 7, 9, 6, 6, 11, 8, 4, 5, 7, 12, 14, 6,
            8, 9, 5, 3, 7, 10, 13, 6, 8, 4, 15, 9, 7, 5, 11,
        ].map((minutes, i) => ({ visit: i + 1, minutes })),
        { x: { field: 'minutes' } },
        { minutes: { semanticType: 'Duration', unit: 'min' }, visit: 'ID' }, [highlight, keyboard]);
    const workloads = {
        Support: [4, 3, 5, 4, 2], Delivery: [2, 3, 3, 4, 5],
        Operations: [5, 4, 3, 2, 2], Planning: [3, 4, 4, 3, 2],
    };
    const heatmap = chart('Heatmap', 'Workload peaks on different days across teams',
        'Synthetic workload score; 1 = low, 5 = high', Object.entries(workloads).flatMap(([team, values]) =>
            ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, i) => ({ team, day, workload: values[i] }))),
        { x: { field: 'day' }, y: { field: 'team' }, color: { field: 'workload' } },
        { day: { semanticType: 'Category', sortOrder: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
            team: 'Category', workload: { semanticType: 'Score', intrinsicDomain: [1, 5] } }, [highlight, keyboard]);
    const updates = structuredClone(comparison);
    updates.updates = [{ id: 'editorial-emphasis', ops: [
        { op: 'set-style', targets: [{ select: { where: { region: { in: ['North', 'South', 'East'] } } } }],
            value: { opacity: 0.25 } },
        { op: 'set-annotation', target: { select: { key: { region: 'West' } } },
            value: { text: 'Leading region', anchor: 'segment' } },
    ] }];
    const linkedScatter = structuredClone(scatter);
    linkedScatter.interaction_spec = { interactions: [highlight, keyboard] };
    const board = {
        title: 'Regional totals and individual stores share a selection',
        subtitle: 'Eight synthetic stores; orders totalled by region, with store-level staffing context',
        source: 'Synthetic demonstration data', columns: 2,
        charts: [{ ...comparison, id: 'regions' }, { ...linkedScatter, id: 'stores' }],
        link_spec: { fields: ['region'] },
    };
    return [
        { id: 'comparison', title: 'Comparison & keyboard access', category: 'Compare',
            description: 'Categorical regions and count semantics become a bar chart with a zero baseline.',
            tryIt: 'Click a bar to highlight it; press Escape to clear. Tab to the chart, press Enter to explore its data, then use Enter and arrow keys to reach and move between marks.',
            input: { chart: comparison } },
        { id: 'trend', title: 'Time, units & series', category: 'Follow change',
            description: 'YearMonth and Amount semantics turn the same kind of input into dated axes and currency labels.',
            tryIt: 'Hover over a month to inspect both series. Click a region in the legend to hide it; click it again to restore it.',
            input: { chart: trend } },
        { id: 'composition', title: 'Parts within a whole', category: 'See composition',
            description: 'Stacked bars expose product contributions without turning counts into percentages.',
            tryIt: 'Toggle a product in the legend to inspect the remaining mix. Toggle it again to restore all products.',
            input: { chart: composition } },
        { id: 'relationship', title: 'Relationships & brush zoom', category: 'Explore',
            description: 'Position, color, and stable store identities support exploration of a small multivariate sample.',
            tryIt: 'Drag a rectangle across the point cloud to zoom. Double-click or press Escape inside the chart to reset.',
            input: { chart: scatter } },
        { id: 'distribution', title: 'Row-level distributions', category: 'Inspect spread',
            description: 'A histogram bins the 30 original visit records instead of requiring a prepared frequency table.',
            tryIt: 'Hover a bin for its values. Click a bin to emphasize it; press Escape to clear.',
            input: { chart: distribution } },
        { id: 'heatmap', title: 'Bounded scores & matrix color', category: 'Find patterns',
            description: 'A declared 1-5 score range and ordered weekdays make the color and category encodings explicit.',
            tryIt: 'Inspect a cell, then click to emphasize it. Press Escape to return to the full matrix.',
            input: { chart: heatmap } },
        { id: 'updates', title: 'Declarative initial state', category: 'Direct attention',
            description: 'ChartUpdate layers dim three regions and annotate West without rewriting the source records.',
            tryIt: 'The live chart opens with emphasis and an annotation. Inspect the updates array in the spec. The preview below is the base chart.',
            input: { chart: updates } },
        { id: 'linked', title: 'A linked two-chart board', category: 'Connect views',
            description: 'The charts join on region. The regional totals are computed from the same eight store records.',
            tryIt: 'Click a regional bar and watch its store points stay emphasized. Press Escape in that chart to reset both views.',
            input: { board } },
    ];
}

export function createExperimentalSamples() {
    const cohorts = ['Atlas', 'Drift', 'Forge', 'Kite'];
    const ranks = [[1, 2, 3, 2, 3, 2], [2, 1, 1, 3, 2, 3], [4, 3, 2, 1, 1, 1], [3, 4, 4, 4, 4, 4]];
    const rankRows = cohorts.flatMap((cohort, c) => ranks[c].map((rank, i) => ({ cohort, checkpoint: i + 1, rank })));
    const runs = cohorts.flatMap((cohort, c) => Array.from({ length: 8 }, (_, i) => ({
        cohort, run: `${cohort}-${i + 1}`, cost: 80 + c * 15 + i * 9,
        score: 45 + c * 8 + i * 4, latency: [7, 10, 5, 12][c] + ((i * 3 + c) % 7) - 3,
    })));
    const chart = (chartType, title, subtitle, values, encodings, semantic_types, interactions) => ({
        chart_spec: { chartType, title, subtitle, source: 'Synthetic interaction-lab fixture',
            baseSize: { width: 650, height: 360 }, canvasSize: { width: 1000, height: 520 }, encodings },
        data: { values }, semantic_types, interaction_spec: { interactions },
    });
    const focus = { type: 'hover-group-focus', options: { groupBy: 'cohort', emphasis: 'spotlight' } };
    const clickGroup = { type: 'click-group-focus', options: { groupBy: 'cohort', reset: ['escape', 'click-none'] } };
    const zoom = { type: 'brush-zoom', options: { reset: ['escape', 'double-click'],
        transition: { duration: 0 }, resetTransition: { duration: 0 } } };
    const paths = cohorts.flatMap((cohort, c) => Array.from({ length: 6 }, (_, i) => ({
        cohort, checkpoint: i + 1, energy: 16 + c * 3 + i * 4 + [0, 3, -2, 2, -1, 0][i],
        output: 28 + c * 6 + i * 7 + [0, -4, 3, -2, 4, 0][i],
    })));
    const trajectory = chart('Connected Scatter Plot', 'Progress takes different paths',
        'Energy and output over six ordered checkpoints; four synthetic teams', paths,
        { x: { field: 'energy' }, y: { field: 'output' }, order: { field: 'checkpoint' }, color: { field: 'cohort' } },
        { energy: { semanticType: 'Quantity', unit: 'kWh' }, output: 'Count', checkpoint: 'Week', cohort: 'Category' },
        [focus, zoom]);
    const density = chart('Ridgeline Plot', 'Latency has a different shape for each team',
        'Eight synthetic runs per team; latency in minutes', runs,
        { x: { field: 'latency' }, y: { field: 'cohort' } },
        { latency: { semanticType: 'Duration', unit: 'min' }, cohort: 'Category' }, [focus]);
    const orbit = chart('Rose Chart', 'A synthetic day has two activity peaks',
        'Events in eight three-hour windows; radial distance encodes count', [
            ['00-03', 12], ['03-06', 8], ['06-09', 34], ['09-12', 62],
            ['12-15', 48], ['15-18', 72], ['18-21', 40], ['21-24', 22],
        ].map(([window, events]) => ({ window, events })),
        { x: { field: 'window' }, y: { field: 'events' } },
        { window: { semanticType: 'Category', sortOrder: ['00-03', '03-06', '06-09', '09-12', '12-15', '15-18', '18-21', '21-24'] }, events: 'Count' },
        [{ type: 'brush-angle', options: { mode: 'stateful', reset: ['escape', 'click-none'] } }]);
    const reorder = chart('Lollipop Chart', 'Change the order, not the scores',
        'Four synthetic team scores; bounded 0-100', cohorts.map((cohort, i) => ({ cohort, score: [72, 58, 88, 66][i] })),
        { x: { field: 'cohort' }, y: { field: 'score' } },
        { cohort: 'Category', score: { semanticType: 'Score', intrinsicDomain: [0, 100] } },
        [{ type: 'drag-reorder', options: { reset: ['escape', 'double-click'] } }]);
    const lens = chart('Scatter Plot', 'Narrow the population before comparing the runs',
        '32 synthetic runs; cost in USD, score 0-100; filters change the visible rows', runs,
        { x: { field: 'cost' }, y: { field: 'score' }, color: { field: 'cohort' }, detail: { field: 'run' } },
        { cost: { semanticType: 'Price', unit: 'USD' }, score: { semanticType: 'Score', intrinsicDomain: [0, 100] },
            cohort: 'Category', run: 'ID', latency: { semanticType: 'Duration', unit: 'min' } },
        [{ type: 'filter-controls', options: { fields: [
            { field: 'cohort', widget: 'checkboxes', label: 'Team' },
            { field: 'latency', widget: 'range', label: 'Latency (min)' },
        ], mode: 'filter', placement: 'top' } }, focus]);
    const bump = chart('Bump Chart', 'Forge moves from fourth to first',
        'Four synthetic teams over six checkpoints; rank 1 is best', rankRows,
        { x: { field: 'checkpoint' }, y: { field: 'rank' }, color: { field: 'cohort' } },
        { checkpoint: 'Week', rank: 'Rank', cohort: 'Category' }, [focus, clickGroup]);
    const forge = structuredClone(bump);
    forge.updates = [{ id: 'forge-spotlight', ops: [
        { op: 'set-style', targets: [{ select: { where: { cohort: { in: ['Atlas', 'Drift', 'Kite'] } } } }],
            value: { opacity: 0.18 } },
    ] }];
    const finish = structuredClone(forge);
    finish.updates[0].ops.push({ op: 'set-annotation',
        target: { select: { key: { cohort: 'Forge', checkpoint: 6 } } },
        value: { text: 'Forge finishes first', anchor: 'point' } });
    const linkedScatter = structuredClone(lens);
    linkedScatter.chart_spec.encodings = { x: { field: 'cost' }, y: { field: 'score' }, color: { field: 'cohort' }, detail: { field: 'run' } };
    linkedScatter.interaction_spec = { interactions: [clickGroup] };
    const ecdf = chart('ECDF Plot', 'Latency across the same four teams',
        'Share of runs at or below each latency; synthetic minutes', runs,
        { x: { field: 'latency' }, color: { field: 'cohort' } },
        { latency: { semanticType: 'Duration', unit: 'min' }, cohort: 'Category' }, [clickGroup]);
    const linkedCharts = [bump, linkedScatter, ecdf].map((input, i) => ({
        ...structuredClone(input), id: ['rank', 'runs', 'latency'][i],
        chart_spec: { ...input.chart_spec, baseSize: { width: 340, height: 300 },
            canvasSize: { width: 460, height: 430 } },
        layout: { span: 1 },
    }));
    return [
        { id: 'trajectory', title: 'Follow a trajectory', category: 'Hover + brush zoom',
            description: 'A connected scatter separates the route from the destination. Ordered checkpoints connect energy use to output.',
            tryIt: 'Hover a team to spotlight its path. Drag a rectangle to zoom; move the pointer away and press Escape inside the chart to reset.',
            input: { chart: trajectory } },
        { id: 'density', title: 'Read the shape, not just the average', category: 'Ridgelines + transient focus',
            description: 'Four density ridges retain the shape of the latency samples. These small synthetic samples are demonstrations, not estimates of real team performance.',
            tryIt: 'Hover a ridge to spotlight its team. Leave the marks to restore the full view; there is no persistent selection to clear.',
            input: { chart: density } },
        { id: 'orbit', title: 'Brush an angular interval', category: 'Polar selection',
            description: 'A rose chart puts the day on a circle. A stateful angular brush selects a sector rather than a rectangular screen region.',
            tryIt: 'Drag around part of the wheel to select a time sector. Press Escape inside the chart or click empty plot space to clear it.',
            input: { chart: orbit } },
        { id: 'reorder', title: 'Make your own comparison order', category: 'Direct manipulation',
            description: 'A lollipop chart makes categorical ordering tangible. Reordering is a view setting; the four scores stay fixed.',
            tryIt: 'Drag a lollipop or category label horizontally to reorder teams. Press Escape inside the chart to restore the original order.',
            input: { chart: reorder } },
        { id: 'lens', title: 'Build a cohort lens', category: 'Widgets + real row filtering',
            description: 'Team toggle buttons and a latency range control the displayed population. Filtering removes marks from the view, not records from the embedded source.',
            tryIt: 'Click a team to select its runs; click additional teams to include them. All restores every team. Narrow the latency range, then inspect Live state. Reset example restores all 32 source rows.',
            input: { chart: lens } },
        { id: 'story', title: 'Direct the story in three beats', category: 'Bump chart + ChartUpdate layers',
            description: 'The rank paths stay fixed while explicit update layers change emphasis and add an annotation. No score or rank is recomputed.',
            tryIt: 'Use Story beat above the chart: full field, Forge spotlight, then the finish annotation. Inspect the input to see the actual updates.',
            input: { chart: bump }, steps: [
                { id: 'story-forge', label: '02 / Spotlight Forge', input: { chart: forge } },
                { id: 'story-finish', label: '03 / Annotate the finish', input: { chart: finish } },
            ] },
        { id: 'linked-lab', title: 'Connect rank, cost, and latency', category: 'Three coordinated views',
            description: 'A bump chart, run-level scatter, and cumulative latency distribution share team identity across different measures and grains.',
            tryIt: 'Click a team in any chart to emphasize it across all three views. Press Escape in that chart to clear the shared selection.',
            input: { board: { title: 'One team selection, three different questions',
                subtitle: 'Four synthetic teams; checkpoint ranks and 32 run-level cost, score, and latency observations',
                source: 'Synthetic interaction-lab fixture', columns: 3, charts: linkedCharts, link_spec: { fields: ['cohort'] } } } },
    ];
}

function packageDirectory(name, from) {
    const localRequire = createRequire(join(from, 'package.json'));
    const directory = localRequire.resolve.paths(name)?.map(base => join(base, name))
        .find(candidate => existsSync(join(candidate, 'package.json')));
    if (!directory) throw new Error(`Missing ${name} in the existing runtime. Run setup-dependencies; this builder never installs packages.`);
    return directory;
}

function collectNotices(nodeModules) {
    const seen = new Set();
    const notices = [];
    function visit(name, from) {
        const directory = packageDirectory(name, from);
        if (seen.has(directory)) return;
        seen.add(directory);
        const info = JSON.parse(readFileSync(join(directory, 'package.json'), 'utf8'));
        const files = readdirSync(directory).filter(file => /^(?:licen[cs]e|copying|notice)(?:\.[\w.-]+)?$/i.test(file)).sort();
        if (files.length) notices.push(`${info.name}@${info.version} (${info.license || 'see notice'})\n\n` +
            files.map(file => readFileSync(join(directory, file), 'utf8')).join('\n\n'));
        for (const dependency of Object.keys(info.dependencies || {}).sort()) visit(dependency, directory);
    }
    for (const name of ['flint-chart-mcp', 'flint-chart', 'vega', 'vega-lite', '@modelcontextprotocol/ext-apps']) {
        visit(name, dirname(nodeModules));
    }
    const microsoft = readFileSync(join(nodeModules, 'flint-chart-mcp', 'LICENSE'), 'utf8');
    notices.push('React, React DOM, Scheduler (embedded upstream UI)\n' +
        'Source: https://github.com/facebook/react/blob/v19.2.7/LICENSE\n\n' +
        microsoft.replace('Copyright (c) Microsoft Corporation.', 'Copyright (c) Meta Platforms, Inc. and affiliates.'));
    notices.push(`Vega Tooltip (embedded upstream UI)
Source: https://github.com/vega/vega-tooltip/blob/main/LICENSE

Copyright 2016 Interactive Data Lab and contributors

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

3. Neither the name of the copyright holder nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.`);
    return notices.sort().join('\n\n' + '='.repeat(72) + '\n\n').replace(/\r\n/g, '\n').replace(/[ \t]+$/gm, '');
}

function primaryJSON(result) {
    if (result.isError) throw new Error(result.content?.filter(item => item.type === 'text').map(item => item.text).join('\n'));
    const text = result.content?.find(item => item.type === 'text')?.text;
    if (!text) throw new Error('Flint returned no primary JSON report.');
    return JSON.parse(text);
}

function textResult(result) {
    if (result.isError) throw new Error(JSON.stringify(result.content));
    return result.content.filter(item => item.type === 'text').map(item => item.text).join('\n');
}

export function canonicalSvgPositions(svg) {
    const positions = new Set(['x', 'y', 'x1', 'y1', 'x2', 'y2', 'cx', 'cy', 'dx', 'dy']);
    const numeric = '[+-]?(?:\\d+(?:\\.\\d*)?|\\.\\d+)(?:[eE][+-]?\\d+)?';
    const scalar = new RegExp(`^${numeric}$`);
    const translation = new RegExp(`translate\\(\\s*(${numeric})(?:[\\s,]+(${numeric}))?\\s*\\)`, 'g');
    const round = value => {
        const number = Number(value);
        if (!Number.isFinite(number)) throw new Error('Invalid non-finite SVG position');
        return String(Number(number.toFixed(3)));
    };
    let output = '', cursor = 0;
    while (cursor < svg.length) {
        const start = svg.indexOf('<', cursor);
        if (start < 0) return output + svg.slice(cursor);
        output += svg.slice(cursor, start);
        const terminator = svg.startsWith('<!--', start) ? '-->' :
            svg.startsWith('<![CDATA[', start) ? ']]>' : null;
        if (terminator) {
            const end = svg.indexOf(terminator, start);
            if (end < 0) throw new Error('Unterminated SVG comment or CDATA');
            cursor = end + terminator.length;
            output += svg.slice(start, cursor);
            continue;
        }
        let quote = null, end = start + 1;
        for (; end < svg.length; end++) {
            const char = svg[end];
            if (quote) { if (char === quote) quote = null; }
            else if (char === '"' || char === "'") quote = char;
            else if (char === '>') break;
        }
        if (end === svg.length) throw new Error('Unterminated SVG tag');
        const tag = svg.slice(start, end + 1);
        output += tag.replace(/(\s+)([^\s=<>]+)(\s*=\s*)(["'])([\s\S]*?)\4/g,
            (attribute, space, name, equals, delimiter, value) => {
                let normalized = value;
                if (positions.has(name) && scalar.test(value)) normalized = round(value);
                else if (name === 'transform') normalized = value.replace(translation, (_, x, y) =>
                    `translate(${round(x)}${y === undefined ? '' : ',' + round(y)})`);
                return space + name + equals + delimiter + normalized + delimiter;
            });
        cursor = end + 1;
    }
    return output;
}

function svgResult(result) {
    if (result.isError) throw new Error(JSON.stringify(result.content));
    const text = result.content.find(item => item.type === 'text' && item.text.includes('<svg'))?.text;
    const start = text?.indexOf('<svg') ?? -1;
    const end = text?.lastIndexOf('</svg>') ?? -1;
    if (start < 0 || end < start) throw new Error('Flint returned no complete SVG artifact.');
    return canonicalSvgPositions(text.slice(start, end + '</svg>'.length));
}

export async function buildShowcase(runtime, { experimental = false } = {}) {
    const nodeModules = join(runtime, 'node_modules');
    const serverRoot = join(nodeModules, MCP_SERVERS.flint.package);
    const serverVersion = JSON.parse(readFileSync(join(serverRoot, 'package.json'), 'utf8')).version;
    const libraryRoot = packageDirectory(MCP_SERVERS.flint.library.package, serverRoot);
    const rootVersion = JSON.parse(readFileSync(join(nodeModules, 'flint-chart', 'package.json'), 'utf8')).version;
    const libraryVersion = JSON.parse(readFileSync(join(libraryRoot, 'package.json'), 'utf8')).version;
    if (serverVersion !== MCP_SERVERS.flint.version || rootVersion !== MCP_SERVERS.flint.library.version ||
        libraryVersion !== MCP_SERVERS.flint.library.version) {
        throw new Error(`Runtime pin mismatch: server=${serverVersion}, root library=${rootVersion}, server library=${libraryVersion}`);
    }
    const runtimeRequire = createRequire(join(runtime, 'package.json'));
    const { Client } = await import(pathToFileURL(runtimeRequire.resolve('@modelcontextprotocol/sdk/client/index.js')));
    const { InMemoryTransport } = await import(pathToFileURL(runtimeRequire.resolve('@modelcontextprotocol/sdk/inMemory.js')));
    const { createServer } = await import(pathToFileURL(join(serverRoot, 'dist', 'server.js')));
    const client = new Client({ name: 'alex-offline-showcase', version: '1' }, { capabilities: {} });
    const server = createServer({ disableFileReference: true });
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    await server.connect(serverTransport);
    await client.connect(clientTransport);
    const call = (name, args) => client.callTool({ name, arguments: args });
    try {
        const samples = experimental ? createExperimentalSamples() : createSamples();
        const themes = experimental ? [
            { id: 'swiss', label: 'Swiss' }, { id: 'pop', label: 'Pop' }, { id: 'de-stijl', label: 'De Stijl' },
        ] : THEMES;
        for (const sample of samples) {
            for (const variant of [sample, ...(sample.steps || [])]) {
              variant.results = {};
              variant.inputs = {};
              for (const theme of themes) {
                const input = structuredClone(variant.input);
                const base = input.chart || input.board;
                base.theme_spec = theme.id;
                for (const chart of input.chart ? [input.chart] : input.board.charts) {
                    if (chart.interaction_spec?.interactions.some(item => item.type === 'legend-toggle')) {
                        chart.theme_spec = { extends: theme.id, legend: { show: 'always', placement: ['top'] } };
                    } else if (experimental && ['Connected Scatter Plot', 'Bump Chart', 'ECDF Plot'].includes(chart.chart_spec.chartType)) {
                        chart.theme_spec = { extends: theme.id, legend: { show: 'never' } };
                    }
                }
                variant.inputs[theme.id] = input;
                if (input.chart) {
                    const validation = primaryJSON(await call('validate_chart', { ...base, backend: 'vegalite' }));
                    if (!validation.valid || validation.warnings.length || validation.updates?.some(layer => layer.ops.some(op => !op.ok))) {
                        throw new Error(`${variant.id}/${theme.id}: ${JSON.stringify(validation)}`);
                    }
                } else {
                    const report = textResult(await call('validate_board', base));
                    if (/✗|dropped|^Warnings:/m.test(report)) throw new Error(`${sample.id}/${theme.id}: ${report}`);
                }
                const shown = await call('show', input);
                const report = textResult(shown);
                if (/✗|dropped|^Warnings:/m.test(report)) throw new Error(`${sample.id}/${theme.id}: ${report}`);
                if (!shown._meta?.flint?.board && !shown.structuredContent?.flint?.board) {
                    throw new Error(`${sample.id}/${theme.id}: show returned no drawable snapshot`);
                }
                // The MCP card id is random; this offline host gives each fixture a stable identity.
                for (const board of [shown._meta?.flint?.board, shown.structuredContent?.flint?.board]) {
                    if (board) board.id = `showcase-${variant.id}-${theme.id}`;
                }
                variant.results[theme.id] = shown;
              }
            }
            const previewInput = structuredClone(sample.input.chart || sample.input.board.charts[0]);
            delete previewInput.updates;
            delete previewInput.interaction_spec;
            const rendered = await call('render_chart', { ...previewInput, theme_spec: 'nyt', backend: 'vegalite', format: 'svg' });
            sample.preview = svgResult(rendered);
        }
        const backendInput = structuredClone(createSamples()[0].input.chart);
        delete backendInput.interaction_spec;
        const backends = [];
        for (const id of ['vegalite', 'echarts', 'chartjs']) {
            const validation = primaryJSON(await call('validate_chart', { ...backendInput, backend: id }));
            if (!validation.valid || validation.warnings.length) throw new Error(`${id}: ${JSON.stringify(validation)}`);
            const compiled = primaryJSON(await call('compile_chart', { ...backendInput, backend: id }));
            const result = await call('render_chart', { ...backendInput, backend: id, format: id === 'chartjs' ? 'png' : 'svg' });
            if (result.isError) throw new Error(JSON.stringify(result.content));
            const image = result.content.find(item => item.type === 'image');
            const svg = image ? null : svgResult(result);
            backends.push({ id, compiled: compiled.spec, width: validation.computedSize.width,
                height: validation.computedSize.height,
                artifact: image ? `data:${image.mimeType};base64,${image.data}` :
                    `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}` });
        }
        const ui = readFileSync(join(serverRoot, 'assets', 'flint-app.html'), 'utf8');
        return renderDocument({ mode: experimental ? 'experimental' : 'editorial',
            version: serverVersion, themes, samples, backendInput, backends },
            ui, collectNotices(nodeModules));
    } finally {
        await client.close();
        await server.close();
    }
}

export function renderDocument(data, ui, notices) {
    const lab = data.mode === 'experimental';
    return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval' blob:; style-src 'unsafe-inline'; img-src data: blob:; font-src data:; connect-src 'none'; frame-src about: blob:; base-uri 'none'; form-action 'none'">
<meta name="description" content="An offline gallery of real Flint charts: semantic data, themes, interactions, state updates, linked views, and static exports.">
<title>${lab ? 'Flint Interaction Lab' : 'Flint, in practice'} | Alex ACT ONE</title>
<style>
:root{color-scheme:light;--paper:#f6f4ee;--ink:#172d32;--muted:#4e6266;--line:#c8d2cf;--accent:#086b70;--wash:#e3efeb;--white:#fff;--serif:Georgia,'Times New Roman',serif;--sans:system-ui,-apple-system,'Segoe UI',sans-serif}
*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:var(--paper);color:var(--ink);font:16px/1.6 var(--sans)}
[hidden]{display:none!important}
a{color:var(--accent);text-underline-offset:4px}button,select{font:inherit}button,select,a{touch-action:manipulation}
button,select{border:1px solid var(--line);border-radius:5px;padding:10px 14px;background:var(--white);color:var(--ink)}
button{cursor:pointer}button:hover{border-color:var(--accent);background:var(--wash)}button:focus-visible,select:focus-visible,a:focus-visible,summary:focus-visible{outline:3px solid #9a5c00;outline-offset:4px}
.wrap{width:min(1200px,100% - 48px);margin:auto}.masthead{padding:22px 0;border-bottom:1px solid var(--line);display:flex;align-items:center;justify-content:space-between;gap:20px}
.brand,.eyebrow{font-size:12px;letter-spacing:.13em;text-transform:uppercase;font-weight:700}.masthead a{text-decoration:none}
.edition{font-size:13px;color:var(--muted)}header{padding:64px 0 42px}.hero-grid{display:grid;grid-template-columns:1.55fr 1fr;gap:60px;align-items:end}
.eyebrow{color:var(--accent);margin:0 0 14px}h1{font:normal clamp(48px,7vw,82px)/1.02 var(--serif);letter-spacing:-.04em;margin:0 0 24px}h2{font:normal clamp(30px,4vw,42px)/1.12 var(--serif);letter-spacing:-.025em;margin:0 0 16px}
h3{font-size:19px;line-height:1.35;margin:0 0 12px}.lede{max-width:660px;font-size:19px;color:var(--muted);margin:0}.hero-note{border-left:3px solid var(--accent);padding-left:22px;color:var(--muted)}.hero-note strong{color:var(--ink)}
.jump-links{display:flex;gap:24px;flex-wrap:wrap;margin:32px 0 0}.jump-links a{font-size:14px;font-weight:650}
.section{padding:42px 0;border-top:1px solid var(--line)}.section-intro{max-width:800px;color:var(--muted);margin:0 0 26px}.section-title{display:flex;gap:24px;justify-content:space-between;align-items:baseline}
.badge{font-size:12px;font-weight:650;padding:5px 10px;border:1px solid var(--line);border-radius:40px;white-space:nowrap}
.controls{display:flex;flex-wrap:wrap;align-items:end;gap:16px;padding:20px;background:var(--wash);border:1px solid var(--line);border-bottom:0;border-radius:10px 10px 0 0}
.control{display:flex;flex-direction:column;gap:6px;flex:1 1 270px}.control.small{flex:0 1 210px}.control label{font-size:12px;font-weight:700;letter-spacing:.07em;text-transform:uppercase}
select{width:100%;min-width:0}.instructions{padding:18px 22px;background:var(--white);border:1px solid var(--line);border-bottom:0}.instructions p{margin:4px 0}.instructions strong{color:var(--accent)}
.viewer{position:relative;background:var(--white);border:1px solid var(--line);border-top:0;border-radius:0 0 10px 10px;overflow:hidden}iframe{display:block;width:100%;height:650px;border:0;background:white}
.status{margin:0;padding:12px 22px;border-bottom:1px solid var(--line);font-size:13px;color:var(--muted)}.status.error{color:#8f2d1f;background:#fff0eb}.helper{font-size:13px;color:var(--muted)}
details{border:1px solid var(--line);border-radius:7px;margin-top:18px;background:var(--white)}summary{cursor:pointer;padding:15px 20px;font-weight:650}
.detail-body{padding:0 20px 20px}pre{overflow:auto;max-height:430px;background:#10292e;color:#edf5f2;padding:20px;border-radius:5px;font:12px/1.65 Consolas,'Courier New',monospace;white-space:pre;tab-size:2}
.state{white-space:pre-wrap;overflow-wrap:anywhere;min-height:75px;max-height:240px}.source-actions{display:flex;gap:16px;flex-wrap:wrap;align-items:center}.source-actions button{font-size:13px}
.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:26px}.card{background:var(--white);border:1px solid var(--line);border-radius:9px;overflow:hidden;display:flex;flex-direction:column}
.card-copy{padding:24px 24px 4px}.card-copy p{color:var(--muted);margin:0}.card .eyebrow{font-size:11px;margin:0 0 10px}.preview{padding:16px 18px;display:grid;place-items:center;flex:1;min-width:0}
.preview svg{max-width:100%;height:auto;display:block}.card-footer{padding:0 24px 24px}.card-footer button{font-size:13px}.card-note{font-size:12px;color:var(--muted);margin:0 0 12px}
.backend-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px}.backend-card{padding:20px;background:var(--white);border:1px solid var(--line);border-radius:8px;min-width:0}
.backend-card img{display:block;max-width:100%;height:auto;margin:22px auto 16px}.backend-card p{font-size:13px;color:var(--muted)}.backend-card summary{padding:12px;font-size:13px}
.principles{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:30px}.principles p{color:var(--muted);font-size:14px}
footer{padding:30px 0 50px;color:var(--muted);font-size:13px}footer p{max-width:900px}.notices{max-height:320px;white-space:pre-wrap;font-size:11px}
.skip{position:absolute;top:-100px;left:20px;background:white;padding:10px;z-index:5}.skip:focus{top:12px}
body[data-mode=experimental]{--paper:#101c26;--ink:#f0f3e8;--muted:#b3c5c6;--line:#3a5158;--accent:#bcf28f;--wash:#1e333d;--white:#172b35}
body[data-mode=experimental] .hero-grid{grid-template-columns:1.6fr 1fr}
body[data-mode=experimental] h1{font-family:var(--sans);font-weight:780;letter-spacing:-.065em;font-size:clamp(54px,7vw,88px)}
body[data-mode=experimental] h2{font-family:var(--sans);font-weight:720;letter-spacing:-.04em}
body[data-mode=experimental] .hero-note{border-left:0;border-top:2px solid var(--accent);padding:22px 0 0}
body[data-mode=experimental] .hero-note::before{content:'07';font:700 72px/1 var(--sans);color:var(--accent);display:block;margin-bottom:20px;letter-spacing:-.06em}
body[data-mode=experimental] .card{border-radius:0;border-top:3px solid var(--accent)}
body[data-mode=experimental] .preview{background:#fff;margin:16px 18px 20px;min-height:280px}
body[data-mode=experimental] .card-copy .eyebrow{color:var(--accent)}
body[data-mode=experimental] button{background:var(--accent);color:#15282c;border-color:var(--accent);font-weight:700}
body[data-mode=experimental] button:hover{background:#dafabf}
body[data-mode=experimental] .viewer,body[data-mode=experimental] .controls{border-radius:0}
body[data-mode=experimental] .status{color:#31484e;background:#f1f5ee}
body[data-mode=experimental] pre{background:#0b141c}
@media(max-width:800px){.hero-grid{grid-template-columns:1fr;gap:28px}header{padding:42px 0 30px}.backend-grid,.principles{grid-template-columns:1fr}.section-title{align-items:start;flex-wrap:wrap;gap:0}.edition{max-width:160px;text-align:right}.hero-note{max-width:600px}}
@media(max-width:600px){.wrap{width:calc(100% - 28px)}.grid{grid-template-columns:1fr}.masthead{align-items:start}.controls{padding:16px;gap:12px}.control,.control.small{flex:1 1 100%}#reset-example{width:100%}.instructions{padding:16px}.jump-links{gap:16px}h1{font-size:54px}.card-copy{padding:20px 20px 4px}.preview{padding:12px}.section{padding:32px 0}}
@media(max-width:800px){body[data-mode=experimental] .hero-grid{grid-template-columns:1fr}body[data-mode=experimental] .hero-note::before{font-size:48px}}
@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}*{transition:none!important}}
@media print{body{background:white}.wrap{width:100%}header{padding:20px 0}.hero-grid{gap:25px}.jump-links,.interactive-section,.card-footer,.backend-card details,footer details,.skip{display:none}.section{padding:20px 0}.card,.backend-card{break-inside:avoid}.grid{gap:15px}.card-copy p{font-size:12px}.preview{padding:8px}a{color:inherit}}
</style>
</head>
<body data-mode="${lab ? 'experimental' : 'editorial'}">
<a class="skip" href="#live">Skip to the live examples</a>
<div class="wrap">
<nav class="masthead" aria-label="Site"><a class="brand" href="../README.md">Alex ACT ONE / ${lab ? 'Interaction lab' : 'Field notes'}</a><span class="edition">Flint ${html(data.version)}<br>Self-contained offline edition</span></nav>
<header>
<div class="hero-grid">
<div><p class="eyebrow">${lab ? 'Flint / experimental edition' : 'A working chart gallery'}</p><h1>${lab ? 'A chart is a place<br>to explore.' : 'Flint, in practice.'}</h1><p class="lede">${lab ? 'Brush a sector. Reorder a comparison. Follow a team across three views. The gestures change what you can ask, not just how the chart looks.' : 'Start with data and meaning. Choose a visual language. Give the reader something useful to explore.'}</p></div>
<aside class="hero-note"><strong>${lab ? 'Seven experiments. Real semantic interactions.' : 'Real Flint charts. No server required.'}</strong><p>${lab ? 'Less familiar forms, direct manipulation, and reader-driven story beats. The actual Flint renderer is embedded. Every record is synthetic, and no data leaves this file.' : 'Eight examples connect semantic fields, chart families, themes, reader gestures, and linked views. Everything is embedded in this file. All figures use synthetic data, not business results.'}</p></aside>
</div>
<nav class="jump-links" aria-label="Page"><a href="#live">${lab ? 'Enter the lab' : 'Try the charts'}</a><a href="#gallery">${lab ? 'Explore the experiments' : 'Browse the gallery'}</a><a href="#backends">Compare exports</a><a href="${lab ? 'flint-showcase.html' : 'flint-experimental.html'}">${lab ? 'Editorial gallery' : 'Experimental interaction lab'}</a></nav>
</header>
<main>
<section class="section interactive-section" id="live" aria-labelledby="live-heading">
<div class="section-title"><h2 id="live-heading">${lab ? 'Pick a question. Try a gesture.' : 'Try one change at a time.'}</h2><span class="badge">Live Vega-Lite viewer</span></div>
<p class="section-intro">Choose an example and a theme. These are the same controls and renderer shipped in the pinned Flint MCP App, connected to a small offline host rather than an agent session.</p>
<div class="controls">
<div class="control"><label for="sample-select">Example</label><select id="sample-select">${data.samples.map(sample => `<option value="${html(sample.id)}">${html(sample.title)}</option>`).join('')}</select></div>
<div class="control small"><label for="theme-select">Theme</label><select id="theme-select">${data.themes.map(theme => `<option value="${html(theme.id)}">${html(theme.label)} (${html(theme.id)})</option>`).join('')}</select></div>
<div class="control small" id="step-control" hidden><label for="step-select">Story beat</label><select id="step-select"><option value="">01 / Full field</option></select></div>
<button type="button" id="reset-example">Reset example</button>
</div>
<div class="instructions"><p id="sample-description"></p><p><strong>Try this:</strong> <span id="try-it"></span></p></div>
<div class="viewer"><p class="status" id="live-status" role="status" aria-live="polite">Starting the embedded Flint viewer...</p><iframe id="flint-viewer" title="Interactive Flint chart example" sandbox="allow-scripts"></iframe></div>
<p class="helper">Escape resets supported chart gestures; Reset example also restores theme edits and initial state. The embedded editor can change the chart locally. It cannot call tools, send a chat message, or access files.${lab ? ' Layered line/point views use labels and tooltips instead of a separate legend.' : ''}</p>
<details><summary>Inspect the Flint input</summary><div class="detail-body"><p class="helper">This is ChartAssemblyInput (or a board), not handwritten Vega-Lite. Edits made inside the viewer are reported in Live state; this source remains the reproducible starting input.</p><div class="source-actions"><button type="button" id="download-spec">Download starting spec</button><span class="helper">JSON, including the synthetic rows</span></div><pre id="spec-output"></pre></div></details>
<details${lab ? ' open' : ''}><summary>Live state and interaction read-back</summary><div class="detail-body"><p class="helper">Flint reports committed gestures, visible state, and panel edits here. Hover-only feedback may not produce a committed state update.</p><pre class="state" id="state-output" aria-live="polite">Waiting for the viewer.</pre></div></details>
<noscript><p class="status error">JavaScript is required for the live viewer. The SVG gallery and static backend exports below are still available.</p></noscript>
</section>
<section class="section" id="gallery" aria-labelledby="gallery-heading">
<div class="section-title"><h2 id="gallery-heading">${lab ? 'Seven ways to ask more of a chart.' : 'One grammar. Different questions.'}</h2><span class="badge">${data.samples.length} worked examples</span></div>
<p class="section-intro">These are real SVG exports generated by Flint, not illustrations of what it might draw. Open an example above to exercise its behavior. Theme and interaction support are checked against the installed 1.0.1 runtime.</p>
<div class="grid">${data.samples.map((sample, index) => `
<article class="card"><div class="card-copy"><p class="eyebrow">${String(index + 1).padStart(2, '0')} / ${html(sample.category)}</p><h3>${html(sample.title)}</h3><p>${html(sample.description)}</p></div>
<div class="preview" role="img" aria-label="${html(sample.input.chart?.chart_spec.title || sample.input.board.title)}">${sample.preview}</div>
<div class="card-footer"><p class="card-note">${sample.input.board ? 'Preview: the first chart. Open live for the linked views.' : sample.id === 'updates' || sample.steps ? 'Preview: the base chart. Open live for the update layers.' : 'Static preview. Open live to try the interactions.'}</p><button type="button" data-open="${html(sample.id)}">${lab ? 'Run this experiment' : 'Try this example'}</button></div></article>`).join('')}
</div>
</section>
<section class="section" id="backends" aria-labelledby="backends-heading">
<h2 id="backends-heading">The same input, three renderers.</h2>
<p class="section-intro">One unthemed semantic bar-chart input is compiled and rendered by each supported MCP backend. Vega-Lite and ECharts export SVG; Chart.js exports PNG. These static exports do not imply theme or interaction parity across backends.</p>
<div class="backend-grid">${data.backends.map(backend => `<article class="backend-card"><h3>${html(({ vegalite: 'Vega-Lite', echarts: 'ECharts', chartjs: 'Chart.js' })[backend.id])}</h3><p>${backend.id === 'chartjs' ? 'PNG raster export' : 'SVG vector export'}</p><img src="${backend.artifact}" width="${backend.width}" height="${backend.height}" alt="Synthetic regional orders: North 128, South 96, East 112, West 154"><details><summary>Inspect compiled output</summary><div class="detail-body"><pre>${html(JSON.stringify(backend.compiled, null, 2))}</pre></div></details></article>`).join('')}</div>
<details><summary>Inspect the shared backend input</summary><div class="detail-body"><pre>${html(JSON.stringify(data.backendInput, null, 2))}</pre></div></details>
</section>
<section class="section" id="how" aria-labelledby="how-heading">
<h2 id="how-heading">What makes these examples Flint?</h2>
<div class="principles">
<div><h3>Meaning before styling</h3><p>Each input declares semantic types as well as fields: Region, Count, YearMonth, Amount, or a bounded Score. The renderer uses those declarations for scales, formatting, and layout.</p></div>
<div><h3>Behavior separate from state</h3><p><code>interaction_spec</code> describes what a reader can do. <code>updates</code> describes agent-authored state. A board's <code>link_spec</code> connects selections through shared fields.</p></div>
<div><h3>A checked, portable starting point</h3><p>The build validates each example and theme before embedding it. The live surface uses the actual Flint App UI. Static previews remain readable without JavaScript or a network connection.</p></div>
</div>
</section>
</main>
<footer>
<p><strong>Scope:</strong> a representative capability gallery, not an exhaustive chart catalog or an accessibility certification. Examples use synthetic records. Typeface appearance depends on available system fonts; no font service is contacted.</p>
<p>Static exports are generated in UTC for reproducible date annotations. The live viewer remains a separate host-rendered surface.</p>
<p><strong>Rebuild:</strong> from a source checkout with the pinned Flint runtime provisioned, run <code>node scripts\\build-flint-showcase.mjs${lab ? ' --experimental' : ''}</code>. Use <code>--check</code> to check that this file matches the build. No package is installed or fetched by the builder.</p>
<p><a href="https://microsoft.github.io/flint-chart/" rel="noreferrer">Flint documentation</a> &middot; <a href="https://microsoft.github.io/flint-chart/#/interactions" rel="noreferrer">Interaction reference</a> &middot; Opening external links requires a connection.</p>
<details><summary>Third-party notices</summary><div class="detail-body"><p>Flint and its embedded UI are distributed under their upstream open-source licenses. The original bundle is embedded unchanged; notices for its runtime dependencies and React are included below. Static exports are generated from the same pinned runtime.</p><pre class="notices">${html(notices)}</pre></div></details>
</footer>
</div>
<script type="application/json" id="flint-runtime">${json(ui)}</script>
<script type="application/json" id="showcase-data">${json(data)}</script>
<script id="showcase-script">
'use strict';
const gallery = JSON.parse(document.getElementById('showcase-data').textContent);
const runtime = JSON.parse(document.getElementById('flint-runtime').textContent);
const frame = document.getElementById('flint-viewer');
const sampleSelect = document.getElementById('sample-select');
const themeSelect = document.getElementById('theme-select');
const stepSelect = document.getElementById('step-select');
const status = document.getElementById('live-status');
let ready = false;
let startupTimer;
const current = () => gallery.samples.find(sample => sample.id === sampleSelect.value);
const variant = () => current().steps?.find(step => step.id === stepSelect.value) || current();
const notify = (method, params) => frame.contentWindow.postMessage({ jsonrpc: '2.0', method, params }, '*');
function setStatus(message, failed = false) {
    status.textContent = message;
    status.classList.toggle('error', failed);
}
function deliver() {
    const sample = current();
    const input = structuredClone(variant().inputs[themeSelect.value]);
    notify('ui/notifications/tool-input', { arguments: input });
    notify('ui/notifications/tool-result', variant().results[themeSelect.value]);
    setStatus('Live: ' + sample.title + ' / ' + themeSelect.selectedOptions[0].textContent);
}
function mount() {
    const sample = current();
    ready = false;
    clearTimeout(startupTimer);
    document.getElementById('sample-description').textContent = sample.description;
    document.getElementById('try-it').textContent = sample.tryIt;
    const input = structuredClone(variant().inputs[themeSelect.value]);
    document.getElementById('spec-output').textContent = JSON.stringify(input, null, 2);
    document.getElementById('state-output').textContent = 'Waiting for ' + sample.title + '.';
    frame.style.height = (sample.input.board ? 850 : 650) + 'px';
    setStatus('Loading ' + sample.title + '...');
    frame.srcdoc = runtime;
    startupTimer = setTimeout(() => {
        if (!ready) setStatus('The embedded viewer did not initialize. Static previews remain below; check browser script/CSP restrictions.', true);
    }, 15000);
}
window.addEventListener('message', event => {
    if (event.source !== frame.contentWindow) return;
    const message = event.data;
    if (!message || message.jsonrpc !== '2.0' || typeof message.method !== 'string') return;
    const respond = result => frame.contentWindow.postMessage({ jsonrpc: '2.0', id: message.id, result }, '*');
    if (message.method === 'ui/initialize' && message.id !== undefined) {
        respond({ protocolVersion: message.params.protocolVersion,
            hostInfo: { name: 'Alex ACT ONE offline gallery', version: '1' },
            hostCapabilities: { updateModelContext: {} },
            hostContext: { theme: 'light', displayMode: 'inline', availableDisplayModes: ['inline'], locale: 'en-US' } });
    } else if (message.method === 'ui/notifications/initialized') {
        ready = true;
        clearTimeout(startupTimer);
        deliver();
    } else if (message.method === 'ui/update-model-context' && message.id !== undefined) {
        const content = message.params?.content || [];
        document.getElementById('state-output').textContent = content.filter(item => item.type === 'text').map(item => item.text).join('\\n') ||
            JSON.stringify(message.params, null, 2);
        respond({});
    } else if (message.method === 'ui/notifications/size-changed') {
        const height = message.params?.height;
        if (Number.isFinite(height) && height > 0) frame.style.height = Math.min(1600, Math.max(450, Math.ceil(height) + 10)) + 'px';
    } else if (message.id !== undefined) {
        const reason = 'This request is not available in the offline showcase: ' + message.method;
        frame.contentWindow.postMessage({ jsonrpc: '2.0', id: message.id,
            error: { code: -32601, message: reason } }, '*');
        setStatus(reason, true);
    }
});
function selectSample() {
    const steps = current().steps || [];
    document.getElementById('step-control').hidden = !steps.length;
    stepSelect.replaceChildren(new Option('01 / Full field', ''), ...steps.map(step => new Option(step.label, step.id)));
    mount();
}
sampleSelect.addEventListener('change', selectSample);
themeSelect.addEventListener('change', mount);
stepSelect.addEventListener('change', mount);
document.getElementById('reset-example').addEventListener('click', () => { stepSelect.value = ''; mount(); });
document.querySelectorAll('[data-open]').forEach(button => button.addEventListener('click', () => {
    sampleSelect.value = button.dataset.open;
    selectSample();
    document.getElementById('live').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
}));
document.getElementById('download-spec').addEventListener('click', () => {
    const blob = new Blob([document.getElementById('spec-output').textContent + '\\n'], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'flint-' + sampleSelect.value + '-' + themeSelect.value + '.json';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
});
selectSample();
</script>
</body>
</html>
`;
}

export function assertCurrentArtifact(output, generated) {
    if (!existsSync(output)) throw new Error(`Showcase is missing: ${output}`);
    const actual = readFileSync(output, 'utf8');
    if (actual === generated) return;
    let offset = 0;
    while (offset < Math.min(actual.length, generated.length) && actual[offset] === generated[offset]) offset++;
    const context = value => JSON.stringify(value.slice(Math.max(0, offset - 100), offset + 180));
    throw new Error(`Showcase is stale at UTF-16 offset ${offset}. ` +
        `Expected (${Buffer.byteLength(generated)} bytes): ${context(generated)}. ` +
        `Actual (${Buffer.byteLength(actual)} bytes): ${context(actual)}. ` +
        'Use the reviewed runtime/environment; inspect this difference before rebuilding.');
}

async function main() {
    process.env.TZ = 'UTC';
    let runtime = process.env.ALEX_ACT_ONE_RUNTIME_ROOT || join(homedir(), '.copilot', 'plugin-data', 'alex-act-one', 'runtime');
    let output;
    let check = false;
    let experimental = false;
    const args = process.argv.slice(2);
    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--check') check = true;
        else if (args[i] === '--experimental') experimental = true;
        else if (['--runtime-root', '--out'].includes(args[i]) && args[i + 1]) {
            const key = args[i++];
            if (key === '--runtime-root') runtime = resolve(args[i]);
            else output = resolve(args[i]);
        } else throw new Error('Usage: node scripts\\build-flint-showcase.mjs [--experimental] [--runtime-root <directory>] [--out <file>] [--check]');
    }
    output ||= join(ROOT, 'docs', experimental ? 'flint-experimental.html' : 'flint-showcase.html');
    const content = await buildShowcase(runtime, { experimental });
    if (check) {
        assertCurrentArtifact(output, content);
        console.log('Offline showcase matches the pinned runtime and all validated examples.');
    } else {
        writeFileSync(output, content);
        console.log(`Built offline Flint ${experimental ? 'interaction lab' : 'showcase'}: ${Buffer.byteLength(content).toLocaleString('en-US')} bytes; ${experimental ? 7 : 8} samples, 3 themes, 3 backend exports.`);
    }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    main().catch(error => { console.error(error.message); process.exitCode = 1; });
}
