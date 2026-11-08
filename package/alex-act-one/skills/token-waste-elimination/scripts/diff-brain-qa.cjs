#!/usr/bin/env node
/**
 * @type muscle
 * @lifecycle stable
 * @muscle diff-brain-qa
 * @inheritance inheritable
 * @description Compute artifact-count and line-count deltas between two brain-qa --json snapshots
 * @version 1.0.0
 * @skill token-waste-elimination
 * @platform windows,macos,linux
 * @requires node
 *
 * Deterministic delta reporting for the token-waste-elimination workflow:
 * given the brain-qa --json snapshots captured before and after a trimming
 * pass, compute the deltas instead of subtracting the two reports by hand.
 *
 * Reported:
 *   - Artifact count delta, when a count can be located in both snapshots
 *     (artifactCount / counts.artifacts / summary.artifactCount, or the
 *     length of an artifacts|files array).
 *   - Per-file line deltas, when both snapshots carry a files|artifacts
 *     array whose entries have a path and a numeric lines|lineCount field.
 *     Added and removed files are listed as well.
 *   - Every other numeric metric present under the same dotted path in
 *     both snapshots, with its delta.
 *
 * Usage:
 *   node diff-brain-qa.cjs BEFORE.json AFTER.json [--json]
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

function loadSnapshot(file) {
  if (!fs.existsSync(file)) {
    console.error(`ERROR: File not found: ${file}`);
    process.exit(1);
  }
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (err) {
    console.error(`ERROR: ${file} is not valid JSON: ${err.message}`);
    process.exit(1);
  }
}

function flattenNumbers(obj, prefix = "", out = new Map()) {
  if (obj === null || typeof obj !== "object") return out;
  if (Array.isArray(obj)) return out; // arrays handled by dedicated extractors
  for (const [key, value] of Object.entries(obj)) {
    const p = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "number" && Number.isFinite(value)) out.set(p, value);
    else if (value && typeof value === "object" && !Array.isArray(value)) flattenNumbers(value, p, out);
  }
  return out;
}

function fileEntries(snapshot) {
  const arr = snapshot.artifacts || snapshot.files || null;
  if (!Array.isArray(arr)) return null;
  const map = new Map();
  for (const entry of arr) {
    if (!entry || typeof entry !== "object") continue;
    const p = entry.path || entry.file || entry.name;
    const lines = entry.lines !== undefined ? entry.lines : entry.lineCount;
    if (typeof p === "string" && typeof lines === "number") map.set(p, lines);
  }
  return map.size > 0 ? map : null;
}

function artifactCount(snapshot, entries) {
  const candidates = [
    snapshot.artifactCount,
    snapshot.counts && snapshot.counts.artifacts,
    snapshot.summary && snapshot.summary.artifactCount,
    snapshot.totals && snapshot.totals.artifacts,
  ];
  for (const c of candidates) if (typeof c === "number") return c;
  const arr = snapshot.artifacts || snapshot.files;
  if (Array.isArray(arr)) return arr.length;
  if (entries) return entries.size;
  return null;
}

function diffSnapshots(before, after) {
  const beforeFiles = fileEntries(before);
  const afterFiles = fileEntries(after);

  const result = {
    artifactCount: null,
    fileDeltas: [],
    addedFiles: [],
    removedFiles: [],
    totalLineDelta: null,
    metricDeltas: [],
  };

  const bc = artifactCount(before, beforeFiles);
  const ac = artifactCount(after, afterFiles);
  if (bc !== null && ac !== null) {
    result.artifactCount = { before: bc, after: ac, delta: ac - bc };
  }

  if (beforeFiles && afterFiles) {
    let totalBefore = 0;
    let totalAfter = 0;
    for (const [p, lines] of beforeFiles) {
      totalBefore += lines;
      if (afterFiles.has(p)) {
        totalAfter += afterFiles.get(p);
        const d = afterFiles.get(p) - lines;
        if (d !== 0) result.fileDeltas.push({ path: p, before: lines, after: afterFiles.get(p), delta: d });
      } else {
        result.removedFiles.push({ path: p, lines });
      }
    }
    for (const [p, lines] of afterFiles) {
      if (!beforeFiles.has(p)) {
        totalAfter += lines;
        result.addedFiles.push({ path: p, lines });
      }
    }
    result.fileDeltas.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
    result.totalLineDelta = { before: totalBefore, after: totalAfter, delta: totalAfter - totalBefore };
  }

  const beforeNums = flattenNumbers(before);
  const afterNums = flattenNumbers(after);
  for (const [p, bv] of beforeNums) {
    if (afterNums.has(p) && afterNums.get(p) !== bv) {
      result.metricDeltas.push({ metric: p, before: bv, after: afterNums.get(p), delta: afterNums.get(p) - bv });
    }
  }
  result.metricDeltas.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));

  return result;
}

function signed(n) {
  return n > 0 ? `+${n}` : `${n}`;
}

function main() {
  const args = process.argv.slice(2).filter((a) => a !== "--json");
  const asJson = process.argv.includes("--json");
  if (args.length !== 2) {
    console.log("Usage: node diff-brain-qa.cjs BEFORE.json AFTER.json [--json]");
    process.exit(1);
  }
  const before = loadSnapshot(path.resolve(args[0]));
  const after = loadSnapshot(path.resolve(args[1]));
  const result = diffSnapshots(before, after);

  if (asJson) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  if (result.artifactCount) {
    const { before: b, after: a, delta } = result.artifactCount;
    console.log(`Artifact count: ${b} -> ${a} (${signed(delta)})`);
  } else {
    console.log("Artifact count: not present in both snapshots");
  }

  if (result.totalLineDelta) {
    const { before: b, after: a, delta } = result.totalLineDelta;
    console.log(`Total lines across listed files: ${b} -> ${a} (${signed(delta)})`);
    for (const f of result.fileDeltas) {
      console.log(`  ${signed(f.delta).padStart(7)}  ${f.before} -> ${f.after}  ${f.path}`);
    }
    for (const f of result.addedFiles) console.log(`  ADDED    ${f.lines} lines  ${f.path}`);
    for (const f of result.removedFiles) console.log(`  REMOVED  ${f.lines} lines  ${f.path}`);
  }

  if (result.metricDeltas.length > 0) {
    console.log("\nOther numeric metric deltas:");
    for (const m of result.metricDeltas) {
      console.log(`  ${m.metric}: ${m.before} -> ${m.after} (${signed(m.delta)})`);
    }
  }

  if (!result.artifactCount && !result.totalLineDelta && result.metricDeltas.length === 0) {
    console.log("No comparable numeric metrics found in both snapshots.");
  }
}

if (require.main === module) {
  main();
}

module.exports = { diffSnapshots };
