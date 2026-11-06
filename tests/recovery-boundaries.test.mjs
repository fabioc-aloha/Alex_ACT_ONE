import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const read = file => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8').replace(/\r\n/g, '\n');

test('the recovery owner exposes denial and unknown-state boundaries before its procedure link', () => {
    const skill = read('skills/proactive-awareness/SKILL.md');
    const boundary = skill.indexOf('A policy-denied source');
    assert.ok(boundary >= 0 && boundary < skill.indexOf('project recovery procedure'));
    assert.match(skill, /do not.*(?:paste|supply|reupload).*contents/i);
    assert.match(skill, /Modified does not establish staged or unstaged/);
    assert.match(skill, /task goal or next action/);
});

test('recovery distinguishes absent continuity from denied continuity and never requests denied data indirectly', () => {
    const procedure = read('skills/proactive-awareness/references/project-recovery.md');
    assert.match(procedure, /^### Denied sources and unknown worktree state$/m);
    for (const boundary of ['absent', 'denied', 'paste', 'reupload', 'summar', 'backups', 'history']) {
        assert.ok(procedure.toLowerCase().includes(boundary), boundary);
    }
    assert.match(procedure, /Do not infer staged\/unstaged state/);
    assert.match(procedure, /task goal or next action/);
    assert.match(procedure, /without requesting restricted source\s+contents/i);
    assert.match(procedure, /independently authorized/);
});
