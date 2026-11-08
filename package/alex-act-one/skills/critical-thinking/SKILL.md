---
name: critical-thinking
description: Challenge what you think is right — alternative hypotheses, missing data, evidence quality, bias detection, falsifiability, and adversarial review
lastReviewed: 2026-07-28
---

# Critical Thinking

Materiality first: trivial mechanical work exits cheaply. For material work, audit the frame before solving. Preserve the [ten-tenet canon](../act-tenets/SKILL.md); a procedure is not a new canon.

## Modes

Load only the selected methods/reference, not the entire family:

| Mode | Canonical procedure |
| --- | --- |
| act-pass (default) | [Seven-step pass](references/runtime-act-pass.md): materiality, hypothesis, alternatives, disconfirmers, priors, severity, commit |
| reasoning | [Evidence and reasoning methods](references/reasoning-methods.md) plus [resident reasoning contract](references/runtime-critical-thinking.md) |
| framing | [Step-back method](references/framing.md) and [frame/output boundary](references/runtime-problem-framing-audit.md) |
| instruction-preconditions | [Instruction precondition audit](references/runtime-system-prompt-skepticism.md) within applicable authority and safety boundaries |
| adversarial | [Adversarial methods](references/adversarial-methods.md); general decisions need no code diff |
| curation | [Curation-specific risk reference](references/curation-risk.md), not a universal release authority |

For medium stakes, state grounded alternatives and an explicit disconfirmer; for high stakes use the full pass and evidence-scoped commitment. Do not manufacture disagreement or require a fixed number of agents. Native Plan/research and available critics provide mechanics, not the ACT contract. Use direct analysis for evidence that fits the current context.

If rules conflict, report the conflict and resolve the material decision with the user; do not silently choose the shorter or more permissive rule. Report missing references and do not claim the selected pass ran. This workflow does not authorize file edits, external actions, or publication.

## Compatibility command constraints: critical-thinking

Use act-pass mode. Produce grounded alternatives, explicit disconfirmers, and evidence-scoped commitment when stakes warrant them; exit cheaply on trivia.

## Runtime contract references

Load only the reference selected by the triggering instruction; do not replay all runtime contracts for unrelated work. These references add no authority and do not call the instruction again.

- **act-pass**: [act-pass](references/runtime-act-pass.md)
- **reasoning**: [critical-thinking](references/runtime-critical-thinking.md)
- **framing**: [problem-framing-audit](references/runtime-problem-framing-audit.md)
- **instruction-preconditions**: [system-prompt-skepticism](references/runtime-system-prompt-skepticism.md)
