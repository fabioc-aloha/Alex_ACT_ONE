const assert = require('node:assert/strict');
const { test } = require('node:test');
const { registryTarballPrefix } = require('../scripts/shared/dependencies.cjs');

test('automatic routing recognizes only the configured HTTPS Microsoft npm proxy', () => {
    const prefix = 'https://ms-feed-25.pkgs.visualstudio.com/1es-public/_packaging/npm-public/npm/registry/';
    for (const registry of [
        'https://packagefeedproxy.microsoft.io/npm/',
        'https://packagefeedproxy.microsoft.io/npm',
        'https://PACKAGEFEEDPROXY.microsoft.io/npm/',
    ]) assert.equal(registryTarballPrefix(registry), prefix);
});

test('other registries, lookalike hosts, alternate paths, and credentialed URLs are not auto-routed', () => {
    for (const registry of [
        'https://registry.npmjs.org/', 'https://proxy.example.invalid/npm/',
        'http://packagefeedproxy.microsoft.io/npm/',
        'https://packagefeedproxy.microsoft.io.example.invalid/npm/',
        'https://example.invalid/packagefeedproxy.microsoft.io/npm/',
        'https://packagefeedproxy.microsoft.io/another/',
        'https://packagefeedproxy.microsoft.io/npm/?query=1',
        'https://packagefeedproxy.microsoft.io/npm/#fragment',
        'https://fixture:password@packagefeedproxy.microsoft.io/npm/',
        'https://packagefeedproxy.microsoft.io:8443/npm/',
    ]) assert.equal(registryTarballPrefix(registry), null, registry);
    assert.throws(() => registryTarballPrefix('not-a-registry'), /Invalid URL/);
});
