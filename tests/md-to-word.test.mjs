// @ts-check
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

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