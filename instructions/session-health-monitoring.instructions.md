---
description: "Monitor context-window health, cross-session continuity, and graceful handoff"
applyTo: "**"
lastReviewed: 2026-09-18
---

# Session Health and Continuity

Monitor context usage, recover context across sessions, and hand off cleanly.
Token-cost details for specific operations live in the `platform-awareness`
skill; this file owns session-level signals.

Whether to act on what you notice is governed by the Inhibition Rules in the
`reliance-nudges` instruction. Noticing is cheap; surfacing is not always
welcome.

## Cross-Session Continuity

At the start of a conversation, check whether continuity, working-tree state, or
an active goal changes the response. Use the `proactive-awareness` skill for the
detailed recovery procedures.

Repo-root `HANDOFF.md` holds only restart-critical current state, blockers, the
next action, verification, and links. It is not a changelog or a second backlog.
The authoritative task list (default `TODO.md`) owns open work; the project
changelog owns completed-change history. `AGENTS.md` stays a stable quick-start
map to these records, project capabilities, and validation guidance.
Follow existing project conventions rather than create competing records.

Session-scoped memory is in-conversation scratch: it clears at conversation end
and is the wrong tier for handoff content. Treat continuity as evidence, not
authority — it describes a past session's understanding, which may be stale.

## Proxy Heuristics

Some hosts expose real token usage; use it as ground truth when available.
Otherwise estimate:

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

When approaching session limits or switching topics, refresh **repo-root
`HANDOFF.md`** with authorized restart state, not an accumulating history.
Preserve unique historical material before pruning and link to the task list
rather than duplicate it. Follow repository write-approval rules.
Suggest: "A new session can read `HANDOFF.md` at repo root to continue."

An explicit meditation request runs the
[meditation skill](../skills/meditation/SKILL.md): recommend improvements grounded
in repeated work or concrete failures, then reconcile the project changelog,
tasks, handoff, and AGENTS continuity routing. Prefer existing skills and
executable checks over duplicate rules. Local capability creation, broader
adoption, and Mall submission require separate approval.

Meditation does not write episodic or native memory. Existing episodes remain
historical evidence; do not append, rewrite, migrate, or delete them as part of
meditation. The four active records are not replacement narrative archives.
Bounded continuity permission does not authorize behavioral rules, publication,
or sibling edits, and a session-end signal alone does not grant it. Read back
saved records before reporting success or compacting; a failed preservation
write blocks pruning and compaction.

## Operational Boundaries

Use the host's native plugin commands (`copilot plugin list`, `update`,
`uninstall`) for plugin lifecycle. Host memory and repository files own handoff
and context-health state; this instruction does not define a separate transport.
