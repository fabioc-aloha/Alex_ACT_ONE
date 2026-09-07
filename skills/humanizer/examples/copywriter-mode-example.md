# Copywriter Mode — worked example

A short, self-contained demonstration of the workflow, using a fictional internal tool's
homepage (not a real product) so the example is safe to read and reuse without exposing any
project's actual content.

## Scope

- **Audience:** engineers based in India, reading in a professional but non-native-English
  context. They already know the product's own domain vocabulary and acronyms — that is
  explicitly out of scope for this pass.
- **Surface:** the homepage hero (eyebrow, `<title>`, meta description, H1, tagline, lede).
- **Goal:** flag language nuance only — idiom, tone, register, ambiguity, grammar — not jargon.

## Step 1: read-only pass, tag every finding

Reading the hero copy below:

> **Eyebrow:** DEPLOY TOOLKIT
> **`<title>`:** Ship it, don't sweat it — Deploy Toolkit
> **H1:** One dashboard for every release
> **Tagline:** We've got your back when a deploy goes sideways.
> **Lede:** No more babysitting a rollout at 2am. This tool has your six from commit to
> production, so your team can ship fast and still sleep at night.

## Step 2: present the hero as a before/after table, stop for approval

| Element | Current | Proposed | Why |
| --- | --- | --- | --- |
| Page `<title>` | "Ship it, don't sweat it — Deploy Toolkit" | "Deploy with confidence — Deploy Toolkit" | `[idiom]` "Ship it, don't sweat it" is two stacked colloquialisms in a browser tab title; the plain version keeps the reassurance without the idiom. |
| Tagline | "We've got your back when a deploy goes sideways." | "This tool helps you recover quickly when a deploy fails." | `[idiom]` "got your back" and "goes sideways" are both figurative; neither maps cleanly to its literal words. |
| Lede, sentence 1 | "No more babysitting a rollout at 2am." | "You no longer need to manually monitor a rollout at 2am." | `[register]` "babysitting" is overly casual next to the rest of the page's professional tone. |
| Lede, sentence 2 | "This tool has your six from commit to production, so your team can ship fast and still sleep at night." | "This tool tracks every step from commit to production, so your team can move quickly without losing sleep over it." | `[idiom]` "has your six" is military slang unlikely to be recognized. "ship fast and still sleep at night" is kept as a plain paraphrase rather than removed outright, since the underlying meaning (speed without losing rest) is not itself idiomatic. |

Note that the lede is two rows, not one: it carries a `[register]` concern in its first sentence
and an `[idiom]` concern in its second. Stacking both tags into a single "Why" cell would force
the user to accept or reject both together.

This is where the workflow stops — nothing below gets applied until the user approves each row.
In this fictional example, assume all four rows are approved before continuing.

## Step 3: after approval, verify, then move to the next scope

- Apply the four approved changes.
- Re-render or re-read the actual page (not just the diff) to confirm each change landed as
  written — a change that looks right in a diff can still render wrong if a template variable or
  truncation rule clips it.
- Only then move to the next section of the same page, or the next page.

## What this example does not show

- **A recurring-phrase decision.** If "ship fast" turned out to repeat across ten pages as an
  established tagline, the workflow calls for surfacing that once, across all ten, rather than
  fixing the homepage in isolation and leaving the other nine inconsistent.
- **A domain-literacy false positive.** If the audience were told upfront that "rollout,"
  "commit," and "production" are already familiar vocabulary, none of those words would appear as
  findings — only the idiom, tone, and register issues above would.
