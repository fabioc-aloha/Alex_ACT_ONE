# Roadmap

What is working now, what is being built, and what is deliberately out of scope.

## Working Today

- One install from source reaches Copilot CLI, VS Code, and Microsoft Scout
- 59 skills and 17 slash commands load on all three
- Always-on instructions activate through a preview-first command that asks
  before writing to your profile

## Next

**Install from the Mall.** A published listing so that installing Alex ACT ONE
is a single command with no repository path, and updates arrive the usual way.

**Confirm the GitHub Copilot app.** It is a stated target and it is untested.
Until someone runs it there, the compatibility table says so.

**Removal that leaves nothing behind.** Uninstalling should return a profile to
exactly its prior state, including the instructions that activation wrote.

**Documentation you can follow without asking.** Setup, a short example of when
each group of skills earns its keep, and troubleshooting for the cases people
actually hit.

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
