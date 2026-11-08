---
description: "Fix lint always — if I edited a file, I own its lint state on exit, even for pre-existing findings"
applyTo: "**"
lastReviewed: 2026-08-18
---

# lint-discipline

## Activation and resident floor

Before declaring an edited file complete, and whenever its diagnostics report errors.

Own the lint state of touched files. Use the actual linter/diagnostics and fix relevant errors; if a fix is risky or exceeds approved scope, name the risk and ask rather than silently shipping or widening authority.

## Required execution

When the trigger requires the detailed workflow, load and follow [code-review](../skills/code-review/SKILL.md) in **completion** mode, including its runtime-lint-discipline reference where applicable. These guardrails apply before loading; a hyperlink alone is not execution.

Use native skill discovery first. Links are relative to the canonical installed instruction source, not this activated profile copy or an adopter checkout. If discovery is unavailable, locate the canonical alex-act-one package through native plugin discovery and use its bootstrap preview `routing.skillRoutes` and `routing.canonicalRoot` to resolve the linked skill. Report a missing owner/reference explicitly; never skip a required check or claim it completed. Loading grants no additional write, installation, send, or publication authority.
