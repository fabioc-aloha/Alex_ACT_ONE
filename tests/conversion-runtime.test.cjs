const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { test } = require('node:test');
const { runTool } = require('../scripts/shared/tool-runner.cjs');

const ROOT = path.resolve(__dirname, '..');
const available = name => spawnSync(process.platform === 'win32' ? 'where.exe' : 'which', [name],
    { encoding: 'utf8', timeout: 5000 }).status === 0;
const pandoc = available('pandoc');
for (const [skill, extension] of [['md-to-html', 'html'], ['md-to-word', 'docx']]) {
    test(`real ${skill} preserves literal inline/fenced code and renders tables and links`, {
        skip: pandoc ? false : 'Pandoc is not installed; no real conversion claimed',
    }, t => {
        const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'one converter-fidelity-'));
        t.after(() => fs.rmSync(fixture, { recursive: true, force: true }));
        const source = path.join(fixture, 'source with spaces.md');
        const output = path.join(fixture, 'output.' + extension);
        fs.writeFileSync(source, '# Fixture\n\nLiteral `\\alpha` and ``x==y==z with ` ticks``.\n\n' +
            'Prose ==marked== and [Example](https://example.invalid/fixture).\n\n' +
            '| Item | Count |\n| --- | --- |\n| North | 12 |\n\n' +
            '~~~text\n# literal heading\n- [ ] literal list\n\\beta\n~~~\n');
        const result = spawnSync(process.execPath, [
            path.join(ROOT, 'skills', skill, 'scripts', skill + '.cjs'), source, output,
        ], { encoding: 'utf8', timeout: 30000 });
        assert.equal(result.status, 0, result.stderr + result.stdout);
        assert.ok(fs.statSync(output).size > 0);
        const rendered = extension === 'html' ? fs.readFileSync(output, 'utf8')
            : runTool('pandoc', [output, '--to=plain'], { encoding: 'utf8', timeout: 10000 });
        assert.ok(rendered.includes('\\alpha'));
        assert.ok(rendered.includes('x==y==z'));
        assert.ok(rendered.includes('\\beta'));
        assert.ok(rendered.includes('North'));
        assert.ok(rendered.includes('Example'));
        if (extension === 'html') {
            assert.match(rendered, /<code>\\alpha<\/code>/);
            assert.match(rendered, /<table/);
            assert.match(rendered, /href="https:\/\/example\.invalid\/fixture"/);
        }
    });
}
test('the installed Mermaid npm CLI starts through the shared tool runner', {
    skip: available('mmdc') ? false : 'Mermaid CLI not installed',
}, () => {
    assert.match(runTool('mmdc', ['--version'], { encoding: 'utf8', timeout: 15000 }).trim(), /^\d+\.\d+\.\d+/);
});

const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=', 'base64');
function conversionFixture(t) {
    const directory = fs.mkdtempSync(path.join(ROOT, '.conversion-test-'));
    t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
    return directory;
}
function convert(skill, directory, source, output, args = [], overrides = {}) {
    return spawnSync(process.execPath, [
        path.join(ROOT, 'skills', skill, 'scripts', skill + '.cjs'), source, output, ...args,
    ], { cwd: directory, encoding: 'utf8', timeout: 30000,
        env: { ...process.env, TMP: directory, TEMP: directory, TMPDIR: directory, ...overrides } });
}

test('real Pandoc DOCX media survive extraction cleanup with original PNG bytes', {
    skip: pandoc ? false : 'Pandoc unavailable: embedded DOCX extraction not exercised',
}, t => {
    const directory = conversionFixture(t);
    const source = path.join(directory, 'embedded image.md');
    const docx = path.join(directory, 'embedded.docx');
    const output = path.join(directory, 'converted.md');
    fs.writeFileSync(path.join(directory, 'pixel image.png'), PNG);
    fs.writeFileSync(source, '# Embedded image\n\n![Pixel](pixel%20image.png)\n');
    runTool('pandoc', [source, '-o', docx, '--resource-path', directory], { timeout: 15000 });
    const result = convert('docx-to-md', directory, docx, output);
    assert.equal(result.status, 0, result.stderr + result.stdout);
    const markdown = fs.readFileSync(output, 'utf8');
    const references = [...markdown.matchAll(/!\[[^\]]*\]\(([^)]+)\)/g)].map(match => match[1]);
    assert.equal(references.length, 1);
    for (const reference of references) {
        assert.match(reference, /^images\//);
        assert.deepEqual(fs.readFileSync(path.join(directory, reference)), PNG);
    }
    assert.equal(fs.readdirSync(directory).some(name => name.startsWith('docx-to-md-media-')), false);
});

for (const missing of [false, true]) {
    test(`DOCX extraction handles encoded absolute media paths; missing=${missing}`, t => {
        const directory = conversionFixture(t);
        const media = path.join(directory, 'media root');
        fs.mkdirSync(path.join(media, 'media'), { recursive: true });
        const asset = path.join(media, 'media', 'pixel image.png');
        if (!missing) fs.writeFileSync(asset, PNG);
        const { extractImages } = require('../skills/docx-to-md/scripts/docx-to-md.cjs');
        const markdown = `![Pixel](<${asset.replace(/\\/g, '/').replace(/ /g, '%20')}>)`;
        if (missing) {
            assert.throws(() => extractImages(markdown, directory, 'images', media), /image|media/i);
        } else {
            const rewritten = extractImages(markdown, directory, 'images', media);
            assert.equal(rewritten, '![Pixel](images/image-001.png)');
            assert.deepEqual(fs.readFileSync(path.join(directory, 'images', 'image-001.png')), PNG);
        }
    });
}

test('DOCX extraction preserves image syntax in inline, fenced, and indented code while copying real images', t => {
    const directory = conversionFixture(t);
    const { extractImages } = require('../skills/docx-to-md/scripts/docx-to-md.cjs');
    fs.writeFileSync(path.join(directory, 'real.png'), PNG);
    const literal = '![Example](missing-example.png)';
    const dataExample = '![Pixel](data:image/png;base64,ZmFrZQ==)';
    const before = [
        `Inline \`${literal}\` and \`\`${dataExample} with \` ticks\`\`.`,
        '',
        '````markdown',
        '```',
        literal,
        dataExample,
        '```',
        '````',
        '',
        '~~~markdown',
        literal,
        '~~~',
        '',
        `    ${literal}`,
        '',
        `\t${dataExample}`,
        '',
        '- A list item',
        '',
        '    ![Actual](real.png)',
        '',
        `        ${literal}`,
        '',
        `>     ${literal}`,
        '',
        '![Actual](real.png)',
        '',
    ].join('\n');
    const result = extractImages(before, directory, 'images', directory);
    const expected = before.replace('    ![Actual](real.png)', '    ![Actual](images/image-001.png)')
        .replace('\n![Actual](real.png)', '\n![Actual](images/image-002.png)');
    assert.equal(result, expected);
    assert.deepEqual(fs.readdirSync(path.join(directory, 'images')).sort(), ['image-001.png', 'image-002.png']);
    for (const filename of ['image-001.png', 'image-002.png']) {
        assert.deepEqual(fs.readFileSync(path.join(directory, 'images', filename)), PNG);
    }
});

test('real DOCX roundtrip preserves literal image examples alongside extracted media', {
    skip: pandoc ? false : 'Pandoc unavailable: literal image-code roundtrip not exercised',
}, t => {
    const directory = conversionFixture(t);
    const source = path.join(directory, 'examples.md');
    const docx = path.join(directory, 'examples.docx');
    const output = path.join(directory, 'converted.md');
    const literal = '![Example](missing-example.png)';
    fs.writeFileSync(path.join(directory, 'real.png'), PNG);
    fs.writeFileSync(source, `# Examples\n\nInline \`${literal}\`.\n\n\`\`\`markdown\n${literal}\n\`\`\`\n\n![Actual](real.png)\n`);
    runTool('pandoc', [source, '-o', docx, '--resource-path', directory], { timeout: 15000 });
    const result = convert('docx-to-md', directory, docx, output);
    assert.equal(result.status, 0, result.stderr + result.stdout);
    const markdown = fs.readFileSync(output, 'utf8');
    assert.ok(markdown.includes(`\`${literal}\``), markdown);
    assert.ok(markdown.includes(`    ${literal}`), markdown);
    assert.match(markdown, /!\[Actual\]\(images\/image-001\.png\)/);
    assert.deepEqual(fs.readFileSync(path.join(directory, 'images', 'image-001.png')), PNG);
    assert.equal(fs.readdirSync(directory).some(name => name.startsWith('docx-to-md-media-')), false);
});

for (const [marker, args, expected] of [['', ['--toc'], true], ['[toc]\n\n', [], true], ['', [], false]]) {
    test(`real HTML TOC links target headings, marker=${!!marker}, flag=${!!args.length}`, {
        skip: pandoc ? false : 'Pandoc unavailable: HTML TOC not exercised',
    }, t => {
        const directory = conversionFixture(t);
        const source = path.join(directory, 'source.md');
        const output = path.join(directory, 'output.html');
        fs.writeFileSync(source, `${marker}# Document\n\n## North region\n\nText.\n`);
        const result = convert('md-to-html', directory, source, output, args);
        assert.equal(result.status, 0, result.stderr + result.stdout);
        const html = fs.readFileSync(output, 'utf8');
        assert.equal((html.match(/<!DOCTYPE html>/gi) || []).length, 1);
        assert.equal((html.match(/<html\b/gi) || []).length, 1);
        assert.equal((html.match(/<body\b/gi) || []).length, 1);
        assert.match(html, /id="north-region"/);
        assert.equal(/href="#north-region"/.test(html), expected);
        assert.doesNotMatch(html, /\[toc\]/i);
    });
}

for (const skill of ['md-to-html', 'md-to-eml']) {
    test(`real ${skill} embeds URL-encoded local image bytes`, {
        skip: pandoc ? false : 'Pandoc unavailable: encoded image conversion not exercised',
    }, t => {
        const directory = conversionFixture(t);
        fs.writeFileSync(path.join(directory, 'pixel # % & ü.png'), PNG);
        const source = path.join(directory, 'source.md');
        const output = path.join(directory, skill === 'md-to-html' ? 'output.html' : 'output.eml');
        fs.writeFileSync(source, '---\nfrom: sender@example.invalid\nto: recipient@example.invalid\nsubject: Fixture\n---\n\n' +
            '![Pixel](pixel%20%23%20%25%20%26%20%C3%BC.png)\n');
        const result = convert(skill, directory, source, output, skill === 'md-to-eml' ? ['--inline-images'] : []);
        assert.equal(result.status, 0, result.stderr + result.stdout);
        const rendered = fs.readFileSync(output, 'utf8');
        if (skill === 'md-to-html') {
            assert.ok(rendered.includes(`data:image/png;base64,${PNG.toString('base64')}`));
        } else {
            assert.match(rendered, /Content-ID: <image1@md-to-eml>/);
            const part = rendered.split('Content-Disposition: inline;')[1].split('\r\n\r\n')[1].split('\r\n--')[0];
            assert.deepEqual(Buffer.from(part.replace(/\s/g, ''), 'base64'), PNG);
            const htmlPart = rendered.split('Content-Transfer-Encoding: base64\r\n\r\n')[1].split('\r\n--')[0];
            assert.match(Buffer.from(htmlPart.replace(/\s/g, ''), 'base64').toString('utf8'), /src="cid:image1@md-to-eml"/);
        }
    });
    test(`${skill} propagates real Pandoc failure without writing output`, t => {
        const directory = conversionFixture(t);
        const source = path.join(directory, 'source.md');
        const output = path.join(directory, 'output');
        const hook = path.join(directory, 'fail.cjs');
        fs.writeFileSync(source, '---\nfrom: sender@example.invalid\nto: recipient@example.invalid\nsubject: Fixture\n---\n\n# Text\n');
        fs.writeFileSync(hook, "process.stderr.write('fixture Pandoc failed'); process.exit(23);\n");
        const result = convert(skill, directory, source, output, [], { ACT_TOOL_PANDOC: hook });
        assert.notEqual(result.status, 0);
        assert.match(result.stderr, /fixture Pandoc failed/);
        assert.equal(fs.existsSync(output), false);
    });
}

const { mermaidToTableFallback } = require('../scripts/shared/mermaid-pipeline.cjs');
for (const skill of ['md-to-html', 'md-to-eml']) {
    for (const [src, error] of [
        ['missing%20image.png', /image|ENOENT/i],
        ['bad%ZZ.png', /encod|URI|image/i],
        ['file:///private/image.png', /file:|file URL/i],
        ['ftp://example.invalid/image.png', /scheme|unsupported|image/i],
        ['directory.png', /file|directory|image/i],
        ['unsupported.bmp', /unsupported|format|image/i],
    ]) {
        test(`${skill} rejects invalid local image destination ${src}`, t => {
            const directory = conversionFixture(t);
            const source = path.join(directory, 'source.md');
            const output = path.join(directory, 'output');
            const hook = path.join(directory, 'pandoc.cjs');
            fs.mkdirSync(path.join(directory, 'directory.png'));
            fs.writeFileSync(path.join(directory, 'unsupported.bmp'), 'bytes');
            fs.writeFileSync(source, '---\nfrom: sender@example.invalid\nto: recipient@example.invalid\nsubject: Fixture\n---\n\n# Images');
            fs.writeFileSync(hook, `require('node:fs').writeFileSync(process.argv[process.argv.indexOf('-o') + 1], ${JSON.stringify(`<img src="${src}">`)});`);
            const result = convert(skill, directory, source, output,
                skill === 'md-to-eml' ? ['--inline-images'] : [], { ACT_TOOL_PANDOC: hook });
            assert.notEqual(result.status, 0, result.stdout + result.stderr);
            assert.match(result.stderr, error);
            assert.equal(fs.existsSync(output), false);
        });
    }
    test(`${skill} leaves remote and data image URLs unchanged without fetching`, t => {
        const directory = conversionFixture(t);
        const source = path.join(directory, 'source.md');
        const output = path.join(directory, 'output');
        const hook = path.join(directory, 'pandoc.cjs');
        const urls = ['HTTPS://example.invalid/a.png', '//example.invalid/b.png', 'data:image/png;base64,ZmFrZQ=='];
        const html = urls.map(src => `<img src="${src}">`).join('\n');
        fs.writeFileSync(source, '---\nfrom: sender@example.invalid\nto: recipient@example.invalid\nsubject: Fixture\n---\n\n# Images');
        fs.writeFileSync(hook, `require('node:fs').writeFileSync(process.argv[process.argv.indexOf('-o') + 1], ${JSON.stringify(html)});`);
        const result = convert(skill, directory, source, output,
            skill === 'md-to-eml' ? ['--inline-images'] : [], { ACT_TOOL_PANDOC: hook });
        assert.equal(result.status, 0, result.stderr);
        const rendered = fs.readFileSync(output, 'utf8');
        const body = skill === 'md-to-html' ? rendered
            : Buffer.from(rendered.split('\r\n\r\n')[1].replace(/\s/g, ''), 'base64').toString('utf8');
        for (const url of urls) assert.ok(body.includes(`src="${url}"`), body);
        assert.doesNotMatch(rendered, /Content-ID:/);
    });
}
test('Mermaid fallback preserves labeled edges, implicit endpoints, chains, and node labels', () => {
    const fallback = mermaidToTableFallback('flowchart TD\nA[Start] -->|go| B[Finish] --> C\nD -- retry --> A\n');
    for (const row of ['| A | Start |', '| B | Finish |', '| C | C |', '| D | D |',
        '| Start | Finish | go |', '| Finish | C |  |', '| D | Start | retry |']) {
        assert.ok(fallback.includes(row), `Missing ${row} in ${fallback}`);
    }
});

test('real detached Word converter loads the documented shared closure and creates a readable DOCX', {
    skip: pandoc ? false : 'Pandoc unavailable: detached Word conversion not exercised',
}, t => {
    const directory = conversionFixture(t);
    const detached = path.join(directory, 'detached');
    const converterDir = path.join(detached, 'skills', 'md-to-word', 'scripts');
    const unrelated = path.join(directory, 'unrelated working directory');
    fs.mkdirSync(converterDir, { recursive: true });
    fs.mkdirSync(unrelated);
    fs.cpSync(path.join(ROOT, 'scripts', 'shared'), path.join(detached, 'scripts', 'shared'), { recursive: true });
    fs.copyFileSync(path.join(ROOT, 'skills', 'md-to-word', 'scripts', 'md-to-word.cjs'),
        path.join(converterDir, 'md-to-word.cjs'));
    const source = path.join(unrelated, 'source.md');
    const output = path.join(unrelated, 'output.docx');
    fs.writeFileSync(source, '# Detached fixture\n\nLiteral `const one = 1`.\n');
    const result = spawnSync(process.execPath, [path.join(converterDir, 'md-to-word.cjs'), source, output], {
        cwd: unrelated, encoding: 'utf8', timeout: 30000,
        env: { ...process.env, TMP: directory, TEMP: directory, TMPDIR: directory,
            ALEX_ACT_ONE_RUNTIME_ROOT: path.join(directory, 'isolated-runtime') },
    });
    assert.equal(result.status, 0, result.stderr + result.stdout);
    assert.ok(fs.statSync(output).size > 0);
    assert.match(runTool('pandoc', [output, '--to=plain'], { encoding: 'utf8', timeout: 15000 }),
        /Detached fixture[\s\S]*const one = 1/);
});

test('Word accepts only a fresh successful Mermaid render and embeds its current PNG bytes', {
    skip: pandoc ? false : 'Pandoc unavailable: successful Word image embedding not exercised',
}, t => {
    const directory = conversionFixture(t);
    const source = path.join(directory, 'source.md');
    const output = path.join(directory, 'output.docx');
    const images = path.join(directory, 'images');
    fs.mkdirSync(images);
    fs.writeFileSync(path.join(images, 'diagram-1.png'), 'old diagram');
    fs.writeFileSync(source, '# Current diagram\n\n```mermaid\nflowchart TD\nA[Current] --> B[New]\n```\n');
    const renderer = path.join(directory, 'renderer.cjs');
    fs.writeFileSync(renderer, [
        "const fs = require('node:fs'); const assert = require('node:assert/strict');",
        "const input = process.argv[process.argv.indexOf('-i') + 1];",
        "const output = process.argv[process.argv.indexOf('-o') + 1];",
        "assert.match(fs.readFileSync(input, 'utf8'), /A\\[Current\\] --> B\\[New\\]/);",
        "assert.equal(fs.existsSync(output), false, 'render destination must be fresh');",
        `fs.writeFileSync(output, Buffer.from('${PNG.toString('base64')}', 'base64'));`,
    ].join('\n'));
    const result = convert('md-to-word', directory, source, output, [], { ACT_TOOL_MMDC: renderer });
    assert.equal(result.status, 0, result.stderr + result.stdout);
    assert.deepEqual(fs.readFileSync(path.join(images, 'diagram-1.png')), PNG);
    const media = path.join(directory, 'roundtrip');
    runTool('pandoc', [output, '-o', path.join(directory, 'roundtrip.md'), '--extract-media', media], { timeout: 15000 });
    const embedded = fs.readdirSync(path.join(media, 'media')).filter(name => name.endsWith('.png'));
    assert.equal(embedded.length, 1);
    assert.deepEqual(fs.readFileSync(path.join(media, 'media', embedded[0])), PNG);
});

test('shared image paths decode once, honor HTML entities, and ignore URL query/fragment suffixes', t => {
    const directory = conversionFixture(t);
    const { resolveLocalImagePath } = require('../scripts/shared/local-image-path.cjs');
    for (const [filename, url] of [
        ['literal%20name.png', 'literal%2520name.png'],
        ['a & b.png', 'a%20&amp;%20b.png?v=1#preview'],
        ['pixel #.png', 'pixel%20%23.png'],
    ]) {
        fs.writeFileSync(path.join(directory, filename), PNG);
        assert.equal(resolveLocalImagePath(url, directory), path.join(directory, filename));
    }
});

for (const mode of ['missing-media', 'pandoc-failure']) {
    test(`DOCX extraction ${mode} preserves existing Markdown and cleans staging`, t => {
        const directory = conversionFixture(t);
        const source = path.join(directory, 'source.docx');
        const output = path.join(directory, 'output.md');
        const hook = path.join(directory, 'pandoc.cjs');
        fs.writeFileSync(source, 'fixture DOCX');
        fs.writeFileSync(output, 'existing Markdown');
        fs.writeFileSync(hook, mode === 'pandoc-failure'
            ? "process.stderr.write('fixture Pandoc failed'); process.exit(23);"
            : "const fs = require('node:fs'); const path = require('node:path'); " +
              "const root = process.argv[process.argv.indexOf('--extract-media') + 1]; " +
              "fs.writeFileSync(process.argv[process.argv.indexOf('-o') + 1], " +
              "'![Missing](<' + path.join(root, 'media', 'missing.png').replace(/\\\\/g, '/') + '>)');");
        const result = convert('docx-to-md', directory, source, output, [], { ACT_TOOL_PANDOC: hook });
        assert.notEqual(result.status, 0);
        assert.match(result.stderr, mode === 'pandoc-failure' ? /fixture Pandoc failed/ : /missing.png|ENOENT/);
        assert.equal(fs.readFileSync(output, 'utf8'), 'existing Markdown');
        assert.equal(fs.readdirSync(directory).some(name => name.startsWith('docx-to-md-media-')), false);
    });
}

test('real HTML preserves literal HTML code while rejecting active HTML hidden among raw backticks', {
    skip: pandoc ? false : 'Pandoc unavailable: rendered HTML safety not exercised',
}, t => {
    const directory = conversionFixture(t);
    const source = path.join(directory, 'source.md');
    const output = path.join(directory, 'output.html');
    fs.writeFileSync(source, '# Safe\n\nconst one = 1.\n\n`<script>alert(1)</script>`\n\n~~~html\n<img src=x onerror="active()">\n~~~\n');
    const safe = convert('md-to-html', directory, source, output);
    assert.equal(safe.status, 0, safe.stderr + safe.stdout);
    const rendered = fs.readFileSync(output, 'utf8');
    assert.match(rendered, /&lt;script&gt;/);
    assert.doesNotMatch(rendered, /<script\b/);
    fs.unlinkSync(output);
    fs.writeFileSync(source, '<pre>\n`<script>alert(1)</script>`\n</pre>\n');
    const unsafe = convert('md-to-html', directory, source, output);
    assert.notEqual(unsafe.status, 0);
    assert.match(unsafe.stderr, /Unsafe executable HTML/);
    assert.equal(fs.existsSync(output), false);
});
for (const source of ['sequenceDiagram\nAlice->>Bob: Hello\nBob-->>Alice: Reply',
    'flowchart TD\nA[Start] --> B[End]\nB & C --> D',
    'pie title Votes\n"Yes": 7\n"No": 3']) {
    test(`unsupported Mermaid fallback retains complete source: ${source.split('\n')[0]}`, () => {
        const fallback = mermaidToTableFallback(source);
        assert.match(fallback, /unsupported|source retained/i);
        assert.ok(fallback.includes(source));
        assert.doesNotMatch(fallback, /^(\*\[Diagram\]\*)$/);
    });
}

for (const skill of ['md-to-html', 'md-to-eml']) {
    test(`real ${skill} preserves indented and blockquote-fenced HTML examples`, {
        skip: pandoc ? false : 'Pandoc unavailable: literal HTML examples not exercised',
    }, t => {
        const directory = conversionFixture(t);
        const source = path.join(directory, 'source.md');
        const output = path.join(directory, skill === 'md-to-html' ? 'output.html' : 'output.eml');
        fs.writeFileSync(source, '---\nfrom: sender@example.invalid\nto: recipient@example.invalid\nsubject: Examples\n---\n\n' +
            '    <script>/* indented literal */</script>\n\n> ~~~html\n> <script>/* quoted literal */</script>\n> ~~~\n');
        const result = convert(skill, directory, source, output);
        assert.equal(result.status, 0, result.stderr + result.stdout);
        const rendered = fs.readFileSync(output, 'utf8');
        const html = skill === 'md-to-html' ? rendered
            : Buffer.from(rendered.split('\r\n\r\n')[1].replace(/\s/g, ''), 'base64').toString('utf8');
        assert.ok(html.includes('indented literal'));
        assert.ok(html.includes('quoted literal'));
        assert.match(html, /&lt;script&gt;/);
        assert.doesNotMatch(html, /<script\b/);
    });
}
