#!/usr/bin/env node
/**
 * check-print-floor.mjs - print-svg-style-guide gate: print-legibility floor.
 *
 * The floor is gate-enforced by this script, not by a visual pass. For every
 * <text> element in an SVG it computes print points from the guide's formula
 *
 *   printPoints = fontSizePx * printWidthIn * 72 / viewBoxWidth
 *
 * (printWidthIn defaults to 4.39, the book figure width) and asserts:
 *
 *   - instructional text (no marker) is at or above 5.8pt
 *   - text below 5.8pt carries a data-print-role marker ("micro" or "note")
 *   - marked text is at or above the 2.9pt small-text floor
 *   - a "micro" element whose text is 40+ characters is promoted to "note"
 *     (the auto-promotion rule, asserted here rather than counted by eye)
 *
 *   node check-print-floor.mjs <figure.svg> [--print-width-in 4.39]
 *
 * Supports explicit unitless/px font sizes on text, g, and svg elements.
 * Stylesheets, transforms, and independently styled tspans require a rendered
 * check and are reported as unsupported, not passed.
 * Exit codes: 0 = gate passes, 1 = a violation, 2 = error/unsupported input.
 * Node built-ins only.
 */

import { readFileSync } from "node:fs";

const INSTRUCTIONAL_FLOOR_PT = 5.8;
const SMALL_FLOOR_PT = 2.9;
const PROMOTE_MIN_CHARS = 40;
const DEFAULT_PRINT_WIDTH_IN = 4.39;

function usageError(message) {
  console.error(`error: ${message}`);
  console.error("usage: node check-print-floor.mjs <figure.svg> [--print-width-in <inches>]");
  process.exit(2);
}

function parseArgs(argv) {
  const args = {};
  const positional = [];
  for (let i = 0; i < argv.length; i += 1) {
    const item = argv[i];
    if (item.startsWith("--")) {
      const value = argv[i + 1];
      if (value === undefined || value.startsWith("--")) usageError(`missing value for ${item}`);
      args[item.slice(2)] = value;
      i += 1;
    } else {
      positional.push(item);
    }
  }
  if (positional.length !== 1) usageError("expected exactly one SVG path");
  args.file = positional[0];
  return args;
}

function parseAttrs(tagText) {
  const attrs = {};
  const pattern = /([\w-]+)\s*=\s*(["'])(.*?)\2/g;
  let match;
  while ((match = pattern.exec(tagText)) !== null) attrs[match[1]] = match[3];
  return attrs;
}

function fontSizeFrom(attrs) {
  let value = attrs["font-size"];
  if (attrs.style) {
    if (/(?:^|;)\s*font\s*:/i.test(attrs.style)) usageError("unsupported font shorthand; use an explicit px font-size");
    const styleMatch = attrs.style.match(/(?:^|;)\s*font-size\s*:\s*([^;]+)/i);
    if (styleMatch) value = styleMatch[1].replace(/\s*!important\s*$/i, "").trim();
  }
  if (value === undefined) return null;
  const size = String(value).trim().match(/^(\d+(?:\.\d+)?|\.\d+)(?:px)?$/);
  if (!size || !Number.isFinite(Number(size[1]))) usageError(`unsupported font-size "${value}"; use unitless or px sizes`);
  return Number(size[1]);
}

function decodeText(raw) {
  return raw
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const printWidthIn = args["print-width-in"] !== undefined ? Number(args["print-width-in"]) : DEFAULT_PRINT_WIDTH_IN;
  if (!Number.isFinite(printWidthIn) || printWidthIn <= 0) usageError("--print-width-in must be a positive number");

  let svg;
  try {
    svg = readFileSync(args.file, "utf8");
  } catch (error) {
    usageError(`cannot read ${args.file}: ${error.message}`);
  }
  if (/<style\b|\btransform\s*[=:]|<tspan\b[^>]*(?:font-size|style\s*=)/i.test(svg)) {
    usageError("unsupported stylesheet, transform, or styled tspan; measure the rendered text instead");
  }

  const svgTag = svg.match(/<svg\b([^>]*)>/);
  if (!svgTag) usageError(`${args.file}: no <svg> element found`);
  const svgAttrs = parseAttrs(svgTag[1]);
  let viewBoxWidth = null;
  if (svgAttrs.viewBox) {
    const parts = svgAttrs.viewBox.trim().split(/[\s,]+/).map(Number);
    if (parts.length === 4 && Number.isFinite(parts[2])) viewBoxWidth = parts[2];
  }
  if (viewBoxWidth === null && svgAttrs.width) viewBoxWidth = Number(svgAttrs.width);
  if (!Number.isFinite(viewBoxWidth) || viewBoxWidth <= 0) usageError(`${args.file}: cannot determine a positive viewBox width`);

  const tokenPattern = /<text\b([^>]*)>([\s\S]*?)<\/text>|<g\b([^>]*?)>|<\/g\s*>/g;
  const groupStack = [{ fontSize: fontSizeFrom(svgAttrs), role: svgAttrs["data-print-role"] ?? null }];
  const elements = [];
  let match;
  while ((match = tokenPattern.exec(svg)) !== null) {
    if (match[0].startsWith("</")) {
      groupStack.pop();
      continue;
    }
    if (match[3] !== undefined) {
      if (match[0].endsWith("/>")) continue;
      const attrs = parseAttrs(match[3]);
      groupStack.push({ fontSize: fontSizeFrom(attrs), role: attrs["data-print-role"] ?? null });
      continue;
    }
    const attrs = parseAttrs(match[1]);
    let fontSize = fontSizeFrom(attrs);
    let role = attrs["data-print-role"] ?? null;
    for (let i = groupStack.length - 1; i >= 0 && (fontSize === null || role === null); i -= 1) {
      if (fontSize === null) fontSize = groupStack[i].fontSize;
      if (role === null) role = groupStack[i].role;
    }
    elements.push({ fontSize, role, text: decodeText(match[2]) });
  }

  let violations = 0;
  for (const element of elements) {
    const snippet = element.text.length > 30 ? `${element.text.slice(0, 30)}...` : element.text;
    const chars = element.text.length;
    if (element.fontSize === null) {
      usageError(`cannot resolve font-size for "${snippet}"; specify a unitless or px size on text or its ancestors`);
    }
    const pt = (element.fontSize * printWidthIn * 72) / viewBoxWidth;
    const problems = [];
    if (pt < SMALL_FLOOR_PT - 1e-9) {
      problems.push(`below the ${SMALL_FLOOR_PT}pt small-text floor`);
    } else if (pt < INSTRUCTIONAL_FLOOR_PT - 1e-9 && element.role !== "micro" && element.role !== "note") {
      problems.push(`below the ${INSTRUCTIONAL_FLOOR_PT}pt instructional floor without a data-print-role marker`);
    }
    if (element.role === "micro" && chars >= PROMOTE_MIN_CHARS) {
      problems.push(`micro text is ${chars} chars (>= ${PROMOTE_MIN_CHARS}); must be promoted to "note"`);
    }
    if (problems.length > 0) {
      violations += problems.length;
      for (const problem of problems) {
        console.log(
          `VIOLATION "${snippet}" : ${element.fontSize}px = ${pt.toFixed(2)}pt, role ${element.role ?? "none"}, ${chars} chars - ${problem}`,
        );
      }
    } else {
      console.log(
        `ok "${snippet}" : ${element.fontSize}px = ${pt.toFixed(2)}pt, role ${element.role ?? "none"}, ${chars} chars`,
      );
    }
  }

  console.log(
    `print-floor gate: ${elements.length} text elements, viewBox width ${viewBoxWidth}, ${violations} violation(s)`,
  );
  process.exit(violations > 0 ? 1 : 0);
}

main();
