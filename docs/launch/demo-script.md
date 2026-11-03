# Launch demo script: the same prompt, twice

Goal: a 60 second screen capture that shows what Alex ACT ONE changes, with no narration needed. Captions carry the story. Record real runs only; if a run disappoints, use an alternate prompt below rather than staging an answer.

## Setup

- Two Copilot CLI sessions side by side, or recorded one after the other and edited into a split screen.
- Left session: plain install, no ACT ONE.
- Right session: ACT ONE installed and `/alex-act-one bootstrap-core` already run.
- Same model, same working directory (an empty scratch folder is fine), font large enough to read on a phone.

## The prompt (identical in both sessions)

```text
Our analytics dashboard takes 8 seconds to load and users are complaining.
Should we rewrite the backend in Rust or add Redis caching to get it under 2 seconds?
```

Why this prompt: it smuggles in three unexamined assumptions. The bottleneck is assumed to be the backend, the fix is framed as a binary choice, and the 2 second target is asserted with no source. A disciplined agent should catch at least the first two before recommending anything.

## Expected contrast

| Beat | Plain install (typical) | With ACT ONE (the discipline working) |
|---|---|---|
| First move | Picks an option or compares the two | Stops and audits the frame |
| Bottleneck | Assumes the backend is slow | Asks where the 8 seconds actually go: queries, payload, rendering, network |
| Options | Rust rewrite vs. Redis | Adds the missing options, including measuring first and fixing the slowest query |
| Target | Accepts 2 seconds | Asks what users need and what the business cost of each second is |
| Output | A recommendation | A short evidence plan, then a recommendation tied to what the evidence shows |

If the ACT ONE run does not show at least three of the right-hand behaviors, do not publish that take. Rerun once; if it still falls short, switch prompts and file an issue, because that is a product finding, not a marketing problem.

## Timing (60 seconds)

| Time | On screen |
|---|---|
| 0:00 to 0:05 | Caption: "Same prompt. Two installs." The prompt types into the left session. |
| 0:05 to 0:25 | Left answer scrolls. Caption highlights the assumed bottleneck and the binary choice. |
| 0:25 to 0:30 | Prompt types into the right session. Caption: "Now with ACT ONE active." |
| 0:30 to 0:52 | Right answer scrolls. Captions flag each catch as it appears: frame audit, missing evidence, added options. |
| 0:52 to 1:00 | End card: "Alex ACT ONE. 60 skills that make Copilot check its own work." Repo URL under it. |

## Alternate prompts (same loaded-frame pattern)

1. "Our churn went up 2 points last month. Should we cut prices 10 percent or add an onboarding wizard to win users back?"
2. "The migration to the new database will take 6 weeks. Should the team work weekends or drop the reporting feature to hit the date?"

## Deliverables from the recording

- Full 60 second video (MP4) for YouTube, LinkedIn, and the launch article.
- A GIF cut of the two first moves (about 12 seconds) for the README demo slot.
- One still of the right session's frame audit for social posts.

## Honesty rules

- No edited answers. Cuts for time are fine; changed words are not.
- No cherry-picked model settings: both sessions use the same model and defaults.
- If the plain install also catches the frame in a take, keep that take. The claim is a discipline that makes the catch routine, not a guarantee that a plain install never catches one.
