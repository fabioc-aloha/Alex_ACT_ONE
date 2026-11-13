# Plugin Optimization Plan

Retire coding-only workflows while preserving and strengthening documentation,
creative writing, graphics, and chart authoring.

| Field | Value |
| --- | --- |
| Review date | 2026-11-13 |
| Status | Proposed; implementation requires approval |
| Audience | Alex ACT ONE maintainer |
| Scope | Plugin source, directly dependent documentation, and verification |
| Published baseline | `0.9.7`; not a claim about installed state |

## Authority and relationship to the roadmap

The current request authorizes this plan only. No component removal,
installation, profile activation, commit, push, or publication is authorized
by creating it.

The requested direction includes a dedicated creative-writing skill and
improvements to existing cross-domain workflows. The exact retirement and
implementation scope remains a proposal.

[ROADMAP.md](ROADMAP.md) remains the authoritative product backlog. This file
is a design and acceptance reference, not a second task ledger. After approval,
link the selected work from the roadmap instead of copying this plan into
another backlog.

Preserve the immutable release, historical evidence, installed plugin caches,
and active user configuration. Source changes must not be represented as an
installed or published update.

## Evidence and limits

### Source inventory

The review compared the [manifest](manifest.json), actual asset directories,
[plugin registrations](plugin.json), and [generated catalog](README.md).

| Surface | Observed source | Proposed after the primary change |
| --- | ---: | ---: |
| Skills | 63 | 58 |
| Resident instructions | 15 | 15 |
| Prompt aliases | 15 | 15 |
| MCP servers | 2 | 2 |

The proposed skill total removes six existing skills and adds
`creative-writing`. Other totals remain unchanged unless implementation
reveals a necessary dependent change, which must be explained before widening
the scope. Recompute the inventory from the manifest and filesystem.

The installed read-only brain analyzer reported preserved source hashes and
no error-severity findings. Its duplicate-body advisories included expected
source/package copies; they are not deletion authority.

This was a static component and dependency review, not a new live-host
qualification or a measured demonstration that native output is better.

### Official harness references

| Reference | Relevance |
| --- | --- |
| [Copilot CLI 1.0.111](https://github.com/github/copilot-cli/releases/tag/v1.0.111) | Stable CLI release checked during this review |
| [Copilot SDK 1.0.33](https://github.com/github/copilot-sdk/releases/tag/v1.0.33) | Stable SDK release checked during this review |
| [VS Code 1.146](https://code.visualstudio.com/updates/v1_146) | Copilot harness direction, Local harness deprecation, and newer authoring surfaces |
| [Harness transition guide](https://code.visualstudio.com/docs/agents/run/move-to-copilot) | Copilot became the new-session default in 1.143; Local removal is scheduled for February 2027 |
| [Customization migration](https://code.visualstudio.com/docs/agent-customization/migrate-customizations) | Distinguishes unsupported workspace/user prompt files from other customization types |
| [CLI plugin reference](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-plugin-reference) | Native rules, plugin formats, marketplace registration, and lifecycle commands |
| [Agent plugin authoring](https://code.visualstudio.com/docs/agents/reference/agent-plugin-reference) | Portable versus client-specific components and legacy compatibility |
| [Sandboxing](https://code.visualstudio.com/docs/agents/run/agent-sandboxing) | Current Copilot-harness boundaries and platform prerequisites |

Treat versions as dated evidence, not permanent compatibility defaults.
Discover capabilities on the actual client, harness, execution host, and
policy configuration. Shared runtime architecture does not prove host parity.

Model comparison and Skills over MCP include preview or experimental
capabilities. Do not make them required replacements without availability
checks. No observation established that Flint implements Skills over MCP.

## Decision principles

- Replace execution machinery where the native harness owns it; preserve
  domain-specific judgment and output contracts.
- A coding-only benchmark cannot justify retiring editorial or visual craft.
- A preview, screenshot, successful tool call, or discovered skill is not
  proof of a correct and delivered artifact.
- Remove obsolete obligations rather than keeping empty compatibility skills.
- Preserve safeguards that still serve a noncoding workflow under an
  appropriate retained owner.
- Do not infer native equivalence to formal TDD, mutation testing, or a
  specialist audit merely because coding agents are available.
- Keep unavailable prerequisites and unsupported outputs explicit. Do not
  silently install tools or substitute a different deliverable.
- Claim context or latency savings only after measuring the actual loader or
  runtime. Fewer source files alone do not establish token savings.

## Primary recommendation: retire coding-only skills

| Skill | Proposed disposition | Intentional behavior change |
| --- | --- | --- |
| `code-review` | Remove the skill and coding-specific resources; relocate shared completion guidance first | Native coding review replaces the plugin review workflow |
| `deep-review` | Remove the coding-review alias | Use available native coding reviewers or critics; retain general adversarial critique |
| `security-and-hardening` | Remove the application-code hardening checklist | Use native security review and project security requirements |
| `test-driven-development` | Remove the skill and execution reference | Alex no longer imposes a universal RED-GREEN-REFACTOR protocol |
| `systematic-debugging` | Remove the skill and coding references | Native debugging and project-specific guidance own code investigation |
| `mutation-testing` | Remove the manual production-code mutation protocol | Project tooling or an explicitly requested coding task owns this method |

The six directories contain 18 source files. This is the affected-path
inventory, not 18 discarded behaviors: two completion references must move.
Git history preserves retired source; do not copy it into a new active archive
or retain discoverable stubs.

Native capability absence must be reported honestly. Do not invent a
replacement command, claim a specialist review ran, or silently install
another integration.

### Preserve completion safeguards

Move these references into `skills/doc-hygiene/references/`:

- `skills/code-review/references/runtime-lint-discipline.md`
- `skills/code-review/references/runtime-no-deferred-debt.md`

Add a completion mode to [doc-hygiene](skills/doc-hygiene/SKILL.md) and route
[lint discipline](instructions/lint-discipline.instructions.md) and
[scoped debt handling](instructions/no-deferred-debt.instructions.md) there.

The retained contract must cover document diagnostics, broken links, stale
task-coupled references, and the actual validators appropriate to a touched
artifact. A risky repair still requires a decision; completion is not
permission for unrelated cleanup.

The coding-only `audit-tally.cjs` and `structure-metrics.cjs` helpers are removal
candidates with their owner. Recheck consumers immediately before deletion;
retain or relocate any demonstrated noncoding dependency rather than deleting
it by filename.

### Update dependent consumers coherently

- Remove retired entries from [manifest.json](manifest.json).
- Update grouping in [the catalog generator](scripts/update-docs.mjs) and
  regenerate its owned README sections rather than editing generated rows.
- Replace the coding-focused catalog group with a planning/delivery grouping.
- Update owner links and descriptions in retained skills, resident
  instructions, the README ownership table, and related planning references.
- Remove the blanket TDD prescription from the retained planning template.
- Preserve the chart/data mutation procedure in
  [render-verify](skills/render-verify/SKILL.md); remove only its dependency
  wording about the retired coding skill.
- Update affected tests without deleting unrelated helper or safety coverage.
- Version the active [scenario definitions](docs/verification/skill-scenarios.json)
  and replace the coding-only review case with editorial review.
- Preserve historical scenario responses, receipts, and release evidence.
  Annotate old evidence when needed; never relabel it as a new pass.

## Retain cross-domain capabilities

| Capability | Reason to retain | Optimization |
| --- | --- | --- |
| [Git workflow](skills/git-workflow/SKILL.md) | Documents, manuscripts, graphics, and datasets also require safe versioning and delivery | Keep native-first operations and required authentication/delivery helpers |
| [Planning](skills/plan/SKILL.md) | Applies to reports, books, visual projects, and publication work | Keep a thin native-first authority contract and cross-domain examples |
| [Spike](skills/spike/SKILL.md) | Bounded experiments apply to layouts, rendering, exports, and interactions | Broaden coding-heavy examples without requiring throwaway code |
| [Safe Markdown publishing](skills/markdown-sanitization-chain/SKILL.md) | Documentation and interactive visual outputs still need safe rendering | Preserve sanitization safeguards and their tests |
| [General adversarial critique](skills/adversarial-review/SKILL.md) | Decisions, prose, plans, and designs need artifact-appropriate criticism | Do not route every critique through a coding reviewer |
| [Project recovery](skills/proactive-awareness/SKILL.md) and [meditation](skills/meditation/SKILL.md) | Project records and deliverable custody are distinct from session history | Let native interfaces own session mechanics |
| [Browser tools](skills/browser-tools/SKILL.md) | Local artifacts, exports, downloads, and interaction checks remain necessary | Keep native-first discovery and a qualified fallback |
| [Conversion](skills/convert/SKILL.md) and [runtime dependencies](skills/setup-dependencies/SKILL.md) | Displaying a preview is not equivalent to producing the requested file | Keep capability-specific prerequisites and explicit failure reporting |
| Chart, graphics, and prose skills | They encode craft and output requirements not established by tool availability | Evaluate against representative domain tasks |
| Prompt aliases | Explicit entrypoints can remain useful across authoring workflows | Keep thin; do not confuse plugin commands with workspace prompt files |

## Add dedicated creative-writing support

Create `skills/creative-writing/SKILL.md` as the owner of creative generation
and revision. Register it in the manifest and catalog. Use normal skill
invocation; do not add another prompt alias without a demonstrated need.

### Required workflow

1. Establish the requested form, audience, tone, constraints, and output
   destination. Ask only for material missing decisions; do not make a short
   creative request complete a long intake ritual.
2. Select generation, development, developmental editing, or line-editing
   mode. An edit request does not automatically authorize all modes.
3. Preserve explicit voice, point of view, tense, established continuity,
   genre conventions, and intentional ambiguity.
4. Permit intentional fictional invention. Distinguish it from assertions
   about real people, events, sources, quotations, or technical facts.
5. Apply form-appropriate checks: narrative continuity and causality,
   character motivation, scene purpose, dialogue, rhythm, or requested poetic
   structure. Do not require every creative work to state a thesis.
6. Deliver the requested text or repository-owned file with clear scope.
   Drafting does not authorize publication, sending, or persistent memory.

Compose with [humanizer](skills/humanizer/SKILL.md),
[communication craft](skills/communication-craft/SKILL.md), and factual
grounding where appropriate. Do not duplicate their catalogs or normalize all
creative prose into a practitioner-editor voice.

No new runtime dependency, paid service, automatic memory write, or mandatory
multi-agent topology is proposed.

## Improve existing noncoding workflows

| Area | Proposed improvement | Preservation requirement |
| --- | --- | --- |
| Factual grounding | Distinguish factual assertions, hypothetical examples, and intentional fiction | Never fabricate real sources, quotations, or completed checks |
| ACT activation | Apply materiality to consequential decisions and factual claims, not every imaginative choice | Preserve scrutiny where an output affects a real decision |
| Prose editing | Separate requested drafting from unsolicited copy review; respect explicit voice | Preserve existing approval boundaries for unrequested changes |
| Documentation | Check links, terminology, source fidelity, structure, and audience requirements | Do not lose code blocks, media, or technical meaning during editing |
| Charts | Verify measures, units, periods, comparisons, interactions, and data-to-output linkage | Do not invent missing values or substitute row counts for the requested measure |
| Graphics | Verify legibility, composition, accessibility, geometry, and actual exports | Inspect the final artifact rather than claiming success from generation alone |
| Conversion | Verify requested format, preserved content, media, and known limitations | A Markdown fallback is not the requested Word file |
| Continuity | Use native usage/history/compaction controls instead of exchange-count rituals | Retain authoritative project records and artifact-delivery checks |

Review broad resident triggers for coding-first assumptions and unnecessary
creative-flow interruptions. Do not promise that fewer instructions will
improve quality without comparative evidence.

## Coupled compatibility repairs

### Marketplace assumptions

[Enterprise setup](skills/setup-enterprise-stack/SKILL.md) and its audit helper
still treat `copilot-plugins` as built in. Current official documentation names
`awesome-copilot` as the built-in default and describes explicit registration
for `copilot-plugins`.

Repair the emitted setup, registration checks, explanatory text, and regression
fixtures together. Do not automatically rename plugin IDs, change accounts,
or modify a user's marketplace registrations.

### Terminal and context guidance

Replace obsolete platform/version prescriptions in the
[terminal reference](skills/terminal-command-safety/references/shell-procedures.md)
with current-harness capability checks. In particular, do not treat a
Local-harness-era Windows statement or a fixed asynchronous timing threshold
as a universal Copilot-runtime rule.

Prefer actual context usage and native compaction/resume facilities over
fixed exchange counts. Keep shell quoting, bounded command waits, explicit
errors, and owned-process cleanup.

Sandbox availability depends on platform, prerequisites, configuration, and
policy. Do not claim that Windows support means this session is sandboxed or
that native sandboxing enforces repository artifact delivery.

## Separate migration opportunities

These are recommendations for separately approved design and qualification,
not part of the primary removal change.

### Native instruction delivery

Pilot native plugin rules as a replacement for profile-copy bootstrap.
Migrating is not just adding a schema field: component locations, metadata,
commands, MCP configuration, and owner routing must remain consistent.

Retirement gates:

- Actual activation and intended opt-in behavior on each supported host.
- Safe upgrade, disablement, and removal without duplicate active rules.
- Preservation of modified or unowned profile content.
- A reviewed transition for receipt-owned legacy copies.
- Exact packaged-source parity and separately observed host behavior.

Until these pass, preserve the
[bootstrap compatibility boundary](skills/bootstrap-core/SKILL.md) and the
[existing roadmap watchlist](ROADMAP.md#watchlist).

### Browser fallback provisioning

Consider making Playwright provisioning explicitly capability-selected.
Before removal or default changes, compare native behavior for local HTML,
SVG and images, console inspection, authentication, interactions, downloads,
and saved output.

Preserve the current fallback while required cases are missing or unverified.
Do not delete Flint, converter, or image tooling because a canvas or browser
can display a preview.

## Proposed implementation sequence

| Stage | Work | Prerequisite | Exit evidence |
| --- | --- | --- | --- |
| Scope approval | Confirm retirement set, retained safeguards, and creative-writing contract | Maintainer decision | Approved source-only boundary |
| Replacement owners | Add cross-domain completion ownership and creative-writing support | Scope approval | Valid routes, catalog entries, and focused regression cases |
| Coding retirement | Remove the selected directories and repair dependent consumers | Replacement owners | No dangling active routes or lost retained safeguards |
| Compatibility repairs | Correct marketplace assumptions and stale runtime guidance | Scope approval | Focused passing fixtures without active-user changes |
| Verification | Run affected checks, representative authoring cases, and candidate-package verification | Retirement and compatibility repairs | Scoped evidence with failures and limitations retained |
| Delivery decision | Review the actual change and select any further release work | Verification | Separate approval under the existing release gates |

Treat this sequence as a design dependency map, not an active checklist.
Record approved work only in the authoritative roadmap.

## Acceptance and verification

### Structural and regression checks

- Manifest, filesystem, catalog, and instruction-owner inventories agree.
- Retired components are absent from discovery and new candidate packages.
- Completion instructions resolve to the retained owner.
- Local links resolve; historical evidence is not rewritten or deleted.
- Existing conversion, safe-publishing, artifact-storage, and visual checks
  retain their relevant coverage.
- Active scenario definitions and runner expectations agree after versioning.
- A newly built candidate passes exact-file verification without modifying
  the frozen release payload.
- Start with affected tests; follow the existing full
  [testing contract](docs/testing.md) and
  [release checklist](RELEASE-CHECKLIST.md) before any later release.

Use the existing test runners, documentation generator, link checker, and
package verifier. No new framework is proposed.

### Representative behavioral cases

| Use case | Required observation |
| --- | --- |
| Technical documentation | Preserve literal examples and media; identify an unsupported factual claim; keep review-only work read-only |
| Editorial review | Explain a real clarity or structure issue using the supplied text; do not invent defects or rewrite without authority |
| Fiction generation | Produce the requested fictional form without demanding citations for invented characters or interrupting with a coding protocol |
| Creative revision | Preserve established voice, viewpoint, tense, and continuity; respect the selected edit depth |
| Mixed fact and fiction | Distinguish invented events from real-world assertions; do not fabricate real quotations or sources |
| Chart design | Ask for missing measures; preserve units and period; validate interactions and decision-bearing values |
| Graphics | Inspect readability, composition, and accessibility; verify the requested saved artifact or state the unavailable check |
| Conversion and export | Preserve source content and required media; name unavailable prerequisites or unsupported output honestly |
| Draft-only communication | Retain placeholders for unknown recipients/dates; do not send, open an external draft, or look up contacts |
| Coding handoff | Use an actually available native capability without claiming a retired plugin workflow ran |

Run data-mutation controls only in disposable fixtures or with explicit scope
and verified restoration. Preserve the final source and output.

For native-only versus plugin-enabled comparisons, follow the
[evaluation guide](docs/launch/evaluation-guide.md): comparable models,
settings, permissions, prompts, and isolated instruction state. Extend its
coding-centered examples with representative noncoding cases.

Record actual responses, tool actions, artifacts, and limitations in
repository-owned verification evidence. Structural assertions do not prove
creative quality, semantic compliance, or installed-host behavior. Do not
collect standing skill-firing or cross-session behavioral telemetry.

## Risks and reversal criteria

| Risk | Mitigation or decision gate |
| --- | --- |
| A coding-labeled component contains a useful noncoding safeguard | Relocate the demonstrated safeguard before retiring its owner |
| Native facilities do not provide formal TDD, mutation, or specialist guarantees | State the intentional contract reduction; preserve project testing and release requirements |
| Creative freedom is mistaken for permission to invent real facts | Separate fictional invention from factual attribution and evidence |
| Generic rigor interrupts creative flow or erases voice | Use materiality and explicit modes; compare representative outputs |
| A source pass is mistaken for host parity | Keep discovery, activation, execution, output, and delivery claims separate |
| Native migration leaves duplicate profile instructions | Require explicit legacy transition, ownership checks, and removal observations |
| A preview is mistaken for a usable export | Verify the actual saved artifact and requested format |

Reconsider a retirement if a supported workflow loses a necessary capability
that cannot be preserved under an appropriate retained owner or an available
native mechanism. Reconsider retained guidance if controlled representative
comparisons show no useful benefit or show systematic harm.

The recommendation is conditional on those checks, not on file-count reduction.
No optimization is complete merely because the package is smaller.
