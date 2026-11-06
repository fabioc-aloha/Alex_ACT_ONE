import assert from 'node:assert/strict';
import { join, resolve } from 'node:path';
import { test } from 'node:test';
import { existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { spawnCommand, resolveWindowsCommand } from '../scripts/process-launch.mjs';

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

test('Windows discovery has a bounded cold-start budget and identifies the failing command', () => {
    let observed;
    assert.throws(() => resolveWindowsCommand('pandoc', {
        platform: 'win32',
        locate: (command, args, options) => {
            observed = { command, args, options };
            return { error: Object.assign(new Error('spawnSync where.exe ETIMEDOUT'), { code: 'ETIMEDOUT' }) };
        },
    }), /pandoc.*30000.*ETIMEDOUT/);
    assert.equal(observed.options.timeout, 30000);
    assert.equal(observed.options.shell, false);
});

test('Windows discovery caches successful paths only within the same environment and directory', () => {
    let lookups = 0;
    const locate = () => { lookups++; return { status: 0, stdout: process.execPath + '\n' }; };
    const options = { platform: 'win32', locate, cwd: 'first', env: { Path: 'tools-a', PATHEXT: '.EXE;.CMD' } };
    assert.equal(resolveWindowsCommand('fixture', options), process.execPath);
    assert.equal(resolveWindowsCommand('fixture', options), process.execPath);
    assert.equal(lookups, 1);
    resolveWindowsCommand('fixture', { ...options, env: { PATH: 'tools-b', PATHEXT: '.EXE;.CMD' } });
    resolveWindowsCommand('fixture', { ...options, cwd: 'second' });
    resolveWindowsCommand('fixture', { ...options, env: { Path: 'tools-a', PATHEXT: '.CMD;.EXE' } });
    assert.equal(lookups, 4, 'PATH, working directory, and PATHEXT changes require fresh discovery');
});

test('failed Windows discovery is never cached or retried implicitly', () => {
    let lookups = 0;
    const options = { platform: 'win32', locate: () => { lookups++; return { status: 1, stdout: '' }; } };
    assert.equal(resolveWindowsCommand('missing', options), 'missing');
    assert.equal(resolveWindowsCommand('missing', options), 'missing');
    assert.equal(lookups, 2);
});

test('Windows discovery invalidates removed cached files and never caches lookup exceptions', t => {
    const root = mkdtempSync(join(tmpdir(), 'one-discovery-'));
    t.after(() => rmSync(root, { recursive: true, force: true }));
    const executable = join(root, 'fixture.exe');
    writeFileSync(executable, 'fixture');
    let lookups = 0;
    const options = { platform: 'win32', locate: () => {
        lookups++;
        if (lookups === 3) return { error: new Error('fixture lookup failure') };
        return { status: 0, stdout: (existsSync(executable) ? executable : process.execPath) + '\n' };
    } };
    assert.equal(resolveWindowsCommand('fixture', options), executable);
    rmSync(executable);
    assert.equal(resolveWindowsCommand('fixture', options), process.execPath);
    const changed = { ...options, cwd: root };
    assert.throws(() => resolveWindowsCommand('fixture', changed), /fixture lookup failure/);
    assert.equal(resolveWindowsCommand('fixture', changed), process.execPath);
    assert.equal(lookups, 4);
});

test('Windows command discovery receives the same environment and cwd as the launched tool', () => {
    let lookup;
    const options = { cwd: 'selected-directory', env: { PATH: 'selected-tools', PATHEXT: '.CMD;.EXE' } };
    spawnCommand('pandoc', ['--version'], options, {
        platform: 'win32',
        locate: (command, args, received) => {
            lookup = received;
            return { status: 0, stdout: process.execPath + '\n' };
        },
        launch: () => {},
    });
    assert.deepEqual(lookup.env, options.env);
    assert.equal(lookup.cwd, options.cwd);
});
