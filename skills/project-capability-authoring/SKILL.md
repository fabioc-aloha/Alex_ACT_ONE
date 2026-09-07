---
name: project-capability-authoring
description: "Create tested project-local skills and scripts from demonstrated repeated work. Use after meditation or when a project workflow recurs and manual execution has caused inconsistency."
lastReviewed: 2026-08-15
---

# Project Capability Authoring

Turn a demonstrated repeated project workflow into a small local capability.
This skill creates project-local skills and scripts. It does not change Core,
build MCP servers, or write persistent memory.

## When To Use

- Meditation identifies a repeated workflow or deterministic task worth keeping.
- A manual task has recurred and produced inconsistent results or avoidable
  mistakes.
- The user asks to make a project workflow reusable, repeatable, or scripted.

Do not use this for a one-off task, an untested aspiration, shared continuity,
or a personal preference.

## Author A Capability

1. **Prove the pattern**: name the repeated workflow, the concrete failure or
   inconsistency it prevents, and the project users who benefit.
2. **Scan prior art**: search existing `.github/skills/`, `scripts/`, and
   project guidance. Extend an existing capability when it already covers the
   workflow.
3. **Choose the smallest placement**:

   | Need | Destination |
   | --- | --- |
   | Guided repeatable workflow | `.github/skills/<name>/SKILL.md` |
   | Workflow with deterministic automation | `.github/skills/<name>/scripts/<task>.cjs` |
   | Cross-cutting project automation | `scripts/<task>.cjs` |

4. **Define the contract**: write the trigger, inputs, outputs, failure mode,
   and one should-fire plus one should-not-fire example. A script must state its
   prerequisites, accepted arguments, and validation command.
5. **Preview the change**: show every proposed file and the validation plan.
   Obtain explicit user approval before creating or modifying project files.
6. **Validate**: run the narrowest executable check for a script, and exercise
   the skill's should-fire and should-not-fire cases. Run diagnostics on every
   changed file.
7. **Report**: state the extracted pattern, artifact path, validation evidence,
   and why a new capability was warranted instead of a one-off solution.

## Memory Boundary

Meditation may separately recommend user memory, repository memory, a handoff,
or a chronicle. Do not write any persistent memory from this skill. A memory
write requires the relevant explicit user request or approval and must pass the
PII filter.

## Anti-Patterns

| Anti-pattern | Correction |
| --- | --- |
| Creating a skill after one routine task | Require a demonstrated repeat or concrete failure first. |
| Copying a skill that already exists locally | Extend the existing capability after the prior-art scan. |
| Hiding a destructive script behind a skill | Preview the command and require explicit approval before execution. |
| Creating project files while summarizing meditation | Meditation routes the candidate; this skill previews and validates it. |
| Treating an MCP server as a project script | Evaluate MCP construction separately; it is not this skill's scope. |

## Would Revise If

Revisit by **2026-11-15** if real meditations produce no demonstrated reusable
workflow, authors repeatedly choose the wrong local placement, or generated
capabilities fail their focused validation more than once.
