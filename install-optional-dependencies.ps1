<#
.SYNOPSIS
Preview or install ONE's optional npm dependencies, with opt-in Replicate.
.DESCRIPTION
Reads the canonical version pins and uses the configured npm registry.
Flint, Playwright and JSZip use ONE's private runtime. Mermaid CLI and
svgexport use npm's global prefix. Installation may download browsers.
No optional plugins, system packages, registry or npm policy changes.
An explicit RegistryTarballPrefix routes matching backend tarballs through
the configured registry using npm 12's per-command URL-prefix replacement.
.EXAMPLE
.\install-optional-dependencies.ps1
.EXAMPLE
.\install-optional-dependencies.ps1 -Apply
.EXAMPLE
.\install-optional-dependencies.ps1 -VerifyOnly
.EXAMPLE
.\install-optional-dependencies.ps1 -Apply -IncludeReplicate
#>
[CmdletBinding()]
param(
    [switch]$Apply,
    [switch]$VerifyOnly,
    [switch]$IncludeReplicate,
    [string]$RegistryTarballPrefix,
    [string]$RuntimeRoot = (Join-Path $HOME '.copilot\plugin-data\alex-act-one\runtime'),
    [string]$NpmCommand = 'npm',
    [string]$NodeCommand = 'node'
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
if ($Apply -and $VerifyOnly) {
    throw '-Apply and -VerifyOnly are separate operations.'
}

function Invoke-CheckedCommand {
    param(
        [Parameter(Mandatory)] [string]$Command,
        [Parameter(Mandatory)] [string[]]$Arguments
    )

    $previousPreference = $ErrorActionPreference
    try {
        $ErrorActionPreference = 'Continue'
        $output = & $Command @Arguments 2>&1
        $exitCode = $LASTEXITCODE
    } finally {
        $ErrorActionPreference = $previousPreference
    }
    if ($exitCode -ne 0) {
        throw "Command failed ($exitCode): $Command $($Arguments -join ' ')`n$($output -join "`n")`nInstallation or verification stopped. Partial installations may remain. No registry or fetch-policy override was attempted."
    }
    return $output | ForEach-Object { $_.ToString() }
}

foreach ($command in @($NpmCommand, $NodeCommand)) {
    if (-not (Get-Command $command -ErrorAction SilentlyContinue)) {
        throw "Required command is unavailable: $command"
    }
}

if ($RegistryTarballPrefix) {
    $prefixUri = $null
    if (-not [Uri]::TryCreate($RegistryTarballPrefix, [UriKind]::Absolute, [ref]$prefixUri) -or
        $prefixUri.Scheme -cne 'https' -or $prefixUri.UserInfo -or $prefixUri.Query -or
        $prefixUri.Fragment -or -not $prefixUri.AbsolutePath.EndsWith('/')) {
        throw 'RegistryTarballPrefix must be an absolute HTTPS URL ending in /, without credentials, query, or fragment.'
    }
    $npmVersion = ((Invoke-CheckedCommand -Command $NpmCommand -Arguments @('--version')) -join "`n").Trim()
    if ($npmVersion -notmatch '^(\d+)\.\d+\.\d+' -or [int]$Matches[1] -lt 12) {
        throw 'RegistryTarballPrefix requires npm 12 or later for full URL-prefix replacement.'
    }
}

$RuntimeRoot = [IO.Path]::GetFullPath($RuntimeRoot)
$dependencyRegistry = Join-Path $PSScriptRoot 'scripts\shared\dependencies.cjs'
$readPins = @'
const deps = require(process.argv[1]);
const routes = ['flint', 'playwright'];
if (process.argv[2] === 'true') routes.push('replicate');
const packages = routes.map(key => ({
    name: deps.MCP_SERVERS[key].package,
    version: deps.MCP_SERVERS[key].version,
    scope: 'private',
    route: key
}));
for (const key of ['jszip', 'mmdc', 'svgexport']) {
    const tool = deps.TOOLS[key];
    packages.push({
        name: tool.package,
        version: tool.version,
        scope: tool.kind === 'npm-global' ? 'global' : 'private',
        route: null
    });
}
console.log(JSON.stringify(packages));
'@
$raw = (Invoke-CheckedCommand -Command $NodeCommand -Arguments @('-e', $readPins, $dependencyRegistry, $IncludeReplicate.IsPresent.ToString().ToLowerInvariant())) -join "`n"
$packages = @(($raw | ConvertFrom-Json))
foreach ($package in $packages) {
    if (-not $package.name -or -not $package.version) {
        throw 'The dependency registry must provide an exact package name and version.'
    }
}
$registry = ((Invoke-CheckedCommand -Command $NpmCommand -Arguments @('config', 'get', 'registry')) -join "`n").Trim()
$globalPrefix = ((Invoke-CheckedCommand -Command $NpmCommand -Arguments @('prefix', '--global')) -join "`n").Trim()
if (-not $registry -or -not [IO.Path]::IsPathRooted($globalPrefix)) {
    throw 'npm must report a registry and an absolute global prefix.'
}

Write-Output "Registry: $registry"
Write-Output "Private runtime: $RuntimeRoot"
Write-Output "Global npm prefix: $globalPrefix"
if ($RegistryTarballPrefix) {
    Write-Output "Tarball routing: $RegistryTarballPrefix -> $registry (per-install URL-prefix replacement only)"
}
foreach ($package in $packages) {
    Write-Output "$($package.scope): $($package.name)@$($package.version)"
}
Write-Output 'Excluded: optional plugins and system packages. Registry and npm policy are unchanged.'
if ($IncludeReplicate) {
    Write-Output 'Replicate selected. Image generation separately requires REPLICATE_API_TOKEN and a paid account; installation and version checks do not verify API access or make paid calls.'
} else {
    Write-Output 'Replicate excluded by default. Use -IncludeReplicate to select it.'
}
if (-not $Apply -and -not $VerifyOnly) {
    Write-Output 'Preview only; nothing installed or changed. Run again with -Apply to install.'
    return
}

if ($Apply) {
    foreach ($package in $packages) {
        $spec = "$($package.name)@$($package.version)"
        $raw = (Invoke-CheckedCommand -Command $NpmCommand -Arguments @('view', $spec, 'version', '--json')) -join "`n"
        $available = @(($raw | ConvertFrom-Json))
        if ($available.Count -ne 1 -or $available[0] -cne $package.version) {
            throw "The configured registry did not confirm the exact pinned version: $spec. No installs started."
        }
    }
    Write-Output 'All exact pins are listed by the configured registry; downloads may still fail.'

    foreach ($package in $packages) {
        $arguments = @('install', '--save-exact', '--prefer-offline', '--no-audit', '--no-fund')
        if ($RegistryTarballPrefix) {
            $arguments += "--replace-registry-host=$RegistryTarballPrefix"
        }
        if ($package.scope -eq 'global') {
            $arguments += '--global'
        } else {
            $arguments += @('--prefix', $RuntimeRoot)
        }
        $arguments += "$($package.name)@$($package.version)"
        Invoke-CheckedCommand -Command $NpmCommand -Arguments $arguments | Write-Output
    }
}

$globalModules = if ($env:OS -eq 'Windows_NT') {
    Join-Path $globalPrefix 'node_modules'
} else {
    Join-Path $globalPrefix 'lib\node_modules'
}
foreach ($package in $packages) {
    $modules = if ($package.scope -eq 'global') { $globalModules } else { Join-Path $RuntimeRoot 'node_modules' }
    $metadataPath = Join-Path (Join-Path $modules $package.name) 'package.json'
    $metadata = Get-Content -LiteralPath $metadataPath -Raw | ConvertFrom-Json
    if ($metadata.name -cne $package.name -or $metadata.version -cne $package.version) {
        throw "Installed package verification failed: $($package.name)@$($package.version)."
    }
}

$previousRuntime = $env:ALEX_ACT_ONE_RUNTIME_ROOT
$mcpPackages = @($packages | Where-Object { $_.route })
try {
    $env:ALEX_ACT_ONE_RUNTIME_ROOT = $RuntimeRoot
    $launcher = Join-Path $PSScriptRoot 'skills\setup-dependencies\scripts\runtime-launcher.mjs'
    foreach ($package in $mcpPackages) {
        $reported = ((Invoke-CheckedCommand -Command $NodeCommand -Arguments @($launcher, $package.route, '--version')) -join "`n").Trim()
        if ($reported -cne $package.version -and $reported -cne "Version $($package.version)") {
            throw "MCP launcher reported an unexpected version for $($package.route): $reported"
        }
    }
} finally {
    if ($null -eq $previousRuntime) {
        Remove-Item Env:ALEX_ACT_ONE_RUNTIME_ROOT -ErrorAction SilentlyContinue
    } else {
        $env:ALEX_ACT_ONE_RUNTIME_ROOT = $previousRuntime
    }
}
Write-Output "All $($packages.Count) selected pinned package versions and $($mcpPackages.Count) MCP launchers are verified. Checking renderer readiness."
$verifyRenderers = @'
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const modules = process.argv[1];
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'one-render-verify-'));
try {
    const diagram = path.join(root, 'diagram.mmd');
    const svgInput = path.join(root, 'input.svg');
    fs.writeFileSync(diagram, 'graph TD\nA --> B\n');
    fs.writeFileSync(svgInput, '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"><rect width="20" height="20" fill="blue"/></svg>');
    for (const [name, bin, output, args] of [
        ['@mermaid-js/mermaid-cli', 'mmdc', path.join(root, 'diagram.svg'), ['-i', diagram, '-o', path.join(root, 'diagram.svg')]],
        ['svgexport', 'svgexport', path.join(root, 'image.png'), [svgInput, path.join(root, 'image.png')]]
    ]) {
        const packageRoot = path.join(modules, name);
        const pkg = JSON.parse(fs.readFileSync(path.join(packageRoot, 'package.json'), 'utf8'));
        const cli = typeof pkg.bin === 'string' ? pkg.bin : pkg.bin?.[bin];
        if (!cli) throw Error(`Renderer entry point missing: ${name}`);
        const result = spawnSync(process.execPath, [path.join(packageRoot, cli), ...args], {
            encoding: 'utf8', timeout: 30000, maxBuffer: 1024 * 1024
        });
        if (result.error || result.status !== 0) {
            const detail = result.error?.message || result.stderr || result.stdout;
            throw Error(`${name} render failed: ${String(detail).trim().slice(0, 2000)}\nPackage versions are installed, but renderer readiness is NOT verified. Browser setup may be incomplete because lifecycle scripts were blocked. Review browser delivery separately; verification does not enable scripts or download browsers.`);
        }
        if (!fs.existsSync(output)) throw Error(`${name} exited successfully but did not create render output.`);
        const bytes = fs.readFileSync(output);
        const valid = bin === 'mmdc'
            ? /<svg[\s>]/.test(bytes.toString('utf8'))
            : bytes.length > 8 && bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
        if (!valid) throw Error(`${name} created invalid render output.`);
        console.log(`Render verified: ${name}`);
    }
} finally {
    fs.rmSync(root, { recursive: true, force: true });
}
'@
Invoke-CheckedCommand -Command $NodeCommand -Arguments @('-e', $verifyRenderers, $globalModules) | Write-Output
Write-Output "Verified all selected pinned dependencies ($($packages.Count)), MCP launchers ($($mcpPackages.Count)), and Mermaid/SVG-to-PNG rendering. Reload the host before using the MCP servers."
