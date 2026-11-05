import assert from 'node:assert/strict';
import { test } from 'node:test';
import * as builder from '../scripts/build-flint-showcase.mjs';

function canonical(svg) {
    assert.equal(typeof builder.canonicalSvgPositions, 'function', 'Missing the approved bounded SVG position serialization');
    return builder.canonicalSvgPositions(svg);
}
test('equivalent sub-millipixel positions serialize identically', () => {
    const first = '<svg><g transform="translate(-49.569580078125,-60)"><text x="1.234567" y="-0.00001">Value</text></g></svg>';
    const second = '<svg><g transform="translate(-49.56999969482422,-60)"><text x="1.23456" y="0">Value</text></g></svg>';
    assert.equal(canonical(first), canonical(second));
    assert.ok(canonical(first).includes('translate(-49.57,-60)'));
    assert.equal(canonical(canonical(first)), canonical(first));
});
test('data, text, specs, non-position geometry, and other transform coefficients remain exact', () => {
    const svg = `<svg viewBox="0 0 1.234567 2.345678"><!-- x="1.234567" --><?fixture x="1.234567"?>
<metadata><![CDATA[{"x":1.234567,"spec":"translate(1.234567)"}]]></metadata>
<g transform="translate(1.234567 2.345678) scale(0.12345678) rotate(12.345678)">
<text x="1.234567" \u79c1x="1.234567" data-x="1.234567" aria-label="value 1.234567; x='2.345678'; translate(3.456789)">1.234567</text>
<path d="M1.234567,2.345678" stroke-width="1.234567" opacity="0.12345678"/>
<text x="50%" y="1.234567em">unchanged units</text></g></svg>`;
    const expected = svg.replace('translate(1.234567 2.345678)', 'translate(1.235,2.346)')
        .replace('<text x="1.234567"', '<text x="1.235"');
    assert.equal(canonical(svg), expected);
});
test('every rounded scalar position stays within 0.0005 SVG units', () => {
    for (const value of [-2000.123456, -49.569580078125, -0.00001, 0, 0.00049, 1.234567, 2000.876543]) {
        const output = canonical(`<svg><circle cx="${value}" cy="${value}"/></svg>`);
        const rounded = Number(output.match(/cx="([^"]+)"/)[1]);
        assert.ok(Math.abs(value - rounded) <= 0.00050000001);
    }
});
test('unterminated SVG markup is rejected rather than silently altered', () => {
    assert.throws(() => canonical('<svg><text x="1.2345>'), /unterminated|invalid/i);
    assert.throws(() => canonical('<svg><text x="1e999"/></svg>'), /invalid.*position|position.*finite/i);
});
