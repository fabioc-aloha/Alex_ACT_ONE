---
description: "Route user-facing and customer-facing prose through humanizer's Copywriter Mode by default — audience-fit review before it ships, silent for internal artifacts"
applyTo: "**"
lastReviewed: 2026-09-03
---

# Audience Copy Review

Prose written for someone outside the authoring team is a different artifact from prose written
for the team. The author's idiom, register, and shorthand are invisible to the author. This gate
fires before that copy ships, not after a reader misreads it.

## The Audience Test

Ask one question of any prose I am about to write or revise:

> Will someone outside the authoring team read this to form an impression or make a decision?

If yes, the gate fires. If no, stay silent.

| Fires | Silent |
| --- | --- |
| READMEs, docs sites, landing/marketing copy | `plan.md`, scratch notes, session state |
| Release notes, changelogs read by adopters | `HANDOFF.md`, todos, internal trackers |
| Customer or stakeholder email, proposals, decks | ADRs and internal design records |
| Status reports leaving the team | Code comments, commit messages |
| Public issue/PR bodies on an open repo | Internal-only issue threads |
| Onboarding and support content | My own reasoning shown mid-task |

Two clarifiers, because the boundary is where this rule fails:

- **The test is the reader, not the file type.** A README and an internal ADR are both markdown.
  One ships to strangers; one does not.
- **Doubt resolves toward silent.** Over-firing on internal notes trains the user to ignore the
  gate, which costs more than a missed README.

## What Firing Means

Apply humanizer's **Copywriter Mode** — the five-tag taxonomy (`[idiom]`, `[tone]`, `[register]`,
`[ambiguity]`, `[grammar]`), hero-first ordering, and the before/after table. Load the skill for
the full workflow; the always-on obligations are:

1. **Name the audience** before reviewing. "General reader" is a real answer; an unnamed audience
   is not, and produces unfocused findings.
2. **Domain acronyms and jargon are out of scope** unless the user says otherwise. A domain-expert
   audience does not need its own vocabulary expanded, and over-flagging trains rejection.
3. **Nothing applies without approval.** Findings are a proposal. This holds even when I authored
   the text myself in the same turn — especially then, since self-approval defeats the gate.
4. **One tag per row.** An element with two concerns splits into two rows, so each can be accepted
   or rejected on its own.

## When I Am the Author

The most common trigger is my own output, not a document the user hands me. When I draft a README,
release note, or customer-facing summary, I run the pass on my own draft before presenting it, and
present findings as proposals rather than silently rewriting.

Applying my own findings without asking is the failure this gate exists to prevent — it produces
exactly the large unreviewed diff that Copywriter Mode was built to replace.

## Anti-Patterns

| Anti-pattern | Correction |
| --- | --- |
| Firing on `plan.md` or session notes | Internal. Stay silent. |
| Flagging acronyms the audience uses daily | Out of scope by default. Confirm before flagging. |
| Rewriting my own draft silently, then presenting it as finished | Present the findings, let the user choose. |
| Stacking `[idiom]` and `[tone]` in one table row | Split into two rows. |
| Flattening every figurative phrase | "Low-risk, keep it" is a legitimate finding. |
| Fixing one instance of a repeated tagline | Recurring phrases are one decision across all sites. |
