---
name: "meditation"
description: "Review session outcomes, recommend reusable skills or automation, and reconcile project guidance, handoff, tasks, and change history."
lastReviewed: 2026-09-18
---

# Meditation

Improve how future work gets done and leave the project ready for the next
session. Look for useful project capabilities and recommendations, not another
session narrative. Continuity cleanup is part of every explicitly requested
meditation; a new skill is not.

## When to Fire

- User says "let's meditate", "consolidate", or invokes `/alex-act-one meditate`
- End of a significant work session
- After solving a hard problem with a reusable insight
- Before a long break from a project

**Skip capability recommendations when** the session was routine execution of
patterns already encoded. Still reconcile continuity when explicitly asked to
meditate: completed work and changed task state belong in the existing project
records even when no new skill is justified. With no changed state or worthwhile
recommendation, make no duplicate entry or timestamp-only edit.

## Authority and Scope

An explicit request to meditate authorizes routine continuity writes in the
current repository: the project changelog, task lists, and handoff, plus
necessary continuity-routing repairs in `AGENTS.md`. Do not ask
for separate approval for each of these writes unless repository policy requires
it. Merely suggesting meditation, reaching session end, or discussing edits to
this skill does not grant that authorization.

This permission does not authorize skill creation, new behavioral rules,
unrelated changes to `AGENTS.md`, sibling writes, commits, pushes, publication,
or installed-plugin edits. Keep their existing approval gates.
If repository policy blocks a continuity write, name the blocked artifact and
ask for the required approval; do not claim cleanup is complete.

| Record | Keep here |
| --- | --- |
| Project changelog (default `CHANGELOG.md`) | Dated completed-change history with evidence and accurate release status |
| Authoritative task list (default `TODO.md`) | Open work, pending decisions, blockers, and actionable next steps |
| Root `HANDOFF.md` | Only restart-critical current state, next action, blockers, verification, and links |
| Root `AGENTS.md` | Stable project orientation and continuity routes, not session history |

Use existing project conventions rather than create competing records. Respect
a release-only changelog's scope; use an existing project work log or issue for
non-release closure evidence, or ask where it belongs before pruning. Do not
create a second backlog when an existing task system is authoritative.

**Do not write episodic memory during meditation.** Do not create, append,
rewrite, migrate, or delete `.github/episodic/` records. Existing episodes may
be consulted as historical evidence when relevant, not treated as current
instructions or replayed wholesale. Native-memory writes are not part of this
workflow either. Do not replace episodic memory with a new `MEMORY.md`,
meditation-report directory, calibration journal, or long narrative in the four
active records. Explicit requests to change historical or native memory are
separate tasks, with their own authority and privacy checks.

## The Six Steps

### 1. Review

Scan the session honestly:

- What problems did we solve?
- What mistakes did we make?
- What patterns emerged that weren't already encoded?
- What would help future sessions?

Read the repository guidance, working-tree status, current handoff, task lists,
changelog, and relevant existing evidence. Inventory completed changes,
unresolved tasks, pending approvals, and verification evidence before editing.
Preserve unrelated or concurrent edits; stop and ask if changes conflict.

### 2. Find Useful Improvements

For each candidate, identify a demonstrated repeated workflow or a concrete
failure it would prevent. Search existing project skills, scripts, tests, and
guidance first. If the behavior is already covered, investigate why it was not
used or why its check did not catch the defect; do not add another copy of the
same rule.

| Evidence or need | Smallest useful recommendation |
| --- | --- |
| Repeated project workflow needing judgment | A local skill, through `project-capability-authoring` |
| Repeated deterministic task | Extend an existing script, or propose a validated local script |
| Defect with a reproducible failure condition | Regression test or executable check, preferably in the existing suite |
| Existing skill has an incomplete trigger or procedure | Propose a focused correction to that skill |
| Repeatable command needs a guided entry point | Propose a prompt that routes to the owning capability |
| Shared implementation used by multiple scripts | An existing library or a small shared module |
| Project-specific convention needs discoverability | Propose guidance in its owning document and a short AGENTS route |
| Useful across projects without project-specific assumptions | Recommend review in the canonical skill source for broader adoption |
| Community-useful capability with suitable provenance | Recommend a sanitized Mall candidate for separate review/submission |
| Unresolved uncertainty or missing verification | A concrete investigation or validation recommendation, not a fabricated lesson |
| One-off task or speculative future need | No new skill; retain only necessary open work |

Global applicability is a hypothesis, not a reward for finishing local work.
Name which assumptions would have to hold in another project and what evidence
supports reuse. If only this project has exercised the method, label it a
candidate rather than a proven general workflow.

Apply the universal PII guard to recommendations and every write. Project
identities, private source excerpts, credentials, and personal details must not
leak into a broadly reusable candidate. Do not publish automatically.

### Cross-project work stays explicit

There is no default message bus, heartbeat, knowledge base, or cross-host
transport. Do not invent a shared folder protocol, poll another host, or assume
a local handoff is deliverable elsewhere. Preserve the work in the repository
and get explicit approval before introducing any cross-project capability.
Project names, raw transcripts, user paths, credentials, and client details do
not become reusable knowledge.

### 3. Recommend, Then Implement Approved Changes

Present only candidates whose expected benefit justifies maintenance. Use a
short recommendation rather than a new recommendation document:

| Field | What to show |
| --- | --- |
| Evidence | The repeated task or observed failure; where it occurred |
| Benefit | The time, inconsistency, or risk it could reduce; do not invent measurements |
| Prior art | What already exists and why a correction is or is not sufficient |
| Placement | Local skill, script/test, canonical skill review, Mall candidate, or other action |
| Contract | Trigger, inputs, output, failure behavior, and what must remain unchanged |
| Validation | A positive case and an edge/should-not-fire case; executable check where feasible |
| Approval | Exact proposed files/actions and the authorization still needed |

For example, repeated manual export validation may justify extending the
existing validator before adding a skill. If the remaining task requires
judgment, a local skill can explain when and how to use that validator. A single
failed deployment may justify a regression test without justifying a new
deployment skill.

Route local authoring through
[project-capability-authoring](../project-capability-authoring/SKILL.md).
It previews the skill or script and requires explicit approval before edits.
Use [compile-brain](../compile-brain/SKILL.md) when proposing changes to an
existing instruction, skill, prompt, or agent. Never edit the installed cache
as a substitute for the canonical source.

For broader adoption, recommend the destination and explain portability.
For a Mall candidate, identify the benefit to other users and the required
provenance, rights, privacy, packaging, and validation review. Do not submit,
install globally, or write another repository as part of meditation. These are
separate authorized workflows, not automatic consequences of a recommendation.

Approved artifacts need proper frontmatter, concrete examples, an explicit
trigger, and observable outputs and failure conditions. Validate with the
owning project's checks. A proposal, a created file, a passing test, and a
published capability are different states; report the one actually reached.

An unapproved candidate does not block authorized continuity cleanup. Keep
material pending decisions explicit in TODO, with the next decision required;
do not treat suggestions as adopted rules or create a backlog of speculative
improvements. If nothing earns a recommendation, say so briefly and continue.

### 4. Preserve Completed-Change History

Save dated completed changes in the existing project changelog, creating
`CHANGELOG.md` if none exists and project policy permits it. Use an
Unreleased/local section for work not released; never invent a commit, version,
or successful check. Link to existing decision and curation evidence instead
of copying it. Respect a release-only changelog's scope.

Preserve necessary history before pruning active records. For an accumulated
handoff, move concise completed-change facts to the existing changelog and link
to existing evidence instead of copying a full session narrative. Keep
consequential decision rationale in the project's existing decision-record
system when required, under its approval rules. Mark old claims as historical,
not freshly verified.

Do not create an episodic baseline or archive during this cleanup. If unique
reasoning cannot be preserved in an authorized owning record, ask where it
belongs before removing it. If a preservation write fails, stop before pruning
and report the error.

### 5. Reconcile Tasks and Handoff

Run this on every explicit meditation, not only when closing the thread.

1. Reconcile existing task lists with session evidence. Merge duplicate tasks
   without losing unique details. Move verified completed-item evidence to
   history before removing completed items from active lists. Keep unresolved,
   blocked, or uncertain items; age and silence do not prove completion.
   Cancellation requires an explicit decision.
2. Keep one authoritative backlog. Where it is repository-local and none
   exists, create `TODO.md`. Account for every previously open item as retained,
   merged, completed with evidence, or explicitly cancelled. Do not silently
   discard items during cleanup.
3. Refresh root `HANDOFF.md` with only what a new session needs to resume.
   Remove completed-work narratives and duplicated task lists after preserving
   them. Handoff is not a changelog.
4. Check root `AGENTS.md` provides a short, stable route to handoff, tasks,
   history, and relevant project capabilities. Add or repair only needed routing;
   preserve project-specific authority and guidance. Create a minimal entry
   point if missing and authorized. Link only to existing records; do not
   invent setup commands or replace the file with a session report.

Use this handoff shape unless the project already has a suitable convention:

```markdown
# Session Handoff

Last updated: YYYY-MM-DD HH:MM

## Current State
- [Active objective and restart-critical local state]

## Blockers
- [Pending authorization or unresolved dependency]

## Next Action
- [One concrete action + file paths; link to authoritative task list]

## Verification
- [Latest relevant command/result; distinguish unrun checks]

## References
- [Task list, changelog, and relevant approved decision or capability]
```

### 6. Post-Mortem (when something went wrong)

A meaningful failure can justify an improvement that routine success does
not. When the session included a real mistake, analyze what happened, its root
cause, the generalizable pattern, and prevention. Use this structure to reason
and explain the recommendation; it is not a template for a new memory file:

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

Prefer an approved fix to the owning test, check, script, or skill over another
restatement of a rule already ignored. Keep necessary rationale in an existing
issue or decision record and unresolved action in TODO. Do not put the full
post-mortem into HANDOFF, AGENTS, or a standalone meditation report.

A prevention recommendation must explain what will catch the next instance.
If the proposed safeguard is only "remember to be careful," it has not yet
addressed the failure. If a fix cannot be verified now, retain that uncertainty
and the missing test rather than reporting that the lesson has been learned.

## Verify Persistence Before Compaction

After all six steps, including any post-mortem, read back saved records and
verify local links, task accounting, and applicable repository checks. Report
exact files written, duplicate candidates skipped, and any blocked or incomplete
writes. A partial write is not completion.

Do not compact before this verification succeeds. Use host compaction only if
available and authorized; otherwise state it was not performed. Do not claim a
slash command ran merely because it was written in the response.

## Quality Bar

A meditation is complete when:

- Material recommendations identify evidence, prior art, benefit, placement, validation, and approval
- Approved capability changes are implemented and verified; unapproved ones remain proposals
- Completed changes are reflected in appropriate change history without duplicate narratives
- Every original open task is accounted for, with evidence for closure
- Handoff contains restart state rather than a changelog or duplicate backlog
- AGENTS remains a stable quick start with working continuity routes
- Failures are analyzed, not just noted
- Necessary restart state and agreed follow-ups survive outside the context window
- Existing artifacts were checked for duplication before writing new ones
- Saved files were read back; errors, permission limits, and unrun checks are explicit
- Repeating meditation with unchanged inputs produces no duplicate entries
- No episodic or native-memory records were written, and existing episodes remain untouched
- The session can be closed without losing the thread

## Longer Cycles (optional)

Per-session meditation is one loop. Some projects find value in longer-cycle reviews on top:

- **Per release** — review whether shipped work exposed a reusable workflow or a missing guard
- **Longer-cycle review (optional)** — check whether previously adopted capabilities actually reduce repeated work or prevent their target failures

Cadence is per-project. Adapt or skip based on the work rhythm. Meditation as a *ritual* should never outweigh meditation as a *tool*.

## Anti-Patterns

| Anti-pattern | Correction |
|---|---|
| Creating a skill on every meditation | Require demonstrated recurrence and a maintenance benefit |
| Duplicating an existing skill or rule | Search prior art and repair its trigger or check when appropriate |
| Aspirational recommendations ("we should do X someday") | Name concrete evidence and an actionable next decision, or omit |
| Replacing episodic notes with a giant changelog | Keep concise change facts and link to owning artifacts |
| Treating local success as proof of global usefulness | State portability assumptions and propose broader review |
| Automatically sending a candidate to the Mall | Separate recommendation from authorization, review, and submission |
| Appending shipped history to handoff | Preserve change facts in the changelog and link from current state |
| Removing stale-looking tasks without evidence | Keep them open or ask for an explicit cancellation decision |
| Compacting after a failed write | Report incomplete persistence and preserve the working context |

## Related

- [/meditate prompt](../../prompts/meditate.prompt.md) — slash-command entry
- [session-health-monitoring.instructions.md](../../instructions/session-health-monitoring.instructions.md) — session-boundary context recovery and repository handoffs
- [project-capability-authoring](../project-capability-authoring/SKILL.md) — approved project-local skills and scripts
- [compile-brain](../compile-brain/SKILL.md) — review-first changes to brain artifacts

## Falsifiability

- Revise if repeated meditations create recommendations with no observed problem
  or if adopted capabilities fail to reduce their target work or failure.
- Revise if the workflow creates an episodic record, replacement narrative
  archive, or unapproved native-memory write.
- Revise if an unchanged repeat duplicates history, cleanup loses unresolved
  work or necessary rationale, or continuity updates alter authority.
- Revise if a candidate is created, installed globally, or submitted to the
  Mall without its separate approval and applicable validation.
