---
name: risk-analysis
description: Probability × impact risk assessment for curation and planning decisions. Categorize risks (quality, coherence, scope creep, token budget, breaking change, staleness), score by likelihood × impact, and route by risk score to ship / gate / ADR. Use before shipping a change, when accepting an external artifact, when running a pre-release gate, or when triaging findings.
lastReviewed: 2026-07-31
---

# risk-analysis

Compatibility entrypoint for curation-specific likelihood/impact and approval routing.

Load and follow [critical-thinking](../critical-thinking/SKILL.md) in **curation** mode before proceeding. Pass the original inputs and constraints; use its selected reference and output contract. Do not copy its procedure or load this alias again from the owner.

If the owner is unavailable, report the missing capability and stop. This alias grants no additional write, installation, or publication authority.
