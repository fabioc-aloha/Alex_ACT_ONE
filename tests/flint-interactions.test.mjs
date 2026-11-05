import assert from 'node:assert/strict';
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (...parts) => readFileSync(join(ROOT, ...parts), 'utf8');
const skillPath = join(ROOT, 'skills', 'flint-interactions', 'SKILL.md');

function interactionSkill() {
    assert.ok(existsSync(skillPath), 'Missing the approved flint-interactions workflow');
    return readFileSync(skillPath, 'utf8');
}

test('interaction workflow is a declared discoverable skill, not another prompt or runtime', () => {
    const manifest = JSON.parse(read('manifest.json'));
    assert.ok(manifest.assets.skills.some(entry =>
        entry.name === 'flint-interactions' && entry.path === 'skills/flint-interactions/SKILL.md'));
    const text = interactionSkill();
    assert.match(text, /^name: flint-interactions$/m);
    const description = text.match(/^description: "(.+)"$/m)?.[1];
    assert.ok(description && description.length <= 1024);
    for (const word of ['interactive', 'brush', 'zoom', 'linked', 'reset']) {
        assert.ok(description.includes(word), `Missing discovery term: ${word}`);
    }
    assert.ok(text.split(/\r?\n/).length < 160, 'Keep the workflow thin rather than copying the upstream language');
    assert.equal(existsSync(join(ROOT, 'prompts', 'flint-interactions.prompt.md')), false);
});

test('interaction workflow delegates grammar and preset discovery to the installed Flint runtime', () => {
    const text = interactionSkill();
    assert.match(text, /get_flint_skill/);
    assert.match(text, /"skill": "interaction"/);
    assert.match(text, /flint:\/\/interaction-skill/);
    assert.match(text, /list_interaction_presets/);
    assert.match(text, /chartType/);
    assert.match(text, /missing|unavailable/i);
    assert.doesNotMatch(text, /type:.*(?:click-highlight|brush-x).*type:/s);
});

test('workflow separates behavior, state, linked boards, and application-only custom handlers', () => {
    const text = interactionSkill();
    for (const contract of ['interaction_spec', 'updates', 'link_spec', 'validate_board', 'flint-chart/interactive']) {
        assert.ok(text.includes(contract), contract);
    }
    assert.match(text, /Vega-Lite/);
    assert.match(text, /static.*(?:not|cannot)|not.*static/i);
    assert.match(text, /approval|consent/i);
    assert.match(text, /data.*semantic|semantic.*data/i);
    assert.match(text, /do not\s+reload.*caller|do not\s+load.*caller/i);
});

test('verification requires gestures, reset, keyboard behavior, and explicitly scoped evidence', () => {
    const text = interactionSkill();
    assert.match(text, /validate_chart/);
    assert.match(text, /show/);
    for (const term of ['warning', 'dropped', 'conflict', 'reset', 'keyboard', 'before', 'after', 'unverified']) {
        assert.ok(text.toLowerCase().includes(term), term);
    }
    assert.match(text, /(?:validation|validate).*not.*(?:proof|prove|verification)/is);
    assert.match(text, /should fire/i);
    assert.match(text, /should not fire/i);
});

test('chart owners explicitly load the interaction workflow without making static charts interactive', () => {
    for (const name of ['flint-chart', 'render-chart']) {
        const text = read('skills', name, 'SKILL.md');
        assert.ok(text.includes('](../flint-interactions/SKILL.md)'), name);
        assert.match(text, /load and follow\s+.*flint-interactions/i, name);
        assert.match(text, /static|only when|when.*request/i, name);
    }
    const verification = read('skills', 'render-verify', 'SKILL.md');
    assert.ok(verification.includes('](../flint-interactions/SKILL.md)'));
    assert.match(verification, /gesture.*reset|reset.*gesture/i);
    assert.match(verification, /acceptance.*already.*do not.*reload/is);
});

test('installed interaction routes resolve without an adopter skills directory', (t) => {
    const temp = mkdtempSync(join(tmpdir(), 'one-interaction-routes-'));
    t.after(() => rmSync(temp, { recursive: true, force: true }));
    interactionSkill();
    const plugin = join(temp, 'installed plugin');
    for (const name of ['flint-chart', 'flint-interactions', 'render-chart', 'render-verify']) {
        cpSync(join(ROOT, 'skills', name), join(plugin, 'skills', name), { recursive: true });
    }
    for (const name of ['flint-chart', 'render-chart', 'render-verify']) {
        const file = join(plugin, 'skills', name, 'SKILL.md');
        const text = readFileSync(file, 'utf8');
        const link = text.match(/\]\((\.\.\/flint-interactions\/SKILL\.md)\)/);
        assert.ok(link, name);
        assert.ok(existsSync(resolve(dirname(file), link[1])));
    }
    assert.equal(existsSync(join(temp, 'skills')), false);
});
