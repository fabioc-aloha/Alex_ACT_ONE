// @ts-check
'use strict';

const { execFileSync } = require('node:child_process');
const { statSync } = require('node:fs');
const { basename, join } = require('node:path');
const { remedyFor } = require('./dependencies.cjs');
const { resolveInvocation } = require('./process-command.cjs');

function envKeyForTool(tool) {
    return `ACT_TOOL_${String(tool).replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}`;
}

function withRendererBrowser(tool, options) {
    if (process.platform !== 'win32' || !/^(?:mmdc|svgexport)(?:\.(?:cmd|bat|exe|ps1))?$/i.test(basename(tool))) return options;
    const env = options.env || process.env;
    const windowsEnv = Object.fromEntries(Object.entries(env).map(([key, value]) => [key.toUpperCase(), value]));
    if (windowsEnv.PUPPETEER_EXECUTABLE_PATH) return options;
    for (const directory of [windowsEnv['PROGRAMFILES(X86)'], windowsEnv.PROGRAMFILES, windowsEnv.LOCALAPPDATA]) {
        if (!directory || !/^(?:[a-z]:[\\/]|[\\/]{2})/i.test(directory)) continue;
        const executable = join(directory, 'Microsoft', 'Edge', 'Application', 'msedge.exe');
        if (statSync(executable, { throwIfNoEntry: false })?.isFile()) {
            return { ...options, env: { ...windowsEnv, PUPPETEER_EXECUTABLE_PATH: executable } };
        }
    }
    return options;
}

function runTool(tool, args, options = {}) {
    options = withRendererBrowser(tool, options);
    const overrideScript = process.env[envKeyForTool(tool)];
    if (overrideScript) {
        return execFileSync(process.execPath, [overrideScript, ...args], { ...options, shell: false });
    }
    const invocation = resolveInvocation(tool, args, options);
    try {
        return execFileSync(invocation.command, invocation.args, { ...options, shell: false });
    } catch (error) {
        if (error && error.code === 'ENOENT') throw new Error(remedyFor(tool));
        throw error;
    }
}

module.exports = { runTool, envKeyForTool };
