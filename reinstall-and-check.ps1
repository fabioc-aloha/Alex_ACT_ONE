[CmdletBinding()]
param(
    [string]$Plugin = 'alex-act-one',
    [string]$Marketplace = 'alex-mall',
    [string]$ExpectedVersion = (Get-Content -LiteralPath (Join-Path $PSScriptRoot 'plugin.json') -Raw | ConvertFrom-Json).version,
    [string]$CopilotHome = (Join-Path $HOME '.copilot'),
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

    $output = & $Command @Arguments 2>&1
    $exitCode = $LASTEXITCODE
    if ($exitCode -ne 0) {
        throw "Command failed ($exitCode): $Command $($Arguments -join ' ')`n$($output -join "`n")"
    }
    return $output
}

function Get-InstalledPlugin {
    $raw = (Invoke-ExternalCommand -Command $CopilotCommand -Arguments @('plugin', 'list', '--json')) -join "`n"
    $plugins = @($raw | ConvertFrom-Json)
    $matches = @($plugins | Where-Object {
        $_.name -eq $Plugin -and $_.marketplace -eq $Marketplace
    })
    if ($matches.Count -gt 1) {
        throw "Multiple installed entries match $Plugin@$Marketplace. Resolve the duplicate before reinstalling."
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

$initial = Get-InstalledPlugin
if ($initial) {
    Invoke-ExternalCommand -Command $CopilotCommand -Arguments @('plugin', 'uninstall', "$Plugin@$Marketplace") | Out-Null
}

Invoke-ExternalCommand -Command $CopilotCommand -Arguments @('plugin', 'install', "$Plugin@$Marketplace") | Out-Null

$installed = Get-InstalledPlugin
if (-not $installed) {
    throw "Install completed but $Plugin@$Marketplace is absent from the Copilot plugin inventory."
}
if ($installed.version -ne $ExpectedVersion -or -not $installed.enabled -or $installed.source -ne 'installed') {
    throw "Installed inventory does not match the expected release: expected $Plugin@$Marketplace $ExpectedVersion enabled from installed; got version=$($installed.version), enabled=$($installed.enabled), source=$($installed.source)."
}

$installedRoot = Join-Path (Join-Path (Join-Path $CopilotHome 'installed-plugins') $Marketplace) $Plugin
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

$previousCopilotHome = $env:COPILOT_HOME
try {
    $env:COPILOT_HOME = $CopilotHome
    $bootstrapRaw = (Invoke-ExternalCommand -Command $NodeCommand -Arguments @($bootstrap, '--apply')) -join "`n"
} finally {
    if ($null -eq $previousCopilotHome) {
        Remove-Item Env:COPILOT_HOME -ErrorAction SilentlyContinue
    } else {
        $env:COPILOT_HOME = $previousCopilotHome
    }
}

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
if ($receiptFiles.Count -ne $bootstrapPlan.expectedFiles -or $invalidReceiptEntries.Count -ne 0) {
    throw 'Bootstrap receipt entries are not fully migrated to the ONE ownership contract.'
}

Write-Output "Reinstalled and verified $Plugin@$Marketplace $ExpectedVersion."