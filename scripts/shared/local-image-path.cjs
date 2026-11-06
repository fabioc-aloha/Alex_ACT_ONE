'use strict';

const fs = require('node:fs');
const path = require('node:path');

/** Resolve a local HTML image URL without fetching remote/data URLs or file URLs. */
function resolveLocalImagePath(src, sourceDir) {
  const url = src.replace(/&#(?:x([0-9a-f]+)|([0-9]+));?/gi, (_, hex, decimal) =>
    String.fromCodePoint(Number.parseInt(hex || decimal, hex ? 16 : 10)))
    .replace(/&(amp|quot|apos|lt|gt);/gi, (_, name) =>
      ({ amp: '&', quot: '"', apos: "'", lt: '<', gt: '>' })[name.toLowerCase()]);
  if (/^\\\\/.test(url)) throw new Error(`Network/UNC and device image paths are unsupported: ${src}`);
  if (/^(?:https?:|data:|\/\/)/i.test(url)) return null;
  if (/^file:/i.test(url)) throw new Error(`Image file URLs are unsupported; use a local path: ${src}`);
  if (/^[a-z][a-z0-9+.-]*:/i.test(url) && !/^[a-z]:[\\/]/i.test(url)) {
    throw new Error(`Unsupported image URL scheme: ${src}`);
  }
  let local;
  try {
    local = decodeURIComponent(url.split(/[?#]/, 1)[0]);
  } catch (error) {
    throw new Error(`Invalid image URL encoding: ${src}`, { cause: error });
  }
  if (/^[\\/]{2}/.test(local)) throw new Error(`Network/UNC and device image paths are unsupported: ${src}`);
  if (!local || /[\u0000-\u001f\u007f]/.test(local)) throw new Error(`Invalid local image path: ${src}`);
  const imagePath = path.resolve(sourceDir, local);
  if (!fs.statSync(imagePath).isFile()) throw new Error(`Image destination is not a file: ${src}`);
  return imagePath;
}

module.exports = { resolveLocalImagePath };
