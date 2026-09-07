# Audience Copy Review Governance

## Always-On Rationale

The trigger is semantic, not path-derived: whether a reader outside the authoring team will use
the artifact to form an impression or make a decision. A README and an internal ADR are both
`**/*.md`, so no `applyTo` glob can separate them — the gate has to be resident and judge the
audience per artifact. It also has to fire on my own drafts, which have no path at all until the
moment I write them.

## Related

- `humanizer` skill, Copywriter Mode section — the five-tag taxonomy, hero-first ordering, and
  before/after table workflow this instruction routes to
- `communication-craft` skill — audience-lead structure (So-What/What/Now-What); this instruction
  governs sentence-level language fit inside an already-chosen structure
- `big-idea` skill — the claim the copy is making; audience review assumes the claim is settled

## Would Revise If

- The gate fires on internal artifacts (`plan.md`, `HANDOFF.md`, session notes, commit messages)
  ≥2 times — the Audience Test table has a gap, or doubt is not resolving toward silence as
  written.
- The gate stays silent on a genuinely customer-facing artifact that later needed a copy pass ≥2
  times — the table under-enumerates and needs the missed surface added explicitly.
- Findings are applied without approval ≥1 time when I authored the text myself — the
  self-approval carve-out in "When I Am the Author" is not strong enough and needs to become a
  hard refusal rather than a stated obligation.
- The pass adds a visible turn cost on short artifacts (a two-line release note) that users
  consistently skip ≥3 times — add a length floor below which the gate stays silent, rather than
  weakening the rule for long copy.
- Copywriter Mode is invoked by this gate but the taxonomy proves unusable without the skill
  loaded ≥2 times — the four always-on obligations are too thin a summary and need the tag
  definitions inlined, accepting the token cost.
