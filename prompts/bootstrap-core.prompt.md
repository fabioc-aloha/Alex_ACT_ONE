---
description: "Preview, activate, verify, repair, or remove this plugin's user-scope runtime instructions. Use after installing or updating Alex ACT ONE, or when Alex ACT identity and always-on reasoning behavior are inactive."
lastReviewed: 2026-09-07
---

# /bootstrap-core

1. Read the linked [`bootstrap-core`](../skills/bootstrap-core/SKILL.md) skill.
2. Run its bundled `scripts/bootstrap-core.cjs` command without `--apply`.
3. Show the resolved distribution target and source, all file actions, receipt
   action, installed plugin version, manifest parity, user scope, and recursive
   workspace overlap report.
4. Ask for explicit activation or repair consent.
5. After consent, rerun the exact command with `--apply`.
6. Verify every destination hash and the receipt. A no-op apply must preserve
   receipt bytes.
7. Report legacy mixed-receipt evidence without modifying instructions owned by
   another plugin's receipt.
8. For removal, preview with `--remove`, ask separately, then rerun with
   `--remove --apply`. Reject unsafe receipt entries, preserve modified or
   unowned files, and report post-removal verification.

Instructions activate per app, not per machine. If the user wants the behavior
in more than one app, run this in each one.

Revise by **2026-12-07** if this prompt writes without consent, claims state it
does not own, or diverges from the linked script.
