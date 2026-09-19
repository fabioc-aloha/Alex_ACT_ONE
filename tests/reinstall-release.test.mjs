import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const ROOT = new URL('..', import.meta.url);
const SCRIPT = new URL('../reinstall-and-check.ps1', import.meta.url);
const ROOT_PATH = fileURLToPath(ROOT);
const SCRIPT_PATH = fileURLToPath(SCRIPT);
const VERSION = JSON.parse(readFileSync(new URL('../plugin.json', import.meta.url), 'utf8')).version;

function writePowerShell(file, content) {
    writeFileSync(file, content.replace(/^\n/, ''), 'utf8');
}

test('reinstalls the released plugin and applies bootstrap migration', (t) => {
    const root = mkdtempSync(join(tmpdir(), 'alex-act-release-'));
    const copilotHome = join(root, '.copilot');
    const installedRoot = join(copilotHome, 'installed-plugins', 'alex-mall', 'alex-act-one');
    const statePath = join(root, 'plugins.json');
    const bootstrapLog = join(root, 'bootstrap.log');
    const copilot = join(root, 'copilot.ps1');
    const node = join(root, 'node.ps1');

    t.after(() => rmSync(root, { recursive: true, force: true }));
    mkdirSync(installedRoot, { recursive: true });
    writeFileSync(join(installedRoot, 'plugin.json'), JSON.stringify({ name: 'alex-act-one', version: '0.3.0' }));
    writeFileSync(statePath, JSON.stringify([{
        name: 'alex-act-one', marketplace: 'alex-mall', version: '0.3.0', enabled: true, source: 'installed',
    }]));
    writePowerShell(copilot, `
param([Parameter(ValueFromRemainingArguments = $true)][string[]]$Arguments)
$statePath = $env:FAKE_STATE_PATH
$installedRoot = $env:FAKE_INSTALLED_ROOT
$state = Get-Content -LiteralPath $statePath -Raw | ConvertFrom-Json
$command = $Arguments -join ' '
if ($command -eq 'plugin list --json') {
  $state | ConvertTo-Json -Compress
  exit 0
}
if ($command -eq 'plugin uninstall alex-act-one@alex-mall') {
  @($state | Where-Object { $_.name -ne 'alex-act-one' }) | ConvertTo-Json -Compress | Set-Content -LiteralPath $statePath
  exit 0
}
if ($command -eq 'plugin install alex-act-one@alex-mall') {
  New-Item -ItemType Directory -Force -Path $installedRoot | Out-Null
    @{ name = 'alex-act-one'; version = '${VERSION}' } | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $installedRoot 'plugin.json')
  New-Item -ItemType Directory -Force -Path (Join-Path $installedRoot 'skills/bootstrap-core/scripts') | Out-Null
    Set-Content -LiteralPath (Join-Path $installedRoot 'skills/bootstrap-core/scripts/bootstrap-core.cjs') -Value '// mocked bootstrap'
    @(@{ name = 'alex-act-one'; marketplace = 'alex-mall'; version = '${VERSION}'; enabled = $true; source = 'installed' }) | ConvertTo-Json -Compress | Set-Content -LiteralPath $statePath
  exit 0
}
Write-Error "unexpected copilot command: $command"
exit 1
`);
    writePowerShell(node, `
param([Parameter(ValueFromRemainingArguments = $true)][string[]]$Arguments)
$receiptPath = Join-Path $env:COPILOT_HOME 'instructions/.alex-act-one-bootstrap.json'
New-Item -ItemType Directory -Force -Path (Split-Path -Parent $receiptPath) | Out-Null
@{
    schemaVersion = 2
    bootstrappedBy = 'alex-act-one'
    coreVersion = '${VERSION}'
    files = @(@{ name = 'alex-act-act-pass.instructions.md'; owner = 'alex-act-one'; sourceRelativePath = 'instructions/act-pass.instructions.md'; sha256 = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' })
} | ConvertTo-Json -Depth 4 | Set-Content -LiteralPath $receiptPath
$Arguments | ConvertTo-Json -Compress | Set-Content -LiteralPath $env:FAKE_BOOTSTRAP_LOG
@{ apply = $true; expectedFiles = 1; verification = @{ receiptCurrent = $true } } | ConvertTo-Json -Compress
exit 0
`);

    const result = spawnSync('pwsh', [
        '-NoProfile', '-File', SCRIPT_PATH,
        '-CopilotHome', copilotHome,
        '-CopilotCommand', copilot,
        '-NodeCommand', node,
        '-ExpectedVersion', VERSION,
    ], {
        cwd: ROOT_PATH,
        encoding: 'utf8',
        env: {
            ...process.env,
            FAKE_STATE_PATH: statePath,
            FAKE_INSTALLED_ROOT: installedRoot,
            FAKE_BOOTSTRAP_LOG: bootstrapLog,
        },
    });

    assert.equal(result.status, 0, result.stdout + result.stderr);
    const installed = JSON.parse(readFileSync(join(installedRoot, 'plugin.json'), 'utf8'));
    const parsedPlugins = JSON.parse(readFileSync(statePath, 'utf8'));
    const plugins = Array.isArray(parsedPlugins) ? parsedPlugins : [parsedPlugins];
    const bootstrapArgs = JSON.parse(readFileSync(bootstrapLog, 'utf8'));
    assert.equal(installed.version, VERSION);
    assert.deepEqual(plugins, [{
        name: 'alex-act-one', marketplace: 'alex-mall', version: VERSION, enabled: true, source: 'installed',
    }]);
    assert.ok(bootstrapArgs.includes('--apply'));
    assert.ok(bootstrapArgs.some((argument) => argument.endsWith('bootstrap-core.cjs')));
    assert.equal(existsSync(join(copilotHome, 'session-state')), false);
});