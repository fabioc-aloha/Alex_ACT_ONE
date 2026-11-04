#!/usr/bin/env node
/**
 * invert-svg.mjs - figure-generator helper: dataset inversion from a sample SVG.
 *
 * Solves the linear scale from two named axis ticks and inverts every data
 * point (circle centres, polyline / polygon points) through it, asserting
 * that each derived value lands exactly on the domain's natural grid. This
 * replaces hand arithmetic in the skill's Dataset inversion procedure:
 * the model names the ticks and reads the output; the script computes.
 *
 *   node invert-svg.mjs <sample.svg> --tick-a 0 --tick-b 50
 *   node invert-svg.mjs <sample.svg> --tick-a 0 --tick-b 100 --axis x --precision 1
 *   node invert-svg.mjs <sample.svg> --tick-a 0 --tick-b 50 --write data/<slug>.json
 *
 * Tick pairing: each numeric <text> label is anchored to the nearest tick-mark
 * <line> (within 10px perpendicular, 80px along the axis); if no line matches,
 * the label's own coordinate is used.
 *
 * Options:
 *   --axis y|x        Axis the ticks belong to (default y)
 *   --grid <step>     Natural grid step (default 1)
 *   --precision <n>   Grid step = 10^-n (overrides --grid)
 *   --write <path>    Also write the derived values as a JSON array
 *
 * Exit codes: 0 = every point on-grid, 1 = a point landed off-grid,
 * 2 = usage error or ticks not found.
 * Node built-ins only.
 */

import { readFileSync, writeFileSync } from "node:fs";

function usageError(message) {
  console.error(`error: ${message}`);
  console.error("usage: node invert-svg.mjs <sample.svg> --tick-a <value> --tick-b <value> [--axis y|x] [--grid <step> | --precision <n>] [--write <path>]");
  process.exit(2);
}

function parseArgs(argv) {
  const args = { axis: "y" };
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
  if (positional.length !== 1) usageError("expected exactly one sample SVG path");
  args.file = positional[0];
  return args;
}

function parseAttrs(tagText) {
  const attrs = {};
  const pattern = /([\w-]+)\s*=\s*"([^"]*)"/g;
  let match;
  while ((match = pattern.exec(tagText)) !== null) attrs[match[1]] = match[2];
  return attrs;
}

function decodeText(raw) {
  return raw
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .trim();
}

function extractElements(svg) {
  const texts = [];
  const lines = [];
  const points = [];
  let match;

  const textPattern = /<text\b([^>]*)>([\s\S]*?)<\/text>/g;
  while ((match = textPattern.exec(svg)) !== null) {
    const attrs = parseAttrs(match[1]);
    const content = decodeText(match[2]);
    const numeric = /^-?\d+(?:\.\d+)?$/.test(content.replace(/%$/, ""));
    texts.push({
      x: Number(attrs.x ?? 0),
      y: Number(attrs.y ?? 0),
      content,
      value: numeric ? Number(content.replace(/%$/, "")) : null,
    });
  }

  const linePattern = /<line\b([^>]*?)\/?>/g;
  while ((match = linePattern.exec(svg)) !== null) {
    const attrs = parseAttrs(match[1]);
    lines.push({
      x1: Number(attrs.x1 ?? 0),
      y1: Number(attrs.y1 ?? 0),
      x2: Number(attrs.x2 ?? 0),
      y2: Number(attrs.y2 ?? 0),
    });
  }

  const circlePattern = /<circle\b([^>]*?)\/?>/g;
  while ((match = circlePattern.exec(svg)) !== null) {
    const attrs = parseAttrs(match[1]);
    if (attrs.cx !== undefined && attrs.cy !== undefined) {
      points.push({ kind: "circle", x: Number(attrs.cx), y: Number(attrs.cy) });
    }
  }

  const polyPattern = /<poly(?:line|gon)\b([^>]*?)\/?>/g;
  while ((match = polyPattern.exec(svg)) !== null) {
    const attrs = parseAttrs(match[1]);
    if (!attrs.points) continue;
    const pairs = attrs.points.trim().split(/\s+/);
    for (const pair of pairs) {
      const [x, y] = pair.split(",").map(Number);
      if (Number.isFinite(x) && Number.isFinite(y)) points.push({ kind: "poly", x, y });
    }
  }

  return { texts, lines, points };
}

function tickAnchor(text, lines, axis) {
  // Anchor a tick label to the nearest tick-mark line; fall back to the
  // label's own coordinate when no line is close.
  let best = null;
  for (const line of lines) {
    if (axis === "y") {
      if (Math.abs(line.y1 - line.y2) > 0.01) continue; // tick marks are horizontal
      const lineY = line.y1;
      const perp = Math.abs(lineY - text.y);
      const along = Math.min(
        Math.abs(text.x - line.x1),
        Math.abs(text.x - line.x2),
        text.x >= Math.min(line.x1, line.x2) && text.x <= Math.max(line.x1, line.x2) ? 0 : Infinity,
      );
      if (perp <= 10 && along <= 80 && (best === null || perp < best.perp)) best = { coord: lineY, perp };
    } else {
      if (Math.abs(line.x1 - line.x2) > 0.01) continue; // tick marks are vertical
      const lineX = line.x1;
      const perp = Math.abs(lineX - text.x);
      const along = Math.min(
        Math.abs(text.y - line.y1),
        Math.abs(text.y - line.y2),
        text.y >= Math.min(line.y1, line.y2) && text.y <= Math.max(line.y1, line.y2) ? 0 : Infinity,
      );
      if (perp <= 10 && along <= 80 && (best === null || perp < best.perp)) best = { coord: lineX, perp };
    }
  }
  return best ? best.coord : axis === "y" ? text.y : text.x;
}

function findTick(texts, lines, axis, value) {
  const label = texts.find((text) => text.value === value);
  if (!label) return null;
  return { value, coord: tickAnchor(label, lines, axis) };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.axis !== "y" && args.axis !== "x") usageError(`--axis must be y or x, got "${args.axis}"`);
  if (args["tick-a"] === undefined || args["tick-b"] === undefined) {
    usageError("both --tick-a and --tick-b are required (the labeled values of two axis ticks)");
  }
  const tickValueA = Number(args["tick-a"]);
  const tickValueB = Number(args["tick-b"]);
  if (!Number.isFinite(tickValueA) || !Number.isFinite(tickValueB) || tickValueA === tickValueB) {
    usageError("--tick-a and --tick-b must be two different numbers");
  }
  const grid =
    args.precision !== undefined ? 10 ** -Number(args.precision) : args.grid !== undefined ? Number(args.grid) : 1;
  if (!Number.isFinite(grid) || grid <= 0) usageError("grid step must be a positive number");

  let svg;
  try {
    svg = readFileSync(args.file, "utf8");
  } catch (error) {
    usageError(`cannot read ${args.file}: ${error.message}`);
  }

  const { texts, lines, points } = extractElements(svg);
  const tickA = findTick(texts, lines, args.axis, tickValueA);
  const tickB = findTick(texts, lines, args.axis, tickValueB);
  if (!tickA || !tickB) {
    usageError(
      `tick labels not found in ${args.file}: looked for ${!tickA ? tickValueA : ""} ${!tickB ? tickValueB : ""}`.trim(),
    );
  }
  if (tickA.coord === tickB.coord) usageError("both ticks resolved to the same pixel coordinate; scale is undefined");

  // scale: pixels per unit, sign carries the axis direction.
  const scale = (tickA.coord - tickB.coord) / (tickValueB - tickValueA);
  const valueAt = (pixel) => tickValueA + (tickA.coord - pixel) / scale;

  console.log(
    `scale: ${Math.abs(scale)} px per unit (ticks ${tickValueA} @ ${tickA.coord}px, ${tickValueB} @ ${tickB.coord}px, axis ${args.axis})`,
  );

  let offGrid = 0;
  const derived = [];
  for (const point of points) {
    const pixel = args.axis === "y" ? point.y : point.x;
    const raw = valueAt(pixel);
    const quotient = raw / grid;
    const snapped = Math.round(quotient) * grid;
    const onGrid = Math.abs(quotient - Math.round(quotient)) < 1e-6;
    if (!onGrid) offGrid += 1;
    derived.push(Number(snapped.toFixed(10)));
    console.log(
      `point (${point.x}, ${point.y}) [${point.kind}] -> value ${raw} ${onGrid ? "on-grid" : "OFF-GRID"}`,
    );
  }

  console.log(`inversion: ${points.length} points, ${points.length - offGrid} on-grid, ${offGrid} off-grid (grid step ${grid})`);

  if (args.write) {
    writeFileSync(args.write, `${JSON.stringify(derived, null, 2)}\n`);
    console.log(`wrote derived values to ${args.write}`);
  }

  process.exit(offGrid > 0 ? 1 : 0);
}

main();
