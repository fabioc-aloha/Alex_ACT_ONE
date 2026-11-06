// @ts-check
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import { crc32, deflateSync } from 'node:zlib';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const { formatHeadings, formatTables } = require(join(
  ROOT,
  'skills',
  'md-to-word',
  'scripts',
  'md-to-word.cjs',
));

test('professional headings apply the configured treatment to bare and styled runs', () => {
  const xml = [
    '<w:p>',
    '<w:pPr><w:pStyle w:val="Heading1"/></w:pPr>',
    '<w:r><w:t>Document title</w:t></w:r>',
    '<w:r><w:rPr><w:rFonts w:ascii="Calibri"/><w:b w:val="0"/><w:color w:val="FF0000"/><w:sz w:val="22"/><w:szCs w:val="22"/></w:rPr><w:t> continued</w:t></w:r>',
    '</w:p>',
  ].join('');

  const formatted = formatHeadings(xml, 'professional');
  const headingProperties = '<w:rFonts w:ascii="Aptos Display" w:hAnsi="Aptos Display"/><w:b/><w:color w:val="0B1F33"/><w:sz w:val="48"/><w:szCs w:val="48"/>';

  assert.equal((formatted.match(/<w:rPr>/g) || []).length, 2);
  assert.equal((formatted.match(new RegExp(headingProperties, 'g')) || []).length, 2);
  assert.match(formatted, /<w:spacing w:before="360" w:after="120"\/><w:keepNext\/><w:keepLines\/>/);
  assert.doesNotMatch(formatted, /Calibri|FF0000|w:val="22"|w:b w:val="0"/);
});

test('table formatting removes fixed layouts while retaining professional table styling', () => {
  const xml = [
    '<w:tbl>',
    '<w:tblPr><w:tblW w:type="auto" w:w="0"/><w:tblLayout w:type="fixed"/></w:tblPr>',
    '<w:tr><w:tc><w:p><w:r><w:t>Header</w:t></w:r></w:p></w:tc></w:tr>',
    '<w:tr><w:tc><w:p><w:r><w:t>Value</w:t></w:r></w:p></w:tc></w:tr>',
    '</w:tbl>',
  ].join('');

  const formatted = formatTables(xml);

  assert.doesNotMatch(formatted, /<w:tblLayout/);
  assert.match(formatted, /<w:tblW xmlns:w="http:\/\/schemas\.openxmlformats\.org\/wordprocessingml\/2006\/main" w:type="pct" w:w="5000"\/>/);
  assert.match(formatted, /<w:tblBorders xmlns:w="http:\/\/schemas\.openxmlformats\.org\/wordprocessingml\/2006\/main">/);
  assert.match(formatted, /<w:tblHeader xmlns:w="http:\/\/schemas\.openxmlformats\.org\/wordprocessingml\/2006\/main"\/>/);
  assert.match(formatted, /<w:shd xmlns:w="http:\/\/schemas\.openxmlformats\.org\/wordprocessingml\/2006\/main" w:fill="0078D4" w:val="clear"\/>/);
});

function pngChunk(type, data) {
  const chunk = Buffer.alloc(data.length + 12);
  chunk.writeUInt32BE(data.length);
  chunk.write(type, 4, 'ascii');
  data.copy(chunk, 8);
  chunk.writeUInt32BE(crc32(chunk.subarray(4, -4)), chunk.length - 4);
  return chunk;
}

function corruptPng(mode) {
  const signature = Buffer.from('89504e470d0a1a0a', 'hex');
  if (mode === 'signature-only') {
    const bytes = Buffer.alloc(24);
    signature.copy(bytes);
    bytes.writeUInt32BE(1, 16);
    bytes.writeUInt32BE(1, 20);
    return bytes;
  }
  const header = Buffer.from('00000001000000010806000000', 'hex');
  if (mode === 'zero-size') header.writeUInt32BE(0);
  const ihdr = pngChunk('IHDR', header);
  const raw = mode === 'bad-filter' ? Buffer.from([5, 0, 0, 0, 255])
    : mode === 'short-raster' ? Buffer.from([0]) : Buffer.from([0, 0, 0, 0, 255]);
  const compressed = mode === 'bad-deflate' ? Buffer.from('not a zlib stream') : deflateSync(raw);
  const idat = pngChunk('IDAT', compressed);
  if (mode === 'bad-crc') idat[idat.length - 1] ^= 1;
  return Buffer.concat([signature, ihdr, idat, ...(mode === 'missing-iend' ? [] : [pngChunk('IEND', Buffer.alloc(0))])]);
}

for (const mode of ['failure', 'partial-failure', 'empty-success', 'corrupt-success',
  'signature-only', 'zero-size', 'bad-filter', 'short-raster', 'bad-deflate', 'bad-crc', 'missing-iend']) {
  test(`Word refuses stale Mermaid PNG on ${mode} and preserves source and prior output`, t => {
    const directory = fs.mkdtempSync(join(ROOT, '.word-mermaid-test-'));
    t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
    const source = join(directory, 'source.md');
    const output = join(directory, 'output.docx');
    const images = join(directory, 'images');
    fs.mkdirSync(images);
    const previous = Buffer.from('previous PNG from a different source');
    fs.writeFileSync(join(images, 'diagram-1.png'), previous);
    fs.writeFileSync(output, 'previous DOCX');
    const markdown = '# Current\n\n```mermaid\nflowchart TD\nA[Current] --> B[New]\n```\n';
    fs.writeFileSync(source, markdown);
    const renderer = join(directory, 'renderer.cjs');
    fs.writeFileSync(renderer, [
      "const fs = require('node:fs');",
      "const output = process.argv[process.argv.indexOf('-o') + 1];",
      ['partial-failure', 'corrupt-success'].includes(mode) ? "fs.writeFileSync(output, 'partial PNG');" : '',
      !['failure', 'partial-failure', 'empty-success', 'corrupt-success'].includes(mode)
        ? `fs.writeFileSync(output, Buffer.from('${corruptPng(mode).toString('base64')}', 'base64'));` : '',
      ['failure', 'partial-failure'].includes(mode) ? "process.stderr.write('fixture render failed'); process.exit(19);" : 'process.exit(0);',
    ].join('\n'));
    const pandocHook = join(directory, 'pandoc.cjs');
    fs.writeFileSync(pandocHook, "require('node:fs').writeFileSync(process.env.PANDOC_MARKER, 'called'); process.exit(0);");
    const marker = join(directory, 'pandoc-called');
    const result = spawnSync(process.execPath, [
      join(ROOT, 'skills', 'md-to-word', 'scripts', 'md-to-word.cjs'), source, output,
    ], { cwd: directory, encoding: 'utf8', timeout: 15000, env: {
      ...process.env, TMP: directory, TEMP: directory, TMPDIR: directory,
      ACT_TOOL_MMDC: renderer, ACT_TOOL_PANDOC: pandocHook, PANDOC_MARKER: marker,
    } });
    assert.notEqual(result.status, 0, result.stdout + result.stderr);
    assert.match(result.stderr, /Mermaid|diagram.*failed/i);
    assert.equal(fs.existsSync(marker), false, 'Pandoc must not consume a stale or missing diagram');
    assert.deepEqual(fs.readFileSync(join(images, 'diagram-1.png')), previous);
    assert.equal(fs.readFileSync(output, 'utf8'), 'previous DOCX');
    assert.equal(fs.readFileSync(source, 'utf8'), markdown);
  });
}