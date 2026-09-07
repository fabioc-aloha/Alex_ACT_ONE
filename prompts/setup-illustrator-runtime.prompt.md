---
description: "Audit the stable MCP server versions this plugin pins, preview and install them through npm's configured registry, then verify direct Node launches. Use when checking for updates, after installing or updating the plugin, or when the local runtime is missing."
lastReviewed: 2026-08-10
---

# /alex-act-one setup-illustrator-runtime

Use the `setup-illustrator-runtime` skill to establish direct MCP runtime readiness.

Steps:

1. Load the `setup-illustrator-runtime` skill.
2. For an update request, run `--check-updates` and report stable dist-tag differences without applying them.
3. If an update exists, require compatibility review and a governed source release before installation.
4. For setup, run the provisioner in preview mode.
5. Show the effective registry and exact package set.
6. Ask for explicit consent before `--apply`.
7. Apply only after consent, then run the verifier and report each MCP result.

Would revise by **2026-12-07** if this prompt bypasses preview, or if setup remains undiscoverable after installing the plugin.
