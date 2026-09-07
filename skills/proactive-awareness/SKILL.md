---
name: proactive-awareness
description: "Applies cross-session context recovery, uncommitted-work detection, and focus routing after the resident instruction decides proactive behavior is appropriate. Use when continuity, worktree state, or active goals may change the response."
lastReviewed: 2026-08-18
---

# Proactive Awareness

The resident instruction decides whether proactive behavior is appropriate and
keeps the silence and frustration inhibition floors. Use this skill only after
that decision to apply PA1, PA2, or PA4.

## Cross-Session Context Recovery (PA1)

At the start of every relevant conversation:

1. **Check repo-root `HANDOFF.md`** — the canonical human-readable project handoff. If present, scan for current state, in-progress items, and next actions.
2. **Check session memory** — Read `/memories/session/` as a secondary signal. Session memory is by-design ephemeral and clears at conversation end; any handoff content here is a lower-tier signal than `HANDOFF.md`. Scan titles and status fields if present.
3. **Check dream reports (if available)** — If `.github/quality/dream-report.json` exists, note the last dream date and any issues. Skip silently if absent — not every project ships a dream pipeline.
4. **Summarize briefly** — If relevant prior context exists (from `HANDOFF.md` or session memory), offer a one-line summary: *"Last session you were working on [X]. Want to continue?"*

### When to Surface Context

| Signal | Action |
| --- | --- |
| `HANDOFF.md` present with recent content | Mention proactively |
| Session memory file with `Status: Active` | Mention proactively (secondary signal) |
| Session memory file with `Status: Concluded` | Skip — already wrapped up |
| No `HANDOFF.md`, no session memory files | Start fresh, no mention |
| Dream report shows issues (if dream pipeline present) | Mention if relevant to current request |

### When NOT to Surface

- User's first message is clearly a new topic — don't force old context
- User explicitly starts with "new topic" or unrelated request
- Session memory is stale (>7 days old)

## Uncommitted Work Detection (PA2)

When starting a session or after completing a task that touched files:

1. **Check git status** — Look for staged but uncommitted changes, or modified tracked files.
2. **Privacy**: Surface file *count* only, not file names or paths, in nudges.
3. **Threshold**: Only alert if uncommitted changes are >24 hours old (based on file modification time).
4. **Nudge format**: *"You have N uncommitted changes from [timeframe]. Want to review and commit?"*

### Detection Rules

| Condition | Priority | Message |
| --- | --- | --- |
| Staged changes >4 days | High | "N files staged but uncommitted for N days" |
| Staged changes >24h | Medium | "N uncommitted staged changes" |
| Modified tracked files >24h (not staged) | Low | Mention only if user asks about project status |

## Focus Routing (PA4)

Read `.github/config/goals.json` for the user's active focus (heir-authored; absent on fresh installs by design):

1. If an active goal exists, mention it at session start: *"Current focus: [goal title]"*
2. When the user's request is ambiguous, route toward the active goal.
3. Don't force routing — if the user clearly wants something else, follow their lead.

## Boundaries

- Do not override the resident silence or frustration inhibition floors.
- Do not expose worktree filenames or paths in an uncommitted-work nudge.
- Do not treat ephemeral session memory as the durable cross-session handoff.

## Anti-Patterns

| Anti-pattern | Correction |
| --- | --- |
| Surfacing stale continuity during a new topic | Let the resident gate suppress it. |
| Naming changed files in a nudge | Report only a count and timeframe. |
| Forcing the active goal onto a clear user request | Follow the explicit request. |

## Would Revise If

Revisit by **2026-11-18** if the detailed procedure fails to load after the
resident route, a continuity nudge interrupts flow despite the inhibitory gate,
or a handoff response uses session memory instead of `HANDOFF.md`.
