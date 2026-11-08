'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const [source, installed, target] = process.argv.slice(2);
assert.ok(source && installed && target, 'Expected source, installed package, and disposable activation target');
assert.equal(execFileSync('git', ['rev-parse', 'HEAD'], { cwd: source, encoding: 'utf8' }).trim(),
    'ac9e63765aad262382b9463868be737c86283c37');
const files = execFileSync('git', ['ls-files', '-z'], { cwd: source, encoding: 'utf8' }).split('\0').filter(Boolean);
assert.ok(files.length > 0);
const normalized = [];
for (const file of files) {
    const expected = fs.readFileSync(path.join(source, file));
    const actual = fs.readFileSync(path.join(installed, file));
    if (expected.equals(actual)) continue;
    const decode = new TextDecoder('utf-8', { fatal: true });
    assert.equal(decode.decode(actual).replace(/\r\n/g, '\n'), decode.decode(expected).replace(/\r\n/g, '\n'),
        `Delivered bytes differ: ${file}`);
    normalized.push(file);
}
const manifest = JSON.parse(fs.readFileSync(path.join(installed, 'manifest.json'), 'utf8'));
const plugin = JSON.parse(fs.readFileSync(path.join(installed, 'plugin.json'), 'utf8'));
assert.equal(manifest.version, '0.9.1');
assert.equal(plugin.version, '0.9.1');
assert.ok(manifest.assets.skills.every(skill => fs.existsSync(path.join(installed, skill.path))));
assert.equal(fs.existsSync(target), false, 'Activation verification must use a fresh disposable target');
const script = path.join(installed, 'skills', 'bootstrap-core', 'scripts', 'bootstrap-core.cjs');
function bootstrap(...args) {
    return JSON.parse(execFileSync(process.execPath, [script, '--target-instructions', target, ...args],
        { cwd: path.dirname(target), encoding: 'utf8', timeout: 10000 }));
}
const preview = bootstrap();
assert.equal(preview.apply, false);
assert.equal(preview.expectedFiles, manifest.assets.instructions.length);
assert.equal(fs.existsSync(target), false, 'Preview wrote instruction files');
assert.equal(bootstrap('--apply').verification.receiptCurrent, true);
const repeated = bootstrap();
assert.ok(repeated.files.every(file => file.action === 'preserve'));
assert.equal(repeated.receipt.action, 'preserve');
console.log(JSON.stringify({
    version: plugin.version, sourceCommit: 'ac9e63765aad262382b9463868be737c86283c37',
    trackedFilesMatched: files.length, textLineEndingsNormalized: normalized.length,
    declaredSkillsPresent: manifest.assets.skills.length, activationInstructions: preview.expectedFiles,
    previewWroteNothing: true, disposableApplyVerified: true, repeatedPreviewPreserved: true,
    hostActivationObserved: false,
}, null, 2));
