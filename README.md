# ONE Alex ACT

![ONE Alex ACT](assets/banner.svg)

A single plugin that gives GitHub Copilot a working method: how to think through
a problem, how to write code and prose that hold up, and how to produce documents
and charts worth sending to someone.

Install it once at the user level. Copilot CLI, VS Code, and Microsoft Scout all
read the same installation.

**Status:** In development. Not yet published to the Alex ACT Mall.

## What You Can Do With It

**Think before building.** Frame the real problem, weigh competing explanations,
name what would prove you wrong, and check a decision against its risks before
committing to it.

**Write code that survives review.** Test-first workflows, root-cause debugging,
security hardening, adversarial code review from three opposing perspectives, and
safe Git practice with recovery paths.

**Produce prose people finish reading.** Strip AI writing patterns, find the one
sentence a document is actually making, adapt a draft for a named audience, and
write Markdown that passes lint on the first attempt.

**Turn drafts into deliverables.** Convert between Markdown, Word, HTML, plain
text, and formatted email. Build charts, diagrams, print-quality figures, and
banners, then check that what rendered says what you meant.

**Improve the agent itself.** Audit which instructions earn their context cost,
write project-specific skills from work you keep repeating, and consolidate what
a session learned into something reusable.

59 skills, 17 always-on instructions, and 17 slash commands.

## Where It Works

| Surface | Status |
| --- | --- |
| Copilot CLI | Verified |
| VS Code with GitHub Copilot Chat | Verified |
| Microsoft Scout | Verified |
| GitHub Copilot app | Not yet tested |

Skills sit at the package root, so each surface finds them directly. No bridge,
no symbolic links, and no second plugin store to keep in sync.

## Install

From source, until the Mall listing is published:

```powershell
copilot plugin install fabioc-aloha/Alex_ACT_ONE
```

Skills and commands are available immediately. To turn on the always-on
instructions:

```text
/alex-act-one bootstrap-core
```

Activation is a separate step because instructions are written into your user
profile rather than loaded from the plugin. It previews every file and waits for
your approval before writing anything.

## What Is Next

See the [roadmap](ROADMAP.md).

## License

MIT. See [LICENSE](LICENSE).
