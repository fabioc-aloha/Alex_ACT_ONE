// @ts-check
'use strict';

const { execFileSync } = require('node:child_process');
const { remedyFor } = require('./dependencies.cjs');
const { resolveInvocation } = require('./process-command.cjs');

function envKeyForTool(tool) {
    return `ACT_TOOL_${String(tool).replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}`;
}

function runTool(tool, args, options = {}) {
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
