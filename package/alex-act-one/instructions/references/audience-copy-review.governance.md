# Audience Copy Review Governance

## Always-On Rationale

The trigger is semantic, not path-derived: whether a reader outside the authoring team will use
the artifact to form an impression or make a decision. A README and an internal ADR are both
`**/*.md`, so no `applyTo` glob can separate them — the gate has to be resident and judge the
audience per artifact. It also has to fire on my own drafts, which have no path at all until the
moment I write them.

## Related

- `humanizer` skill, Copywriter Mode section — the six-tag taxonomy, hero-first ordering, and
  before/after table workflow this instruction routes to
- `communication-craft` skill — audience-lead structure (So-What/What/Now-What); this instruction
  governs sentence-level language fit inside an already-chosen structure
- `big-idea` skill — the claim the copy is making; audience review assumes the claim is settled

## Would Revise If

- The gate fires on an internal artifact despite the Audience Test's silence rule.
- The gate stays silent on a customer-facing artifact that needs a copy review.
- Findings are applied without approval, including when the assistant authored the text.
- The pass adds disproportionate overhead to a short artifact; refine the materiality boundary
  rather than weakening approval for substantive copy.
- The resident summary cannot support consistent taxonomy use; improve its routing to the
  skill before adding more always-on content.
