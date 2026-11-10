param(
    [Parameter(Mandatory)] [string]$RepositoryRoot,
    [Parameter(Mandatory)] [string]$TemporaryRoot,
    [Parameter(Mandatory)] [string]$EvidencePath
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$RepositoryRoot = [IO.Path]::GetFullPath($RepositoryRoot)
$TemporaryRoot = [IO.Path]::GetFullPath($TemporaryRoot)
if (Test-Path -LiteralPath $TemporaryRoot) { throw 'Disposable setup root already exists; refusing to overwrite it.' }
if (Test-Path -LiteralPath $EvidencePath) { throw 'Setup evidence already exists; preserve the earlier observation.' }
$script = Join-Path $RepositoryRoot 'install-and-check.ps1'
$realHome = if ($env:COPILOT_HOME) { $env:COPILOT_HOME } else { Join-Path $HOME '.copilot' }
$realRuntime = if ($env:ALEX_ACT_ONE_RUNTIME_ROOT) { $env:ALEX_ACT_ONE_RUNTIME_ROOT } else { Join-Path $HOME '.copilot\plugin-data\alex-act-one\runtime' }
$globalPrefix = (& npm prefix --global).Trim()
if ($LASTEXITCODE -ne 0) { throw 'Could not inspect the original global npm prefix.' }
$npmCli = Join-Path $globalPrefix 'node_modules\npm\bin\npm-cli.js'
if (-not (Test-Path -LiteralPath $npmCli -PathType Leaf)) { throw 'Could not resolve the actual npm CLI before isolating its prefix.' }
$node = (Get-Command node).Source

function Get-StateSnapshot {
    $env:ALEX_SNAPSHOT_HOME = $realHome
    $env:ALEX_SNAPSHOT_RUNTIME = $realRuntime
    $env:ALEX_SNAPSHOT_GLOBAL = $globalPrefix
    $result = @'
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
const home = process.env.ALEX_SNAPSHOT_HOME, runtime = process.env.ALEX_SNAPSHOT_RUNTIME;
const global = process.env.ALEX_SNAPSHOT_GLOBAL, modules = path.join(global, 'node_modules');
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
function snapshot(root) {
    if (!fs.existsSync(root)) return { present: false, files: 0, sha256: null };
    const records = [];
    function walk(file, relative) {
        const stat = fs.lstatSync(file);
        if (stat.isSymbolicLink()) { records.push([relative, 'link', sha(fs.readlinkSync(file))]); return; }
        if (stat.isDirectory()) for (const child of fs.readdirSync(file).sort()) walk(path.join(file, child), relative ? relative + '/' + child : child);
        else records.push([relative, sha(fs.readFileSync(file))]);
    }
    walk(root, '');
    return { present: true, files: records.length, sha256: sha(JSON.stringify(records)) };
}
const targets = {
    installedOne: path.join(home, 'installed-plugins', 'alex-mall', 'alex-act-one'),
    instructions: path.join(home, 'instructions'),
    copilotMcp: path.join(home, 'mcp-config.json'),
    copilotSettings: path.join(home, 'settings.json'),
    privatePackage: path.join(runtime, 'package.json'),
    privateLock: path.join(runtime, 'package-lock.json'),
    privateModules: path.join(runtime, 'node_modules'),
    globalMermaid: path.join(modules, '@mermaid-js', 'mermaid-cli'),
    globalSvgexport: path.join(modules, 'svgexport'),
    npmPolicy: path.join(require('node:os').homedir(), '.npmrc'),
};
if (process.env.LOCALAPPDATA) targets.agencySettings = path.join(process.env.LOCALAPPDATA, 'agency', 'agency.toml');
if (process.env.APPDATA) targets.vscodeMcp = path.join(process.env.APPDATA, 'Code', 'User', 'mcp.json');
console.log(JSON.stringify(Object.fromEntries(Object.entries(targets).map(([role, root]) => [role, snapshot(root)]))));
'@ | node -
    if ($LASTEXITCODE -ne 0) { throw 'State snapshot failed.' }
    return $result | ConvertFrom-Json
}

$before = Get-StateSnapshot
New-Item -ItemType Directory -Path $TemporaryRoot | Out-Null
$profile = Join-Path $TemporaryRoot 'copilot'
$runtime = Join-Path $TemporaryRoot 'runtime'
$prefix = Join-Path $TemporaryRoot 'global'
$log = Join-Path $TemporaryRoot 'apply-output.txt'
$npmAdapter = Join-Path $TemporaryRoot 'selected-npm.ps1'
@"
param([Parameter(ValueFromRemainingArguments=`$true)][string[]]`$Arguments)
& '$($node.Replace("'", "''"))' '$($npmCli.Replace("'", "''"))' @Arguments
exit `$LASTEXITCODE
"@ | Set-Content -LiteralPath $npmAdapter -Encoding utf8
$variables = @('COPILOT_HOME', 'ALEX_ACT_ONE_RUNTIME_ROOT', 'NPM_CONFIG_PREFIX', 'NPM_CONFIG_CACHE',
    'NPM_CONFIG_IGNORE_SCRIPTS', 'PUPPETEER_SKIP_DOWNLOAD')
$originalEnvironment = @{}
foreach ($key in $variables) { $originalEnvironment[$key] = [Environment]::GetEnvironmentVariable($key, 'Process') }
try {
    $env:COPILOT_HOME = $profile
    $env:ALEX_ACT_ONE_RUNTIME_ROOT = $runtime
    $env:NPM_CONFIG_PREFIX = $prefix
    $env:NPM_CONFIG_CACHE = Join-Path $TemporaryRoot 'cache'
    $env:NPM_CONFIG_IGNORE_SCRIPTS = 'true'
    $env:PUPPETEER_SKIP_DOWNLOAD = 'true'
    & pwsh -NoProfile -File $script -Apply -CopilotHome $profile -RuntimeRoot $runtime -NpmCommand $npmAdapter 2>&1 |
        Out-File -LiteralPath $log -Encoding utf8
    $exitCode = $LASTEXITCODE
    $text = Get-Content -LiteralPath $log -Raw
    $expectedRoot = Join-Path $profile 'installed-plugins\alex-mall\alex-act-one'
    $manifestPath = Join-Path $expectedRoot 'plugin.json'
    $receiptPath = Join-Path $profile 'instructions\.alex-act-one-bootstrap.json'
    $ownerMatches = $text.Contains("Dependency owner: $expectedRoot")
    $browserSelected = $text -match 'Browser executable: .+\(installed Edge; renderer processes only\)'
    $mermaid = $text.Contains('Render verified: @mermaid-js/mermaid-cli')
    $svgexport = $text.Contains('Render verified: svgexport')
    $finalSuccess = $text.Contains('Verified all selected pinned dependencies (6)')
    $manifest = if (Test-Path -LiteralPath $manifestPath) { Get-Content -LiteralPath $manifestPath -Raw | ConvertFrom-Json } else { $null }
    $receipt = if (Test-Path -LiteralPath $receiptPath) { Get-Content -LiteralPath $receiptPath -Raw | ConvertFrom-Json } else { $null }
} finally {
    foreach ($key in $variables) { [Environment]::SetEnvironmentVariable($key, $originalEnvironment[$key], 'Process') }
}
$after = Get-StateSnapshot
$unchanged = ($before | ConvertTo-Json -Depth 5 -Compress) -ceq ($after | ConvertTo-Json -Depth 5 -Compress)
$passed = $exitCode -eq 0 -and $ownerMatches -and $browserSelected -and $mermaid -and $svgexport -and
    $finalSuccess -and $manifest -and $receipt -and $manifest.version -eq $receipt.coreVersion -and $unchanged
$summary = [ordered]@{
    schemaVersion = 1
    classification = 'approved task-local real end-to-end installation in disposable locations'
    command = 'actual root install-and-check.ps1 -Apply with disposable CopilotHome/RuntimeRoot/npm prefix/cache'
    shell = 'PowerShell 7'
    childShellVersion = (& pwsh -NoProfile -Command '$PSVersionTable.PSVersion.ToString()').Trim()
    exitCode = $exitCode
    passed = [bool]$passed
    pluginVersion = $(if ($manifest) { $manifest.version } else { $null })
    dependencyOwnerIsDisposableInstalledPlugin = $ownerMatches
    realBootstrapReceiptVersion = $(if ($receipt) { $receipt.coreVersion } else { $null })
    selectedExistingEdge = $browserSelected
    realMermaidSvgVerified = $mermaid
    realSvgexportPngVerified = $svgexport
    fullDependencySuccessReported = $finalSuccess
    lifecycleScripts = 'disabled only for the test process'
    npmInvocation = 'Actual installed npm CLI selected before overriding its disposable global prefix; adapter forwards unmodified arguments.'
    browserDownload = 'disabled; installed Edge reused'
    protectedStateUnchanged = $unchanged
    protectedBefore = $before
    protectedAfter = $after
    limits = @('No live user Apply was run.', 'Real system tools already existed and were checked, not installed.',
        'Protected file roles are hashed, not archived.', 'This proves the observed existing Edge/runtime combination, not arbitrary future browser versions.')
}
$summary | ConvertTo-Json -Depth 8 | Out-File -LiteralPath $EvidencePath -Encoding utf8
[pscustomobject]$summary | Select-Object passed,exitCode,pluginVersion,dependencyOwnerIsDisposableInstalledPlugin,
    selectedExistingEdge,realMermaidSvgVerified,realSvgexportPngVerified,protectedStateUnchanged | Format-List
if (-not $passed) {
    Select-String -LiteralPath $log -Pattern 'Command failed|render failed|Could not find|Exception|Required command|refusing|error code' |
        Select-Object -First 8 | ForEach-Object { $_.Line }
    throw 'Actual disposable root Apply did not pass; inspect only this task-owned log.'
}
