#!/usr/bin/env node
'use strict';

/**
 * Merges ensembled close-read runs for Copywriter Mode and tallies the
 * agreement count per finding, so the confidence tier ("found by every
 * run" versus "found once") comes from a merge, not from counting matches
 * by eye across run outputs.
 *
 * Run-file format: one finding per line, pipe-separated:
 *   key | location | summary
 * key is a short stable label for the finding (the element name or the
 * quoted phrase). The same finding must carry the same key in every run;
 * keys are matched case-insensitively with surrounding whitespace ignored.
 * Blank lines and lines starting with # are ignored.
 *
 * Usage:
 *   node merge-runs.cjs <run1> <run2> [run3 ...]
 *
 * Output: one line per finding in the union, sorted by agreement count
 * descending, then key:  <runs reporting>/<total runs> | key | summary
 * Exit codes: 0 = merged, 1 = input error.
 */

const fs = require('node:fs');

function parseRun(text) {
  const findings = new Map();
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const fields = line.split('|').map((f) => f.trim());
    if (!fields[0]) continue;
    const norm = fields[0].toLowerCase();
    if (!findings.has(norm)) {
      findings.set(norm, {
        key: fields[0],
        location: fields[1] || '',
        summary: fields[2] || '',
      });
    }
  }
  return findings;
}

function merge(runTexts) {
  const union = new Map();
  runTexts.forEach((text) => {
    for (const [norm, finding] of parseRun(text)) {
      if (!union.has(norm)) union.set(norm, { ...finding, count: 0 });
      union.get(norm).count += 1;
    }
  });
  return [...union.values()].sort(
    (a, b) => b.count - a.count || a.key.localeCompare(b.key),
  );
}

function main(argv) {
  const files = argv.slice(2);
  if (files.length === 0) {
    console.error('Usage: node merge-runs.cjs <run1> <run2> [run3 ...]');
    return 1;
  }
  const texts = [];
  for (const file of files) {
    try {
      texts.push(fs.readFileSync(file, 'utf8'));
    } catch (err) {
      console.error(`Cannot read ${file}: ${err.message}`);
      return 1;
    }
  }

  const merged = merge(texts);
  for (const f of merged) {
    const detail = [f.location, f.summary].filter(Boolean).join(' | ');
    console.log(`${f.count}/${files.length} | ${f.key}${detail ? ` | ${detail}` : ''}`);
  }
  console.log(`Union: ${merged.length} findings across ${files.length} runs`);
  return 0;
}

if (require.main === module) {
  process.exit(main(process.argv));
}

module.exports = { parseRun, merge };
