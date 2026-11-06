import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { test } from 'node:test';

async function api() {
    assert.ok(existsSync(new URL('../scripts/run-skill-scenarios.mjs', import.meta.url)), 'Missing reproducible CLI scenario runner');
    return import('../scripts/run-skill-scenarios.mjs');
}

const help = [
    '--no-auto-update', '--output-format', '--stream', '--no-ask-user',
    '--available-tools', '--allow-tool', '--add-dir', '--plugin-dir', '--log-dir', '--disable-builtin-mcps',
].map(flag => `  ${flag} <value>`).join('\n');

test('version-bound CLI invocation uses stdin and only flags that the selected executable actually supports', async () => {
    const { scenarioArguments } = await api();
    const args = scenarioArguments(help, { pluginRoot: 'C:\\fixture plugin', logDirectory: 'C:\\fixture logs' });
    assert.ok(args.includes('--no-auto-update'));
    assert.ok(args.includes('--output-format'));
    assert.ok(args.includes('--available-tools'));
    assert.deepEqual(args.slice(args.indexOf('--available-tools') + 1, args.indexOf('--allow-tool')), ['skill', 'view']);
    assert.ok(!args.includes('--allow-all-tools') && !args.includes('--allow-all-paths'));
    assert.ok(!args.some(arg => arg.includes('disable-client-telemetry') || arg.includes('sync-session') || arg.includes('trust-folder')));
    assert.ok(!args.includes('-p') && !args.includes('--prompt'), 'Exact prompt goes to stdin, not shell interpolation');
    assert.ok(args.includes('C:\\fixture plugin'));
    assert.equal(args[args.indexOf('--plugin-dir') + 1], 'C:\\fixture plugin',
        'Use the explicit selected package, not an installed copy with the same skill name');
    assert.throws(() => scenarioArguments(help.replace('--plugin-dir', '--unrelated'), {}), /plugin-dir/);
    assert.throws(() => scenarioArguments(help.replace('--available-tools', '--unrelated'), {}), /available-tools/);
    assert.throws(() => scenarioArguments(help.replace('--no-auto-update', '--unrelated'), {}), /no-auto-update/);
});

test('capability and version probes use the same selected executable with automatic updates disabled', async () => {
    const { inspectCli } = await api();
    const calls = [];
    const cli = 'C:\\fixture\\copilot.exe';
    const info = inspectCli(cli, (command, args) => {
        calls.push({ command, args });
        return { status: 0, stdout: args.includes('--version') ? 'GitHub Copilot CLI 1.0.88.\n' : help, stderr: '' };
    });
    assert.equal(info.version, '1.0.88');
    assert.deepEqual(calls, [
        { command: cli, args: ['--no-auto-update', '--version'] },
        { command: cli, args: ['--no-auto-update', '--help'] },
    ]);
    assert.throws(() => inspectCli(cli, () => ({ status: 2, stdout: '', stderr: 'unsupported' })), /unsupported/);
});

test('CLI evidence requires the exact prompt, completed guidance tools, final response, and no mutations', async () => {
    const { parseScenarioEvidence } = await api();
    assert.equal(typeof parseScenarioEvidence, 'function');
    const root = new URL('../', import.meta.url);
    const { fileURLToPath } = await import('node:url');
    const pluginRoot = fileURLToPath(root);
    const options = { prompt: 'fixture request', skill: 'critical-thinking', pluginRoot };
    const events = [
        { type: 'user.message', data: { content: options.prompt } },
        { type: 'tool.execution_start', data: { toolCallId: 'skill-1', toolName: 'skill', arguments: { skill: options.skill } } },
        { type: 'tool.execution_complete', data: { toolCallId: 'skill-1', success: true } },
        { type: 'tool.execution_start', data: { toolCallId: 'read-1', toolName: 'view', arguments: {
            path: fileURLToPath(new URL('../skills/critical-thinking/references/runtime-act-pass.md', import.meta.url)),
        } } },
        { type: 'tool.execution_complete', data: { toolCallId: 'read-1', success: true } },
        { type: 'assistant.message', data: { content: 'Observed fixture answer', model: 'fixture-model', toolRequests: [] } },
        { type: 'result', exitCode: 0, usage: { codeChanges: { linesAdded: 0, linesRemoved: 0, filesModified: [] } } },
    ];
    const encode = rows => rows.map(row => JSON.stringify(row)).join('\n');
    const result = parseScenarioEvidence(encode(events), options);
    assert.equal(result.response, 'Observed fixture answer');
    assert.deepEqual(result.models, ['fixture-model']);
    assert.deepEqual(result.toolCalls.map(item => item.name), ['skill', 'view']);
    assert.match(result.toolCalls[1].sha256, /^[a-f0-9]{64}$/, 'Retain the exact selected guidance identity after a disposable copy is removed');
    assert.equal(result.semanticStatus, 'not-reviewed', 'Process completion is not an automatic semantic pass');
    assert.throws(() => parseScenarioEvidence('not json', options), /JSON/);
    assert.throws(() => parseScenarioEvidence(encode(events.slice(0, -1)), options), /result/);
    assert.throws(() => parseScenarioEvidence(encode(events), { ...options, prompt: 'different' }), /prompt/);
    assert.throws(() => parseScenarioEvidence(encode(events.filter(row => row.type !== 'tool.execution_complete')), options), /tool/);
    assert.throws(() => parseScenarioEvidence(encode(events.filter(row => row.type !== 'assistant.message')), options), /response/);
    const unsafe = structuredClone(events);
    unsafe[1].data.toolName = 'powershell';
    assert.throws(() => parseScenarioEvidence(encode(unsafe), options), /tool/);
    const changed = structuredClone(events);
    changed.at(-1).usage.codeChanges.filesModified = ['fixture.txt'];
    assert.throws(() => parseScenarioEvidence(encode(changed), options), /mutat|modified/);
    const outside = structuredClone(events);
    outside[3].data.arguments.path = fileURLToPath(new URL('../README.md', import.meta.url));
    assert.throws(() => parseScenarioEvidence(encode(outside), options), /guidance/);
});
