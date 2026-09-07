# Roadmap

What is working now, what is being built, and what is deliberately out of scope.

## Working Today

- One install from source reaches Copilot CLI, VS Code, and Microsoft Scout
- 59 skills load on all three; every slash command loads on CLI and VS Code
- Always-on instructions activate through a preview-first command that asks
  before writing to your profile
- Activation can be undone. Removal returns each profile to its prior state and
  keeps any instruction file you edited yourself
- The three MCP servers register automatically on CLI and VS Code, and on Scout
  through one preview-first command that backs up and merges
- Every external npm package is pinned to an exact version, and one command
  reports when a pin has fallen behind
- `node --test` checks the structural claims above, including that each pinned
  server actually starts and reports the version it was pinned to, that
  activation runs, and that any count quoted in this file is real

Uninstalling the plugin leaves the provisioned MCP servers on disk on purpose,
so reinstalling does not download them again. Nothing else is left behind.

## Next

**Install from the Mall.** A published listing so that installing Alex ACT ONE
is a single command with no repository path, and updates arrive the usual way.
Copilot now warns that installing from a repository is deprecated, so this has
moved from a convenience to the eventual only supported route.

**One activation instead of one per app.** Today the always-on instructions are
written into each app's profile, so turning them on is a per-app step. Microsoft
Scout adds a second one-off step for the MCP servers, because it keeps its own
registry rather than reading the plugin manifest. A single activation that
reached every app and every surface would make the install genuinely one move.

**Slash commands on Microsoft Scout.** Scout has no command surface for plugin
prompts, so none of them reach it. Each one has an equivalent skill
that can be asked for by name, which is why this is a gap rather than a blocker.
It needs a change on Scout's side, so it is listed here to be tracked, not
promised.

**Confirm the GitHub Copilot app.** It is a stated target and it is untested.
Until someone runs it there, the compatibility table says so.

**Documentation you can follow without asking.** Setup, a short example of when
each group of skills is worth reaching for, and troubleshooting for the cases
people actually hit.

## Later

**Continuity across sessions.** A shared, opt-in record of what earlier sessions
learned, so a lesson from last week is available this week without repeating the
work that produced it. This changes where knowledge lives, so it needs its own
design decision rather than an assumption.

**AI provider work.** Planning and running model tasks through external
providers is intentionally absent. It is the only capability that requires paid
accounts and API keys, and the only one that can spend money on your behalf.
When it returns, planning and execution will be separable, and neither will be
enabled without a deliberate choice.

## Not Planned

- Replacing your judgment. Every consequential step previews first and asks.
- Silent writes outside the plugin. Activation, project scaffolding, and setup
  commands each preview their exact file list.
- Telemetry, usage collection, or reading your conversations.

## How To Read This

A capability is listed as working only after it has been run in the app in
question. Anything not yet verified says so, including when that is
inconvenient. If something here is stale or wrong, the compatibility table in
the [README](README.md) is the one to trust, because it is checked more often.
