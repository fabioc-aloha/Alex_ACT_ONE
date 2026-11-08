#!/usr/bin/env node
'use strict';

/**
 * Counts the sentences in a Big Idea draft and, when --ceiling is given,
 * fails if the count exceeds the format ceiling from the skill's Step 6
 * table. The emit gate reads this count; it is never taken by eye.
 *
 * Splitting is mechanical: text is split on terminal punctuation
 * (. ! ?) followed by whitespace. Abbreviations and decimals can inflate
 * the count, so treat the number as the gate's count, not a linguistic
 * analysis. Big Idea drafts are one to four sentences, where the split
 * is reliable.
 *
 * Usage:
 *   node count-sentences.cjs <draft-file> [--ceiling N]
 *
 * Exit codes: 0 = counted (and within ceiling when given),
 *             1 = over ceiling or input error.
 */

const fs = require('node:fs');

function countSentences(text) {
  const flat = text.replace(/\s+/g, ' ').trim();
  if (!flat) return 0;
  return flat
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => /[\p{L}\p{N}]/u.test(s)).length;
}

function main(argv) {
  const args = argv.slice(2);
  const file = args.find((a) => !a.startsWith('--'));
  const ceilingIdx = args.indexOf('--ceiling');
  const ceiling = ceilingIdx >= 0 ? Number(args[ceilingIdx + 1]) : null;

  if (!file) {
    console.error('Usage: node count-sentences.cjs <draft-file> [--ceiling N]');
    return 1;
  }
  if (ceilingIdx >= 0 && (!Number.isInteger(ceiling) || ceiling < 0)) {
    console.error('--ceiling must be a non-negative integer');
    return 1;
  }

  let text;
  try {
    text = fs.readFileSync(file, 'utf8');
  } catch (err) {
    console.error(`Cannot read ${file}: ${err.message}`);
    return 1;
  }

  const n = countSentences(text);
  console.log(`Sentences: ${n}`);
  if (ceiling !== null) {
    if (n > ceiling) {
      console.log(`FAIL: ${n} sentences exceeds the ceiling of ${ceiling}`);
      return 1;
    }
    console.log(`PASS: within the ceiling of ${ceiling}`);
  }
  return 0;
}

if (require.main === module) {
  process.exit(main(process.argv));
}

module.exports = { countSentences };
