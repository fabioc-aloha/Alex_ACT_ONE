---
name: terminal-command-safety
description: "Provides terminal output-capture, hung-command, and platform-behavior procedures while the resident instruction retains the Backtick Hazard floor. Use when a command may lose output, hang, need interaction, or depend on host execution behavior."
lastReviewed: 2026-08-18
---

# Terminal Command Safety

Use the current host's native command lifecycle, output retrieval, permissions, and sandbox diagnostics. Shell quoting remains a separate correctness issue: never put raw backticks into double-quoted terminal arguments; prefer file-based input outside the working tree for multiline or mixed-quote text.

Keep environment setup and dependent commands in the same process. Disable pagers. Bound commands and waits; retrieve existing background output rather than rerunning the command. Verify a server is responsive, and stop task-local helpers before finishing. Detach only services that must outlive the task, with required approval; a sandbox is not a quoting guarantee.

Load and follow the [resident shell-safety contract](references/runtime-terminal-command-safety.md) for safety boundaries and the [shell procedures](references/shell-procedures.md) only for a matching platform/output/hang case. Their older tool names are historical examples, not current-host APIs. Report unsupported lifecycle controls explicitly instead of inventing a workaround. Terminate only a specifically identified process or owned session, never a process name.

## Runtime contract references

Load only the reference selected by the triggering instruction; do not replay all runtime contracts for unrelated work. These references add no authority and do not call the instruction again.

- **shell-safety**: [terminal-command-safety](references/runtime-terminal-command-safety.md)
