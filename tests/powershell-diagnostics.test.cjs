const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { test } = require('node:test');

for (const shell of process.platform === 'win32' ? ['pwsh', 'powershell'] : ['pwsh']) {
    test(`${shell} diagnostic driver preserves named literal parameters and full error messages`, t => {
        const helper = path.join(__dirname, 'helpers', 'powershell.cjs');
        assert.ok(fs.existsSync(helper), 'Missing stable PowerShell test error transport');
        const { runPowerShell } = require(helper);
        const root = fs.realpathSync.native(fs.mkdtempSync(path.join(os.tmpdir(), 'one-ps-diagnostics-')));
        t.after(() => fs.rmSync(root, { recursive: true, force: true }));
        const script = path.join(root, 'target with spaces.ps1');
        fs.writeFileSync(script, "param([string]$Value,[switch]$Fail)\nif($Fail){throw $Value}\nWrite-Output $Value\n");
        const message = 'Unwrapped synthetic error ' + 'detail '.repeat(60) + 'complete cause at the end';
        const pass = runPowerShell(shell, script, { Value: 'spaces & %literal% with quotes" intact' }, { root });
        assert.equal(pass.status, 0, pass.stderr);
        assert.equal(pass.stdout.trim(), 'spaces & %literal% with quotes" intact');
        const fail = runPowerShell(shell, script, { Value: message, Fail: true }, { root });
        assert.equal(fail.status, 1);
        assert.equal(fail.stderr.trim(), message);
    });
}
