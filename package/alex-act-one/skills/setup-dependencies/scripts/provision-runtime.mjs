#!/usr/bin/env node

import { mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { spawnCommand } from '../../../scripts/process-launch.mjs';
import deps from '../../../scripts/shared/dependencies.cjs';
import runtimeStatus from '../../../scripts/shared/runtime-status.cjs';

// Read from the shared registry rather than restating the pins. Two copies of
// the same three versions drift silently, and the copy a reader trusts is
// whichever they happened to open.
const optionValues = new Map([
  ['--runtime-root', 'runtimeRoot'],
  ['--server', 'server'],
  ['--registry-tarball-prefix', 'tarballPrefix'],
]);
const options = {};
const unknownArgs = [];
for (let index = 2; index < process.argv.length; index++) {
  const arg = process.argv[index];
  if (optionValues.has(arg)) {
    const value = process.argv[++index];
    if (!value || value.startsWith('--')) throw new Error(`${arg} requires a value`);
    options[optionValues.get(arg)] = value;
  } else if (arg !== '--apply' && arg !== '--check-updates') unknownArgs.push(arg);
}
const PINNED_PACKAGES = deps.mcpPackages(options.server ? [options.server] : undefined);

// The update audit covers every npm pin this package states, not just the MCP
// servers. A pinned tool goes stale the same way a pinned server does, and a
// pin nothing watches is a version claim that quietly stops being true.
const AUDIT_TARGETS = [
  ...PINNED_PACKAGES,
  ...deps.SHOWCASE_PACKAGES.map((pin) => ({ name: pin.package, version: pin.version })),
  ...Object.values(deps.TOOLS)
    .filter((t) => t.version && (t.kind === 'npm-global' || t.kind === 'npm-module'))
    .map((t) => ({ name: t.package, version: t.version })),
];
const PACKAGES = PINNED_PACKAGES.map(({ name, version }) => `${name}@${version}`);
const APPLY = process.argv.includes('--apply');
const CHECK_UPDATES = process.argv.includes('--check-updates');
const RUNTIME_ROOT = runtimeStatus.runtimeRoot(options.runtimeRoot ? resolve(options.runtimeRoot) : undefined);

if (unknownArgs.length > 0) {
  console.error(`Unknown argument(s): ${unknownArgs.join(', ')}`);
  process.exit(2);
}
if (APPLY && CHECK_UPDATES) {
  console.error('--apply and --check-updates are separate operations');
  process.exit(2);
}

function run(command, args, { capture = false, env = {}, timeout = 60000 } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawnCommand(command, args, {
      cwd: join(dirname(fileURLToPath(import.meta.url)), '..'),
      env: {
        ...process.env,
        NO_UPDATE_NOTIFIER: '1',
        NPM_CONFIG_PROGRESS: 'false',
        ...env,
      },
      stdio: capture ? ['ignore', 'pipe', 'pipe'] : 'inherit',
      timeout,
    });
    let stdout = '';
    let stderr = '';
    if (capture) {
      child.stdout.setEncoding('utf8');
      child.stderr.setEncoding('utf8');
      child.stdout.on('data', (chunk) => { stdout += chunk; });
      child.stderr.on('data', (chunk) => { stderr += chunk; });
    }
    child.on('error', reject);
    child.on('close', (code, signal) => {
      if (code === 0) resolve({ stdout, stderr });
      else reject(new Error(`${command} exited ${code}${signal ? ` (${signal}; timeout ${timeout} ms)` : ''}${stderr ? `: ${stderr.trim()}` : ''}`));
    });
  });
}

try {
  if (options.tarballPrefix) {
    const prefix = new URL(options.tarballPrefix);
    if (prefix.protocol !== 'https:' || prefix.username || prefix.password ||
        prefix.search || prefix.hash || !prefix.pathname.endsWith('/')) {
      throw new Error('--registry-tarball-prefix must be an HTTPS URL ending in / without credentials, query, or fragment');
    }
    const version = (await run('npm', ['--version'], { capture: true })).stdout.trim();
    if (!/^\d+\.\d+\.\d+/.test(version) || Number(version.split('.')[0]) < 12) {
      throw new Error('--registry-tarball-prefix requires npm 12 or later');
    }
  }
  const registryResult = await run('npm', ['config', 'get', 'registry'], { capture: true });
  const registry = registryResult.stdout.trim();
  if (!registry) throw new Error('npm returned an empty configured registry');

  console.log(`mode:     ${APPLY ? 'apply' : 'preview'}`);
  console.log(`registry: ${registry}`);
  console.log(`runtime:  ${RUNTIME_ROOT}`);
  console.log('packages:');
  for (const packageSpec of PACKAGES) console.log(`  - ${packageSpec}`);
  console.log('policy:   exact versions; configured registry install; direct Node runtime');
  if (options.tarballPrefix) console.log(`tarballs: ${options.tarballPrefix} -> ${registry} (per-command routing only)`);

  if (CHECK_UPDATES) {
    console.log('\nstable version audit:');
    let updates = 0;
    for (const pinned of AUDIT_TARGETS) {
      const result = await run('npm', [
        'view',
        pinned.name,
        'dist-tags.latest',
        '--json',
        '--prefer-offline',
      ], {
        capture: true,
        env: { NPM_CONFIG_REGISTRY: registry },
      });
      const latest = JSON.parse(result.stdout.trim());
      const current = latest === pinned.version;
      if (!current) updates += 1;
      console.log(`  ${current ? 'current' : 'UPDATE '} ${pinned.name}: ${pinned.version} -> ${latest}`);
    }
    console.log(updates === 0
      ? '\nAll npm pins match their stable dist-tags.'
      : `\n${updates} stable update(s) require compatibility review before changing source pins.`);
    process.exit(0);
  }

  if (!APPLY) {
    console.log('\nPreview only. Re-run with --apply after reviewing the registry and package set.');
    process.exit(0);
  }

  mkdirSync(RUNTIME_ROOT, { recursive: true });
  for (const pinned of PINNED_PACKAGES) {
    const result = await run('npm', ['view', `${pinned.name}@${pinned.version}`, 'version', '--json'], { capture: true });
    const value = JSON.parse(result.stdout);
    const versions = Array.isArray(value) ? value : [value];
    if (versions.length !== 1 || versions[0] !== pinned.version) throw new Error(`Registry did not confirm exact pin ${pinned.name}@${pinned.version}`);
  }
  console.log(`installing: ${PACKAGES.join(', ')}`);
  await run('npm', [
      'install',
      '--save-exact',
      '--prefer-offline',
      '--no-audit',
      '--no-fund',
      '--loglevel=error',
      '--prefix',
      RUNTIME_ROOT,
      ...(options.tarballPrefix ? [`--replace-registry-host=${options.tarballPrefix}`] : []),
      ...PACKAGES,
    ], {
      env: { NPM_CONFIG_REGISTRY: registry }, timeout: 180000,
    });

  for (const pinned of PINNED_PACKAGES.filter(packageInfo => packageInfo.route)) {
    const state = runtimeStatus.checkRuntime(pinned.route, RUNTIME_ROOT);
    if (!state.present) throw new Error(state.errors.join('\n'));
    console.log(`verified ${pinned.route}: exact versions and successful launch probe; host connection not observed`);
  }
  console.log('\nProvisioned direct runtime. Reload the host, then verify its MCP connection in a new session.');
} catch (error) {
  console.error(`FAIL  ${error.message}`);
  process.exit(1);
}
