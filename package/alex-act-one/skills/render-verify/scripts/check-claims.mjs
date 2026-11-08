#!/usr/bin/env node
/**
 * check-claims.mjs - render-verify helper: numeric membership and explicit ratios.
 *
 * Two modes:
 *
 * 1. Numbers-in-dataset (Prose-coupling check, Numeric claims row):
 *      node check-claims.mjs --prose <doc.md> --data <dataset.json>
 *    Extracts numeric candidates from the prose and reports which ones do not
 *    appear in the dataset. A token matches when a dataset value equals it,
 *    either at face value or at the pre-suffix figure (so "$4.2M" matches a
 *    dataset storing 4200000 or 4.2; "78%" matches 78 or 0.78). Bare years
 *    (1900-2099, no suffix) are skipped. This heuristic does not verify units,
 *    entity attribution, dates, or whether the prose claim is true.
 *
 * 2. Ratio claim (Step 4 arithmetic check):
 *      node check-claims.mjs --data <dataset.json> --part <n|a.b.c> \
 *          --whole <n|a.b.c> --claim <1/5|0.2|20%> [--relation lt|lte|gt|gte|eq]
 *    Resolves each operand as a literal number or a dotted path into the
 *    dataset JSON, computes part / whole, and tests it against the claim.
 *    The model quotes this output; it never does the division in prose.
 *
 * Exit codes: 0 = every check passed, 1 = a check failed, 2 = usage error.
 * Node built-ins only.
 */

import { readFileSync } from "node:fs";

function usageError(message) {
  console.error(`error: ${message}`);
  console.error("usage:");
  console.error("  node check-claims.mjs --prose <doc.md> --data <dataset.json>");
  console.error("  node check-claims.mjs --data <dataset.json> --part <n|path> --whole <n|path> --claim <fraction> [--relation lt|lte|gt|gte|eq]");
  process.exit(2);
}

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const key = argv[i];
    if (!key.startsWith("--")) usageError(`unexpected argument: ${key}`);
    const value = argv[i + 1];
    if (value === undefined || value.startsWith("--")) usageError(`missing value for ${key}`);
    args[key.slice(2)] = value;
    i += 1;
  }
  return args;
}

function collectDatasetNumbers(node, out) {
  if (typeof node === "number" && Number.isFinite(node)) {
    out.push(node);
  } else if (typeof node === "string") {
    const trimmed = node.trim().replace(/[$,]/g, "");
    if (/^-?\d+(?:\.\d+)?$/.test(trimmed)) out.push(Number(trimmed));
  } else if (Array.isArray(node)) {
    for (const item of node) collectDatasetNumbers(item, out);
  } else if (node !== null && typeof node === "object") {
    for (const value of Object.values(node)) collectDatasetNumbers(value, out);
  }
  return out;
}

const SUFFIX_MULTIPLIER = { K: 1e3, M: 1e6, B: 1e9 };

function extractProseNumbers(text) {
  const tokens = [];
  const pattern = /[-+\u2212]?\$?\d[\d,]*(?:\.\d+)?\s*(?:[KMB](?![a-z])|%|×)?/g;
  let match;
  while ((match = pattern.exec(text)) !== null) {
    const raw = match[0].trim();
    const suffixMatch = raw.match(/([KMB]|%|×)$/);
    const suffix = suffixMatch ? suffixMatch[1] : "";
    const numericText = raw.replace(/[$,\s]/g, "").replace(/\u2212/g, "-").replace(/([KMB]|%|×)$/, "");
    const base = Number(numericText);
    if (!Number.isFinite(base)) continue;
    // Skip bare years: dates, not numeric claims.
    if (!suffix && Number.isInteger(base) && base >= 1900 && base <= 2099) continue;
    const candidates = new Set([base]);
    if (suffix && SUFFIX_MULTIPLIER[suffix]) {
      candidates.add(base * SUFFIX_MULTIPLIER[suffix]);
    }
    if (suffix === "%") candidates.add(base / 100);
    const line = text.slice(0, match.index).split("\n").length;
    tokens.push({ raw, candidates: [...candidates], line });
  }
  return tokens;
}

function numbersMatch(candidate, datasetValue) {
  if (candidate === datasetValue) return true;
  const scale = Math.max(1, Math.abs(candidate), Math.abs(datasetValue));
  return Math.abs(candidate - datasetValue) / scale < 0.001;
}

function tokenFound(token, datasetNumbers) {
  return token.candidates.some((candidate) =>
    datasetNumbers.some((value) => numbersMatch(candidate, value)),
  );
}

function resolveOperand(token, data, label) {
  if (/^-?\d+(?:\.\d+)?$/.test(token)) return Number(token);
  if (data === undefined) usageError(`--${label} "${token}" is a field path but no --data file was given`);
  let node = data;
  for (const part of token.split(".")) {
    if (node === null || typeof node !== "object" || !(part in node)) {
      usageError(`--${label} path "${token}" not found in the dataset (failed at "${part}")`);
    }
    node = node[part];
  }
  if (typeof node !== "number") usageError(`--${label} path "${token}" did not resolve to a number`);
  return node;
}

function parseClaim(token) {
  if (/^-?\d+(?:\.\d+)?\/\d+(?:\.\d+)?$/.test(token)) {
    const [num, den] = token.split("/").map(Number);
    if (den === 0) usageError(`--claim "${token}" divides by zero`);
    return num / den;
  }
  if (/^-?\d+(?:\.\d+)?%$/.test(token)) return Number(token.slice(0, -1)) / 100;
  if (/^-?\d+(?:\.\d+)?$/.test(token)) return Number(token);
  usageError(`--claim "${token}" is not a fraction, decimal, or percent`);
  return NaN;
}

const RELATIONS = {
  lt: (a, b) => a < b,
  lte: (a, b) => a <= b,
  gt: (a, b) => a > b,
  gte: (a, b) => a >= b,
  eq: (a, b) => Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a), Math.abs(b)),
};
const RELATION_TEXT = { lt: "<", lte: "<=", gt: ">", gte: ">=", eq: "=" };

function main() {
  const args = parseArgs(process.argv.slice(2));
  let data;
  let datasetNumbers = [];
  if (args.data) {
    try {
      data = JSON.parse(readFileSync(args.data, "utf8"));
    } catch (error) {
      usageError(`cannot read dataset ${args.data}: ${error.message}`);
    }
    datasetNumbers = collectDatasetNumbers(data, []);
  }

  let failed = false;

  if (args.prose) {
    if (!args.data) usageError("--prose mode needs --data <dataset.json>");
    let prose;
    try {
      prose = readFileSync(args.prose, "utf8");
    } catch (error) {
      usageError(`cannot read prose file ${args.prose}: ${error.message}`);
    }
    const tokens = extractProseNumbers(prose);
    const missing = tokens.filter((token) => !tokenFound(token, datasetNumbers));
    for (const token of tokens) {
      const status = tokenFound(token, datasetNumbers) ? "FOUND  " : "MISSING";
      console.log(`${status} line ${token.line}: ${token.raw}`);
    }
    console.log(
      `numeric membership: ${tokens.length - missing.length}/${tokens.length} candidates appear in the dataset (${datasetNumbers.length} dataset values searched); attribution and units require semantic review`,
    );
    if (missing.length > 0) failed = true;
  }

  if (args.part !== undefined || args.whole !== undefined || args.claim !== undefined) {
    if (args.part === undefined || args.whole === undefined || args.claim === undefined) {
      usageError("ratio mode needs --part, --whole, and --claim together");
    }
    const relation = args.relation ?? "lt";
    if (!(relation in RELATIONS)) usageError(`--relation must be one of: ${Object.keys(RELATIONS).join(", ")}`);
    const part = resolveOperand(args.part, data, "part");
    const whole = resolveOperand(args.whole, data, "whole");
    if (whole === 0) usageError("--whole resolved to 0; the ratio is undefined");
    const claim = parseClaim(args.claim);
    const ratio = part / whole;
    const pass = RELATIONS[relation](ratio, claim);
    console.log(
      `ratio check: part ${part} / whole ${whole} = ${ratio} ; claim: ratio ${RELATION_TEXT[relation]} ${claim} (${args.claim}) -> ${pass ? "PASS" : "FAIL"}`,
    );
    if (!pass) failed = true;
  }

  if (!args.prose && args.part === undefined) {
    usageError("nothing to check: give --prose, or --part/--whole/--claim");
  }

  process.exit(failed ? 1 : 0);
}

main();
