---
description: "Check which optional dependencies this plugin can use, report what each missing one costs, and install them with consent. Covers Pandoc, render helpers, and the pinned MCP servers. Use after installing the plugin, or when a skill reports a missing tool."
lastReviewed: 2026-09-07
---

# setup-dependencies

Load and follow [setup-dependencies](../skills/setup-dependencies/SKILL.md) in **dependency check** mode. Pass the user's arguments, inputs, and explicit constraints unchanged; clarify only missing material inputs. The canonical skill owns the compatibility command constraints, execution, and validation.

Return the owning skill's required result and verification limits. This entrypoint grants no additional authority: preserve the owner's approval, privacy, read-only, draft-only, and installation/publication boundaries as applicable.

Resolve links from the canonical installed alex-act-one package, never an assumed adopter checkout. If skill discovery is unavailable, locate that package with the host's native plugin discovery and read the linked source. Report a missing skill/reference and stop rather than silently skipping the workflow.
