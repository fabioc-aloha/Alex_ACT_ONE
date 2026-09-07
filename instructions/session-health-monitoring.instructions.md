---
description: "Monitors context-window health and graceful handoff continuously, using native plugin lifecycle commands and repository continuity"
applyTo: "**"
lastReviewed: 2026-08-18
---

# Session Health Monitoring

Monitor context usage and ensure graceful session transitions. Token-cost details for specific operations live in the `platform-awareness` skill and in skill bodies; this file owns session-level signals.

## Proxy Heuristics

VS Code does not expose token counts for built-in models. **BYOK models (1.120+) show real token usage and percent-full in the Chat view context-window control** — use that as ground truth when available. For non-BYOK or older builds, estimate via:

| Signal | Interpretation |
|--------|----------------|
| ~4 characters | ≈ 1 token |
| Large file read (500+ lines) | ~2,000-5,000 tokens |
| Base64 image in response | ~10,000-50,000 tokens (avoid — write to file) |
| Unfiltered terminal output | Variable, often 1,000+ tokens (use `Select-Object -First 20`) |

## Warning Signs

| Signal | Action |
|--------|--------|
| Forgetting early conversation context | Update session memory, suggest new session |
| Responses truncating unexpectedly | Reduce output verbosity, offload to files |
| Repeated clarification of established facts | Context may be dropping off |
| User mentions "you forgot" or "we discussed" | Acknowledge, re-read session memory |

## Checkpoints

- **After 6+ exchanges**: consider updating session memory
- **Before image work / large reads**: warn about token cost, confirm approach
- **After major milestone**: summarize progress to session memory
- **If unsure about capacity**: offer to start fresh session with handoff

## Graceful Handoff

When approaching session limits or switching topics, write the cross-session handoff to **repo-root `HANDOFF.md`** (state, completed work, next steps, pending decisions). `/memories/session/` is for in-conversation scratch only — it clears at conversation end and is the wrong tier for handoff content. Suggest: "New session can read `HANDOFF.md` at repo root to continue."

## Operational Boundaries

Core owns its instruction and project-bootstrap health. Use native
`copilot plugin list`, `update`, and `uninstall` commands for plugin lifecycle.
Native host memory and repository continuity own normal handoff and
context-health practices. Core does not provide or route to a shared transport.
