import assert from 'node:assert/strict';
import { join, resolve } from 'node:path';
import { test } from 'node:test';
import { spawnCommand } from '../scripts/process-launch.mjs';

function probe({ prefixExists = true, status = 0 } = {}) {
    const shim = join('shim', 'npm.cmd');
    const prefixHelper = join('shim', 'node_modules', 'npm', 'bin', 'npm-prefix.js');
    const globalCli = join('global-prefix', 'node_modules', 'npm', 'bin', 'npm-cli.js');
    const bundledCli = join('shim', 'node_modules', 'npm', 'bin', 'npm-cli.js');
    const calls = [];
    const dependencies = {
        platform: 'win32',
        locate: () => ({ status: 0, stdout: shim + '\n' }),
        fileExists: (file) => file === prefixHelper || file === bundledCli || (prefixExists && file === globalCli),
        prefixProbe: (command, args, options) => {
            calls.push({ kind: 'prefix', command, args, options });
            return { status, stdout: 'global-prefix\n', stderr: status ? 'prefix probe failed' : '' };
        },
        launch: (command, args, options) => { calls.push({ kind: 'launch', command, args, options }); return calls; },
    };
    return { calls, dependencies, globalCli, bundledCli, prefixHelper };
}

test('Windows npm launch follows the official shim global-prefix selection without using a shell', () => {
    const fixture = probe();
    spawnCommand('npm', ['install', 'package@1.2.3'], { cwd: 'project', env: { EXAMPLE: 'value' } }, fixture.dependencies);
    assert.equal(fixture.calls[0].kind, 'prefix');
    assert.deepEqual(fixture.calls[0].args, [fixture.prefixHelper]);
    assert.equal(fixture.calls[0].options.shell, false);
    const actual = fixture.calls[1];
    assert.equal(actual.command, process.execPath);
    assert.deepEqual(actual.args, [fixture.globalCli, 'install', 'package@1.2.3']);
    assert.equal(actual.options.shell, false);
    assert.equal(actual.options.cwd, 'project');
    assert.deepEqual(actual.options.env, { EXAMPLE: 'value' });
});

test('Windows npm uses bundled CLI when no prefix CLI exists, matching the official shim', () => {
    const fixture = probe({ prefixExists: false });
    spawnCommand('npm', ['--version'], {}, fixture.dependencies);
    assert.equal(fixture.calls.length, 2, 'Expected prefix discovery before bundled fallback');
    assert.deepEqual(fixture.calls[1].args, [fixture.bundledCli, '--version']);
});

test('failed npm prefix discovery is explicit and never launches an unintended CLI', () => {
    const fixture = probe({ status: 1 });
    assert.throws(() => spawnCommand('npm', ['install', 'package'], {}, fixture.dependencies), /prefix/i);
    assert.equal(fixture.calls.filter(call => call.kind === 'launch').length, 0);
});

test('Windows Copilot npm shims resolve the reviewed package identity without a shell', () => {
    const shim = join('prefix', 'copilot.cmd');
    const directory = join('prefix', 'node_modules', '@github', 'copilot');
    const metadata = join(directory, 'package.json');
    const entrypoint = join(directory, 'npm-loader.js');
    const calls = [];
    const dependencies = {
        platform: 'win32',
        locate: () => ({ status: 0, stdout: shim + '\n' }),
        fileExists: file => [metadata, resolve(entrypoint)].includes(file),
        readMetadata: () => ({ name: '@github/copilot', bin: { copilot: 'npm-loader.js' } }),
        launch: (command, args, options) => { calls.push({ command, args, options }); },
    };
    spawnCommand('copilot', ['plugin', 'list'], {}, dependencies);
    assert.equal(calls[0].command, process.execPath);
    assert.deepEqual(calls[0].args, [resolve(entrypoint), 'plugin', 'list']);
    assert.equal(calls[0].options.shell, false);
    assert.throws(() => spawnCommand('copilot', [], {}, {
        ...dependencies, readMetadata: () => ({ name: 'other-package', bin: 'npm-loader.js' }),
    }), /identity mismatch/);
});
