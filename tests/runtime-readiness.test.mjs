import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, mkdirSync, rmSync, writeFileSync, chmodSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve, delimiter } from 'node:path';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const deps = require('../scripts/shared/dependencies.cjs');
const modulePath = join(ROOT, 'scripts', 'shared', 'runtime-status.cjs');
const launcher = join(ROOT, 'skills', 'setup-dependencies', 'scripts', 'runtime-launcher.mjs');
const provisioner = join(ROOT, 'skills', 'setup-dependencies', 'scripts', 'provision-runtime.mjs');
const targets = { flint: 'dist/cli.js', playwright: 'cli.js', replicate: 'index.js' };
function api() {
    assert.ok(existsSync(modulePath), 'Missing the shared runtime inspection/readiness contract');
    return require(modulePath);
}
function fixture(t) {
    const root = mkdtempSync(join(tmpdir(), 'one readiness-'));
    t.after(() => rmSync(root, { recursive: true, force: true }));
    return root;
}
function installFixture(root, route, { version = deps.MCP_SERVERS[route].version, code, nested } = {}) {
    const spec = deps.MCP_SERVERS[route];
    const dir = join(root, 'node_modules', ...spec.package.split('/'));
    mkdirSync(dirname(join(dir, targets[route])), { recursive: true });
    writeFileSync(join(dir, 'package.json'), JSON.stringify({ name: spec.package, version }));
    writeFileSync(join(dir, targets[route]), code || `console.log(${JSON.stringify(version)});\n`);
    if (spec.library) {
        const library = join(root, 'node_modules', spec.library.package);
        mkdirSync(library, { recursive: true });
        writeFileSync(join(library, 'package.json'), JSON.stringify({ name: spec.library.package, version: spec.library.version }));
        if (nested) {
            const path = join(dir, 'node_modules', spec.library.package);
            mkdirSync(path, { recursive: true });
            writeFileSync(join(path, 'package.json'), JSON.stringify({ name: spec.library.package, version: nested }));
        }
    }
}

test('empty package directories are installed, not ready or launchable', t => {
    const root = fixture(t);
    for (const [route, spec] of Object.entries(deps.MCP_SERVERS)) {
        mkdirSync(join(root, 'node_modules', ...spec.package.split('/')), { recursive: true });
        const state = api().checkRuntime(route, root);
        assert.equal(state.installed, true);
        assert.equal(state.versionMatched, false);
        assert.equal(state.launchable, false);
        assert.equal(state.present, false);
        assert.equal(state.hostConnected, null);
        assert.ok(state.errors.length);
    }
});
test('versions, metadata, and the server-resolved Flint library fail explicitly', t => {
    const root = fixture(t);
    installFixture(root, 'flint', { nested: '0.5.1' });
    assert.equal(api().checkRuntime('flint', root).versionMatched, false);
    const metadata = join(root, 'node_modules', 'flint-chart-mcp', 'package.json');
    writeFileSync(metadata, '{invalid');
    const invalid = api().checkRuntime('flint', root);
    assert.equal(invalid.present, false);
    assert.match(invalid.errors.join(' '), /metadata.*invalid|invalid.*metadata/i);
});
test('a matched but failing entrypoint is not launchable and reports its failure', t => {
    const root = fixture(t);
    installFixture(root, 'playwright', { code: 'console.error("fixture failed");process.exit(7);' });
    const state = api().checkRuntime('playwright', root);
    assert.equal(state.versionMatched, true);
    assert.equal(state.launchable, false);
    assert.equal(state.present, false);
    assert.match(state.errors.join(' '), /fixture failed/);
});
test('readiness launch probes have a real bounded timeout', t => {
    const root = fixture(t);
    installFixture(root, 'playwright', { code: 'setInterval(()=>{},1000);' });
    const state = api().checkRuntime('playwright', root, { timeout: 100 });
    assert.equal(state.launchable, false);
    assert.match(state.errors.join(' '), /timed out|ETIMEDOUT/i);
});
test('a successful version probe does not pretend the host connected', t => {
    const root = fixture(t);
    installFixture(root, 'replicate');
    const state = api().checkRuntime('replicate', root);
    assert.equal(state.present, true);
    assert.equal(state.versionMatched, true);
    assert.equal(state.launchable, true);
    assert.equal(state.hostConnected, null);
    assert.equal(state.connectionStatus, 'not-observed');
    assert.equal(api().runtimeRoot(undefined, { ALEX_ACT_ONE_RUNTIME_ROOT: root }), root);
});
test('provisioner preview honors the environment runtime without installing', t => {
    const root = fixture(t);
    const runtime = join(root, 'absent preview runtime');
    const result = spawnSync(process.execPath, [provisioner, '--server', 'flint'], {
        encoding: 'utf8', timeout: 10000, env: { ...process.env, ALEX_ACT_ONE_RUNTIME_ROOT: runtime },
    });
    assert.equal(result.status, 0, result.stderr);
    assert.ok(result.stdout.includes(`runtime:  ${runtime}`));
    assert.equal(existsSync(runtime), false);
});
test('dependency CLI reports the explicitly selected runtime and rejects empty packages', t => {
    const root = fixture(t);
    for (const spec of Object.values(deps.MCP_SERVERS)) {
        mkdirSync(join(root, 'node_modules', ...spec.package.split('/')), { recursive: true });
    }
    const checker = join(ROOT, 'skills', 'setup-dependencies', 'scripts', 'check-dependencies.cjs');
    const result = spawnSync(process.execPath, [checker, '--json', '--runtime-root', root], {
        encoding: 'utf8', timeout: 20000,
        env: { ...process.env, PATH: '', COPILOT_HOME: join(root, 'profile'), USERPROFILE: root, HOME: root },
    });
    assert.equal(result.status, 0, result.stderr);
    const report = JSON.parse(result.stdout);
    assert.equal(report.mcp.root, root);
    assert.equal(report.mcp.allPresent, false);
    assert.ok(report.mcp.servers.every(server => server.installed && !server.versionMatched &&
        !server.launchable && server.hostConnected === null));
});
for (const route of Object.keys(deps.MCP_SERVERS)) {
    test(`the actual ${route} launcher rejects metadata drift from the shared registry`, t => {
        const root = fixture(t);
        installFixture(root, route, { version: '0.0.0' });
        const result = spawnSync(process.execPath, [launcher, route, '--version'], {
            encoding: 'utf8', env: { ...process.env, ALEX_ACT_ONE_RUNTIME_ROOT: root }, timeout: 5000,
        });
        assert.equal(result.status, 4, result.stderr);
        assert.match(result.stderr, /mismatch/i);
    });
}
for (const mode of ['ready', 'empty', 'wrong-report']) {
    test(`the provisioner verifies installation outcome before success: ${mode}`, t => {
        const root = fixture(t);
        const bin = join(root, 'bin');
        const npm = process.platform === 'win32' ? join(bin, 'node_modules', 'npm', 'bin', 'npm-cli.js') : join(bin, 'npm');
        mkdirSync(dirname(npm), { recursive: true });
        if (process.platform === 'win32') writeFileSync(join(bin, 'npm.cmd'), '@echo off\r\nexit /b 99\r\n');
        writeFileSync(npm, `${process.platform === 'win32' ? '' : '#!' + process.execPath + '\n'}
const fs=require('node:fs'),path=require('node:path'),args=process.argv.slice(2);
const pins=${JSON.stringify(deps.mcpPackages(['flint']))};
if(args[0]==='config'){console.log('https://fixture.invalid/npm/');}
else if(args[0]==='view'){console.log(JSON.stringify(args[1].slice(args[1].lastIndexOf('@')+1)));}
else if(args[0]==='install'){
 const root=args[args.indexOf('--prefix')+1];
 if(path.resolve(root)!==path.resolve(process.env.FIXTURE_RUNTIME))throw Error('Refusing writes outside the test fixture runtime');
 for(const p of pins){const dir=path.join(root,'node_modules',p.name);fs.mkdirSync(dir,{recursive:true});
 if(process.env.FIXTURE_MODE!=='empty'){fs.writeFileSync(path.join(dir,'package.json'),JSON.stringify({name:p.name,version:p.version}));
 if(p.route){const target=path.join(dir,${JSON.stringify(targets.flint)});fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,'console.log('+JSON.stringify(process.env.FIXTURE_MODE==='wrong-report'?'0.0.0':p.version)+');');}}}
}else{console.error('unexpected fixture npm arguments');process.exit(2);}
`);
        if (process.platform !== 'win32') chmodSync(npm, 0o755);
        const runtime = join(root, 'selected runtime');
        const result = spawnSync(process.execPath, [provisioner, '--server', 'flint', '--runtime-root', runtime, '--apply'], {
            encoding: 'utf8', timeout: 15000,
            env: { ...process.env, PATH: bin + delimiter + process.env.PATH,
                ALEX_ACT_ONE_RUNTIME_ROOT: runtime, FIXTURE_RUNTIME: runtime, FIXTURE_MODE: mode },
        });
        assert.equal(existsSync(runtime), true, 'Provisioner did not honor the selected environment runtime');
        if (mode === 'ready') {
            assert.equal(result.status, 0, result.stderr);
            assert.match(result.stdout, /verified.*flint/i);
            assert.match(result.stdout, /host.*not.*observed/i);
        } else {
            assert.notEqual(result.status, 0);
            assert.doesNotMatch(result.stdout, /Provisioned direct runtime/);
            assert.match(result.stderr, /FAIL/);
        }
    });
}
