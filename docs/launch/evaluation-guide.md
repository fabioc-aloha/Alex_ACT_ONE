# Evaluate Alex ACT ONE yourself

Do not take the README's word for any of this. Run one loaded prompt through a plain Copilot install, then through Copilot with ACT ONE active, and score what changes. Fifteen minutes, no setup beyond the install itself.

## The test

You need two Copilot CLI sessions with the same model and the same defaults:

- Session one: plain install, no ACT ONE.
- Session two: ACT ONE installed, with `/alex-act-one bootstrap-core` already run once.

Paste the same prompt into both:

```text
Our analytics dashboard takes 8 seconds to load and users are complaining.
Should we rewrite the backend in Rust or add Redis caching to get it under 2 seconds?
```

The prompt is loaded on purpose. It assumes the backend is the bottleneck, offers only two fixes, and sets a 2 second target from nowhere. A careful agent should catch at least the first two before recommending anything.

## What to look for

Score each answer on five things:

1. **Does it check the question before answering it?** The plain answer usually picks a side. The ACT ONE answer should stop first and ask where the 8 seconds are actually spent: queries, payload, rendering, network.
2. **Does it ask for evidence?** Look for a named measurement, not a vibe. "Profile the slowest query" counts. "It depends" does not.
3. **Does it widen the options?** The honest answer is often neither Rust nor Redis. Watch for options the prompt left out, starting with measure first.
4. **Does it mark its confidence?** Facts, reports, estimates and guesses should not all sound the same. ACT ONE labels them.
5. **Does it check its own output?** A recommendation is a draft until someone verifies it. Look for the check, not just the answer.

Three or more of these, clearly present, is the discipline working. If the ACT ONE run shows fewer, that is a product finding worth an issue, not something to explain away.

## What you get if it works

- **Fewer confident wrong answers.** The frame audit catches the bad question before the agent builds on it.
- **Evidence before recommendations.** You see what to measure and what result would change the answer.
- **Confidence you can read.** A guess is labeled a guess, so you know what to verify yourself.
- **Output that gets checked.** Plans, prose and charts are reviewed before they are called done.
- **Corrections that stick.** When you fix a mistake, the fix becomes a rule or a skill, so the same mistake does not come back next session.

## Alternate prompts

Same loaded-frame pattern, if you want a second test:

1. "Our churn went up 2 points last month. Should we cut prices 10 percent or add an onboarding wizard to win users back?"
2. "The migration to the new database will take 6 weeks. Should the team work weekends or drop the reporting feature to hit the date?"

## Honesty rules

- Use your real runs, exactly as they come out. If a run disappoints, that is data.
- Same model, same settings, both sessions. No tuning one side to win.
- If the plain install catches the frame too, good. The claim is not that a plain agent never catches a bad question. The claim is that ACT ONE makes catching it a habit.
