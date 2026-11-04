#!/usr/bin/env node
/**
 * @type muscle
 * @lifecycle stable
 * @muscle lint-innerhtml
 * @inheritance inheritable
 * @description Enumerate innerHTML/outerHTML assignments and flag any value that is not DOMPurify.sanitize output
 * @version 1.0.0
 * @skill markdown-sanitization-chain
 * @platform windows,macos,linux
 * @requires node
 *
 * Deterministic check behind the markdown-sanitization-chain verification
 * item "No raw innerHTML without sanitization anywhere in the surface".
 * Scans JavaScript/TypeScript sources, enumerates every innerHTML and
 * outerHTML assignment, and classifies each value:
 *
 *   OK        value is a DOMPurify.sanitize(...) call, an identifier that
 *             this file assigns from a DOMPurify.sanitize(...) call, or a
 *             plain string literal with no interpolation
 *   FLAGGED   anything else: unsanitized expressions, interpolated
 *             template literals, and unverifiable indirect values
 *
 * Usage:
 *   node lint-innerhtml.cjs FILE.js [FILE2.ts ...]
 *   node lint-innerhtml.cjs src/
 *
 * Directories are scanned recursively for .js/.jsx/.ts/.tsx/.mjs/.cjs.
 * Exit code: 0 when no assignment is flagged, 1 otherwise.
 *
 * Requirements:
 *   - Node.js 24+
 */

"use strict";

process.on("uncaughtException", (err) => {
  console.error(`\x1b[31m[FATAL] ${err.message}\x1b[0m`);
  process.exit(1);
});

const fs = require("fs");
const path = require("path");

const EXTENSIONS = new Set([".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs"]);
const SKIP_DIRS = new Set(["node_modules", ".git", "dist", "out", ".next", "coverage"]);

function collectFiles(target, out = []) {
  const stat = fs.statSync(target);
  if (stat.isFile()) {
    out.push(target);
    return out;
  }
  for (const entry of fs.readdirSync(target, { withFileTypes: true })) {
    const full = path.join(target, entry.name);
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) collectFiles(full, out);
    } else if (entry.isFile() && EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      out.push(full);
    }
  }
  return out;
}

/** Identifiers in this file assigned from a DOMPurify.sanitize(...) call. */
function sanitizedIdentifiers(content) {
  const names = new Set();
  const re = /(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*[^;\n]*DOMPurify\.sanitize\s*\(/g;
  let m;
  while ((m = re.exec(content)) !== null) names.add(m[1]);
  // Reassignment form: name = DOMPurify.sanitize(...)
  const re2 = /(?:^|[;\n])\s*([A-Za-z_$][\w$]*)\s*=\s*DOMPurify\.sanitize\s*\(/g;
  while ((m = re2.exec(content)) !== null) names.add(m[1]);
  return names;
}

/** Read an assignment RHS starting at `start`, tracking strings and nesting. */
function readRhs(content, start) {
  let i = start;
  let depth = 0;
  let quote = null;
  while (i < content.length) {
    const ch = content[i];
    if (quote) {
      if (ch === "\\") { i += 2; continue; }
      if (quote === "`" && ch === "$" && content[i + 1] === "{") { depth++; i += 2; continue; }
      if (quote === "`" && ch === "}" && depth > 0) { depth--; i++; continue; }
      if (ch === quote) quote = null;
      i++;
      continue;
    }
    if (ch === "'" || ch === '"' || ch === "`") { quote = ch; i++; continue; }
    if (ch === "(" || ch === "[" || ch === "{") depth++;
    if (ch === ")" || ch === "]" || ch === "}") {
      if (depth === 0) break;
      depth--;
    }
    if ((ch === ";" || ch === "\n") && depth === 0) break;
    i++;
  }
  return content.slice(start, i).trim();
}

function classify(rhs, sanitizedNames) {
  if (/DOMPurify\.sanitize\s*\(/.test(rhs)) {
    return { ok: true, reason: "DOMPurify.sanitize(...) output" };
  }
  if (/^[A-Za-z_$][\w$]*$/.test(rhs) && sanitizedNames.has(rhs)) {
    return { ok: true, reason: `identifier assigned from DOMPurify.sanitize(...)` };
  }
  const first = rhs[0];
  if ((first === "'" || first === '"') && !rhs.includes("${")) {
    return { ok: true, reason: "static string literal" };
  }
  if (first === "`" && !rhs.includes("${")) {
    return { ok: true, reason: "static template literal" };
  }
  if (/^[A-Za-z_$][\w$]*$/.test(rhs)) {
    return { ok: false, reason: "indirect value; cannot verify it holds DOMPurify.sanitize output" };
  }
  return { ok: false, reason: "value is not DOMPurify.sanitize(...) output" };
}

function lintFile(file) {
  const content = fs.readFileSync(file, "utf8");
  const sanitizedNames = sanitizedIdentifiers(content);
  const findings = [];
  const re = /\.(innerHTML|outerHTML)\s*\+?=(?![=>])\s*/g;
  let m;
  while ((m = re.exec(content)) !== null) {
    const rhs = readRhs(content, m.index + m[0].length);
    const line = content.slice(0, m.index).split("\n").length;
    const verdict = classify(rhs, sanitizedNames);
    findings.push({ line, sink: m[1], rhs: rhs.length > 80 ? rhs.slice(0, 77) + "..." : rhs, ...verdict });
  }
  return findings;
}

function main() {
  const targets = process.argv.slice(2);
  if (targets.length === 0) {
    console.log("Usage: node lint-innerhtml.cjs FILE|DIR [...]");
    process.exit(1);
  }
  const files = [];
  for (const t of targets) {
    if (!fs.existsSync(t)) {
      console.error(`ERROR: Not found: ${t}`);
      process.exit(1);
    }
    collectFiles(path.resolve(t), files);
  }

  let flagged = 0;
  let ok = 0;
  for (const file of files) {
    for (const f of lintFile(file)) {
      const rel = path.relative(process.cwd(), file);
      if (f.ok) {
        ok++;
        console.log(`OK      ${rel}:${f.line}  .${f.sink} = ${f.rhs}  (${f.reason})`);
      } else {
        flagged++;
        console.log(`FLAGGED ${rel}:${f.line}  .${f.sink} = ${f.rhs}  (${f.reason})`);
      }
    }
  }

  console.log(`\n${ok + flagged} assignment(s) in ${files.length} file(s): ${ok} OK, ${flagged} flagged`);
  if (flagged > 0) {
    console.log("\u274C innerHTML lint FAILED");
    process.exit(1);
  }
  console.log("\u2705 No unsanitized innerHTML/outerHTML assignments");
}

if (require.main === module) {
  main();
}

module.exports = { lintFile, classify };
