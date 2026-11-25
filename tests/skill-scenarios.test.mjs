import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const path = join(ROOT, 'docs', 'verification', 'skill-scenarios.json');
const families = ['reasoning', 'review', 'recovery', 'conversion', 'chart', 'draft'];
const boundaries = ['missing-input', 'read-only', 'no-write', 'denied-tool', 'unsupported-output', 'approval-boundary'];

test('versioned scenarios cover every representative family and failure/consent boundary', () => {
    assert.ok(existsSync(path), 'Missing the portable scenario suite');
    const suite = JSON.parse(readFileSync(path, 'utf8'));
    assert.equal(suite.schemaVersion, 1);
    assert.match(suite.version, /^\d{4}-\d{2}-\d{2}\.\d+$/);
    assert.equal(suite.dataClassification, 'synthetic');
    assert.deepEqual([...new Set(suite.cases.map(item => item.family))].sort(), families.sort());
    assert.equal(new Set(suite.cases.map(item => item.id)).size, suite.cases.length);
    for (const boundary of boundaries) {
        assert.ok(suite.cases.some(item => item.boundaries.includes(boundary)), boundary);
    }
    const manifest = JSON.parse(readFileSync(join(ROOT, 'manifest.json'), 'utf8'));
    for (const item of suite.cases) {
        assert.match(item.id, /^[a-z0-9-]+$/);
        assert.ok(manifest.assets.skills.some(skill => skill.name === item.skill), item.skill);
        assert.ok(item.prompt.includes(item.skill), 'Copyable prompts must name their actual invocation owner');
        assert.ok(item.prompt.length > 100 && item.prompt.length < 2500);
        assert.ok(item.expectedObservations.length >= 2 && item.forbiddenActions.length >= 1);
        assert.ok(item.boundaries.every(value => boundaries.includes(value)));
        assert.ok(item.evidenceRequired.includes('actual response'));
        assert.ok(item.evidenceRequired.includes('tool calls or explicit no-tool observation'));
    }
});

test('scenario instructions require fresh observed evidence rather than synthetic expected answers', () => {
    const guide = readFileSync(join(ROOT, 'docs', 'verification', 'README.md'), 'utf8');
    assert.match(guide, /not.*(?:model|semantic).*proof/is);
    assert.match(guide, /not run/);
    assert.match(guide, /denied.*(?:synthetic|fixture)|(?:synthetic|fixture).*denied/is);
    assert.match(guide, /skill-scenarios\.json/);
    assert.match(guide, /RELEASE-CHECKLIST\.md#manual-release-evidence/);
    assert.match(guide, /CLI.*VS Code.*Scout.*Copilot app/is);
    assert.match(guide, /no.*(?:telemetry|standing.*ledger)/is);
});

test('every scenario explicitly permits the required skill references without granting commands or writes', () => {
    const suite = JSON.parse(readFileSync(path, 'utf8'));
    assert.equal(suite.version, '2026-11-25.1');
    for (const item of suite.cases) {
        assert.ok(item.prompt.includes('Loading guidance includes reading the skill and its required bundled references.'), item.id);
        assert.ok(item.prompt.includes('This does not permit commands, file writes, installation, or external actions.'), item.id);
    }
});

test('creative-writing scenarios exercise both drafting and protected revision', () => {
    const suite = JSON.parse(readFileSync(path, 'utf8'));
    for (const [id, constraint] of [
        ['fiction-scene-from-brief', /past tense.*through Ada only/],
        ['fiction-line-edit-preserve-continuity', /narrative sentences verbatim/],
    ]) {
        const item = suite.cases.find(candidate => candidate.id === id);
        assert.equal(item?.skill, 'creative-writing');
        assert.ok(item.boundaries.includes('no-write'), id);
        assert.match(item.prompt, constraint);
    }
});

test('recovery and chart clarification can continue in chat without a host form', () => {
    const recovery = readFileSync(join(ROOT, 'skills', 'proactive-awareness', 'references', 'project-recovery.md'), 'utf8');
    const chart = readFileSync(join(ROOT, 'skills', 'flint-chart', 'SKILL.md'), 'utf8');
    for (const guidance of [recovery, chart]) {
        assert.match(guidance, /plain[- ]text question/i);
        assert.match(guidance, /(?:unavailable|unconfirmed)[\s\S]{0,120}(?:form|reply)|form[\s\S]{0,120}(?:unavailable|unconfirmed)/i);
        assert.match(guidance, /(?:wait|stop)[\s\S]{0,72}(?:reply|answer|input)/i);
    }
    const guide = readFileSync(join(ROOT, 'docs', 'verification', 'README.md'), 'utf8');
    assert.match(guide, /### Text-only clarification and resume/);
    assert.match(guide, /normal chat reply/);
    assert.match(guide, /Record both turns/);
});

test('missing chart inputs can be clarified before tool discovery or chart framing', () => {
    const chart = readFileSync(join(ROOT, 'skills', 'flint-chart', 'SKILL.md'), 'utf8');
    const clarify = chart.indexOf('plain-text question');
    assert.ok(clarify >= 0 && clarify < chart.indexOf('get_flint_skill'));
    assert.ok(clarify < chart.indexOf('](../chart-big-idea/SKILL.md)'));
    assert.match(chart, /No Flint\s+tool is needed to clarify/i);
});
