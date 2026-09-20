# Roadmap

What is working now, what is being built, and what is deliberately out of scope.

## Working Today

- One payload in the shared Copilot CLI store can serve Copilot CLI, VS Code,
  Microsoft Scout, and the GitHub Copilot app. Scout must enable **Load Copilot
  CLI skills**; a Scout-local install is an unnecessary duplicate that can drift
- The package declares 60 skills, 15 prompts, 15 always-on instructions, and
  three MCP servers. The [README](README.md) distinguishes current release
  support from host-level evidence
- Always-on instructions activate through a preview-first command that asks
  before writing to your profile
- Activation can be undone. Removal returns each profile to its prior state and
  keeps any instruction file you edited yourself
- A no-write host activation readiness report names the selected host's
  activation target, manual steps, and observation boundary
- The three MCP servers register automatically on CLI and VS Code. Scout needs a
  preview, a plugin-root check, explicit registration, and a full restart
- Every external npm package is pinned to an exact version, and one command
  reports when a pin has fallen behind
- `node --test` checks the structural claims above, including that each pinned
  server actually starts and reports the version it was pinned to, that
  activation runs, and that any count quoted in this file is real

Uninstalling the plugin leaves the provisioned MCP servers on disk on purpose,
so reinstalling does not download them again. Nothing else is left behind.

## Next

**Slash commands on Microsoft Scout.** Scout has no command surface for plugin
prompts, so none of them reach it. Each one has an equivalent skill
that can be asked for by name, which is why this is a gap rather than a blocker.
It needs a change on Scout's side, so it is listed here to be tracked, not
promised.

**Automate host compatibility evidence.** The GitHub Copilot app and Scout have
both been tested, but their evidence is manual. A repeatable host-level check
would catch store resolution, activation, and tool-handshake regressions.

**Documentation you can follow without asking.** Setup, a short example of when
each group of skills is worth reaching for, and troubleshooting for the cases
people actually hit.

## Not Planned

- Replacing your judgment. Every consequential step previews first and asks.
- Silent writes outside the plugin. Activation, project scaffolding, and setup
  commands each preview their exact file list.
- Telemetry, usage collection, or reading your conversations.
- Shared continuity across sessions. ONE remains project-local and does not
  create or depend on a shared store.
- Provider operations in ONE. AI Operations remains a separate Mall plugin for
  users who need provider-specific planning and integrations.

## How To Read This

The [README](README.md) distinguishes source support from host-level evidence.
When a host has not been tested on the current release, say so rather than
promoting an earlier baseline into a current activation claim.
