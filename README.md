# Alex ACT ONE

![Alex ACT ONE](assets/banner.svg)

A skills pack for GitHub Copilot. It covers how to think through a problem, how
to write code and prose that hold up, and how to produce documents and charts
worth sending to someone.

Install it at the user level. Copilot CLI, VS Code, Microsoft Scout, and the
GitHub Copilot app can use the same installed copy. Scout should use the
Copilot CLI installation under `~/.copilot`, not a duplicate under
`~/.scout/copilot`, after enabling **Load Copilot CLI skills** in Scout's UI.
Activation remains per-app, and Scout requires separate MCP registration.

**Status:** Published in the Alex ACT Mall. The release identity is declared in
`plugin.json` and `manifest.json`. GitHub Copilot app compatibility was tested
on 2026-09-13.

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

Skills sit at the package root, so each app can load them directly. Scout can
use the plugin installed for Copilot CLI under `~/.copilot`; a Scout-local ONE
copy is duplicate state and can drift independently. Verify the loaded root and
version before activation or Scout MCP registration. The other three surfaces
are not automatic in the same way, and this table says which are.

| Where you use Copilot | Skills | Instructions | Slash commands | MCP servers |
| --- | --- | --- | --- | --- |
| Copilot CLI | All | All, after activation | All | All, from the manifest |
| VS Code with GitHub Copilot Chat | All | All, after activation | All | All, from the manifest |
| Microsoft Scout | All, after enabling **Load Copilot CLI skills** | All, after activation | **None** | All, after registration |
| GitHub Copilot app | All, discovered and invoked | All, active after activation | All, exposed | Registered; Flint and Playwright verified; Replicate requires an API token |

The GitHub Copilot app test on 2026-09-13 found all 15 instructions active and
at hash parity with the installed v0.2.0 sources. The app discovered the skill
catalog and prompt aliases; `bootstrap-core`, `platform-awareness`,
`proactive-awareness`, and `humanizer` were invoked. Playwright listed the
active browser tabs, and Flint validated a Vega-Lite chart with no warnings or
errors. Replicate reached its MCP server but returned `401 Unauthenticated`
because this app did not have a Replicate API token. Individual skills and
slash commands were not exhaustively invoked.

The Scout row was re-checked on 2026-09-13 inside a live session: all 60 skills
surfaced, all 15 instructions were active in context, none of the 15 slash
commands were reachable, and both registered MCP servers answered a protocol
handshake — 6 tools from Flint, 24 from Playwright.

Scout-specific notes, last verified 2026-09-13:

- **Slash commands do not reach Scout.** It has no command surface for plugin
  prompts. Every command has an equivalent skill you can ask for by name, so
  nothing is lost in capability — but the commands themselves are absent rather
  than merely undocumented.
- **Scout should use the Copilot CLI installation.** A test found a stale
  Scout-local `v0.1.0` alongside the current `v0.2.0` Mall installation under
  `~/.copilot`. The duplicate was removed. Enable **Load Copilot CLI skills**
  in Scout's UI, then confirm Scout loaded the shared path and version before
  activation or MCP registration.
- **MCP servers need one extra step.** CLI and VS Code read `plugin.json`
  directly. Scout keeps its own registry and ignores that manifest, so the
  servers must be registered from the loaded `setup-dependencies` skill.
  Skipping it leaves every skill loaded and every server it calls missing.

## Install

Two steps. The first runs once per machine, the second once per app. Scout needs
a few extra steps of its own, and a final section covers optional tools; none of
those tools are needed to get started.

### 1. Install the plugin

From the Alex ACT Mall:

```powershell
copilot plugin install alex-act-one@alex-mall
```

The Mall entry tracks the reviewed release and keeps the installed name stable.

Installing from source remains available:

```powershell
copilot plugin install fabioc-aloha/Alex_ACT_ONE
```

Copilot prints a deprecation notice for repository installs. The install still
works, but the Mall command is preferred.

Every skill is available in Copilot CLI, VS Code, Microsoft Scout, and the
GitHub Copilot app from the user-level installation. Scout should reuse the
Copilot CLI plugin under `~/.copilot`; do not maintain a second ONE installation
under `~/.scout/copilot`. Enable **Load Copilot CLI skills** in Scout's UI so it
discovers the shared plugin.

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
| GitHub Copilot app | Ask for the `bootstrap-core` skill, or invoke it by name from the skill list |

When a host's setup requirements are unclear, start with its no-write readiness
report. It names the activation target and the steps that only the host can
complete; it does not turn on instructions or claim the host observed them.

```text
node <this-skill>/scripts/host-readiness.cjs --host scout
```

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

### On Microsoft Scout, register the MCP servers

Only on Scout, and only if you want charts, browser verification, or image
generation. Copilot CLI and VS Code read the servers from `plugin.json` and need
nothing extra; Scout keeps its own registry and ignores that manifest.

Ask Scout for the `setup-dependencies` skill by name. Slash commands do not
exist on this surface. From the skill copy Scout loaded, run the registration
preview:

```text
node <this-skill>/scripts/register-scout-mcp.mjs
```

The preview prints its resolved plugin root, the Scout registry path, and one
line per server. Confirm that plugin root is the same copy and version Scout
served above. If it is not, stop rather than registering servers from the wrong
version.

After reviewing the preview, apply it:

```text
node <this-skill>/scripts/register-scout-mcp.mjs --apply
```

The script backs up the existing registry and merges rather than replaces, so
other servers remain untouched. Fully quit and restart Scout afterwards. A new
conversation is not enough because tools are discovered during the launch
handshake.

Confirm that Flint exposes all six expected tools:

- `compile_chart`
- `create_chart_view`
- `list_chart_types`
- `list_themes`
- `render_chart`
- `validate_chart`

`replicate` is skipped unless `REPLICATE_API_TOKEN` is set in the environment.
That is deliberate: a clear omission now beats an opaque authentication failure
at call time.

Without this step every skill still loads, but the tools those skills call are
missing, which looks like a broken package rather than an unregistered one.

### Optional: extra tools for a few skills

Most of this plugin needs nothing but Node. The large majority of its skills run
with no external tools at all, and nothing below is needed to start.

| If you want to... | You also need | Get it |
| --- | --- | --- |
| Convert documents (Word, HTML, email, plain text) | Pandoc | `winget install JohnMacFarlane.Pandoc`, `brew install pandoc`, or `apt install pandoc` |
| Render Mermaid diagrams into Word or HTML output | Mermaid CLI | `npm install -g @mermaid-js/mermaid-cli@11.17.0` |
| Export SVG banners and figures as PNG | svgexport | `npm install -g svgexport@0.4.2` |
| Annotate a screenshot | Pillow | `pip install Pillow` |
| Render charts | Flint MCP server | Ask for the `setup-dependencies` skill |
| Check rendered output in a browser | The `alex-playwright` MCP server, or your host's own browser tools | Ask for the `setup-dependencies` skill |
| Generate images with AI | Replicate MCP server, plus a paid account and API token | Ask for the `setup-dependencies` skill |

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

To see what you already have and what any gap costs you, ask for the
`setup-dependencies` skill by name. Copilot CLI and VS Code also expose it as
`/alex-act-one setup-dependencies`.

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