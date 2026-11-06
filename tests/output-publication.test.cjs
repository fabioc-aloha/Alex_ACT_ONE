'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { test } = require('node:test');
const { publishFiles } = require('../scripts/shared/output-publication.cjs');

function fixture(t) {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'one-publication-'));
    t.after(() => fs.rmSync(root, { recursive: true, force: true }));
    return root;
}

for (const existing of [false, true]) {
    test(`a later publication failure rolls back the complete file set, existing=${existing}`, t => {
        const root = fixture(t);
        const files = ['first', 'second'].map(name => {
            const source = path.join(root, `${name}.staged`);
            const destination = path.join(root, `${name}.output`);
            fs.writeFileSync(source, `new ${name}`);
            if (existing) fs.writeFileSync(destination, `prior ${name}`);
            return { source, destination };
        });
        const original = fs.renameSync;
        fs.renameSync = (source, destination) => {
            if (destination === files[1].destination && path.basename(source) === 'new') {
                throw new Error('injected later publication failure');
            }
            return original(source, destination);
        };
        try {
            assert.throws(() => publishFiles(files), /injected later publication failure/);
        } finally {
            fs.renameSync = original;
        }
        for (const [index, { destination }] of files.entries()) {
            if (existing) assert.equal(fs.readFileSync(destination, 'utf8'), `prior ${index === 0 ? 'first' : 'second'}`);
            else assert.equal(fs.existsSync(destination), false);
        }
        assert.equal(fs.readdirSync(root).some(name => name.startsWith('.alex-output-')), false);
    });
}

test('publication validates every destination before replacing prior files', t => {
    const root = fixture(t);
    const source = path.join(root, 'staged');
    const destination = path.join(root, 'output');
    const invalid = path.join(root, 'directory');
    fs.writeFileSync(source, 'new');
    fs.writeFileSync(destination, 'prior');
    fs.mkdirSync(invalid);
    assert.throws(() => publishFiles([{ source, destination }, { source, destination: invalid }]), /regular file/);
    assert.equal(fs.readFileSync(destination, 'utf8'), 'prior');
    assert.throws(() => publishFiles([{ source, destination }, { source, destination }]), /duplicate/i);
});

test('successful publication replaces only selected files and leaves no recovery debris', t => {
    const root = fixture(t);
    const source = path.join(root, 'staged');
    const destination = path.join(root, 'nested', 'output');
    fs.writeFileSync(source, 'new');
    fs.writeFileSync(path.join(root, 'unrelated'), 'keep');
    publishFiles([{ source, destination }]);
    assert.equal(fs.readFileSync(destination, 'utf8'), 'new');
    assert.equal(fs.readFileSync(path.join(root, 'unrelated'), 'utf8'), 'keep');
    assert.deepEqual(fs.readdirSync(path.dirname(destination)), ['output']);
});

test('rollback errors retain recovery copies and report an explicit failure', t => {
    const root = fixture(t);
    const first = path.join(root, 'first');
    const second = path.join(root, 'second');
    const source = path.join(root, 'staged');
    fs.writeFileSync(first, 'prior first');
    fs.writeFileSync(second, 'prior second');
    fs.writeFileSync(source, 'new');
    const original = fs.renameSync;
    fs.renameSync = (from, to) => {
        if (to === second || path.basename(from) === 'prior') throw new Error('injected I/O failure');
        return original(from, to);
    };
    try {
        assert.throws(() => publishFiles([{ source, destination: first }, { source, destination: second }]),
            error => error instanceof AggregateError && /recovery copies retained/.test(error.message));
    } finally {
        fs.renameSync = original;
    }
    const backups = fs.readdirSync(root).filter(name => name.startsWith('.alex-output-'))
        .map(name => path.join(root, name, 'prior')).filter(file => fs.existsSync(file));
    assert.ok(backups.some(file => fs.readFileSync(file, 'utf8') === 'prior first'));
    assert.equal(fs.readFileSync(second, 'utf8'), 'prior second');
});
