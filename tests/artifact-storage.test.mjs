import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = path => readFileSync(join(ROOT, path), 'utf8');
const contract = 'skills/proactive-awareness/references/project-artifact-storage.md';

test('storage contract covers deliverables, internal plans, privacy, containment, and honest delivery', () => {
    const text = read(contract);
    for (const requirement of [
        /one-off helpers/, /supporting sources/, /Private planning storage.*internal reasoning/is,
        /subagents/, /credentials/, /frozen evidence/, /junctions/, /ignore state/,
        /staged, committed, pushed/, /not universal filesystem enforcement/, /Plan-only and/,
        /never.*evade/is, /missing, blocked, deliberately excluded/,
    ]) assert.match(text, requirement);
});

test('repository guidance and project bootstrap both retain project deliverables inside the repository', () => {
    for (const path of ['AGENTS.md', 'skills/bootstrap-project/resources/AGENTS.md']) {
        const text = read(path);
        assert.match(text, /## Project artifact storage/);
        assert.match(text, /never solely|never the sole/);
        assert.match(text, /useful.*helpers/);
        assert.match(text, /Git state/);
        assert.match(text, /credentials/);
    }
});

test('activated resident floor routes delivery checks through the canonical read-only owner', () => {
    const instruction = read('instructions/session-health-monitoring.instructions.md');
    assert.match(instruction, /supporting evidence/);
    assert.match(instruction, /delivery-check/);
    assert.match(instruction, /instruction-level safeguard/);
    const owner = read('skills/proactive-awareness/SKILL.md');
    assert.match(owner, /delivery-check/i);
    assert.match(owner, /references\/project-artifact-storage\.md/);
    assert.match(owner, /mode is also read-only/);
});

test('all directly coupled workflow owners explicitly route to the shared storage contract', () => {
    for (const owner of ['plan', 'bootstrap-core', 'bootstrap-project', 'meditation', 'render-verify', 'git-workflow']) {
        assert.ok(read(`skills/${owner}/SKILL.md`).includes('../proactive-awareness/references/project-artifact-storage.md'), owner);
    }
    assert.match(read('skills/plan/SKILL.md'), /only for internal reasoning/);
    assert.match(read('skills/plan/SKILL.md'), /blocks.*document write/);
    assert.match(read('skills/render-verify/SKILL.md'), /final repository copy/);
});

test('frozen log evidence is discoverable in Git and protected from newline rewriting', () => {
    assert.match(read('.gitignore'), /!docs\/verification\/session-recovery\/history\/\*\*\/\*\.log/);
    assert.match(read('.gitattributes'), /docs\/verification\/session-recovery\/history\/\*\* -text -whitespace/);
});
