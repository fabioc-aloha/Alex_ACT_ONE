'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { test } = require('node:test');
const { crc32, deflateSync } = require('node:zlib');
const { resolveLocalImagePath } = require('../scripts/shared/local-image-path.cjs');
const { extractImages, cleanPandocQuirks, normalizeHeadings, cleanTables } = require('../skills/docx-to-md/scripts/docx-to-md.cjs');
const { checkImages } = require('../skills/docx-to-md/scripts/validate-md.cjs');

const ROOT = path.resolve(__dirname, '..');
function fixture(t) {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'one-converter-safety-'));
    t.after(() => fs.rmSync(root, { recursive: true, force: true }));
    return root;
}
function convert(root, skill, args, overrides = {}) {
    return spawnSync(process.execPath, [path.join(ROOT, 'skills', skill, 'scripts', `${skill}.cjs`), ...args], {
        cwd: root, encoding: 'utf8', timeout: 15000,
        env: { ...process.env, TMP: root, TEMP: root, TMPDIR: root, ...overrides },
    });
}
function chunk(type, data) {
    const result = Buffer.alloc(data.length + 12);
    result.writeUInt32BE(data.length);
    result.write(type, 4);
    data.copy(result, 8);
    result.writeUInt32BE(crc32(result.subarray(4, -4)), result.length - 4);
    return result;
}
function png(width = 1, height = 1, color = 6) {
    const header = Buffer.from('00000001000000010806000000', 'hex');
    header.writeUInt32BE(width);
    header.writeUInt32BE(height, 4);
    header[9] = color;
    return Buffer.concat([Buffer.from('89504e470d0a1a0a', 'hex'), chunk('IHDR', header),
        chunk('IDAT', deflateSync(Buffer.from([0, 0, 0, 0, 255]))), chunk('IEND', Buffer.alloc(0))]);
}

for (const extension of ['.MD', '.mD', '.markdown']) {
    test(`HTML default and debug outputs preserve ${extension} input`, t => {
        const root = fixture(t);
        const source = path.join(root, `source${extension}`);
        const original = '# Original\n\nKeep this source.\n';
        const hook = path.join(root, 'pandoc.cjs');
        fs.writeFileSync(source, original);
        fs.writeFileSync(hook, "require('node:fs').writeFileSync(process.argv[process.argv.indexOf('-o')+1],'<p>Fixture</p>');");
        const result = convert(root, 'md-to-html', [source, '--debug'], { ACT_TOOL_PANDOC: hook });
        assert.equal(result.status, 0, result.stderr);
        assert.equal(fs.readFileSync(source, 'utf8'), original);
        const stem = extension === '.markdown' ? source : source.slice(0, -extension.length);
        assert.match(fs.readFileSync(stem + '.html', 'utf8'), /<!DOCTYPE html>/);
        assert.ok(fs.existsSync(stem + '_debug_combined.md'));
    });
}

for (const alias of ['same-path', 'hard-link', 'debug-path']) {
    test(`HTML rejects ${alias} source/output aliases before conversion or debug writes`, t => {
        const root = fixture(t);
        const source = path.join(root, 'source.md');
        const original = '# Original\n';
        const output = alias === 'same-path' ? source : path.join(root, 'output.html');
        const hook = path.join(root, 'pandoc.cjs');
        const marker = path.join(root, 'called');
        fs.writeFileSync(source, original);
        if (alias === 'hard-link') fs.linkSync(source, output);
        if (alias === 'debug-path') fs.linkSync(source, path.join(root, 'source_debug_combined.md'));
        fs.writeFileSync(hook, `require('node:fs').writeFileSync(${JSON.stringify(marker)},'called');process.exit(2);`);
        const result = convert(root, 'md-to-html', [source, output, '--debug'], { ACT_TOOL_PANDOC: hook });
        assert.notEqual(result.status, 0);
        assert.match(result.stderr, /source|alias|same/i);
        assert.equal(fs.readFileSync(source, 'utf8'), original);
        assert.equal(fs.existsSync(marker), false);
    });
}

for (const literal of [
    '`const style = "{.underline}";`',
    '``\\[example\\] {.custom} {#anchor} with ` ticks``',
    '~~~javascript\nconst style = "{.underline}";\n~~~\n',
    '    const style = "{.underline}";\n    const path = "\\\\";\n',
    '> ~~~javascript\n> const style = "{.underline}";\n> ~~~\n',
    '- A list\n\n  ~~~javascript\n  const style = "{.underline}";\n  ~~~\n',
]) {
    test(`DOCX cleanup preserves literal code: ${JSON.stringify(literal)}`, () => {
        const prose = 'Text {.underline}\n\n';
        assert.equal(cleanPandocQuirks(prose + literal), 'Text \n\n' + literal);
    });
}

test('DOCX heading and table cleanup leave code blocks unchanged', () => {
    const code = '~~~markdown\n### Literal heading\n| A | B |\n| --- | --- |\n| C | D |\n~~~\n\n';
    const input = code + '### Real heading\n';
    assert.equal(normalizeHeadings(input), code + '# Real heading\n');
    assert.equal(cleanTables(input), input);
});

test('DOCX acceptance decodes image filenames after removing URL query and fragment suffixes', t => {
    const root = fixture(t);
    fs.writeFileSync(path.join(root, 'pixel # %.png'), 'fixture');
    assert.deepEqual(checkImages('![Pixel](pixel%20%23%20%25.png?download=1#preview)', root).issues, []);
    assert.match(checkImages('![Pixel](bad%ZZ.png)', root).issues[0], /invalid.*encoding/i);
    assert.match(checkImages('![Pixel](%5C%5Creview.invalid%5Cshare%5Cpixel.png)', root).issues[0], /absolute path/i);
});

for (const src of ['\\\\review.invalid\\share\\pixel.png', '%5C%5Creview.invalid%5Cshare%5Cpixel.png',
    '\\\\?\\UNC\\review.invalid\\share\\pixel.png', '\\\\.\\pipe\\review', '%2F%2Freview.invalid/share/pixel.png']) {
    test(`network/device image paths fail before filesystem access: ${src}`, t => {
        const root = fixture(t);
        const original = fs.statSync;
        const calls = [];
        fs.statSync = file => { calls.push(file); return { isFile: () => true }; };
        try {
            assert.throws(() => resolveLocalImagePath(src, root), /network|UNC|device/i);
        } finally {
            fs.statSync = original;
        }
        assert.deepEqual(calls, []);
    });
}

for (const [field, value, args] of [
    ['subject', 'Safe\rBcc: other@example.invalid', []],
    ['subject', 'Safe\rBcc: other@example.invalid', ['--test']],
    ['from', 'sender@example.invalid\rBcc: other@example.invalid', []],
    ['to', 'recipient@example.invalid\u0000', ['--test']],
    ['reply-to', 'sender@example.invalid\u007f', []],
    ['subject', 'Safe', ['--test-to', 'review@example.invalid\rBcc: other@example.invalid']],
]) {
    test(`email rejects header controls before conversion: ${field}, ${JSON.stringify(args)}`, t => {
        const root = fixture(t);
        const source = path.join(root, 'source.md');
        const output = path.join(root, 'output.eml');
        const hook = path.join(root, 'pandoc.cjs');
        const marker = path.join(root, 'called');
        const headers = { from: 'sender@example.invalid', to: 'recipient@example.invalid', subject: 'Safe', [field]: value };
        fs.writeFileSync(source, '---\n' + Object.entries(headers).map(([key, text]) => `${key}: ${text}`).join('\n') + '\n---\n\nHello\n');
        fs.writeFileSync(output, 'prior email');
        fs.writeFileSync(hook, `require('node:fs').writeFileSync(${JSON.stringify(marker)},'called');process.exit(2);`);
        const result = convert(root, 'md-to-eml', [source, output, ...args], { ACT_TOOL_PANDOC: hook });
        assert.notEqual(result.status, 0);
        assert.match(result.stderr, /header.*control|control.*header/i);
        assert.equal(fs.existsSync(marker), false);
        assert.equal(fs.readFileSync(output, 'utf8'), 'prior email');
    });
}

for (const html of ['<script>/* review */</script>', '<img src="x" onerror="review()">',
    '<a href="jav&#x61;script:review()">review</a>']) {
    test(`email rejects active rendered HTML: ${html}`, t => {
        const root = fixture(t);
        const source = path.join(root, 'source.md');
        const output = path.join(root, 'output.eml');
        const hook = path.join(root, 'pandoc.cjs');
        fs.writeFileSync(source, '---\nfrom: sender@example.invalid\nto: recipient@example.invalid\nsubject: Safe\n---\n\nHello\n');
        fs.writeFileSync(output, 'prior email');
        fs.writeFileSync(hook, `require('node:fs').writeFileSync(process.argv[process.argv.indexOf('-o')+1],${JSON.stringify(html)});`);
        const result = convert(root, 'md-to-eml', [source, output], { ACT_TOOL_PANDOC: hook });
        assert.notEqual(result.status, 0);
        assert.match(result.stderr, /Unsafe executable HTML/);
        assert.equal(fs.readFileSync(output, 'utf8'), 'prior email');
    });
}

test('email preserves ordinary Unicode headers and escaped literal HTML', t => {
    const root = fixture(t);
    const source = path.join(root, 'source.md');
    const output = path.join(root, 'output.eml');
    const hook = path.join(root, 'pandoc.cjs');
    fs.writeFileSync(source, '---\r\nfrom: sender@example.invalid\r\nto: recipient@example.invalid\r\nsubject: Caf\u00e9\r\n---\r\n\r\n`<script>`\r\n');
    fs.writeFileSync(hook, "require('node:fs').writeFileSync(process.argv[process.argv.indexOf('-o')+1],'<p><code>&lt;script&gt;</code></p>');");
    const result = convert(root, 'md-to-eml', [source, output], { ACT_TOOL_PANDOC: hook });
    assert.equal(result.status, 0, result.stderr);
    assert.match(fs.readFileSync(output, 'utf8'), /Subject: Caf\u00e9\r\n/);
});

for (const content of ['> ~~~markdown\n> ![Example](missing.png)\n> ~~~\n',
    '- A list\n\n  ~~~markdown\n  ![Example](missing.png)\n  ~~~\n',
    '> - A list\n>\n>   ~~~markdown\n>   ![Example](missing.png)\n>   ~~~\n',
    '~~~markdown\n> ![Example](missing.png)\n> ~~~\n![Example](missing2.png)\n~~~\n',
    '> ~~~markdown\n> > ![Example](missing.png)\n> ~~~\n']) {
    test(`image extraction preserves container fences: ${JSON.stringify(content)}`, t => {
        const root = fixture(t);
        assert.equal(extractImages(content, root, 'images', root), content);
        assert.equal(fs.existsSync(path.join(root, 'images')), false);
    });
}

for (const content of ['    <script>/* literal */</script>\n',
    '> ~~~html\n> <script>/* literal */</script>\n> ~~~\n',
    '- A list\n\n      <script>/* literal */</script>\n']) {
    test(`HTML screening accepts block code: ${JSON.stringify(content)}`, t => {
        const root = fixture(t);
        const source = path.join(root, 'source.md');
        fs.writeFileSync(source, content);
        const result = convert(root, 'md-to-html', [source, '--dry-run']);
        assert.equal(result.status, 0, result.stderr);
    });
}

for (const mode of ['later-render', 'partial-pandoc', 'oversize-png']) {
    test(`Word preserves the complete prior output set on ${mode}`, t => {
        const root = fixture(t);
        const source = path.join(root, 'source.md');
        const output = path.join(root, 'output.docx');
        const images = path.join(root, 'images');
        fs.mkdirSync(images);
        fs.writeFileSync(output, 'prior DOCX');
        fs.writeFileSync(path.join(images, 'diagram-1.png'), 'prior one');
        fs.writeFileSync(path.join(images, 'diagram-2.png'), 'prior two');
        fs.writeFileSync(source, '# Fixture\n\n```mermaid\nflowchart TD\nA --> B\n```\n\n```mermaid\nflowchart TD\nC --> D\n```\n');
        const renderer = path.join(root, 'renderer.cjs');
        const hook = path.join(root, 'pandoc.cjs');
        const counter = path.join(root, 'counter');
        fs.writeFileSync(renderer, [
            "const fs=require('node:fs');",
            `const count=${JSON.stringify(counter)};`,
            'const n=fs.existsSync(count)?Number(fs.readFileSync(count,"utf8"))+1:1;fs.writeFileSync(count,String(n));',
            mode === 'later-render' ? 'if(n===2){console.error("later renderer failed");process.exit(19);}' : '',
            `fs.writeFileSync(process.argv[process.argv.indexOf('-o')+1],Buffer.from('${(mode === 'oversize-png' ? png(100000, 100000) : png()).toString('base64')}','base64'));`,
        ].join('\n'));
        fs.writeFileSync(hook, "require('node:fs').writeFileSync(process.argv[process.argv.indexOf('-o')+1],'partial DOCX');console.error('partial Pandoc failure');process.exit(23);");
        const result = convert(root, 'md-to-word', [source, output], { ACT_TOOL_MMDC: renderer, ACT_TOOL_PANDOC: hook });
        assert.notEqual(result.status, 0);
        assert.match(result.stderr, mode === 'oversize-png' ? /PNG.*(?:budget|limit)|(?:budget|limit).*PNG/i : /failed|failure/i);
        assert.equal(fs.readFileSync(output, 'utf8'), 'prior DOCX');
        assert.equal(fs.readFileSync(path.join(images, 'diagram-1.png'), 'utf8'), 'prior one');
        assert.equal(fs.readFileSync(path.join(images, 'diagram-2.png'), 'utf8'), 'prior two');
    });
}

for (const extraction of [true, false]) {
    test(`DOCX conversion preserves document and media after late failure, extraction=${extraction}`, t => {
        const root = fixture(t);
        const source = path.join(root, 'source.docx');
        const output = path.join(root, 'output.md');
        const hook = path.join(root, 'pandoc.cjs');
        fs.mkdirSync(path.join(root, 'images'));
        fs.writeFileSync(path.join(root, 'images', 'image-001.png'), 'prior image');
        fs.writeFileSync(source, 'fixture DOCX');
        fs.writeFileSync(output, 'prior Markdown');
        fs.writeFileSync(hook, extraction ? [
            "const fs=require('node:fs'),path=require('node:path');",
            "const media=process.argv[process.argv.indexOf('--extract-media')+1];",
            "fs.writeFileSync(path.join(media,'real.png'),'new image');",
            "fs.writeFileSync(process.argv[process.argv.indexOf('-o')+1],'![One](real.png)\\n\\n![Two](missing.png)\\n');",
        ].join('\n') : "require('node:fs').writeFileSync(process.argv[process.argv.indexOf('-o')+1],'partial Markdown');console.error('fixture failure');process.exit(23);");
        const result = convert(root, 'docx-to-md', [source, output, ...(extraction ? [] : ['--no-extract-images'])],
            { ACT_TOOL_PANDOC: hook });
        assert.notEqual(result.status, 0);
        assert.equal(fs.readFileSync(output, 'utf8'), 'prior Markdown');
        assert.equal(fs.readFileSync(path.join(root, 'images', 'image-001.png'), 'utf8'), 'prior image');
    });
}

for (const [width, overBudget] of [[16382, false], [16383, false], [16384, true]]) {
    test(`PNG validation checks the exact 256 MiB budget, width=${width}`, t => {
        const root = fixture(t);
        const source = path.join(root, 'source.md');
        const output = path.join(root, 'output.docx');
        const renderer = path.join(root, 'renderer.cjs');
        fs.writeFileSync(source, '```mermaid\nflowchart TD\nA --> B\n```\n');
        fs.writeFileSync(renderer, `require('node:fs').writeFileSync(process.argv[process.argv.indexOf('-o')+1],Buffer.from('${png(width, 16384, 0).toString('base64')}','base64'));`);
        const result = convert(root, 'md-to-word', [source, output], { ACT_TOOL_MMDC: renderer });
        assert.notEqual(result.status, 0);
        // Tiny IDAT data avoids large allocations; in-budget headers must reach raster validation.
        assert.match(result.stderr, overBudget ? /256 MiB PNG budget/ : /compressed raster length/);
        assert.equal(fs.existsSync(output), false);
    });
}
