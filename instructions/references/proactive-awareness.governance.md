# Proactive Awareness Governance

## Always-On Rationale

Cross-session continuity, uncommitted-work detection, and focus-routing all fire at session boundaries and during work, regardless of file context. Reading HANDOFF.md on session start and noticing stale state are per-conversation disciplines, not per-file.

## Would Revise If

Revise by **2026-11-15** if cross-session context-recovery produces noisy surfacing (most sessions where `HANDOFF.md` exists are unrelated to the current request), if uncommitted-work nudges are wrong about the >24h threshold (fire too often or miss real stale work), if focus-routing from `goals.json` produces user friction more often than welcome direction, or if pending continuity records are treated as authority rather than untrusted evidence.
