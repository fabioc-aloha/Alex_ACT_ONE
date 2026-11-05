#!/usr/bin/env node
'use strict';

/**
 * Computes the Phase 1 to Phase 2 rejection rate for Copywriter Mode from
 * optional task-local candidate/disposition log. Reports the sweep-only
 * rate, not a mixture with close-read findings. The rate does not establish
 * review quality and is not cross-session telemetry.
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
  const result = { total: 0, accepted: 0, rejected: 0, malformed: 0,
    sweep: { total: 0, accepted: 0, rejected: 0 } };
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const fields = line.split('|').map((f) => f.trim());
    const origin = (fields[1] || '').toLowerCase();
    const disposition = (fields[2] || '').toLowerCase();
    if (!fields[0] || !['sweep', 'read'].includes(origin) || !['accepted', 'rejected'].includes(disposition)) {
      result.malformed += 1;
      continue;
    }
    result.total += 1;
    result[disposition] += 1;
    if (origin === 'sweep') {
      result.sweep.total += 1;
      result.sweep[disposition] += 1;
    }
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
    console.error(`Cannot tally: ${r.malformed} malformed candidate line(s); use sweep/read and accepted/rejected.`);
    return 1;
  }
  if (r.total === 0) {
    console.error('No usable candidate lines in the log.');
    return 1;
  }
  console.log(`Candidates: ${r.total}`);
  console.log(`Accepted: ${r.accepted}`);
  console.log(`Rejected: ${r.rejected}`);
  const rate = r.sweep.total === 0 ? 'not measured (no sweep candidates)' :
    `${((r.sweep.rejected / r.sweep.total) * 100).toFixed(1)}% (${r.sweep.rejected}/${r.sweep.total})`;
  console.log(`Sweep rejection rate: ${rate}`);
  return 0;
}

if (require.main === module) {
  process.exit(main(process.argv));
}

module.exports = { tally };
