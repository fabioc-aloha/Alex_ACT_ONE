'use strict';

const { writeFileSync } = require('node:fs');
const { join } = require('node:path');
const { spawnSync } = require('node:child_process');

function runPowerShell(shell, target, parameters, { root, ...options }) {
    const driver = join(root, 'diagnostic-driver.ps1');
    const input = join(root, 'diagnostic-parameters.json');
    writeFileSync(driver, `
param([string]$TargetScript,[string]$ParameterFile)
$ErrorActionPreference = 'Stop'
try {
    $values = Get-Content -LiteralPath $ParameterFile -Raw -Encoding UTF8 | ConvertFrom-Json
    $bound = @{}
    foreach ($property in $values.PSObject.Properties) { $bound[$property.Name] = $property.Value }
    & $TargetScript @bound
    if ($null -ne $LASTEXITCODE) { exit $LASTEXITCODE }
} catch {
    [Console]::Error.WriteLine($_.Exception.Message)
    exit 1
}
`.trimStart());
    writeFileSync(input, JSON.stringify(parameters));
    return spawnSync(shell, ['-NoProfile', '-File', driver, target, input], {
        encoding: 'utf8', timeout: 30000, ...options,
    });
}

module.exports = { runPowerShell };
