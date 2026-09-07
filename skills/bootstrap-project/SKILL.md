---
name: bootstrap-project
description: "Previews and applies Core's repository scaffold, portable workspace QoL settings, and project Copilot settings while preserving project-owned files. Use for new repositories, missing AGENTS/HANDOFF/episodic files, or project .vscode setup."
lastReviewed: 2026-08-18
---

# Bootstrap Project

Set up one repository with Core's project-local guidance and a portable VS Code
workspace baseline. The baseline covers editor, diff, Markdown, file/search,
terminal, and Git QoL preferences. Its PowerShell profile keys are
Windows-scoped and are ignored on macOS, where the system default shell
applies. It never edits user settings, configures extensions, or configures
shared continuity.

## Preview First

```text
node <this-skill>/scripts/bootstrap-project.cjs --repository-root <path>
```

The preview classifies agent guidance, nested contracts, missing scaffold files,
settings additions and `.gitignore` changes. It writes nothing.

## Apply After Consent

After explicit repository consent, rerun with `--apply`. Existing files are
preserved. Settings are additive: missing keys and nested map entries are added,
while project values remain authoritative. Markdown Preview uses VS Code's
user-level defaults; optional personal styling belongs in the user profile, not
project configuration.

The minimal scaffold is `AGENTS.md`, thin Claude/Gemini adapters, `HANDOFF.md`,
`.github/episodic/README.md`, `.vscode/settings.json`, and a narrow
`.gitignore` exception for the managed settings file.

## Boundaries

- One explicit repository root per invocation.
- Divergent root `AGENT.md` and `AGENTS.md` block apply.
- Existing handoff, episodic, agent, and settings files are preserved.
- Comment-rich JSONC requiring changes fails closed for manual merge.
- Do not create `MEMORY.md`, README, license, framework, package manager, or Git.
- Do not edit VS Code user settings or configure shared continuity.

## Anti-Patterns

| Anti-pattern | Correction |
| --- | --- |
| Run this through optional Manager | Core owns required project setup |
| Replace custom project settings | Add only missing baseline entries |
| Configure a project Markdown stylesheet | Use VS Code's user-level defaults instead |
| Configure shared continuity | Keep work in repository continuity until a separately approved capability exists |

## Would Revise If

Revise by **2026-11-15** if project bytes are overwritten, a second preview is
not idempotent, user settings are touched, or the baseline proves non-portable.
