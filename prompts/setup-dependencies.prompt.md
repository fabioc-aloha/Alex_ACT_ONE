---
description: "Check which optional dependencies this plugin can use, report what each missing one costs, and install them with consent. Covers Pandoc, render helpers, and the pinned MCP servers. Use after installing the plugin, or when a skill reports a missing tool."
lastReviewed: 2026-09-07
---

# /setup-dependencies

Report what this plugin can use, what is missing, and what each missing piece
costs. Install only with explicit consent.

## Steps

1. Load the `setup-dependencies` skill.
2. Run `node <skill>/scripts/check-dependencies.cjs` and show the report as-is.
   It writes nothing.
3. If everything is present, say so and stop.
4. Otherwise, explain what each missing item unlocks and what still works
   without it. Most of the plugin does not depend on any of them.
5. Ask what the user wants installed. Do not assume.
6. For npm-based items, rerun with `--apply`.
7. For system packages such as Pandoc, show the command for the user's platform
   and let them run it. Do not run a system package manager on their behalf.
8. For MCP servers, preview `provision-runtime.mjs` first, show the registry and
   exact package set, then apply only after approval and tell the user to reload
   the host.
9. Report what was installed, what was skipped, and what still needs their
   action.

## Boundaries

- Never install a system package without the user running the command.
- Never claim the plugin is broken because a dependency is absent. Name the
  affected skills; the rest are unaffected.
- Never upgrade an MCP pin discovered by `--check-updates` without a
  compatibility review first.

## Would Revise If

Revise by **2026-12-07** if this prompt installs anything the user did not
approve, if it overstates the impact of a missing dependency, or if the report
disagrees with the errors that individual skills emit.
