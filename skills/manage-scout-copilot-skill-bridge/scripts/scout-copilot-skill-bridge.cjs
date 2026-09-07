#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const CORE_ROOT = path.resolve(__dirname, '..', '..', '..', '..');
const DEFAULT_MANIFEST = path.join(
  CORE_ROOT, '.github', 'config', 'scout-copilot-skill-bridge.json');

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function parseJsonc(value) {
  let output = '';
  let inString = false;
  let escaped = false;
  let inLineComment = false;
  let inBlockComment = false;

  for (let index = 0; index < value.length; index++) {
    const current = value[index];
    const next = value[index + 1];
    if (inLineComment) {
      if (current === '\n') {
        inLineComment = false;
        output += current;
      }
      continue;
    }
    if (inBlockComment) {
      if (current === '*' && next === '/') {
        inBlockComment = false;
        index++;
      }
      continue;
    }
    if (inString) {
      output += current;
      if (escaped) escaped = false;
      else if (current === '\\') escaped = true;
      else if (current === '"') inString = false;
      continue;
    }
    if (current === '"') {
      inString = true;
      output += current;
      continue;
    }
    if (current === '/' && next === '/') {
      inLineComment = true;
      index++;
      continue;
    }
    if (current === '/' && next === '*') {
      inBlockComment = true;
      index++;
      continue;
    }
    output += current;
  }
  return JSON.parse(output.replace(/,(\s*[}\]])/g, '$1'));
}

function normalizeForComparison(value) {
  const normalized = path.normalize(value);
  return process.platform === 'win32' ? normalized.toLowerCase() : normalized;
}

function samePath(left, right) {
  return normalizeForComparison(left) === normalizeForComparison(right);
}

function lstatOrNull(file) {
  try {
    return fs.lstatSync(file);
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
}

function defaultCopilotHome() {
  return path.join(os.homedir(), '.copilot');
}

function defaultScoutHome() {
  return path.join(os.homedir(), '.scout', 'copilot');
}

function parseArgs(args) {
  const options = {
    apply: false,
    canary: false,
    copilotHome: defaultCopilotHome(),
    bridgeRoot: path.join(defaultCopilotHome(), 'skills'),
    scoutHome: defaultScoutHome(),
    manifest: DEFAULT_MANIFEST,
  };
  const values = new Map([
    ['--copilot-home', 'copilotHome'],
    ['--bridge-root', 'bridgeRoot'],
    ['--scout-home', 'scoutHome'],
    ['--manifest', 'manifest'],
  ]);

  for (let index = 0; index < args.length; index++) {
    const value = args[index];
    if (value === '--apply') options.apply = true;
    else if (value === '--canary') options.canary = true;
    else if (values.has(value)) {
      const next = args[++index];
      if (!next || next.startsWith('--')) throw new Error(`${value} requires a value`);
      options[values.get(value)] = path.resolve(next);
    } else {
      throw new Error(`unknown argument: ${value}`);
    }
  }

  for (const value of ['copilotHome', 'bridgeRoot', 'scoutHome', 'manifest']) {
    options[value] = path.resolve(options[value]);
  }
  return options;
}

function safeRelativePath(value) {
  return typeof value === 'string'
    && value.length > 0
    && !path.isAbsolute(value)
    && !value.split(/[\\/]+/).includes('..');
}

function safeSkillName(value) {
  return typeof value === 'string'
    && /^[a-z0-9][a-z0-9-]*$/.test(value)
    && path.basename(value) === value;
}

function validateManifest(manifest) {
  if (!manifest || manifest.schemaVersion !== 1 || !Array.isArray(manifest.sources)) {
    throw new Error('bridge manifest schemaVersion 1 with sources is required');
  }
  if (!Array.isArray(manifest.scoutNativePlugins)
    || !Array.isArray(manifest.scoutExcludedPlugins)
    || !Array.isArray(manifest.canarySkills)) {
    throw new Error('bridge manifest ownership and canary arrays are required');
  }

  const names = new Set();
  const entries = [];
  for (const source of manifest.sources) {
    if (!safeSkillName(source?.plugin) || !safeSkillName(source?.marketplace)
      || !safeRelativePath(source?.skillRoot) || !Array.isArray(source?.skills)) {
      throw new Error('bridge manifest source is invalid');
    }
    for (const skill of source.skills) {
      if (!safeSkillName(skill) || names.has(skill)) {
        throw new Error(`bridge manifest has an invalid or duplicate skill: ${skill}`);
      }
      names.add(skill);
      entries.push({ ...source, skill });
    }
  }
  for (const skill of manifest.canarySkills) {
    if (!names.has(skill)) throw new Error(`canary skill is not allowlisted: ${skill}`);
  }
  return { manifest, entries };
}

function resolveEntries(options) {
  const { manifest, entries } = validateManifest(readJson(options.manifest));
  return {
    manifest,
    entries: entries.map((entry) => {
      const target = path.join(
        options.copilotHome,
        'installed-plugins',
        entry.marketplace,
        entry.plugin,
        entry.skillRoot,
        entry.skill,
      );
      const skillFile = path.join(target, 'SKILL.md');
      if (!fs.existsSync(skillFile)) {
        throw new Error(`missing allowlisted skill source: ${skillFile}`);
      }
      return {
        name: entry.skill,
        plugin: entry.plugin,
        marketplace: entry.marketplace,
        target: fs.realpathSync(target),
        destination: path.join(options.bridgeRoot, entry.skill),
      };
    }),
  };
}

function inspectLink(entry) {
  const stats = lstatOrNull(entry.destination);
  if (!stats) return { ...entry, action: 'create' };
  if (!stats.isSymbolicLink()) {
    return { ...entry, action: 'conflict', reason: 'destination is not a managed link' };
  }
  const actual = fs.realpathSync(entry.destination);
  return samePath(actual, entry.target)
    ? { ...entry, action: 'preserve' }
    : { ...entry, action: 'repoint', actual };
}

function auditScout(options, manifest) {
  const configPath = path.join(options.scoutHome, 'config.json');
  if (!fs.existsSync(configPath)) {
    return { configPath, status: 'not-found', excludedInstalled: [] };
  }
  const config = parseJsonc(fs.readFileSync(configPath, 'utf8'));
  if (!Array.isArray(config.installedPlugins)) {
    throw new Error('Scout plugin configuration has no installedPlugins array');
  }
  const installed = config.installedPlugins
    .filter((plugin) => plugin?.enabled !== false)
    .map((plugin) => plugin?.name)
    .filter(Boolean)
    .sort();
  const excludedInstalled = installed.filter((name) => manifest.scoutExcludedPlugins.includes(name));
  const missingNative = manifest.scoutNativePlugins.filter((name) => !installed.includes(name));
  return { configPath, status: 'read', installed, excludedInstalled, missingNative };
}

function buildPlan(options) {
  const { manifest, entries } = resolveEntries(options);
  const actions = entries.map(inspectLink);
  return {
    schemaVersion: 1,
    apply: options.apply,
    canaryRequested: options.canary,
    manifest: options.manifest,
    copilotHome: options.copilotHome,
    bridgeRoot: options.bridgeRoot,
    links: actions,
    scout: auditScout(options, manifest),
    canarySkills: manifest.canarySkills,
    _manifest: manifest,
  };
}

function linkDirectory(target, destination) {
  fs.symlinkSync(target, destination, process.platform === 'win32' ? 'junction' : 'dir');
}

function verifyLinks(plan) {
  for (const entry of plan.links) {
    if (!fs.existsSync(path.join(entry.destination, 'SKILL.md'))) {
      throw new Error(`bridge verification failed for ${entry.name}`);
    }
    if (!samePath(fs.realpathSync(entry.destination), entry.target)) {
      throw new Error(`bridge target mismatch for ${entry.name}`);
    }
  }
}

function applyPlan(plan) {
  const conflicts = plan.links.filter((entry) => entry.action === 'conflict');
  if (conflicts.length > 0) {
    throw new Error(`refusing to replace user-owned bridge entries: ${conflicts.map((entry) => entry.name).join(', ')}`);
  }
  fs.mkdirSync(plan.bridgeRoot, { recursive: true });
  for (const entry of plan.links) {
    if (entry.action === 'create') linkDirectory(entry.target, entry.destination);
    if (entry.action === 'repoint') {
      fs.rmSync(entry.destination, { recursive: true, force: false });
      linkDirectory(entry.target, entry.destination);
    }
  }
  verifyLinks(plan);
  plan.verification = {
    linked: plan.links.filter((entry) => entry.action !== 'preserve').length,
    targetsValid: plan.links.length,
  };
  return plan;
}

function runCanary(plan) {
  const byName = new Map(plan.links.map((entry) => [entry.name, entry]));
  return plan.canarySkills.map((name) => {
    const entry = byName.get(name);
    const skillFile = path.join(entry.destination, 'SKILL.md');
    return {
      name,
      plugin: entry.plugin,
      readable: fs.readFileSync(skillFile, 'utf8').trim().length > 0,
    };
  });
}

function publicPlan(plan) {
  const { _manifest, ...output } = plan;
  return output;
}

function main() {
  try {
    const options = parseArgs(process.argv.slice(2));
    const plan = buildPlan(options);
    if (options.apply) applyPlan(plan);
    if (options.canary) plan.canary = runCanary(plan);
    process.stdout.write(`${JSON.stringify(publicPlan(plan), null, 2)}\n`);
  } catch (error) {
    console.error(`ERROR: ${error.message}`);
    process.exitCode = 1;
  }
}

if (require.main === module) main();

module.exports = { applyPlan, buildPlan, parseArgs, runCanary };
