<#
.SYNOPSIS
Refresh marketplaces and report ONE, or apply the latest Mall release.
.DESCRIPTION
Registers Alex Mall if missing and refreshes all registered marketplace catalogs.
Without -Apply, reports the installed and latest Mall versions without changing
plugins or instructions. -Apply installs or updates the latest Mall release,
verifies it, and activates only its owned instructions with conflict checks.
No uninstall, dependency installation or forced activation occurs.
.EXAMPLE
.\reinstall-and-check.ps1
.EXAMPLE
.\reinstall-and-check.ps1 -Apply
#>
[CmdletBinding()]
param(
    [switch]$Apply,
    [string]$Plugin = 'alex-act-one',
    [string]$Marketplace = 'alex-mall',
    [string]$MarketplaceSource = 'fabioc-aloha/Alex_Skill_Mall',
    [string]$CopilotHome = $(if (-not [string]::IsNullOrWhiteSpace($env:COPILOT_HOME)) { $env:COPILOT_HOME } else { Join-Path $HOME '.copilot' }),
    [string]$CopilotCommand = 'copilot',
    [string]$NodeCommand = 'node'
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

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
        Write-Output "Installed ${Plugin}: $($initial.version) (enabled=$($initial.enabled), source=$($initial.source))."
    } else {
        Write-Output "$Plugin is not installed."
    }
    Write-Output "Latest ${Plugin}@${Marketplace}: $latestVersion."
    if (-not $Apply) {
        Write-Output 'Report only: marketplace catalogs were refreshed. Use -Apply to install/update and activate owned instructions. No plugins or instructions were changed.'
        return
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

    Write-Output "Verified $Plugin@$Marketplace $latestVersion and its instruction receipt in $CopilotHome. Restart the host to load it."
} finally {
    if ($null -eq $previousCopilotHome) {
        Remove-Item Env:COPILOT_HOME -ErrorAction SilentlyContinue
    } else {
        $env:COPILOT_HOME = $previousCopilotHome
    }
}