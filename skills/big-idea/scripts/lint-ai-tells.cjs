#!/usr/bin/env node
'use strict';

/**
 * Fixed-string scan for the mechanical AI tells named in the big-idea
 * skill: banned filler intensifiers, performative openers, meta-description
 * openers, and em dashes. These are exact string matches, so the scan is a
 * script's job, not a reader's. Judgment calls (ceremonial rule-of-three,
 * compression theater, hedge stacking) are not string matches and stay
 * with the reader.
 *
 * Usage:
 *   node lint-ai-tells.cjs <draft-file>
 *
 * Exit codes: 0 = no hits, 1 = at least one hit or input error.
 */

const fs = require('node:fs');

const BANNED_WORDS = [
  'comprehensive',
  'robust',
  'leverage',
  'seamlessly',
  'tapestry',
  'weave',
  'testament',
];
const BANNED_PHRASES = ['delve into'];
const PERFORMATIVE_OPENERS = ['certainly', 'great question', 'let me'];
const META_OPENERS = ['this document explains', 'the following is'];

function lintLine(line, lineNo, hits) {
  const lower = line.toLowerCase();
  const excerpt = line.trim().slice(0, 80);

  if (line.includes('—')) {
    hits.push({ lineNo, kind: 'em dash', excerpt });
  }
  for (const word of BANNED_WORDS) {
    if (new RegExp(`\\b${word}\\b`, 'i').test(line)) {
      hits.push({ lineNo, kind: `banned intensifier "${word}"`, excerpt });
    }
  }
  for (const phrase of BANNED_PHRASES) {
    if (lower.includes(phrase)) {
      hits.push({ lineNo, kind: `banned phrase "${phrase}"`, excerpt });
    }
  }
  const trimmed = lower.trimStart();
  for (const opener of PERFORMATIVE_OPENERS) {
    if (trimmed.startsWith(opener)) {
      hits.push({ lineNo, kind: `performative opener "${opener}"`, excerpt });
    }
  }
  for (const opener of META_OPENERS) {
    if (trimmed.startsWith(opener)) {
      hits.push({ lineNo, kind: `meta-description opener "${opener}"`, excerpt });
    }
  }
}

function main(argv) {
  const file = argv[2];
  if (!file) {
    console.error('Usage: node lint-ai-tells.cjs <draft-file>');
    return 1;
  }
  let text;
  try {
    text = fs.readFileSync(file, 'utf8');
  } catch (err) {
    console.error(`Cannot read ${file}: ${err.message}`);
    return 1;
  }

  const hits = [];
  text.split(/\r?\n/).forEach((line, i) => lintLine(line, i + 1, hits));

  if (hits.length === 0) {
    console.log('No fixed-string AI tells found.');
    return 0;
  }
  for (const hit of hits) {
    console.log(`line ${hit.lineNo}: ${hit.kind}: ${hit.excerpt}`);
  }
  console.log(`Hits: ${hits.length}`);
  return 1;
}

if (require.main === module) {
  process.exit(main(process.argv));
}

module.exports = { lintLine };
