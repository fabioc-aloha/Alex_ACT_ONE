---
name: setup-dependencies
description: "Check which optional dependencies this plugin can use, report what each missing one costs, and install them with consent. Covers Pandoc, Mermaid CLI, svgexport, jszip, and the pinned MCP servers for charts, image generation, and browser verification. Use after installing the plugin, when a skill reports a missing tool, or when checking for MCP updates."
lastReviewed: 2026-09-07
---

# Setup Dependencies

Most of this plugin needs nothing beyond Node. Roughly three quarters of its
skills run with no external tools at all. This skill handles the rest: seven
document converters that need Pandoc, a few visual skills that use optional
render helpers, and three MCP servers that back charts, image generation, and
browser verification.

Nothing here installs without consent. A dependency check is read-only.

## Check First

```text
node <this-skill>/scripts/check-dependencies.cjs
```

The report covers three things: external tools, the MCP servers, and the
optional plugins that extend this package. It writes nothing.

Add `--json` for a machine-readable version.

## What Is Optional

Nothing outside Node is required to use this package. The report separates two
kinds of gap because they cost different things:

| Gap | Effect |
| --- | --- |
| A missing tool (Pandoc, Mermaid CLI) | Blocks the skills that call it. The rest are unaffected |
| A missing MCP server | Blocks charts, image generation, and browser verification |
| A missing plugin | Blocks nothing. Plugins add capability this package does not claim |

Plugin installation is not handled here. `install-visual-companions` and
`setup-enterprise` own those flows because they carry the marketplace
registration, the consent gates, and the post-install caveats — several
companions pull roughly 100 MB of Chromium each. This skill reports the state so
one command shows the whole picture; it does not duplicate their install logic.

Plugin counts depend on which store the host reads. `copilot plugin list`
follows `COPILOT_HOME` when set and `~/.copilot` otherwise, and different apps
set different stores, so a plugin installed for one app may not appear for
another. The report prints the store it read for that reason.

## Install With Consent

| Kind | What `--apply` does |
| --- | --- |
| npm packages (`jszip`, Mermaid CLI, svgexport) | Installs them |
| System packages (Pandoc) | Prints the command for the current platform; does not run it |
| MCP servers | Directs to the provisioner below; does not run it |

Installing a system package silently is a surprise change to someone's machine.
The command is printed so the user chooses to run it.

```text
node <this-skill>/scripts/check-dependencies.cjs --apply
```

## MCP Servers

Three pinned servers back the chart, image, and browser-verification skills.
They install into plugin-private state and are launched by a direct Node shim,
never by npm or npx.

| Pinned package | Role |
| --- | --- |
| `flint-chart-mcp@0.5.1` | Chart rendering, ThemeSpec discovery, version-matched authoring resources |
| `replicate-mcp@0.9.0` | AI image generation. Also needs `REPLICATE_API_TOKEN` |
| `@playwright/mcp@0.0.78` | Browser verification of rendered output |

Procedure:

1. Run `node <this-skill>/scripts/provision-runtime.mjs` with no flags. It
   prints the effective `npm config get registry`, the exact package set, and
   the mutation boundary. It changes nothing.
2. Show that preview and ask whether to apply it. Installing the plugin is not
   consent for a separate package-network operation.
3. On approval, rerun with `--apply`.
4. Reload the host so its MCP processes restart through the direct launcher.

The provisioner installs nothing globally and never passes `--registry` or edits
`.npmrc`. Whatever registry the user has configured is the one it uses.

## Checking For MCP Updates

Run `provision-runtime.mjs --check-updates`. It compares each exact pin against
`dist-tags.latest` and changes nothing. If a stable update exists, stop: run
compatibility checks, update the source pins and guidance together, and release
them. Private runtime state must never run ahead of reviewed source.

## Failure Handling

| Signal | Action |
| --- | --- |
| A skill reports a missing tool | Run the dependency check; it names the install command for the current platform |
| A plugin shows as missing but the user installed it | Check the store line in the report. Apps read different stores; the plugin may be installed for a different one |
| Registry is unexpected | Stop. Correct npm configuration outside this skill, then preview again |
| Provisioning fails | Report npm's error without adding a registry override |
| Runtime reports missing private state | Run the provisioner again; do not substitute npx |
| Runtime reports a version mismatch | Re-provision from the reviewed source version; never launch stale state |
| `--check-updates` reports a stable update | Compatibility review before changing the pin |

## Anti-Patterns

| Anti-pattern | Correction |
| --- | --- |
| Install a system package without asking | Print the command; let the user run it |
| Tell a user the plugin is broken because one tool is missing | Name the affected skills only. The rest still work |
| Present optional plugins as requirements | Nothing outside Node is required. A missing plugin blocks nothing |
| Install a plugin from here | Route to `install-visual-companions` or `setup-enterprise`, which own the consent gates and caveats |
| Detect a corporate network and inject a registry | npm configuration is the authority, not network location |
| Run `npm install -g` for MCP servers | Global binaries collide; these stay plugin-private |
| Apply before showing the registry and package set | Preview first, then obtain explicit consent |
| Auto-install a newer stable version found by the audit | Compatibility first, then source update and release |

## Would Revise If

Revise by **2026-12-07** if a supported host cannot launch the private runtime
directly, if a direct launch starts npm or npx, if the dependency report and the
error messages skills emit ever disagree, or if two users complete setup and
still receive unexplained missing-dependency failures.
