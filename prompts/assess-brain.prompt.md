---
description: "Runs a read-only Markdown assessment of a local project brain or plugin source. Use when reviewing instructions, skills, prompts, agents, bundled Markdown resources, research documentation, and static capability routes before proposing changes."
---

# /assess-brain

Invoke [assess-brain](../skills/assess-brain/SKILL.md) for the assessment
procedure and its no-mutation boundary.

1. Ask for the explicit local target root if it is not provided.
2. Resolve `<plugin-root>` from the installed ONE package or explicitly selected
   canonical checkout. Use the [bundled analyzer](../scripts/assess-brain.cjs),
   relative to this prompt's actual location, not the target's working directory.
   Run `node "<plugin-root>\scripts\assess-brain.cjs" --root "<target-root>"`.
   If the bundled file is missing, report a packaging defect; never substitute
   a target-owned script.
3. Confirm `immutability.preserved` is `true` before reporting findings.
4. Separate Markdown findings, advisory candidates, structural manifest
   diagnostics, and unsupported runtime claims.
5. Do not modify, execute, install, publish, or otherwise mutate the target.

## Would Revise If

Revise by 2026-11-19 if the command leads users to expect automatic repair or
runtime execution rather than static assessment.
