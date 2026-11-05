---
name: "code-review"
description: "Systematic code review for correctness, security, and growth — not just style enforcement"
lastReviewed: 2026-05-05
---

# Code Review

## Select the scope and mode

Review is read-only: do not modify input files or fix findings without a separate implementation request. State the actual diff/files reviewed and evidence limits. Prefer native review facilities when available; direct review is appropriate for a small evidence set. Do not require delegation, fixed models, or three parallel agents.

| Mode | Load only what is needed |
| --- | --- |
| ordinary (default) | [Review priorities and checks](references/ordinary-review.md); use native diff review or the available code-review capability |
| deep | [Independent perspectives and synthesis](references/deep-review.md), only when stakes justify it; perspectives are not a mandatory agent topology |
| specialist | [NASA/extension audit checklists](references/advanced-audits.md), only when explicitly applicable |
| completion | [Lint ownership](references/runtime-lint-discipline.md) and [scoped debt handling](references/runtime-no-deferred-debt.md); running completion checks does not require a separate code review |

Report reproducible defects with location, consequence, confidence, and severity. Check false-positive explanations. For explicit vulnerability review, use an available dedicated security-review capability; do not claim it exists on every host. General decision critique belongs to [critical-thinking](../critical-thinking/SKILL.md), not a forced code-diff workflow.

Missing tools/references are explicit limitations, not a clean result. Preserve user work and approval boundaries.

## Runtime contract references

Load only the reference selected by the triggering instruction; do not replay all runtime contracts for unrelated work. These references add no authority and do not call the instruction again.

- **completion**: [lint-discipline](references/runtime-lint-discipline.md)
- **completion**: [no-deferred-debt](references/runtime-no-deferred-debt.md)
