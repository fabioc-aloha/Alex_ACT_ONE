# Session Health Monitoring Governance

## Always-On Rationale

Context capacity is a per-conversation property, not a per-file one. Tracking proxy heuristics, warning signs, and checkpoints must fire continuously across every turn; a scoped glob would silence the monitoring exactly when sessions extend across many file types.

## Would Revise If

Revise by **2026-11-15** if proxy heuristics for token counts consistently mispredict session capacity (warning signs miscalibrated for the current model class), if the BYOK token-counter assumption breaks (extension UI no longer surfaces percent-full), if graceful-handoff produces `HANDOFF.md` content that the next session cannot pick up from, or if Core duplicates shared transport.
