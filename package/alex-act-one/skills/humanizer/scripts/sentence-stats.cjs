#!/usr/bin/env node
'use strict';

/**
 * Reports the sentence-length profile of a writing sample for Voice
 * Calibration: sentence count, and the mean, median, minimum, maximum,
 * and standard deviation of sentence lengths in words. Calibration reads
 * these numbers; it does not estimate the pattern by eye.
 *
 * Splitting is mechanical: text is split on terminal punctuation
 * (. ! ?) followed by whitespace. Abbreviations and decimals can split
 * a sentence early, so treat the profile as a grounding signal, not a
 * linguistic analysis.
 *
 * Usage:
 *   node sentence-stats.cjs <sample-file>
 *
 * Exit codes: 0 = reported, 1 = input error or no sentences found.
 */

const fs = require('node:fs');

function sentenceWordCounts(text) {
  const flat = text.replace(/\s+/g, ' ').trim();
  if (!flat) return [];
  return flat
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => /[\p{L}\p{N}]/u.test(s))
    .map((s) => s.split(' ').filter(Boolean).length);
}

function stats(counts) {
  const sorted = [...counts].sort((a, b) => a - b);
  const n = sorted.length;
  const mean = counts.reduce((a, b) => a + b, 0) / n;
  const median =
    n % 2 === 1 ? sorted[(n - 1) / 2] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
  const variance = counts.reduce((a, b) => a + (b - mean) ** 2, 0) / n;
  return {
    count: n,
    mean,
    median,
    min: sorted[0],
    max: sorted[n - 1],
    stdev: Math.sqrt(variance),
  };
}

function main(argv) {
  const file = argv[2];
  if (!file) {
    console.error('Usage: node sentence-stats.cjs <sample-file>');
    return 1;
  }
  let text;
  try {
    text = fs.readFileSync(file, 'utf8');
  } catch (err) {
    console.error(`Cannot read ${file}: ${err.message}`);
    return 1;
  }

  const counts = sentenceWordCounts(text);
  if (counts.length === 0) {
    console.error('No sentences found in the sample.');
    return 1;
  }
  const s = stats(counts);
  console.log(`Sentences: ${s.count}`);
  console.log(`Mean length (words): ${s.mean.toFixed(1)}`);
  console.log(`Median length (words): ${s.median.toFixed(1)}`);
  console.log(`Min length (words): ${s.min}`);
  console.log(`Max length (words): ${s.max}`);
  console.log(`Std deviation (words): ${s.stdev.toFixed(1)}`);
  return 0;
}

if (require.main === module) {
  process.exit(main(process.argv));
}

module.exports = { sentenceWordCounts, stats };
