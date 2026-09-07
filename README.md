# Alex ACT ONE

![Alex ACT ONE](assets/banner.svg)

A skills pack for GitHub Copilot. It covers how to think through a problem, how
to write code and prose that hold up, and how to produce documents and charts
worth sending to someone.

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

| Where you use Copilot | Status |
| --- | --- |
| Copilot CLI | Verified |
| VS Code with GitHub Copilot Chat | Verified |
| Microsoft Scout | Verified |
| GitHub Copilot app | Not yet tested |

Skills sit at the package root, so each app finds them directly. No bridge, no
symbolic links, and no second plugin store to keep in sync.

## Install

Two steps. The first runs once per machine. The second runs once per app.

### 1. Install the plugin

From source, until the Mall listing is published:

```powershell
copilot plugin install fabioc-aloha/Alex_ACT_ONE
```

All 59 skills are now available in Copilot CLI, VS Code, and Microsoft Scout.
There is one copy on disk and every app reads it.

### 2. Turn on the always-on instructions, once in each app

Skills wait until something calls them. Instructions are different: they shape
every response, so they are written into the profile of the app you are using
rather than loaded from the plugin. Each app keeps its own profile, so run
activation in each app where you want the behavior.

| App | What to run |
| --- | --- |
| Copilot CLI | `/alex-act-one bootstrap-core` |
| VS Code with GitHub Copilot Chat | `/alex-act-one bootstrap-core` |
| Microsoft Scout | Ask for the `bootstrap-core` skill, or invoke it by name from the skill list |

Activation previews all 17 instruction files and waits for your approval before
writing anything. Running it again reports no changes.

To check where a given app writes them, run activation without approving. It
prints the exact target directory first.

### What you get after each step

| After | Skills available | Instructions active |
| --- | --- | --- |
| Step 1 | Every app | None |
| Step 2 in one app | Every app | That app only |
| Step 2 in each app you use | Every app | Every app you ran it in |

Step 1 alone is a complete, working install. Step 2 adds the always-on
behavior, and skipping it costs you nothing else.

## What Is Next

See the [roadmap](ROADMAP.md).

## License

MIT. See [LICENSE](LICENSE).
