#!/usr/bin/env node
/**
 * @description WCAG contrast checker for the flint-theme skill. Computes
 *   contrast ratios from hex color pairs with the WCAG relative-luminance
 *   formula and asserts AA thresholds (4.5:1 normal text, 3:1 large text).
 *   Contrast is arithmetic; it is never judged by eye in Theme Lab.
 * @version 1.0.0
 *
 * Usage:
 *   node contrast-check.cjs <fgHex> <bgHex> [<fgHex> <bgHex> ...] [--large]
 *   node contrast-check.cjs --file <pairs.json> [--large]
 *
 * pairs.json: [ { "label": "body text", "fg": "#1a1a1a", "bg": "#ffffff",
 *                 "large": false }, ... ]
 * --large treats every pair as large text unless the pair sets "large".
 *
 * Exit codes: 0 = every pair passes AA for its size class,
 *             1 = at least one pair fails, 2 = usage error.
 */
'use strict';

const { existsSync, readFileSync } = require('node:fs');

const AA_NORMAL = 4.5;
const AA_LARGE = 3.0;

function fail(message) {
  console.error(message);
  process.exit(2);
}

function parseHex(hex) {
  let h = String(hex).trim().replace(/^#/, '');
  if (/^[0-9a-fA-F]{3}$/.test(h)) h = h.split('').map((c) => c + c).join('');
  if (!/^[0-9a-fA-F]{6}$/.test(h)) fail(`Not a hex color: ${hex}`);
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function luminance([r, g, b]) {
  const channel = (v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrastRatio(fgHex, bgHex) {
  const l1 = luminance(parseHex(fgHex));
  const l2 = luminance(parseHex(bgHex));
  const [lighter, darker] = l1 >= l2 ? [l1, l2] : [l2, l1];
  return (lighter + 0.05) / (darker + 0.05);
}

function main() {
  const args = process.argv.slice(2);
  const defaultLarge = args.includes('--large');
  const pairs = [];
  const fileIndex = args.indexOf('--file');
  if (fileIndex >= 0) {
    const path = args[fileIndex + 1];
    if (!path || !existsSync(path)) fail(`Pairs file not found: ${path ?? '(missing)'}`);
    let parsed;
    try {
      parsed = JSON.parse(readFileSync(path, 'utf8'));
    } catch (err) {
      fail(`Invalid JSON in ${path}: ${err.message}`);
    }
    if (!Array.isArray(parsed)) fail('Pairs file must be a JSON array of { fg, bg, label?, large? }');
    for (const p of parsed) pairs.push({ label: p.label || `${p.fg} on ${p.bg}`, fg: p.fg, bg: p.bg, large: p.large ?? defaultLarge });
  } else {
    const hexArgs = args.filter((a) => !a.startsWith('--'));
    if (!hexArgs.length || hexArgs.length % 2 !== 0) {
      fail('Usage: node contrast-check.cjs <fgHex> <bgHex> [...] [--large] | --file <pairs.json>');
    }
    for (let i = 0; i < hexArgs.length; i += 2) {
      pairs.push({ label: `${hexArgs[i]} on ${hexArgs[i + 1]}`, fg: hexArgs[i], bg: hexArgs[i + 1], large: defaultLarge });
    }
  }
  let failures = 0;
  for (const pair of pairs) {
    const ratio = contrastRatio(pair.fg, pair.bg);
    const threshold = pair.large ? AA_LARGE : AA_NORMAL;
    const pass = ratio >= threshold;
    if (!pass) failures++;
    const cls = pair.large ? 'large' : 'normal';
    console.log(`${pass ? 'PASS' : 'FAIL'}  ${pair.label}: ${ratio.toFixed(2)}:1 (AA ${cls} needs ${threshold}:1)`);
  }
  console.log(failures === 0 ? 'All pairs pass WCAG AA' : `${failures} pair(s) fail WCAG AA`);
  process.exit(failures === 0 ? 0 : 1);
}

main();
