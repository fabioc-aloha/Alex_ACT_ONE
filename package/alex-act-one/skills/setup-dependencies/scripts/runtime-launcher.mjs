#!/usr/bin/env node

import { spawn } from 'node:child_process';
import runtime from '../../../scripts/shared/runtime-status.cjs';

const [route, ...args] = process.argv.slice(2);
let state;
try {
  state = runtime.inspectRuntime(route);
} catch (error) {
  console.error(error.message);
  process.exit(2);
}
if (!state.present) {
  console.error(state.errors.join('\n'));
  console.error('Run /alex-act-one setup-dependencies.');
  process.exit(state.exitCode);
}

const child = spawn(process.execPath, [state.target, ...args], {
  env: process.env,
  stdio: 'inherit',
  windowsHide: true,
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => child.kill(signal));
}
child.on('error', (error) => {
  console.error(`MCP runtime launch failed: ${error.message}`);
  process.exit(1);
});
child.on('exit', (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  else process.exit(code ?? 1);
});
