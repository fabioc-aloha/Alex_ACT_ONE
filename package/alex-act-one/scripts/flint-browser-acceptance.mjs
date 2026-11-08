import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, realpathSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import runtimeStatus from './shared/runtime-status.cjs';

export const requiredChecks = Object.freeze([
    'offline', 'images', 'matrix', 'keyboard', 'focus', 'live-regions', 'contrast',
    'linked-selection', 'reset', 'resize', 'saved-spec', 'provenance',
    'chart-contrast', 'keyboard-matrix',
]);

export function contrastRatio(foreground, background) {
    for (const color of [foreground, background]) {
        if (!Array.isArray(color) || color.length !== 3 ||
            color.some(value => !Number.isFinite(value) || value < 0 || value > 255)) {
            throw new Error('Expected an opaque RGB color with three channels in [0,255]');
        }
    }
    const luminance = color => color.map(value => {
        const channel = value / 255;
        return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
    }).reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0);
    const values = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
    return (values[0] + 0.05) / (values[1] + 0.05);
}

function paint(value) {
    const match = typeof value === 'string' && value.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)$/);
    if (!match) throw new Error(`Unsupported computed paint color: ${value}`);
    const channels = match.slice(1, 4).map(Number);
    contrastRatio(channels, channels);
    const alpha = match[4] === undefined ? 1 : Number(match[4]);
    if (!Number.isFinite(alpha) || alpha < 0 || alpha > 1) throw new Error(`Invalid paint opacity: ${value}`);
    return { channels, alpha };
}

export function measureChartContrast(sample) {
    if (!['text', 'mark'].includes(sample.kind)) throw new Error(`Unsupported contrast kind: ${sample.kind}`);
    for (const value of [sample.opacity, sample.backgroundOpacity]) {
        if (!Number.isFinite(value) || value < 0 || value > 1) throw new Error(`Invalid measured opacity: ${value}`);
    }
    const foreground = paint(sample.foreground);
    const background = paint(sample.background);
    const canvas = paint(sample.canvas);
    if (canvas.alpha !== 1) throw new Error('Chart canvas color must be opaque');
    const composite = (color, base, opacity) => color.channels.map((channel, index) =>
        channel * color.alpha * opacity + base[index] * (1 - color.alpha * opacity));
    const backdrop = composite(background, canvas.channels, sample.backgroundOpacity);
    let required = 3;
    if (sample.kind === 'text') {
        if (!Number.isFinite(sample.fontSize) || sample.fontSize <= 0 ||
            !Number.isFinite(sample.fontWeight) || sample.fontWeight < 1) throw new Error('Invalid measured font size or weight');
        required = sample.fontSize >= 24 || sample.fontSize >= 56 / 3 && sample.fontWeight >= 700 ? 3 : 4.5;
    }
    const fillRatio = contrastRatio(composite(foreground, backdrop, sample.opacity), backdrop);
    let strokeRatio = null;
    if (sample.kind === 'mark' && sample.stroke && sample.stroke !== 'none' && sample.strokeWidth >= 1) {
        if (!Number.isFinite(sample.strokeOpacity) || sample.strokeOpacity < 0 || sample.strokeOpacity > 1) {
            throw new Error('Invalid measured stroke opacity');
        }
        strokeRatio = contrastRatio(composite(paint(sample.stroke), canvas.channels, sample.strokeOpacity), canvas.channels);
    }
    const ratio = Math.max(fillRatio, strokeRatio ?? 0);
    return { ratio, fillRatio, strokeRatio, required, passed: ratio >= required };
}

export function collectChartContrastSamples() {
    const opacity = element => {
        let result = 1;
        for (let node = element; node; node = node.parentElement) result *= Number(getComputedStyle(node).opacity);
        return result;
    };
    const samples = [];
    for (const svg of document.querySelectorAll('svg.marks')) {
        let canvas;
        for (let node = svg; node; node = node.parentElement) {
            const color = getComputedStyle(node).backgroundColor;
            if (color !== 'transparent' && color !== 'rgba(0, 0, 0, 0)') { canvas = color; break; }
        }
        if (!canvas) throw new Error('No observed chart canvas background');
        const elements = [...svg.querySelectorAll('text')].filter(element => element.textContent.trim());
        elements.push(...svg.querySelectorAll('g.role-mark path[role="graphics-symbol"][aria-label]'));
        for (const element of elements) {
            const bounds = element.getBoundingClientRect();
            if (bounds.width <= 0 || bounds.height <= 0) continue;
            const style = getComputedStyle(element);
            const kind = element.tagName.toLowerCase() === 'text' ? 'text' : 'mark';
            const property = style.fill !== 'none' ? 'fill' : 'stroke';
            if (style[property] === 'none') throw new Error('Chart target has no observed fill or stroke');
            let point = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
            if (property === 'stroke' && typeof element.getPointAtLength === 'function') {
                const position = element.getPointAtLength(element.getTotalLength() / 2);
                point = new DOMPoint(position.x, position.y).matrixTransform(element.getScreenCTM());
            }
            if (point.x < 0 || point.x >= innerWidth || point.y < 0 || point.y >= innerHeight) {
                throw new Error('Contrast target is outside the visible chart viewport');
            }
            const stack = document.elementsFromPoint(point.x, point.y);
            const index = stack.indexOf(element);
            const behind = (index >= 0 ? stack.slice(index + 1) : stack).find(candidate =>
                candidate !== element && candidate.closest('svg.marks') === svg &&
                candidate.matches('path,rect,circle,ellipse,polygon') &&
                !['none', 'rgba(0, 0, 0, 0)'].includes(getComputedStyle(candidate).fill) &&
                opacity(candidate) * Number(getComputedStyle(candidate).fillOpacity) > 0);
            samples.push({
                kind, chart: svg.closest('[data-flint-chart-id]')?.getAttribute('data-flint-chart-id'),
                label: element.getAttribute('aria-label') || element.textContent,
                foreground: style[property], opacity: opacity(element) * Number(style[property + 'Opacity']),
                stroke: style.stroke, strokeWidth: parseFloat(style.strokeWidth),
                strokeOpacity: opacity(element) * Number(style.strokeOpacity),
                background: behind ? getComputedStyle(behind).fill : canvas,
                backgroundOpacity: behind ? opacity(behind) * Number(getComputedStyle(behind).fillOpacity) : 1,
                canvas, fontSize: parseFloat(style.fontSize), fontWeight: Number(style.fontWeight),
            });
        }
    }
    return samples;
}

export function validateDownloadedSpec(content, expected) {
    const actual = JSON.parse(content);
    assert.ok(actual.chart || actual.board, 'Saved file is not a chart or board input');
    assert.deepEqual(actual, expected, 'Saved file differs from the selected semantic starting input');
}

export function summarizeAcceptance(checks) {
    const seen = new Set();
    for (const check of checks) {
        if (!requiredChecks.includes(check.id)) throw new Error(`Unknown check: ${check.id}`);
        if (seen.has(check.id)) throw new Error(`Duplicate check: ${check.id}`);
        if (!['passed', 'failed', 'blocked'].includes(check.status)) throw new Error(`Invalid check status: ${check.status}`);
        seen.add(check.id);
    }
    for (const id of requiredChecks) if (!seen.has(id)) throw new Error(`Missing check: ${id}`);
    return { passed: checks.every(check => check.status === 'passed'), checks };
}

export async function waitForFrameViewport(page, frame) {
    await page.locator('#flint-viewer').scrollIntoViewIfNeeded();
    const deadline = Date.now() + 10000;
    let previous;
    let parent;
    let child;
    while (Date.now() < deadline) {
        parent = await page.locator('#flint-viewer').evaluate(element => Math.round(element.clientWidth));
        child = await frame.evaluate(() => innerWidth);
        if (!Number.isFinite(parent) || !Number.isFinite(child)) throw new Error('Invalid iframe viewport dimensions');
        if (parent > 0 && child === parent && previous === parent) return parent;
        previous = child === parent ? parent : undefined;
        await page.waitForTimeout(100);
    }
    throw new Error(`Iframe viewport did not settle: current parent=${parent}, child=${child}`);
}

export async function waitForChartLayout(frame) {
    await frame.waitForFunction(function stable() {
        const charts = [...document.querySelectorAll('svg.marks')].map(svg => {
            const bounds = svg.getBoundingClientRect();
            const clips = [];
            for (let parent = svg.parentElement; parent; parent = parent.parentElement) {
                if (/(hidden|clip|auto)/.test(getComputedStyle(parent).overflowX)) {
                    const clip = parent.getBoundingClientRect();
                    clips.push([clip.left, clip.right]);
                }
            }
            return { x: bounds.x, y: bounds.y, left: bounds.left, right: bounds.right,
                width: bounds.width, height: bounds.height, clips };
        });
        const signature = JSON.stringify({ viewport: innerWidth, charts });
        const now = performance.now();
        if (signature !== stable.previous) {
            stable.previous = signature;
            stable.since = now;
        }
        // Flint 1.0.1 debounces relayout by 150 ms; two 100 ms polls can see only the old fitting chart.
        return now - stable.since >= 300 && charts.length > 0 && charts.every(chart =>
            chart.width > 0 && chart.height > 0 && chart.left >= -1 && chart.right <= innerWidth + 1 &&
            chart.clips.every(([left, right]) => chart.left >= left - 1 && chart.right <= right + 1));
    }, null, { polling: 100, timeout: 10000 });
}

function rgb(value) {
    const color = paint(value);
    if (color.alpha !== 1) throw new Error(`Unsupported nonopaque computed color: ${value}`);
    return color.channels;
}

export async function verifyShowcasePage(page, { nativeFocus = false, downloads = true } = {}) {
    const url = page.url();
    if (!/^file:.*\/flint-(?:showcase|experimental)\.html$/i.test(url)) {
        throw new Error('Acceptance is scoped to an explicitly opened local Flint demo page');
    }

    const checks = [];
    const requests = [];
    const errors = [];
    const requestListener = request => { if (/^https?:/i.test(request.url())) requests.push(request.url()); };
    const errorListener = error => errors.push(String(error));
    const consoleListener = message => { if (message.type() === 'error') errors.push(message.text()); };
    const abort = route => route.abort();
    const originalViewport = page.viewportSize();
    let focus;
    const check = async (id, action) => {
        try {
            checks.push({ id, status: 'passed', details: await action() });
        } catch (error) {
            checks.push({ id, status: 'failed', details: String(error.stack || error) });
        }
    };
    const block = (id, reason) => checks.push({ id, status: 'blocked', details: reason });
    const currentFrame = () => {
        const frames = page.frames().filter(frame => frame !== page.mainFrame());
        assert.equal(frames.length, 1, 'Expected exactly the embedded demo frame');
        return frames[0];
    };
    async function ready(expectedCharts) {
        await page.waitForFunction(() => document.getElementById('live-status').textContent.startsWith('Live:'),
            null, { polling: 100, timeout: 15000 });
        const frame = currentFrame();
        await frame.waitForFunction(count =>
            document.querySelectorAll('[data-flint-chart-id] svg.marks').length === count &&
            document.querySelectorAll('svg.marks [role="graphics-symbol"][aria-label]').length > 0,
        expectedCharts, { polling: 100, timeout: 15000 });
        return frame;
    }
    async function choose(sample, theme, step) {
        await remount(() => page.locator('#sample-select').selectOption(sample.id));
        await remount(() => page.locator('#theme-select').selectOption(theme.id));
        if (step) await remount(() => page.locator('#step-select').selectOption(step.id));
        return ready(sample.input.board?.charts.length || 1);
    }
    async function remount(action) {
        await Promise.all([
            page.waitForEvent('framenavigated', {
                predicate: frame => frame.parentFrame() === page.mainFrame(), timeout: 15000,
            }),
            action(),
        ]);
    }
    async function key(frame, keyName) {
        if (!nativeFocus) {
            const target = frame.locator(':focus');
            assert.equal(await target.count(), 1, 'No actual keyboard focus target');
            return target.press(keyName);
        }
        const session = await page.context().newCDPSession(frame);
        try {
            const code = keyName === 'Escape' ? 27 : 13;
            await session.send('Input.dispatchKeyEvent', { type: 'keyDown', key: keyName, code: keyName, windowsVirtualKeyCode: code });
            await session.send('Input.dispatchKeyEvent', { type: 'keyUp', key: keyName, code: keyName, windowsVirtualKeyCode: code });
        } finally { await session.detach(); }
    }
    async function semantics(frame, field, selected) {
        return frame.evaluate(({ field, selected }) =>
            [...document.querySelectorAll('[data-flint-chart-id]')].map(chart => {
                const marks = [...chart.querySelectorAll('svg.marks path[role="graphics-symbol"][aria-label]')]
                    .filter(mark => mark.getAttribute('aria-label').includes(field + ': '));
                const opacity = mark => {
                    let result = 1;
                    for (let node = mark; node && node !== chart; node = node.parentElement) {
                        result *= Number(getComputedStyle(node).opacity);
                    }
                    return result;
                };
                const chosen = marks.filter(mark => mark.getAttribute('aria-label').includes(field + ': ' + selected));
                const other = marks.filter(mark => !chosen.includes(mark));
                const chosenStrokes = new Set(chosen.map(mark => mark.getAttribute('stroke')).filter(Boolean));
                const otherStrokes = new Set(other.map(mark => mark.getAttribute('stroke')).filter(Boolean));
                // Line selections can be redrawn in a separate overlay while every base path is dimmed.
                const overlays = [...chart.querySelectorAll('svg:not(.marks) path')].filter(mark => {
                    const svg = mark.closest('svg');
                    const stroke = mark.getAttribute('stroke');
                    return svg.style.position === 'absolute' && svg.style.pointerEvents === 'none' &&
                        chosenStrokes.has(stroke) && !otherStrokes.has(stroke);
                });
                return {
                    id: chart.getAttribute('data-flint-chart-id'),
                    population: [...new Set(marks.map(mark => mark.getAttribute('aria-label')))].sort(),
                    selected: chosen.length ? Math.max(...chosen.map(opacity), ...overlays.map(opacity)) : null,
                    other: other.length ? Math.max(...other.map(opacity)) : null,
                    selectedOverlayPaths: overlays.length,
                };
            }), { field, selected });
    }
    page.on('request', requestListener);
    page.on('pageerror', errorListener);
    page.on('console', consoleListener);
    await page.route(/^https?:/, abort);
    try {
        if (nativeFocus) {
            focus = await page.context().newCDPSession(page);
            await focus.send('Emulation.setFocusEmulationEnabled', { enabled: true });
        }
        await page.setViewportSize({ width: 1440, height: 1000 });
        await page.goto(url, { waitUntil: 'domcontentloaded' });
        const gallery = await page.locator('#showcase-data').textContent().then(JSON.parse);
        const browser = await page.evaluate(() => navigator.userAgent);
        await check('provenance', async () => {
            const provenance = JSON.parse(await page.locator('#build-provenance').textContent());
            assert.equal(provenance.sourceStatus, 'repository-source-demo');
            assert.equal(provenance.dataSha256, createHash('sha256').update(JSON.stringify(gallery)).digest('hex'));
            const app = JSON.parse(await page.locator('#flint-runtime').textContent());
            assert.equal(provenance.appUiSha256, createHash('sha256').update(app).digest('hex'));
            return provenance;
        });
        await check('images', async () => {
            const images = await page.evaluate(async () => Promise.all([...document.images].map(async image => {
                await image.decode();
                return { width: image.naturalWidth, height: image.naturalHeight };
            })));
            assert.equal(images.length, gallery.backends.length);
            assert.ok(images.every(image => image.width > 0 && image.height > 0));
            return images;
        });
        await check('matrix', async () => {
            let cases = 0;
            for (const sample of gallery.samples) {
                for (const theme of gallery.themes) {
                    for (const step of [null, ...(sample.steps || [])]) {
                        const frame = await choose(sample, theme, step);
                        const text = await frame.locator('body').innerText();
                        assert.doesNotMatch(text, /Failed to render|Error rendering|Invalid specification/i);
                        cases++;
                    }
                }
            }
            return { cases, samples: gallery.samples.length, themes: gallery.themes.length };
        });
        const accessibleSamples = gallery.samples.filter(sample => !sample.input.chart?.updates &&
            (sample.input.chart ? [sample.input.chart] : sample.input.board.charts).some(chart =>
                chart.interaction_spec?.interactions.some(item => item.type === 'accessible-navigation')));
        await check('chart-contrast', async () => {
            const results = [];
            for (const sample of accessibleSamples) {
                for (const theme of gallery.themes) {
                    const frame = await choose(sample, theme);
                    await waitForFrameViewport(page, frame);
                    await waitForChartLayout(frame);
                    const samples = await frame.evaluate(collectChartContrastSamples);
                    assert.ok(samples.some(item => item.kind === 'text') && samples.some(item => item.kind === 'mark'),
                        `${sample.id}/${theme.id}: no measured chart text or data marks`);
                    const measured = samples.map(item => ({ ...item, ...measureChartContrast(item) }));
                    results.push({ sample: sample.id, theme: theme.id, measured });
                }
            }
            const failures = results.flatMap(result => result.measured.filter(item => !item.passed)
                .map(item => ({ sample: result.sample, theme: result.theme, ...item })));
            assert.deepEqual(failures, [], `Measured SVG contrast failures: ${JSON.stringify(failures)}`);
            return { scope: 'Baseline keyboard-enabled examples; no deliberate update-layer dimming', results };
        });
        await check('keyboard-matrix', async () => {
            const results = [];
            for (const sample of accessibleSamples) {
                const frame = await choose(sample, gallery.themes[0]);
                for (const target of await frame.locator('[data-flint-accessible-focus]').all()) {
                    const before = await target.getAttribute('aria-label');
                    await target.focus();
                    await key(frame, 'Enter');
                    await frame.waitForFunction(({ previous, chart }) =>
                        document.querySelector(`[data-flint-chart-id="${chart}"] [data-flint-accessible-focus]`)
                            ?.getAttribute('aria-label') !== previous,
                    { previous: before, chart: await target.evaluate(element =>
                        element.closest('[data-flint-chart-id]').getAttribute('data-flint-chart-id')) },
                    { polling: 100, timeout: 5000 });
                    const entered = await target.getAttribute('aria-label');
                    await key(frame, 'Escape');
                    assert.equal(await target.getAttribute('aria-label'), before, 'Escape did not restore the chart navigation root');
                    assert.equal(await target.evaluate(element => document.activeElement === element), true,
                        'Chart navigation lost actual keyboard focus');
                    results.push({ sample: sample.id, before, entered, restored: true });
                }
            }
            assert.ok(results.length > 1, 'Keyboard coverage did not expand beyond the original example');
            return { theme: gallery.themes[0].id, results };
        });
        const first = gallery.samples.find(sample =>
            sample.input.chart?.interaction_spec?.interactions.some(item => item.type === 'accessible-navigation'));
        assert.ok(first, 'No keyboard-navigation example was declared by this gallery');
        let frame = await choose(first, gallery.themes[0]);
        await check('keyboard', async () => {
            await page.locator('#sample-select').focus();
            await page.keyboard.press('Tab');
            assert.equal(await page.evaluate(() => document.activeElement.id), 'theme-select');
            const target = frame.locator('[data-flint-accessible-focus]').first();
            const before = await target.getAttribute('aria-label');
            await target.focus();
            await key(frame, 'Enter');
            await frame.waitForFunction(previous =>
                document.querySelector('[data-flint-accessible-focus]')?.getAttribute('aria-label') !== previous,
            before, { polling: 100, timeout: 5000 });
            return { input: nativeFocus ? 'child-scoped CDP key' : 'Playwright key', before, after: await target.getAttribute('aria-label') };
        });
        await check('focus', async () => {
            await page.locator('#theme-select').focus();
            const style = await page.locator('#theme-select').evaluate(element => {
                const style = getComputedStyle(element);
                let background;
                for (let node = element.parentElement; node; node = node.parentElement) {
                    const value = getComputedStyle(node).backgroundColor;
                    if (value !== 'rgba(0, 0, 0, 0)' && value !== 'transparent') { background = value; break; }
                }
                return { active: document.activeElement === element, outline: style.outlineStyle,
                    width: parseFloat(style.outlineWidth), color: style.outlineColor, background };
            });
            assert.ok(style.active && style.outline !== 'none' && style.width >= 2, JSON.stringify(style));
            const ratio = contrastRatio(rgb(style.color), rgb(style.background));
            assert.ok(ratio >= 3, `Focus indicator contrast ${ratio} < 3`);
            return { ...style, ratio };
        });
        await check('live-regions', async () => {
            assert.equal(await page.locator('#live-status').getAttribute('aria-live'), 'polite');
            assert.equal(await page.locator('#state-output').getAttribute('aria-live'), 'polite');
            const regions = await frame.locator('[aria-live]').count();
            assert.ok(regions > 0, 'No keyboard feedback live region in the actual chart');
            return { chartRegions: regions, screenReaderAnnouncement: 'not observed; DOM contract only' };
        });
        await check('contrast', async () => {
            const colors = await page.evaluate(() => {
                const background = element => {
                    for (let node = element; node; node = node.parentElement) {
                        const value = getComputedStyle(node).backgroundColor;
                        if (value !== 'rgba(0, 0, 0, 0)' && value !== 'transparent') return value;
                    }
                    return 'rgb(255,255,255)';
                };
                return ['body', '.lede', '.helper', 'label', 'button', 'select', 'summary'].map(selector => {
                    const element = document.querySelector(selector);
                    return { selector, foreground: getComputedStyle(element).color, background: background(element) };
                });
            });
            return colors.map(color => {
                const ratio = contrastRatio(rgb(color.foreground), rgb(color.background));
                assert.ok(ratio >= 4.5, `${color.selector}: ${ratio} < 4.5`);
                return { selector: color.selector, ratio };
            });
        });
        const linked = gallery.samples.find(sample => sample.input.board);
        frame = await choose(linked, gallery.themes[gallery.themes.length - 1]);
        const field = linked.input.board.link_spec.fields[0];
        const source = linked.input.board.charts.find(chart => chart.chart_spec.chartType === 'Scatter Plot');
        assert.ok(source, 'No point-mark linked sender is declared by this gallery');
        const selected = source.data.values[0][field];
        const baseline = await semantics(frame, field, selected);
        await check('linked-selection', async () => {
            const selector = `[data-flint-chart-id="flint-board-${source.id}"] svg.marks path[role="graphics-symbol"][aria-label]`;
            const index = await frame.locator(selector).evaluateAll((marks, { field, selected }) =>
                marks.findIndex(mark => {
                    const bounds = mark.getBoundingClientRect();
                    return mark.getAttribute('aria-label').includes(field + ': ' + selected) &&
                        mark.hasAttribute('fill') && mark.getAttribute('fill') !== 'none' && bounds.width > 1 && bounds.height > 1;
                }), { field, selected });
            assert.ok(index >= 0, 'No selectable semantic mark');
            const mark = frame.locator(selector).nth(index);
            if (nativeFocus) {
                await mark.scrollIntoViewIfNeeded();
                const point = await mark.evaluate(mark => {
                    const bounds = mark.getBoundingClientRect();
                    return { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
                });
                const session = await page.context().newCDPSession(frame);
                try {
                    await session.send('Input.dispatchMouseEvent', { type: 'mousePressed', ...point, button: 'left', clickCount: 1 });
                    await session.send('Input.dispatchMouseEvent', { type: 'mouseReleased', ...point, button: 'left', clickCount: 1 });
                } finally { await session.detach(); }
            } else await mark.click();
            await page.waitForFunction(() =>
                !/Waiting for/.test(document.getElementById('state-output').textContent),
            null, { polling: 100, timeout: 5000 });
            const after = await semantics(frame, field, selected);
            assert.equal(after.length, linked.input.board.charts.length);
            after.forEach((chart, index) => {
                assert.deepEqual(chart.population, baseline[index].population, `${chart.id}: population changed`);
                assert.ok(chart.selected !== null && chart.other !== null && chart.selected > chart.other,
                    `${chart.id}: no semantic recipient emphasis: ${JSON.stringify(chart)}`);
            });
            return { field, selected, recipients: after };
        });
        await check('reset', async () => {
            await frame.locator(`[data-flint-chart-id="flint-board-${source.id}"] [data-flint-accessible-focus]`).focus();
            await key(frame, 'Escape');
            const after = await semantics(frame, field, selected);
            assert.deepEqual(after, baseline, 'Escape did not restore every linked recipient');
            await remount(() => page.locator('#reset-example').click());
            frame = await ready(linked.input.board.charts.length);
            assert.deepEqual(await semantics(frame, field, selected), baseline);
            return 'Escape and Reset example restored semantic populations and emphasis';
        });
        await check('resize', async () => {
            const results = [];
            for (const width of [1440, 768, 390]) {
                await page.setViewportSize({ width, height: 1000 });
                await page.waitForFunction(expected => innerWidth === expected, width, { polling: 100, timeout: 10000 });
                await waitForFrameViewport(page, frame);
                await waitForChartLayout(frame);
                const bounds = await frame.locator('svg.marks').evaluateAll(nodes => nodes.map(svg => {
                    const rect = svg.getBoundingClientRect();
                    const clips = [];
                    for (let parent = svg.parentElement; parent; parent = parent.parentElement) {
                        if (/(hidden|clip|auto)/.test(getComputedStyle(parent).overflowX)) {
                            const clip = parent.getBoundingClientRect();
                            clips.push(rect.left >= clip.left - 1 && rect.right <= clip.right + 1);
                        }
                    }
                    return { width: rect.width, fits: rect.left >= -1 && rect.right <= innerWidth + 1 && clips.every(Boolean) };
                }));
                assert.ok(bounds.every(bounds => bounds.width > 0 && bounds.fits), JSON.stringify({ width, bounds }));
                assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1));
                results.push({ width, charts: bounds.length });
            }
            return results;
        });
        if (!downloads) block('saved-spec', 'Host download completion is not available or not approved; no saved-file claim');
        else await check('saved-spec', async () => {
            const disclosure = page.locator('summary').filter({ hasText: 'Inspect the Flint input' });
            await disclosure.focus();
            await disclosure.press('Enter');
            const button = page.locator('#download-spec');
            await button.waitFor({ state: 'visible', timeout: 10000 });
            await button.focus();
            const expected = JSON.parse(await page.locator('#spec-output').textContent());
            const [download] = await Promise.all([
                page.waitForEvent('download', { timeout: 10000 }),
                button.press('Enter'),
            ]);
            const root = mkdtempSync(join(tmpdir(), 'one-showcase-download-'));
            try {
                const file = join(root, 'starting-spec.json');
                await download.saveAs(file);
                validateDownloadedSpec(readFileSync(file, 'utf8'), expected);
                return { filename: download.suggestedFilename(), savedAndValidated: true, input: 'trusted keyboard activation' };
            } finally { rmSync(root, { recursive: true, force: true }); }
        });
        await check('offline', async () => {
            assert.deepEqual(requests, [], 'The fresh local load attempted network requests');
            assert.deepEqual(errors, [], 'Browser errors were observed');
            return { networkRequests: requests.length, browserErrors: errors.length };
        });
        return { url, browser, input: nativeFocus ? 'native child-scoped CDP' : 'Playwright',
            limitations: ['Sampled shell contrast, not all SVG text or chart colors', 'Live-region DOM checked; screen-reader speech not observed',
                'Representative keyboard and linked-selection checks, not every gesture preset'],
            ...summarizeAcceptance(checks) };
    } finally {
        try {
            if (focus) await focus.send('Emulation.setFocusEmulationEnabled', { enabled: false });
        } finally {
            if (focus) await focus.detach();
            page.off('request', requestListener);
            page.off('pageerror', errorListener);
            page.off('console', consoleListener);
            await page.unroute(/^https?:/, abort);
            if (originalViewport) await page.setViewportSize(originalViewport);
        }
    }
}

async function main(args) {
    let runtimeRoot = runtimeStatus.runtimeRoot();
    let channel = 'msedge';
    for (let index = 0; index < args.length; index++) {
        const option = args[index];
        const value = args[++index];
        if (!value || value.startsWith('--')) throw new Error(`${option} requires a value`);
        if (option === '--runtime-root') runtimeRoot = runtimeStatus.runtimeRoot(value);
        else if (option === '--channel') channel = value;
        else throw new Error(`Unknown option: ${option}`);
    }
    const require = createRequire(join(runtimeRoot, 'node_modules', '@playwright', 'mcp', 'package.json'));
    const { chromium } = require('playwright');
    const browser = await chromium.launch({ channel, headless: true });
    try {
        const reports = [];
        for (const file of ['flint-showcase.html', 'flint-experimental.html']) {
            const page = await browser.newPage({ acceptDownloads: true });
            try {
                await page.goto(new URL(`../docs/${file}`, import.meta.url).href);
                reports.push(await verifyShowcasePage(page));
            } finally { await page.close(); }
        }
        console.log(JSON.stringify({ browser: browser.version(), channel, reports }, null, 2));
        if (reports.some(report => !report.passed)) process.exitCode = 1;
    } finally { await browser.close(); }
}

if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) {
    main(process.argv.slice(2)).catch(error => { console.error(error.stack || error); process.exitCode = 1; });
}
