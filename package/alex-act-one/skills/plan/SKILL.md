---
name: plan
description: "Use native planning for uncertain or consequential implementation work. Preserve read-only discussion, approval before execution, and task-specific verification without compulsory repository files or prewritten implementation."
lastReviewed: 2026-11-07
---

# Native-first Planning

Use native Plan mode or the host's planning agent when available. Ask for the outcome, constraints, relevant files/patterns, decisions, risks, and verification needed for this task. Small, well-defined edits do not require a full planning ritual.

## Authority

Planning does not authorize implementation, commits, pushes, installation, or external effects. Native CLI Plan blocks clear built-in workspace mutations, but ambiguous shell commands and MCP/external tools are not an airtight read-only sandbox. Do not use those paths to evade the planning boundary.

Do not create a repository plan file unless the user explicitly requests one or the project's approved workflow requires it. Use the host's private planning workspace only for internal reasoning where supported, never as the sole home of a requested plan deliverable. Requested plans follow the [shared storage contract](../proactive-awareness/references/project-artifact-storage.md). If Plan mode blocks the requested document write, report the blocker and obtain the appropriate mode or approval; do not bypass it. Do not require fixed task durations or prewrite the implementation.

If native planning is unavailable, perform a read-only planning discussion and state that the permission boundary is procedural rather than host-enforced. Obtain approval before implementation. The [project-specific plan template](references/project-plan-template.md) is optional craft material; its old mandatory sizing/storage prescriptions are historical examples, overridden by this authority contract. Load only relevant template sections.

Report the plan, unresolved decisions, and verification, not a success claim about code that has not run.
