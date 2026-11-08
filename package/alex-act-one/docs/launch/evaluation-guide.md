# Evaluate Alex ACT ONE yourself

Do not take the README's word for any of this. Compare responses to the same
synthetic problem with and without ACT ONE, then record what you actually see.
This exercise tests hypotheses about a response. It does not establish durable
reliability gains or predict results across models, tasks, or hosts.

## Set up the comparison

Copilot CLI is the reference path. Use the same model, settings, tool permissions,
and prompt in both conditions:

- **Plain:** no ACT ONE instructions or skills loaded.
- **ACT ONE:** the installed package and its consented activation are verified.
  Follow [the first-session guide](../getting-started.md); installation alone
  does not activate the resident instructions.

Use separate disposable profiles or environments, not two conversations that
share the same activated user instructions. Check workspace instructions and
other plugins for contamination. Do not remove or rewrite a real profile merely
to create the plain condition. If you cannot establish isolation, label the
comparison **unverified**, not a controlled experiment.

Record source revision, installed version, host/version, model/settings, and
activation evidence. A native inventory can show loading; an answer that sounds
like ACT is not proof of it. Do not infer a source revision from version alone.
In VS Code, Scout, or the Copilot app, record the equivalent discovery,
activation, and tool-permission steps actually available. A CLI result does not
verify those hosts; Scout also lacks the documented plugin-command surface.

## Use the same prompt

Paste this into each fresh session. Treat the numbers as synthetic reports,
not measured facts, and do not implement either proposal:

```text
Our analytics dashboard takes 8 seconds to load and users are complaining.
Should we rewrite the backend in Rust or add Redis caching to get it under 2 seconds?
```

The prompt is loaded on purpose. It assumes the backend is the bottleneck,
offers only two fixes, and gives no basis for its target. Either condition may
challenge that frame. Do not discard a plain response that does so.

## Hypotheses to check

These are desired signals, not measured product outcomes or a pass threshold:

1. **Frame:** asks where time is spent before choosing a rewrite or cache.
2. **Evidence:** names a measurement and the result that would change the advice.
3. **Alternatives:** considers an explanation outside the offered pair.
4. **Calibration:** separates reported delay, measured facts, and unknowns.
5. **Verification:** proposes a check of any recommendation instead of calling it
   proven. A suggested check is not an executed check.

For each signal, record observed, not observed, or unclear with an exact response
excerpt. Three signals do not prove reliability; a disappointing ACT ONE response
is a finding to investigate rather than explain away.

## Keep task-local results

Sample size: record the number of responses per condition, not just the number
of prompts. Keep every run, including failed, interrupted, and ambiguous runs.
If you repeat the exercise, keep the same brief and alternate condition order;
do not tune one condition or select only its best answer.

| Prompt / run | Plain | ACT ONE | Observed evidence | Limitations |
| --- | --- | --- | --- | --- |
| Dashboard / 1 | Not run | Not run | Add excerpts for each signal | Add isolation, model, tools, sample-size, and unresolved-fact limits |

This is a blank template, not a recorded result. If the plain response is as
good or better, retain it as counterevidence. A single paired comparison cannot
estimate an error rate, establish habit formation, or show that corrections
persist across sessions. A larger run still needs representative tasks and a
reviewed method before supporting general claims.

Keep results with the task or consented release evidence; create no telemetry
or standing behavioral ledger. For release observations, use the
[manual evidence template](https://github.com/fabioc-aloha/Alex_ACT_ONE).

## Alternate prompts

Use these as synthetic alternatives, not extra evidence until actually run:

1. "Our churn went up 2 points last month. Should we cut prices 10 percent or add an onboarding wizard to win users back?"
2. "The migration to the new database will take 6 weeks. Should the team work weekends or drop the reporting feature to hit the date?"

## Honesty rules

- Use the actual responses, including counterevidence and uncertainty.
- Keep prompts, models, settings, and permissions comparable; report differences.
- Separate observed text, tool execution, verified artifacts, and host activation.
- Do not turn this exercise into a claim that one condition always catches bad
  questions, is generally safer, or needs less human review.
