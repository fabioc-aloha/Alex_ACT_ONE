---
name: surface-continuity
description: "Places durable experiences in native memory, project files, and reusable Core artifacts. Use when deciding where knowledge belongs or preserving project continuity."
lastReviewed: 2026-08-18
---

# Surface Continuity

Decide where an experience belongs. Core owns project-local placement, project
bootstrap, and continuity semantics. Native host memory and repository files
are the supported defaults.

## Place The Experience

| Experience | Default destination |
| --- | --- |
| Personal preference or private fact | Native host memory |
| Repository convention | Repository instructions or native repository memory |
| Active project state | Root `HANDOFF.md` |
| Durable project session summary | `.github/episodic/` |
| Reusable behavior | Agent Skill or governed instruction |
| Cross-project reusable knowledge | Keep a reviewed local candidate until a separately approved capability exists |
| Cross-surface delegated work | Explicit local handoff |
| Secret or raw private source | Outside ordinary continuity records |

Do not create a repository-root `MEMORY.md`. Do not publish `HANDOFF.md` or an
episodic summary merely because it exists.

## Keep Cross-Project Work Explicit

Core provides no default message bus, heartbeat, knowledge base, or cross-host
transport. Do not create a shared folder protocol, poll another host, or infer
that a local handoff is deliverable elsewhere. Preserve current work in the
repository and obtain explicit user approval before introducing a future
cross-project capability.

## Persist Experiences Deliberately

Meditation may propose reusable knowledge, but Core keeps that candidate local
until a separately approved capability owns sharing it. Apply the universal PII
guard before every persistent write. Project names, raw transcripts, user
paths, credentials, and client details do not become reusable knowledge.

## Use Local Continuity

Use native host memory for personal facts, `.github/episodic/` for durable
project summaries, and root `HANDOFF.md` for active execution state. This is
the normal Core contract, not a degraded fallback.

## Boundaries

- Core does not validate, stage, publish, claim, acknowledge, retry, or move
  records.
- Core does not resolve synchronized roots, credentials, permissions,
  scheduling, host capabilities, or cross-host transport.
- A future sharing or surface capability requires a separately approved owner
  and must not be inferred from Core placement guidance.

## Anti-Patterns

| Anti-pattern | Correction |
| --- | --- |
| Publish an episodic note automatically | Keep it project-local unless a reviewed lesson is explicitly deposited |
| Treat Core as a cross-host transport | Keep work in local continuity and obtain separate approval for a new capability |
| Fail ordinary work because no shared service exists | Use native and repository-owned continuity defaults |
| Copy private project details into reusable artifacts | Minimize, generalize, and run the PII guard before writing |

## Would Revise If

Revise by **2026-11-15** if native memory, repository handoffs, and episodic
records cannot preserve normal project continuity, a supported workflow needs
cross-host transport, or Core gains shared transport implementation.
