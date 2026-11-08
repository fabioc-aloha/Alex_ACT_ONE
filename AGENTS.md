# Repository Agent Guidance

## Mission and scope

This repository maintains and ships Alex ACT ONE. It owns the canonical plugin
skills, instructions, commands, runtime helpers, user documentation, tests,
verification tooling, packaging, and release evidence.

Prioritize product correctness, compatibility, reproducibility, and safe
delivery through the existing release gates. Apply incident lessons as reusable
product safeguards; do not turn this repository into an adopter-recovery
service, fleet dashboard, or governance workspace.
Other repositories own their files, backlogs, and operations. Cross-project
work requires explicit scope and does not become this project's mission.
Completed recovery and synchronization records are historical evidence, not
active goals or standing authorization.

<!-- alex-act-continuity:start -->
## Continuity

Read [HANDOFF.md](HANDOFF.md) for current state, blockers, verification, and the
next action. [ROADMAP.md](ROADMAP.md) is the authoritative pending-work plan;
[CHANGELOG.md](CHANGELOG.md) holds completed-change history. Keep one backlog,
not a parallel TODO list. Verification environments and release limits belong
in [docs/testing.md](docs/testing.md) and
[RELEASE-CHECKLIST.md](RELEASE-CHECKLIST.md).

Keep this file a stable quick start. Handoff is not a changelog or a duplicate
backlog. Preserve history before pruning active records, and keep unresolved
tasks until evidence or an explicit decision closes them. Meditation recommends
skills or automation for demonstrated needs; authoring, broader adoption, and
Mall submission require separate approval. It does not write episodic or native
memory. Existing episodes are historical evidence, not active guidance.
Cross-project work stays explicit until separately authorized.
<!-- alex-act-continuity:end -->

## Project artifact storage

Keep requested documents, plans, reports, code, useful helpers, generated outputs,
and supporting evidence inside this repository, never solely in session storage.
Use existing project locations and respect explicitly approved destinations.
Before completion, verify final files, dependencies, links, ignore state, and
actual Git state. Follow the shared
[storage and delivery contract](skills/proactive-awareness/references/project-artifact-storage.md).
Do not archive credentials, runtime state, or another project's files.
This rule grants no additional implementation, installation, or publication
authority and is not a host-enforced filesystem boundary.
