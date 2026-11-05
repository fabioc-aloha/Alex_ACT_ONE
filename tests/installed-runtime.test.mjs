import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import deps from '../scripts/shared/dependencies.cjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const launcher = join(ROOT, 'skills', 'setup-dependencies', 'scripts', 'runtime-launcher.mjs');
describe('provisioned runtime', () => {
    const root = process.env.ALEX_ACT_ONE_RUNTIME_ROOT ||
        join(homedir(), '.copilot', 'plugin-data', 'alex-act-one', 'runtime');
    for (const [route, spec] of Object.entries(deps.MCP_SERVERS)) {
        const installed = existsSync(join(root, 'node_modules', ...spec.package.split('/'), 'package.json'));
        test(`${route} starts and reports ${spec.version}`, {
            skip: installed ? false : `${spec.package} not provisioned`,
        }, () => {
            const out = execFileSync(process.execPath, [launcher, route, '--version'], { encoding: 'utf8', timeout: 60000 });
            assert.match(out, new RegExp(spec.version.replace(/\./g, '\\.')));
        });
    }
    test('an unknown route fails loudly', () => {
        assert.throws(() => execFileSync(process.execPath, [launcher, 'no-such-route'], { encoding: 'utf8' }), /Unknown MCP runtime route/);
    });
});
