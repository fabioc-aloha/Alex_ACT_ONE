#!/usr/bin/env node
/**
 * @type muscle
 * @lifecycle stable
 * @muscle validate-md
 * @inheritance inheritable
 * @description Post-conversion validation for docx-to-md output: heading continuity, footnote sequence, image existence
 * @version 1.0.0
 * @skill docx-to-md
 * @platform windows,macos,linux
 * @requires node
 *
 * Deterministic acceptance checks for the docx-to-md Conversion Acceptance
 * Decision Table, replacing eyeball spot-checks after conversion:
 *
 *   1. Heading continuity: no heading level is skipped (e.g. H1 -> H3).
 *   2. Footnotes: every [^label] reference has a definition, and numeric
 *      definition labels run 1..N in order with no gaps.
 *   3. Images: every relative image destination exists on disk (resolved
 *      against the Markdown file's directory); absolute paths are flagged.
 *
 * Usage:
 *   node validate-md.cjs OUTPUT.md
 *
 * Exit code: 0 when all checks pass, 1 when any check fails.
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

function stripFences(content) {
  return content.replace(/^(```|~~~)[\s\S]*?^\1/gm, (m) => m.replace(/[^\n]/g, " "));
}

function checkHeadings(content) {
  const issues = [];
  const lines = content.split(/\r?\n/);
  let prevLevel = 0;
  let headingCount = 0;
  lines.forEach((line, i) => {
    const m = line.match(/^(#{1,6})\s+\S/);
    if (!m) return;
    headingCount++;
    const level = m[1].length;
    if (prevLevel > 0 && level > prevLevel + 1) {
      issues.push(`line ${i + 1}: heading level skips H${prevLevel} -> H${level}`);
    }
    prevLevel = level;
  });
  return { count: headingCount, issues };
}

function checkFootnotes(content) {
  const issues = [];
  const defLabels = [];
  const defRe = /^\[\^([^\]]+)\]:/gm;
  let m;
  while ((m = defRe.exec(content)) !== null) defLabels.push(m[1]);
  const defSet = new Set(defLabels);

  const refRe = /\[\^([^\]]+)\]/g;
  const refs = new Set();
  while ((m = refRe.exec(content)) !== null) {
    // A reference is a [^label] not immediately followed by ':' (definition)
    const after = content.slice(m.index + m[0].length, m.index + m[0].length + 1);
    if (after !== ":") refs.add(m[1]);
  }

  for (const ref of refs) {
    if (!defSet.has(ref)) issues.push(`footnote reference [^${ref}] has no definition`);
  }

  const numeric = defLabels.filter((l) => /^\d+$/.test(l)).map(Number);
  for (let i = 0; i < numeric.length; i++) {
    if (numeric[i] !== i + 1) {
      issues.push(`footnote definitions are not sequential: expected [^${i + 1}], found [^${numeric[i]}]`);
      break;
    }
  }

  const nonNumeric = defLabels.filter((l) => !/^\d+$/.test(l));
  return { definitions: defLabels.length, references: refs.size, nonNumeric, issues };
}

function checkImages(content, baseDir) {
  const issues = [];
  let count = 0;
  let m;
  const mdRe = /!\[[^\]]*\]\(\s*(<[^>]*>|[^\s)]+)(?:\s+["'(][^)]*)?\)/g;
  const dests = [];
  while ((m = mdRe.exec(content)) !== null) dests.push(m[1].replace(/^<|>$/g, ""));
  const htmlRe = /<img[^>]+src=["']([^"']+)["']/gi;
  while ((m = htmlRe.exec(content)) !== null) dests.push(m[1]);

  for (const dest of dests) {
    if (/^data:/i.test(dest) || /^[a-z][a-z0-9+.-]*:/i.test(dest) || dest.startsWith("//")) continue;
    count++;
    if (path.isAbsolute(dest) || /^[a-zA-Z]:[\\/]/.test(dest)) {
      issues.push(`image uses an absolute path: ${dest}`);
      continue;
    }
    const decoded = (() => { try { return decodeURIComponent(dest); } catch { return dest; } })();
    const target = path.resolve(baseDir, decoded.split("#")[0].split("?")[0]);
    if (!fs.existsSync(target)) issues.push(`image file does not exist: ${dest}`);
  }
  return { count, issues };
}

function main() {
  const file = process.argv[2];
  if (!file) {
    console.log("Usage: node validate-md.cjs OUTPUT.md");
    process.exit(1);
  }
  const resolved = path.resolve(file);
  if (!fs.existsSync(resolved)) {
    console.error(`ERROR: File not found: ${resolved}`);
    process.exit(1);
  }
  const content = stripFences(fs.readFileSync(resolved, "utf8"));
  const baseDir = path.dirname(resolved);

  const headings = checkHeadings(content);
  const footnotes = checkFootnotes(content);
  const images = checkImages(content, baseDir);

  let failed = false;
  const report = (name, issues, detail) => {
    if (issues.length === 0) {
      console.log(`PASS ${name} (${detail})`);
    } else {
      failed = true;
      console.log(`FAIL ${name} (${detail})`);
      for (const issue of issues) console.log(`  - ${issue}`);
    }
  };

  report("heading continuity", headings.issues, `${headings.count} heading(s), no skipped levels`);
  report("footnote sequence", footnotes.issues,
    `${footnotes.definitions} definition(s), ${footnotes.references} reference(s)` +
    (footnotes.nonNumeric.length ? `; non-numeric labels: ${footnotes.nonNumeric.join(", ")}` : ""));
  report("image existence", images.issues, `${images.count} relative image reference(s)`);

  if (failed) {
    console.log("\u274C Validation FAILED");
    process.exit(1);
  }
  console.log("\u2705 Validation passed");
}

if (require.main === module) {
  main();
}

module.exports = { checkHeadings, checkFootnotes, checkImages };
