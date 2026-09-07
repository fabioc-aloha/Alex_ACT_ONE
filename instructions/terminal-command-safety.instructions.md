---
description: "Prevent terminal command failures from shell metacharacter interpretation, output capture issues, and hanging commands"
applyTo: "**"
lastReviewed: 2026-08-18
---

# Terminal Command Safety

## Backtick Hazard (Critical)

Backticks break in ALL shells (bash=command substitution, PowerShell=escape char). NEVER place raw backticks inside double-quoted terminal arguments.

| Content contains   | Action                             |
| ------------------ | ---------------------------------- |
| Backticks          | Always use temp file               |
| Multi-line text    | Prefer temp file                   |
| Both quote types   | Use temp file                      |
| Dollar signs (`$`) | Single-quoted heredoc or temp file |
| Plain text only    | Inline is safe                     |

Rules: `gh` → `--body-file`, `git commit` → `-F <file>`, any CLI → file-based input over inline.

**Temp file location matters**: place temp files **outside the working tree** (`$env:TEMP\<slug>.txt` on Windows, `/tmp/<slug>.txt` on Unix) OR add the pattern to `.gitignore` before staging. Otherwise `git add -A` will stage and commit the message file itself. S360 hit this twice in 2026-05 (commits `26631b4` then caught mid-flight on the next leak via Tenet X self-review).

Preferred PowerShell template for multi-line commit messages:

```pwsh
$m = Join-Path $env:TEMP "<slug>.txt"
Set-Content -Path $m -Value $msg -NoNewline
git commit -F $m
Remove-Item $m
```

Filesystem isolation prevents the leak by construction.

## Deferred Procedures

For output capture, hung-command handling, and current host behavior, use the
terminal-command-safety skill. The Backtick Hazard remains resident because
safe command construction must be decided before an on-demand skill can load.
