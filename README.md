# Alex ACT ONE

![Alex ACT ONE](assets/banner.svg)

A skills pack for GitHub Copilot. It covers how to think through a problem, how
to write code and prose that hold up, and how to produce documents and charts
worth sending to someone.

Install it once at the user level. Copilot CLI, VS Code, and Microsoft Scout all
read the same installation.

**Status:** In development. Not yet published to the Alex ACT Mall.

## What You Can Do With Alex ACT ONE

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

60 skills, 15 always-on instructions, 15 slash commands, and 3 MCP servers.
Not every surface reaches every app — see [Where Alex ACT ONE Works](#where-alex-act-one-works).

Large package by design: one install brings all of it, so expect noticeably
more files on disk and a longer first sync than a single-purpose plugin.

## The Skills

Grouped by what you are trying to do. The **Needs** column lists anything beyond
Node — most skills need nothing, and a skill only appears there if it genuinely
cannot run without that dependency. See [Optional extras](#optional-extra-tools-for-a-few-skills)
for how to get them.

<!-- BEGIN GENERATED SKILL TABLE -->

### Reasoning and judgment

How to think through a problem before acting on it.

| Skill | What it does | Needs |
| --- | --- | --- |
| `act-tenets` | The 10 canonical tenets of Artificial Critical Thinking (ACT) with rationale for each | — |
| `critical-thinking` | Challenge what you think is right — alternative hypotheses, missing data, evidence quality, bias detection,… | — |
| `problem-framing-audit` | Step-back protocol — restate, generalize, specialize, invert, ask why, pre-mortem, check stakeholders, and audit… | — |
| `adversarial-review` | Structured skepticism for high-stakes decisions and reviews | — |
| `deep-review` | Adversarial code review with three parallel perspectives — Advocate, Skeptic, Architect — that create productive… | — |
| `anti-hallucination` | Prevent fabricated facts, invented APIs, and citation confabulation at the point of generation | — |
| `risk-analysis` | Probability × impact risk assessment for curation and planning decisions | — |
| `ethical-reasoning` | Reason through ethical tensions using moral foundations, constitutional principles, and a five-step decision… | — |
| `mutation-testing` | Meta-test your test harness — apply small intentional defects to production code, expect the suite to catch each… | — |

### Engineering

Writing and changing code that survives review.

| Skill | What it does | Needs |
| --- | --- | --- |
| `code-review` | Systematic code review for correctness, security, and growth — not just style enforcement | — |
| `security-and-hardening` | Hardens code against vulnerabilities | — |
| `test-driven-development` | Use for any feature, bug fix, refactor, or behavior change — enforces RED-GREEN-REFACTOR | — |
| `systematic-debugging` | Use when encountering any bug, test failure, or unexpected behavior, before proposing fixes | — |
| `git-workflow` | Apply consistent git practices for branch hygiene, safe commits, and recovery from common mishaps (lost commits,… | — |
| `plan` | Use when the user wants a plan instead of execution, or before any non-trivial implementation (multi-file,… | — |
| `spike` | Use when the user wants to feel out an idea before committing to a real build | — |

### Prose and documentation

Writing people finish reading.

| Skill | What it does | Needs |
| --- | --- | --- |
| `big-idea` | Distill the central claim before authoring any summary-shaped output: hero copy, commit-message subject, PR title,… | — |
| `humanizer` | Use when the user wants to humanize, de-AI, de-slop, or un-ChatGPT a piece of text | — |
| `communication-craft` | Communication patterns for feedback, cross-audience content, and eliciting needs | — |
| `doc-hygiene` | Documentation hygiene — anti-drift rules, code-documentation placement, count elimination, and living document… | — |
| `lint-clean-markdown` | Write markdown that passes markdownlint on first attempt — encode the most common rules as muscle memory | — |
| `status-reporting` | Create stakeholder-friendly project status updates and progress reports | — |
| `markdown-sanitization-chain` | Render user-supplied markdown safely — marked.js → DOMPurify → Mermaid (order matters; skipping the sanitizer is… | — |
| `corpus-qa-sweep` | Run a QA sweep across an entire corpus instead of one sample: instrument the real output boundary, assert… | — |

### Charts and figures

Deciding what to draw, drawing it, and checking it says what you meant.

| Skill | What it does | Needs |
| --- | --- | --- |
| `chart-big-idea` | Distill the one-sentence Big Idea, story arc, audience, and style stance for a chart BEFORE picking a chart type | — |
| `chart-vocabulary` | Catalog of chart types organized by seven communication goals (comparison, change over time, proportion,… | — |
| `chart-interpretation` | Read a chart someone else made — image, screenshot, HTML, or dashboard — and extract insights, patterns,… | — |
| `flint-chart` | Use when the user wants to visualize data — from 'which chart should I use?' to 'render this' | Flint MCP |
| `flint-theme` | Creates and refines reusable Flint ThemeSpec visual systems from brand guidance, websites, decks, design tokens,… | Flint MCP |
| `ascii-chart` | Render charts and compact dashboards as pure ASCII in a monospace grid: bar, dot, sparkline, histogram, box plot,… | — |
| `print-svg-style-guide` | Author print-quality SVG figures for books, reports, and exec-facing documents: canvas and typography grammar with… | — |
| `figure-generator` | Ship deterministic hand-authored SVG generators for print-quality figures backed by real published datasets | — |
| `svg-banner` | Generate 1200x320 SVG banners for READMEs, plans, notes, and release artifacts, using a pluggable brand config… | — |
| `markdown-mermaid` | Author Mermaid diagrams that render correctly in GitHub, VS Code, and Mermaid 10+ consumers | — |
| `annotate-screenshot` | Add callouts to a raster you did not author, using Pillow, at a resolution that stays legible | Pillow |
| `render-verify` | Verify a rendered visual artifact actually says what it was supposed to say | — |
| `replicate-imagery` | Route AI image generation and editing requests to Replicate (FLUX, Ideogram, Recraft, SDXL, imagen) via the… | Replicate MCP |
| `docs-shell` | The single-page HTML shell (index.html + manifest.json at a repository root or stable subfolder) that renders… | — |

### Document conversion

Moving a document between formats without losing its structure.

| Skill | What it does | Needs |
| --- | --- | --- |
| `docx-to-md` | Convert Word documents (.docx) to clean Markdown with image extraction and pandoc cleanup | Pandoc |
| `html-to-md` | Convert HTML documents to clean Markdown via pandoc | Pandoc |
| `md-to-html` | Convert Markdown to standalone HTML pages with embedded CSS, images, and Mermaid diagrams | Pandoc |
| `md-to-word` | Convert Markdown with Mermaid diagrams and SVG illustrations to professional Word documents | Pandoc |
| `md-to-eml` | Convert Markdown to RFC 5322 email (.eml) with inline CSS and CID images | Pandoc |
| `md-to-txt` | Strip Markdown formatting and produce clean plain text via pandoc | Pandoc |
| `rich-email` | Create and validate polished HTML email drafts from Markdown, then open an unsent New Outlook draft on Windows | Pandoc |

### Working on the agent itself

Auditing, extending, and consolidating the agent.

| Skill | What it does | Needs |
| --- | --- | --- |
| `meditation` | Review session outcomes, recommend reusable skills or automation, and reconcile project guidance, handoff, tasks,… | — |
| `compile-brain` | Create or improve a Markdown instruction, skill, prompt, or agent from an explicitly selected file or… | — |
| `assess-brain` | Assess active Markdown brain files in a local AI agent project or plugin source without changing it | — |
| `project-capability-authoring` | Create tested project-local skills and scripts from demonstrated repeated work | — |
| `token-waste-elimination` | Audit active brain artifacts for context cost, duplicated guidance, oversized routing files, and stale metadata | — |
| `proactive-awareness` | Applies cross-session context recovery, uncommitted-work detection, and focus routing once proactive behavior has… | — |
| `evaluate-before-adopting` | Decide whether a plugin or skill from a catalog is worth installing | — |

### Setup and platform

Getting the plugin and its dependencies working.

| Skill | What it does | Needs |
| --- | --- | --- |
| `bootstrap-core` | Activates, verifies, repairs, or removes this plugin's user-scope runtime instructions from canonical installed… | — |
| `bootstrap-project` | Previews and applies this plugin's repository scaffold, portable workspace QoL settings, and project Copilot… | — |
| `setup-dependencies` | Check which optional dependencies this plugin can use, report what each missing one costs, and install them with… | — |
| `platform-awareness` | VS Code Copilot platform changes affecting how tools are used: deferred-tool categories with example search… | — |
| `browser-tools` | Use VS Code 1.127+ browser tools (open_browser_page, screenshot_page, click_element, navigate_page,… | — |
| `terminal-command-safety` | Provides terminal output-capture, hung-command, and platform-behavior procedures while the resident instruction… | — |
| `install-visual-companions` | Offer to install marketplace plugins that extend visual-authoring workflows: chart rendering, screenshot… | — |
| `setup-enterprise-stack` | Emit and (with consent) install the Copilot CLI settings block for the public Microsoft ecosystem: Azure, Fabric,… | — |

<!-- END GENERATED SKILL TABLE -->

### The skill that checks the other skills

Every other skill here assumes it belongs on your machine. This one asks whether
it does.

Plugin catalogs score the **source** — who published it, how recently the
repository was updated, whether the license is clear. None of that says the
plugin is correct, and nothing in a typical publishing pipeline reads the
content: scanning indexes what exists, packaging validates structure, and no step
compiles a code sample or follows a link.

So a plugin can sit in the highest trust band and still tell you to install a
package that does not exist. That is not hypothetical. One such plugin — top
band, first-party, the strongest candidate in a 4,266-plugin catalog — claimed a
NuGet package that returns zero registry results, an SDK API that was never
published, and a cited file absent from the entire source repository. One
registry query was enough to catch the package.

[`evaluate-before-adopting`](skills/evaluate-before-adopting/SKILL.md) does that
checking, by reading the content rather than measuring the repository around it.

It reads the artifact the way your agent will — as instructions that run with your
tools, your files, and your credentials — and looks for directives aimed at the
agent, exfiltration paths, destructive defaults, and unpinned installs. Roughly
one skill in five ships actual scripts, so it reads those too, and checks what
they do against what the description says they do. It resolves which copy you
have when several stores carry the same name, verifies the checkable specifics
against registries and SDK documentation, follows every reference, weighs what
the freshness stamp actually covers, and judges whether it fits where you are
putting it.

Safe to run, correct, and worth relying on are three separate questions. A trust
score answers none of them.

The usual path installs first and asks later:

```bash
copilot plugin install copilot-sdk@alex-mall
```

That runs someone else's code on your machine on the strength of a description.
This reads it first:

```text
Evaluate copilot-sdk@alex-mall before I install it.
```

Any marketplace works, not only this one. Name whatever plugin you were about to
install and the skill goes and looks at it.

Use it when adoption is hard to reverse or far-reaching — a runtime every project
loads, a plugin that will hold credentials. Skip it for a per-project install you
can remove in a second. Judge by what it costs to be wrong.

## Where Alex ACT ONE Works

Skills sit at the package root, so each app finds them directly. No bridge, no
symbolic links, and no second plugin store to keep in sync. The other three
surfaces are not automatic in the same way, and this table says which are.

| Where you use Copilot | Skills | Instructions | Slash commands | MCP servers |
| --- | --- | --- | --- | --- |
| Copilot CLI | All | All, after activation | All | All, from the manifest |
| VS Code with GitHub Copilot Chat | All | All, after activation | All | All, from the manifest |
| Microsoft Scout | All | All, after activation | **None** | All, after registration |
| GitHub Copilot app | Not yet tested | Not yet tested | Not yet tested | Not yet tested |

The Scout row was re-checked on 2026-09-13 inside a live session: all 60 skills
surfaced, all 15 instructions were active in context, none of the 15 slash
commands were reachable, and both registered MCP servers answered a protocol
handshake — 6 tools from Flint, 24 from Playwright.

Three Scout-specific notes:

- **Slash commands do not reach Scout.** It has no command surface for plugin
  prompts. Every command has an equivalent skill you can ask for by name, so
  nothing is lost in capability — but the commands themselves are absent rather
  than merely undocumented.
- **MCP servers need one extra step.** CLI and VS Code read `plugin.json`
  directly. Scout keeps its own registry and ignores that manifest, so the
  servers must be registered once with
  `/alex-act-one setup-dependencies`. Skipping it leaves every skill loaded and
  every server it calls missing.
- **Register from the copy Scout is actually serving.** Scout can keep a Copilot
  home separate from the CLI's, so two installed copies of this package may sit
  at different versions on one machine. Registration writes absolute paths, so
  running it against the wrong copy points the servers at stale code that still
  starts — an outdated server rather than an obviously missing one, which is far
  harder to spot. Register from the copy whose skills Scout is loading, and
  register again after every upgrade.

## Install

Two steps. The first runs once per machine, the second once per app. Scout needs
a few extra steps of its own, and a final section covers optional tools; none of
those tools are needed to get started.

### 1. Install the plugin

From source, until the Mall listing is published:

```powershell
copilot plugin install fabioc-aloha/Alex_ACT_ONE
```

Use that exact form. Copilot names the installed folder after whatever you type,
and that name becomes the prefix on every skill. Installing from the full
`https://github.com/...` URL works, but makes every skill name longer for no
benefit.

Copilot prints a deprecation notice about installing from a repository. That is
expected and the install still works. It is the reason a Mall listing is the
next thing on the [roadmap](ROADMAP.md).

Every skill is now available in Copilot CLI, VS Code, and Microsoft Scout. They
normally share one copy on disk. Scout is the exception worth knowing about: it
can keep a Copilot home of its own, so a terminal install and the copy Scout
loads are not always the same folder. [Extra steps on Microsoft
Scout](#extra-steps-on-microsoft-scout) covers how to check.

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

Activation previews every instruction file and waits for your approval before
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

### Extra steps on Microsoft Scout

Scout differs from the other apps in three ways: it has no slash commands, it
keeps its own MCP registry, and it may read a different plugin folder than the
one a terminal install wrote to. Work through these in order.

#### Find the copy Scout is serving

Two copies at different versions can sit on one machine without either app
complaining, so establish which one Scout loads before changing anything else.
Ask it:

```text
Load the setup-dependencies skill and tell me which folder it came from.
```

The path it reports is the copy Scout serves. Use that path for everything
below. If it is older than the one you just installed, reinstall from within
Scout before continuing — otherwise the later steps configure a package Scout
never reads.

#### Turn on the instructions

Scout has no command surface for plugin prompts, so `/alex-act-one bootstrap-core`
does not exist there. Ask for the skill by name instead:

```text
Run the bootstrap-core skill.
```

It previews every instruction file and waits for your approval before writing.
Run it again any time; if nothing has drifted it reports no changes.

#### Register the MCP servers

Only needed if you want charts, browser verification, or image generation.
Copilot CLI and VS Code read the servers from `plugin.json` and need nothing
extra. Scout ignores that manifest and keeps its own registry, so the servers
have to be registered explicitly:

```text
Run the setup-dependencies skill and register the MCP servers with Scout.
```

It previews first: the plugin root it resolved, the registry path, and one line
per server. **Check the plugin root against the path you found above.**
Registration writes absolute paths, so running it from an old copy pins the
servers to stale code — they still start, which makes an outdated server much
harder to notice than a missing one. It backs the existing registry up before
writing and merges rather than replaces, so your other servers are untouched.

`replicate` is skipped unless `REPLICATE_API_TOKEN` is set in the environment.
That is deliberate: a clear omission now beats an opaque authentication failure
at call time.

#### Restart Scout completely

Quit the application. A new conversation is not enough — Scout starts MCP
servers at launch and learns their tools from that one handshake.

#### Confirm it worked

```text
List the Flint chart tools you can call.
```

Six should come back: `render_chart`, `compile_chart`, `validate_chart`,
`list_chart_types`, `list_themes`, and `create_chart_view`. If none do, either
the restart was not a full quit or the registration ran against a different copy
than the one Scout loads.

Skipping registration leaves every skill loaded and every tool those skills call
missing, which reads as a broken package rather than an unregistered one.

### Optional: extra tools for a few skills

Most of this plugin needs nothing but Node. The large majority of its skills run
with no external tools at all, and nothing below is needed to start.

| If you want to... | You also need | Get it |
| --- | --- | --- |
| Convert documents (Word, HTML, email, plain text) | Pandoc | `winget install JohnMacFarlane.Pandoc`, `brew install pandoc`, or `apt install pandoc` |
| Render Mermaid diagrams into Word or HTML output | Mermaid CLI | `npm install -g @mermaid-js/mermaid-cli@11.17.0` |
| Export SVG banners and figures as PNG | svgexport | `npm install -g svgexport@0.4.2` |
| Annotate a screenshot | Pillow | `pip install Pillow` |
| Render charts | Flint MCP server | `/alex-act-one setup-dependencies` |
| Check rendered output in a browser | The `alex-playwright` MCP server, or your host's own browser tools | `/alex-act-one setup-dependencies` |
| Generate images with AI | Replicate MCP server, plus a paid account and API token | `/alex-act-one setup-dependencies` |

The three MCP servers are not equally important. Only Flint is required for the
skill that uses it: without it, chart rendering cannot run and there is no
substitute. Playwright has one — several hosts provide their own browser tools —
and Replicate adds a capability rather than unblocking one.

That fallback has a limit worth knowing before you rely on it. A host can have a
browser and still refuse to open `file://`, which is the case that matters for
checking an artifact you just wrote to disk. VS Code opens local files with no
flags; Scout's built-in browser blocks them; Copilot CLI has no browser at all.
The package registers its own server as `alex-playwright` — a distinct name, so
it sits alongside a host's built-in browser tools rather than shadowing them.

To see what you already have and what any gap costs you:

```text
/alex-act-one setup-dependencies
```

It reports what is present, what is missing, and what each missing piece
unlocks. It installs nothing without asking, and it never runs a system package
manager on your behalf.

If you skip this entirely, every skill that needs one of these will tell you
exactly which tool it wants and how to install it, at the moment you need it.

## Tests

```text
node --test
```

A few dozen structural checks, a couple of seconds, no dependencies and no
`package.json` — the package claims to run on Node alone, and a suite that
needed a framework would undercut that.

They assert the things this README states: that every MCP server starts and
reports its pinned version, that activation runs and plans exactly what the
manifest declares, that the manifest and the files on disk agree in both
directions, that each skill and instruction carries the frontmatter its host
reads, that the counts quoted above are real, and that no relative link is dead.

The checks that need a provisioned runtime skip rather than fail when
`setup-dependencies` has not been run, so a clean checkout does not report red
for a step it was never asked to perform.

They exist because of specific defects, each of which passed unnoticed until
something ran the code rather than reading about it. Release steps and the
failures that motivated them are in the
[release checklist](RELEASE-CHECKLIST.md).

## What Is Next

See the [roadmap](ROADMAP.md).

## License

MIT. See [LICENSE](LICENSE).