---
name: git-workflow
description: Apply consistent git practices for branch hygiene, safe commits, and recovery from common mishaps (lost commits, bad merges, accidental pushes). Use when authoring or reviewing a git workflow, recovering broken local state, or sequencing a commit/push that needs explicit user approval before destructive steps.
lastReviewed: 2026-08-15
---

# Git Workflow

Use native Git UI, diff/review tools, and shell commands for ordinary operations. Follow the user's repository/branch workflow; do not introduce PRs, commits, pushes, or a new branch merely because a generic example uses them.

Inspect status and preserve unrelated/uncommitted work. Destructive reset/restore/clean, history rewrites, tag moves, and checkpoint commits require explicit approval of their scope. Never force-push a shared branch or rewrite a published tag. Use non-interactive commands and disable pagers.

Load only the applicable recovery or release procedure in [execution details](references/execution-details.md). Commands there illustrate effects, not permission to run them. Prefer a scoped, reversible action; when unsure, inspect or dry-run and report the decision needed. A fetch does not merge; a requested fast-forward must refuse divergence.

Return the actual command result and resulting branch/worktree state. Do not equate an exit code with broader integration or test success.
