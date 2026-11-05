import { spawn } from 'node:child_process';
import commandResolution from './shared/process-command.cjs';

export const resolveWindowsCommand = commandResolution.resolveWindowsCommand;

export function spawnCommand(command, args, options = {}, dependencies = {}) {
  const invocation = commandResolution.resolveInvocation(command, args, options, dependencies);
  return (dependencies.launch || spawn)(invocation.command, invocation.args, { ...options, shell: false });
}
