---
description: "Prevent terminal command failures from shell metacharacter interpretation, output capture issues, and hanging commands"
applyTo: "**"
lastReviewed: 2026-08-18
---

# terminal-command-safety

## Activation and resident floor

Before constructing or running shell commands, especially multiline/quoted input or long-lived work.

Never place raw backticks in double-quoted terminal arguments. Use file-based multiline input outside the worktree. Disable pagers; preserve process-local environment setup. Bound waits and retrieve existing output rather than rerunning. Stop only specifically identified owned processes; never kill by name.

## Required execution

When the trigger requires the detailed workflow, load and follow [terminal-command-safety](../skills/terminal-command-safety/SKILL.md) in **shell-safety** mode, including its runtime-terminal-command-safety reference where applicable. These guardrails apply before loading; a hyperlink alone is not execution.

Use native skill discovery first. Links are relative to the canonical installed instruction source, not this activated profile copy or an adopter checkout. If discovery is unavailable, locate the canonical alex-act-one package through native plugin discovery and use its bootstrap preview `routing.skillRoutes` and `routing.canonicalRoot` to resolve the linked skill. Report a missing owner/reference explicitly; never skip a required check or claim it completed. Loading grants no additional write, installation, send, or publication authority.
