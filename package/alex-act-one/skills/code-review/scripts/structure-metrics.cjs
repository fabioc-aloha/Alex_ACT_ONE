#!/usr/bin/env node
/**
 * @description Deterministic per-function line counts (code-review R4) and max
 *   nesting depth (code-review R8) for JavaScript/TypeScript sources. Brace
 *   based heuristic: strings, template literals, and comments are stripped
 *   before counting, but this is not a full parser. Where ESLint is already
 *   configured, `max-lines-per-function` and `max-depth` are the stricter
 *   route; this script is the fallback that works with no lint setup.
 * @version 1.0.0
 *
 * Usage:
 *   node structure-metrics.cjs <file-or-dir> [more paths...]
 *
 * Output: one line per R4/R8 violation, then a summary.
 * Exit codes: 0 = no violations, 1 = violations found, 2 = usage error.
 */
'use strict';

const { existsSync, readdirSync, readFileSync, statSync } = require('node:fs');
const { extname, join } = require('node:path');

const MAX_FUNCTION_LINES = 60; // R4
const MAX_NESTING = 4; // R8
const EXTENSIONS = new Set(['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs']);

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

// Strip string/template/comment content so braces inside them do not count.
// State carries across lines for block comments and template literals.
function stripLine(line, state) {
  let out = '';
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    const next = line[i + 1];
    if (state.blockComment) {
      if (ch === '*' && next === '/') { state.blockComment = false; i++; }
      continue;
    }
    if (state.template) {
      if (ch === '\\') { i++; continue; }
      if (ch === '`') state.template = false;
      continue;
    }
    if (ch === '/' && next === '/') break;
    if (ch === '/' && next === '*') { state.blockComment = true; i++; continue; }
    if (ch === '`') { state.template = true; continue; }
    if (ch === '"' || ch === "'") {
      const quote = ch;
      i++;
      while (i < line.length && line[i] !== quote) {
        if (line[i] === '\\') i++;
        i++;
      }
      continue;
    }
    out += ch;
  }
  return out;
}

const CONTROL = new Set(['if', 'else', 'for', 'while', 'switch', 'catch', 'try', 'do', 'return', 'with', 'new', 'typeof']);

function functionName(line) {
  let m = line.match(/\bfunction\s+([A-Za-z_$][\w$]*)\s*\(/);
  if (m) return m[1];
  m = line.match(/\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s+)?(?:\([^)]*\)|[A-Za-z_$][\w$]*)\s*=>/);
  if (m) return m[1];
  m = line.match(/\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s+)?function/);
  if (m) return m[1] + '(anonymous via assignment)';
  m = line.match(/^\s*(?:async\s+)?([A-Za-z_$][\w$]*)\s*\([^)]*\)\s*\{/);
  if (m && !CONTROL.has(m[1])) return m[1];
  return null;
}

function analyzeFile(path) {
  const lines = readFileSync(path, 'utf8').split(/\r?\n/);
  const state = { blockComment: false, template: false };
  const violations = [];
  let depth = 0;
  let pending = null; // { name, startLine } waiting for its opening brace
  const stack = []; // open functions: { name, startLine, baseDepth, maxDepth }

  function closeFunctions() {
    while (stack.length && depth < stack[stack.length - 1].bodyDepth) {
      const fn = stack.pop();
      const length = fn.endLine - fn.startLine + 1;
      if (length > MAX_FUNCTION_LINES) {
        violations.push(`R4 line ${fn.startLine}: function "${fn.name}" spans ${length} lines (> ${MAX_FUNCTION_LINES})`);
      }
      const nesting = fn.maxDepth - fn.baseDepth;
      if (nesting > MAX_NESTING) {
        violations.push(`R8 line ${fn.startLine}: function "${fn.name}" nests ${nesting} levels deep (> ${MAX_NESTING})`);
      }
    }
  }

  lines.forEach((raw, idx) => {
    const lineNo = idx + 1;
    const code = stripLine(raw, state);
    const name = functionName(code);
    if (name && !pending) pending = { name, startLine: lineNo };
    for (const ch of code) {
      if (ch === '{') {
        depth++;
        if (pending) {
          stack.push({ name: pending.name, startLine: pending.startLine, baseDepth: depth - 1, bodyDepth: depth, maxDepth: depth, endLine: lineNo });
          pending = null;
        }
        for (const fn of stack) if (depth > fn.maxDepth) fn.maxDepth = depth;
      } else if (ch === '}') {
        for (const fn of stack) fn.endLine = lineNo;
        depth--;
        closeFunctions();
      }
    }
  });
  // Functions still open at EOF (unbalanced input): close them at the last line.
  for (const fn of stack) if (!fn.endLine) fn.endLine = lines.length;
  while (stack.length) {
    const fn = stack.pop();
    const length = fn.endLine - fn.startLine + 1;
    if (length > MAX_FUNCTION_LINES) {
      violations.push(`R4 line ${fn.startLine}: function "${fn.name}" spans ${length} lines (> ${MAX_FUNCTION_LINES})`);
    }
    const nesting = fn.maxDepth - fn.baseDepth;
    if (nesting > MAX_NESTING) {
      violations.push(`R8 line ${fn.startLine}: function "${fn.name}" nests ${nesting} levels deep (> ${MAX_NESTING})`);
    }
  }
  return violations;
}

function main() {
  const targets = process.argv.slice(2);
  if (!targets.length) {
    console.error('Usage: node structure-metrics.cjs <file-or-dir> [more paths...]');
    process.exit(2);
  }
  const files = [];
  for (const target of targets) {
    if (!existsSync(target)) {
      console.error(`No such path: ${target}`);
      process.exit(2);
    }
    collectFiles(target, files);
  }
  let r4 = 0;
  let r8 = 0;
  for (const file of files.sort()) {
    const violations = analyzeFile(file);
    if (!violations.length) continue;
    console.log(file);
    for (const v of violations) {
      console.log(`  ${v}`);
      if (v.startsWith('R4')) r4++; else r8++;
    }
  }
  console.log(`Summary: scanned ${files.length} file(s); ${r4} function(s) over ${MAX_FUNCTION_LINES} lines (R4), ${r8} function(s) nesting over ${MAX_NESTING} levels (R8)`);
  process.exit(r4 + r8 > 0 ? 1 : 0);
}

main();
