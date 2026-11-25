# Alex ACT ONE

![Alex ACT ONE](assets/banner.svg)

**Your coding agent is fast, confident, and too often wrong. Give it a discipline.**

Alex ACT ONE is a pack of skills for GitHub Copilot that changes how the agent works: frame the problem before solving it, look for evidence against its first answer, check a plan against its risks, and verify what it produced before calling it done.

**Try the discipline:** "Our dashboard takes 8 seconds to load. Rust rewrite, or Redis caching?" The comparison below is illustrative: these are hypotheses to test, not recorded outcomes. Try it yourself with [the evaluation guide](docs/launch/evaluation-guide.md).

| Step | Possible unexamined response | Response to look for |
| --- | --- | --- |
| First move | Jumps straight to an answer | Stops and checks the question first |
| The answer | Picks Rust or Redis, and sounds sure | Asks where the 8 seconds are actually spent |
| Evidence | Does not ask for any | Says what to measure, and what result would change the answer |
| Confidence | Sounds certain either way | Marks what is known, reported, estimated, or guessed |
| Verification | A plan, handed over as final | A specific check before calling the plan proven |

## Start here

### Quick install

Install **Alex ACT ONE** from Alex Mall, then follow
[your first session](docs/getting-started.md) to preview activation and try a
reasoning skill. Installing the plugin does not activate the always-on
instructions. For terminal commands, see [Manual installation](#appendix-manual-installation).

**Skip optional setup until you need it.** Core skills, including the first-session
exercise, need no extra tools or API tokens. When a missing dependency blocks the
requested output, the skill checks for a supported fallback. If none fits, Setup
Dependencies checks what's missing and asks before installing anything. See
[optional tools](docs/install.md#optional-extra-tools-for-a-few-skills).

**Published release: `v0.9.7`.** Release candidate: `v0.10.0` (not published).
This README also describes candidate features where noted. See
[installation sources](docs/install.md#installation-sources)
and [host support](docs/install.md#where-alex-act-one-works) before switching apps.

**macOS support is pending.** The PowerShell setup helper is for the Windows
release path. Installation, activation, and optional tools have not been
verified on macOS. See the [macOS roadmap item](ROADMAP.md#support-unified-installation-and-dependencies-on-macos).

Try the [offline Flint chart gallery](skills/flint-chart/resources/flint-showcase.html) for semantic data, maps, themes, interactions, linked views, and static exports, or the [experimental interaction lab](skills/flint-chart/resources/flint-experimental.html) for polar brushing, direct reordering, distribution shapes, and reader-driven stories. Both ship with the Flint chart skill and open in a browser without a server or connection.

Browse the [skill catalog](#the-skills), [install and host reference](docs/install.md),
or [documentation index](docs/README.md).

### Source package inventory

Generated from the manifest, asset directories, and MCP registrations, not from
the published release's historical inventory.

<!-- BEGIN GENERATED INVENTORY -->

| Source surface | Count | Delivery |
| --- | --- | --- |
| Skills | 64 | Loaded on demand from the plugin |
| Prompts / command aliases | 15 | Thin user-invoked entrypoints; availability depends on host |
| Resident instructions | 15 | Preview-first profile activation; execution detail stays in skills |
| MCP servers | 2 | Registered from plugin metadata where supported |

<!-- END GENERATED INVENTORY -->

Using Muse instead of Copilot? The Muse edition lives at [Alex_ACT_ONE_Muse](https://github.com/fabioc-aloha/Alex_ACT_ONE_Muse)

Using Claude Code? The skills install there too, by hand: see [Using Claude Code instead?](docs/install.md#using-claude-code-instead).

## What You Can Do With Alex ACT ONE

**Think before building.** Frame the real problem, weigh competing explanations,
name what would prove you wrong, and check a decision against its risks before
committing to it.

**Write code that survives review.** Test-first workflows, root-cause debugging,
security hardening, adversarial code review from three opposing perspectives, and
safe Git practice with recovery paths. When you authorize delegation,
[Plan's worker guidance](skills/plan/references/scoped-delegation.md) helps
define what each worker may change and how to verify the result.

**Draft fiction or edit existing prose.** Use [Creative Writing](skills/creative-writing/SKILL.md)
to develop a story, draft a scene, or revise without changing protected passages.
Use [Humanizer](skills/humanizer/SKILL.md) for audience review or a read-only
audit of an existing draft, including short posts and replies.

**Turn drafts into deliverables.** Convert between Markdown, Word, HTML, plain
text, and formatted email. Build charts, diagrams, print-quality figures, and
banners, then check that what rendered says what you meant. In a linked bundle,
such as a report and its chart, [every required file must pass review](skills/proactive-awareness/references/project-artifact-storage.md#draft-to-delivery-handoff)
before the bundle is ready. Review does not authorize publication.

**Improve the agent itself.** Audit which instructions earn their context cost,
write project-specific skills from work you keep repeating, and consolidate what
a session learned into something reusable.

See the [source inventory](#source-package-inventory) for the current package
contents. Not every surface reaches every app — see
[Where Alex ACT ONE Works](docs/install.md#where-alex-act-one-works).

Large package by design: one install brings all of it, so expect noticeably
more files on disk and a longer first sync than a single-purpose plugin.

## The Skills

Grouped by what you are trying to do. The **Needs** column lists anything beyond
Node — most skills need nothing, and a skill only appears there if it genuinely
cannot run without that dependency. See [Optional extras](docs/install.md#optional-extra-tools-for-a-few-skills)
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
| [`git-workflow`](skills/git-workflow/SKILL.md) | Apply consistent git practices for branch hygiene, safe commits, non-interactive multi-account GitHub authentication, and recovery from common mishaps (lost commits, bad merges,... | Node only |
| [`plan`](skills/plan/SKILL.md) | Use native planning for uncertain or consequential implementation work. Preserve read-only discussion, approval before execution, and task-specific verification without... | Node only |
| [`spike`](skills/spike/SKILL.md) | Use when the user wants to feel out an idea before committing to a real build — "spike this out", "try it", "is this even possible?", "compare A vs B". Throwaway experiments... | Node only |

### Prose and documentation

Writing people finish reading.

| Skill | Discovery summary | Needs |
| --- | --- | --- |
| [`big-idea`](skills/big-idea/SKILL.md) | Distill the central claim before authoring any summary-shaped output: hero copy, commit-message subject, PR title, ADR title, slide title, executive summary, skill description,... | Node only |
| [`creative-writing`](skills/creative-writing/SKILL.md) | Draft or develop original fiction, or revise a story, scene, or dialogue for creative effect. Preserve the requested voice, point of view, tense, story continuity, and protected... | Node only |
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
| [`figure-generator`](skills/figure-generator/SKILL.md) | Ship deterministic hand-authored SVG generators for print-quality figures backed by real published datasets. Ships the .mjs generator pattern reading from data/&lt;slug&gt;.json, the... | Node only |
| [`svg-banner`](skills/svg-banner/SKILL.md) | Generate 1200x320 SVG banners for READMEs, plans, notes, and release artifacts, using a pluggable brand config that any project can override. Use when a document needs a hero... | Node only |
| [`markdown-mermaid`](skills/markdown-mermaid/SKILL.md) | Author Mermaid diagrams that render correctly in GitHub, VS Code, and Mermaid 10+ consumers. Applies a config-driven init directive + linkStyle + semantic classDef vocabulary... | Node only |
| [`annotate-screenshot`](skills/annotate-screenshot/SKILL.md) | Add callouts to a raster you did not author, using Pillow, at a resolution that stays legible. Covers upscale-then-annotate ordering, supersampled shape rendering, measured... | Pillow |
| [`render-verify`](skills/render-verify/SKILL.md) | Verify a rendered visual artifact actually says what it was supposed to say — open it, read console errors, walk a failure catalog, and check its claim. Works on charts,... | Node only |
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
| [`proactive-awareness`](skills/proactive-awareness/SKILL.md) | Applies read-only context recovery and project artifact delivery checks. Use when continuity, worktree state, active goals, or repository deliverable verification may change the... | Node only |
| [`project-status`](skills/project-status/SKILL.md) | Report the current project's repository state, recent work, brain QA health (if applicable), and pending handoff items. Use for session orientation or an on-demand project... | Node only |
| [`evaluate-before-adopting`](skills/evaluate-before-adopting/SKILL.md) | Decide whether a plugin or skill from a catalog is worth installing. Covers what a trust score does and does not measure, reading the prose and any bundled scripts for unsafe... | Node only |

### Setup and platform

Getting the plugin and its dependencies working.

| Skill | Discovery summary | Needs |
| --- | --- | --- |
| [`bootstrap-core`](skills/bootstrap-core/SKILL.md) | Activates, verifies, repairs, or removes this plugin's user-scope runtime instructions from canonical installed sources. Use after installing or updating Alex ACT ONE, when ACT... | Node only |
| [`bootstrap-project`](skills/bootstrap-project/SKILL.md) | Previews and applies this plugin's repository scaffold, portable workspace QoL settings, and project Copilot settings while preserving project-owned files. Use for new... | Node only |
| [`setup-dependencies`](skills/setup-dependencies/SKILL.md) | Check capability-specific dependencies, explain missing tools, and install with consent. Covers Pandoc, Pillow, Mermaid CLI, svgexport, jszip, and pinned chart/browser MCP... | Node only |
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

## Flint charts and interaction demos

Current source and its demos pin `flint-chart-mcp@1.1.1` and `flint-chart@1.1.1`.
The published `0.9.7` package retains its exact `1.0.1` pair. Keep those
runtimes separate. Flint supplies the version-matched chart, theme, interaction,
board, and application guidance; ONE supplies framing, consent, and verification.
Use `show` for a validated live chart or board on a client with App UI. Static
exports, backend JSON, and integration into application code are separate paths.
See the [Flint delivery and integration guidance](skills/flint-chart/SKILL.md).

The [flint-interactions](skills/flint-interactions/SKILL.md) workflow
distinguishes reader gestures (`interaction_spec`), initial or agent-authored
state (`updates`), linked boards (`link_spec`), and requested application code.
It checks incompatible gestures and dropped-interaction warnings, then requires
observed behavior and reset evidence. Validation or a screenshot alone does not
prove that an interaction works.

| Offline page | What it demonstrates |
| --- | --- |
| [Editorial gallery](skills/flint-chart/resources/flint-showcase.html) | Comparison, time series, composition, relationships, distributions, heatmaps, maps, initial state, and a linked board |
| [Experimental interaction lab](skills/flint-chart/resources/flint-experimental.html) | Connected trajectories, polar brushing, draggable ordering, story beats, linked views, and separate highlight, zoom, and population filters |

In **Separate highlight, zoom, and filter**, highlighting a team preserves the
data, zooming changes the period axis, and filtering recomputes total cost.
The [application-state guide](skills/flint-interactions/references/application-state.md)
explains how to apply the same pattern in an app. The offline lab reloads a
prevalidated board when the population changes; it does not run live queries.

Both pages open offline and include synthetic data, inspectable starting specs,
and static exports from Vega-Lite, ECharts, and Chart.js. The live viewer uses
Vega-Lite. Native App UI support depends on the host and remains unverified for
the source Flint 1.1.1 runtime.

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

Ask the skill to read the plugin before you install it:

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

See the [host support table](docs/install.md#where-alex-act-one-works) for
Copilot CLI, VS Code, the GitHub Copilot app, and Scout.

## Install

Start with [your first session](docs/getting-started.md).

### 1. Install the plugin

See [Mall installation](docs/install.md#1-install-the-plugin).

### 2. Turn on the always-on instructions, once in each app

See [per-app activation and readiness](docs/install.md#2-turn-on-the-always-on-instructions-once-in-each-app).

### What you get after each step

See [installation versus activation](docs/install.md#what-you-get-after-each-step).

### Using Claude Code instead?

See [manual Claude Code setup and its verification limits](docs/install.md#using-claude-code-instead).

### On Microsoft Scout, register the MCP servers

See [Scout registration, shared-root checks, and restart requirements](docs/install.md#on-microsoft-scout-register-the-mcp-servers).

### Optional: extra tools for a few skills

Skip this step unless a task needs an extra tool. See
[optional tools and fallbacks](docs/install.md#optional-extra-tools-for-a-few-skills).

## Maintainer documentation

See the [roadmap](ROADMAP.md), [testing guide](docs/testing.md), and
[release checklist](RELEASE-CHECKLIST.md).

## Appendix: Manual installation

### Install from Alex Mall in a terminal

Run the first command only if Alex Mall is not already registered:

```powershell
copilot plugin marketplace add fabioc-aloha/Alex_Skill_Mall
copilot plugin install alex-act-one@alex-mall
```

Then [preview activation in the app you use](docs/getting-started.md#2-activate).
No optional dependencies are needed to try a core skill. Direct repository
installation is deprecated and can select unreleased source.

### Scripts for reinstalling and optional setup

On Windows, use the [PowerShell helper](install-and-check.ps1) when you
deliberately want the combined installation, activation, and dependency setup.
It is not the normal first-session path.

#### Reinstall and verify ONE

From the checkout, start with the status report. It can register or refresh
the marketplace, but it does not install the plugin or tools. Close hosts
that may lock the files before applying an update.

```powershell
.\install-and-check.ps1
# Only after reviewing the report and approving the changes:
.\install-and-check.ps1 -Apply
```

`-Apply` installs or updates the Mall release, activates its instructions, and
sets up that release's dependencies. It does not use the checkout's pins for
an installed release. Setup can stop partway through; a successful plugin update
does not mean every dependency is ready. Restart the host after an update.

#### Install or check optional dependencies

Prefer the [Setup Dependencies skill](skills/setup-dependencies/SKILL.md#when-another-skill-is-blocked)
when only one task is blocked. To preview full dependency setup without changing
the plugin or activating instructions, run from the installed package root:

```powershell
.\install-and-check.ps1 -DependenciesOnly
```

Add `-VerifyOnly` to check existing tools, or `-Apply` only after approving the
plan. This mode is available in current source, not published `0.9.7`. For older
packages or a single missing tool, follow the installed skill's guidance.
For registry or MCP setup issues, see the
[Setup Dependencies reference](skills/setup-dependencies/SKILL.md#mcp-servers).
For a renderer that needs a compatible existing browser, rerun verification
with `-BrowserExecutablePath` and the browser's absolute path.

### Use skills in Claude Code

For skill-only use, copy the skills and their shared scripts into your Claude
Code profile. Use `.claude/` in a project instead of `~/.claude/` to scope the
copy to that project.

```bash
git clone https://github.com/fabioc-aloha/Alex_ACT_ONE.git
mkdir -p ~/.claude/skills ~/.claude/scripts
cp -r Alex_ACT_ONE/skills/* ~/.claude/skills/
cp -r Alex_ACT_ONE/scripts/* ~/.claude/scripts/
```

This does not install the Copilot plugin, activate instructions, or register
MCP servers. Some setup workflows require the full plugin. Claude Code
execution is not verified by the Copilot tests.

## License

MIT. See [LICENSE](LICENSE).
