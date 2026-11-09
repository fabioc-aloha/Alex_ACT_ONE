import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { test } from 'node:test';

const require = createRequire(import.meta.url);
const { runPowerShell } = require('./helpers/powershell.cjs');
const root = fileURLToPath(new URL('..', import.meta.url));
const script = join(root, 'install-and-check.ps1');

test('one public root setup script replaces the two obsolete names and is packaged', async () => {
    assert.ok(existsSync(script));
    for (const name of ['reinstall-and-check.ps1', 'install-optional-dependencies.ps1']) {
        assert.equal(existsSync(join(root, name)), false);
    }
    const { packageSources } = await import('../scripts/build-plugin-package.mjs');
    const files = packageSources(root);
    assert.ok(files.includes('install-and-check.ps1'));
    assert.ok(!files.includes('reinstall-and-check.ps1'));
    assert.ok(!files.includes('install-optional-dependencies.ps1'));
});

for (const shell of process.platform === 'win32' ? ['pwsh', 'powershell'] : ['pwsh']) {
    for (const [label, parameters, expected] of [
        ['conflicting modes', { Apply: true, VerifyOnly: true }, /separate operations/],
        ['empty browser', { Apply: true, BrowserExecutablePath: '' }, /BrowserExecutablePath.*absolute/],
        ['unsafe routing', { Apply: true, RegistryTarballPrefix: 'http://example.invalid/' }, /RegistryTarballPrefix.*HTTPS/],
    ]) {
        test(`${shell}: unified ${label} fails before any plugin operation`, t => {
            const fixture = mkdtempSync(join(root, '.test-unified-options-'));
            t.after(() => rmSync(fixture, { recursive: true, force: true }));
            const result = runPowerShell(shell, script, {
                ...parameters, CopilotCommand: join(fixture, 'must-not-run'),
            }, { root: fixture });
            assert.notEqual(result.status, 0);
            assert.match(result.stderr, expected);
            assert.doesNotMatch(result.stderr, /Required command is unavailable/);
        });
    }
    for (const [label, apply, absent, failure] of [
        ['report uses the installed owner', false, false, false],
        ['apply runs guarded plugin/bootstrap before installed-owner dependency setup', true, false, false],
        ['absent-plugin report labels checkout pins as planning only', false, true, false],
        ['plugin failure never starts dependency setup', true, false, true],
    ]) {
        test(`${shell}: unified ${label}`, t => {
            const fixture = mkdtempSync(join(root, '.test-unified-setup-'));
            t.after(() => rmSync(fixture, { recursive: true, force: true }));
            const log = join(fixture, 'calls.jsonl');
            const wrapper = join(fixture, 'wrapper.ps1');
            const owner = join(fixture, 'installed-owner');
            writeFileSync(wrapper, `
param([string]$Script,[switch]$Apply)
. $Script -Apply:$Apply
function Invoke-PluginSetup {
    '{"stage":"plugin"}' | Add-Content -LiteralPath '${log.replaceAll("'", "''")}'
    ${failure ? "throw 'fixture plugin failure'" : ''}
    return [pscustomobject]@{ Root = ${absent ? '$null' : `'${owner.replaceAll("'", "''")}'`}; Version = '99.0.0' }
}
function Invoke-DependencySetup {
    param([string]$PluginRoot)
    @{stage='dependencies';owner=$PluginRoot;apply=[bool]$Apply} | ConvertTo-Json -Compress |
        Add-Content -LiteralPath '${log.replaceAll("'", "''")}'
}
Invoke-InstallAndCheck
`, 'utf8');
            const result = runPowerShell(shell, wrapper, { Script: script, ...(apply ? { Apply: true } : {}) }, { root: fixture });
            const calls = readFileSync(log, 'utf8').trim().split(/\r?\n/).map(line => JSON.parse(line));
            if (failure) {
                assert.notEqual(result.status, 0);
                assert.match(result.stderr, /fixture plugin failure/);
                assert.deepEqual(calls, [{ stage: 'plugin' }]);
            } else {
                assert.equal(result.status, 0, result.stdout + result.stderr);
                assert.deepEqual(calls, [
                    { stage: 'plugin' }, { stage: 'dependencies', owner: absent ? root.replace(/[\\/]$/, '') : owner, apply },
                ]);
                if (absent) assert.match(result.stdout, /checkout pins for planning only/);
            }
        });
    }
}
