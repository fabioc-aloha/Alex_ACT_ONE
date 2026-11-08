---
name: git-workflow
description: Apply consistent git practices for branch hygiene, safe commits, non-interactive multi-account GitHub authentication, and recovery from common mishaps (lost commits, bad merges, accidental pushes). Use when authoring or reviewing a git workflow, diagnosing non-interactive push/credential failures, recovering broken local state, or sequencing a commit/push that needs explicit user approval before destructive steps.
lastReviewed: 2026-11-07
---

# Git Workflow

Use native Git UI, diff/review tools, and shell commands for ordinary operations. Follow the user's repository/branch workflow; do not introduce PRs, commits, pushes, or a new branch merely because a generic example uses them.

Inspect status and preserve unrelated/uncommitted work. Destructive reset/restore/clean, history rewrites, tag moves, and checkpoint commits require explicit approval of their scope. Never force-push a shared branch or rewrite a published tag. Use non-interactive commands and disable pagers.

Before `git push` or when a remote Git operation fails with `Cannot prompt because user interactivity has been disabled`, `unable to get password from user`, or HTTP 401/403 in a multi-account `gh` environment, run the bundled [Git auth checker](scripts/check-git-auth.cjs) in preview mode (`node <this-skill>/scripts/check-git-auth.cjs --repository-root <repo>`). Copilot agent shells pass `credential.interactive=never`, and `gh auth git-credential` uses the global active `gh` account rather than the repository owner unless pinned locally. Preview first and obtain user approval before running `--apply` to pin `.git/config` for the repository's GitHub account.

Load only the applicable recovery, authentication, or release procedure in [execution details](references/execution-details.md). Commands there illustrate effects, not permission to run them. Prefer a scoped, reversible action; when unsure, inspect or dry-run and report the decision needed. A fetch does not merge; a requested fast-forward must refuse divergence.

Return the actual command result and resulting branch/worktree state. Do not equate an exit code with broader integration or test success.

Apply the [shared artifact storage contract](../proactive-awareness/references/project-artifact-storage.md)
to project deliverables: check that final files and dependencies are discoverable
and not ignored. Repository presence, staging, a local commit, a push, and a
verified remote commit are separate states. Report the observed state; storage
requirements alone do not authorize commits or pushes.
