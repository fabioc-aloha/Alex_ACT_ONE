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
const MARKETPLACES = [
    { name: 'alex-mall', source: 'GitHub: fabioc-aloha/Alex_Skill_Mall', isDefault: false },
    { name: 'awesome-copilot', source: 'GitHub: github/awesome-copilot', isDefault: true },
    { name: 'copilot-plugins', source: 'GitHub: github/copilot-plugins', isDefault: true },
    { name: 'azure-skills', source: 'GitHub: microsoft/azure-skills', isDefault: false },
    { name: 'fabric-collection', source: 'GitHub: microsoft/skills-for-fabric', isDefault: false },
];

function writePowerShell(file, content) {
    writeFileSync(file, content.replace(/^\n/, ''), 'utf8');
}

function runReleaseForShell(t, shell, options = {}) {
    const root = mkdtempSync(join(tmpdir(), 'alex-act-release-'));
    const copilotHome = join(root, '.copilot');
    const installedRoot = join(copilotHome, 'installed-plugins', 'alex-mall', 'alex-act-one');
    const statePath = join(root, 'plugins.json');
    const marketplaceStatePath = join(root, 'marketplaces.json');
    const bootstrapLog = join(root, 'bootstrap.log');
    const commandLog = join(root, 'commands.log');
    const copilot = join(root, 'copilot.ps1');
    const node = join(root, 'node.ps1');

    t.after(() => rmSync(root, { recursive: true, force: true }));
    mkdirSync(installedRoot, { recursive: true });
    writeFileSync(join(installedRoot, 'plugin.json'), JSON.stringify({ name: 'alex-act-one', version: '0.3.0' }));
    const otherPlugins = options.otherPlugins || [];
    writeFileSync(statePath, JSON.stringify([...otherPlugins, {
        name: 'alex-act-one', marketplace: 'alex-mall', version: '0.3.0', enabled: true, source: 'installed',
    }]));
    writeFileSync(marketplaceStatePath, JSON.stringify(options.marketplaces || []));
    writePowerShell(copilot, `
param([Parameter(ValueFromRemainingArguments = $true)][string[]]$Arguments)
$statePath = $env:FAKE_STATE_PATH
$marketplaceStatePath = $env:FAKE_MARKETPLACE_STATE_PATH
$installedRoot = $env:FAKE_INSTALLED_ROOT
$state = Get-Content -LiteralPath $statePath -Raw | ConvertFrom-Json
$marketplaces = @((Get-Content -LiteralPath $marketplaceStatePath -Raw | ConvertFrom-Json))
$command = $Arguments -join ' '
Add-Content -LiteralPath $env:FAKE_COMMAND_LOG -Value $command
if ($command -eq 'plugin list --json') {
  $state | ConvertTo-Json -Compress
  exit 0
}
if ($command -eq 'plugin marketplace list --json') {
  ConvertTo-Json -InputObject $marketplaces -Compress
  exit 0
}
if ($Arguments.Count -ge 3 -and ($Arguments[0..2] -join ' ') -eq 'plugin marketplace add') {
  $source = $Arguments[3]
  if ($env:FAKE_ADD_FAILURE -eq $source) {
    Write-Error 'mock marketplace add failed'
    exit 1
  }
  if ($env:FAKE_ADD_NOOP -eq $source) { exit 0 }
  $known = @(('${JSON.stringify(MARKETPLACES)}' | ConvertFrom-Json))
  $entry = @($known | Where-Object { $_.source -eq "GitHub: $source" })
  if ($entry.Count -ne 1) { Write-Error "unknown source: $source"; exit 1 }
  $added = @{ name = $entry[0].name; source = $entry[0].source; isDefault = $false }
  if ($env:FAKE_ADD_WRONG_SOURCE -eq $source) { $added.source = 'GitHub: unexpected/source' }
  ConvertTo-Json -InputObject @($marketplaces + $added) -Compress | Set-Content -LiteralPath $marketplaceStatePath
  exit 0
}
if ($command -eq 'plugin uninstall alex-act-one@alex-mall') {
  ConvertTo-Json -InputObject @($state | Where-Object { $_.name -ne 'alex-act-one' }) -Compress | Set-Content -LiteralPath $statePath
  exit 0
}
if ($command -eq 'plugin install alex-act-one@alex-mall') {
  New-Item -ItemType Directory -Force -Path $installedRoot | Out-Null
    @{ name = 'alex-act-one'; version = '${VERSION}' } | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $installedRoot 'plugin.json')
  New-Item -ItemType Directory -Force -Path (Join-Path $installedRoot 'skills/bootstrap-core/scripts') | Out-Null
    Set-Content -LiteralPath (Join-Path $installedRoot 'skills/bootstrap-core/scripts/bootstrap-core.cjs') -Value '// mocked bootstrap'
    $others = @($state | Where-Object { $_.name -ne 'alex-act-one' })
    $installed = @{ name = 'alex-act-one'; marketplace = 'alex-mall'; version = '${VERSION}'; enabled = $true; source = 'installed' }
    ConvertTo-Json -InputObject @($others + $installed) -Compress | Set-Content -LiteralPath $statePath
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

    const invoke = () => spawnSync(shell, [
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
            FAKE_MARKETPLACE_STATE_PATH: marketplaceStatePath,
            FAKE_INSTALLED_ROOT: installedRoot,
            FAKE_BOOTSTRAP_LOG: bootstrapLog,
            FAKE_COMMAND_LOG: commandLog,
            FAKE_ADD_FAILURE: options.addFailure || '',
            FAKE_ADD_NOOP: options.addNoop || '',
            FAKE_ADD_WRONG_SOURCE: options.addWrongSource || '',
        },
    });
    const result = invoke();
    if (options.error) {
        assert.notEqual(result.status, 0, result.stdout + result.stderr);
        assert.match(result.stdout + result.stderr, options.error);
        const commands = readFileSync(commandLog, 'utf8');
        assert.doesNotMatch(commands, /plugin (uninstall|install) /);
        assert.equal(existsSync(bootstrapLog), false);
        return;
    }

    assert.equal(result.status, 0, result.stdout + result.stderr);
    if (options.repeat) {
        const repeated = invoke();
        assert.equal(repeated.status, 0, repeated.stdout + repeated.stderr);
    }
    const installed = JSON.parse(readFileSync(join(installedRoot, 'plugin.json'), 'utf8'));
    const parsedPlugins = JSON.parse(readFileSync(statePath, 'utf8'));
    const plugins = Array.isArray(parsedPlugins) ? parsedPlugins : [parsedPlugins];
    const parsedMarketplaces = JSON.parse(readFileSync(marketplaceStatePath, 'utf8'));
    const marketplaces = Array.isArray(parsedMarketplaces) ? parsedMarketplaces : [parsedMarketplaces];
    const bootstrapArgs = JSON.parse(readFileSync(bootstrapLog, 'utf8'));
    assert.equal(installed.version, VERSION);
    assert.deepEqual(plugins, [...otherPlugins, {
        name: 'alex-act-one', marketplace: 'alex-mall', version: VERSION, enabled: true, source: 'installed',
    }]);
    for (const expected of MARKETPLACES) {
        const matching = marketplaces.filter((entry) => entry.name === expected.name);
        assert.equal(matching.length, 1);
        assert.equal(matching[0].source, expected.source);
        const existing = options.marketplaces?.find((entry) => entry.name === expected.name);
        assert.equal(matching[0].isDefault, existing ? existing.isDefault : false);
    }
    for (const existing of options.marketplaces || []) {
        assert.deepEqual(marketplaces.find((entry) => entry.name === existing.name), existing);
    }
    const commands = readFileSync(commandLog, 'utf8').trim().split(/\r?\n/);
    const adds = commands.filter((command) => command.startsWith('plugin marketplace add '));
    const missing = MARKETPLACES.filter((expected) =>
        !options.marketplaces?.some((entry) => entry.name === expected.name));
    assert.equal(adds.length, missing.length);
    for (const expected of missing) {
        assert.ok(adds.includes(`plugin marketplace add ${expected.source.slice('GitHub: '.length)}`));
    }
    assert.ok(commands.filter((command) => command.startsWith('plugin install '))
        .every((command) => command === 'plugin install alex-act-one@alex-mall'));
    assert.ok(bootstrapArgs.includes('--apply'));
    assert.ok(bootstrapArgs.some((argument) => argument.endsWith('bootstrap-core.cjs')));
    assert.equal(existsSync(join(copilotHome, 'session-state')), false);
}

for (const shell of process.platform === 'win32' ? ['pwsh', 'powershell'] : ['pwsh']) {
    const runRelease = (t, options) => runReleaseForShell(t, shell, options);
    const testRelease = (name, fn) => test(`${shell}: ${name}`, fn);

    testRelease('registers all missing public marketplaces, reinstalls ONE and applies bootstrap migration', (t) => {
        runRelease(t, { repeat: true });
    });

    testRelease('preserves existing/default and unrelated marketplace registrations without re-adding them', (t) => {
        runRelease(t, {
            marketplaces: [...MARKETPLACES, { name: 'unrelated', source: 'Local: example', isDefault: false }],
            otherPlugins: [{ name: 'other-plugin', marketplace: 'unrelated', version: '1.0.0', enabled: true, source: 'installed' }],
        });
    });

    testRelease('adds only missing marketplaces when some are already registered', (t) => {
        runRelease(t, { marketplaces: MARKETPLACES.slice(0, 3) });
    });

    for (const marketplace of MARKETPLACES) {
        testRelease(`rejects a mismatched ${marketplace.name} source before uninstalling`, (t) => {
            runRelease(t, {
                marketplaces: [{ ...marketplace, source: 'GitHub: unexpected/source' }],
                error: /Marketplace source does not match the expected source/,
            });
        });
    }

    testRelease('rejects duplicate marketplace names before uninstalling', (t) => {
        runRelease(t, {
            marketplaces: [MARKETPLACES[3], MARKETPLACES[3]],
            error: /Multiple registered marketplaces match azure-skills/,
        });
    });

    testRelease('stops on a failed marketplace add before uninstalling', (t) => {
        runRelease(t, {
            addFailure: 'microsoft/skills-for-fabric',
            error: /Command failed|mock marketplace add failed/,
        });
    });

    testRelease('verifies a successful add actually registered the expected marketplace', (t) => {
        runRelease(t, {
            addNoop: 'microsoft/skills-for-fabric',
            error: /fabric-collection is absent from the Copilot marketplace inventory/,
        });
    });

    testRelease('rejects a wrong source returned after marketplace add', (t) => {
        runRelease(t, {
            addWrongSource: 'microsoft/skills-for-fabric',
            error: /Marketplace source does not match the expected source for fabric-collection/,
        });
    });
}