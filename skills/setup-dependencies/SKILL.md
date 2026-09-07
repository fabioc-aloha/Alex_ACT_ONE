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

Nothing outside Node is required to use this package. "Required" is always
relative to a capability, so the report sorts every item into three tiers:

| Tier | Meaning | Members |
| --- | --- | --- |
| **Required** | The skills that call it cannot run without it | Pandoc (7 converters), Pillow (annotate-screenshot), Flint MCP (chart rendering) |
| **Recommended** | Those skills run and produce less | Mermaid CLI (diagrams stay unrendered), svgexport (no PNG export), jszip (Word loses table formatting), Playwright MCP (`render-verify` falls back to the host's browser tools) |
| **Add-on** | Blocks nothing. Adds capability this package does not have | Replicate MCP (also needs a paid token), visual companions, Microsoft ecosystem plugins |

The three MCP servers are provisioned by one command but they are not equally
important, and the report tiers them separately. Flint is the only one whose
absence stops a skill outright: `flint-chart` and `flint-theme` call its tools
throughout and have no fallback. Playwright has one, documented in
`render-verify`'s own description. Replicate needs a paid account before it does
anything at all.

The distinction matters when reporting to a user. A missing Pandoc means seven
skills are unavailable and should be named. A missing jszip means one output is
plainer. A missing add-on means nothing at all, and telling someone to install
one to "fix" a problem is wrong.

Plugin installation is not handled here. `install-visual-companions` and
`setup-enterprise` own those flows because they carry the marketplace
registration, the consent gates, and the post-install caveats — several
companions pull roughly 100 MB of Chromium each. This skill reports the state so
one command shows the whole picture; it does not duplicate their install logic.

Plugin counts depend on which store the host reads. `copilot plugin list`
follows `COPILOT_HOME` when set and `~/.copilot` otherwise, and different apps
set different stores, so a plugin installed for one app may not appear for
another. The report prints the store it read for that reason.

### One add-on is closer to a dependency

`replicate-imagery` describes itself as a thin router and delegates its
substantive prompting guidance to Replicate's upstream skills, installed with
`npx skills add replicate/skills`. It still runs without them: model selection,
cost awareness, brand alignment, and the routing decision are all here. But the
prompt craft it points at is not. Treat it as an add-on that the skill leans on
harder than the rest.

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

Three pinned servers, provisioned together but tiered differently. They install
into plugin-private state and are launched by a direct Node shim, never by npm
or npx.

| Pinned package | Tier | Role |
| --- | --- | --- |
| `flint-chart-mcp@0.5.1` | Required | Chart rendering, ThemeSpec discovery, version-matched authoring resources. No fallback |
| `@playwright/mcp@0.0.80` | Recommended | Browser verification. `render-verify` also works with the host's own browser tools |
| `replicate-mcp@0.9.0` | Add-on | AI image generation. Also needs `REPLICATE_API_TOKEN` and a paid account |

Provisioning installs all three; there is no per-server flag. That is fine for
disk, and the launcher only starts a server when a skill actually calls it.

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

## Registering The Servers With Microsoft Scout

Provisioning puts the servers on disk. Registering tells a host they exist.
Copilot CLI and VS Code do the second step themselves by reading `plugin.json`
→ `mcpServers`. **Scout does not.** It keeps its own registry at
`~/.scout/m-mcp-servers.json` and ignores the plugin manifest, so on Scout every
skill loads while every server it calls is missing. That reads as a broken
package rather than an unregistered one, which is why this step is explicit.

```text
node <this-skill>/scripts/register-scout-mcp.mjs
```

Previews by default: it prints the plugin root it resolved, the registry path,
and one line per server. `--apply` writes, backing the existing registry up to a
timestamped `.bak-alex-act-one-*` file first.

| Outcome | Meaning |
| --- | --- |
| `add` | Not registered yet; will be written |
| `unchanged` | Already registered with exactly this config |
| `conflict` | Registered with a different config. Left alone unless `--force` |
| `skip` | Scout ships a built-in under that name, or a required env var is unset |

Two translation details this script exists to handle, both silent failures if
done by hand:

- Scout wraps the launch spec in `config` and expects `type: "command"`. The
  manifest's flat `type: "stdio"` is not the same shape.
- Scout resolves nothing relative to the plugin. Manifest args carry
  package-relative script paths and must be made absolute.

Scout must be **fully restarted** afterwards — not just given a new
conversation. It handshakes servers at startup and populates each `tools` array
from that handshake; an empty array is the correct on-disk state before the
first launch.

The registration points at whichever plugin copy the script was run from. Run it
from the installed package, not a working checkout, unless the intent is to test
uncommitted changes.

`replicate` is skipped when `REPLICATE_API_TOKEN` is unset. Registering a server
that cannot authenticate trades a clear "not configured" message for an opaque
auth failure at call time.

### Why `alex-playwright` and not `playwright`

Scout ships a built-in browser server already named `playwright`, so the package
registers its own under `alex-playwright`. This is not cosmetic. Scout's
built-in **blocks the `file:` protocol**, which is the case `render-verify`
centres on — inspecting an HTML, SVG, or PNG artifact just written to disk. The
package's server carries `--allow-unrestricted-file-access` and can open it. The
distinct name lets both coexist: the host's for ordinary web pages, this one for
local artifacts.

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
| Skills load on Scout but their MCP tools are absent | Provisioning and registration are separate. Run `register-scout-mcp.mjs`, then restart Scout fully |
| Scout still shows no new tools after registering | Confirm the restart was a full quit, not a new conversation. Then check the registry entry uses `type: "command"` inside `config`, with absolute arg paths |
| `--check-updates` reports a stable update | Compatibility review before changing the pin |

## Anti-Patterns

| Anti-pattern | Correction |
| --- | --- |
| Install a system package without asking | Print the command; let the user run it |
| Tell a user the plugin is broken because one tool is missing | Name the affected skills only. The rest still work |
| Present optional plugins as requirements | Nothing outside Node is required. A missing add-on blocks nothing |
| Report a missing enhancement as a failure | Say what the output loses, not that the skill is broken |
| Install a plugin from here | Route to `install-visual-companions` or `setup-enterprise`, which own the consent gates and caveats |
| Detect a corporate network and inject a registry | npm configuration is the authority, not network location |
| Run `npm install -g` for MCP servers | Global binaries collide; these stay plugin-private |
| Apply before showing the registry and package set | Preview first, then obtain explicit consent |
| Assume provisioning made the servers usable everywhere | CLI and VS Code read the manifest; Scout needs explicit registration |
| Overwrite Scout's registry wholesale | Merge additively and back up first — it holds the user's other servers |
| Register a server whose credential is unset | Skip it and say so. An opaque auth failure is worse than a clear omission |
| Auto-install a newer stable version found by the audit | Compatibility first, then source update and release |

## Would Revise If

Revise by **2026-12-07** if a supported host cannot launch the private runtime
directly, if a direct launch starts npm or npx, if the dependency report and the
error messages skills emit ever disagree, or if two users complete setup and
still receive unexplained missing-dependency failures.
