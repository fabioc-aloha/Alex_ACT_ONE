---
description: "Preview, activate, verify, repair, or remove Core's 17 user-scope runtime instructions. Use after installing or updating Core, or when Alex ACT identity and always-on reasoning behavior are inactive."
lastReviewed: 2026-08-21
---

# /bootstrap-core

1. Read the linked [`bootstrap-core`](../skills/bootstrap-core/SKILL.md) skill.
2. Run its bundled `scripts/bootstrap-core.cjs` command without `--apply`.
3. Show the resolved distribution target and source, all file actions, receipt
   action, Core version, manifest parity, user scope, and recursive workspace
   overlap report.
4. Ask for explicit activation or repair consent.
5. After consent, rerun the exact command with `--apply`.
6. Verify all 17 destination hashes and the Core-owned receipt. A no-op apply
   must preserve receipt bytes.
7. Report legacy mixed-receipt evidence without modifying Manager greeting
   ownership.
8. For removal, preview with `--remove`, ask separately, then rerun with
   `--remove --apply`. Reject unsafe receipt entries, preserve modified or
   unowned files, and report post-removal verification.

Revise by **2026-11-15** if this prompt writes without consent, claims Manager
state, or diverges from the linked script.
