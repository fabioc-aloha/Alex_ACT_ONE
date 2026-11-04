#!/usr/bin/env node
// check-release-drift.mjs
//
// Deterministic drift check for the platform-awareness skill: parses the
// highest VS Code release in the SKILL.md platform-changes table, reads the
// current stable release from the VS Code update feed, and reports how many
// releases the table is behind. The skill's revision trigger fires when the
// gap is more than 2 releases.
//
// Usage:
//   node check-release-drift.mjs [--skill <path-to-SKILL.md>]
//                                [--current <version>]
//                                [--max-gap <n>]
//
// --current overrides the feed lookup (offline runs, tests). Versions in the
// update feed are full semver (e.g. 1.106.2); the table tracks minor releases
// (e.g. 1.128), so the gap counts distinct minor releases newer than the
// table's highest entry. With --current, the gap is the minor difference.
//
// Exit codes: 0 = within tolerance, 1 = drift beyond --max-gap, 2 = error.

import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const FEED_URL = "https://update.code.visualstudio.com/api/releases/stable";

function parseArgs(argv) {
    const args = { skill: null, current: null, maxGap: 2 };
    for (let i = 0; i < argv.length; i += 1) {
        const value = argv[i];
        if (value === "--skill") args.skill = argv[++i];
        else if (value === "--current") args.current = argv[++i];
        else if (value === "--max-gap") args.maxGap = Number.parseInt(argv[++i], 10);
        else throw new Error(`Unexpected argument: ${value}`);
    }
    if (!Number.isInteger(args.maxGap) || args.maxGap < 0) {
        throw new Error("--max-gap must be a non-negative integer");
    }
    return args;
}

function minorOf(version) {
    const match = String(version).match(/^(\d+)\.(\d+)(?:\.(\d+))?/);
    if (!match) throw new Error(`Unparseable version: ${version}`);
    return { major: Number(match[1]), minor: Number(match[2]) };
}

function keyOf({ major, minor }) {
    return major * 1000 + minor;
}

// The platform-changes table rows start with the release in the first cell,
// e.g. "| 1.127   | Browser tools GA ...". Restrict the scan to those rows so
// version mentions in prose do not count.
function tableHighest(tableText) {
    let highest = null;
    for (const line of tableText.split(/\r?\n/)) {
        const match = line.match(/^\|\s*(\d+)\.(\d+)\s*\|/);
        if (!match) continue;
        const candidate = { major: Number(match[1]), minor: Number(match[2]) };
        if (!highest || keyOf(candidate) > keyOf(highest)) highest = candidate;
    }
    if (!highest) throw new Error("No release rows found in the SKILL.md platform-changes table");
    return highest;
}

async function fetchStableReleases() {
    const response = await fetch(FEED_URL);
    if (!response.ok) throw new Error(`Update feed returned HTTP ${response.status}`);
    const versions = await response.json();
    if (!Array.isArray(versions) || versions.length === 0) {
        throw new Error("Update feed returned no releases");
    }
    return versions;
}

async function main() {
    const args = parseArgs(process.argv.slice(2));
    const skillPath = args.skill
        ? path.resolve(args.skill)
        : path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "SKILL.md");
    const table = tableHighest(await readFile(skillPath, "utf8"));
    const tableLabel = `${table.major}.${table.minor}`;

    let currentLabel;
    let releasesBehind;
    if (args.current) {
        const current = minorOf(args.current);
        currentLabel = args.current;
        releasesBehind = Math.max(0, keyOf(current) - keyOf(table));
    } else {
        const releases = await fetchStableReleases();
        const current = minorOf(releases[0]);
        currentLabel = releases[0];
        const newerMinors = new Set(
            releases.map((v) => keyOf(minorOf(v))).filter((k) => k > keyOf(table)),
        );
        releasesBehind = newerMinors.size;
    }

    const drift = releasesBehind > args.maxGap;
    console.log(JSON.stringify({
        tableHighest: tableLabel,
        currentStable: currentLabel,
        releasesBehind,
        maxGap: args.maxGap,
        verdict: drift ? "DRIFT" : "OK",
    }));
    if (drift) {
        console.error(`Platform-changes table is ${releasesBehind} releases behind current stable (tolerance ${args.maxGap}). Update the table in SKILL.md.`);
        process.exitCode = 1;
    }
}

main().catch((error) => {
    console.error(`check-release-drift: ${error.message}`);
    console.error("Hint: pass --current <version> to run without the update feed.");
    process.exitCode = 2;
});
