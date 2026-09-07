---
name: manage-scout-copilot-skill-bridge
description: "Preview, apply, or validate the curated read-in-place bridge from the global Copilot plugin store into Scout. Use after a Copilot plugin update, when Scout cannot resolve a bridged skill, or before adding a skill to the Scout allowlist."
lastReviewed: 2026-08-25
---

# Manage the Scout-Copilot Skill Bridge

Keep one canonical copy of a selected skill in the global Copilot plugin store
and expose it to Scout through `~/.copilot/skills`. The bridge uses directory
junctions on Windows and directory symlinks elsewhere. It never copies a skill
body into Scout-local storage.

## Preview First

Run the bundled doctor without `--apply`:

```text
node <this-skill>/scripts/scout-copilot-skill-bridge.cjs
```

The preview reads Core's bridge manifest, resolves every declared plugin skill,
reports missing sources, existing link actions, duplicate names, and whether
Scout still has an excluded plugin installed. It writes nothing.

The command deliberately defaults to `~/.copilot`, not `COPILOT_HOME`. A Scout
hosted shell can set `COPILOT_HOME` to Scout's private runtime directory; using
that value as the bridge source would create a second lifecycle path.

## Apply After Review

After reviewing the exact plan, create or repair only manifest-owned links:

```text
node <this-skill>/scripts/scout-copilot-skill-bridge.cjs --apply --canary
```

`--apply` creates missing links and repoints only an existing junction or
symlink that the manifest owns. It refuses to replace a normal user directory
or file. It never deletes unlisted entries in the bridge library and never
installs or uninstalls a plugin.

`--canary` verifies representative Core, Document Tools, Illustrator, and AI
Operations planning skills through the completed bridge. Start a fresh Scout
conversation and resolve the reported canary names before treating a host update
as complete.

## Update Workflow

1. Review and run the appropriate `copilot plugin update` command in the global
   Copilot store.
2. Run this doctor in preview mode.
3. Review missing sources, link actions, and excluded Scout-plugin findings.
4. Apply only when the plan is clean.
5. Run the canary and confirm Scout's native browser, Flint, WorkIQ, filesystem,
   shell, and YouTube tools remain available.

## Ownership Boundary

- Core's sixteen instructions remain Scout-native and receipt-owned. They are
  never bridged as skills.
- Scout owns its native MCP servers. Do not install Illustrator only to obtain
  Flint or Playwright in Scout.
- Enterprise and MSFT are Copilot-only. Scout's native Microsoft 365 and WorkIQ
  capabilities are not a reason to bridge their setup skills or Agency agents.
- `model-router` plans provider work but does not authorize or execute it.
  Provider execution, credentials, and provider MCP servers stay Copilot-only
  until a separate consented Scout adapter exists.

## Adding a Skill

Add a skill only after documenting its source plugin, host-neutral behavior,
required Scout capabilities, and fallback in Core's bridge manifest. Then add a
deterministic test and a disposable Scout-session canary. Do not infer
eligibility from a plugin directory alone.

## Would Revise If

Revise by **2026-11-25** if normal Copilot updates cannot preserve valid link
targets, a clean Scout session cannot resolve an allowlisted skill, an excluded
plugin is necessary for a safe Scout workload, or the doctor cannot distinguish
its own links from user-owned content.
