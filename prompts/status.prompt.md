---
description: "Report the current project's repository state, recent work, brain QA health (if applicable), and pending handoff items. Use for session orientation or an on-demand project checkpoint."
lastReviewed: 2026-09-18
---

# Status

Produce a terse, read-only orientation report for the current project.

This prompt is self-contained: execute the numbered steps directly. If the
generic skill tool does not list `status-reporting`, that is not evidence the
skill is missing — plugin-shipped skills are not always in its inventory.

## Steps

1. **Identity**: Confirm which project this is and read the active branch (`git branch --show-current`).
2. **Git state**: Report uncommitted file count and the latest commit subject.
3. **Continuity**: Read `HANDOFF.md` if present for current state, blockers,
   next action, and verification. Read the authoritative task list linked from
   handoff or `AGENTS.md`; otherwise use root `TODO.md` if present. Report
   relevant pending work without assuming a backlog lives in handoff. Follow
   existing project conventions and tolerate older section names. If the
   handoff is absent but tasks exist, report those with the missing restart
   context noted; do not infer there is no work. Keep this read-only and do not
   re-litigate closed decisions or create an episodic record.
4. **Brain health**: If the project ships brain-QA scripts, run them. A project with structural and semantic brain checks usually exposes them as:

   ```pwsh
   node scripts/brain-qa.cjs
   node scripts/brain-semantic-qa.cjs
   ```

   Otherwise skip and note absence in the report.

5. **Output**: Lead with material state, then blockers and next action. Omit
   empty sections.

## Boundaries

- Never modify sibling projects or native memory during status work.
- Never infer health from a stale dashboard without naming its date.
- Do not commit, pull, or push.
- Repository absence is not evidence of retirement.

## Would Revise If

Revisit by **2026-10-28** if the handoff format changes, brain-QA muscles cease
to represent brain health for projects that ship them, or status reports repeatedly
omit a material blocker present in current repository evidence.
