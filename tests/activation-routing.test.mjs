import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (...parts) => readFileSync(join(ROOT, ...parts), 'utf8');

test('chart prompt selects the owner that links all bundled activation dependencies', () => {
    const prompt = read('prompts', 'render-chart.prompt.md');
    const owner = read('skills', 'render-chart', 'SKILL.md');
    assert.ok(prompt.includes('](../skills/render-chart/SKILL.md)'));
    for (const name of ['chart-big-idea', 'flint-chart', 'flint-interactions', 'render-verify']) {
        assert.ok(owner.includes(`](../${name}/SKILL.md)`), `Missing bundled route for ${name}`);
    }
    assert.match(owner, /installed (?:plugin|ONE)/i);
    assert.match(owner, /skill tool/i);
    assert.doesNotMatch(prompt, /If neither is present, tell the user to install the plugin and stop/);
});

test('chart routes resolve from an installed package without adopter skill folders', (t) => {
    const fixture = mkdtempSync(join(tmpdir(), 'one-routes-'));
    t.after(() => rmSync(fixture, { recursive: true, force: true }));
    const plugin = join(fixture, 'installed plugin');
    const adopter = join(fixture, 'adopter');
    mkdirSync(join(plugin, 'prompts'), { recursive: true });
    mkdirSync(adopter);
    const prompt = read('prompts', 'render-chart.prompt.md');
    writeFileSync(join(plugin, 'prompts', 'render-chart.prompt.md'), prompt);
    const expected = ['render-chart', 'chart-big-idea', 'flint-chart', 'flint-interactions', 'render-verify'];
    for (const name of expected) {
        mkdirSync(join(plugin, 'skills', name), { recursive: true });
        writeFileSync(join(plugin, 'skills', name, 'SKILL.md'), read('skills', name, 'SKILL.md'));
    }
    const entry = prompt.match(/\]\((\.\.\/skills\/render-chart\/SKILL\.md)\)/);
    assert.ok(entry, 'No route from the command to its owning skill');
    const ownerPath = resolve(plugin, 'prompts', entry[1]);
    assert.ok(existsSync(ownerPath));
    const owner = readFileSync(ownerPath, 'utf8');
    const routes = [...owner.matchAll(/\]\((\.\.\/([^/]+)\/SKILL\.md)\)/g)];
    for (const name of expected.filter((name) => name !== 'render-chart')) {
        const route = routes.find((match) => match[2] === name);
        assert.ok(route, `No installed route for ${name}`);
        assert.ok(existsSync(resolve(dirname(ownerPath), route[1])));
    }
    assert.equal(existsSync(join(adopter, 'skills')), false);
    assert.equal(existsSync(join(adopter, '.github', 'skills')), false);
});

test('continuity consumers read current handoff state and the authoritative task list', () => {
    for (const parts of [
        ['skills', 'project-status', 'SKILL.md'],
        ['skills', 'proactive-awareness', 'SKILL.md'],
    ]) {
        const text = read(...parts);
        assert.match(text, /TODO\.md/, `${parts.join('/')} lacks the task-list fallback`);
        assert.match(text, /authoritative task (?:list|source)/i);
        assert.match(text, /current state/i);
        assert.match(text, /next action/i);
        assert.match(text, /read.only/i);
        assert.doesNotMatch(text, /summarize `In progress`, pending queue/);
    }
});

test('brain command guidance resolves executables from the plugin rather than the target', () => {
    for (const parts of [
        ['skills', 'assess-brain', 'SKILL.md'],
        ['skills', 'compile-brain', 'SKILL.md'],
    ]) {
        const text = read(...parts);
        assert.match(text, /<plugin-root>/);
        assert.doesNotMatch(text, /^node scripts\/(?:assess-brain|scaffold-platform)\.cjs/m);
    }
    assert.ok(read('prompts', 'assess-brain.prompt.md').includes('](../skills/assess-brain/SKILL.md)'));
});

test('Big Idea routes chart work to the bundled owner', () => {
    const text = read('skills', 'big-idea', 'SKILL.md');
    assert.doesNotMatch(text, /flint-chart-plugin/);
    assert.match(text, /bundled.*chart-big-idea/);
    assert.ok(text.includes('](../chart-big-idea/SKILL.md)'));
});
