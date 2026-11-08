#!/usr/bin/env node
/**
 * @description Deterministic helpers for the ascii-chart skill. Bar fill
 *   counts, sparkline direction characters, KPI card widths, and title
 *   centering are computed here, never eyeballed: fill =
 *   round(value / max * barArea) keeps bar lengths proportional to the
 *   data, and --check re-derives each fill from the data and diffs it
 *   against a rendered block (the Module 5 line-length check cannot see
 *   a wrong fill; this check can).
 * @version 1.0.0
 *
 * Usage:
 *   node ascii-chart.cjs bars <data.json> [--width N]
 *   node ascii-chart.cjs bars <data.json> [--width N] --check <rendered.txt>
 *   node ascii-chart.cjs sparkline <data.json>
 *   node ascii-chart.cjs cardwidth <N>          (N = 1..8; no N prints the table)
 *   node ascii-chart.cjs center <width> <title...>
 *
 * bars data:      { "items": [ { "label": "North", "value": 42 }, ... ] }
 * sparkline data: [ 1, 2, 3, 2 ]  or  { "values": [ 1, 2, 3, 2 ] }
 *
 * Exit codes: 0 = ok / check passed, 1 = check failed, 2 = usage error.
 */
'use strict';

const { existsSync, readFileSync } = require('node:fs');

const TOTAL_WIDTH = 78;
const GAP = 2;

function fail(message) {
  console.error(message);
  process.exit(2);
}

function readJson(path) {
  if (!path || !existsSync(path)) fail(`Data file not found: ${path ?? '(missing)'}`);
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch (err) {
    fail(`Invalid JSON in ${path}: ${err.message}`);
  }
}

function centerPad(text, width) {
  const extra = width - text.length;
  if (extra <= 0) return text;
  const left = Math.floor(extra / 2);
  return ' '.repeat(left) + text + ' '.repeat(extra - left);
}

function cardWidths(n) {
  const usable = TOTAL_WIDTH - (n - 1) * GAP;
  const base = Math.floor(usable / n);
  const remainder = usable - base * n;
  return Array.from({ length: n }, (_, i) => base + (i < remainder ? 1 : 0));
}

function barLayout(items, width) {
  const labelWidth = Math.max(...items.map((d) => String(d.label).length));
  const valueWidth = Math.max(...items.map((d) => String(d.value).length));
  // "label | bar | value": two " | " separators = 6 chars
  const barArea = width - labelWidth - valueWidth - 6;
  if (barArea < 1) fail(`Width ${width} leaves no bar area; widen or shorten labels.`);
  const max = Math.max(...items.map((d) => d.value));
  return { labelWidth, valueWidth, barArea, max };
}

function fillFor(value, max, barArea) {
  if (max <= 0) return 0;
  return Math.round((value / max) * barArea);
}

function renderBars(items, width) {
  const { labelWidth, valueWidth, barArea, max } = barLayout(items, width);
  return items.map((d) => {
    const fill = fillFor(d.value, max, barArea);
    const bar = '#'.repeat(fill) + ' '.repeat(barArea - fill);
    const label = String(d.label).padEnd(labelWidth);
    const value = String(d.value).padStart(valueWidth);
    return `${label} | ${bar} | ${value}`;
  });
}

function barsMode(args) {
  const data = readJson(args[0]);
  const items = data.items;
  if (!Array.isArray(items) || !items.length) fail('bars data must be { "items": [ { "label": ..., "value": ... }, ... ] }');
  const widthIndex = args.indexOf('--width');
  const width = widthIndex >= 0 ? Number(args[widthIndex + 1]) : TOTAL_WIDTH;
  if (!Number.isInteger(width) || width < 10) fail('--width must be an integer >= 10');
  const checkIndex = args.indexOf('--check');
  if (checkIndex === -1) {
    console.log(renderBars(items, width).join('\n'));
    return;
  }
  const renderedPath = args[checkIndex + 1];
  if (!renderedPath || !existsSync(renderedPath)) fail(`Rendered file not found: ${renderedPath ?? '(missing)'}`);
  const { barArea, max } = barLayout(items, width);
  const lines = readFileSync(renderedPath, 'utf8').split(/\r?\n/).filter((l) => l.trim().length > 0);
  let failures = 0;
  for (const d of items) {
    const expected = fillFor(d.value, max, barArea);
    const line = lines.find((l) => l.startsWith(String(d.label)));
    if (!line) {
      console.log(`FAIL  ${d.label}: no rendered line starts with this label`);
      failures++;
      continue;
    }
    const firstBar = line.indexOf('|');
    const secondBar = line.indexOf('|', firstBar + 1);
    if (firstBar === -1 || secondBar === -1) {
      console.log(`FAIL  ${d.label}: line has no | bar | segment: ${line}`);
      failures++;
      continue;
    }
    const segment = line.slice(firstBar + 1, secondBar);
    const actual = (segment.match(/#/g) || []).length;
    if (actual === expected) {
      console.log(`PASS  ${d.label}: fill ${actual} = expected ${expected}`);
    } else {
      console.log(`FAIL  ${d.label}: fill ${actual}, expected ${expected} (value ${d.value} of max ${max} over bar area ${barArea})`);
      failures++;
    }
  }
  console.log(failures === 0 ? 'CHECK PASSED: every fill matches the data' : `CHECK FAILED: ${failures} bar(s) off`);
  process.exit(failures === 0 ? 0 : 1);
}

function sparklineMode(args) {
  const data = readJson(args[0]);
  const values = Array.isArray(data) ? data : data.values;
  if (!Array.isArray(values) || !values.length || values.some((v) => typeof v !== 'number')) {
    fail('sparkline data must be a JSON array of numbers or { "values": [...] }');
  }
  const chars = values.map((v, i) => {
    if (i === 0) return '_';
    if (v > values[i - 1]) return '/';
    if (v < values[i - 1]) return '\\';
    return '_';
  });
  // A strict local maximum reads as a peak, not a step up.
  for (let i = 1; i < values.length - 1; i++) {
    if (values[i] > values[i - 1] && values[i] > values[i + 1]) chars[i] = '^';
  }
  console.log(chars.join(''));
}

function cardwidthMode(args) {
  const print = (n) => {
    const widths = cardWidths(n);
    const sum = widths.reduce((a, b) => a + b, 0);
    console.log(`N=${n}: widths ${widths.join(', ')} (cards ${sum} + gaps ${(n - 1) * GAP} = ${sum + (n - 1) * GAP})`);
  };
  if (!args[0]) {
    for (let n = 1; n <= 4; n++) print(n);
    return;
  }
  const n = Number(args[0]);
  if (!Number.isInteger(n) || n < 1 || n > 8) fail('cardwidth N must be an integer 1..8');
  print(n);
}

function centerMode(args) {
  const width = Number(args[0]);
  const title = args.slice(1).join(' ');
  if (!Number.isInteger(width) || !title) fail('Usage: node ascii-chart.cjs center <width> <title...>');
  console.log(centerPad(title, width));
}

function main() {
  const [mode, ...rest] = process.argv.slice(2);
  if (mode === 'bars') barsMode(rest);
  else if (mode === 'sparkline') sparklineMode(rest);
  else if (mode === 'cardwidth') cardwidthMode(rest);
  else if (mode === 'center') centerMode(rest);
  else {
    console.error('Usage: node ascii-chart.cjs bars|sparkline|cardwidth|center ... (see header)');
    process.exit(2);
  }
}

main();
