# Curation Risk Analysis

> **ACT Tenet VI**: Match rigor to stakes. Reversible decisions deserve speed; irreversible ones deserve doubt.

Applied to curation work: accepting a bad skill is reversible (revert next patch). Shipping a broken release to consumers is expensive to undo.

## Risk Categories (Curation-Specific)

| Category | Examples |
|----------|----------|
| **Quality** | Skill has bugs, stale references, or misleading content |
| **Coherence** | New content conflicts with existing brain architecture |
| **Scope creep** | Feature belongs in a different repo or surface (not Core / Mall / Steward) |
| **Token budget** | Addition pushes Core past 25K instruction budget |
| **Breaking change** | Rename/remove that breaks heir upgrades |
| **Staleness** | Store/skill stays past its useful life, misleading by presence |

## Risk Matrix for Curation Decisions

| | Low Impact | Medium Impact | High Impact |
|---|-----------|---------------|-------------|
| **High Likelihood** | Ship with note | Gate on review | Full ACT pass + ADR |
| **Medium Likelihood** | Ship | Ship with note | Gate on review |
| **Low Likelihood** | Ship | Ship | Ship with note |

### Impact Calibration for This Repo

| Level | Curation Impact |
|-------|-----------------|
| **High** | Breaks heir upgrades, violates a governing project rule, token budget breach |
| **Medium** | Quality gap ships to heirs, coherence drift, stale reference |
| **Low** | Cosmetic issue, suboptimal wording, minor inconsistency |

### Likelihood Calibration

| Level | Probability | Curation Signal |
|-------|-------------|-----------------|
| **High** | >60% | Multiple heirs affected, or same issue seen before |
| **Medium** | 20-60% | Plausible failure mode, no prior occurrence |
| **Low** | <20% | Theoretical risk, strong mitigations in place |

## Decision Routing by Risk Score

| Score (L×I) | Route |
|-------------|-------|
| Low × Low | Proceed; cite the relevant evidence in the current response |
| Any Medium | Proceed with a trimmed ACT pass visible in the current response |
| Any High | Full ACT pass, write ADR, require explicit approval |
| High × High | Surface as an ADR and raise it directly with the owner before acting |

## When a Risk Register Is Needed

Use the project's existing decision record for consequential risks, not a per-skill usage ledger. Explicit risk registers are warranted only for:

- Release candidates (per your project's release process)
- Adopting an external artifact that scored below your project's acceptance bar
- Structural changes to your project's brain architecture

## Would Revise If

Revise if any of the following fires:

- A decision assessed as low risk ships and produces material downstream impact
