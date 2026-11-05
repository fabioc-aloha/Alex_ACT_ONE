'use strict';

const { spawnSync } = require('node:child_process');
const { existsSync, readFileSync, realpathSync } = require('node:fs');
const { createRequire } = require('node:module');
const { homedir } = require('node:os');
const { dirname, join, resolve } = require('node:path');
const { MCP_SERVERS } = require('./dependencies.cjs');

function runtimeRoot(explicit, env = process.env) {
    return resolve(explicit || env.ALEX_ACT_ONE_RUNTIME_ROOT ||
        join(homedir(), '.copilot', 'plugin-data', 'alex-act-one', 'runtime'));
}

function runtimeRoutes(root) {
    return Object.fromEntries(Object.entries(MCP_SERVERS).map(([route, spec]) => [route, {
        expectedVersion: spec.version,
        packagePath: join(root, 'node_modules', ...spec.package.split('/'), 'package.json'),
        target: join(root, 'node_modules', ...spec.package.split('/'), ...spec.entrypoint.split('/')),
        ...(spec.library ? { library: {
            packagePath: join(root, 'node_modules', ...spec.library.package.split('/'), 'package.json'),
            expectedVersion: spec.library.version,
        } } : {}),
    }]));
}

function inspectRuntime(route, root = runtimeRoot()) {
    const spec = MCP_SERVERS[route];
    if (!spec) throw new Error(`Unknown MCP runtime route: ${route || '(missing)'}`);
    const config = runtimeRoutes(root)[route];
    const state = {
        key: route, ...spec, root,
        installed: existsSync(dirname(config.packagePath)),
        installedVersion: null, versionMatched: false,
        entrypointExists: existsSync(config.target), target: config.target,
        launchable: false, hostConnected: null, connectionStatus: 'not-observed',
        present: false, errors: [], exitCode: 0,
    };
    const fail = (message, code = 3) => {
        state.errors.push(message);
        if (!state.exitCode) state.exitCode = code;
    };
    function version(file, expected, label) {
        if (!existsSync(file)) { fail(`${label} metadata is missing: ${file}`); return null; }
        let actual;
        try { actual = JSON.parse(readFileSync(file, 'utf8')).version; }
        catch (error) { fail(`${label} metadata is invalid: ${error.message}`); return null; }
        if (typeof actual !== 'string' || actual !== expected) {
            fail(`${label} version mismatch: expected ${expected}, found ${actual || '(missing)'} at ${file}`, 4);
        }
        return actual;
    }
    state.installedVersion = version(config.packagePath, config.expectedVersion, `${route} package`);
    if (config.library) {
        version(config.library.packagePath, config.library.expectedVersion, 'flint-chart library');
        if (state.entrypointExists) {
            try {
                const search = createRequire(join(dirname(realpathSync(config.target)), 'runtime-check.cjs'))
                    .resolve.paths('flint-chart');
                const resolved = search.map(directory => join(directory, 'flint-chart', 'package.json')).find(existsSync);
                if (!resolved) fail('Required flint-chart library cannot be resolved by the server');
                else if (resolved !== config.library.packagePath) version(resolved, config.library.expectedVersion, 'flint-chart library');
            } catch (error) {
                fail(`flint-chart library resolution failed: ${error.message}`);
            }
        }
    }
    state.versionMatched = state.errors.length === 0;
    if (!state.entrypointExists) fail(`MCP runtime is not provisioned: ${config.target}`);
    state.present = state.errors.length === 0;
    if (state.present) state.launchable = null;
    return state;
}

function checkRuntime(route, root = runtimeRoot(), { timeout = 10000, env = process.env, probe = spawnSync } = {}) {
    const state = inspectRuntime(route, root);
    if (!state.present) return state;
    const result = probe(process.execPath, [state.target, '--version'], {
        env: { ...env, ALEX_ACT_ONE_RUNTIME_ROOT: root },
        encoding: 'utf8', windowsHide: true, shell: false,
        timeout, maxBuffer: 1024 * 1024,
    });
    const versionPattern = new RegExp(`(^|[^\\d.])${state.version.replace(/\./g, '\\.')}([^\\d.]|$)`);
    state.launchable = !result.error && result.status === 0 && versionPattern.test(result.stdout || '');
    if (!state.launchable) {
        const detail = result.error?.code === 'ETIMEDOUT' ? `timed out after ${timeout} ms`
            : result.error?.message || result.stderr?.trim() ||
                `exit ${result.status}; version report did not match ${state.version}: ${String(result.stdout || '').trim()}`;
        state.errors.push(`${route} launch probe failed: ${detail}`);
        state.exitCode = 5;
    }
    state.present = state.launchable;
    return state;
}

module.exports = { runtimeRoot, runtimeRoutes, inspectRuntime, checkRuntime };
