# Alex ACT ONE

![Alex ACT ONE](assets/banner.svg)

**Your coding agent is fast, confident, and too often wrong. Give it a discipline.**

Alex ACT ONE is a pack of skills for GitHub Copilot that changes how the agent works: frame the problem before solving it, look for evidence against its first answer, check a plan against its risks, and verify what it produced before calling it done.

**See the difference:** the same loaded prompt, "Our dashboard takes 8 seconds to load. Rust rewrite, or Redis caching?", handled two ways. Try it yourself with [the evaluation guide](docs/launch/evaluation-guide.md).

|  | Without Alex ACT ONE | With Alex ACT ONE |
|---|---|---|
| First move | Jumps straight to an answer | Stops and checks the question first |
| The answer | Picks Rust or Redis, and sounds sure | Asks where the 8 seconds are actually spent |
| Evidence | Does not ask for any | Says what to measure, and what result would change the answer |
| Confidence | Sounds certain either way | Marks what is known, reported, estimated, or guessed |
| The result | A plan, handed over as final | The work gets checked before it ships |

## Quick install

Install the plugin once, at the user level:

```powershell
copilot plugin install alex-act-one@alex-mall
```

Then, in each app where you want the always-on behavior, run:

```text
/alex-act-one bootstrap-core
```

One installed copy serves Copilot CLI, VS Code, Microsoft Scout, and the GitHub Copilot app. Full install notes, the from-source option, and the Scout specifics are in [Install](#install).

**Release status, reviewed 2026-11-05:** the published baseline is `v0.8.0`.
This source checkout also includes the not yet released `flint-interactions`
workflow, offline demonstration pages, and activation/runtime/conversion repairs.
They do not appear in an existing
installation until a new package is published and installed. Existing command
names, bootstrap activation, and optional browser fallback remain available.

Try the [offline Flint chart gallery](docs/flint-showcase.html) for working examples of semantic data, themes, interactions, linked views, and static exports, or the [experimental interaction lab](docs/flint-experimental.html) for polar brushing, direct reordering, distribution shapes, and reader-driven stories. Open either downloaded HTML in a browser; no server or connection is needed.

### Source package inventory

Generated from the manifest, asset directories, and MCP registrations, not from
the published release's historical inventory.

<!-- BEGIN GENERATED INVENTORY -->

| Source surface | Count | Delivery |
| --- | --- | --- |
| Skills | 64 | Loaded on demand from the plugin |
| Prompts / command aliases | 15 | Thin user-invoked entrypoints; availability depends on host |
| Resident instructions | 15 | Preview-first profile activation; execution detail stays in skills |
| MCP servers | 3 | Registered from plugin metadata where supported |

<!-- END GENERATED INVENTORY -->

Using Muse instead of Copilot? The Muse edition lives at [Alex_ACT_ONE_Muse](https://github.com/fabioc-aloha/Alex_ACT_ONE_Muse)

Using Claude Code? The skills install there too, by hand: see [Using Claude Code instead?](#using-claude-code-instead) under Install..

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

See the [source inventory](#source-package-inventory) for the current package
contents. Not every surface reaches every app — see
[Where Alex ACT ONE Works](#where-alex-act-one-works).

Large package by design: one install brings all of it, so expect noticeably
more files on disk and a longer first sync than a single-purpose plugin.

## The Skills

Grouped by what you are trying to do. The **Needs** column lists anything beyond
Node — most skills need nothing, and a skill only appears there if it genuinely
cannot run without that dependency. See [Optional extras](#optional-extra-tools-for-a-few-skills)
for how to get them. The discovery summaries below come from current skill
frontmatter and may be shortened; follow each source link for full triggers,
inputs, authority, and verification.

<!-- BEGIN GENERATED SKILL TABLE -->

### Reasoning and judgment

How to think through a problem before acting on it.

| Skill | Discovery summary | Needs |
| --- | --- | --- |
| [`act-tenets`](skills/act-tenets/SKILL.md) | The 10 canonical tenets of Artificial Critical Thinking (ACT) with rationale for each — I Hypothesis Primacy, II Disconfirmation Over Confirmation, III Multiple Working... | Node only |
| [`critical-thinking`](skills/critical-thinking/SKILL.md) | Challenge what you think is right — alternative hypotheses, missing data, evidence quality, bias detection, falsifiability, and adversarial review | Node only |
| [`problem-framing-audit`](skills/problem-framing-audit/SKILL.md) | Step-back protocol — restate, generalize, specialize, invert, ask why, pre-mortem, check stakeholders, and audit framings before solving | Node only |
| [`adversarial-review`](skills/adversarial-review/SKILL.md) | Structured skepticism for high-stakes decisions and reviews. Six methods — Red Team/Blue Team, Pre-Mortem, Steel Manning, Murphyjitsu, 10/10/10, Cross-Model External Critic. Use... | Node only |
| [`deep-review`](skills/deep-review/SKILL.md) | Select the canonical code-review deep mode for high-stakes changes requiring independent perspectives and evidence-backed synthesis. Preserve read-only review; do not require a... | Node only |
| [`anti-hallucination`](skills/anti-hallucination/SKILL.md) | Prevent fabricated facts, invented APIs, and citation confabulation at the point of generation. Use when generating factual claims, code examples, API references, library names,... | Node only |
| [`risk-analysis`](skills/risk-analysis/SKILL.md) | Probability × impact risk assessment for curation and planning decisions. Categorize risks (quality, coherence, scope creep, token budget, breaking change, staleness), score by... | Node only |
| [`ethical-reasoning`](skills/ethical-reasoning/SKILL.md) | Reason through ethical tensions using moral foundations, constitutional principles, and a five-step decision process, plus privacy-by-design and responsible-AI guidance. Use... | Node only |
| [`mutation-testing`](skills/mutation-testing/SKILL.md) | Meta-test your test harness — apply small intentional defects to production code, expect the suite to catch each one. Surfaces silent coverage gaps that 100% line coverage hides. | Node only |

### Engineering

Writing and changing code that survives review.

| Skill | Discovery summary | Needs |
| --- | --- | --- |
| [`code-review`](skills/code-review/SKILL.md) | Systematic code review for correctness, security, and growth — not just style enforcement | Node only |
| [`security-and-hardening`](skills/security-and-hardening/SKILL.md) | Hardens code against vulnerabilities. Use when handling user input, authentication, data storage, or external integrations. OWASP-aware, language-agnostic principles with... | Node only |
| [`test-driven-development`](skills/test-driven-development/SKILL.md) | Use for any feature, bug fix, refactor, or behavior change — enforces RED-GREEN-REFACTOR. Write the failing test first, watch it fail, write minimal code to pass, refactor.... | Node only |
| [`systematic-debugging`](skills/systematic-debugging/SKILL.md) | Use when encountering any bug, test failure, or unexpected behavior, before proposing fixes. Four-phase root-cause-first method (investigate → pattern-analyze → hypothesize →... | Node only |
| [`git-workflow`](skills/git-workflow/SKILL.md) | Apply consistent git practices for branch hygiene, safe commits, and recovery from common mishaps (lost commits, bad merges, accidental pushes). Use when authoring or reviewing... | Node only |
| [`plan`](skills/plan/SKILL.md) | Use native planning for uncertain or consequential implementation work. Preserve read-only discussion, approval before execution, and task-specific verification without... | Node only |
| [`spike`](skills/spike/SKILL.md) | Use when the user wants to feel out an idea before committing to a real build — "spike this out", "try it", "is this even possible?", "compare A vs B". Throwaway experiments... | Node only |

### Prose and documentation

Writing people finish reading.

| Skill | Discovery summary | Needs |
| --- | --- | --- |
| [`big-idea`](skills/big-idea/SKILL.md) | Distill the central claim before authoring any summary-shaped output: hero copy, commit-message subject, PR title, ADR title, slide title, executive summary, skill description,... | Node only |
| [`humanizer`](skills/humanizer/SKILL.md) | Use when the user wants to humanize, de-AI, de-slop, or un-ChatGPT a piece of text — review AI-associated patterns and add real voice — or wants a copywriter pass that reviews... | Node only |
| [`communication-craft`](skills/communication-craft/SKILL.md) | Communication patterns for feedback, cross-audience content, and eliciting needs. SBI feedback model (Situation → Behavior → Impact), stakes-calibrated review voice,... | Node only |
| [`doc-hygiene`](skills/doc-hygiene/SKILL.md) | Documentation hygiene — anti-drift rules, code-documentation placement, count elimination, and living document maintenance. Use when auditing docs or comments for drift, fixing... | Node only |
| [`lint-clean-markdown`](skills/lint-clean-markdown/SKILL.md) | Write markdown that passes markdownlint on first attempt — encode the most common rules as muscle memory | Node only |
| [`status-reporting`](skills/status-reporting/SKILL.md) | Create stakeholder-friendly project status updates and progress reports. Use when writing a status update, progress report, weekly or milestone recap, release summary, or any... | Node only |
| [`markdown-sanitization-chain`](skills/markdown-sanitization-chain/SKILL.md) | Render user-supplied markdown safely — marked.js → DOMPurify → Mermaid (order matters; skipping the sanitizer is XSS) | Node only |
| [`corpus-qa-sweep`](skills/corpus-qa-sweep/SKILL.md) | Run a QA sweep across an entire corpus instead of one sample: instrument the real output boundary, assert machine-checkable invariants, sweep every item, then triage every flag... | Node only |

### Charts and figures

Deciding what to draw, drawing it, and checking it says what you meant.

| Skill | Discovery summary | Needs |
| --- | --- | --- |
| [`render-chart`](skills/render-chart/SKILL.md) | Orchestrates expert visual storytelling over Flint: frame the claim, inspect data, explore familiar and expressive treatments over one semantic truth layer, select or author a... | Flint MCP |
| [`chart-big-idea`](skills/chart-big-idea/SKILL.md) | Distill the one-sentence Big Idea, story arc, audience, and style stance for a chart BEFORE picking a chart type. Starts by questioning intent — whether the artifact should... | Node only |
| [`chart-vocabulary`](skills/chart-vocabulary/SKILL.md) | Catalog of chart types organized by seven communication goals (comparison, change over time, proportion, distribution, relationship, flow, deviation), with a selection... | Node only |
| [`chart-interpretation`](skills/chart-interpretation/SKILL.md) | Read a chart someone else made — image, screenshot, HTML, or dashboard — and extract insights, patterns, anomalies, and misleading framing. The reverse of authoring. Use when... | Node only |
| [`flint-chart`](skills/flint-chart/SKILL.md) | Use when the user wants to visualize data — from 'which chart should I use?' to 'render this'. Helps pick the right chart from the analytical question (comparison / trend /... | Flint MCP |
| [`flint-interactions`](skills/flint-interactions/SKILL.md) | Choose and verify interactive Flint chart behavior: highlight, brush, zoom, legend toggles, filters, annotations, keyboard navigation, linked views, and reset. Use when a reader... | Flint MCP |
| [`flint-theme`](skills/flint-theme/SKILL.md) | Creates and refines reusable Flint ThemeSpec visual systems from brand guidance, websites, decks, design tokens, or publication references. Use when a user asks for a custom... | Flint MCP |
| [`ascii-chart`](skills/ascii-chart/SKILL.md) | Render charts and compact dashboards as pure ASCII in a monospace grid: bar, dot, sparkline, histogram, box plot, scatter, bubble, heatmap, funnel, waterfall, treemap, gauge,... | Node only |
| [`print-svg-style-guide`](skills/print-svg-style-guide/SKILL.md) | Author print-quality SVG figures for books, reports, and exec-facing documents: canvas and typography grammar with a legibility floor, a semantic color palette where color... | Node only |
| [`figure-generator`](skills/figure-generator/SKILL.md) | Ship deterministic hand-authored SVG generators for print-quality figures backed by real published datasets. Ships the .mjs generator pattern reading from data/<slug>.json, the... | Node only |
| [`svg-banner`](skills/svg-banner/SKILL.md) | Generate 1200x320 SVG banners for READMEs, plans, notes, and release artifacts, using a pluggable brand config that any project can override. Use when a document needs a hero... | Node only |
| [`markdown-mermaid`](skills/markdown-mermaid/SKILL.md) | Author Mermaid diagrams that render correctly in GitHub, VS Code, and Mermaid 10+ consumers. Applies a config-driven init directive + linkStyle + semantic classDef vocabulary... | Node only |
| [`annotate-screenshot`](skills/annotate-screenshot/SKILL.md) | Add callouts to a raster you did not author, using Pillow, at a resolution that stays legible. Covers upscale-then-annotate ordering, supersampled shape rendering, measured... | Pillow |
| [`render-verify`](skills/render-verify/SKILL.md) | Verify a rendered visual artifact actually says what it was supposed to say — open it, read console errors, walk a failure catalog, and check its claim. Works on charts,... | Node only |
| [`replicate-imagery`](skills/replicate-imagery/SKILL.md) | Route AI image generation and editing requests to Replicate (FLUX, Ideogram, Recraft, SDXL, imagen) via the bundled `replicate` MCP server. Use when a document, book, or report... | Replicate MCP |
| [`docs-shell`](skills/docs-shell/SKILL.md) | The single-page HTML shell (index.html + manifest.json at a repository root or stable subfolder) that renders concatenated markdown as browsable, GitHub-styled documentation... | Node only |

### Document conversion

Moving a document between formats without losing its structure.

| Skill | Discovery summary | Needs |
| --- | --- | --- |
| [`convert`](skills/convert/SKILL.md) | Convert a document between Markdown, HTML, Word, email, and plain text using the matching bundled converter. Use when the user asks to transform a supported document format. | Pandoc |
| [`docx-to-md`](skills/docx-to-md/SKILL.md) | Convert Word documents (.docx) to clean Markdown with image extraction and pandoc cleanup. Use when the user asks to convert a Word doc, convert docx to md, or import a .docx... | Pandoc |
| [`html-to-md`](skills/html-to-md/SKILL.md) | Convert HTML documents to clean Markdown via pandoc. Use when the user asks to convert HTML to markdown or import a .html file into markdown. | Pandoc |
| [`md-to-html`](skills/md-to-html/SKILL.md) | Convert Markdown to standalone HTML pages with embedded CSS, images, and Mermaid diagrams. Use when the user asks to convert to HTML, make a webpage, or export markdown as an... | Pandoc |
| [`md-to-word`](skills/md-to-word/SKILL.md) | Convert Markdown with Mermaid diagrams and SVG illustrations to professional Word documents. Use when the user asks to convert to Word, make a docx, or export markdown as a... | Pandoc |
| [`md-to-eml`](skills/md-to-eml/SKILL.md) | Convert Markdown to RFC 5322 email (.eml) with inline CSS and CID images. Use when the user asks to convert to email, make an eml, or export markdown as an .eml file. | Pandoc |
| [`md-to-txt`](skills/md-to-txt/SKILL.md) | Strip Markdown formatting and produce clean plain text via pandoc. Use when the user asks to convert to plain text or export markdown as a .txt file. | Pandoc |
| [`rich-email`](skills/rich-email/SKILL.md) | Create and validate polished HTML email drafts from Markdown, then open an unsent New Outlook draft on Windows. Use for rich stakeholder updates, executive summaries, or... | Pandoc |

### Working on the agent itself

Auditing, extending, and consolidating the agent.

| Skill | Discovery summary | Needs |
| --- | --- | --- |
| [`meditation`](skills/meditation/SKILL.md) | Review session outcomes, recommend reusable skills or automation, and reconcile project guidance, handoff, tasks, and change history. | Node only |
| [`compile-brain`](skills/compile-brain/SKILL.md) | Create or improve a Markdown instruction, skill, prompt, or agent from an explicitly selected file or user-identified text. Use when a user asks to optimize an existing brain... | Node only |
| [`assess-brain`](skills/assess-brain/SKILL.md) | Assess active Markdown brain files in a local AI agent project or plugin source without changing it. Use before modifying a brain or reviewing declared instructions, skills,... | Node only |
| [`project-capability-authoring`](skills/project-capability-authoring/SKILL.md) | Create tested project-local skills and scripts from demonstrated repeated work. Use after meditation or when a project workflow recurs and manual execution has caused... | Node only |
| [`token-waste-elimination`](skills/token-waste-elimination/SKILL.md) | Audit active brain artifacts for context cost, duplicated guidance, oversized routing files, and stale metadata. Use during brain audits, quarterly review, or when instructions... | Node only |
| [`proactive-awareness`](skills/proactive-awareness/SKILL.md) | Applies cross-session context recovery, uncommitted-work detection, and focus routing once proactive behavior has been judged appropriate. Use when continuity, worktree state,... | Node only |
| [`project-status`](skills/project-status/SKILL.md) | Report the current project's repository state, recent work, brain QA health (if applicable), and pending handoff items. Use for session orientation or an on-demand project... | Node only |
| [`evaluate-before-adopting`](skills/evaluate-before-adopting/SKILL.md) | Decide whether a plugin or skill from a catalog is worth installing. Covers what a trust score does and does not measure, reading the prose and any bundled scripts for unsafe... | Node only |

### Setup and platform

Getting the plugin and its dependencies working.

| Skill | Discovery summary | Needs |
| --- | --- | --- |
| [`bootstrap-core`](skills/bootstrap-core/SKILL.md) | Activates, verifies, repairs, or removes this plugin's user-scope runtime instructions from canonical installed sources. Use after installing or updating Alex ACT ONE, when ACT... | Node only |
| [`bootstrap-project`](skills/bootstrap-project/SKILL.md) | Previews and applies this plugin's repository scaffold, portable workspace QoL settings, and project Copilot settings while preserving project-owned files. Use for new... | Node only |
| [`setup-dependencies`](skills/setup-dependencies/SKILL.md) | Check which optional dependencies this plugin can use, report what each missing one costs, and install them with consent. Covers Pandoc, Mermaid CLI, svgexport, jszip, and the... | Node only |
| [`platform-awareness`](skills/platform-awareness/SKILL.md) | Discover current host capabilities and verify Copilot CLI/VS Code platform claims against native help and official documentation. Use for deferred tools, harness differences,... | Node only |
| [`browser-tools`](skills/browser-tools/SKILL.md) | Use native browser capabilities first for interactive pages, screenshots, console errors, measured visual checks, local artifacts, and embedded-frame or hidden-tab input... | Node only |
| [`terminal-command-safety`](skills/terminal-command-safety/SKILL.md) | Provides terminal output-capture, hung-command, and platform-behavior procedures while the resident instruction retains the Backtick Hazard floor. Use when a command may lose... | Node only |
| [`install-visual-companions`](skills/install-visual-companions/SKILL.md) | Offer to install marketplace plugins that extend visual-authoring workflows: chart rendering, screenshot verification, whiteboard iteration, and PR annotation. Consent-gated,... | Node only |
| [`setup-enterprise-stack`](skills/setup-enterprise-stack/SKILL.md) | Emit and (with consent) install the Copilot CLI settings block for the public Microsoft ecosystem: Azure, Fabric, Power BI, and Microsoft 365 Agents Toolkit. Defaults to **repo... | Node only |

<!-- END GENERATED SKILL TABLE -->

## Prompts and compatibility commands

Prompts preserve the command aliases while delegating execution to one owning
skill. User arguments and constraints pass through unchanged; an alias grants
no additional write, installation, sending, or publication authority. Use the
host's plugin-command syntax. Scout has no plugin prompt surface; ask for the
owning skill instead.

<!-- BEGIN GENERATED PROMPT TABLE -->

| Prompt alias | Discovery summary | Execution owner / mode |
| --- | --- | --- |
| [`assess-brain`](prompts/assess-brain.prompt.md) | Runs a read-only Markdown assessment of a local project brain or plugin source. Use when reviewing instructions, skills, prompts, agents, bundled Markdown resources, research... | [`assess-brain`](skills/assess-brain/SKILL.md) / assessment |
| [`banner`](prompts/banner.prompt.md) | Generate a 1200×320 SVG banner using the active brand config (default: Alex ACT), with title, subtitle, and watermark. Use for READMEs, plans, notes, and release artifacts. | [`svg-banner`](skills/svg-banner/SKILL.md) / banner |
| [`bootstrap-core`](prompts/bootstrap-core.prompt.md) | Preview, activate, verify, repair, or remove this plugin's user-scope runtime instructions. Use after installing or updating Alex ACT ONE, or when Alex ACT identity and... | [`bootstrap-core`](skills/bootstrap-core/SKILL.md) / activation |
| [`bootstrap-project`](prompts/bootstrap-project.prompt.md) | Preview and apply this plugin's minimal repository guidance and project VS Code settings. Use for new projects or project-scaffold repair. | [`bootstrap-project`](skills/bootstrap-project/SKILL.md) / setup |
| [`compile-brain`](prompts/compile-brain.prompt.md) | Creates a reviewable optimized instruction, skill, prompt, or agent from an explicitly selected Markdown file or user-identified text. Use when improving an existing brain... | [`compile-brain`](skills/compile-brain/SKILL.md) / authoring |
| [`convert`](prompts/convert.prompt.md) | Convert a document between Markdown, HTML, Word, email, and plain text using the matching bundled converter. Use when the user asks to transform a supported document format. | [`convert`](skills/convert/SKILL.md) / conversion |
| [`critical-thinking`](prompts/critical-thinking.prompt.md) | Run the full critical-thinking pass on a decision, claim, or recommendation — generate alternatives, check evidence, detect bias, test falsifiability | [`critical-thinking`](skills/critical-thinking/SKILL.md) / act-pass |
| [`install-visual-companions`](prompts/install-visual-companions.prompt.md) | Offer to install marketplace plugins that extend visual authoring: chart rendering, screenshot verification, whiteboard iteration, and PR annotation. Consent-gated, one plugin... | [`install-visual-companions`](skills/install-visual-companions/SKILL.md) / consent-gated setup |
| [`meditate`](prompts/meditate.prompt.md) | Review session outcomes, recommend reusable capabilities, and reconcile project continuity. | [`meditation`](skills/meditation/SKILL.md) / explicit meditation |
| [`problem-framing-audit`](prompts/problem-framing-audit.prompt.md) | Audit the framing of a problem before solving — restate, generalize, specialize, invert, ask why, pre-mortem, check stakeholders, surface alternative framings | [`problem-framing-audit`](skills/problem-framing-audit/SKILL.md) / framing |
| [`render-chart`](prompts/render-chart.prompt.md) | Orchestrates expert visual storytelling over Flint: frame the claim, inspect data, explore familiar and expressive treatments over one semantic truth layer, select or author a... | [`render-chart`](skills/render-chart/SKILL.md) / chart orchestration |
| [`rich-email`](prompts/rich-email.prompt.md) | Create and review a polished Markdown-based email, then open an unsent New Outlook draft on Windows. Use when the user asks for a rich stakeholder update, executive email, or... | [`rich-email`](skills/rich-email/SKILL.md) / draft only |
| [`setup-dependencies`](prompts/setup-dependencies.prompt.md) | Check which optional dependencies this plugin can use, report what each missing one costs, and install them with consent. Covers Pandoc, render helpers, and the pinned MCP... | [`setup-dependencies`](skills/setup-dependencies/SKILL.md) / dependency check |
| [`setup-enterprise`](prompts/setup-enterprise.prompt.md) | Emit or install the Copilot CLI settings block for the public Microsoft ecosystem plugins (Azure, Fabric, Power BI, M365 Agents Toolkit). Invokes the `setup-enterprise-stack`... | [`setup-enterprise-stack`](skills/setup-enterprise-stack/SKILL.md) / emit/install/audit |
| [`status`](prompts/status.prompt.md) | Report the current project's repository state, recent work, brain QA health (if applicable), and pending handoff items. Use for session orientation or an on-demand project... | [`project-status`](skills/project-status/SKILL.md) / read-only checkpoint |

<!-- END GENERATED PROMPT TABLE -->

## Resident instructions

After activation, a matching `applyTo` loads the short resident guardrail, not
the whole execution procedure. Its semantic trigger determines when to load
the skill owner and selected reference. Relative owner links resolve from the
canonical installed plugin; the bootstrap preview exposes
`routing.canonicalRoot` and `routing.skillRoutes` for discovery fallback.

<!-- BEGIN GENERATED INSTRUCTION TABLE -->

| Resident instruction | Semantic trigger | Execution owner / mode | applyTo |
| --- | --- | --- | --- |
| [`act-pass`](instructions/act-pass.instructions.md) | For material decisions; trivial mechanical work exits cheaply. | [`critical-thinking`](skills/critical-thinking/SKILL.md) / act-pass | `**/*` |
| [`alex-finch-personality`](instructions/alex-finch-personality.instructions.md) | Maintain the selected Alex Finch product voice across tasks without theatrical self-narration. | [`communication-craft`](skills/communication-craft/SKILL.md) / identity | `**` |
| [`audience-copy-review`](instructions/audience-copy-review.instructions.md) | For prose an external reader will use to form an impression or decision; stay silent for internal notes and plans. | [`humanizer`](skills/humanizer/SKILL.md) / Copywriter | `**` |
| [`critical-thinking`](instructions/critical-thinking.instructions.md) | When drawing a conclusion or choosing a material technical approach. | [`critical-thinking`](skills/critical-thinking/SKILL.md) / reasoning | `**/*` |
| [`emotional-intelligence`](instructions/emotional-intelligence.instructions.md) | When the current message provides a meaningful emotional or flow signal; do not infer distress from terseness alone. | [`communication-craft`](skills/communication-craft/SKILL.md) / emotional-attunement | `**` |
| [`epistemic-calibration`](instructions/epistemic-calibration.instructions.md) | When making factual, quantitative, verification, or completion claims. | [`anti-hallucination`](skills/anti-hallucination/SKILL.md) / calibration | `**` |
| [`lint-discipline`](instructions/lint-discipline.instructions.md) | Before declaring an edited file complete, and whenever its diagnostics report errors. | [`code-review`](skills/code-review/SKILL.md) / completion | `**` |
| [`no-deferred-debt`](instructions/no-deferred-debt.instructions.md) | When a task exposes a directly related stale reference, broken route, or implementation debt. | [`code-review`](skills/code-review/SKILL.md) / completion | `**` |
| [`pii-memory-filter`](instructions/pii-memory-filter.instructions.md) | Before every persistent write, including native memory and repository continuity. | [`ethical-reasoning`](skills/ethical-reasoning/SKILL.md) / persistence | `**` |
| [`problem-framing-audit`](instructions/problem-framing-audit.instructions.md) | For non-trivial, ambiguous, repeated-failure, or symptom-framed work; skip trivial mechanical tasks. | [`critical-thinking`](skills/critical-thinking/SKILL.md) / framing | `**/*` |
| [`reliance-nudges`](instructions/reliance-nudges.instructions.md) | Only when a specific over-reliance risk merits an actionable intervention. | [`communication-craft`](skills/communication-craft/SKILL.md) / reliance | `**` |
| [`session-health-monitoring`](instructions/session-health-monitoring.instructions.md) | When continuity, worktree state, or an active goal changes the response; do not interrupt unrelated work. | [`proactive-awareness`](skills/proactive-awareness/SKILL.md) / recovery | `**` |
| [`system-prompt-skepticism`](instructions/system-prompt-skepticism.instructions.md) | When evidence suggests a directive depends on a precondition that does not hold. | [`critical-thinking`](skills/critical-thinking/SKILL.md) / instruction-preconditions | `**/*` |
| [`terminal-command-safety`](instructions/terminal-command-safety.instructions.md) | Before constructing or running shell commands, especially multiline/quoted input or long-lived work. | [`terminal-command-safety`](skills/terminal-command-safety/SKILL.md) / shell-safety | `**` |
| [`worldview`](instructions/worldview.instructions.md) | For every task, with deeper reasoning when a real human-impact or ethical trade-off arises. | [`ethical-reasoning`](skills/ethical-reasoning/SKILL.md) / safety | `**` |

<!-- END GENERATED INSTRUCTION TABLE -->

## Native-first skill optimization

Instructions carry the trigger and essential guardrails. Prompts are thin
entrypoints. Skills own the procedure, output contract, and verification;
selectively loaded references hold the detailed checklists and examples.
Native planning, session history, review execution, and browser tools provide
mechanics where available without replacing approval or evidence requirements.

For material quantitative claims, the
[deterministic-check contract](skills/anti-hallucination/SKILL.md#deterministic-checks)
uses tested scripts, formulas, or queries. The semantic layer still chooses the
question, units, and interpretation. Task-local checks are not cross-session
skill telemetry or behavioral scoring.

| Workflow family | Canonical execution owner | Boundary kept separate |
| --- | --- | --- |
| ACT, framing, adversarial reasoning, curation risk | [critical-thinking](skills/critical-thinking/SKILL.md), with explicit modes | The [tenet canon](skills/act-tenets/SKILL.md) and compatibility skill names remain |
| Ordinary, deep, and specialist review | [code-review](skills/code-review/SKILL.md), with selected references | [Debugging](skills/systematic-debugging/SKILL.md) investigates and fixes a reproduced failure; review is read-only |
| Central claim and audience | [big-idea](skills/big-idea/SKILL.md) | [chart-big-idea](skills/chart-big-idea/SKILL.md) still owns the Chart Brief, population, units, and treatment |
| Format selection | [convert](skills/convert/SKILL.md) | Format-specific converters keep their scripts; producing an email never authorizes sending |
| Project recovery | [proactive-awareness](skills/proactive-awareness/SKILL.md) | [project-status](skills/project-status/SKILL.md) is read-only; [meditation](skills/meditation/SKILL.md) has its own bounded write authority |
| Brain-artifact authoring | [compile-brain](skills/compile-brain/SKILL.md) | [assess-brain](skills/assess-brain/SKILL.md) remains read-only; semantic preservation and user-selected source are required |

Compatibility aliases and the legacy preview/receipt-based bootstrap remain.
Native skill discovery is not evidence that native rules activated, and a
workflow loaded by name is not proof that its checks ran. The
[native-first plan and receipts](docs/plans/2026-11-04-native-first-copilot.md)
record the dated comparison and rollout decisions. Smaller source files do
not, by themselves, establish token, latency, or quality improvements.

## Flint charts and interaction demos

The published runtime integration pins `flint-chart-mcp@1.0.1` and
`flint-chart@1.0.1` independently. Flint supplies the version-matched chart,
theme, interaction, and board grammar; ONE supplies framing, consent, and
verification. Author the semantic input, validate it, and then use `show` for a
live chart or board. Static rendering and backend compilation remain separate.

The source-only [flint-interactions](skills/flint-interactions/SKILL.md) workflow
distinguishes reader gestures (`interaction_spec`), initial or agent-authored
state (`updates`), linked boards (`link_spec`), and requested application code.
It checks incompatible gestures and dropped-interaction warnings, then requires
observed behavior and reset evidence. Validation or a screenshot alone does not
prove that an interaction works.

| Offline page | What it demonstrates |
| --- | --- |
| [Editorial gallery](docs/flint-showcase.html) | Comparison, time series, composition, relationships, distributions, heatmaps, initial state, and a linked board |
| [Experimental interaction lab](docs/flint-experimental.html) | Connected trajectories, ridgelines, polar brushing, draggable ordering, cohort/range filters, story beats, and three coordinated views |

Both pages embed the pinned App UI, synthetic data, theme choices, inspectable
starting specs, and static exports from Vega-Lite, ECharts, and Chart.js.
Opening the HTML needs no server, installation, or network connection.
Rebuilding requires the already provisioned pinned runtime; the
[builder](scripts/build-flint-showcase.mjs) never installs or fetches packages.
The live viewer is Vega-Lite: the static backend comparison does not imply
theme or interaction parity across backends.

```powershell
node scripts\build-flint-showcase.mjs
node scripts\build-flint-showcase.mjs --experimental
node scripts\build-flint-showcase.mjs --check
node scripts\build-flint-showcase.mjs --experimental --check
```

Internal-browser checks on 2026-11-05 covered the sample/theme/story combinations,
targeted pointer and keyboard interactions, linked selections, and responsive
board layout. They do not certify every preset, browser, or accessibility path.
Saving a downloaded spec through the integrated browser remains unverified:
the host did not expose a download event during that check.

## Check a draft or rewrite it

Ask "Audit this draft for AI tells; don't edit it" for a read-only report with
locations, reasons, and optional recasts. Ask "Humanize this draft" for a
rewrite. Ask "Review this for [audience]" for a before/after proposal that
waits for your approval.

Supply your house terms or a preferred voice. The [humanizer](skills/humanizer/SKILL.md)
keeps deliberate vocabulary and treats AI-writing patterns as editing cues,
not proof of authorship.

## Check a plugin before installing it

Every other skill here assumes it belongs on your machine. This one asks whether
it does.

Plugin catalogs score the **source** — who published it, how recently the
repository was updated, whether the license is clear. None of that says the
plugin is correct, and nothing in a typical publishing pipeline reads the
content: scanning indexes what exists, packaging validates structure, and no step
compiles a code sample or follows a link.

So a plugin can sit in the highest trust band and still tell you to install a
package that does not exist. That is not hypothetical. One top-band,
first-party plugin claimed a NuGet package that returns zero registry results,
an SDK API that was never published, and a cited file absent from the entire
source repository. One registry query was enough to catch the package.

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

That gives a package access to your agent environment on the strength of a
description. This reads it first:

```text
Evaluate copilot-sdk@alex-mall before I install it.
```

Any marketplace works, not only this one. Name whatever plugin you were about to
install and the skill goes and looks at it.

Use it before an install that is hard to reverse or far-reaching: a runtime
every project loads or a plugin that will hold credentials. Skip it for a
per-project install you can remove in a second. Judge by what it costs to be
wrong.

## Where Alex ACT ONE Works

Skills sit at the package root, so each app can load them directly. Scout can
use the plugin installed for Copilot CLI under `~/.copilot`; a Scout-local ONE
copy is duplicate state and can drift independently. Verify the loaded root and
version before activation or Scout MCP registration. The other three surfaces
are not automatic in the same way, and this table says which are.

Native-first installed-package checks and a live CLI project-checkpoint probe
passed for `v0.7.0`; the Flint 1.0.1 integration was subsequently published in
`v0.8.0`. Neither source-level tests nor the offline demos establish fresh
activation parity across all hosts. The table describes supported delivery;
the dated observations below remain historical evidence.

| Where you use Copilot | Skills | Instructions | Slash commands | MCP servers |
| --- | --- | --- | --- | --- |
| Copilot CLI | All | All, after activation | All | All, from the manifest |
| VS Code with GitHub Copilot Chat | All | All, after activation | All | All, from the manifest |
| Microsoft Scout | All, after enabling **Load Copilot CLI skills** | All, after activation | **None** | All, after registration |
| GitHub Copilot app | All, discovered and invoked | All, active after activation | All, exposed | Registered; Flint and Playwright verified in the `v0.2.0` baseline; Replicate requires an API token |

The GitHub Copilot app test on 2026-09-13 found all 15 instructions active and
at hash parity with the installed `v0.2.0` sources. The app discovered the skill
catalog and prompt aliases; `bootstrap-core`, `platform-awareness`,
`proactive-awareness`, and `humanizer` were invoked. Playwright listed the
active browser tabs, and Flint validated a Vega-Lite chart with no warnings or
errors. Replicate reached its MCP server but returned `401 Unauthenticated`
because this app did not have a Replicate API token. Individual skills and
slash commands were not exhaustively invoked. This is historical host evidence,
not a `v0.3.5` activation claim.

The Scout row was re-checked against `v0.2.0` on 2026-09-13 inside a live session:

> all 60 skills surfaced, all 15 instructions were active in context, none of the 15 slash
commands were reachable, and both registered MCP servers answered a protocol
handshake — 6 tools from Flint, 24 from Playwright.

Scout-specific notes, last verified 2026-09-13:

- **Slash commands do not reach Scout.** It has no command surface for plugin
  prompts. Every command has an equivalent skill you can ask for by name, so
  nothing is lost in capability — but the commands themselves are absent rather
  than merely undocumented.
- **Scout should use the Copilot CLI installation.** A test found a stale
  Scout-local `v0.1.0` alongside the then-current `v0.2.0` Mall installation under
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

In the current source candidate, modified or unowned destination files block
the entire activation before any writes. Back up and review the named conflicts;
only a separately approved `--overwrite-conflicts` preview/apply may replace or
adopt them. See [the conflict procedure](skills/bootstrap-core/SKILL.md#instruction-conflicts).
Reinstall automation does not bypass that guard.

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

### Using Claude Code instead?

The skills travel. They follow the Agent Skills open standard, which Claude
Code also implements: each skill is a folder holding a `SKILL.md` whose
frontmatter carries a `name` and a `description`, and that is the shape Claude
Code loads. (Claude Code is Anthropic's terminal agent, a different tool from
the Muse assistant; the separate Muse edition of this pack lives at
[Alex_ACT_ONE_Muse](https://github.com/fabioc-aloha/Alex_ACT_ONE_Muse).)

Clone this repo, then copy the skill folders into Claude Code's personal
skills directory, plus the shared scripts where the skill scripts look for
them:

```bash
git clone https://github.com/fabioc-aloha/Alex_ACT_ONE.git
mkdir -p ~/.claude/skills ~/.claude/scripts
cp -r Alex_ACT_ONE/skills/* ~/.claude/skills/
cp -r Alex_ACT_ONE/scripts/* ~/.claude/scripts/
```

For a single project, copy into that project's `.claude/skills/` instead,
with `scripts/` beside it at `.claude/scripts/`. Claude Code loads a skill
automatically when a request matches its description, or you invoke one
directly as `/skill-name`.

What does not transfer: the plugin install, the 15 always-on instructions,
and the 15 slash commands are Copilot-format. Claude Code's always-on
equivalent is `CLAUDE.md`; the texts in `instructions/` can be adapted into
one by hand. The three MCP servers are standard stdio servers and can be
registered with `claude mcp add`, using the commands in `plugin.json` pointed
at your clone. Until they are, the chart, browser-check, and image skills
still guide the work but have no rendering back end to call.

One honesty note: this pack is tested on its Copilot hosts, not on Claude
Code. The format is shared and the skills are plain markdown and scripts, so
they load; treat your first runs as an evaluation anyway. The evaluation
guide in `docs/launch/evaluation-guide.md` works here too.

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

After upgrading to the reviewed Flint 1.0.1 runtime, confirm its expected tools:

- `compile_chart`
- `show`
- `list_chart_types`
- `list_themes`
- `render_chart`
- `validate_chart`
- `validate_board`
- `list_interaction_presets`
- `get_flint_skill`

`replicate` is skipped unless `REPLICATE_API_TOKEN` is set in the environment.
That is deliberate: a clear omission now beats an opaque authentication failure
at call time.

Without this step every skill still loads, but the tools those skills call are
missing, which looks like a broken package rather than an unregistered one.

### Optional: extra tools for a few skills

Most of this plugin needs nothing but Node. The large majority of its skills run
with no external tools at all, and nothing below is needed to start.

Flint is reviewed at `flint-chart-mcp@1.0.1` with independently exact-pinned
`flint-chart@1.0.1`. Upgrade the plugin before the shared runtime: older launchers
correctly refuse a mismatched version. From the updated installed package,
preview `skills/setup-dependencies/scripts/provision-runtime.mjs --server flint`,
then apply the same selection after consent. This changes neither Playwright nor
Replicate. Reload the host to discover the new validated `show` interface.

If Microsoft proxy metadata points tarballs at a backend feed that npm policy
blocks directly, do not enable remote fetching or edit npm configuration. With
explicit approval, npm 12+ can route an exact HTTPS backend prefix through the
configured proxy using the provisioner's `--registry-tarball-prefix` option.
Its preview names the prefix, registry, runtime, and selected packages.

In the current source candidate, dependency checks distinguish installed
directories, exact version matches, and bounded launch probes. Host connection
remains unobserved until checked in that host. Checker, provisioner, and launcher
share the runtime-root selection; see
[readiness and alternate runtimes](skills/setup-dependencies/SKILL.md#check-first).
Known Windows npm tool shims are resolved to their package's Node entrypoint
without shell argument concatenation.

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
checking an artifact you just wrote to disk. VS Code documents native browser
verification, and current Copilot CLI releases include a browser-use plugin.
Local-file, console, remote, and authentication parity still depend on the
host, harness, and policy; retain the fallback for unavailable or unverified cases.
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

### Scripts for reinstalling and optional setup

Run these scripts from the repository checkout. The optional installer and
expanded marketplace checks ship in `v0.5.0`.

#### Reinstall and verify ONE

Close hosts that may lock the installed plugin before running
[`reinstall-and-check.ps1`](reinstall-and-check.ps1):

```powershell
.\reinstall-and-check.ps1
```

This is not a preview. It registers missing public marketplaces (`alex-mall`,
`awesome-copilot`, `copilot-plugins`, `azure-skills`, and `fabric-collection`),
rejects conflicting sources, and reinstalls ONE from the Mall's release tag,
not the working checkout. It verifies the installed version and applies the
canonical instructions to the default Copilot profile, checking their
bootstrap receipt afterward. It does not install optional plugins or prove
that a host has observed activation after restart.

#### Install or check optional dependencies

[`install-optional-dependencies.ps1`](install-optional-dependencies.ps1)
previews by default. Review its package list, configured registry, and
installation paths before applying:

```powershell
.\install-optional-dependencies.ps1
.\install-optional-dependencies.ps1 -Apply
```

The installer reads the shared version pins. Flint, Playwright, and JSZip go
into ONE's private runtime; Mermaid CLI and svgexport use npm's global prefix.
It leaves the registry and npm policy unchanged and does not install
companion plugins or system packages.

Replicate is optional. Add `-IncludeReplicate` to preview or apply to include
its pinned MCP package. Image generation separately requires a paid account
and `REPLICATE_API_TOKEN`; the script does not read or store credentials or
make paid API calls.

```powershell
.\install-optional-dependencies.ps1 -IncludeReplicate
.\install-optional-dependencies.ps1 -Apply -IncludeReplicate
```

Check existing package versions, MCP launchers, and actual Mermaid/SVG-to-PNG
rendering without reinstalling:

```powershell
.\install-optional-dependencies.ps1 -VerifyOnly
# Include Replicate in verification only if you selected it for installation.
.\install-optional-dependencies.ps1 -VerifyOnly -IncludeReplicate
```

With npm 12, the Microsoft proxy can advertise tarball URLs on a different
Microsoft host and trigger `EALLOWREMOTE`. For the verified feed prefix below,
route those URLs back through your configured proxy. Preview first, then
repeat with `-Apply`; add `-IncludeReplicate` if wanted.

```powershell
$feed = 'https://ms-feed-25.pkgs.visualstudio.com/1es-public/_packaging/npm-public/npm/registry/'
.\install-optional-dependencies.ps1 -RegistryTarballPrefix $feed
.\install-optional-dependencies.ps1 -Apply -RegistryTarballPrefix $feed
```

This routing does not switch registries or relax `allow-remote`. A failed
install may leave partial package state. If npm blocks Puppeteer's browser
setup scripts, package installation can succeed while rendering still fails.
The readiness check reports that failure rather than claiming success.
Browser setup is a separate decision: its downloads do not use the npm feed,
and svgexport's pinned dependency requests an old, deprecated browser build.
Do not enable lifecycle scripts globally to suppress the warning.

See the [release checklist](RELEASE-CHECKLIST.md) for the verification steps
and installation boundaries.

## Tests

### Generated documentation

The README inventory and skill, prompt, and instruction tables are generated
from current source metadata. The
[documentation generator](scripts/update-docs.mjs) also checks manifest/disk
parity and resolves every command/instruction owner before writing. It derives
manifest instruction roles from canonical descriptions and checks those for drift.
Descriptions are discovery summaries, not a second execution contract.

```powershell
node scripts\update-docs.mjs --write
node scripts\update-docs.mjs --check
node --test tests\documentation.test.mjs tests\smoke.test.mjs
```

`--check` is read-only and fails on drift. When adding a skill, choose its
reader-facing group in the generator rather than duplicating a workflow.
Historical inventories and host observations remain dated snapshots.

### Full suite

```text
node --test
```

The runner uses Node's built-in tests: no npm test framework or root
`package.json` is required. Release verification also requires PowerShell, and
the integration lane requires its reviewed runtime/converter tools. See
[verification environments and gates](docs/testing.md) for the Windows/Linux
Node 24/26 targets, strict no-skip policy, and safe executable-example checks.

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
