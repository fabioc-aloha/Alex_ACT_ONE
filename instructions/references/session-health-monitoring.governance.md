# Session Health and Continuity Governance

## Always-On Rationale

Context capacity is a per-conversation property, not a per-file one. Proxy
heuristics, warning signs, and checkpoints must fire continuously across every
turn; a scoped glob would silence the monitoring exactly when sessions extend
across many file types.

Cross-session continuity has the same shape. Reading `HANDOFF.md` at session
start and noticing stale working-tree state are per-conversation disciplines,
not per-file ones. The two were separate always-on files until 2026-09-07; they
were merged because both owned the handoff record and both described the same
session boundary. The decision about *whether* to surface what continuity turns
up now lives once, in the `reliance-nudges` Inhibition Rules.

## Would Revise If

Revise by **2026-12-07** if:

- Proxy heuristics consistently mispredict session capacity, meaning the warning
  signs are miscalibrated for the current model class
- Hosts expose real token counts widely enough that the heuristics are dead
  weight
- Graceful handoff produces `HANDOFF.md` content the next session cannot resume
  from
- Cross-session recovery is noisy: most sessions where `HANDOFF.md` exists are
  unrelated to the current request
- Continuity records get treated as authority rather than as evidence that may
  be stale
