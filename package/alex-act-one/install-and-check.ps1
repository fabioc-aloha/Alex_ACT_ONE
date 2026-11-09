<#
.SYNOPSIS
Report ONE and its tools, or install the latest Mall release and dependencies.
.DESCRIPTION
Registers Alex Mall if missing and refreshes all registered marketplace catalogs.
Without -Apply, reports the installed and latest Mall versions without changing
plugins, instructions or dependencies. -Apply installs or updates the latest Mall
release, bootstraps its owned instructions, then sets up its reviewed npm tools
and missing Pandoc/Pillow. Existing system tools are checked, not upgraded.
Python must already exist; missing Pandoc installation requires Windows winget.
No uninstall, policy bypass, Python installation or forced activation occurs.
.EXAMPLE
.\install-and-check.ps1
.EXAMPLE
.\install-and-check.ps1 -Apply
.EXAMPLE
.\install-and-check.ps1 -VerifyOnly
#>
[CmdletBinding()]
param(
    [switch]$Apply,
    [switch]$VerifyOnly,
    [string]$RegistryTarballPrefix,
    [string]$BrowserExecutablePath,
    [string]$RuntimeRoot = $(if ($env:ALEX_ACT_ONE_RUNTIME_ROOT) { $env:ALEX_ACT_ONE_RUNTIME_ROOT } else { Join-Path $HOME '.copilot\plugin-data\alex-act-one\runtime' }),
    [string]$NpmCommand = 'npm',
    [string]$PythonCommand = 'python',
    [string]$PandocCommand = 'pandoc',
    [string]$WingetCommand = 'winget',
    [string]$Plugin = 'alex-act-one',
    [string]$Marketplace = 'alex-mall',
    [string]$MarketplaceSource = 'fabioc-aloha/Alex_Skill_Mall',
    [string]$CopilotHome = $(if (-not [string]::IsNullOrWhiteSpace($env:COPILOT_HOME)) { $env:COPILOT_HOME } else { Join-Path $HOME '.copilot' }),
    [string]$CopilotCommand = 'copilot',
    [string]$NodeCommand = 'node'
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$setupParameters = $PSBoundParameters

function Assert-SetupOptions {
    if ($Apply -and $VerifyOnly) { throw '-Apply and -VerifyOnly are separate operations.' }
    if ($RegistryTarballPrefix) {
        $prefixUri = $null
        if (-not [Uri]::TryCreate($RegistryTarballPrefix, [UriKind]::Absolute, [ref]$prefixUri) -or
            $prefixUri.Scheme -cne 'https' -or $prefixUri.UserInfo -or $prefixUri.Query -or
            $prefixUri.Fragment -or -not $prefixUri.AbsolutePath.EndsWith('/')) {
            throw 'RegistryTarballPrefix must be an absolute HTTPS URL ending in /, without credentials, query, or fragment.'
        }
    }
    $explicitBrowser = $setupParameters.ContainsKey('BrowserExecutablePath')
    $source = if ($explicitBrowser) { 'BrowserExecutablePath' } else { 'PUPPETEER_EXECUTABLE_PATH' }
    $browser = if ($explicitBrowser) { $BrowserExecutablePath } else { $env:PUPPETEER_EXECUTABLE_PATH }
    if ($explicitBrowser -or $browser) {
        if (-not $browser -or -not [IO.Path]::IsPathRooted($browser) -or
            ($env:OS -eq 'Windows_NT' -and $browser -notmatch '^(?:[A-Za-z]:[\\/]|[\\/]{2})') -or
            -not (Test-Path -LiteralPath $browser -PathType Leaf)) {
            throw "$source must name an existing absolute file path. No installs started."
        }
    }
}

function Invoke-ExternalCommand {
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
        throw "Command failed ($exitCode): $Command $($Arguments -join ' ')`n$($output -join "`n")"
    }
    return $output | ForEach-Object { $_.ToString() }
}

function Get-InstalledPlugin {
    $raw = (Invoke-ExternalCommand -Command $CopilotCommand -Arguments @('plugin', 'list', '--json')) -join "`n"
    if ([string]::IsNullOrWhiteSpace($raw) -or $raw.Trim() -eq 'null') {
        throw 'Copilot returned no usable plugin inventory; refusing installation changes.'
    }
    $plugins = @(($raw | ConvertFrom-Json))
    $matches = @($plugins | Where-Object {
        $null -ne $_ -and $_.name -eq $Plugin
    })
    if ($matches.Count -gt 1) {
        throw "Multiple installed entries match $Plugin. Resolve the duplicates before making changes."
    }
    if ($matches.Count -eq 1) {
        $marketplaceProperty = $matches[0].PSObject.Properties['marketplace']
        if ($Apply -and (-not $marketplaceProperty -or $marketplaceProperty.Value -ne $Marketplace)) {
            throw "$Plugin is installed from a different source. Resolve the cross-source installation explicitly; existing state was preserved."
        }
        return $matches[0]
    }
    return $null
}

function Get-RegisteredMarketplace {
    param([Parameter(Mandatory)] [string]$Name)

    $raw = (Invoke-ExternalCommand -Command $CopilotCommand -Arguments @('plugin', 'marketplace', 'list', '--json')) -join "`n"
    if ([string]::IsNullOrWhiteSpace($raw) -or $raw.Trim() -eq 'null') {
        throw 'Copilot returned no usable marketplace inventory; refusing registration changes.'
    }
    $marketplaces = @(($raw | ConvertFrom-Json))
    $matches = @($marketplaces | Where-Object { $_.name -eq $Name })
    if ($matches.Count -gt 1) {
        throw "Multiple registered marketplaces match $Name. Resolve the duplicate before reinstalling."
    }
    if ($matches.Count -eq 1) {
        return $matches[0]
    }
    return $null
}

function Get-LatestReleaseVersion {
    $uri = "https://raw.githubusercontent.com/$MarketplaceSource/HEAD/.github/plugin/marketplace.json"
    $catalog = Invoke-RestMethod -Uri $uri -TimeoutSec 30 -ErrorAction Stop
    if (-not $catalog -or -not $catalog.PSObject.Properties['plugins']) {
        throw "Marketplace catalog has no plugin inventory: $uri"
    }
    $matches = @($catalog.plugins | Where-Object { $null -ne $_ -and $_.name -eq $Plugin })
    if ($matches.Count -ne 1) {
        throw "Marketplace catalog must contain exactly one $Plugin release; found $($matches.Count)."
    }
    $versionProperty = $matches[0].PSObject.Properties['version']
    if (-not $versionProperty -or $versionProperty.Value -isnot [string] -or
        $versionProperty.Value -cnotmatch '^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$') {
        throw "Marketplace catalog has no valid stable release version for $Plugin."
    }
    return $versionProperty.Value
}

function Invoke-PluginSetup {
Assert-SetupOptions
$requiredCommands = @($CopilotCommand)
if ($Apply) { $requiredCommands += $NodeCommand }
foreach ($command in $requiredCommands) {
    if (-not (Get-Command $command -ErrorAction SilentlyContinue)) {
        throw "Required command is unavailable: $command"
    }
}

if ([string]::IsNullOrWhiteSpace($CopilotHome)) {
    throw 'CopilotHome must not be empty.'
}
if ($MarketplaceSource -cnotmatch '^[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$') {
    throw 'MarketplaceSource must name a GitHub owner/repository.'
}
$CopilotHome = [IO.Path]::GetFullPath($CopilotHome)
$previousCopilotHome = $env:COPILOT_HOME
try {
    $env:COPILOT_HOME = $CopilotHome
    $initial = Get-InstalledPlugin
    if ($Apply -and $initial -and (-not $initial.enabled -or $initial.source -ne 'installed')) {
        throw "Existing $Plugin installation preserved; -Apply requires an enabled installed package. Resolve disabled or unsupported entries explicitly."
    }
    $installedRoot = Join-Path (Join-Path (Join-Path $CopilotHome 'installed-plugins') $Marketplace) $Plugin
    if ($Apply -and -not $initial -and (Test-Path -LiteralPath $installedRoot)) {
        throw "Unregistered package files exist at $installedRoot; resolve them explicitly before installation."
    }
    $registeredMarketplace = Get-RegisteredMarketplace -Name $Marketplace
    if ($registeredMarketplace -and $registeredMarketplace.source -cne "GitHub: $MarketplaceSource") {
        throw "Marketplace source does not match the expected source for ${Marketplace}: $($registeredMarketplace.source)."
    }
    if (-not $registeredMarketplace) {
        Invoke-ExternalCommand -Command $CopilotCommand -Arguments @('plugin', 'marketplace', 'add', $MarketplaceSource) | Out-Null
        $registeredMarketplace = Get-RegisteredMarketplace -Name $Marketplace
        if (-not $registeredMarketplace) {
            throw "Marketplace registration completed but $Marketplace is absent from the Copilot marketplace inventory."
        }
        if ($registeredMarketplace.source -cne "GitHub: $MarketplaceSource") {
            throw "Marketplace source does not match the expected source for ${Marketplace}: $($registeredMarketplace.source)."
        }
    }

    Invoke-ExternalCommand -Command $CopilotCommand -Arguments @('plugin', 'marketplace', 'update') | Out-Null
    $latestVersion = Get-LatestReleaseVersion
    if ($initial) {
        Write-Host "Installed ${Plugin}: $($initial.version) (enabled=$($initial.enabled), source=$($initial.source))."
    } else {
        Write-Host "$Plugin is not installed."
    }
    Write-Host "Latest ${Plugin}@${Marketplace}: $latestVersion."
    if (-not $Apply) {
        Write-Host 'Report only: marketplace catalogs were refreshed. Use -Apply to install/update, bootstrap owned instructions and set up dependencies. No plugins or instructions were changed.'
        if ($initial) {
            $manifestPath = Join-Path $installedRoot 'plugin.json'
            if (-not (Test-Path -LiteralPath $manifestPath -PathType Leaf)) {
                throw 'Cannot resolve the installed plugin owner for dependency checks; installed manifest is missing.'
            }
            $owner = Get-Content -LiteralPath $manifestPath -Raw | ConvertFrom-Json
            if ($owner.name -ne $Plugin -or $owner.version -ne $initial.version) {
                throw 'Installed plugin owner differs from inventory; refusing unrelated dependency pins.'
            }
        } elseif ($VerifyOnly) {
            throw "$Plugin is not installed; strict verification requires an installed package."
        }
        return [pscustomobject]@{ Root = $(if ($initial) { $installedRoot } else { $null }); Version = $(if ($initial) { $initial.version } else { $null }) }
    }
    if ($initial) {
        if ($initial.version -cnotmatch '^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$') {
            throw "Installed version is not a valid stable release: $($initial.version). Existing package was preserved."
        }
        if ([version]$initial.version -gt [version]$latestVersion) {
            throw "Installed $($initial.version) is newer than Mall $latestVersion; refusing to downgrade."
        }
        Invoke-ExternalCommand -Command $CopilotCommand -Arguments @('plugin', 'update', "$Plugin@$Marketplace") | Out-Null
    } else {
        Invoke-ExternalCommand -Command $CopilotCommand -Arguments @('plugin', 'install', "$Plugin@$Marketplace") | Out-Null
    }

    $installed = Get-InstalledPlugin
    if (-not $installed) {
        throw "Install completed but $Plugin@$Marketplace is absent from the Copilot plugin inventory."
    }
    if ($installed.version -ne $latestVersion -or -not $installed.enabled -or $installed.source -ne 'installed') {
        throw "Installed inventory does not match the latest Mall release: expected $Plugin@$Marketplace $latestVersion enabled from installed; got version=$($installed.version), enabled=$($installed.enabled), source=$($installed.source)."
    }

    $installedManifest = Join-Path $installedRoot 'plugin.json'
    if (-not (Test-Path -LiteralPath $installedManifest -PathType Leaf)) {
        throw "Installed plugin manifest is missing: $installedManifest"
    }
    $manifest = Get-Content -LiteralPath $installedManifest -Raw | ConvertFrom-Json
    if ($manifest.name -ne $Plugin -or $manifest.version -ne $latestVersion) {
        throw "Installed plugin manifest does not match $Plugin $latestVersion."
    }

    $bootstrap = Join-Path $installedRoot 'skills/bootstrap-core/scripts/bootstrap-core.cjs'
    if (-not (Test-Path -LiteralPath $bootstrap -PathType Leaf)) {
        throw "Installed bootstrap script is missing: $bootstrap"
    }

    $bootstrapRaw = (Invoke-ExternalCommand -Command $NodeCommand -Arguments @($bootstrap, '--apply')) -join "`n"

    $bootstrapPlan = $bootstrapRaw | ConvertFrom-Json
    if (-not $bootstrapPlan.apply -or -not $bootstrapPlan.verification.receiptCurrent) {
        throw 'Bootstrap apply did not verify a current receipt.'
    }

    $receiptPath = Join-Path $CopilotHome 'instructions/.alex-act-one-bootstrap.json'
    if (-not (Test-Path -LiteralPath $receiptPath -PathType Leaf)) {
        throw "Bootstrap receipt is missing: $receiptPath"
    }
    $receipt = Get-Content -LiteralPath $receiptPath -Raw | ConvertFrom-Json
    if ($receipt.schemaVersion -ne 2 -or $receipt.bootstrappedBy -ne $Plugin -or $receipt.coreVersion -ne $latestVersion) {
        throw 'Bootstrap receipt identity or version is invalid after apply.'
    }
    $receiptFiles = @($receipt.files)
    $invalidReceiptEntries = @($receiptFiles | Where-Object {
        $_.owner -ne $Plugin -or -not $_.sourceRelativePath.StartsWith('instructions/')
    })
    if ($receiptFiles.Count -lt $bootstrapPlan.expectedFiles -or $invalidReceiptEntries.Count -ne 0) {
        throw 'Bootstrap receipt entries are not fully migrated to the ONE ownership contract.'
    }

    Write-Host "Verified $Plugin@$Marketplace $latestVersion and its instruction receipt in $CopilotHome. Restart the host to load it."
    return [pscustomobject]@{ Root = $installedRoot; Version = $latestVersion }
} finally {
    if ($null -eq $previousCopilotHome) {
        Remove-Item Env:COPILOT_HOME -ErrorAction SilentlyContinue
    } else {
        $env:COPILOT_HOME = $previousCopilotHome
    }
}
}

function Invoke-DependencySetup {
    param([Parameter(Mandatory)] [string]$PluginRoot)

    Assert-SetupOptions
    $PluginRoot = [IO.Path]::GetFullPath($PluginRoot)
    $browserSource = if ($setupParameters.ContainsKey('BrowserExecutablePath')) {
        'BrowserExecutablePath'
    } elseif ($null -ne $BrowserExecutablePath -and $BrowserExecutablePath -ne '') {
        'BrowserExecutablePath'
    } else {
        'PUPPETEER_EXECUTABLE_PATH'
    }
    $effectiveBrowser = if ($browserSource -eq 'BrowserExecutablePath') { $BrowserExecutablePath } else { $env:PUPPETEER_EXECUTABLE_PATH }
    if ($effectiveBrowser) { $effectiveBrowser = [IO.Path]::GetFullPath($effectiveBrowser) }

    function Invoke-CheckedCommand {
        param([string]$Command, [string[]]$Arguments, [string]$InputText)
        $previousPreference = $ErrorActionPreference
        try {
            $ErrorActionPreference = 'Continue'
            $output = if ($PSBoundParameters.ContainsKey('InputText')) {
                $InputText | & $Command @Arguments 2>&1
            } else {
                & $Command @Arguments 2>&1
            }
            $exitCode = $LASTEXITCODE
        } finally { $ErrorActionPreference = $previousPreference }
        if ($exitCode -ne 0) {
            $detail = $output -join "`n"
            $guidance = @()
            if ($Command -eq $NpmCommand -and $Arguments[0] -eq 'install') {
                if ($detail -match '\bEALLOWREMOTE\b') {
                    if ($RegistryTarballPrefix) {
                        $guidance += 'Tarball routing was already selected. Check whether the confirmed prefix covers the rejected URL, including transitive packages. No automatic retry or broader routing was attempted.'
                    } else {
                        $guidance += 'npm refused a remote tarball. Inspect dist.tarball metadata through the configured registry. With npm 12 or later, preview -RegistryTarballPrefix <confirmed-HTTPS-prefix/> to route matching URLs through that registry; apply separately after approval. Do not enable remote fetching or switch registries.'
                    }
                }
                if ($detail -match '\b(?:EPERM|EACCES)\b') {
                    $guidance += 'Close applications using the affected package before retrying. If access remains denied, investigate its permissions. No package directories were deleted by this helper.'
                }
            }
            throw "Command failed ($exitCode): $Command $($Arguments -join ' ')`n$detail`n$($guidance -join "`n")`nDependency installation or verification stopped. Partial installations may remain. No registry or fetch-policy settings were changed."
        }
        return $output | ForEach-Object { $_.ToString() }
    }

    function Get-PandocState {
        $command = Get-Command $PandocCommand -ErrorAction SilentlyContinue | Select-Object -First 1
        $resolved = if ($command) { $command.Source } else { $null }
        if (-not $resolved -and $PandocCommand -eq 'pandoc' -and $env:OS -eq 'Windows_NT') {
            foreach ($scope in @('User', 'Machine')) {
                foreach ($directory in ([Environment]::GetEnvironmentVariable('Path', $scope) -split ';')) {
                    if ([string]::IsNullOrWhiteSpace($directory)) { continue }
                    $candidate = Join-Path ([Environment]::ExpandEnvironmentVariables($directory.Trim('"'))) 'pandoc.exe'
                    if (Test-Path -LiteralPath $candidate -PathType Leaf) { $resolved = $candidate; break }
                }
                if ($resolved) { break }
            }
        }
        if (-not $resolved) { return [pscustomobject]@{ present = $false; version = $null; command = $null } }
        $text = (Invoke-CheckedCommand -Command $resolved -Arguments @('--version')) -join "`n"
        if ($text -notmatch '(?m)^pandoc ([0-9][^\s]*)') { throw 'Pandoc returned no recognizable version.' }
        return [pscustomobject]@{ present = $true; version = $Matches[1]; command = $resolved }
    }

    function Get-PillowState {
        if (-not (Get-Command $PythonCommand -ErrorAction SilentlyContinue)) {
            return [pscustomobject]@{ present = $false; version = $null; executable = $null }
        }
        $probe = @'
import importlib.util, json, sys
from importlib.metadata import version
present = importlib.util.find_spec('PIL') is not None
if present:
    from PIL import Image
print(json.dumps({'present': present, 'version': version('Pillow') if present else None, 'executable': sys.executable}))
'@
        $state = ((Invoke-CheckedCommand -Command $PythonCommand -Arguments @('-B', '-c', $probe)) -join "`n") | ConvertFrom-Json
        if (-not $state.PSObject.Properties['present'] -or $state.present -isnot [bool] -or -not $state.executable -or
            ($state.present -and -not $state.version)) { throw 'Selected Python returned invalid Pillow status.' }
        return $state
    }

    foreach ($command in @($NpmCommand, $NodeCommand)) {
        if (-not (Get-Command $command -ErrorAction SilentlyContinue)) { throw "Required command is unavailable: $command" }
    }
    $RuntimeRoot = [IO.Path]::GetFullPath($RuntimeRoot)
    $registry = ((Invoke-CheckedCommand -Command $NpmCommand -Arguments @('config', 'get', 'registry')) -join "`n").Trim()
    $globalPrefix = ((Invoke-CheckedCommand -Command $NpmCommand -Arguments @('prefix', '--global')) -join "`n").Trim()
    if (-not $registry -or -not [IO.Path]::IsPathRooted($globalPrefix)) { throw 'npm must report a registry and an absolute global prefix.' }
    $dependencyRegistry = Join-Path $PluginRoot 'scripts\shared\dependencies.cjs'
    $readPins = @'
const deps = require(process.argv[1]);
const packages = deps.mcpPackages().map(pkg => ({
    name: pkg.name, version: pkg.version, scope: 'private', route: pkg.route
}));
for (const key of ['jszip', 'mmdc', 'svgexport']) {
    const tool = deps.TOOLS[key];
    packages.push({ name: tool.package, version: tool.version,
        scope: tool.kind === 'npm-global' ? 'global' : 'private', route: null });
}
const routingAvailable = typeof deps.registryTarballPrefix === 'function';
console.log(JSON.stringify({ packages, routingAvailable,
    detectedTarballPrefix: routingAvailable ? deps.registryTarballPrefix(process.argv[2]) : null,
    pandocInstall: deps.TOOLS.pandoc.install, pillowPackage: deps.TOOLS.Pillow.package }));
'@
    $configuration = ((Invoke-CheckedCommand -Command $NodeCommand -Arguments @('-e', $readPins, $dependencyRegistry, $registry)) -join "`n") | ConvertFrom-Json
    $packages = @($configuration.packages)
    $routingSource = 'explicit prefix'
    if (-not $RegistryTarballPrefix -and $configuration.detectedTarballPrefix) {
        $RegistryTarballPrefix = $configuration.detectedTarballPrefix
        $routingSource = 'detected Microsoft proxy'
    }
    if ($Apply -and $RegistryTarballPrefix) {
        $npmVersion = ((Invoke-CheckedCommand -Command $NpmCommand -Arguments @('--version')) -join "`n").Trim()
        if ($npmVersion -notmatch '^(\d+)\.\d+\.\d+' -or [int]$Matches[1] -lt 12) {
            throw 'Tarball routing requires npm 12 or later for full URL-prefix replacement.'
        }
    }
    foreach ($package in $packages) {
        if (-not $package.name -or -not $package.version) { throw 'The dependency registry must provide an exact package name and version.' }
    }
    Write-Output "Dependency owner: $PluginRoot"
    Write-Output "Registry: $registry"
    Write-Output "Private runtime: $RuntimeRoot"
    Write-Output "Global npm prefix: $globalPrefix"
    if (-not $configuration.routingAvailable) {
        Write-Output 'Automatic tarball routing is unavailable in this older plugin registry; use a confirmed explicit prefix if needed. No registry policy was changed.'
    }
    if ($effectiveBrowser) { Write-Output "Browser executable: $effectiveBrowser ($browserSource; renderer processes only)" }
    else { Write-Output 'Browser executable: Puppeteer default; no browser auto-detection.' }
    if ($RegistryTarballPrefix) {
        Write-Output "Tarball routing: $RegistryTarballPrefix -> $registry ($routingSource; per-install URL-prefix replacement only)"
        if ($VerifyOnly) { Write-Output 'VerifyOnly does not fetch packages or apply tarball routing.' }
    }
    $globalModules = if ($env:OS -eq 'Windows_NT') { Join-Path $globalPrefix 'node_modules' } else { Join-Path $globalPrefix 'lib\node_modules' }
    $readInstalled = @'
const fs = require('node:fs'), path = require('node:path');
const packages = JSON.parse(Buffer.from(process.argv[3], 'base64').toString('utf8'));
console.log(JSON.stringify(packages.map(pkg => {
    const file = path.join(pkg.scope === 'global' ? process.argv[2] : path.join(process.argv[1], 'node_modules'), pkg.name, 'package.json');
    if (!fs.existsSync(file)) return { ...pkg, actual: null, status: 'missing' };
    const actual = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (actual.name !== pkg.name || typeof actual.version !== 'string') throw Error(`Invalid installed package metadata: ${file}`);
    return { ...pkg, actual: actual.version, status: actual.version === pkg.version ? 'matched' : 'mismatched' };
})));
'@
    $packageJson = ConvertTo-Json -InputObject $packages -Compress
    $packageInput = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($packageJson))
    $installedPackages = ((Invoke-CheckedCommand -Command $NodeCommand -Arguments @('-e', $readInstalled, $RuntimeRoot, $globalModules, $packageInput)) -join "`n") | ConvertFrom-Json
    foreach ($package in @($installedPackages)) {
        Write-Output "$($package.scope): $($package.name)@$($package.version); installed=$($package.actual); status=$($package.status)"
    }
    $pandoc = Get-PandocState
    $pillow = Get-PillowState
    Write-Output "Pandoc: $(if ($pandoc.present) { $pandoc.version } else { 'missing' })"
    Write-Output "Python: $(if ($pillow.executable) { $pillow.executable } else { 'missing; install Python separately' })"
    Write-Output "Pillow: $(if ($pillow.present) { $pillow.version } else { 'missing' })"
    Write-Output 'These tools support particular capabilities; core reasoning does not require the full set. Optional plugins and Python installation are excluded.'
    if (-not $Apply -and -not $VerifyOnly) {
        Write-Output 'Report only; nothing installed or changed. Use -Apply for the reviewed npm pins and missing Pandoc/Pillow, or -VerifyOnly for strict readiness checks.'
        return
    }
    if (-not $pillow.executable) { throw 'Python is required for Pillow setup; install Python separately or select an existing interpreter with -PythonCommand. No dependency installs started.' }
    $pandocInstallArguments = $null
    if ($Apply) {
        if (-not $pandoc.present) {
            if ($env:OS -ne 'Windows_NT') { throw 'Install Pandoc manually on this platform before applying; automatic missing-Pandoc installation supports Windows winget only.' }
            if (-not (Get-Command $WingetCommand -ErrorAction SilentlyContinue)) { throw 'Windows winget is required to install missing Pandoc. No dependency installs started.' }
            $tokens = @($configuration.pandocInstall.win32 -split ' ')
            if ($tokens.Count -ne 3 -or $tokens[0] -ne 'winget' -or $tokens[1] -ne 'install') { throw 'Unsupported Pandoc installation command in the selected plugin registry.' }
            $pandocInstallArguments = @('install', '--id', $tokens[2], '--exact')
        }
        if (-not $pillow.present) {
            Invoke-CheckedCommand -Command $PythonCommand -Arguments @('-m', 'pip', '--version') | Write-Output
        }
        foreach ($package in $packages) {
            $spec = "$($package.name)@$($package.version)"
            $available = @(((Invoke-CheckedCommand -Command $NpmCommand -Arguments @('view', $spec, 'version', '--json')) -join "`n") | ConvertFrom-Json)
            if ($available.Count -ne 1 -or $available[0] -cne $package.version) { throw "The configured registry did not confirm the exact pinned version: $spec. No installs started." }
        }
        Write-Output 'All exact pins are listed by the configured registry; downloads may still fail.'
        if ($pandocInstallArguments) {
            Invoke-CheckedCommand -Command $WingetCommand -Arguments $pandocInstallArguments | Write-Output
            $pandoc = Get-PandocState
            if (-not $pandoc.present) { throw 'Pandoc installation verification failed; its command is still missing. Resolve its installation/PATH explicitly.' }
        }
        if (-not $pillow.present) {
            Invoke-CheckedCommand -Command $PythonCommand -Arguments @('-m', 'pip', 'install', $configuration.pillowPackage) | Write-Output
            $pillow = Get-PillowState
            if (-not $pillow.present) { throw 'Pillow installation verification failed in the selected Python.' }
        }
        foreach ($package in $packages) {
            $arguments = @('install', '--save-exact', '--prefer-offline', '--no-audit', '--no-fund')
            if ($RegistryTarballPrefix) { $arguments += "--replace-registry-host=$RegistryTarballPrefix" }
            if ($package.scope -eq 'global') { $arguments += '--global' } else { $arguments += @('--prefix', $RuntimeRoot) }
            $arguments += "$($package.name)@$($package.version)"
            Invoke-CheckedCommand -Command $NpmCommand -Arguments $arguments | Write-Output
        }
    }
    if (-not $pandoc.present -or -not $pillow.present) { throw 'Pandoc or Pillow is missing; full dependency readiness is not verified. Use -Apply or complete their setup separately.' }
    Write-Output "Verified Pandoc $($pandoc.version) and Pillow $($pillow.version) in the selected Python."
    foreach ($package in $packages) {
        $modules = if ($package.scope -eq 'global') { $globalModules } else { Join-Path $RuntimeRoot 'node_modules' }
        $metadataPath = Join-Path (Join-Path $modules $package.name) 'package.json'
        $metadata = Get-Content -LiteralPath $metadataPath -Raw | ConvertFrom-Json
        if ($metadata.name -cne $package.name -or $metadata.version -cne $package.version) { throw "Installed package verification failed: $($package.name)@$($package.version)." }
    }
    $previousRuntime = $env:ALEX_ACT_ONE_RUNTIME_ROOT
    $mcpPackages = @($packages | Where-Object { $_.route })
    try {
        $env:ALEX_ACT_ONE_RUNTIME_ROOT = $RuntimeRoot
        $launcher = Join-Path $PluginRoot 'skills\setup-dependencies\scripts\runtime-launcher.mjs'
        foreach ($package in $mcpPackages) {
            $reported = ((Invoke-CheckedCommand -Command $NodeCommand -Arguments @($launcher, $package.route, '--version')) -join "`n").Trim()
            if ($reported -cne $package.version -and $reported -cne "Version $($package.version)") { throw "MCP launcher reported an unexpected version for $($package.route): $reported" }
        }
    } finally {
        if ($null -eq $previousRuntime) { Remove-Item Env:ALEX_ACT_ONE_RUNTIME_ROOT -ErrorAction SilentlyContinue }
        else { $env:ALEX_ACT_ONE_RUNTIME_ROOT = $previousRuntime }
    }
    Write-Output "All $($packages.Count) selected pinned package versions and $($mcpPackages.Count) MCP launchers are verified. Checking renderer readiness."
    $verifyRenderers = @'
const fs = require('node:fs'), os = require('node:os'), path = require('node:path');
const { spawnSync } = require('node:child_process');
const modules = process.argv[2], browserExecutable = process.argv[3];
const rendererEnv = browserExecutable ? { ...process.env, PUPPETEER_EXECUTABLE_PATH: browserExecutable } : process.env;
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'one-render-verify-'));
try {
    const diagram = path.join(root, 'diagram.mmd'), svgInput = path.join(root, 'input.svg');
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
            encoding: 'utf8', timeout: 30000, maxBuffer: 1024 * 1024, env: rendererEnv
        });
        if (result.error || result.status !== 0) {
            const detail = result.error?.message || result.stderr || result.stdout;
            throw Error(`${name} render failed: ${String(detail).trim().slice(0, 2000)}\nPackage versions are installed, but renderer readiness is NOT verified. Browser setup may be incomplete because lifecycle scripts were blocked. To check a compatible existing browser without reinstalling packages, rerun with -VerifyOnly -BrowserExecutablePath <absolute-browser-path>. Review browser delivery separately; verification does not enable scripts or download browsers.`);
        }
        if (!fs.existsSync(output)) throw Error(`${name} exited successfully but did not create render output.`);
        const bytes = fs.readFileSync(output);
        const valid = bin === 'mmdc' ? /<svg[\s>]/.test(bytes.toString('utf8'))
            : bytes.length > 8 && bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
        if (!valid) throw Error(`${name} created invalid render output.`);
        console.log(`Render verified: ${name}`);
    }
} finally { fs.rmSync(root, { recursive: true, force: true }); }
'@
    $rendererArguments = @('-', $globalModules)
    if ($effectiveBrowser) { $rendererArguments += $effectiveBrowser }
    Invoke-CheckedCommand -Command $NodeCommand -Arguments $rendererArguments -InputText $verifyRenderers | Write-Output
    Write-Output "Verified all selected pinned dependencies ($($packages.Count)), MCP launchers ($($mcpPackages.Count)), Pandoc/Pillow probes, and Mermaid/SVG-to-PNG rendering. Reload the host before using the MCP servers."
}

function Invoke-InstallAndCheck {
    Assert-SetupOptions
    $owner = Invoke-PluginSetup
    $dependencyRoot = $owner.Root
    if (-not $dependencyRoot) {
        $dependencyRoot = $PSScriptRoot
        Write-Host 'Plugin is absent: dependency status below uses checkout pins for planning only; -Apply will use the installed release.'
    }
    Invoke-DependencySetup -PluginRoot $dependencyRoot
}

if ($MyInvocation.InvocationName -ne '.') { Invoke-InstallAndCheck }