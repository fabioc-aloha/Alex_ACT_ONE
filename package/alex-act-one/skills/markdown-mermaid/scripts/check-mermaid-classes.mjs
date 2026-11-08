#!/usr/bin/env node
/**
 * check-mermaid-classes.mjs - markdown-mermaid lint: classes and aspect ratio.
 *
 * Two deterministic checks the skill used to leave to the eye:
 *
 * 1. Class coverage (default mode):
 *      node check-mermaid-classes.mjs <file.md> [more.md ...]
 *    Extracts every ```mermaid block and, for flowchart / graph blocks, flags
 *    every node definition that carries no :::class suffix and every edge
 *    endpoint that is never defined with a class (a `class A,B name`
 *    statement also counts as classed). Other diagram types are reported as
 *    skipped: their grammars do not use :::class.
 *
 * 2. Rendered aspect ratio (--svg mode):
 *      node check-mermaid-classes.mjs --svg <rendered.svg>
 *    Measures the rendered SVG's viewBox (width / height) and fails when the
 *    ratio exceeds 4:1, the skill's split threshold. Measure the render, not
 *    the source: source text has no aspect ratio.
 *
 * Exit codes: 0 = clean, 1 = a check failed, 2 = usage error.
 * Node built-ins only.
 */

import { readFileSync } from "node:fs";

const MAX_ASPECT = 4;
const KEYWORDS = new Set([
  "flowchart", "graph", "td", "tb", "lr", "rl", "bt", "end", "subgraph",
  "classdef", "linkstyle", "class", "style", "click", "direction",
]);

function usageError(message) {
  console.error(`error: ${message}`);
  console.error("usage:");
  console.error("  node check-mermaid-classes.mjs <file.md> [more.md ...]");
  console.error("  node check-mermaid-classes.mjs --svg <rendered.svg>");
  process.exit(2);
}

function checkSvgAspect(path) {
  let svg;
  try {
    svg = readFileSync(path, "utf8");
  } catch (error) {
    usageError(`cannot read ${path}: ${error.message}`);
  }
  const svgTag = svg.match(/<svg\b([^>]*)>/);
  const viewBoxMatch = svgTag ? svgTag[1].match(/viewBox\s*=\s*"([^"]*)"/) : null;
  if (!viewBoxMatch) usageError(`${path}: no viewBox found on the rendered SVG`);
  const parts = viewBoxMatch[1].trim().split(/[\s,]+/).map(Number);
  if (parts.length !== 4 || !parts[2] || !parts[3]) usageError(`${path}: malformed viewBox "${viewBoxMatch[1]}"`);
  const ratio = parts[2] / parts[3];
  console.log(
    `${path}: viewBox ${parts[2]}x${parts[3]}, aspect ${ratio.toFixed(2)}:1 (split threshold ${MAX_ASPECT}:1)`,
  );
  if (ratio > MAX_ASPECT) {
    console.log("FAIL: diagram renders wider than 4:1; split it unless horizontal comparison is the point");
    return false;
  }
  console.log("ok: within the 4:1 limit");
  return true;
}

// Replace quoted substrings with spaces (same length) so bracket scanning
// never trips over label punctuation.
function maskQuotes(line) {
  return line.replace(/"[^"]*"/g, (quoted) => " ".repeat(quoted.length));
}

const OPENERS = { "(((": ")))", "[[": "]]", "[(": ")]", "([": "])", "((": "))", "{{": "}}", "[": "]", "(": ")", "{": "}", ">": "]" };

function findDefinitions(line) {
  const defs = [];
  const pattern = /([A-Za-z_][\w-]*)\s*(\(\(\(|\[\[|\(\(|\[\(|\(\[|\{\{|\[|\(|\{|>)/g;
  let match;
  while ((match = pattern.exec(line)) !== null) {
    const id = match[1];
    if (KEYWORDS.has(id.toLowerCase())) continue;
    const closer = OPENERS[match[2]];
    let depth = 0;
    let end = -1;
    for (let i = match.index + match[0].length; i < line.length; i += 1) {
      const ch = line[i];
      if (depth === 0 && line.startsWith(closer, i)) {
        end = i + closer.length;
        break;
      }
      if (ch === match[2].slice(-1) && match[2] !== ">") depth += 1;
      if (ch === closer[0] && depth > 0) depth -= 1;
    }
    if (end === -1) continue;
    const rest = line.slice(end);
    const classMatch = rest.match(/^\s*:::([A-Za-z_][\w-]*)/);
    defs.push({ id, classed: classMatch !== null, start: match.index, end: end + (classMatch ? classMatch[0].length : 0) });
  }
  return defs;
}

function lintBlock(blockLines, label) {
  const flags = [];
  const classedIds = new Set();
  const definedIds = new Set();
  let type = null;

  for (let i = 0; i < blockLines.length; i += 1) {
    const raw = blockLines[i];
    const line = maskQuotes(raw);
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (type === null) {
      const firstWord = trimmed.split(/\s+/)[0].toLowerCase();
      if (firstWord === "flowchart" || firstWord === "graph") {
        type = "flowchart";
      } else if (trimmed.startsWith("%%{")) {
        continue;
      } else {
        return { skipped: trimmed.split(/\s+/)[0] };
      }
      continue;
    }
    if (trimmed.startsWith("%%")) continue;
    const lower = trimmed.toLowerCase();
    if (lower.startsWith("classdef") || lower.startsWith("linkstyle") || lower.startsWith("style ")) continue;
    if (lower.startsWith("subgraph") || lower === "end" || lower.startsWith("direction")) continue;
    if (lower.startsWith("click ")) continue;
    const classStatement = trimmed.match(/^class\s+([\w,-]+)\s+([A-Za-z_][\w-]*)/i);
    if (classStatement) {
      for (const id of classStatement[1].split(",")) classedIds.add(id.trim());
      continue;
    }

    const defs = findDefinitions(line);
    for (const def of defs) {
      definedIds.add(def.id);
      if (def.classed) classedIds.add(def.id);
    }

    // Edge endpoints: blank out definitions and |labels|, then read the
    // identifiers adjacent to arrows.
    let rest = line;
    for (const def of [...defs].sort((a, b) => b.start - a.start)) {
      rest = rest.slice(0, def.start) + " ".repeat(def.end - def.start) + rest.slice(def.end);
    }
    rest = rest.replace(/\|[^|]*\|/g, (label) => " ".repeat(label.length));
    const endpointPatterns = [
      /([A-Za-z_][\w-]*)\s*(?=-->|---|--x|--o|==>|-\.->|<-->)/g,
      /(?:-->|---|==>|-\.->|<--)\s*([A-Za-z_][\w-]*)/g,
    ];
    for (const pattern of endpointPatterns) {
      let endpoint;
      while ((endpoint = pattern.exec(rest)) !== null) {
        const id = endpoint[1];
        if (!KEYWORDS.has(id.toLowerCase())) definedIds.add(id);
      }
    }
  }

  for (const id of definedIds) {
    if (!classedIds.has(id)) {
      // Definitions were already flagged at their line; this catches bare
      // endpoints that are never defined anywhere in the block.
      const alreadyFlagged = flags.some((flag) => flag.includes(`node "${id}"`));
      if (!alreadyFlagged) flags.push(`${label}: node "${id}" referenced but never defined with :::class`);
    }
  }
  return { flags };
}

function checkMarkdown(path) {
  let markdown;
  try {
    markdown = readFileSync(path, "utf8");
  } catch (error) {
    usageError(`cannot read ${path}: ${error.message}`);
  }
  const blocks = [];
  const fencePattern = /```mermaid\r?\n([\s\S]*?)```/g;
  let match;
  while ((match = fencePattern.exec(markdown)) !== null) blocks.push(match[1]);
  let failed = false;
  if (blocks.length === 0) console.log(`${path}: no mermaid blocks found`);
  blocks.forEach((block, index) => {
    const label = `${path} block ${index + 1}`;
    const result = lintBlock(block.split(/\r?\n/), label);
    if (result.skipped) {
      console.log(`${label}: skipped (${result.skipped} blocks do not use :::class)`);
    } else if (result.flags.length > 0) {
      failed = true;
      for (const flag of result.flags) console.log(`FLAG ${flag}`);
    } else {
      console.log(`${label}: ok, every node carries a :::class`);
    }
  });
  return !failed;
}

function main() {
  const argv = process.argv.slice(2);
  let ok = true;
  let didWork = false;
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === "--svg") {
      const path = argv[i + 1];
      if (!path) usageError("--svg needs a file path");
      ok = checkSvgAspect(path) && ok;
      didWork = true;
      i += 1;
    } else if (argv[i].startsWith("--")) {
      usageError(`unknown option ${argv[i]}`);
    } else {
      ok = checkMarkdown(argv[i]) && ok;
      didWork = true;
    }
  }
  if (!didWork) usageError("nothing to check: give a markdown file or --svg <rendered.svg>");
  process.exit(ok ? 0 : 1);
}

main();
