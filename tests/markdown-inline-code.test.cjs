const assert = require('node:assert/strict');
const { test } = require('node:test');
const { preprocessMarkdown, convertLatexMath } = require('../scripts/shared/markdown-preprocessor.cjs');

for (const format of ['html', 'docx', 'email', 'txt']) {
    test(`${format} preserves literal single- and multi-backtick inline code`, () => {
        const code = [
            '`\\alpha and x==y==z and x~y~z and x^y^z`',
            '``literal ` tick, \\beta, ==keep==, and an em dash \u2014 here``',
            '```two `` ticks and \\gamma```',
        ];
        const input = `Before ${code.join(' then ')} after.\n`;
        assert.equal(preprocessMarkdown(input, { format }), input);
    });
}

test('multiline inline code and escaped backticks inside it stay literal', () => {
    const input = 'Before ``\\alpha\nand \\` ==literal==\n\\beta`` after.\n';
    assert.equal(preprocessMarkdown(input, { format: 'html' }), input);
});

test('an escaped opener and an unmatched delimiter remain prose, not protected code spans', () => {
    const output = preprocessMarkdown('\\`\\alpha and ==mark==\n\n`unmatched \\beta\n', { format: 'html' });
    assert.ok(output.includes('\\`\u03b1 and <mark>mark</mark>'));
    assert.ok(output.includes('`unmatched \u03b2'));
});

test('real prose still receives math, highlight, superscript, and em-dash transformations', () => {
    const output = preprocessMarkdown('Prose $\\alpha^2$ and ==marked== and x^two^ \u2014 yes.\n');
    assert.ok(output.includes('\u03b1\u00b2'));
    assert.ok(output.includes('<mark>marked</mark>'));
    assert.ok(output.includes('<sup>two</sup>'));
    assert.ok(output.includes(', yes.'));
});

test('standalone math conversion preserves inline and fenced code', () => {
    const input = 'Math $\\alpha$; literal `\\beta`.\n\n~~~python\nx = "\\gamma"\n# literal heading\n- [ ] literal list\n~~~\n';
    const expected = input.replace('$\\alpha$', '\u03b1');
    assert.equal(convertLatexMath(input), expected);
    const processed = preprocessMarkdown(input, { format: 'html' });
    assert.ok(processed.includes('~~~python\nx = "\\gamma"\n# literal heading\n- [ ] literal list\n~~~'));
});
