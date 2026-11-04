#!/usr/bin/env node
/**
 * @description Deterministic tallies for the Extension Audit report template:
 *   console-statement counts (total, legitimate, removable) and the
 *   menu-validation working/broken ratio. The reviewer categorizes; this
 *   script counts and divides. Never tally grep output or do the division
 *   in prose.
 * @version 1.0.0
 *
 * Usage:
 *   node audit-tally.cjs console <rootDir>
 *   node audit-tally.cjs console <rootDir> --categories <file>
 *   node audit-tally.cjs ratio <working> <broken>
 *
 * The categories file has one entry per console hit:
 *   path/to/file.ts:123:legitimate
 *   path/to/file.ts:87:removable
 * With --categories, the script cross-checks legitimate + removable against
 * the scanned total and warns when they disagree.
 *
 * Exit codes: 0 = tallies printed, 2 = usage error.
 */
'use strict';

const { existsSync, readdirSync, readFileSync, statSync } = require('node:fs');
const { extname, join, relative } = require('node:path');

const EXTENSIONS = new Set(['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs']);
const CONSOLE_RE = /\bconsole\.(log|debug|info|warn|error)\s*\(/g;

function collectFiles(target, out) {
  const stat = statSync(target);
  if (stat.isFile()) {
    if (EXTENSIONS.has(extname(target))) out.push(target);
    return;
  }
  for (const entry of readdirSync(target, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
    const full = join(target, entry.name);
    if (entry.isDirectory()) collectFiles(full, out);
    else if (EXTENSIONS.has(extname(entry.name))) out.push(full);
  }
}

function scanConsole(root) {
  const files = [];
  collectFiles(root, files);
  let total = 0;
  const perFile = [];
  for (const file of files.sort()) {
    const lines = readFileSync(file, 'utf8').split(/\r?\n/);
    let count = 0;
    lines.forEach((line) => {
      const matches = line.match(CONSOLE_RE);
      if (matches) count += matches.length;
    });
    if (count > 0) perFile.push({ file: relative(process.cwd(), file), count });
    total += count;
  }
  return { total, perFile };
}

function consoleMode(args) {
  const root = args[0];
  if (!root || !existsSync(root)) {
    console.error('Usage: node audit-tally.cjs console <rootDir> [--categories <file>]');
    process.exit(2);
  }
  const { total, perFile } = scanConsole(root);
  for (const { file, count } of perFile) console.log(`${file}: ${count}`);
  const catIndex = args.indexOf('--categories');
  if (catIndex === -1) {
    console.log(`Console statements: ${total} remaining (run with --categories <file> for the legitimate/removable split)`);
    return;
  }
  const catFile = args[catIndex + 1];
  if (!catFile || !existsSync(catFile)) {
    console.error(`Categories file not found: ${catFile ?? '(missing)'}`);
    process.exit(2);
  }
  let legitimate = 0;
  let removable = 0;
  for (const raw of readFileSync(catFile, 'utf8').split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    if (line.endsWith(':legitimate')) legitimate++;
    else if (line.endsWith(':removable')) removable++;
    else console.error(`Warning: unrecognized category line ignored: ${line}`);
  }
  console.log(`Console statements: ${total} remaining (${legitimate} legitimate, ${removable} removable)`);
  if (legitimate + removable !== total) {
    console.error(`Warning: categorized ${legitimate + removable} of ${total} scanned hits; the split does not cover every statement.`);
  }
}

function ratioMode(args) {
  const working = Number(args[0]);
  const broken = Number(args[1]);
  if (!Number.isInteger(working) || !Number.isInteger(broken) || working < 0 || broken < 0 || working + broken === 0) {
    console.error('Usage: node audit-tally.cjs ratio <working> <broken>  (non-negative integers, not both zero)');
    process.exit(2);
  }
  const pct = ((working / (working + broken)) * 100).toFixed(1);
  console.log(`Menu validation: ${working}/${working + broken} working (${working}:${broken}, ${pct}% working)`);
}

function main() {
  const [mode, ...rest] = process.argv.slice(2);
  if (mode === 'console') consoleMode(rest);
  else if (mode === 'ratio') ratioMode(rest);
  else {
    console.error('Usage: node audit-tally.cjs console <rootDir> [--categories <file>] | ratio <working> <broken>');
    process.exit(2);
  }
}

main();
