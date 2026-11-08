const assert = require('node:assert/strict');
const { test } = require('node:test');
const { auditVersion } = require('../scripts/shared/version-audit.cjs');

test('version audit accepts scalar and single-result proxy metadata without false updates', () => {
    for (const metadata of ['1.2.3', ['1.2.3']]) {
        assert.deepEqual(auditVersion('1.2.3', metadata), { latest: '1.2.3', status: 'current' });
    }
    for (const version of ['1.2.4', '1.3.0', '2.0.0', '1.10.0']) {
        for (const metadata of [version, [version]]) {
            assert.deepEqual(auditVersion('1.2.3', metadata), { latest: version, status: 'update' });
        }
    }
});

test('version audit fails explicitly on prerelease, malformed, ambiguous, and older metadata', () => {
    for (const metadata of ['1.2.4-beta.1', '', null, {}, [], ['1.2.3', '1.2.4'], ['bad'], '01.2.3', '999999999999999999.0.0']) {
        assert.throws(() => auditVersion('1.2.3', metadata), /stable|exactly one|invalid/);
    }
    assert.throws(() => auditVersion('2.0.0', '1.9.9'), /older/);
    assert.throws(() => auditVersion('bad', '1.2.3'), /Source pin/);
});
