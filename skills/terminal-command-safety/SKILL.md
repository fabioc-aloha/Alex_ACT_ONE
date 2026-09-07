---
name: terminal-command-safety
description: "Provides terminal output-capture, hung-command, and platform-behavior procedures while the resident instruction retains the Backtick Hazard floor. Use when a command may lose output, hang, need interaction, or depend on host execution behavior."
lastReviewed: 2026-08-18
---

# Terminal Command Safety

The always-on instruction retains the Backtick Hazard and its temp-file rule.
Use this skill after that floor is satisfied when execution needs a procedure
for output capture, hang prevention, or host behavior.

## Output Capture Failures

Terminal output can be silently lost or truncated.

1. Redirect to file, then read: `cmd 2>&1 | Out-File $env:TEMP\out.txt`
2. Pipe pagers through `Out-String`
3. Sentinel: `; echo "EXIT_CODE:$LASTEXITCODE"`
4. Limit volume: `Select-Object -First`, `-Tail`, `Format-Table`
5. Avoid alt-buffer programs (`less`, `vim`, `man`) — use non-interactive equivalents
6. If empty: retry with `get_terminal_output`, then redirect to file, then check stderr

## Terminal Hanging

1. Use `mode=async` for commands over 15 seconds, including servers, builds,
   and test suites. VS Code 1.121+ may auto-promote a quiet synchronous command
   to the background; this remains the required agent intent and covers older
   hosts.
2. Never run interactive commands. Pre-answer with flags such as `--yes` or
   `--no-edit`.
3. Set network timeouts such as `--max-time` or `--prefer-offline`.
4. Avoid heredoc blocks because they can desynchronize the terminal parser.
5. Run one command at a time. Do not chain unrelated commands.
6. Stop a stuck command with `send_to_terminal` and Ctrl+C, or start a fresh
   terminal.

## VS Code Platform Changes

Recent VS Code agentic-execution improvements reduce the need for some manual
patterns above. The file-redirect fallback remains the safe default when full,
unfiltered output matters.

| Surface | Behavior change | When the manual pattern still wins |
| --- | --- | --- |
| 1.117 | Terminal output is auto-included after `send_to_terminal`; async-completion notifications fire automatically. | Exact byte-for-byte diagnostic output is needed. |
| 1.118 | Agentic execution pre-filters terminal output. | Exact error strings, full test results, or encoding-sensitive output are needed. |
| 1.120-1.121 | `chat.tools.compressOutput.enabled` post-processes long output; one-shot async terminals auto-dispose. | Raw lockfile diffs, install logs, or output that compression strips is needed. |
| 1.127 | macOS/Linux terminal commands are sandboxed by default. | Windows remains unchanged, so the resident Backtick Hazard still applies. |

## Boundaries

- Do not weaken, duplicate, or bypass the resident Backtick Hazard floor.
- Do not send secrets through a terminal command or tool input.
- Do not treat a missing output line as proof that a command succeeded.

## Anti-Patterns

| Anti-pattern | Correction |
| --- | --- |
| Relying on compressed output for a precise diagnosis | Redirect to a temporary file and inspect it. |
| Starting a long-running command synchronously | Use asynchronous execution when it must outlive the current response. |
| Retrying an interactive command unchanged | Find and provide its noninteractive flags. |

## Would Revise If

Revisit by **2026-11-18** if the deferred procedure fails to load when a
terminal command needs it, host behavior makes the version table inaccurate,
or a terminal failure reaches the user because the resident Backtick Hazard
alone was insufficient.
