#!/usr/bin/env node
/**
 * @type muscle
 * @lifecycle stable
 * @muscle measure-reduction
 * @inheritance inheritable
 * @description Measure source vs draft length and report the reduction percentage for compile-brain's gates
 * @version 1.0.0
 * @skill compile-brain
 * @platform windows,macos,linux
 * @requires node
 *
 * Deterministic length measurement for the compile-brain high-reduction
 * review. Prints character counts for source and draft (and token counts
 * when a tokenizer command is supplied), then reads the reduction gates
 * off the computed percentage instead of an in-prose estimate:
 *
 *   - Up to 20% reduction: within the conservative first-pass ceiling
 *   - Over 35%: high-reduction, needs explicit rationale and a
 *     fresh-context semantic review
 *   - Over 50%: the review must challenge whether compressed tables,
 *     examples, citations, or links carried operational meaning
 *
 * Usage:
 *   node measure-reduction.cjs --source SOURCE.md --draft DRAFT.md
 *   node measure-reduction.cjs SOURCE.md DRAFT.md
 *   node measure-reduction.cjs SOURCE.md DRAFT.md --tokenizer "tokcount"
 *
 * Options:
 *   --tokenizer CMD   External tokenizer command; the file path is appended
 *                     and the first integer in its stdout is the token count.
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
const { execFileSync } = require("child_process");

function countWithTokenizer(cmd, file) {
  const parts = cmd.split(/\s+/).filter(Boolean);
  const out = execFileSync(parts[0], [...parts.slice(1), file], {
    encoding: "utf8",
    timeout: 30000,
  });
  const match = out.match(/\d+/);
  if (!match) throw new Error(`Tokenizer produced no count for ${file}: ${out.trim()}`);
  return parseInt(match[0], 10);
}

function measure(file, tokenizerCmd) {
  if (!fs.existsSync(file)) {
    console.error(`ERROR: File not found: ${file}`);
    process.exit(1);
  }
  const chars = fs.readFileSync(file, "utf8").length;
  const result = { file, chars, tokens: null };
  if (tokenizerCmd) result.tokens = countWithTokenizer(tokenizerCmd, file);
  return result;
}

function reductionPct(before, after) {
  if (before === 0) return 0;
  return ((before - after) / before) * 100;
}

function gateVerdict(pct) {
  if (pct > 50) {
    return "OVER 50%: blocking review must challenge whether compressed tables, examples, citations, or resource links carried operational meaning";
  }
  if (pct > 35) {
    return "HIGH-REDUCTION (over 35%): requires an explicit rationale and a fresh-context semantic review before the draft is execution-ready";
  }
  if (pct > 20) {
    return "Over the 20% conservative first-pass ceiling: confirm the user requested a second pass or a deeper cut";
  }
  return "Within the 20% conservative first-pass ceiling";
}

function parseCliArgs() {
  const args = process.argv.slice(2);
  const opts = { positional: [], tokenizer: null };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--source") opts.source = args[++i];
    else if (args[i] === "--draft") opts.draft = args[++i];
    else if (args[i] === "--tokenizer") opts.tokenizer = args[++i];
    else if (!args[i].startsWith("--")) opts.positional.push(args[i]);
  }
  if (!opts.source && opts.positional[0]) opts.source = opts.positional[0];
  if (!opts.draft && opts.positional[1]) opts.draft = opts.positional[1];
  return opts;
}

function main() {
  const opts = parseCliArgs();
  if (!opts.source || !opts.draft) {
    console.log("Usage: node measure-reduction.cjs --source SOURCE.md --draft DRAFT.md [--tokenizer CMD]");
    process.exit(1);
  }

  const source = measure(path.resolve(opts.source), opts.tokenizer);
  const draft = measure(path.resolve(opts.draft), opts.tokenizer);

  const charPct = reductionPct(source.chars, draft.chars);
  console.log(`Source: ${path.basename(source.file)}  ${source.chars} characters`);
  console.log(`Draft:  ${path.basename(draft.file)}  ${draft.chars} characters`);
  console.log(`Character reduction: ${charPct.toFixed(1)}%`);

  if (source.tokens !== null && draft.tokens !== null) {
    const tokenPct = reductionPct(source.tokens, draft.tokens);
    console.log(`Source tokens: ${source.tokens}  Draft tokens: ${draft.tokens}`);
    console.log(`Token reduction: ${tokenPct.toFixed(1)}%`);
    console.log(`Gate basis (tokens): ${tokenPct.toFixed(1)}%`);
    console.log(gateVerdict(tokenPct));
  } else {
    console.log("Estimated tokens (characters / 4): " +
      `${Math.round(source.chars / 4)} -> ${Math.round(draft.chars / 4)} (no tokenizer supplied)`);
    console.log(`Gate basis (characters): ${charPct.toFixed(1)}%`);
    console.log(gateVerdict(charPct));
  }
}

if (require.main === module) {
  main();
}

module.exports = { reductionPct, gateVerdict };
