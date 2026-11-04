#!/usr/bin/env node
// audit-settings.cjs
//
// Deterministic settings audit for the setup-enterprise-stack skill. Diffs
// the repo-scope and user-scope Copilot settings files against the skill's
// canonical Microsoft-ecosystem block and emits the audit table as Markdown.
// Structured JSON comparison is done here, never in prose.
//
// Usage:
//   node audit-settings.cjs [--scope repo|user]
//                           [--repo-settings <path>]
//                           [--user-settings <path>]
//
// Defaults: --scope repo; repo file = .github/copilot/settings.json (relative
// to the current directory); user file = ~/.copilot/settings.json. A missing
// file is audited as empty settings. Marketplace registration is read from
// both files because the CLI registers marketplaces at user scope regardless
// of the enabledPlugins scope.
//
// Exit codes: 0 = audit produced, 2 = usage or parse error.

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const PLUGINS = [
    { id: "azure@azure-skills", marketplace: "azure-skills" },
    { id: "fabric-skills@copilot-plugins", marketplace: "copilot-plugins" },
    { id: "powerbi-authoring@fabric-collection", marketplace: "fabric-collection" },
    { id: "microsoft-365-agents-toolkit@copilot-plugins", marketplace: "copilot-plugins" },
];
const BUILT_IN_MARKETPLACE = "copilot-plugins";

function parseArgs(argv) {
    const args = { scope: "repo", repoSettings: null, userSettings: null };
    for (let i = 0; i < argv.length; i += 1) {
        const value = argv[i];
        if (value === "--scope") args.scope = argv[++i];
        else if (value === "--repo-settings") args.repoSettings = argv[++i];
        else if (value === "--user-settings") args.userSettings = argv[++i];
        else throw new Error(`Unexpected argument: ${value}`);
    }
    if (args.scope !== "repo" && args.scope !== "user") {
        throw new Error("--scope must be 'repo' or 'user'");
    }
    return args;
}

// Copilot settings files are JSONC in the wild: strip // and /* */ comments
// and trailing commas before parsing.
function parseSettings(text) {
    const withoutComments = text
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/(^|[^:"'])\/\/.*$/gm, "$1");
    const withoutTrailingCommas = withoutComments.replace(/,\s*([}\]])/g, "$1");
    return JSON.parse(withoutTrailingCommas);
}

function readSettings(filePath) {
    if (!fs.existsSync(filePath)) return {};
    const parsed = parseSettings(fs.readFileSync(filePath, "utf8"));
    if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
        throw new Error(`Settings file is not a JSON object: ${filePath}`);
    }
    return parsed;
}

function isEnabled(settings, pluginId) {
    return settings.enabledPlugins?.[pluginId] === true;
}

function isRegistered(settings, marketplace) {
    return Object.prototype.hasOwnProperty.call(settings.extraKnownMarketplaces ?? {}, marketplace);
}

function actionFor({ enabledHere, enabledOther, registered }) {
    if (enabledHere) return "nothing";
    if (enabledOther) return "move-scope";
    if (registered) return "enable-only";
    return "install";
}

function main() {
    const args = parseArgs(process.argv.slice(2));
    const repoPath = args.repoSettings
        ? path.resolve(args.repoSettings)
        : path.resolve(".github", "copilot", "settings.json");
    const userPath = args.userSettings
        ? path.resolve(args.userSettings)
        : path.join(os.homedir(), ".copilot", "settings.json");

    const repoSettings = readSettings(repoPath);
    const userSettings = readSettings(userPath);
    const chosen = args.scope === "repo" ? repoSettings : userSettings;
    const other = args.scope === "repo" ? userSettings : repoSettings;

    const yesNo = (value) => (value ? "yes" : "no");
    const lines = [
        `Scope audited: ${args.scope} (${args.scope === "repo" ? repoPath : userPath})`,
        "",
        "| Plugin | Currently enabled at chosen scope? | Currently enabled at other scope? | Marketplace registered? | Action |",
        "|---|---|---|---|---|",
    ];
    for (const plugin of PLUGINS) {
        const enabledHere = isEnabled(chosen, plugin.id);
        const enabledOther = isEnabled(other, plugin.id);
        const builtIn = plugin.marketplace === BUILT_IN_MARKETPLACE;
        const registered = builtIn || isRegistered(userSettings, plugin.marketplace) || isRegistered(repoSettings, plugin.marketplace);
        const action = actionFor({ enabledHere, enabledOther, registered });
        lines.push(`| \`${plugin.id}\` | ${yesNo(enabledHere)} | ${yesNo(enabledOther)} | ${builtIn ? "(built-in)" : yesNo(registered)} | \`${action}\` |`);
    }
    process.stdout.write(`${lines.join("\n")}\n`);
}

if (require.main === module) {
    try { main(); } catch (error) { console.error(error.message); process.exitCode = 2; }
}

module.exports = { actionFor, parseSettings };
