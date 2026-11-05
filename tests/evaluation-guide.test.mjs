import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = file => readFileSync(join(ROOT, file), 'utf8').replace(/\r\n/g, '\n');

test('evaluation names its reference host, isolation limits, and comparison hypotheses', () => {
    const guide = read('docs/launch/evaluation-guide.md');
    assert.match(guide, /Copilot CLI.*reference|reference.*Copilot CLI/i);
    for (const term of ['hypotheses', 'same model', 'activation', 'contaminat', 'unverified']) {
        assert.ok(guide.toLowerCase().includes(term), term);
    }
    assert.match(guide, /VS Code/);
    assert.match(guide, /Scout/);
    assert.doesNotMatch(guide, /plain answer usually|Three or more.*discipline working|makes catching it a habit/);
    assert.match(guide, /does not.*(?:prove|establish).*reliability/is);
});

test('evaluation results are task-local with sample size, counterevidence, and limitations', () => {
    const guide = read('docs/launch/evaluation-guide.md');
    for (const column of ['Sample size', 'Plain', 'ACT ONE', 'Observed evidence', 'Limitations']) {
        assert.ok(guide.includes(column), column);
    }
    assert.match(guide, /not observed/i);
    assert.match(guide, /all.*runs|every.*run/i);
    assert.match(guide, /no.*(?:telemetry|standing.*ledger)/i);
    assert.match(guide, /RELEASE-CHECKLIST\.md#manual-release-evidence/);
    assert.match(read('README.md'), /illustrative.*(?:hypothes|not.*recorded)/is);
});

test('manual release evidence distinguishes scenario observations from delivery support', () => {
    const checklist = read('RELEASE-CHECKLIST.md');
    assert.match(checklist, /^### Manual release evidence$/m);
    for (const field of ['Source revision', 'Host / version', 'Actual invocation', 'Observed result', 'Evidence / limitations']) {
        assert.ok(checklist.includes(field), field);
    }
    assert.match(checklist, /not run/);
    assert.match(checklist, /not.*(?:standing|cross-session).*ledger/is);
    assert.match(checklist, /CLI.*VS Code.*Scout.*Copilot app/is);
});
