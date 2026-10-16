import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const deps = require('../scripts/shared/dependencies.cjs');
const script = fileURLToPath(new URL('../install-optional-dependencies.ps1', import.meta.url));
const packages = [
    ...['flint', 'playwright'].map(key => ({
        name: deps.MCP_SERVERS[key].package, version: deps.MCP_SERVERS[key].version, scope: 'private',
    })),
    ...['jszip', 'mmdc', 'svgexport'].map(key => ({
        name: deps.TOOLS[key].package, version: deps.TOOLS[key].version,
        scope: deps.TOOLS[key].kind === 'npm-global' ? 'global' : 'private',
    })),
];
const feedPrefix = 'https://feed.example.invalid/npm/registry/';
const replicate = {
    name: deps.MCP_SERVERS.replicate.package, version: deps.MCP_SERVERS.replicate.version, scope: 'private',
};

function runInstaller(t, shell, options = {}) {
    const root = mkdtempSync(join(tmpdir(), 'one-optional-deps-'));
    t.after(() => rmSync(root, { recursive: true, force: true }));
    const runtime = join(root, 'runtime');
    const globalPrefix = join(root, 'global');
    const log = join(root, 'commands.log');
    const npm = join(root, 'npm.ps1');
    writeFileSync(npm, `
param([Parameter(ValueFromRemainingArguments = $true)][string[]]$Arguments)
$ErrorActionPreference = 'Stop'
ConvertTo-Json -InputObject $Arguments -Compress | Add-Content -LiteralPath $env:FAKE_NPM_LOG
$packages = @(('${JSON.stringify([...packages, replicate])}' | ConvertFrom-Json))
if (($Arguments -join ' ') -eq '--version') {
    Write-Output $env:FAKE_NPM_VERSION
    exit 0
}
if (($Arguments -join ' ') -eq 'config get registry') {
    Write-Output 'https://proxy.example.invalid/npm/'
    exit 0
}
if (($Arguments -join ' ') -eq 'prefix --global') {
    Write-Output $env:FAKE_GLOBAL_PREFIX
    exit 0
}
if ($Arguments[0] -eq 'view') {
    if ($env:FAKE_MISSING_PIN -eq $Arguments[1]) {
        Write-Output 'E404: pinned version not found in proxy'
        exit 1
    }
    $package = @($packages | Where-Object { "$($_.name)@$($_.version)" -eq $Arguments[1] })
    if ($env:FAKE_WRONG_PIN -eq $Arguments[1]) {
        Write-Output '"0.0.0"'
    } else {
        ConvertTo-Json -InputObject $package[0].version -Compress
    }
    exit 0
}
if ($Arguments[0] -eq 'install') {
    $spec = $Arguments[-1]
    if ($env:FAKE_INSTALL_FAILURE -eq $spec) {
        & $env:FAKE_NODE -e "console.error('EALLOWREMOTE: fetching remote packages disabled')"
        exit 1
    }
    if ($env:FAKE_STDERR_WARNING -eq '1') {
        $ErrorActionPreference = 'Continue'
        & $env:FAKE_NODE -e "console.error('npm warn test: lifecycle scripts blocked')"
        $ErrorActionPreference = 'Stop'
    }
    $package = @($packages | Where-Object { "$($_.name)@$($_.version)" -eq $spec })[0]
    $modules = if ($Arguments -contains '--global') {
        if ($env:OS -eq 'Windows_NT') { Join-Path $env:FAKE_GLOBAL_PREFIX 'node_modules' }
        else { Join-Path $env:FAKE_GLOBAL_PREFIX 'lib/node_modules' }
    } else {
        Join-Path $Arguments[([Array]::IndexOf($Arguments, '--prefix') + 1)] 'node_modules'
    }
    $directory = Join-Path $modules $package.name
    New-Item -ItemType Directory -Force -Path $directory | Out-Null
    $version = if ($env:FAKE_METADATA_MISMATCH -eq $spec) { '0.0.0' } else { $package.version }
    @{ name = $package.name; version = $version } | ConvertTo-Json -Compress |
        Set-Content -LiteralPath (Join-Path $directory 'package.json')
    $target = switch ($package.name) {
        'flint-chart-mcp' { 'dist/cli.js' }
        '@playwright/mcp' { 'cli.js' }
        'replicate-mcp' { 'index.js' }
    }
    if ($target) {
        $targetPath = Join-Path $directory $target
        New-Item -ItemType Directory -Force -Path (Split-Path -Parent $targetPath) | Out-Null
        $reported = if ($env:FAKE_LAUNCHER_MISMATCH -eq $spec) { '0.0.0' } else { $package.version }
        Set-Content -LiteralPath $targetPath -Value "console.log('$reported');"
    }
    if ($package.scope -eq 'global') {
        $bin = if ($package.name -eq 'svgexport') { 'svgexport' } else { 'mmdc' }
        $binMap = @{}
        $binMap[$bin] = 'cli.cjs'
        @{ name = $package.name; version = $version; bin = $binMap } | ConvertTo-Json -Depth 3 -Compress |
            Set-Content -LiteralPath (Join-Path $directory 'package.json')
        if ($bin -eq 'mmdc') {
            $cli = "const fs = require('node:fs'); const output = process.argv[process.argv.indexOf('-o') + 1]; const bin = 'mmdc';"
        } else {
            $cli = "const fs = require('node:fs'); const output = process.argv[3]; const bin = 'svgexport';"
        }
        $cli += @'
if (process.env.FAKE_RENDER_FAILURE === bin) {
    console.error('Could not find browser: lifecycle script blocked');
    process.exit(1);
}
if (process.env.FAKE_RENDER_NO_OUTPUT === bin) process.exit(0);
const content = process.env.FAKE_RENDER_INVALID === bin ? 'invalid' :
    bin === 'mmdc' ? '<svg xmlns="http://www.w3.org/2000/svg"></svg>' :
    Buffer.from([137,80,78,71,13,10,26,10,0]);
fs.writeFileSync(output, content);
'@
        Set-Content -LiteralPath (Join-Path $directory 'cli.cjs') -Value $cli
    }
    exit 0
}
Write-Output "Unexpected npm arguments: $($Arguments -join ' ')"
exit 1
`, 'utf8');
    const invoke = (verifyOnly = false) => spawnSync(shell, [
        '-NoProfile', '-File', script, ...(verifyOnly ? ['-VerifyOnly'] : options.apply ? ['-Apply'] : []),
        '-RuntimeRoot', runtime, '-NpmCommand', npm, '-NodeCommand', process.execPath,
        ...(options.tarballPrefix ? ['-RegistryTarballPrefix', options.tarballPrefix] : []),
        ...(options.includeReplicate ? ['-IncludeReplicate'] : []),
    ], {
        encoding: 'utf8', timeout: 30000,
        env: {
            ...process.env,
            FAKE_NPM_LOG: log,
            FAKE_GLOBAL_PREFIX: globalPrefix,
            FAKE_MISSING_PIN: options.missingPin || '',
            FAKE_WRONG_PIN: options.wrongPin || '',
            FAKE_INSTALL_FAILURE: options.installFailure || '',
            FAKE_METADATA_MISMATCH: options.metadataMismatch || '',
            FAKE_LAUNCHER_MISMATCH: options.launcherMismatch || '',
            FAKE_NPM_VERSION: options.npmVersion || '12.0.2',
            FAKE_NODE: process.execPath,
            FAKE_STDERR_WARNING: options.stderrWarning ? '1' : '',
            FAKE_RENDER_FAILURE: options.renderFailure || '',
            FAKE_RENDER_NO_OUTPUT: options.renderNoOutput || '',
            FAKE_RENDER_INVALID: options.renderInvalid || '',
        },
    });
    const result = invoke();
    assert.ifError(result.error);
    if (options.verifyAgain) {
        assert.equal(result.status, 0, result.stdout + result.stderr);
        const verification = invoke(true);
        assert.ifError(verification.error);
        assert.equal(verification.status, 0, verification.stdout + verification.stderr);
        assert.match(verification.stdout, /Render verified: svgexport/);
    }
    const commands = existsSync(log)
        ? readFileSync(log, 'utf8').trim().split(/\r?\n/).map(line => JSON.parse(line.replace(/^\uFEFF/, '')))
        : [];
    const output = result.stdout + result.stderr;
    if (options.error) {
        assert.notEqual(result.status, 0, output);
        assert.match(output, options.error);
        assert.doesNotMatch(output, /Verified all selected pinned dependencies/);
    } else {
        assert.equal(result.status, 0, output);
    }
    for (const command of commands) {
        assert.ok(!command.some(arg => /--registry|allow-remote|strict-ssl/.test(arg)));
        if (!options.includeReplicate) assert.ok(!command.some(arg => /replicate/.test(arg)));
        assert.ok(!command.includes('set'));
        const routing = command.filter(arg => arg.startsWith('--replace-registry-host='));
        assert.deepEqual(routing, command[0] === 'install' && options.tarballPrefix
            ? [`--replace-registry-host=${options.tarballPrefix}`] : []);
    }
    return { commands, output, runtime, globalPrefix };
}

for (const shell of process.platform === 'win32' ? ['pwsh', 'powershell'] : ['pwsh']) {
    test(`${shell}: previews shared pins and scopes without writes or package network requests`, (t) => {
        const { commands, output, runtime, globalPrefix } = runInstaller(t, shell);
        assert.deepEqual(commands, [['config', 'get', 'registry'], ['prefix', '--global']]);
        assert.equal(existsSync(runtime), false);
        assert.equal(existsSync(globalPrefix), false);
        for (const pkg of packages) assert.ok(output.includes(`${pkg.scope}: ${pkg.name}@${pkg.version}`));
        assert.match(output, /Preview only/);
    });

    test(`${shell}: checks every pin first, installs in correct scopes, and verifies versions`, (t) => {
        const { commands, output, runtime } = runInstaller(t, shell, { apply: true });
        const views = commands.filter(command => command[0] === 'view');
        const installs = commands.filter(command => command[0] === 'install');
        assert.equal(views.length, 5);
        assert.equal(installs.length, 5);
        assert.ok(commands.findIndex(command => command[0] === 'install') >
            commands.map(command => command[0]).lastIndexOf('view'));
        for (const pkg of packages) {
            const args = installs.find(command => command.at(-1) === `${pkg.name}@${pkg.version}`);
            assert.ok(args, pkg.name);
            assert.ok(args.includes('--save-exact'));
            assert.equal(args.includes('--global'), pkg.scope === 'global');
            if (pkg.scope === 'private') assert.equal(args[args.indexOf('--prefix') + 1], runtime);
        }
        assert.match(output, /Verified all selected pinned dependencies \(5\), MCP launchers \(2\)/);
    });

    test(`${shell}: unavailable proxy pin prevents all installations`, (t) => {
        const { commands } = runInstaller(t, shell, {
            apply: true, missingPin: `${packages.at(-1).name}@${packages.at(-1).version}`,
            error: /E404/,
        });
        assert.equal(commands.filter(command => command[0] === 'install').length, 0);
    });

    test(`${shell}: unexpected proxy version prevents all installations`, (t) => {
        const { commands } = runInstaller(t, shell, {
            apply: true, wrongPin: `${packages[0].name}@${packages[0].version}`,
            error: /did not confirm the exact pinned version/,
        });
        assert.equal(commands.filter(command => command[0] === 'install').length, 0);
    });

    test(`${shell}: npm policy failure stops the batch without overrides`, (t) => {
        const { commands } = runInstaller(t, shell, {
            apply: true, installFailure: `${packages[1].name}@${packages[1].version}`,
            error: /EALLOWREMOTE/,
        });
        assert.equal(commands.filter(command => command[0] === 'install').length, 2);
    });

    test(`${shell}: installed version mismatch is not reported as success`, (t) => {
        runInstaller(t, shell, {
            apply: true, metadataMismatch: `${packages[2].name}@${packages[2].version}`,
            error: /Installed package verification failed/,
        });
    });

    test(`${shell}: MCP version output mismatch is not reported as success`, (t) => {
        runInstaller(t, shell, {
            apply: true, launcherMismatch: `${packages[0].name}@${packages[0].version}`,
            error: /MCP launcher reported an unexpected version/,
        });
    });

    test(`${shell}: explicit backend prefix is routed only during installs without policy changes`, (t) => {
        const { commands, output } = runInstaller(t, shell, { apply: true, tarballPrefix: feedPrefix });
        assert.equal(commands.filter(command => command[0] === 'install').length, 5);
        assert.ok(output.includes(`${feedPrefix} -> https://proxy.example.invalid/npm/`));
        assert.match(output, /Verified all selected pinned dependencies \(5\), MCP launchers \(2\)/);
    });

    test(`${shell}: explicit routing preview still performs no installs`, (t) => {
        const { commands } = runInstaller(t, shell, { tarballPrefix: feedPrefix });
        assert.deepEqual(commands, [['--version'], ['config', 'get', 'registry'], ['prefix', '--global']]);
    });

    for (const prefix of ['http://feed.example.invalid/', 'https://user:pass@feed.example.invalid/',
        'https://feed.example.invalid/?query=1', 'https://feed.example.invalid/#fragment',
        'https://feed.example.invalid/path', 'not-a-url']) {
        test(`${shell}: rejects unsafe or ambiguous tarball prefix ${prefix}`, (t) => {
            const { commands } = runInstaller(t, shell, {
                apply: true, tarballPrefix: prefix, error: /RegistryTarballPrefix must be/,
            });
            assert.deepEqual(commands, []);
        });
    }

    test(`${shell}: older npm cannot silently ignore full-prefix routing`, (t) => {
        const { commands } = runInstaller(t, shell, {
            apply: true, tarballPrefix: feedPrefix, npmVersion: '11.17.0',
            error: /requires npm 12 or later/,
        });
        assert.deepEqual(commands, [['--version']]);
    });

    test(`${shell}: routing does not mask a continued fetch-policy failure`, (t) => {
        const { commands } = runInstaller(t, shell, {
            apply: true, tarballPrefix: feedPrefix,
            installFailure: `${packages[0].name}@${packages[0].version}`, error: /EALLOWREMOTE/,
        });
        assert.equal(commands.filter(command => command[0] === 'install').length, 1);
    });

    test(`${shell}: native stderr warnings remain visible text without PowerShell error records`, (t) => {
        const { output } = runInstaller(t, shell, { apply: true, stderrWarning: true });
        assert.match(output, /npm warn test: lifecycle scripts blocked/);
        assert.doesNotMatch(output, /NativeCommandError|RemoteException|CategoryInfo/);
        assert.match(output, /Render verified: svgexport/);
    });

    test(`${shell}: VerifyOnly checks existing packages and renderers without another install`, (t) => {
        const { commands } = runInstaller(t, shell, { apply: true, verifyAgain: true });
        assert.equal(commands.filter(command => command[0] === 'install').length, 5);
        assert.equal(commands.filter(command => command[0] === 'view').length, 5);
        assert.equal(commands.filter(command => command.join(' ') === 'prefix --global').length, 2);
    });

    for (const renderer of ['mmdc', 'svgexport']) {
        test(`${shell}: ${renderer} missing browser prevents a readiness success claim`, (t) => {
            runInstaller(t, shell, {
                apply: true, renderFailure: renderer, error: /Could not find browser/,
            });
        });

        test(`${shell}: ${renderer} exit zero without output is not success`, (t) => {
            runInstaller(t, shell, {
                apply: true, renderNoOutput: renderer, error: /did not create render output/,
            });
        });

        test(`${shell}: ${renderer} invalid output is not success`, (t) => {
            runInstaller(t, shell, {
                apply: true, renderInvalid: renderer, error: /invalid render output/,
            });
        });
    }

    test(`${shell}: Replicate opt-in preview uses the shared pin without installs`, (t) => {
        const { commands, output, runtime } = runInstaller(t, shell, { includeReplicate: true });
        assert.deepEqual(commands, [['config', 'get', 'registry'], ['prefix', '--global']]);
        assert.equal(existsSync(runtime), false);
        assert.ok(output.includes(`private: ${replicate.name}@${replicate.version}`));
        assert.match(output, /do not verify API access or make paid calls/);
    });

    test(`${shell}: Replicate opt-in installs privately and verifies all three MCP launchers`, (t) => {
        const { commands, output, runtime } = runInstaller(t, shell, {
            apply: true, includeReplicate: true, verifyAgain: true, tarballPrefix: feedPrefix,
        });
        assert.equal(commands.filter(command => command[0] === 'view').length, 6);
        const installs = commands.filter(command => command[0] === 'install');
        assert.equal(installs.length, 6);
        const args = installs.find(command => command.at(-1) === `${replicate.name}@${replicate.version}`);
        assert.ok(args);
        assert.equal(args.includes('--global'), false);
        assert.equal(args[args.indexOf('--prefix') + 1], runtime);
        assert.match(output, /Verified all selected pinned dependencies \(6\), MCP launchers \(3\)/);
    });

    test(`${shell}: unavailable Replicate pin prevents all opt-in installations`, (t) => {
        const { commands } = runInstaller(t, shell, {
            apply: true, includeReplicate: true, missingPin: `${replicate.name}@${replicate.version}`,
            error: /E404/,
        });
        assert.equal(commands.filter(command => command[0] === 'install').length, 0);
    });

    test(`${shell}: wrong Replicate installed version prevents success`, (t) => {
        runInstaller(t, shell, {
            apply: true, includeReplicate: true, metadataMismatch: `${replicate.name}@${replicate.version}`,
            error: /Installed package verification failed/,
        });
    });

    test(`${shell}: wrong Replicate launcher output prevents success`, (t) => {
        runInstaller(t, shell, {
            apply: true, includeReplicate: true, launcherMismatch: `${replicate.name}@${replicate.version}`,
            error: /MCP launcher reported an unexpected version for replicate/,
        });
    });
}
