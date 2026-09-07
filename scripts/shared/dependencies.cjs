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
 * `required: false` means the calling script degrades and keeps going.
 */

const TOOLS = {
    pandoc: {
        label: 'Pandoc',
        kind: 'system',
        required: true,
        unlocks: 'document conversion (docx-to-md, html-to-md, md-to-word, md-to-html, md-to-eml, md-to-txt, rich-email)',
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
        required: false,
        unlocks: 'Mermaid diagrams rendered into Word and HTML output',
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
        required: false,
        unlocks: 'PNG export of SVG banners and figures',
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
        required: false,
        unlocks: 'Word post-processing (table formatting, image centering)',
        probe: null,
        install: {
            win32: 'npm install jszip',
            darwin: 'npm install jszip',
            linux: 'npm install jszip',
        },
    },
};

function platformKey() {
    if (process.platform === 'win32') return 'win32';
    if (process.platform === 'darwin') return 'darwin';
    return 'linux';
}

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

module.exports = { TOOLS, platformKey, remedyFor };
