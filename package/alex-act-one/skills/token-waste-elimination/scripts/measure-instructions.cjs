#!/usr/bin/env node
/**
 * @type muscle
 * @lifecycle stable
 * @muscle measure-instructions
 * @inheritance inheritable
 * @description Fallback brain measurement: list instruction files by applyTo scope with line counts, flag oversized skills
 * @version 1.0.0
 * @skill token-waste-elimination
 * @platform windows,macos,linux
 * @requires node
 *
 * Fallback measurement for projects that do not ship brain-qa equivalents.
 * Walks a project tree, reads the YAML frontmatter of every Markdown file,
 * and reports the files that declare an `applyTo` glob, grouped by scope
 * with line counts. The two always-on globs (the bare double-star and the
 * double-star-slash-star forms) are the highest-frequency group and are
 * totalled separately.
 * Also reports SKILL.md files over the 500-line split threshold.
 *
 * Usage:
 *   node measure-instructions.cjs [PROJECT-ROOT] [--json]
 *
 * PROJECT-ROOT defaults to the current directory.
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

const SKIP_DIRS = new Set(["node_modules", ".git", "dist", "out", ".next", "coverage"]);
const SKILL_LINE_LIMIT = 500;

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) walk(full, out);
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith(".md")) {
      out.push(full);
    }
  }
  return out;
}

function countLines(content) {
  if (content.length === 0) return 0;
  return content.split("\n").length - (content.endsWith("\n") ? 1 : 0);
}

/** Extract applyTo globs from a leading YAML frontmatter block, if any. */
function parseApplyTo(content) {
  const fm = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!fm) return null;
  const line = fm[1].split(/\r?\n/).find((l) => /^\s*applyTo\s*:/.test(l));
  if (!line) return null;
  let value = line.replace(/^\s*applyTo\s*:\s*/, "").trim();
  if (!value) return [];
  if (value.startsWith("[") && value.endsWith("]")) {
    return value.slice(1, -1).split(",").map((s) => s.trim().replace(/^["']|["']$/g, "")).filter(Boolean);
  }
  return [value.replace(/^["']|["']$/g, "")];
}

function measure(root) {
  const files = walk(root);
  const byScope = new Map();
  const oversizedSkills = [];

  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");
    const lines = countLines(content);
    const rel = path.relative(root, file);

    if (path.basename(file) === "SKILL.md" && lines > SKILL_LINE_LIMIT) {
      oversizedSkills.push({ path: rel, lines });
    }

    const globs = parseApplyTo(content);
    if (!globs || globs.length === 0) continue;
    for (const glob of globs) {
      if (!byScope.has(glob)) byScope.set(glob, []);
      byScope.get(glob).push({ path: rel, lines });
    }
  }

  const scopes = [...byScope.entries()]
    .map(([scope, entries]) => ({
      scope,
      files: entries.sort((a, b) => b.lines - a.lines),
      totalLines: entries.reduce((sum, e) => sum + e.lines, 0),
    }))
    .sort((a, b) => b.totalLines - a.totalLines);

  const alwaysOnScopes = scopes.filter((s) => s.scope === "**" || s.scope === "**/*");
  return {
    root,
    scopes,
    alwaysOnLines: alwaysOnScopes.reduce((sum, s) => sum + s.totalLines, 0),
    alwaysOnFiles: alwaysOnScopes.reduce((sum, s) => sum + s.files.length, 0),
    oversizedSkills: oversizedSkills.sort((a, b) => b.lines - a.lines),
  };
}

function main() {
  const args = process.argv.slice(2);
  const asJson = args.includes("--json");
  const rootArg = args.find((a) => !a.startsWith("--"));
  const root = path.resolve(rootArg || ".");
  if (!fs.existsSync(root)) {
    console.error(`ERROR: Not found: ${root}`);
    process.exit(1);
  }

  const result = measure(root);

  if (asJson) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  console.log(`Instruction files by applyTo scope under ${root}`);
  for (const scope of result.scopes) {
    console.log(`\n  applyTo: "${scope.scope}"  (${scope.files.length} file(s), ${scope.totalLines} lines)`);
    for (const f of scope.files) console.log(`    ${String(f.lines).padStart(6)}  ${f.path}`);
  }
  console.log(`\nAlways-on group ("**" / "**/*"): ${result.alwaysOnFiles} file(s), ${result.alwaysOnLines} lines`);

  if (result.oversizedSkills.length > 0) {
    console.log(`\nSkill files over ${SKILL_LINE_LIMIT} lines:`);
    for (const s of result.oversizedSkills) console.log(`    ${String(s.lines).padStart(6)}  ${s.path}`);
  } else {
    console.log(`\nNo skill files over ${SKILL_LINE_LIMIT} lines`);
  }
}

if (require.main === module) {
  main();
}

module.exports = { measure, parseApplyTo };
