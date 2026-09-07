// @ts-check
'use strict';

/**
 * Single source of truth for every external dependency this plugin can use.
 *
 * Two consumers read it: `tool-runner.cjs`, so a missing tool fails with the
 * remedy attached, and the `setup-dependencies` skill, so the installer offers
 * exactly what the error named. Keeping one registry is deliberate — a remedy
 * that drifts from the installer is worse than no remedy, because the user
 * follows it and it doesn't work.
 *
 * Three tiers, because "required" is always relative to a capability. Nothing
 * here is required to use the package; each entry is required, or not, for the
 * specific skills that call it.
 *
 *   required  the skills that use it cannot run at all without it
 *   enhances  those skills run and produce less
 *   addon     adds a capability the package does not otherwise have
 */

const TOOLS = {
    pandoc: {
        label: 'Pandoc',
        kind: 'system',
        tier: 'required',
        unlocks: 'the seven document converters. Without it they cannot run at all',
        probe: ['pandoc', ['--version']],
        install: {
            win32: 'winget install JohnMacFarlane.Pandoc',
            darwin: 'brew install pandoc',
            linux: 'sudo apt install pandoc',
        },
    },
    mmdc: {
        label: 'Mermaid CLI',
        kind: 'npm-global',
        tier: 'enhances',
        unlocks: 'Mermaid diagrams rendered as images. Conversions still succeed without it',
        probe: ['mmdc', ['--version']],
        install: {
            win32: 'npm install -g @mermaid-js/mermaid-cli',
            darwin: 'npm install -g @mermaid-js/mermaid-cli',
            linux: 'npm install -g @mermaid-js/mermaid-cli',
        },
    },
    svgexport: {
        label: 'svgexport',
        kind: 'npm-global',
        tier: 'enhances',
        unlocks: 'PNG export of SVG banners and figures. SVG output is unaffected',
        probe: ['svgexport', []],
        install: {
            win32: 'npm install -g svgexport',
            darwin: 'npm install -g svgexport',
            linux: 'npm install -g svgexport',
        },
    },
    jszip: {
        label: 'jszip',
        kind: 'npm-module',
        tier: 'enhances',
        unlocks: 'Word table formatting and image centering. The .docx is still produced without it',
        probe: null,
        install: {
            win32: 'npm install jszip',
            darwin: 'npm install jszip',
            linux: 'npm install jszip',
        },
    },
    Pillow: {
        label: 'Pillow',
        kind: 'python-module',
        tier: 'required',
        // The package is Pillow; the module it provides is PIL. Probing the
        // package name reports a false negative on a machine that has it.
        importName: 'PIL',
        unlocks: 'annotate-screenshot. Without it that skill cannot run',
        probe: null,
        install: {
            win32: 'pip install Pillow',
            darwin: 'pip install Pillow',
            linux: 'pip install Pillow',
        },
    },
};

function platformKey() {
    if (process.platform === 'win32') return 'win32';
    if (process.platform === 'darwin') return 'darwin';
    return 'linux';
}

/**
 * Optional plugins that extend this package. None is required: every skill here
 * works without them, and each entry names what it adds rather than what breaks
 * without it.
 *
 * Installation is deliberately NOT owned here. `install-visual-companions` and
 * `setup-enterprise-stack` own those flows because they carry the consent gates,
 * the marketplace registration, and the post-install caveats (several companions
 * pull ~100 MB of Chromium). This registry exists so one command can report the
 * whole picture; duplicating the install logic would recreate the drift this
 * file was built to prevent.
 *
 * Names are verified against a live marketplace browse, which returns different
 * results depending on the signed-in GitHub account. See the `owner` skill.
 */
const PLUGINS = {
    companions: {
        label: 'Visual companions',
        owner: 'install-visual-companions',
        adds: 'browser preview, screenshot audit, diagram viewing, whiteboarding, image annotation, PR screenshots',
        entries: [
            { name: 'chromium-control-canvas', marketplace: 'awesome-copilot' },
            { name: 'eyeball', marketplace: 'awesome-copilot' },
            { name: 'diagram-viewer', marketplace: 'awesome-copilot' },
            { name: 'napkin', marketplace: 'awesome-copilot' },
            { name: 'visual-pr', marketplace: 'awesome-copilot' },
            { name: 'image-annotations', marketplace: 'alex-mall' },
        ],
    },
    microsoft: {
        label: 'Microsoft ecosystem',
        owner: 'setup-enterprise',
        adds: 'Azure, Fabric, Power BI, and Microsoft 365 agent tooling. Only useful on a Microsoft-subscribed tenant',
        entries: [
            { name: 'azure', marketplace: 'azure-skills' },
            { name: 'fabric-skills', marketplace: 'copilot-plugins' },
            { name: 'powerbi-authoring', marketplace: 'fabric-collection' },
            { name: 'microsoft-365-agents-toolkit', marketplace: 'copilot-plugins' },
        ],
    },
};

/**
 * A remedy a user can act on: what broke, what it costs, how to fix it, and
 * where the guided path is. Naming the blast radius matters — without it a
 * reader assumes the whole plugin is broken.
 */
function remedyFor(toolName) {
    const tool = TOOLS[toolName];
    if (!tool) return `Tool not found in PATH: ${toolName}`;
    const cmd = tool.install[platformKey()];
    const others = Object.entries(tool.install)
        .filter(([k]) => k !== platformKey())
        .map(([k, v]) => `  ${({ win32: 'Windows', darwin: 'macOS', linux: 'Linux' })[k]}: ${v}`)
        .join('\n');

    return [
        `${tool.label} is required here but was not found.`,
        '',
        `It unlocks: ${tool.unlocks}`,
        '',
        `Install it:`,
        `  ${({ win32: 'Windows', darwin: 'macOS', linux: 'Linux' })[platformKey()]}: ${cmd}`,
        others,
        '',
        'Or run /alex-act-one setup-dependencies to check and install everything at once.',
        'Nothing else in this plugin needs it.',
    ].join('\n');
}

module.exports = { TOOLS, PLUGINS, platformKey, remedyFor };
