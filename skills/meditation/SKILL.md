---
name: "meditation"
description: "Consolidate session learning into permanent architecture — extract patterns into skills, instructions, prompts, native memory, or repository handoffs"
lastReviewed: 2026-08-18
---

# Meditation

Transform session insights into durable knowledge. Most sessions don't need it; some have a pattern worth keeping.

## When to Fire

- User says "let's meditate", "consolidate", or invokes `/alex-act-core meditate`
- End of a significant work session
- After solving a hard problem with a reusable insight
- Before a long break from a project

**Skip when**: the session was routine execution of patterns already encoded. Meditation on every session produces noise; the discipline is to write only what's new and portable.

## The Six Steps

### 1. Review

Scan the session honestly:

- What problems did we solve?
- What mistakes did we make?
- What patterns emerged that weren't already encoded?
- What would help future sessions?

### 2. Extract

Separate signal from noise. For each candidate pattern, ask: *"Is this already covered by an existing skill, instruction, or memory?"* If yes, skip. If no, route by type:

| If pattern is... | Create / update |
|---|---|
| Reusable project workflow or deterministic task | `project-capability-authoring` (local skill or validated script) |
| Always-on behavior or rule | Instruction (`.github/instructions/<name>.instructions.md`) |
| Repeatable workflow / slash command | Prompt (`.github/prompts/<name>.prompt.md`) |
| Shared library imported by other scripts | Library module (`scripts/shared/<name>.cjs`) |
| User preference (cross-project) | User memory (`/memories/<name>.md`) |
| Project / repo convention | Repo memory (`/memories/repo/<name>.md`) |
| Durable project session summary | Project chronicle (`.github/episodic/`) |
| Cross-session handoff (next session needs to know) | Repo file (`HANDOFF.md` at repo root) — NOT session memory |
| Cross-project reusable knowledge | Reviewed local candidate pending a separately approved capability |
| Cross-surface delegated work | Explicit local handoff |

This routing runs when meditation is invoked. Core no longer guarantees
automatic capture of every correction, preference, repeated pattern, or
significant decision. Native host memory may capture some signals, but that is
platform behavior rather than an Alex-owned deterministic trigger. An explicit
request to meditate is consent to evaluate candidates, not consent to write
project files or persistent memory.

Never publish automatically from a meditation, `HANDOFF.md`, or
`.github/episodic/`. Show the minimized knowledge candidate, apply the
universal PII guard, and keep it local until a separately approved capability
owns sharing it.

### 3. Write

Each artifact gets correct frontmatter, concrete examples (not abstractions), and tables with real data. Avoid the "capabilities list" anti-pattern — describe behavior, not features.

Route reusable project workflows and deterministic tasks to
`project-capability-authoring`; it previews the local skill or script and
requires explicit user approval before changing project files. For user or
repository memory, show the minimized candidate, apply the PII filter, and get
the relevant explicit user request or approval before writing.

For skills and instructions: include a **Trigger** or **When to fire** section so future sessions know when the pattern applies.

### 4. Chronicle (optional)

If the session arc was substantial, write to `.github/episodic/meditation-YYYY-MM-DD-<topic>.md`:

```markdown
# Meditation: <Topic>

**Date**: YYYY-MM-DD
**Focus**: What we worked on

## Accomplished
- [Key outcomes]

## Patterns Extracted
- [What became skills / instructions / memory]

## Lessons
- [Insights worth remembering]

## Open Questions
- [What remains unresolved]
```

Skip the chronicle for short sessions or when nothing new emerged.

### 5. Handoff (when ending a session)

If the user is closing the thread, write to repo-root `HANDOFF.md`:

```markdown
# Session Handoff

Last updated: YYYY-MM-DD HH:MM

## Just shipped
- [SHAs / files / outcomes]

## In progress
- [Specific next step + file paths]

## Pending queue
- [ ] [Ordered todos]

## Resume point
- [Where to pick up]
```

### 6. Post-Mortem (when something went wrong)

A failure is worth more than a success if you extract the pattern. When the session included a real mistake — a broken build shipped, a wrong assumption acted on, a destructive command run — write the analysis rather than moving past it:

```markdown
## Failure Post-Mortem

### What happened
[Concrete description of the failure]

### Root cause
[The actual reason, not the symptom]

### Pattern
[The generalizable mistake type]

### Prevention
[How to avoid this class of error]
```

Tag it in the chronicle for later retrieval: `#failure #<category>`. The **Pattern** field is the one that matters — a post-mortem that stops at root cause fixes one bug; one that names the pattern fixes a class.

## Quality Bar

A meditation is complete when:

- New patterns are persisted, not just acknowledged
- Failures are analyzed, not just noted
- Nothing important lives only in the context window
- Existing artifacts were checked for duplication before writing new ones
- The session can be closed without losing the thread

## Longer Cycles (optional)

Per-session meditation is one loop. Some projects find value in longer-cycle reviews on top:

- **Per release** — meditate on the work that shipped; extract lessons the release exposed
- **Per quarter (optional)** — audit accumulated learnings against project direction: are the patterns being extracted producing the outcomes we wanted?

Cadence is per-project. Adapt or skip based on the work rhythm. Meditation as a *ritual* should never outweigh meditation as a *tool*.

## Anti-Patterns

| Anti-pattern | Correction |
|---|---|
| Writing a meditation note for every session | Most sessions are routine execution; only write when something new emerged |
| Duplicating an existing skill / memory under a new name | Always grep first: is this already covered? |
| Aspirational notes ("we should do X someday") | Memory is for what was learned, not what was wished |
| Long prose chronicles when a one-line memory suffices | Match artifact size to insight size |
| Skipping the duplication check to "just capture it" | Adds noise that the next session has to filter |

## Related

- [/meditate prompt](../../prompts/meditate.prompt.md) — slash-command entry
- [proactive-awareness.instructions.md](../../instructions/proactive-awareness.instructions.md) — session-boundary context recovery and repository handoffs

## Falsifiability

- **Falsification deadline: 2026-11-15.** This skill adds no value if meditation sessions produce no actionable items (skill extractions, pattern recognitions, architecture insights, or reviewed continuity deposits) by that date
- The protocol is wrong if chronicles written per this format are never consulted in future sessions
- Stale if the memory tier structure changes and this skill references obsolete storage locations
