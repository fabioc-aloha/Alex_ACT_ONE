import assert from 'node:assert/strict';
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (...parts) => readFileSync(join(ROOT, ...parts), 'utf8');
const normalized = text => text.replace(/\s+/g, ' ');

function reference(owner, name) {
    const path = join(ROOT, 'skills', owner, 'references', name);
    assert.ok(existsSync(path), `Missing UAT learning reference: ${owner}/${name}`);
    return normalized(readFileSync(path, 'utf8'));
}

test('Flint static output guidance distinguishes the artifact from MCP report text', () => {
    const text = normalized(read('skills', 'flint-chart', 'SKILL.md'));
    assert.match(text, /content.*blocks/i);
    assert.match(text, /SVG.*(?:XML root|<\/svg>)/i);
    assert.match(text, /(?:summary|report).*outside|outside.*(?:summary|report)/i);
    assert.match(text, /(?:decode|naturalWidth)/);
});

test('Flint acceptance tests use semantic identity and actual rendered controls', () => {
    const owner = read('skills', 'flint-interactions', 'SKILL.md');
    assert.ok(owner.includes('](references/behavioral-acceptance.md)'));
    const text = reference('flint-interactions', 'behavioral-acceptance.md');
    for (const invariant of [
        /semantic.*(?:identity|identities)/i,
        /DOM order/i,
        /(?:overlay|overlays)/i,
        /(?:legend|key).*(?:persist|remain|restore)/i,
        /(?:checkbox|toggle button)/i,
        /(?:hover|pointer).*(?:baseline|neutral)/i,
        /(?:source|underlying).*rows/i,
        /(?:focusable|tabindex)/i,
        /(?:mobile|narrow).*board/i,
    ]) assert.match(text, invariant);
    assert.doesNotMatch(text, /always.*legend.*never|always.*height.*tall/i);
});

test('native-browser troubleshooting diagnoses visibility and frame targeting before retrying', () => {
    const owner = read('skills', 'browser-tools', 'SKILL.md');
    assert.ok(owner.includes('](references/embedded-browser-uat.md)'));
    assert.match(owner, /before.*retry|diagnos.*before/is);
    const text = reference('browser-tools', 'embedded-browser-uat.md');
    for (const invariant of [
        /visibilityState/,
        /requestAnimationFrame/,
        /event.*target/i,
        /trusted/i,
        /newCDPSession\(child\)/,
        /child.*coordinates/i,
        /Emulation\.setFocusEmulationEnabled/,
        /finally/,
        /detach/,
        /DOM.*(?:not|rather than).*(?:pointer|trusted)/i,
        /download.*unverified/i,
    ]) assert.match(text, invariant);
    assert.match(text, /(?:if|when).*(?:expose|support|permit).*CDP/i);
    assert.match(text, /user.*(?:requires|requests|specified|requested).*native|explicit.*native/i);
});

test('render verification checks actual decode and geometry without frozen host assumptions', () => {
    const text = normalized(read('skills', 'render-verify', 'SKILL.md'));
    assert.match(text, /naturalWidth/);
    assert.match(text, /getBoundingClientRect/);
    assert.match(text, /(?:decode|decoding)/i);
    assert.ok(text.includes('](../browser-tools/SKILL.md)'));
    assert.doesNotMatch(text, /\*\*CLI always|\| GitHub Copilot CLI\s+\| None/);
    assert.doesNotMatch(text, /Screenshot and console access are sufficient/i);
});

test('theme verification includes persistent controls and does not silence native compiler warnings', () => {
    const text = normalized(read('skills', 'flint-theme', 'SKILL.md'));
    assert.match(text, /(?:legend|key).*(?:control|toggle)/i);
    assert.match(text, /(?:compiler|console).*warning/i);
    assert.match(text, /(?:not|never|do not).*(?:suppress|silence|hide).*warning/i);
    assert.ok(text.includes('](../flint-interactions/SKILL.md)'));
});

test('UAT references are shipped behind thin, installed-package skill routes', (t) => {
    const fixture = mkdtempSync(join(tmpdir(), 'one-uat-guidance-'));
    t.after(() => rmSync(fixture, { recursive: true, force: true }));
    for (const [owner, file] of [
        ['browser-tools', 'embedded-browser-uat.md'],
        ['flint-interactions', 'behavioral-acceptance.md'],
    ]) {
        const path = join(ROOT, 'skills', owner);
        assert.ok(existsSync(join(path, 'references', file)));
        cpSync(path, join(fixture, 'skills', owner), { recursive: true });
        const installed = readFileSync(join(fixture, 'skills', owner, 'SKILL.md'), 'utf8');
        assert.ok(installed.includes(`](references/${file})`));
        assert.ok(existsSync(resolve(fixture, 'skills', owner, 'references', file)));
    }
    assert.ok(read('skills', 'flint-interactions', 'SKILL.md').split(/\r?\n/).length < 160);
    assert.ok(read('skills', 'browser-tools', 'SKILL.md').split(/\r?\n/).length < 55);
});
