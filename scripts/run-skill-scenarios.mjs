import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const REQUIRED_FLAGS = ['--no-auto-update', '--output-format', '--stream', '--no-ask-user',
    '--available-tools', '--allow-tool', '--add-dir', '--plugin-dir', '--log-dir'];

export function inspectCli(executable, run = spawnSync) {
    const probe = flag => {
        const result = run(executable, ['--no-auto-update', flag], {
            encoding: 'utf8', timeout: 30000, shell: false, windowsHide: true,
        });
        if (result.error || result.status !== 0) {
            throw new Error(`CLI ${flag} failed: ${result.error?.message || result.stderr || `exit ${result.status}`}`);
        }
        return result.stdout;
    };
    const versionText = probe('--version');
    const version = versionText.match(/GitHub Copilot CLI (\d+\.\d+\.\d+(?:-[\w.-]+)?)/)?.[1];
    if (!version) throw new Error('Selected executable returned no recognizable Copilot CLI version');
    const help = probe('--help');
    scenarioArguments(help, {});
    return { version, help };
}

export function scenarioArguments(help, { pluginRoot, logDirectory }) {
    const has = flag => new RegExp(`^\\s*(?:-\\w,\\s*)?${flag}(?:[\\s=]|$)`, 'm').test(help);
    for (const flag of REQUIRED_FLAGS) if (!has(flag)) throw new Error(`Selected CLI does not support required flag ${flag}`);
    return ['--no-auto-update', '--output-format', 'json', '--stream', 'off', '--no-ask-user',
        '--available-tools', 'skill', 'view', '--allow-tool', 'skill', 'view',
        '--add-dir', pluginRoot, '--plugin-dir', pluginRoot, '--log-dir', logDirectory,
        ...(has('--disable-builtin-mcps') ? ['--disable-builtin-mcps'] : [])];
}

export function parseScenarioEvidence(jsonl, { prompt, skill, pluginRoot }) {
    const rows = jsonl.trim().split(/\r?\n/).map((line, index) => {
        try { return JSON.parse(line); } catch { throw new Error(`Invalid CLI JSON at line ${index + 1}`); }
    });
    const results = rows.filter(row => row.type === 'result');
    if (results.length !== 1 || results[0].exitCode !== 0) throw new Error('Missing, ambiguous, or failed CLI result');
    if (!rows.some(row => row.type === 'user.message' && row.data?.content === prompt)) {
        throw new Error('CLI did not receive the exact scenario prompt');
    }
    const changes = results[0].usage?.codeChanges;
    if (!changes || changes.linesAdded !== 0 || changes.linesRemoved !== 0 || changes.filesModified?.length !== 0) {
        throw new Error('CLI reported mutations or omitted modified-file evidence');
    }
    const requests = rows.filter(row => row.type === 'tool.execution_start').map(row => row.data);
    if (!requests.some(tool => tool.toolName === 'skill' && tool.arguments?.skill === skill)) {
        throw new Error(`CLI did not invoke the required skill tool for ${skill}`);
    }
    const toolCalls = requests.map(tool => {
        if (!['skill', 'view'].includes(tool.toolName)) throw new Error(`Unexpected tool: ${tool.toolName}`);
        const completion = rows.find(row => row.type === 'tool.execution_complete' && row.data?.toolCallId === tool.toolCallId);
        if (!completion || completion.data.success !== true) throw new Error(`Guidance tool failed or never completed: ${tool.toolName}`);
        if (tool.toolName === 'view') {
            const file = tool.arguments?.path;
            if (typeof file !== 'string' || !isAbsolute(file) || !/\.md$/i.test(file)) {
                throw new Error('Non-Markdown or unresolved guidance read');
            }
            const location = relative(realpathSync(join(pluginRoot, 'skills')), realpathSync(file));
            if (location === '..' || location.startsWith('..' + sep) || isAbsolute(location)) {
                throw new Error('View request read outside installed skill guidance');
            }
            const sha256 = createHash('sha256').update(readFileSync(file, 'utf8').replace(/\r\n/g, '\n')).digest('hex');
            return { name: 'view', path: location.split(sep).join('/'), sha256 };
        }
        return { name: 'skill', skill: tool.arguments?.skill };
    });
    const messages = rows.filter(row => row.type === 'assistant.message' &&
        typeof row.data?.content === 'string' && row.data.content.trim());
    const final = messages.at(-1)?.data;
    if (!final || final.toolRequests?.length) throw new Error('No final assistant response in CLI evidence');
    return {
        response: final.content,
        models: [...new Set(messages.map(row => row.data.model).filter(Boolean))],
        toolCalls, codeChanges: changes, semanticStatus: 'not-reviewed',
    };
}

export function validateEvidenceOutput(output) {
    if (!isAbsolute(output)) throw new Error('Evidence output must be an explicit absolute path');
    if (existsSync(output)) throw new Error('Evidence output already exists; preserve prior runs and select a new directory');
}

async function main(args) {
    const options = { cases: [] };
    for (let index = 0; index < args.length; index++) {
        const option = args[index];
        const value = args[++index];
        if (!value || value.startsWith('--')) throw new Error(`${option} requires a value`);
        const key = { '--cli': 'cli', '--plugin-root': 'pluginRoot', '--out': 'output', '--case': 'case' }[option];
        if (!key) throw new Error(`Unknown option: ${option}`);
        if (key === 'case') options.cases.push(value);
        else options[key] = value;
    }
    for (const key of ['cli', 'pluginRoot', 'output']) {
        if (!options[key] || !isAbsolute(options[key])) throw new Error(`${key} must be an explicit absolute path`);
    }
    if (!existsSync(options.cli) || /\.(?:cmd|bat|ps1)$/i.test(options.cli)) {
        throw new Error('Select an existing executable, not a shell shim');
    }
    const plugin = JSON.parse(readFileSync(join(options.pluginRoot, 'plugin.json'), 'utf8'));
    if (plugin.name !== 'alex-act-one') throw new Error('Selected installed package is not alex-act-one');
    validateEvidenceOutput(options.output);
    const cli = inspectCli(options.cli);
    const suitePath = join(ROOT, 'docs', 'verification', 'skill-scenarios.json');
    const suite = JSON.parse(readFileSync(suitePath, 'utf8'));
    const selected = options.cases.length ? suite.cases.filter(item => options.cases.includes(item.id)) : suite.cases;
    if (!selected.length || options.cases.some(id => !selected.some(item => item.id === id))) throw new Error('Unknown or empty scenario selection');
    mkdirSync(options.output, { recursive: true });
    const results = [];
    for (const item of selected) {
        const directory = join(options.output, item.id);
        mkdirSync(directory);
        const workspace = realpathSync(mkdtempSync(join(tmpdir(), 'one-live-scenario-')));
        try {
            const invocation = scenarioArguments(cli.help, { pluginRoot: options.pluginRoot, logDirectory: join(directory, 'logs') });
            const result = spawnSync(options.cli, invocation, {
                cwd: workspace, input: item.prompt, encoding: 'utf8', shell: false, windowsHide: true,
                timeout: 240000, maxBuffer: 8 * 1024 * 1024,
            });
            writeFileSync(join(directory, 'stdout.jsonl'), result.stdout || '');
            writeFileSync(join(directory, 'stderr.txt'), result.stderr || '');
            const files = readdirSync(workspace);
            const record = { id: item.id, suiteVersion: suite.version, pluginVersion: plugin.version,
                cliVersion: cli.version, prompt: item.prompt, exitCode: result.status, signal: result.signal,
                error: result.error?.message || null, workspaceFiles: files, semanticStatus: 'not-reviewed' };
            writeFileSync(join(directory, 'invocation.json'), JSON.stringify(record, null, 2));
            results.push(record);
            console.log(JSON.stringify({ id: item.id, cliVersion: cli.version, exitCode: result.status,
                stdoutBytes: Buffer.byteLength(result.stdout || ''), workspaceFiles: files }));
            if (result.error || result.status !== 0 || !result.stdout?.trim()) {
                throw new Error(`${item.id}: CLI did not complete; inspect preserved stdout/stderr`);
            }
            if (files.length) throw new Error(`${item.id}: scenario wrote files into the disposable workspace`);
            const evidence = parseScenarioEvidence(result.stdout, {
                prompt: item.prompt, skill: item.skill, pluginRoot: options.pluginRoot,
            });
            writeFileSync(join(directory, 'observations.json'), JSON.stringify(evidence, null, 2));
        } finally { rmSync(workspace, { recursive: true, force: true }); }
    }
    writeFileSync(join(options.output, 'summary.json'), JSON.stringify({
        suiteVersion: suite.version, cliVersion: cli.version, pluginVersion: plugin.version,
        permissions: 'Only skill/view available; automatic updates disabled; ask_user disabled in prompt mode',
        results, semanticStatus: 'not-reviewed',
    }, null, 2));
    console.log('CLI processes completed. Review actual responses and tool calls before assigning semantic results.');
}

if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) {
    main(process.argv.slice(2)).catch(error => { console.error(error.stack || error); process.exitCode = 1; });
}
