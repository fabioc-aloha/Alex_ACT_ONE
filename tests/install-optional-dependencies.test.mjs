import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, realpathSync, readFileSync, rmSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { runPowerShell } = require('./helpers/powershell.cjs');
const deps = require('../scripts/shared/dependencies.cjs');
const script = fileURLToPath(new URL('../install-and-check.ps1', import.meta.url));
const ROOT = fileURLToPath(new URL('..', import.meta.url));
const packages = [
    ...deps.mcpPackages(['flint', 'playwright']).map(pkg => ({
        name: pkg.name, version: pkg.version, scope: 'private',
    })),
    ...['jszip', 'mmdc', 'svgexport'].map(key => ({
        name: deps.TOOLS[key].package, version: deps.TOOLS[key].version,
        scope: deps.TOOLS[key].kind === 'npm-global' ? 'global' : 'private',
    })),
];
const feedPrefix = 'https://feed.example.invalid/npm/registry/';
const microsoftProxy = 'https://packagefeedproxy.microsoft.io/npm/';
const microsoftFeed = 'https://ms-feed-25.pkgs.visualstudio.com/1es-public/_packaging/npm-public/npm/registry/';

function runInstaller(t, shell, options = {}) {
    const root = realpathSync.native(mkdtempSync(join(ROOT, '.test-optional-deps-')));
    t.after(() => rmSync(root, { recursive: true, force: true }));
    const runtime = join(root, 'runtime');
    const globalPrefix = join(root, 'global');
    for (const [name, version] of Object.entries(options.seededPackages || {})) {
        const pkg = packages.find(pkg => pkg.name === name);
        assert.ok(pkg, 'Fixture must seed a declared dependency');
        const modules = pkg.scope === 'private' ? join(runtime, 'node_modules')
            : process.platform === 'win32' ? join(globalPrefix, 'node_modules') : join(globalPrefix, 'lib', 'node_modules');
        const file = join(modules, name, 'package.json');
        mkdirSync(dirname(file), { recursive: true });
        writeFileSync(file, JSON.stringify({ name, version }));
    }
    const log = join(root, 'commands.log');
    const npm = join(root, 'npm.ps1');
    const wrapper = join(root, 'dependencies-wrapper.ps1');
    const systemLog = join(root, 'system.log');
    const pandoc = join(root, 'pandoc.ps1');
    const pandocTemplate = join(root, 'pandoc-template.ps1');
    const python = join(root, 'python.ps1');
    const winget = join(root, 'winget.ps1');
    const pillowState = join(root, 'pillow-installed');
    writeFileSync(pandocTemplate, "param([Parameter(ValueFromRemainingArguments=$true)][string[]]$Arguments)\nWrite-Output 'pandoc 3.13'\nexit 0\n");
    if (!options.missingPandoc) writeFileSync(pandoc, readFileSync(pandocTemplate));
    if (!options.missingPython) writeFileSync(python, `
param([Parameter(ValueFromRemainingArguments=$true)][string[]]$Arguments)
ConvertTo-Json -InputObject $Arguments -Compress | Add-Content -LiteralPath $env:FAKE_SYSTEM_LOG
if (($Arguments[0..1] -join ' ') -eq '-B -c') {
    $present = $env:FAKE_MISSING_PILLOW -ne '1' -or (Test-Path -LiteralPath $env:FAKE_PILLOW_STATE)
    @{ present=$present; version=$(if($present){'12.2.0'}else{$null}); executable='selected-fixture-python' } | ConvertTo-Json -Compress
    exit 0
}
if (($Arguments -join ' ') -eq '-m pip --version') { Write-Output 'pip 25.3'; exit 0 }
if (($Arguments -join ' ') -eq '-m pip install Pillow') {
    if ($env:FAKE_SYSTEM_FAILURE -eq 'pillow') { Write-Output 'fixture pip policy failure'; exit 1 }
    if ($env:FAKE_SYSTEM_NOOP -ne 'pillow') { Set-Content -LiteralPath $env:FAKE_PILLOW_STATE -Value 'installed' }
    exit 0
}
throw 'Unexpected selected-Python invocation'
`, 'utf8');
    if (!options.missingWinget) writeFileSync(winget, `
param([Parameter(ValueFromRemainingArguments=$true)][string[]]$Arguments)
ConvertTo-Json -InputObject $Arguments -Compress | Add-Content -LiteralPath $env:FAKE_SYSTEM_LOG
if (($Arguments -join ' ') -ne 'install --id JohnMacFarlane.Pandoc --exact') { throw 'Unexpected winget arguments' }
if ($env:FAKE_SYSTEM_FAILURE -eq 'pandoc') { Write-Output 'fixture winget failure'; exit 1 }
if ($env:FAKE_SYSTEM_NOOP -ne 'pandoc') { Copy-Item -LiteralPath $env:FAKE_PANDOC_TEMPLATE -Destination $env:FAKE_PANDOC_COMMAND }
exit 0
`, 'utf8');
    writeFileSync(wrapper, `
param([switch]$Apply,[switch]$VerifyOnly,[string]$RegistryTarballPrefix,[string]$BrowserExecutablePath,
    [string]$RuntimeRoot,[string]$NpmCommand,[string]$NodeCommand,[string]$PythonCommand,
    [string]$PandocCommand,[string]$WingetCommand,[switch]$IncludeReplicate)
if ($PSBoundParameters.ContainsKey('IncludeReplicate')) {
    & $env:FAKE_SETUP_SCRIPT @PSBoundParameters
} else {
    . $env:FAKE_SETUP_SCRIPT @PSBoundParameters
    Invoke-DependencySetup -PluginRoot $env:FAKE_PLUGIN_ROOT
}
`, 'utf8');
    const browserPath = options.browserPath === 'fixture'
        ? join(root, 'browser with spaces.exe')
        : options.browserPath === 'directory' ? root : options.browserPath;
    const inheritedBrowser = options.inheritedBrowserPath === 'fixture'
        ? join(root, 'inherited browser.exe') : options.inheritedBrowserPath || '';
    if (options.browserPath === 'fixture') writeFileSync(browserPath, '');
    if (options.inheritedBrowserPath === 'fixture') writeFileSync(inheritedBrowser, '');
    const renderLog = join(root, 'renderers.log');
    writeFileSync(npm, `
param([Parameter(ValueFromRemainingArguments = $true)][string[]]$Arguments)
$ErrorActionPreference = 'Stop'
ConvertTo-Json -InputObject $Arguments -Compress | Add-Content -LiteralPath $env:FAKE_NPM_LOG
$packages = @(('${JSON.stringify(packages)}' | ConvertFrom-Json))
if (($Arguments -join ' ') -eq '--version') {
    Write-Output $env:FAKE_NPM_VERSION
    exit 0
}
if (($Arguments -join ' ') -eq 'config get registry') {
    Write-Output $env:FAKE_REGISTRY
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
    if ($env:PUPPETEER_EXECUTABLE_PATH -cne $env:FAKE_INHERITED_BROWSER) {
        throw 'Renderer browser override leaked into npm'
    }
    $spec = $Arguments[-1]
    if ($env:FAKE_INSTALL_FAILURE -eq $spec) {
        $ErrorActionPreference = 'Continue'
        & $env:FAKE_NODE -e "console.error(process.env.FAKE_INSTALL_ERROR)"
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
        $prefix = $Arguments[([Array]::IndexOf($Arguments, '--prefix') + 1)]
        if ($prefix -cne $env:FAKE_RUNTIME_ROOT) {
            throw 'Mock installer refused a write outside the temporary runtime'
        }
        Join-Path $prefix 'node_modules'
    }
    $directory = Join-Path $modules $package.name
    New-Item -ItemType Directory -Force -Path $directory | Out-Null
    $version = if ($env:FAKE_METADATA_MISMATCH -eq $spec) { '0.0.0' } else { $package.version }
    @{ name = $package.name; version = $version } | ConvertTo-Json -Compress |
        Set-Content -LiteralPath (Join-Path $directory 'package.json')
    $target = switch ($package.name) {
        'flint-chart-mcp' { 'dist/cli.js' }
        '@playwright/mcp' { 'cli.js' }
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
if (process.env.FAKE_EXPECT_BROWSER && process.env.PUPPETEER_EXECUTABLE_PATH !== process.env.FAKE_EXPECT_BROWSER) {
    console.error('Expected the selected browser in the renderer environment');
    process.exit(1);
}
fs.appendFileSync(process.env.FAKE_RENDER_LOG, JSON.stringify({
    bin, browser: process.env.PUPPETEER_EXECUTABLE_PATH || ''
}) + '\\n');
if (process.env.FAKE_RENDER_FAILURE === bin) {
    console.error('Could not find browser: lifecycle script blocked');
    process.exit(1);
}
if (process.env.FAKE_RENDER_NO_OUTPUT === bin) process.exit(0);
if (bin === 'svgexport') {
    const svg = fs.readFileSync(process.argv[2], 'utf8');
    const check = [
        "$svg = New-Object System.Xml.XmlDocument; $svg.Load([Console]::In)",
        "if ($svg.DocumentElement.LocalName -ne 'svg' -or $svg.DocumentElement.NamespaceURI -ne 'http://www.w3.org/2000/svg' -or $svg.DocumentElement.GetAttribute('width') -ne '20' -or $svg.DocumentElement.GetAttribute('height') -ne '20' -or $svg.DocumentElement.FirstChild.GetAttribute('fill') -ne 'blue') { throw 'Unexpected SVG fixture content' }"
    ].join('; ');
    const parsed = require('node:child_process').spawnSync(process.env.FAKE_POWERSHELL,
        ['-NoProfile', '-Command', "$ErrorActionPreference = 'Stop'; " + check],
        { input: svg, encoding: 'utf8', timeout: 10000 });
    if (parsed.error || parsed.status !== 0) {
        console.error('SVG input parse failed: ' + (parsed.error?.message || parsed.stderr));
        process.exit(1);
    }
    fs.writeFileSync(process.env.FAKE_RENDER_INPUT, svg);
}
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
    const invoke = (verifyOnly = false) => runPowerShell(shell, wrapper, {
        ...(verifyOnly ? { VerifyOnly: true } : options.apply ? { Apply: true } : {}),
        ...(options.inheritRuntime ? {} : { RuntimeRoot: runtime }),
        NpmCommand: npm, NodeCommand: process.execPath,
        PythonCommand: python, PandocCommand: pandoc, WingetCommand: winget,
        ...(options.tarballPrefix ? { RegistryTarballPrefix: options.tarballPrefix } : {}),
        ...(browserPath !== undefined ? { BrowserExecutablePath: browserPath } : {}),
        ...(options.removedReplicateFlag ? { IncludeReplicate: true } : {}),
    }, {
        root,
        encoding: 'utf8', timeout: 30000,
        env: {
            ...process.env,
            ALEX_ACT_ONE_RUNTIME_ROOT: options.inheritRuntime ? runtime : join(root, 'unselected-runtime'),
            TEMP: root, TMP: root, TMPDIR: root,
            FAKE_POWERSHELL: shell,
            FAKE_SETUP_SCRIPT: script,
            FAKE_PLUGIN_ROOT: ROOT,
            FAKE_SYSTEM_LOG: systemLog,
            FAKE_PANDOC_TEMPLATE: pandocTemplate,
            FAKE_PANDOC_COMMAND: pandoc,
            FAKE_PILLOW_STATE: pillowState,
            FAKE_MISSING_PILLOW: options.missingPillow ? '1' : '',
            FAKE_SYSTEM_FAILURE: options.systemFailure || '',
            FAKE_SYSTEM_NOOP: options.systemNoop || '',
            FAKE_RENDER_INPUT: join(root, 'verified-input.svg'),
            FAKE_NPM_LOG: log,
            FAKE_GLOBAL_PREFIX: globalPrefix,
            FAKE_RUNTIME_ROOT: runtime,
            FAKE_MISSING_PIN: options.missingPin || '',
            FAKE_WRONG_PIN: options.wrongPin || '',
            FAKE_INSTALL_FAILURE: options.installFailure || '',
            FAKE_INSTALL_ERROR: options.installError || 'EALLOWREMOTE: fetching remote packages disabled',
            FAKE_METADATA_MISMATCH: options.metadataMismatch || '',
            FAKE_LAUNCHER_MISMATCH: options.launcherMismatch || '',
            FAKE_NPM_VERSION: options.npmVersion || '12.0.2',
            FAKE_REGISTRY: options.registry || 'https://proxy.example.invalid/npm/',
            FAKE_NODE: process.execPath,
            FAKE_STDERR_WARNING: options.stderrWarning ? '1' : '',
            FAKE_RENDER_FAILURE: options.renderFailure || '',
            FAKE_RENDER_NO_OUTPUT: options.renderNoOutput || '',
            FAKE_RENDER_INVALID: options.renderInvalid || '',
            PUPPETEER_EXECUTABLE_PATH: inheritedBrowser,
            FAKE_INHERITED_BROWSER: inheritedBrowser,
            FAKE_EXPECT_BROWSER: options.expectBrowser === 'explicit' ? browserPath
                : options.expectBrowser === 'inherited' ? inheritedBrowser : '',
            FAKE_RENDER_LOG: renderLog,
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
        if (options.installFailure) assert.match(output, /Command failed \(1\):/);
        assert.doesNotMatch(output, /Verified all selected pinned dependencies/);
    } else {
        assert.equal(result.status, 0, output);
        if (options.apply) {
            assert.match(readFileSync(join(root, 'verified-input.svg'), 'utf8'),
                /<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" width="20" height="20">/);
        }
    }
    for (const command of commands) {
        assert.ok(!command.some(arg => /--registry|allow-remote|strict-ssl/.test(arg)));
        assert.ok(!command.some(arg => /replicate/.test(arg)));
        assert.ok(!command.includes('set'));
        const routing = command.filter(arg => arg.startsWith('--replace-registry-host='));
        const prefix = options.tarballPrefix || (options.registry === microsoftProxy ? microsoftFeed : '');
        assert.deepEqual(routing, command[0] === 'install' && prefix
            ? [`--replace-registry-host=${prefix}`] : []);
    }
    const renderers = existsSync(renderLog)
        ? readFileSync(renderLog, 'utf8').trim().split(/\r?\n/).map(line => JSON.parse(line))
        : [];
    const systemCommands = existsSync(systemLog)
        ? readFileSync(systemLog, 'utf8').trim().split(/\r?\n/).map(line => JSON.parse(line))
        : [];
    assert.ok(systemCommands.every(args => !args.some(arg =>
        /--upgrade|--break-system-packages|--index-url|--trusted-host|accept-.*agreements/.test(arg))));
    return { commands, output, runtime, globalPrefix, browserPath, inheritedBrowser, renderers, systemCommands };
}

for (const shell of process.platform === 'win32' ? ['pwsh', 'powershell'] : ['pwsh']) {
    test(`${shell}: previews shared pins and scopes without writes or package network requests`, (t) => {
        const { commands, output, runtime, globalPrefix } = runInstaller(t, shell);
        assert.deepEqual(commands, [['config', 'get', 'registry'], ['prefix', '--global']]);
        assert.equal(existsSync(runtime), false);
        assert.equal(existsSync(globalPrefix), false);
        for (const pkg of packages) assert.ok(output.includes(`${pkg.scope}: ${pkg.name}@${pkg.version}`));
        assert.match(output, /Report only/);
        assert.match(output, /missing/);
        assert.match(output, /Pandoc.*3\.13/);
        assert.match(output, /Pillow.*12\.2\.0/);
    });

    test(`${shell}: default reports missing Python, Pillow and Pandoc without any system installation`, t => {
        const { commands, output, systemCommands } = runInstaller(t, shell, {
            missingPython: true, missingPandoc: true, missingWinget: true,
        });
        assert.match(output, /Python.*missing/i);
        assert.match(output, /Pandoc.*missing/i);
        assert.match(output, /Pillow.*missing/i);
        assert.deepEqual(systemCommands, []);
        assert.ok(commands.every(args => args[0] !== 'install' && args[0] !== 'view'));
    });

    test(`${shell}: default reports matched and mismatched installed npm versions without installing or launching them`, t => {
        const matched = packages[0], mismatch = packages.at(-1);
        const { commands, output, renderers } = runInstaller(t, shell, {
            seededPackages: { [matched.name]: matched.version, [mismatch.name]: '0.0.1' },
        });
        assert.ok(output.includes(`${matched.name}@${matched.version}; installed=${matched.version}; status=matched`));
        assert.ok(output.includes(`${mismatch.name}@${mismatch.version}; installed=0.0.1; status=mismatched`));
        assert.ok(commands.every(args => args[0] !== 'view' && args[0] !== 'install'));
        assert.deepEqual(renderers, []);
    });

    test(`${shell}: apply refuses missing Python before any package installation`, t => {
        const { commands, systemCommands } = runInstaller(t, shell, {
            apply: true, missingPython: true, error: /Python.*install|Python.*required/i,
        });
        assert.equal(commands.filter(args => args[0] === 'install').length, 0);
        assert.ok(systemCommands.every(args => !args.includes('install')));
    });

    test(`${shell}: apply installs missing Pillow only in the selected Python and verifies the result`, t => {
        const { systemCommands, output } = runInstaller(t, shell, { apply: true, missingPillow: true });
        assert.equal(systemCommands.filter(args => args.join(' ') === '-m pip install Pillow').length, 1);
        assert.match(output, /Pillow.*12\.2\.0/);
    });

    test(`${shell}: existing Pandoc and Pillow are never silently upgraded`, t => {
        const { systemCommands } = runInstaller(t, shell, { apply: true });
        assert.ok(systemCommands.every(args => !args.includes('install')));
    });

    if (process.platform === 'win32') {
        test(`${shell}: apply installs missing Pandoc through winget and verifies its command`, t => {
            const { systemCommands, output } = runInstaller(t, shell, { apply: true, missingPandoc: true });
            assert.ok(systemCommands.some(args => args.join(' ') === 'install --id JohnMacFarlane.Pandoc --exact'));
            assert.match(output, /Pandoc.*3\.13/);
        });
        test(`${shell}: missing winget blocks all package installation`, t => {
            const { commands } = runInstaller(t, shell, {
                apply: true, missingPandoc: true, missingWinget: true, error: /winget.*required|winget.*unavailable/i,
            });
            assert.equal(commands.filter(args => args[0] === 'install').length, 0);
        });
        for (const [failure, expected] of [['failure', /winget failure/], ['no-op', /Pandoc installation verification failed/]]) {
            test(`${shell}: Pandoc ${failure} cannot claim readiness`, t => {
                runInstaller(t, shell, { apply: true, missingPandoc: true,
                    ...(failure === 'failure' ? { systemFailure: 'pandoc' } : { systemNoop: 'pandoc' }), error: expected });
            });
        }
    } else {
        test(`${shell}: missing Pandoc on an unsupported installation platform stops before npm writes`, t => {
            const { commands } = runInstaller(t, shell, {
                apply: true, missingPandoc: true, error: /Pandoc.*manually|Windows.*winget/i,
            });
            assert.equal(commands.filter(args => args[0] === 'install').length, 0);
        });
    }

    for (const [failure, expected] of [['failure', /pip policy failure/], ['no-op', /Pillow.*verification|Pillow.*missing/i]]) {
        test(`${shell}: Pillow ${failure} cannot claim readiness`, t => {
            runInstaller(t, shell, { apply: true, missingPillow: true,
                ...(failure === 'failure' ? { systemFailure: 'pillow' } : { systemNoop: 'pillow' }), error: expected });
        });
    }
    test(`${shell}: checks every pin first, installs in correct scopes, and verifies versions`, (t) => {
        const { commands, output, runtime } = runInstaller(t, shell, { apply: true });
        const views = commands.filter(command => command[0] === 'view');
        const installs = commands.filter(command => command[0] === 'install');
        assert.equal(views.length, packages.length);
        assert.equal(installs.length, packages.length);
        assert.ok(commands.findIndex(command => command[0] === 'install') >
            commands.map(command => command[0]).lastIndexOf('view'));
        for (const pkg of packages) {
            const args = installs.find(command => command.at(-1) === `${pkg.name}@${pkg.version}`);
            assert.ok(args, pkg.name);
            assert.ok(args.includes('--save-exact'));
            assert.equal(args.includes('--global'), pkg.scope === 'global');
            if (pkg.scope === 'private') assert.equal(args[args.indexOf('--prefix') + 1], runtime);
        }
        assert.ok(output.includes(`Verified all selected pinned dependencies (${packages.length}), MCP launchers (2)`));
    });

    test(`${shell}: honors the inherited runtime selected by the host and verifies there`, t => {
        const { commands, runtime } = runInstaller(t, shell, { apply: true, inheritRuntime: true });
        for (const command of commands.filter(args => args[0] === 'install' && args.includes('--prefix'))) {
            assert.equal(command[command.indexOf('--prefix') + 1], runtime);
        }
    });

    test(`${shell}: detects the configured Microsoft proxy in a no-write preview`, t => {
        const { commands, output, runtime, globalPrefix } = runInstaller(t, shell, { registry: microsoftProxy });
        assert.ok(output.includes(`${microsoftFeed} -> ${microsoftProxy}`));
        assert.match(output, /detected Microsoft proxy/);
        assert.equal(commands.filter(args => args[0] === 'view' || args[0] === 'install').length, 0);
        assert.equal(existsSync(runtime), false);
        assert.equal(existsSync(globalPrefix), false);
        assert.deepEqual(commands, [['config', 'get', 'registry'], ['prefix', '--global']]);
    });

    test(`${shell}: routes every private and global install for the configured Microsoft proxy`, t => {
        const { commands, output } = runInstaller(t, shell, { registry: microsoftProxy, apply: true });
        assert.equal(commands.filter(args => args[0] === 'install').length, packages.length);
        assert.match(output, /detected Microsoft proxy/);
    });

    test(`${shell}: explicit routing overrides detected Microsoft proxy routing`, t => {
        runInstaller(t, shell, { registry: microsoftProxy, tarballPrefix: feedPrefix, apply: true });
    });

    test(`${shell}: proxy verification fetches nothing and does not require routing support`, t => {
        const { commands } = runInstaller(t, shell, { registry: microsoftProxy, apply: true, verifyAgain: true });
        assert.equal(commands.filter(args => args[0] === 'view').length, packages.length);
        assert.equal(commands.filter(args => args[0] === 'install').length, packages.length);
        assert.equal(commands.filter(args => args[0] === '--version').length, 1);
    });

    test(`${shell}: a lookalike proxy host gets no automatic routing`, t => {
        const { commands } = runInstaller(t, shell, {
            registry: 'https://packagefeedproxy.microsoft.io.example.invalid/npm/',
        });
        assert.deepEqual(commands, [['config', 'get', 'registry'], ['prefix', '--global']]);
    });

    test(`${shell}: detected routing refuses older npm before package writes`, t => {
        const { commands } = runInstaller(t, shell, {
            registry: microsoftProxy, npmVersion: '11.0.0', apply: true, error: /requires npm 12 or later/,
        });
        assert.equal(commands.filter(args => args[0] === 'view' || args[0] === 'install').length, 0);
    });

    test(`${shell}: detected routing does not retry or broaden a rejected tarball prefix`, t => {
        const { commands, output } = runInstaller(t, shell, {
            registry: microsoftProxy, apply: true,
            installFailure: `${packages[0].name}@${packages[0].version}`, error: /EALLOWREMOTE/,
        });
        assert.match(output, /routing was already/);
        assert.match(output, /No automatic retry/);
        assert.equal(commands.filter(args => args[0] === 'install').length, 1);
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

    test(`${shell}: fetch-policy failure gives explicit routing guidance without retrying`, (t) => {
        const { commands, output } = runInstaller(t, shell, {
            apply: true, installFailure: `${packages[0].name}@${packages[0].version}`,
            error: /EALLOWREMOTE/,
        });
        assert.match(output, /-RegistryTarballPrefix/);
        assert.match(output, /npm 12/);
        assert.match(output, /No registry or fetch-policy settings were changed/);
        assert.equal(commands.filter(command => command[0] === 'install').length, 1);
    });

    test(`${shell}: cleanup failure gives non-destructive recovery guidance`, (t) => {
        const { commands, output } = runInstaller(t, shell, {
            apply: true, installFailure: `${packages[0].name}@${packages[0].version}`,
            installError: 'EPERM: operation not permitted, rmdir package',
            error: /EPERM/,
        });
        assert.match(output, /Close applications.*affected package/);
        assert.match(output, /No package directories were deleted/);
        assert.equal(commands.filter(command => command[0] === 'install').length, 1);
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
        assert.equal(commands.filter(command => command[0] === 'install').length, packages.length);
        assert.ok(output.includes(`${feedPrefix} -> https://proxy.example.invalid/npm/`));
        assert.ok(output.includes(`Verified all selected pinned dependencies (${packages.length}), MCP launchers (2)`));
    });

    test(`${shell}: explicit routing preview still performs no installs`, (t) => {
        const { commands } = runInstaller(t, shell, { tarballPrefix: feedPrefix });
        assert.deepEqual(commands, [['config', 'get', 'registry'], ['prefix', '--global']]);
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
        assert.deepEqual(commands, [['config', 'get', 'registry'], ['prefix', '--global'], ['--version']]);
    });

    test(`${shell}: routing does not mask a continued fetch-policy failure`, (t) => {
        const { commands, output } = runInstaller(t, shell, {
            apply: true, tarballPrefix: feedPrefix,
            installFailure: `${packages[0].name}@${packages[0].version}`, error: /EALLOWREMOTE/,
        });
        assert.match(output, /Tarball routing was already selected/);
        assert.match(output, /No automatic retry/);
        assert.equal(commands.filter(command => command[0] === 'install').length, 1);
    });

    test(`${shell}: explicit browser path preview stays read-only`, (t) => {
        const { commands, output, browserPath, runtime } = runInstaller(t, shell, { browserPath: 'fixture' });
        assert.ok(output.includes(`Browser executable: ${browserPath}`));
        assert.match(output, /renderer processes only/);
        assert.deepEqual(commands, [['config', 'get', 'registry'], ['prefix', '--global']]);
        assert.equal(existsSync(runtime), false);
    });

    test(`${shell}: explicit browser path reaches both renderers without overriding npm environment`, (t) => {
        const { browserPath, renderers, commands } = runInstaller(t, shell, {
            apply: true, verifyAgain: true, browserPath: 'fixture',
            inheritedBrowserPath: 'fixture', expectBrowser: 'explicit',
        });
        assert.deepEqual(renderers, ['mmdc', 'svgexport', 'mmdc', 'svgexport']
            .map(bin => ({ bin, browser: browserPath })));
        assert.equal(commands.filter(command => command[0] === 'install').length, packages.length);
    });

    test(`${shell}: inherited browser path is validated and preserved`, (t) => {
        const { inheritedBrowser, output, renderers } = runInstaller(t, shell, {
            apply: true, inheritedBrowserPath: 'fixture', expectBrowser: 'inherited',
        });
        assert.ok(output.includes(`Browser executable: ${inheritedBrowser}`));
        assert.match(output, /PUPPETEER_EXECUTABLE_PATH/);
        assert.deepEqual(renderers, ['mmdc', 'svgexport']
            .map(bin => ({ bin, browser: inheritedBrowser })));
    });

    for (const [label, browserPath] of [
        ['relative', 'relative-browser.exe'],
        ['missing', join(ROOT, 'absent-browser.exe')],
        ['directory', 'directory'],
        ['empty', ''],
    ]) {
        test(`${shell}: rejects ${label} browser path before any npm commands`, (t) => {
            const { commands } = runInstaller(t, shell, {
                apply: true, browserPath, error: /BrowserExecutablePath must name an existing absolute file path/,
            });
            assert.deepEqual(commands, []);
        });
    }

    test(`${shell}: rejects missing inherited browser path before any npm commands`, (t) => {
        const { commands } = runInstaller(t, shell, {
            apply: true, inheritedBrowserPath: join(ROOT, 'absent-browser.exe'),
            error: /PUPPETEER_EXECUTABLE_PATH must name an existing absolute file path/,
        });
        assert.deepEqual(commands, []);
    });

    test(`${shell}: native stderr warnings remain visible text without PowerShell error records`, (t) => {
        const { output } = runInstaller(t, shell, { apply: true, stderrWarning: true });
        assert.match(output, /npm warn test: lifecycle scripts blocked/);
        assert.doesNotMatch(output, /NativeCommandError|RemoteException|CategoryInfo/);
        assert.match(output, /Render verified: svgexport/);
    });

    test(`${shell}: VerifyOnly checks existing packages and renderers without another install`, (t) => {
        const { commands } = runInstaller(t, shell, { apply: true, verifyAgain: true });
        assert.equal(commands.filter(command => command[0] === 'install').length, packages.length);
        assert.equal(commands.filter(command => command[0] === 'view').length, packages.length);
        assert.equal(commands.filter(command => command.join(' ') === 'prefix --global').length, 2);
    });

    for (const renderer of ['mmdc', 'svgexport']) {
        test(`${shell}: ${renderer} missing browser prevents a readiness success claim`, (t) => {
            const { output } = runInstaller(t, shell, {
                apply: true, renderFailure: renderer, error: /Could not find browser/,
            });
            assert.match(output, /-VerifyOnly -BrowserExecutablePath/);
            assert.match(output, /does not enable scripts or download browsers/);
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

    test(`${shell}: removed image-provider opt-in is rejected before npm or runtime writes`, t => {
        const { commands, runtime } = runInstaller(t, shell, {
            apply: true, removedReplicateFlag: true, error: /parameter.*IncludeReplicate|IncludeReplicate.*parameter/i,
        });
        assert.deepEqual(commands, []);
        assert.equal(existsSync(runtime), false);
    });
}
