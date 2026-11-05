import { spawn, spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';

export function resolveWindowsCommand(command, {
  platform = process.platform,
  locate = spawnSync,
} = {}) {
  if (platform !== 'win32') return command;
  const result = locate('where.exe', [command], {
    encoding: 'utf8',
    shell: false,
    windowsHide: true,
  });
  if (result.status !== 0) return command;
  const candidates = String(result.stdout || '').split(/\r?\n/).filter(Boolean);
  return candidates.find((candidate) => /\.cmd$/i.test(candidate))
    || candidates.find((candidate) => /\.exe$/i.test(candidate))
    || candidates.find((candidate) => /\.bat$/i.test(candidate))
    || candidates[0]
    || command;
}

export function spawnCommand(command, args, options = {}, {
  platform = process.platform,
  locate = spawnSync,
  launch = spawn,
  fileExists = existsSync,
  prefixProbe = spawnSync,
} = {}) {
  const resolved = resolveWindowsCommand(command, { platform, locate });
  if (platform === 'win32' && /\.cmd$/i.test(resolved)) {
    const npmEntrypoints = {
      npm: 'npm-cli.js',
      npx: 'npx-cli.js',
    };
    const entrypoint = npmEntrypoints[command.toLowerCase()];
    if (!entrypoint) {
      throw new Error(`refusing shell execution for unsupported command shim: ${resolved}`);
    }
    let cli = join(dirname(resolved), 'node_modules', 'npm', 'bin', entrypoint);
    const prefixHelper = join(dirname(resolved), 'node_modules', 'npm', 'bin', 'npm-prefix.js');
    if (fileExists(prefixHelper)) {
      const prefix = prefixProbe(process.execPath, [prefixHelper], {
        cwd: options.cwd,
        env: options.env,
        encoding: 'utf8',
        shell: false,
        windowsHide: true,
        timeout: 30000,
      });
      if (prefix.error || prefix.status !== 0 || !String(prefix.stdout || '').trim()) {
        throw new Error(`npm prefix discovery failed: ${prefix.error?.message || prefix.stderr || 'empty prefix'}`);
      }
      const candidate = join(String(prefix.stdout).trim(), 'node_modules', 'npm', 'bin', entrypoint);
      if (fileExists(candidate)) cli = candidate;
    }
    if (!fileExists(cli)) throw new Error(`${command} CLI entry point not found beside shim: ${cli}`);
    return launch(process.execPath, [cli, ...args], { ...options, shell: false });
  }
  return launch(resolved, args, { ...options, shell: false });
}
