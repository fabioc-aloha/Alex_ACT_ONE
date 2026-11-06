const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const test = require('node:test');

const root = path.resolve(__dirname, '..');

function fixture(t) {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'act-helper-test-'));
    t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
    return (name, content) => {
        const file = path.join(directory, name);
        fs.writeFileSync(file, content, 'utf8');
        return file;
    };
}

function run(skill, script, ...args) {
    const result = spawnSync(process.execPath, [
        path.join(root, 'skills', skill, 'scripts', script), ...args,
    ], { encoding: 'utf8', timeout: 10000 });
    assert.ifError(result.error);
    return { ...result, output: result.stdout + result.stderr };
}

for (const rhs of ["'<p>static</p>'", 'DOMPurify.sanitize(input)', 'DOMPurify.sanitize(makeHtml(")"))']) {
    test(`HTML scan accepts a complete supported expression: ${rhs}`, (t) => {
        const write = fixture(t);
        const result = run('markdown-sanitization-chain', 'lint-innerhtml.cjs',
            write('surface.js', `element.innerHTML = ${rhs};`));
        assert.equal(result.status, 0, result.output);
    });
}

for (const rhs of [
    "'<p>' + untrusted",
    'DOMPurify.sanitize(prefix) + untrusted',
    'untrusted || DOMPurify.sanitize(fallback)',
    'DOMPurify.sanitize(prefix), untrusted',
    '`<p>${untrusted}</p>`',
]) {
    test(`HTML scan flags partially sanitized expressions: ${rhs}`, (t) => {
        const write = fixture(t);
        const result = run('markdown-sanitization-chain', 'lint-innerhtml.cjs',
            write('surface.js', `element.innerHTML = ${rhs};`));
        assert.equal(result.status, 1, result.output);
    });
}

test('HTML scan does not trust a previously sanitized identifier after reassignment', (t) => {
    const write = fixture(t);
    const result = run('markdown-sanitization-chain', 'lint-innerhtml.cjs',
        write('surface.js', 'let value = DOMPurify.sanitize(input);\nvalue = untrusted;\nelement.innerHTML = value;'));
    assert.equal(result.status, 1, result.output);
});

for (const size of ['12', '12px']) {
    test(`print floor accepts readable ${size} text`, (t) => {
        const write = fixture(t);
        const file = write('figure.svg', `<svg viewBox="0 0 640 480"><text font-size="${size}">Readable</text></svg>`);
        const result = run('print-svg-style-guide', 'check-print-floor.mjs', file);
        assert.equal(result.status, 0, result.output);
        assert.doesNotMatch(result.output, /NaN/);
    });
}

test('print floor rejects tiny px-unit text', (t) => {
    const write = fixture(t);
    const file = write('figure.svg', '<svg viewBox="0 0 640 480"><text font-size="1px">Tiny</text></svg>');
    const result = run('print-svg-style-guide', 'check-print-floor.mjs', file);
    assert.equal(result.status, 1, result.output);
});

test('print floor reads single quotes and inherited root font size', (t) => {
    const write = fixture(t);
    const file = write('figure.svg', "<svg viewBox='0 0 640 480' font-size='12px'><text>Readable</text></svg>");
    const result = run('print-svg-style-guide', 'check-print-floor.mjs', file);
    assert.equal(result.status, 0, result.output);
});

for (const body of [
    '<text font-size="1em">Relative</text>',
    '<g transform="scale(0.1)"><text font-size="12">Scaled</text></g>',
    '<text font-size="12"><tspan font-size="1">Small span</tspan></text>',
    '<style>text { font-size: 1px; }</style><text font-size="12">Styled</text>',
]) {
    test(`print floor explicitly rejects unsupported sizing: ${body}`, (t) => {
        const write = fixture(t);
        const file = write('figure.svg', `<svg viewBox="0 0 640 480">${body}</svg>`);
        const result = run('print-svg-style-guide', 'check-print-floor.mjs', file);
        assert.equal(result.status, 2, result.output);
        assert.match(result.output, /unsupported|cannot/i);
    });
}

for (const [prose, value, status] of [
    ['Change: -10%.', -0.1, 0],
    ['Change: -10%.', 0.1, 1],
    ['Loss: -$4.2M.', -4200000, 0],
    ['Change: \u221210%.', -0.1, 0],
    ['Change: 10%.', 0.1, 0],
]) {
    test(`numeric membership preserves signs: ${prose} against ${value}`, (t) => {
        const write = fixture(t);
        const result = run('render-verify', 'check-claims.mjs',
            '--prose', write('prose.md', prose), '--data', write('data.json', JSON.stringify({ value })));
        assert.equal(result.status, status, result.output);
    });
}

for (const [whole, claim, status] of [['10', '1/5', 0], ['2', '1/5', 1], ['0', '1/5', 2]]) {
    test(`ratio check distinguishes pass, failure and invalid input: whole=${whole}`, () => {
        const result = run('render-verify', 'check-claims.mjs',
            '--part', '1', '--whole', whole, '--claim', claim, '--relation', 'lt');
        assert.equal(result.status, status, result.output);
    });
}

for (const node of ['A[Start]', 'A((Start))', 'A[[Start]]', 'A[(Start)]', 'A([Start])', 'A{{Start}}', 'A(((Start)))']) {
    test(`Mermaid class checker accepts suffixes on ${node}`, (t) => {
        const write = fixture(t);
        const file = write('diagram.md', '```mermaid\nflowchart TD\n' + node + ':::blue --> B[End]:::blue\n```\n');
        const result = run('markdown-mermaid', 'check-mermaid-classes.mjs', file);
        assert.equal(result.status, 0, result.output);
    });
}

test('Mermaid class statements satisfy class coverage', (t) => {
    const write = fixture(t);
    const file = write('diagram.md', '```mermaid\nflowchart TD\nA[Start] --> B[End]\nclass A,B blue\n```\n');
    const result = run('markdown-mermaid', 'check-mermaid-classes.mjs', file);
    assert.equal(result.status, 0, result.output);
});

test('Mermaid checker still rejects an unclassed endpoint', (t) => {
    const write = fixture(t);
    const file = write('diagram.md', '```mermaid\nflowchart TD\nA[Start]:::blue --> B\n```\n');
    const result = run('markdown-mermaid', 'check-mermaid-classes.mjs', file);
    assert.equal(result.status, 1, result.output);
    assert.match(result.output, /node "B"/);
});

for (const destination of ['C:\\media\\missing.png', 'C:/media/missing.png', 'file:///C:/media/missing.png']) {
    test(`conversion validator rejects nonportable image paths: ${destination}`, (t) => {
        const write = fixture(t);
        const file = write('output.md', `# Document\n\n![Image](${destination})\n`);
        const result = run('docx-to-md', 'validate-md.cjs', file);
        assert.equal(result.status, 1, result.output);
        assert.match(result.output, /absolute path/);
    });
}

test('conversion validator checks existing relative images', (t) => {
    const write = fixture(t);
    write('image.png', 'fixture');
    const file = write('output.md', '# Document\n\n![Image](image.png)\n');
    assert.equal(run('docx-to-md', 'validate-md.cjs', file).status, 0);
    fs.unlinkSync(path.join(path.dirname(file), 'image.png'));
    assert.equal(run('docx-to-md', 'validate-md.cjs', file).status, 1);
});

test('conversion validator preserves protocol-relative remote image URLs', (t) => {
    const write = fixture(t);
    const file = write('output.md', '# Document\n\n![Remote](//cdn.example.com/image.png)\n');
    const result = run('docx-to-md', 'validate-md.cjs', file);
    assert.equal(result.status, 0, result.output);
});

const axes = '<text x="20" y="120">0</text><text x="70" y="120">50</text>' +
    '<text x="0" y="100">0</text><text x="0" y="50">50</text>';

test('SVG inversion selects tick labels from the requested y axis', (t) => {
    const write = fixture(t);
    const file = write('sample.svg', `<svg>${axes}<circle cx="45" cy="75"/></svg>`);
    const result = run('figure-generator', 'invert-svg.mjs', file, '--tick-a', '0', '--tick-b', '50');
    assert.equal(result.status, 0, result.output);
    assert.match(result.output, /value 25 on-grid/);
});

test('SVG inversion selects tick labels from the requested x axis', (t) => {
    const write = fixture(t);
    const file = write('sample.svg', `<svg>${axes}<circle cx="45" cy="75"/></svg>`);
    const result = run('figure-generator', 'invert-svg.mjs', file, '--tick-a', '0', '--tick-b', '50', '--axis', 'x');
    assert.equal(result.status, 0, result.output);
    assert.match(result.output, /value 25 on-grid/);
});

test('SVG inversion reports ambiguous axis labels instead of guessing', (t) => {
    const write = fixture(t);
    const duplicate = '<text x="200" y="100">0</text><text x="200" y="50">50</text>';
    const file = write('sample.svg', `<svg>${axes}${duplicate}<circle cx="45" cy="75"/></svg>`);
    const result = run('figure-generator', 'invert-svg.mjs', file, '--tick-a', '0', '--tick-b', '50');
    assert.equal(result.status, 2, result.output);
    assert.match(result.output, /ambiguous/i);
});

test('SVG inversion does not write off-grid values as a usable dataset', (t) => {
    const write = fixture(t);
    const file = write('sample.svg', '<svg><text x="0" y="100">0</text><text x="0" y="50">50</text><circle cx="45" cy="75.5"/></svg>');
    const output = path.join(path.dirname(file), 'data.json');
    const result = run('figure-generator', 'invert-svg.mjs', file, '--tick-a', '0', '--tick-b', '50', '--write', output);
    assert.equal(result.status, 1, result.output);
    assert.equal(fs.existsSync(output), false);
});

test('SVG inversion reports unsupported transformed coordinates', (t) => {
    const write = fixture(t);
    const file = write('sample.svg', '<svg><text x="0" y="100">0</text><text x="0" y="50">50</text><g transform="translate(0,10)"><circle cx="45" cy="75"/></g></svg>');
    const result = run('figure-generator', 'invert-svg.mjs', file, '--tick-a', '0', '--tick-b', '50');
    assert.equal(result.status, 2, result.output);
});

for (const reference of ['[Caption][target]', '[target][]', '[target]', '![target][]']) {
    test(`link checker resolves reference syntax: ${reference}`, (t) => {
        const write = fixture(t);
        const target = write('target.md', '# Target\n');
        const file = write('source.md', reference + '\n\n[target]: target.md\n');
        const good = run('compile-brain', 'check-links.cjs', file);
        assert.equal(good.status, 0, good.output);
        assert.match(good.output, /Checked 1 relative link/);
        fs.unlinkSync(target);
        const bad = run('compile-brain', 'check-links.cjs', file);
        assert.equal(bad.status, 1, bad.output);
        assert.match(bad.output, /target\.md/);
    });
}

test('link checker ignores example references inside code', (t) => {
    const write = fixture(t);
    const file = write('source.md', '`[target]`\n```\n[target][]\n```\n[target]: missing.md\n');
    const result = run('compile-brain', 'check-links.cjs', file);
    assert.equal(result.status, 0, result.output);
    assert.match(result.output, /Checked 0 relative link/);
});

test('link checker preserves GitHub punctuation gaps, Unicode and duplicate heading fragments', t => {
    const write = fixture(t);
    const file = write('headings.md', [
        '# Sub-pattern — Search engines',
        '# Sub-pattern — Search engines',
        '# Café 中文',
        '# A  B',
        '',
        '[First](#sub-pattern--search-engines)',
        '[Repeated](#sub-pattern--search-engines-1)',
        '[Unicode](#caf%C3%A9-%E4%B8%AD%E6%96%87)',
        '[Spaces](#a--b)',
    ].join('\n'));
    const valid = run('compile-brain', 'check-links.cjs', file);
    assert.equal(valid.status, 0, valid.output);
    fs.appendFileSync(file, '\n[Missing](#sub-pattern-search-engines)\n');
    const invalid = run('compile-brain', 'check-links.cjs', file);
    assert.equal(invalid.status, 1, invalid.output);
    assert.match(invalid.output, /anchor not found/);
});

test('deep review routes its cross-model critic to a real canonical method fragment', () => {
    const file = path.join(root, 'skills', 'code-review', 'references', 'deep-review.md');
    const result = run('compile-brain', 'check-links.cjs', file);
    assert.equal(result.status, 0, result.output);
});

test('rejection tally keeps sweep rates separate from close-read findings', (t) => {
    const write = fixture(t);
    const log = ['a | sweep | accepted', 'b | sweep | rejected',
        ...Array.from({ length: 98 }, (_, i) => `read-${i} | read | accepted`)].join('\n');
    const result = run('humanizer', 'tally-rejections.cjs', write('candidates.log', log));
    assert.equal(result.status, 0, result.output);
    assert.match(result.output, /Sweep rejection rate: 50\.0%/);
});

test('rejection tally rejects invalid origins instead of silently counting them', (t) => {
    const write = fixture(t);
    const result = run('humanizer', 'tally-rejections.cjs',
        write('candidates.log', 'a | guessed-origin | accepted\nb | sweep | rejected\n'));
    assert.equal(result.status, 1, result.output);
});

test('rejection tally does not invent a sweep rate when no sweep ran', (t) => {
    const write = fixture(t);
    const result = run('humanizer', 'tally-rejections.cjs',
        write('candidates.log', 'a | read | accepted\n'));
    assert.equal(result.status, 0, result.output);
    assert.match(result.output, /Sweep rejection rate: not measured/);
});

test('active guidance does not require retired semantic telemetry', () => {
    const files = [
        ...fs.readdirSync(path.join(root, 'skills'), { withFileTypes: true })
            .filter((entry) => entry.isDirectory())
            .map((entry) => path.join('skills', entry.name, 'SKILL.md')),
        ...fs.readdirSync(path.join(root, 'prompts'))
            .filter((name) => name.endsWith('.prompt.md'))
            .map((name) => path.join('prompts', name)),
        ...['instructions', path.join('instructions', 'references')].flatMap((directory) =>
            fs.readdirSync(path.join(root, directory))
                .filter((name) => name.endsWith('.md'))
                .map((name) => path.join(directory, name))),
    ];
    const offenders = [];
    for (const file of files) {
        const content = fs.readFileSync(path.join(root, file), 'utf8');
        if (/Track outcomes in|Track in your project's audit trail|operations\/ledgers\//.test(content)) {
            offenders.push(`${file}: retired tracking or ledger obligation`);
        }
        for (const section of content.split(/^## /m).filter((part) => /^(?:Would [Rr]evise|Falsifiability)/.test(part))) {
            if (/(?:≥\s*\d+|\d+\+)\s+(?:invocations|times|instances)|\bquarters?\b|observed sessions|within 90 days/.test(section)) {
                offenders.push(`${file}: longitudinal semantic quota`);
            }
        }
    }
    assert.deepEqual(offenders, []);
});
