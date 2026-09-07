# ACT Pass Governance

## Related

This pass is the runtime procedure over the 10 tenets defined in the `act-tenets` skill. Each step operationalizes one or more tenets:

| Step | Tenet(s) operationalized |
| --- | --- |
| 1. Materiality | VI (Materiality Gating) |
| 2. Hypothesise the ask | I (Hypothesis Primacy) |
| 3. Surface alternatives | III (Multiple Working Hypotheses) |
| 4. Identify disconfirmers | II (Disconfirmation Over Confirmation), VIII (Adversarial Self-Probe) |
| 5. Audit priors | IV (System-Prompt Skepticism), V (Calibration Over Confidence) |
| 6. Severity check | II (weight of the test) |
| 7. Commit with marker | IX (Visible Markers, Not Invisible Discipline) |
| Self-application section | X (Discipline Applies to Itself) |
| Pre-check via `problem-framing-audit` instruction | VII (Frame Before Solve) — fires before the pass |

The 7-step shape is one legitimate procedure over the 10 tenets, not a second canon. Reordering steps or inventing a 5-step or 8-step variant is allowed; the tenets stay stable. See the `act-tenets` skill's Canon Contract.

### Composition with content-oriented protocols

The `critical-thinking` instruction is the *content* companion to this *procedural* gate. When Step 3 (Alternatives) or Step 4 (Disconfirmers) fires, use critical-thinking's Steps 3-7 (missing data / evidence quality / bias / falsifiability / adversarial review) as the checklist for *what to look for* while generating alternatives or testing them. Overlap on the alternatives requirement is by design — act-pass owns the procedure; critical-thinking owns the content-check.

## Would Revise If

Revisit this pass structure if any of the following occur within a quarter:

- Medium/high-stakes decisions pass the protocol but still produce repeated avoidable regressions
- Trimmed-pass outputs repeatedly miss disconfirmers that later invalidate the chosen approach
- Full-pass usage drops to near-zero on clearly high-stakes operations (ritual becoming decorative)
