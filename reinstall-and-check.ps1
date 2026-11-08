<#
.SYNOPSIS
Install or verify ONE and activate its owned instructions.
.DESCRIPTION
Use -Refresh to refresh the Mall catalog and update an existing enabled
Mall installation before verification. No uninstall or forced activation occurs.
Without -Refresh, mismatched existing installations are preserved.
.EXAMPLE
.\reinstall-and-check.ps1 -Refresh
#>
[CmdletBinding()]
param(
    [switch]$Refresh,
    [string]$Plugin = 'alex-act-one',
    [string]$Marketplace = 'alex-mall',
    [string]$MarketplaceSource = 'fabioc-aloha/Alex_Skill_Mall',
    [string]$ExpectedVersion = (Get-Content -LiteralPath (Join-Path $PSScriptRoot 'plugin.json') -Raw | ConvertFrom-Json).version,
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
        if (-not $marketplaceProperty -or $marketplaceProperty.Value -ne $Marketplace) {
            throw "$Plugin is installed from a different source. Resolve the cross-source installation explicitly; existing state was preserved."
        }
        return $matches[0]
    }
    return $null
}

function Get-RegisteredMarketplace {
    param([Parameter(Mandatory)] [string]$Name)

    $raw = (Invoke-ExternalCommand -Command $CopilotCommand -Arguments @('plugin', 'marketplace', 'list', '--json')) -join "`n"
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

foreach ($command in @($CopilotCommand, $NodeCommand)) {
    if (-not (Get-Command $command -ErrorAction SilentlyContinue)) {
        throw "Required command is unavailable: $command"
    }
}

if ([string]::IsNullOrWhiteSpace($CopilotHome)) {
    throw 'CopilotHome must not be empty.'
}
$CopilotHome = [IO.Path]::GetFullPath($CopilotHome)
$previousCopilotHome = $env:COPILOT_HOME
try {
    $env:COPILOT_HOME = $CopilotHome
    $initial = Get-InstalledPlugin
    if ($initial -and ((-not $Refresh -and $initial.version -ne $ExpectedVersion) -or -not $initial.enabled -or $initial.source -ne 'installed')) {
        throw "Existing $Plugin installation preserved. Automatic replacement/upgrades are disabled; expected enabled $ExpectedVersion from installed, found $($initial.version)."
    }
    $installedRoot = Join-Path (Join-Path (Join-Path $CopilotHome 'installed-plugins') $Marketplace) $Plugin
    if (-not $initial -and (Test-Path -LiteralPath $installedRoot)) {
        throw "Unregistered package files exist at $installedRoot; resolve them explicitly before installation."
    }
    $requiredMarketplaces = @(
        @{ Name = $Marketplace; Source = $MarketplaceSource }
        @{ Name = 'awesome-copilot'; Source = 'github/awesome-copilot' }
        @{ Name = 'copilot-plugins'; Source = 'github/copilot-plugins' }
        @{ Name = 'azure-skills'; Source = 'microsoft/azure-skills' }
        @{ Name = 'fabric-collection'; Source = 'microsoft/skills-for-fabric' }
    )
    $seenMarketplaces = @{}
    foreach ($required in $requiredMarketplaces) {
        if ($seenMarketplaces.ContainsKey($required.Name) -and $seenMarketplaces[$required.Name] -cne $required.Source) {
            throw "Conflicting required sources for marketplace $($required.Name)."
        }
        $seenMarketplaces[$required.Name] = $required.Source
        $registeredMarketplace = Get-RegisteredMarketplace -Name $required.Name
        if ($registeredMarketplace -and $registeredMarketplace.source -cne "GitHub: $($required.Source)") {
            throw "Marketplace source does not match the expected source for $($required.Name): $($registeredMarketplace.source)."
        }
    }
    foreach ($name in $seenMarketplaces.Keys) {
        $registeredMarketplace = Get-RegisteredMarketplace -Name $name
        if (-not $registeredMarketplace) {
            Invoke-ExternalCommand -Command $CopilotCommand -Arguments @('plugin', 'marketplace', 'add', $seenMarketplaces[$name]) | Out-Null
            $registeredMarketplace = Get-RegisteredMarketplace -Name $name
        }
        if (-not $registeredMarketplace) {
            throw "Marketplace registration completed but $name is absent from the Copilot marketplace inventory."
        }
        if ($registeredMarketplace.source -cne "GitHub: $($seenMarketplaces[$name])") {
            throw "Marketplace source does not match the expected source for ${name}: $($registeredMarketplace.source)."
        }
    }

    if ($Refresh) {
        Invoke-ExternalCommand -Command $CopilotCommand -Arguments @('plugin', 'marketplace', 'update', $Marketplace) | Out-Null
    }
    if ($initial -and $Refresh) {
        Invoke-ExternalCommand -Command $CopilotCommand -Arguments @('plugin', 'update', "$Plugin@$Marketplace") | Out-Null
    } elseif (-not $initial) {
        Invoke-ExternalCommand -Command $CopilotCommand -Arguments @('plugin', 'install', "$Plugin@$Marketplace") | Out-Null
    }

    $installed = Get-InstalledPlugin
    if (-not $installed) {
        throw "Install completed but $Plugin@$Marketplace is absent from the Copilot plugin inventory."
    }
    if ($installed.version -ne $ExpectedVersion -or -not $installed.enabled -or $installed.source -ne 'installed') {
        throw "Installed inventory does not match the expected release: expected $Plugin@$Marketplace $ExpectedVersion enabled from installed; got version=$($installed.version), enabled=$($installed.enabled), source=$($installed.source)."
    }

    $installedManifest = Join-Path $installedRoot 'plugin.json'
    if (-not (Test-Path -LiteralPath $installedManifest -PathType Leaf)) {
        throw "Installed plugin manifest is missing: $installedManifest"
    }
    $manifest = Get-Content -LiteralPath $installedManifest -Raw | ConvertFrom-Json
    if ($manifest.name -ne $Plugin -or $manifest.version -ne $ExpectedVersion) {
        throw "Installed plugin manifest does not match $Plugin $ExpectedVersion."
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
    if ($receipt.schemaVersion -ne 2 -or $receipt.bootstrappedBy -ne $Plugin -or $receipt.coreVersion -ne $ExpectedVersion) {
        throw 'Bootstrap receipt identity or version is invalid after apply.'
    }
    $receiptFiles = @($receipt.files)
    $invalidReceiptEntries = @($receiptFiles | Where-Object {
        $_.owner -ne $Plugin -or -not $_.sourceRelativePath.StartsWith('instructions/')
    })
    if ($receiptFiles.Count -lt $bootstrapPlan.expectedFiles -or $invalidReceiptEntries.Count -ne 0) {
        throw 'Bootstrap receipt entries are not fully migrated to the ONE ownership contract.'
    }

    Write-Output "Verified $Plugin@$Marketplace $ExpectedVersion in $CopilotHome. Existing packages were not replaced."
} finally {
    if ($null -eq $previousCopilotHome) {
        Remove-Item Env:COPILOT_HOME -ErrorAction SilentlyContinue
    } else {
        $env:COPILOT_HOME = $previousCopilotHome
    }
}