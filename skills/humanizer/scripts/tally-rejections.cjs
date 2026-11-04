#!/usr/bin/env node
'use strict';

/**
 * Computes the Phase 1 to Phase 2 rejection rate for Copywriter Mode from
 * the candidate/disposition log, instead of reconstructing it from prose
 * notes. The rate is the health signal the skill reads: zero rejections
 * means the sweep list is too narrow, near-total rejection means it is
 * too noisy.
 *
 * Log format: one candidate per line, pipe-separated:
 *   candidate | origin | disposition | reason (optional)
 * origin is "sweep" or "read"; disposition is "accepted" or "rejected".
 * Blank lines and lines starting with # are ignored.
 *
 * Usage:
 *   node tally-rejections.cjs <candidate-log>
 *
 * Exit codes: 0 = tallied, 1 = input error or no usable lines.
 */

const fs = require('node:fs');

function tally(text) {
  const result = { total: 0, accepted: 0, rejected: 0, malformed: 0 };
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const fields = line.split('|').map((f) => f.trim());
    const disposition = (fields[2] || '').toLowerCase();
    if (fields.length < 3 || (disposition !== 'accepted' && disposition !== 'rejected')) {
      result.malformed += 1;
      continue;
    }
    result.total += 1;
    result[disposition] += 1;
  }
  return result;
}

function main(argv) {
  const file = argv[2];
  if (!file) {
    console.error('Usage: node tally-rejections.cjs <candidate-log>');
    return 1;
  }
  let text;
  try {
    text = fs.readFileSync(file, 'utf8');
  } catch (err) {
    console.error(`Cannot read ${file}: ${err.message}`);
    return 1;
  }

  const r = tally(text);
  if (r.malformed > 0) {
    console.error(`Warning: skipped ${r.malformed} malformed line(s)`);
  }
  if (r.total === 0) {
    console.error('No usable candidate lines in the log.');
    return 1;
  }
  const rate = ((r.rejected / r.total) * 100).toFixed(1);
  console.log(`Candidates: ${r.total}`);
  console.log(`Accepted: ${r.accepted}`);
  console.log(`Rejected: ${r.rejected}`);
  console.log(`Rejection rate: ${rate}%`);
  return 0;
}

if (require.main === module) {
  process.exit(main(process.argv));
}

module.exports = { tally };
