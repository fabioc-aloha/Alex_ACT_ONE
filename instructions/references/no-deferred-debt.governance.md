# No Deferred Debt Governance

## Always-On Rationale

Debt surfaces in any context (script run, doc audit, file edit, command output). The "fix in same turn" discipline must fire whenever debt is observed, not only when working on specific file types. A scoped glob would create the failure mode it's designed to prevent.

## Would Revise If

- **Date-based**: 2026-08-23. If by then the rule has produced no observed change in deferral-language in commits or HANDOFF entries, sunset.
- **Event-based**: at 10 debt-surfacing turns where the rule had opportunity to fire, audit. If bypassed ≥3 times with "non-blocking deferred" framing and no decision-blocker named, sunset.
- **Scope-creep**: if the rule turns single-file fixes into rabbit holes that consistently double the turn's scope ("fix now" overhead > "fix later" cost) ≥3 times in a quarter, narrow the rule or codify a batching exception.
