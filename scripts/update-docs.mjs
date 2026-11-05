import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const GROUPS = [
    ['Reasoning and judgment', 'How to think through a problem before acting on it.',
        ['act-tenets', 'critical-thinking', 'problem-framing-audit', 'adversarial-review', 'deep-review',
            'anti-hallucination', 'risk-analysis', 'ethical-reasoning', 'mutation-testing']],
    ['Engineering', 'Writing and changing code that survives review.',
        ['code-review', 'security-and-hardening', 'test-driven-development', 'systematic-debugging', 'git-workflow', 'plan', 'spike']],
    ['Prose and documentation', 'Writing people finish reading.',
        ['big-idea', 'humanizer', 'communication-craft', 'doc-hygiene', 'lint-clean-markdown',
            'status-reporting', 'markdown-sanitization-chain', 'corpus-qa-sweep']],
    ['Charts and figures', 'Deciding what to draw, drawing it, and checking it says what you meant.',
        ['render-chart', 'chart-big-idea', 'chart-vocabulary', 'chart-interpretation', 'flint-chart', 'flint-interactions',
            'flint-theme', 'ascii-chart', 'print-svg-style-guide', 'figure-generator', 'svg-banner',
            'markdown-mermaid', 'annotate-screenshot', 'render-verify', 'replicate-imagery', 'docs-shell']],
    ['Document conversion', 'Moving a document between formats without losing its structure.',
        ['convert', 'docx-to-md', 'html-to-md', 'md-to-html', 'md-to-word', 'md-to-eml', 'md-to-txt', 'rich-email']],
    ['Working on the agent itself', 'Auditing, extending, and consolidating the agent.',
        ['meditation', 'compile-brain', 'assess-brain', 'project-capability-authoring',
            'token-waste-elimination', 'proactive-awareness', 'project-status', 'evaluate-before-adopting']],
    ['Setup and platform', 'Getting the plugin and its dependencies working.',
        ['bootstrap-core', 'bootstrap-project', 'setup-dependencies', 'platform-awareness', 'browser-tools',
            'terminal-command-safety', 'install-visual-companions', 'setup-enterprise-stack']],
];
const NEEDS = new Map([
    ...['render-chart', 'flint-chart', 'flint-interactions', 'flint-theme'].map(name => [name, 'Flint MCP']),
    ...['convert', 'docx-to-md', 'html-to-md', 'md-to-html', 'md-to-word', 'md-to-eml', 'md-to-txt', 'rich-email']
        .map(name => [name, 'Pandoc']),
    ['annotate-screenshot', 'Pillow'], ['replicate-imagery', 'Replicate MCP'],
]);

const read = (root, path) => readFileSync(join(root, ...path.split('/')), 'utf8').replace(/\r\n/g, '\n');
const link = (name, path) => `[\`${name}\`](${path})`;
const cell = value => String(value).replace(/\s+/g, ' ').trim().replace(/\|/g, '&#124;');
function summary(value) {
    const text = cell(value);
    if (text.length <= 180) return text;
    const end = text.lastIndexOf(' ', 177);
    return text.slice(0, end) + '...';
}

function metadata(text, path) {
    const header = text.match(/^---\n([\s\S]*?)\n---(?:\n|$)/)?.[1];
    if (!header) throw new Error(`Missing frontmatter: ${path}`);
    const result = {};
    for (const line of header.split('\n')) {
        const field = line.match(/^([A-Za-z][\w-]*):\s*(.*?)\s*$/);
        if (!field) continue;
        const [, key, raw] = field;
        if (['|', '>', '|-', '>-'].includes(raw)) throw new Error(`Unsupported multiline ${key} in ${path}`);
        result[key] = /^(['"])[\s\S]*\1$/.test(raw) ? raw.slice(1, -1) : raw;
    }
    if (!result.description) throw new Error(`Missing description: ${path}`);
    return result;
}

function assets(root, manifest, kind) {
    const entries = manifest.assets[kind];
    if (!Array.isArray(entries)) throw new Error(`Missing manifest assets.${kind}`);
    const disk = readdirSync(join(root, kind), { withFileTypes: true })
        .filter(entry => kind === 'skills' ? entry.isDirectory() :
            entry.isFile() && entry.name.endsWith(kind === 'prompts' ? '.prompt.md' : '.instructions.md'))
        .map(entry => kind === 'skills' ? entry.name : entry.name.replace(/\.(?:prompt|instructions)\.md$/, '')).sort();
    const listed = entries.map(entry => entry.name).sort();
    if (new Set(listed).size !== listed.length || JSON.stringify(disk) !== JSON.stringify(listed)) {
        throw new Error(`Manifest/filesystem inventory mismatch: ${kind}`);
    }
    return entries.map(entry => {
        const text = read(root, entry.path);
        const fields = metadata(text, entry.path);
        if (kind === 'skills' && fields.name !== entry.name) throw new Error(`Skill identity mismatch: ${entry.path}`);
        if (kind === 'instructions' && fields.applyTo !== entry.applyTo) throw new Error(`applyTo mismatch: ${entry.path}`);
        return { ...entry, text, fields };
    });
}

function ownerRoute(asset, skills) {
    const owners = [...asset.text.matchAll(/\]\(\.\.\/skills\/([a-z0-9-]+)\/SKILL\.md\)/g)];
    const names = new Set(owners.map(match => match[1]));
    if (names.size !== 1) throw new Error(`Expected one execution owner: ${asset.path}`);
    const name = [...names][0];
    const owner = skills.find(skill => skill.name === name);
    if (!owner) throw new Error(`Missing or undeclared execution owner ${name}: ${asset.path}`);
    const mode = asset.text.match(/\bin \*\*([^*]+)\*\* mode\b/)?.[1];
    if (!mode) throw new Error(`Missing execution mode: ${asset.path}`);
    return `${link(owner.name, owner.path)} / ${cell(mode)}`;
}

export function canonicalManifest(root = ROOT) {
    const manifest = JSON.parse(read(root, 'manifest.json'));
    const descriptions = new Map(assets(root, manifest, 'instructions')
        .map(instruction => [instruction.name, instruction.fields.description]));
    manifest.assets.instructions = manifest.assets.instructions.map(instruction =>
        ({ ...instruction, role: descriptions.get(instruction.name) }));
    return manifest;
}

export function validateInstructionRoles(root = ROOT) {
    const current = JSON.parse(read(root, 'manifest.json'));
    const canonical = canonicalManifest(root);
    for (let index = 0; index < current.assets.instructions.length; index++) {
        if (current.assets.instructions[index].role !== canonical.assets.instructions[index].role) {
            throw new Error(`Instruction role metadata is stale: ${current.assets.instructions[index].name}. Run update-docs.mjs --write.`);
        }
    }
}

export function generateSections(root = ROOT) {
    const manifest = JSON.parse(read(root, 'manifest.json'));
    const plugin = JSON.parse(read(root, 'plugin.json'));
    const skills = assets(root, manifest, 'skills');
    const prompts = assets(root, manifest, 'prompts');
    const instructions = assets(root, manifest, 'instructions');
    const grouped = GROUPS.flatMap(([, , names]) => names);
    if (new Set(grouped).size !== grouped.length ||
        JSON.stringify([...grouped].sort()) !== JSON.stringify(skills.map(skill => skill.name).sort())) {
        throw new Error('Skill group inventory mismatch. Assign each declared skill to one README group.');
    }
    const byName = new Map(skills.map(skill => [skill.name, skill]));
    const skillTable = GROUPS.map(([title, introduction, names]) => [
        `### ${title}`, '', introduction, '',
        '| Skill | Discovery summary | Needs |', '| --- | --- | --- |',
        ...names.map(name => {
            const skill = byName.get(name);
            return `| ${link(name, skill.path)} | ${summary(skill.fields.description)} | ${NEEDS.get(name) || 'Node only'} |`;
        }),
    ].join('\n')).join('\n\n');
    const promptTable = [
        '| Prompt alias | Discovery summary | Execution owner / mode |',
        '| --- | --- | --- |',
        ...[...prompts].sort((a, b) => a.name.localeCompare(b.name)).map(prompt =>
            `| ${link(prompt.name, prompt.path)} | ${summary(prompt.fields.description)} | ${ownerRoute(prompt, skills)} |`),
    ].join('\n');
    const instructionTable = [
        '| Resident instruction | Semantic trigger | Execution owner / mode | applyTo |',
        '| --- | --- | --- | --- |',
        ...[...instructions].sort((a, b) => a.name.localeCompare(b.name)).map(instruction => {
            const trigger = instruction.text.match(/## Activation and resident floor\n\n([\s\S]*?)(?:\n\n|$)/)?.[1];
            if (!trigger) throw new Error(`Missing resident trigger: ${instruction.path}`);
            return `| ${link(instruction.name, instruction.path)} | ${summary(trigger)} | ${ownerRoute(instruction, skills)} | \`${cell(instruction.fields.applyTo)}\` |`;
        }),
    ].join('\n');
    const inventory = [
        '| Source surface | Count | Delivery |', '| --- | --- | --- |',
        `| Skills | ${skills.length} | Loaded on demand from the plugin |`,
        `| Prompts / command aliases | ${prompts.length} | Thin user-invoked entrypoints; availability depends on host |`,
        `| Resident instructions | ${instructions.length} | Preview-first profile activation; execution detail stays in skills |`,
        `| MCP servers | ${Object.keys(plugin.mcpServers).length} | Registered from plugin metadata where supported |`,
    ].join('\n');
    return { INVENTORY: inventory, 'SKILL TABLE': skillTable, 'PROMPT TABLE': promptTable, 'INSTRUCTION TABLE': instructionTable };
}

export function replaceSections(readme, sections) {
    let result = readme.replace(/\r\n/g, '\n');
    for (const [label, body] of Object.entries(sections)) {
        const start = `<!-- BEGIN GENERATED ${label} -->`;
        const end = `<!-- END GENERATED ${label} -->`;
        if (result.split(start).length !== 2 || result.split(end).length !== 2 ||
            result.indexOf(end) < result.indexOf(start)) throw new Error(`Missing, duplicated, or reversed ${label} markers`);
        const before = result.slice(0, result.indexOf(start) + start.length);
        const after = result.slice(result.indexOf(end));
        result = `${before}\n\n${body}\n\n${after}`;
    }
    return result;
}

function main() {
    const args = process.argv.slice(2);
    if (args.length > 1 || (args[0] && !['--check', '--write'].includes(args[0]))) {
        throw new Error('Usage: node scripts\\update-docs.mjs [--check | --write]');
    }
    const current = readFileSync(join(ROOT, 'README.md'), 'utf8');
    const generated = replaceSections(current, generateSections());
    const manifest = canonicalManifest();
    if (args[0] === '--write') {
        const eol = current.includes('\r\n') ? '\r\n' : '\n';
        const manifestPath = join(ROOT, 'manifest.json');
        const original = readFileSync(manifestPath, 'utf8');
        const manifestEol = original.includes('\r\n') ? '\r\n' : '\n';
        if (JSON.stringify(JSON.parse(original)) !== JSON.stringify(manifest)) {
            writeFileSync(manifestPath, (JSON.stringify(manifest, null, 2) + '\n').replace(/\n/g, manifestEol));
        }
        writeFileSync(join(ROOT, 'README.md'), generated.replace(/\n/g, eol));
        console.log('Updated README catalogs and canonical instruction role metadata.');
    } else {
        validateInstructionRoles();
        if (generated !== current.replace(/\r\n/g, '\n')) {
            throw new Error('README catalog is stale. Run node scripts\\update-docs.mjs --write.');
        }
        console.log('README inventory, asset tables, owner routes, and instruction role metadata match the source.');
    }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    try { main(); } catch (error) { console.error(error.message); process.exitCode = 1; }
}
