import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { createServer } from 'node:http';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';

const npm = process.argv[2];
const run = promisify(execFile);
const root = mkdtempSync(join(tmpdir(), 'alex-npm-cache-control-'));
const requests = [];
let current = '1.0.0';
const server = createServer((request, response) => {
    requests.push({ path: request.url, current, accept: request.headers.accept });
    const versions = Object.fromEntries((current === '1.0.0' ? ['1.0.0'] : ['1.0.0', '1.0.1']).map(version =>
        [version, { name: 'alex-synthetic-cache-probe', version,
            dist: { tarball: `http://127.0.0.1:${server.address().port}/probe-${version}.tgz`,
                shasum: '0'.repeat(40) } }]));
    response.writeHead(200, { 'content-type': 'application/json', 'cache-control': 'public, max-age=86400',
        etag: `"fixture-${current}"` });
    response.end(JSON.stringify({ name: 'alex-synthetic-cache-probe', 'dist-tags': { latest: current }, versions }));
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const registry = `http://127.0.0.1:${server.address().port}/`;
async function install(prefix, version, preference) {
    mkdirSync(join(root, prefix));
    const args = [npm, 'install', `alex-synthetic-cache-probe@${version}`, '--package-lock-only',
        '--ignore-scripts', '--no-audit', '--no-fund', '--fetch-retries=0',
        '--prefix', join(root, prefix), '--cache', join(root, 'cache'), '--registry', registry, preference];
    try {
        const result = await run(process.execPath, args, { timeout: 30000, windowsHide: true });
        return { exit: 0, stdout: result.stdout.trim() };
    } catch (error) {
        return { exit: error.code, stderr: error.stderr };
    }
}
try {
    const warm = await install('warm', '1.0.0', '--prefer-online');
    assert.equal(warm.exit, 0, warm.stderr);
    current = '1.0.1';
    const beforeOffline = requests.length;
    const offline = await install('offline', '1.0.1', '--prefer-offline');
    const afterOffline = requests.length;
    const online = await install('online', '1.0.1', '--prefer-online');
    assert.notEqual(offline.exit, 0, 'Expected the stale metadata control to reproduce a failure');
    assert.match(offline.stderr, /ETARGET/);
    assert.equal(online.exit, 0, online.stderr);
    const report = { classification: 'synthetic local-loopback cache control', npmCli: 'existing npm CLI',
        package: 'alex-synthetic-cache-probe', metadataWarmVersion: '1.0.0', requestedNewVersion: '1.0.1',
        offline: { exit: offline.exit, error: 'ETARGET', additionalMetadataRequests: afterOffline - beforeOffline },
        online: { exit: online.exit, additionalMetadataRequests: requests.length - afterOffline },
        limits: ['No public registry, user cache or active runtime used.', 'This reproduces the failure mechanism, not the missing original user log.'] };
    console.log(JSON.stringify(report, null, 2));
    if (process.argv[3]) writeFileSync(process.argv[3], JSON.stringify(report, null, 2) + '\n', { flag: 'wx' });
} finally {
    await new Promise(resolve => server.close(resolve));
    rmSync(root, { recursive: true, force: true });
}
