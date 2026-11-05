#!/usr/bin/env node
/**
 * @type muscle
 * @lifecycle stable
 * @muscle check-links
 * @inheritance inheritable
 * @description Verify that relative Markdown links resolve to files on disk
 * @version 1.0.0
 * @skill compile-brain
 * @platform windows,macos,linux
 * @requires node
 *
 * Deterministic link check shared by compile-brain (semantic preservation
 * gate: "verify that relative links resolve") and meditation (persistence
 * verification). Extracts inline links, images, and reference-style links
 * from Markdown files, resolves each relative destination against the
 * filesystem, and reports every miss with file and line. External URLs,
 * protocol-relative URLs, and pure in-page anchors to the same file's
 * headings are handled as follows: URLs are skipped, fragments on local
 * Markdown targets are checked against the target's heading slugs.
 *
 * Usage:
 *   node check-links.cjs FILE.md [FILE2.md ...]
 *   node check-links.cjs path/to/docs-dir
 *
 * Directories are scanned recursively for *.md files.
 * Exit code: 0 when every relative link resolves, 1 when any miss is found.
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

const SKIP_DIRS = new Set(["node_modules", ".git", "dist", "out", ".next"]);

function collectMarkdownFiles(target, out = []) {
  const stat = fs.statSync(target);
  if (stat.isFile()) {
    out.push(target);
    return out;
  }
  for (const entry of fs.readdirSync(target, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) collectMarkdownFiles(path.join(target, entry.name), out);
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith(".md")) {
      out.push(path.join(target, entry.name));
    }
  }
  return out;
}

function slugify(heading, seen) {
  let slug = heading
    .trim()
    .toLowerCase()
    .replace(/[`*_~]/g, "")
    .replace(/[^\p{L}\p{N} _-]/gu, "")
    .replace(/\s+/g, "-");
  if (seen.has(slug)) {
    let n = 1;
    while (seen.has(`${slug}-${n}`)) n++;
    slug = `${slug}-${n}`;
  }
  seen.add(slug);
  return slug;
}

function headingSlugs(content) {
  const seen = new Set();
  const slugs = new Set();
  let inFence = false;
  for (const line of content.split(/\r?\n/)) {
    if (/^\s*(```|~~~)/.test(line)) inFence = !inFence;
    if (inFence) continue;
    const m = line.match(/^#{1,6}\s+(.*)$/);
    if (m) slugs.add(slugify(m[1], seen));
  }
  return slugs;
}

/** Remove fenced code blocks and inline code so example links are ignored. */
function stripCode(content) {
  return content
    .replace(/^(```|~~~)[\s\S]*?^\1/gm, (m) => m.replace(/[^\n]/g, " "))
    .replace(/`[^`\n]*`/g, (m) => " ".repeat(m.length));
}

function lineOf(content, index) {
  return content.slice(0, index).split("\n").length;
}

function extractLinks(content) {
  let text = stripCode(content);
  const links = [];
  const refDefs = new Map();
  let m;

  const normalize = (label) => label.trim().replace(/\s+/g, " ").toLowerCase();
  const defRe = /^\s{0,3}\[([^\]]+)\]:\s*(<[^>]+>|\S+)/gm;
  while ((m = defRe.exec(text)) !== null) {
    const label = normalize(m[1]);
    if (!refDefs.has(label)) refDefs.set(label, m[2].replace(/^<|>$/g, ""));
  }
  text = text.replace(defRe, (definition) => definition.replace(/[^\n]/g, " "));

  const inlineRe = /!?\[[^\]]*\]\(\s*(<[^>]*>|[^\s)]+)(?:\s+["'(][^)]*)?\)/g;
  while ((m = inlineRe.exec(text)) !== null) {
    links.push({ dest: m[1].replace(/^<|>$/g, ""), index: m.index });
  }
  text = text.replace(inlineRe, (link) => " ".repeat(link.length));

  const refUseRe = /!?\[([^\]]+)\](?:\[([^\]]*)\])?/g;
  while ((m = refUseRe.exec(text)) !== null) {
    const dest = refDefs.get(normalize(m[2] || m[1]));
    if (dest) links.push({ dest, index: m.index });
  }

  return links;
}

function checkFile(file) {
  const content = fs.readFileSync(file, "utf8");
  const baseDir = path.dirname(file);
  const misses = [];
  let checked = 0;

  for (const { dest, index } of extractLinks(content)) {
    if (/^[a-z][a-z0-9+.-]*:/i.test(dest) || dest.startsWith("//")) continue; // external
    const [rawPath, rawFragment] = dest.split("#");
    let decoded = rawPath;
    try { decoded = decodeURIComponent(rawPath); } catch { /* keep raw */ }
    checked++;

    if (decoded === "") {
      // Same-file anchor: verify the heading exists in this file.
      if (rawFragment) {
        const frag = decodeURIComponent(rawFragment).toLowerCase();
        if (!headingSlugs(content).has(frag)) {
          misses.push({ line: lineOf(content, index), dest, reason: "anchor not found in this file" });
        }
      }
      continue;
    }

    const target = path.resolve(baseDir, decoded.split("?")[0]);
    if (!fs.existsSync(target)) {
      misses.push({ line: lineOf(content, index), dest, reason: "target does not exist" });
      continue;
    }

    if (rawFragment && target.toLowerCase().endsWith(".md") && fs.statSync(target).isFile()) {
      const frag = decodeURIComponent(rawFragment).toLowerCase();
      if (!headingSlugs(fs.readFileSync(target, "utf8")).has(frag)) {
        misses.push({ line: lineOf(content, index), dest, reason: "anchor not found in target file" });
      }
    }
  }

  return { file, checked, misses };
}

function main() {
  const targets = process.argv.slice(2);
  if (targets.length === 0) {
    console.log("Usage: node check-links.cjs FILE.md|DIR [...]");
    process.exit(1);
  }

  const files = [];
  for (const t of targets) {
    if (!fs.existsSync(t)) {
      console.error(`ERROR: Not found: ${t}`);
      process.exit(1);
    }
    collectMarkdownFiles(path.resolve(t), files);
  }

  let totalChecked = 0;
  let totalMisses = 0;
  for (const file of files) {
    const { checked, misses } = checkFile(file);
    totalChecked += checked;
    totalMisses += misses.length;
    for (const miss of misses) {
      console.log(`MISS ${path.relative(process.cwd(), file)}:${miss.line}  ${miss.dest}  (${miss.reason})`);
    }
  }

  console.log(`Checked ${totalChecked} relative link(s) in ${files.length} file(s): ${totalMisses} miss(es)`);
  if (totalMisses > 0) {
    console.log("\u274C Link check FAILED");
    process.exit(1);
  }
  console.log("\u2705 All relative links resolve");
}

if (require.main === module) {
  main();
}

module.exports = { extractLinks, headingSlugs, checkFile };
