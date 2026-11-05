#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { existsSync, readFileSync, realpathSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import { createRequire } from 'node:module';

const runtimeRoot = process.env.ALEX_ACT_ONE_RUNTIME_ROOT
  || join(homedir(), '.copilot', 'plugin-data', 'alex-act-one', 'runtime');
const routes = {
  flint: {
    expectedVersion: '1.0.1',
    packagePath: join(runtimeRoot, 'node_modules', 'flint-chart-mcp', 'package.json'),
    target: join(runtimeRoot, 'node_modules', 'flint-chart-mcp', 'dist', 'cli.js'),
    library: {
      packagePath: join(runtimeRoot, 'node_modules', 'flint-chart', 'package.json'),
      expectedVersion: '1.0.1',
    },
  },
  playwright: {
    expectedVersion: '0.0.80',
    packagePath: join(runtimeRoot, 'node_modules', '@playwright', 'mcp', 'package.json'),
    target: join(runtimeRoot, 'node_modules', '@playwright', 'mcp', 'cli.js'),
  },
  replicate: {
    expectedVersion: '0.9.0',
    packagePath: join(runtimeRoot, 'node_modules', 'replicate-mcp', 'package.json'),
    target: join(runtimeRoot, 'node_modules', 'replicate-mcp', 'index.js'),
  },
};
const [route, ...args] = process.argv.slice(2);
const config = routes[route];

if (!config) {
  console.error(`Unknown MCP runtime route: ${route || '(missing)'}`);
  process.exit(2);
}
const { expectedVersion, packagePath, target } = config;
if (!existsSync(target)) {
  console.error(`MCP runtime is not provisioned: ${target}`);
  console.error('Run /alex-act-one setup-dependencies.');
  process.exit(3);
}
if (!existsSync(packagePath)) {
  console.error(`MCP runtime package metadata is missing: ${packagePath}`);
  console.error('Run /alex-act-one setup-dependencies.');
  process.exit(3);
}

let installedVersion;
try {
  installedVersion = JSON.parse(readFileSync(packagePath, 'utf8')).version;
} catch (error) {
  console.error(`MCP runtime package metadata is invalid: ${error.message}`);
  process.exit(3);
}
if (installedVersion !== expectedVersion) {
  console.error(`MCP runtime version mismatch for ${route}: expected ${expectedVersion}, found ${installedVersion || '(missing)'}.`);
  console.error('Run /alex-act-one setup-dependencies.');
  process.exit(4);
}
if (config.library) {
  const { packagePath: libraryPath, expectedVersion: libraryVersion } = config.library;
  if (!existsSync(libraryPath)) {
    console.error(`Required flint-chart library metadata is missing: ${libraryPath}`);
    process.exit(3);
  }
  const searchPaths = createRequire(join(dirname(realpathSync(target)), 'runtime-check.cjs')).resolve.paths('flint-chart');
  const serverLibrary = searchPaths.map(directory => join(directory, 'flint-chart', 'package.json')).find(existsSync);
  for (const metadataPath of new Set([libraryPath, serverLibrary || libraryPath])) {
    let actual;
    try {
      actual = JSON.parse(readFileSync(metadataPath, 'utf8')).version;
    } catch (error) {
      console.error(`Invalid flint-chart library metadata: ${error.message}`);
      process.exit(3);
    }
    if (actual !== libraryVersion) {
      console.error(`flint-chart library version mismatch: expected ${libraryVersion}, found ${actual || '(missing)'} at ${metadataPath}.`);
      console.error('Run /alex-act-one setup-dependencies.');
      process.exit(4);
    }
  }
}

const child = spawn(process.execPath, [target, ...args], {
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
