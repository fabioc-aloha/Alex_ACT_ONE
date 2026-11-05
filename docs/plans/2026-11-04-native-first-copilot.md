# Native-first Copilot implementation plan

> Historical plan and dated execution receipts for the v0.7.0 native-first work.
> Later source additions and the v0.8.0 baseline are documented in the
> [current README](../../README.md#native-first-skill-optimization) and
> [roadmap](../../ROADMAP.md). Preserve the inventory and verification snapshots
> below as evidence of that rollout, not current package counts.

**Goal:** Reduce duplicate platform machinery without losing ACT's reasoning, approval, privacy, verification, or specialist-output contracts.

**Architecture:** Use native Copilot facilities for planning, review execution, browser access, context management, and customization discovery. Keep instructions as short activation contracts and prompts as thin user-invoked entrypoints; skills own execution and validation, with detailed information in selectively loaded references. Migrate packaging and entrypoints only after both target clients pass bounded compatibility checks.

**Tech Stack:** GitHub Copilot CLI, VS Code with GitHub Copilot, Markdown skills/instructions, JSON plugin metadata, existing Node.js scripts and `node:test`, and existing PowerShell installation tooling.

---

## Status and authority

- **Status:** Compatible v0.7.0 release prepared for approved publication. Legacy activation remains supported; native activation/profile migration is not included.
- **Fact-check date:** 2026-11-04.
- **Consolidation-design update:** 2026-11-05. The platform evidence below remains dated 2026-11-04; refresh it before implementation rather than treating this edit as a new release verification.
- **Target comparison:** Copilot CLI and VS Code Copilot, as selected by the owner.
- **Repository baseline:** commit `e29ffa66cda8c9fd99c41134773173263b94c537`, plus the existing uncommitted deterministic-helper and telemetry-cleanup changes.
- **Audit-baseline inventory:** 15 instructions, 15 prompts, 60 skills. The compatible implementation adds converter, chart-orchestration, and project-checkpoint owners; the candidate inventory is 63 skills with the original instructions and command names retained.
- **Implementation authority:** the owner approved repository implementation, one compatible package, preservation of existing hosts/aliases/writing/voice defaults, and bounded CLI probes in disposable state. On 2026-11-05 the owner separately approved v0.7.0 source/Mall publication and independent review. User-level installation and global settings remain untouched.
- **Other supported clients:** the existing [README compatibility table](../../README.md#where-alex-act-one-works) also names Scout and the GitHub Copilot app. Their retirement or loss of compatibility is not authorized by limiting this comparison to two clients.

### Decision and disconfirmer

**Considered:** Keeping the entire pack unchanged preserves compatibility but
retains obsolete host assumptions. Replacing everything with native features
reduces duplication but can discard specialized behavior that those features
do not specify. Recommend staged native-first delegation with preservation gates.

**Would revise if:** a target-client probe fails, policy blocks a required
feature, an artifact has an overlooked unique contract, or the owner chooses
to continue supporting a client that cannot consume the proposed format.

### Execution receipt: 2026-11-05

| Work | Candidate result | Remaining gate |
| --- | --- | --- |
| T0 baseline | All 222 baseline tests passed before edits; prior uncommitted helper/telemetry work was integrated, not reverted | No checkpoint commit was requested |
| T1 fixtures | Added native-first command, mode, reference, activated-copy routing, missing-owner, and redirected-owner checks | Structural tests are not live semantic parity for every workflow |
| T2/T3a/T3 | Native-first adapters, shared ACT/review/recovery owners, and short instruction activation contracts implemented | Full target-host behavior and fresh-context semantic review remain release checks |
| T4 | Humanizer pattern catalog and ordinary/deep/specialist review references extracted; mode and approval boundaries retained | Source catalog freshness remains subject to the existing release-time comparison |
| T5 pilot | Version-pinned CLI 1.0.105 discovered skills from both disposable legacy and Agent Plugins fixtures; the tested rule layout in each returned an empty instruction list | Native rule activation not demonstrated; no production format switch |
| T6 migration | Legacy copying, receipts, modified/foreign-file preservation, and fallback remain intact; preview now reports canonical skill routes | No real profile cleanup or native activation migration performed |
| T7 entrypoints | All command names retained as thin routes; convert, render-chart, and project-status have owning skills | Alias retirement requires a later explicit compatibility decision |
| T8 distribution | Owner selected one package with current host and writing/voice behavior preserved | No physical pack split or default-behavior change |
| T9 validation | All 258 tests passed in a fresh packaged copy, including 36 native-first regressions; structural assessment preserved bytes with zero errors/advisories | Final target-host release checks, fresh-context semantic review, catalog freshness, and publication approval still required |

A live CLI fixture invoked project-status, then proactive-awareness, read its
handoff and task list, and returned the fixture checkpoint. Both fixture records
retained identical hashes. This proves that bounded recovery case, not all skill
semantics, rule activation, or VS Code/Scout/app parity.

The initial environment's CLI shim bundled an older runtime when isolated.
The meaningful probes therefore ran the cached 1.0.105 `cli-main.js` directly,
with disposable `COPILOT_HOME` and session sync disabled. No normal plugin store
or installed configuration was modified. Do not treat the failed shim probe or
an empty native instruction list as a successful replacement.

Source-size measurement against commit HEAD, not actual loaded tokens:
instruction text changed from 51,033 to 21,765 characters (57.4% reduction);
prompt text changed from 43,758 to 16,528 characters (62.2% reduction).
Procedural detail remains in selectively loaded skill references. These figures
do not establish token, latency, quality, or reliability savings.

### Final release review

The approved independent fresh-context review identified one medium-severity
regression: protocol-relative image URLs were classified as filesystem paths.
A real CLI regression reproduced it before the URL exemption was moved ahead of
filesystem checks. The reviewer confirmed the correction; Windows drive and
`file:` URL rejection remain covered.

The release also refreshes Humanizer's source comparison to Wikipedia revision
1383697236, clarifies historical and genre-specific cues, and restores the
historical Scout skill count verified against the v0.2.0 manifest. Source and
asset-manifest versions agree at 0.7.0.

Publication uses an immutable source release tag and the existing source-delivery
Mall workflow. It does not activate native rules or upgrade the owner's installed
copy. New-release host checks after that upgrade remain distinct from the
automated package and CLI evidence recorded here.

## 1. Fact-checked baseline

Evidence levels:

- **Observed:** read-only local output or a repository file checked in this task.
- **Documented:** an official source supports the claim; runtime parity is not implied.
- **Proposed:** a design recommendation, not a platform fact.
- **Unverified:** requires a bounded client test before depending on it.

| ID | Fact or limitation | Evidence and consequence |
| --- | --- | --- |
| F01 | Latest stable CLI is 1.0.105; GitHub release publication is 2026-10-28 UTC. The installed CLI also reports 1.0.105. | Observed through `gh api repos/github/copilot-cli/releases/latest` and `copilot --version`; [release][cli-release]. The changelog's entry date is 2026-10-27, not its API publication date. Do not baseline on a prerelease. |
| F02 | Latest stable VS Code is 1.145.0, released 2026-11-04. | Observed release API plus [official release notes][vscode-release]. The installed editor version was not inspected; record it before a live test. Stable release availability does not make every feature stable. |
| F03 | Native CLI planning, review, security review, independent critique, context, compaction, resume, memory, initialization, and history commands exist. | Observed `copilot help commands` lists `/plan`, `/review`, `/security-review`, `/rubber-duck`, `/context`, `/compact`, `/resume`, `/memory`, `/init`, and `/chronicle`. [Official reference][cli-reference] describes the workflows and built-in agents. Availability does not establish ACT-specific behavior. |
| F04 | CLI Plan mode protects against clear direct workspace mutations, but is not an airtight read-only sandbox. | [Pinned CLI reference][cli-reference]: ambiguous shell commands and connected external/MCP tools are caveats. Planning notes can be written to the private planning workspace. Preserve explicit external-action boundaries. |
| F05 | VS Code has native Plan workflows, with harness-specific behavior. | [Pinned planning guide][vscode-planning]. Local Plan and Copilot Plan have different controls and storage. VS Code `/research` is described there as an Insiders preview; it is not a required stable dependency in this plan. |
| F06 | VS Code browser tools include screenshots, console-error inspection, interaction, and focused Playwright code without requiring an external MCP server. | [Pinned browser guide][vscode-browser]. Local-file access, selected-harness availability, remote behavior, policy, and authentication scenarios still need the tests below. |
| F07 | A native CLI browser plugin exists in the stable changelog; it was renamed `browser-use` in 1.0.100. | [CLI changelog][cli-changelog], checked in this task. This establishes existence, not feature parity, default enablement, or a guaranteed replacement for every Playwright scenario. |
| F08 | Native plugin rules are documented, including `com.github.copilot/rules/` for Agent Plugins packages. | [Pinned CLI plugin reference][cli-plugins] and [pinned VS Code plugin reference][vscode-plugins]. Rules are Copilot-specific extensions, not portable Agent Plugins core components. Exact file metadata and equivalence to the current `applyTo` behavior must be established by a fixture. |
| F09 | Changing the plugin format is more than adding a rule directory. | The Agent Plugins 1.0 shape uses a root schema-bearing manifest, `skills/`, root `mcp.json`, and client-specific components. Current [plugin.json](../../plugin.json) has no `$schema`, uses `commands: "prompts"`, embeds MCP entries, and has object-shaped repository metadata. [CLI plugin reference][cli-plugins] documents the different formats and field shapes. |
| F10 | Skills can be invoked directly, while standalone VS Code prompt files require the Local harness. | [Pinned skill guide][vscode-skills] and [customization guide][vscode-customization]. Plugin-distributed skills receive command namespaces. Legacy plugin commands are a different compatibility surface; the prompt-file restriction alone does not prove this pack's existing commands are broken. |
| F11 | Skills load progressively; their entire bodies are not all automatically resident. | [Official skill guide][vscode-skills]. Large descriptions, mandatory routing, and broad triggers can still cause unnecessary loading. Do not claim token savings from installed line counts alone. |
| F12 | Memory depends on the harness. | [Pinned memory guide][vscode-memory]: Copilot Memory stores durable user/repository knowledge; Local uses a separate file-based tool. Repository-local Copilot Memory is Experimental. Do not substitute persistent memory for an authoritative task list or hardcode `/memories/session/` for every harness. |
| F13 | Native test generation and test/fix loops are not documented guarantees of test-first development or mutation testing. | [Pinned smart-actions guide][vscode-actions] documents generation, fixes, and review. Keep any deliberate RED-before-implementation and mutation-detection contracts separately. |
| F14 | The resolver issue cited by platform-awareness is closed. | GitHub API reports [microsoft/vscode#314772][resolver-issue] closed 2026-09-17. This removes one prerequisite for the workaround, but does not prove every installed harness is fixed. A fresh packaged-skill probe remains necessary. |
| F15 | Existing packaging tests assume the legacy structure. | [smoke.test.mjs](../../tests/smoke.test.mjs) reads embedded MCP entries and `skills`/`commands` fields; [activation-routing.test.mjs](../../tests/activation-routing.test.mjs) tests prompt-relative links; [reinstall-release.test.mjs](../../tests/reinstall-release.test.mjs) models a copied-instruction receipt. Migration must update these tests rather than deleting the safeguards. |
| F16 | Existing documentation has specific claims that need revision after verification. | [README.md](../../README.md) says CLI has no browser; [bootstrap-core](../../skills/bootstrap-core/SKILL.md) categorically says plugins do not load instruction components; [render-verify](../../skills/render-verify/SKILL.md) retains the old console-access rationale; [platform-awareness](../../skills/platform-awareness/SKILL.md) prescribes a resolver workaround. Replace universal statements with version/harness-scoped guidance, not new untested absolutes. |

### Corrections to the earlier audit's interpretation

1. **Optional is a product choice, not a native replacement.** No source proves
   that generic writing replaces Humanizer's Copywriter contract, or that a
   coding agent replaces the converters' file-format guarantees.
2. **The twelve prompt consolidations are candidates, not proven duplicates.**
   Preserve prompt-only defaults, authorization, output shapes, and supported
   names before removing any file.
3. **Rule delivery does not require the policy to disappear.** Replace copying
   machinery only after native delivery is observed. Do not assume the fifteen
   existing instruction files can be moved byte-for-byte without metadata work.
4. **Do not assume a manifest migration is the smallest solution.** First test
   whether supported legacy Copilot packaging can deliver the required rules
   consistently. Use Agent Plugins 1.0 only if it provides the verified common
   path. Both alternatives are candidates until tested.
5. **Native capabilities do not imply mandatory delegation.** Prefer direct
   review for small evidence sets; use isolated/native reviewers only when
   requested or materially useful.
6. **No automatic telemetry substitution.** `/chronicle` availability does not
   authorize cross-session skill-firing metrics, behavioral scores, or automatic
   capability creation.

## 2. Scope and preserved invariants

### Recommended outcome

- Keep ACT's decision/evidence contract compact and discoverable.
- Route to native planning, review, browser, and session features when available.
- Keep deterministic helpers and specialist outputs with explicit guarantees.
- Consolidate repeated entrypoints and long catalogs without losing behavior.
- Describe domain and voice features as optional; defer physical package
  separation until its dependencies and distribution model are approved.

### Shared routing model for instructions and prompts

One workflow has one behavioral owner, even when both an instruction and a
prompt can start it.

| Layer | Responsibility | Keep out of this layer |
| --- | --- | --- |
| Instruction | Automatic trigger, should-not-fire conditions, essential guardrails, authority limits, and an explicit requirement to load the owning skill when triggered | Detailed execution steps, tool tutorials, long examples, and duplicated catalogs |
| Prompt | Explicit user entrypoint: interpret inputs, pass arguments and constraints to the owning skill, and return its required result | A second implementation of the workflow or a separate copy of the skill's validation rules |
| Skill | Canonical execution order, native-tool selection, validation, failure/unsupported handling, and required output | Duplicated resident policy or unrelated background loaded for every invocation |
| References | Detailed information, rationale, catalogs, examples, and specialist checklists, linked from the step that needs them | Essential safety or authority constraints that would disappear when a reference is not loaded |

Routing must be imperative, not just a hyperlink: "When this condition holds,
load and follow the owning skill before proceeding." A link identifies a
resource; it does not establish that the agent loaded or followed it.

For prompts, the default flow is request/arguments -> owning skill -> required
result. Preserve explicit user constraints and consent; invoking an alias grants
no additional authority. Keep useful names as thin aliases rather than removing
them merely to reduce the artifact count.

Essential approval, privacy, safety, and silence floors remain resident where
they must apply before skill loading. Reuse an existing skill owner when it fits.
If a concise policy needs no execution procedure, keep it concise rather than
inventing a skill solely to satisfy the layering model. "Keep" in the inventory
preserves the contract, not every current paragraph's location.

If a required skill or reference cannot be loaded, retain those resident floors
and report the missing dependency; do not silently skip the workflow or report
it as completed. Resolve skills through the host's supported discovery and the
canonical installed package, never an assumed adopter checkout.

The current [bootstrap script](../../skills/bootstrap-core/scripts/bootstrap-core.cjs)
copies instruction bytes unchanged to a user instruction directory. Therefore,
a source-relative link that works beside the source instruction may not resolve
from its activated copy. Test both installed-package and activated-copy routes,
including an adopter with no local `skills` directory. Do not solve this by
embedding machine-specific absolute paths.

### Must not change accidentally

- User approval before external effects, installing dependencies, profile
  changes, publishing, sending email, or deleting owned state.
- Hash/receipt ownership and preservation of modified or foreign instruction
  files during migration and rollback.
- Named-audience review, explicit author voice, audit-only mode, and
  approval-before-application when Copywriter Mode is used.
- Chart claim/data consistency, converter outputs, deterministic-checker
  regression coverage, and unsupported-input reporting.
- Scoped repository continuity; no automatic native-memory or episodic writes.
- No semantic telemetry or new standing usage journals.
- No silent loss of Scout/GitHub Copilot app compatibility.
- Existing local work remains intact. A fresh clone of the current commit
  alone does not contain the uncommitted helper fixes.

### Dependency cautions

The current [audience-copy-review instruction](../../instructions/audience-copy-review.instructions.md)
requires [humanizer](../../skills/humanizer/SKILL.md). The current
[session-health instruction](../../instructions/session-health-monitoring.instructions.md)
depends on [reliance-nudges](../../instructions/reliance-nudges.instructions.md)
for inhibition rules and on [proactive-awareness](../../skills/proactive-awareness/SKILL.md)
for recovery. Classifying any dependency as optional does not permit deleting it
while its caller remains mandatory.

Keep mandatory safety/silence floors in Core, and co-locate optional policy with
its required skill before making a profile or package selectable. Disabling
automatic skill invocation is not the same as uninstalling a capability or
removing its metadata cost.

### Consolidation architecture: families versus behavioral owners

Group by user intent, execution contract, and authority, not merely by topic or
file format. A family organizes related capabilities; it does not require one
large skill, shared write permission, a new plugin, or a new repository.

| Organizational family | Related capabilities | Boundary to preserve |
| --- | --- | --- |
| Judgment and evidence | ACT reasoning, framing, adversarial methods, risk, factual verification | Verifying inputs is distinct from judging the reasoning built on them |
| Engineering quality | Review, debugging, TDD, mutation testing, application security, Git | Finding a defect does not authorize changing code; generating tests does not establish mutation coverage |
| Writing and communication | Audience review, Humanizer, voice, central claims, stakeholder reports | Preserve author voice and review/approval modes; a report is not an authoritative task record |
| Documents and publishing | Conversion, rich email, documentation shell, documentation hygiene | Producing file bytes does not authorize addressing, opening, sending, or publishing them |
| Charts and visual analysis | Chart framing, selection, interpretation, Flint, themes | Keep analytical claims and data semantics separate from renderer/backend mechanics |
| Visual production | SVG figures, print standards, banners, imagery, screenshot annotation | Provider-specific generation, deterministic figures, and annotation have different inputs and acceptance criteria |
| Agent authoring and maintenance | Assessment, compilation, capability authoring, context-cost reduction | Read-only assessment must remain usable without granting authoring or installation authority |
| Runtime and continuity | Activation, dependencies, native-tool routing, project recovery, session closure | Separate read-only recovery, authorized record reconciliation, profile changes, and plugin lifecycle |

These are navigation and ownership families, not a proposal for eight plugins or
eight mega-skills. Capabilities may compose across families without duplicating
their implementation. Each workflow still has one canonical behavioral owner.

#### Recommended true consolidations

| Canonical owner | Shared procedure to consolidate | What remains distinct |
| --- | --- | --- |
| [critical-thinking](../../skills/critical-thinking/SKILL.md) | Shared ACT execution order, framing, instruction-precondition audit, and selection of adversarial/risk methods from the overlapping instructions and skills | Keep the [act-tenets canon](../../skills/act-tenets/SKILL.md) unchanged and [anti-hallucination](../../skills/anti-hallucination/SKILL.md) as the evidence-verification owner. Curation-specific [risk rules](../../skills/risk-analysis/SKILL.md) become an optional reference, not a universal release authority |
| [code-review](../../skills/code-review/SKILL.md) | Ordinary and [deep-review](../../skills/deep-review/SKILL.md) as selectable review modes; specialist checklists as selectively loaded references | General decision critique remains in the ACT/adversarial-method owner; review does not acquire debugging/edit authority or require three agents |
| [big-idea](../../skills/big-idea/SKILL.md) | One claim-distillation, audience, and narrative-stance procedure used by prose and [chart-big-idea](../../skills/chart-big-idea/SKILL.md) | The chart workflow still owns population, denominator, analytical intent, treatment choice, and Chart Brief output |
| Proposed `skills/convert/SKILL.md` | Format dispatch and shared conversion steps, with format-specific procedures referenced rather than reimplemented | Existing converter scripts, supported options, and format-specific acceptance checks remain authoritative; [rich-email](../../skills/rich-email/SKILL.md) owns the unsent-draft interaction |
| [proactive-awareness](../../skills/proactive-awareness/SKILL.md) as the shared read-only project-recovery owner | Repeated state-reading used by the [status prompt](../../prompts/status.prompt.md), [session-health instruction](../../instructions/session-health-monitoring.instructions.md), and the recovery phase of [meditation](../../skills/meditation/SKILL.md) | Keep status output and task-record sources explicit. Meditation's authorized writes and stakeholder [status-reporting](../../skills/status-reporting/SKILL.md) are separate workflows |
| [compile-brain](../../skills/compile-brain/SKILL.md) | Shared artifact-authoring, preservation, validation, and review mechanics used by [project-capability-authoring](../../skills/project-capability-authoring/SKILL.md) | Capability extraction retains proof of need, local scope, and approval. [assess-brain](../../skills/assess-brain/SKILL.md) stays read-only and independently invocable |

Use short mode/alias entrypoints for explicit requests such as framing, risk,
deep review, a specific conversion, or project status. Do not copy the procedure
back into each alias. Load only the selected mode and references rather than
combining every related procedure into one routinely loaded body.

#### Boundaries that must not be merged

- **Humanizer versus documentation hygiene:** audience/voice editing and
  factual/documentation drift have different success criteria.
- **Review versus debugging:** finding and reporting defects is not permission
  to implement fixes.
- **TDD versus mutation testing:** test-first implementation and evidence that
  the tests detect faults are complementary, not interchangeable.
- **Conversion versus email delivery:** producing an EML file is not authority
  to open a recipient-addressed draft or send a message.
- **Single-artifact verification versus corpus sweeps:** one artifact passing
  cannot satisfy a complete-corpus coverage requirement.
- **Read-only recovery versus meditation:** reading restart state and rewriting
  project records have different authority.

#### Priority and conflict resolution

Start with overlapping ACT procedures, review variants, and repeated recovery
logic. Generalize the shared claim-distillation and authoring mechanics next;
complete conversion dispatch during T7. Broadly related specialist tools have
weaker evidence for merger and remain independently callable.

Before any consolidation, inventory disagreements about triggers, step order,
stop conditions, severity, authority, and output. Select a canonical procedure
explicitly and obtain approval for any material behavior change; do not silently
choose the shorter or more permissive version. In particular, reconcile framing
and materiality ordering before consolidating the ACT procedure.

The disposition table below tracks the original contracts, not a required final
file count. A Keep contract can move into a canonical owner, and an Optional
capability can retain its own entrypoint. Recompute the final inventory only
after implementation; do not promise a numerical reduction from these groups.

## 3. Complete artifact disposition

Labels are recommendations about each artifact's contract, not implementation
status:

- **Keep:** distinct behavior remains; no equivalent native contract established.
- **Thin:** delegate mechanics; retain the missing policy or domain invariant.
- **Optional:** valuable specialization, not mandatory minimal Core.
- **Consolidate:** share the owning skill implementation through thin entrypoints; retain useful aliases, with any removal a separate compatibility decision.
- **Migrate:** change the execution/delivery format only after compatibility proof.

| Decision | Instructions | Prompts | Skills | Total |
| --- | ---: | ---: | ---: | ---: |
| Keep | 5 | 0 | 14 | 19 |
| Thin | 7 | 0 | 14 | 21 |
| Optional | 3 | 0 | 29 | 32 |
| Consolidate | 0 | 12 | 0 | 12 |
| Migrate | 0 | 3 | 3 | 6 |
| Total | 15 | 15 | 60 | 90 |

These are inventory counts, not measured savings or evidence of usefulness.

### 3.1 Instructions

| Artifact | Decision | Recommended change and retained contract |
| --- | --- | --- |
| [act-pass](../../instructions/act-pass.instructions.md) | Keep | Keep the materiality, alternatives, disconfirmation, and visible-evidence contract; one canonical procedural owner. |
| [alex-finch-personality](../../instructions/alex-finch-personality.instructions.md) | Optional | Offer the branded voice explicitly; do not make identity a prerequisite for engineering workflows. |
| [audience-copy-review](../../instructions/audience-copy-review.instructions.md) | Keep | Preserve the named-audience and approval gate. If writing becomes optional, ship this gate with its required Humanizer workflow rather than leaving a broken Core route. |
| [critical-thinking](../../instructions/critical-thinking.instructions.md) | Thin | Keep a short route to the skill; remove overlap with act-pass and framing without weakening the two-hypothesis/disconfirmer requirement. |
| [emotional-intelligence](../../instructions/emotional-intelligence.instructions.md) | Optional | Make full affect/tone policy selectable; retain basic respectful interaction independently of an optional personality. |
| [epistemic-calibration](../../instructions/epistemic-calibration.instructions.md) | Keep | Retain evidence-scoped verification/completion, uncertainty, and deterministic-versus-semantic boundaries. |
| [lint-discipline](../../instructions/lint-discipline.instructions.md) | Thin | Native diagnostics supply mechanics; retain test/lint ownership and explicit escalation for risky fixes. |
| [no-deferred-debt](../../instructions/no-deferred-debt.instructions.md) | Thin | Replace broad scope-expansion pressure with a scoped completion/escalation rule; do not authorize unrelated repairs. |
| [pii-memory-filter](../../instructions/pii-memory-filter.instructions.md) | Thin | Retain privacy before every persistence boundary; reference the active harness's memory system rather than assuming one file layout. |
| [problem-framing-audit](../../instructions/problem-framing-audit.instructions.md) | Keep | Preserve symptom/cause reframing and permission before solving a materially different problem. |
| [reliance-nudges](../../instructions/reliance-nudges.instructions.md) | Optional | Make proactive nudges opt-in; preserve shared silence/frustration/consent floors for callers that remain enabled. |
| [session-health-monitoring](../../instructions/session-health-monitoring.instructions.md) | Thin | Use native context/compaction/resume; retain the repository-handoff convention and write authorization only. |
| [system-prompt-skepticism](../../instructions/system-prompt-skepticism.instructions.md) | Keep | Preserve precondition auditing within applicable authority/safety boundaries; native Plan is not this reasoning method. |
| [terminal-command-safety](../../instructions/terminal-command-safety.instructions.md) | Thin | Keep reproducible quoting/temporary-file hazards; use actual native permissions and command lifecycle rather than stale host instructions. |
| [worldview](../../instructions/worldview.instructions.md) | Thin | Keep ACT-specific ethical decision boundaries and route to the deeper skill; do not represent prose as an implemented security control. |

### 3.2 Prompts

| Artifact | Decision | Recommended change and retained contract |
| --- | --- | --- |
| [assess-brain](../../prompts/assess-brain.prompt.md) | Consolidate | Route to assess-brain; preserve explicit target selection and read-only analyzer provenance. |
| [banner](../../prompts/banner.prompt.md) | Consolidate | Route to svg-banner after transferring prompt-only brand/output options; keep the old name during compatibility transition. |
| [bootstrap-core](../../prompts/bootstrap-core.prompt.md) | Consolidate | One owner for preview/activation/repair. Keep a compatibility alias until native rules and legacy cleanup pass. |
| [bootstrap-project](../../prompts/bootstrap-project.prompt.md) | Consolidate | Route to the slim setup skill; preserve preview, additive merging, and repository consent. |
| [compile-brain](../../prompts/compile-brain.prompt.md) | Consolidate | Share the skill's explicit input selection, preservation gate, and approval boundary. |
| [convert](../../prompts/convert.prompt.md) | Migrate | Preserve multi-format dispatch and output validation in a portable dispatcher skill; this is not an empty wrapper. |
| [critical-thinking](../../prompts/critical-thinking.prompt.md) | Consolidate | Move unique output/marker rules to its owner; direct skill invocation supplies the entrypoint. |
| [install-visual-companions](../../prompts/install-visual-companions.prompt.md) | Consolidate | Share consent/native-first selection with its skill; no browser-stack install merely because the alias was invoked. |
| [meditate](../../prompts/meditate.prompt.md) | Consolidate | Share the explicitly authorized record-reconciliation workflow; do not substitute a generic history summary. |
| [problem-framing-audit](../../prompts/problem-framing-audit.prompt.md) | Consolidate | Share framing and user-visible approval behavior with its owning skill. |
| [render-chart](../../prompts/render-chart.prompt.md) | Migrate | Preserve the chart brief, shared data semantics, alternative treatments, rendering, and verification in an orchestration skill. |
| [rich-email](../../prompts/rich-email.prompt.md) | Consolidate | Preserve validation, recipients, unsent-draft confirmation, no-send rule, and cleanup. |
| [setup-dependencies](../../prompts/setup-dependencies.prompt.md) | Consolidate | Share the existing probe/pin/consent workflow; plugin installation does not replace system-tool checks. |
| [setup-enterprise](../../prompts/setup-enterprise.prompt.md) | Consolidate | Share emit/install/audit and scope decisions with setup-enterprise-stack; preserve explicit consent. |
| [status](../../prompts/status.prompt.md) | Migrate | Preserve a read-only project checkpoint skill. It is not the stakeholder-writing status-reporting skill or a session standup. |

### 3.3 Skills

| Artifact | Decision | Recommended change and retained contract |
| --- | --- | --- |
| [act-tenets](../../skills/act-tenets/SKILL.md) | Keep | Preserve the on-demand canon; do not duplicate it inside every workflow. |
| [adversarial-review](../../skills/adversarial-review/SKILL.md) | Thin | Keep method/stakes selection; use available native critics rather than hardcoded agent/model command recipes. |
| [annotate-screenshot](../../skills/annotate-screenshot/SKILL.md) | Optional | Keep its raster-resolution, callout-placement, and legibility contract in the visual specialization. |
| [anti-hallucination](../../skills/anti-hallucination/SKILL.md) | Keep | Retain reproducible quantitative evidence, independent checker tests, and explicit unsupported-input handling. |
| [ascii-chart](../../skills/ascii-chart/SKILL.md) | Optional | Preserve deterministic fixed-width rendering/checking; generic agent output is not equivalent validation. |
| [assess-brain](../../skills/assess-brain/SKILL.md) | Keep | Retain the read-only inventory/route/immutability analyzer; native initialization is a different task. |
| [big-idea](../../skills/big-idea/SKILL.md) | Optional | Keep distillation/removal-test craft on demand; avoid compulsory long passes for every small summary. |
| [bootstrap-core](../../skills/bootstrap-core/SKILL.md) | Migrate | Replace default copying only after native rules work. Retain safe legacy repair/removal until all required migration paths are covered. |
| [bootstrap-project](../../skills/bootstrap-project/SKILL.md) | Thin | Use native initialization for generic guidance; retain additive settings and project-owned-file preservation. |
| [browser-tools](../../skills/browser-tools/SKILL.md) | Thin | Native first; keep consent, measurement, local-file distinctions, and a tested fallback route. |
| [chart-big-idea](../../skills/chart-big-idea/SKILL.md) | Optional | Preserve analytical claim, population/denominator, audience, and treatment brief. |
| [chart-interpretation](../../skills/chart-interpretation/SKILL.md) | Optional | Preserve structured interpretation and misleading-chart checks; visual input alone is not the method. |
| [chart-vocabulary](../../skills/chart-vocabulary/SKILL.md) | Optional | Preserve goal-to-chart guidance; keep the catalog out of unrelated engineering tasks. |
| [code-review](../../skills/code-review/SKILL.md) | Thin | Native routine review plus short project invariants; move NASA/extension audit detail to on-demand references. |
| [communication-craft](../../skills/communication-craft/SKILL.md) | Optional | Retain audience/SBI/needs-elicitation methods for requested communication work. |
| [compile-brain](../../skills/compile-brain/SKILL.md) | Keep | Preserve behavior inventories, destination links, scenarios, reduction gates, and authority. |
| [corpus-qa-sweep](../../skills/corpus-qa-sweep/SKILL.md) | Keep | Preserve real-output-boundary checks over the complete named corpus, not one convenient sample. |
| [critical-thinking](../../skills/critical-thinking/SKILL.md) | Keep | Keep the substantive reasoning method; native investigation tools are inputs to it. |
| [deep-review](../../skills/deep-review/SKILL.md) | Thin | Keep optional perspectives/synthesis; remove automatic three-agent overhead and fixed routing. |
| [doc-hygiene](../../skills/doc-hygiene/SKILL.md) | Keep | Preserve anti-drift and living-versus-historical rules; Generate Docs does not establish them. |
| [docs-shell](../../skills/docs-shell/SKILL.md) | Optional | Retain the deployable HTML shell/template contract where used; editor preview is not that artifact. |
| [docx-to-md](../../skills/docx-to-md/SKILL.md) | Optional | Retain actual conversion, media extraction, and acceptance checks. |
| [ethical-reasoning](../../skills/ethical-reasoning/SKILL.md) | Optional | Keep deeper human-impact/privacy-by-design reasoning on demand. |
| [evaluate-before-adopting](../../skills/evaluate-before-adopting/SKILL.md) | Keep | Retain payload/factual/fit review; marketplace trust and discovery are not correctness proofs. |
| [figure-generator](../../skills/figure-generator/SKILL.md) | Optional | Preserve dataset-backed SVG generation, provenance, regeneration, and contract tests. |
| [flint-chart](../../skills/flint-chart/SKILL.md) | Optional | Keep the Flint contract and mappings with its integration; native artifact display does not replace the renderer. |
| [flint-theme](../../skills/flint-theme/SKILL.md) | Optional | Keep ThemeSpec authoring/validation with Flint. |
| [git-workflow](../../skills/git-workflow/SKILL.md) | Thin | Preserve destructive-action approval and recovery cautions; delegate ordinary UI/shell mechanics. |
| [html-to-md](../../skills/html-to-md/SKILL.md) | Optional | Keep a tested conversion output, not merely a browser-reading capability. |
| [humanizer](../../skills/humanizer/SKILL.md) | Optional | Preserve all three modes, author voice, false-positive boundaries, and Copywriter approval; split the long pattern catalog into linked references. |
| [install-visual-companions](../../skills/install-visual-companions/SKILL.md) | Thin | Native-first capability check; only offer extras needed for the requested task. |
| [lint-clean-markdown](../../skills/lint-clean-markdown/SKILL.md) | Optional | Use a configured linter for enforcement; retain the checklist as optional authoring guidance. Do not invent a built-in markdownlint replacement. |
| [markdown-mermaid](../../skills/markdown-mermaid/SKILL.md) | Optional | Preserve semantic palette/layout and renderer pitfalls; native preview is not the whole contract. |
| [markdown-sanitization-chain](../../skills/markdown-sanitization-chain/SKILL.md) | Optional | Keep application-level sanitization order and tests; agent sandboxing does not sanitize an adopter's website. |
| [md-to-eml](../../skills/md-to-eml/SKILL.md) | Optional | Preserve RFC/MIME/CID conversion behavior where email export is needed. |
| [md-to-html](../../skills/md-to-html/SKILL.md) | Optional | Preserve standalone HTML and embedded-resource output. |
| [md-to-txt](../../skills/md-to-txt/SKILL.md) | Optional | Keep only where consistent conversion options/output matter; trivial prose stripping needs no mandatory workflow. |
| [md-to-word](../../skills/md-to-word/SKILL.md) | Optional | Preserve DOCX styling and Mermaid/SVG post-processing. |
| [meditation](../../skills/meditation/SKILL.md) | Thin | Use native history as evidence, but preserve explicit authority for reconciling actual project records. |
| [mutation-testing](../../skills/mutation-testing/SKILL.md) | Keep | Preserve isolated fault injection/counter-tests; test generation is not mutation detection. |
| [plan](../../skills/plan/SKILL.md) | Migrate | Native Plan becomes default. Keep a short optional project-plan contract; remove mandatory full code, fixed task durations, and forced repository plan files. |
| [platform-awareness](../../skills/platform-awareness/SKILL.md) | Migrate | Replace static release/tool-name catalogs with live discovery and official sources; retain only reproduced host-specific exceptions. |
| [print-svg-style-guide](../../skills/print-svg-style-guide/SKILL.md) | Optional | Preserve print geometry, role markers, supported-input floor checks, and publication standards. |
| [proactive-awareness](../../skills/proactive-awareness/SKILL.md) | Thin | Use native recovery/history where appropriate; keep authoritative project-record recovery and nonintrusive consent rules. |
| [problem-framing-audit](../../skills/problem-framing-audit/SKILL.md) | Keep | Preserve non-coding and symptom/cause framing beyond implementation planning. |
| [project-capability-authoring](../../skills/project-capability-authoring/SKILL.md) | Thin | Use native drafting where available; retain evidence of need, prior art, local scope, approval, and tests. |
| [render-verify](../../skills/render-verify/SKILL.md) | Keep | Preserve meaning/prose/data verification and failure catalogs; use native browser access as transport. |
| [replicate-imagery](../../skills/replicate-imagery/SKILL.md) | Optional | Retain only for the chosen provider/model workflow. A session image tool is not proof of universal replacement. |
| [rich-email](../../skills/rich-email/SKILL.md) | Optional | Preserve validated unsent New Outlook draft behavior; no-send is not replaced by generic writing assistance. |
| [risk-analysis](../../skills/risk-analysis/SKILL.md) | Keep | Preserve project-specific impact/likelihood/approval routing without standing usage ledgers. |
| [security-and-hardening](../../skills/security-and-hardening/SKILL.md) | Optional | Keep design-time application-security guidance separately from native defect review. |
| [setup-dependencies](../../skills/setup-dependencies/SKILL.md) | Keep | Preserve tool probes, reviewed pins, metadata parity, and smoke tests; make browser fallback conditional. |
| [setup-enterprise-stack](../../skills/setup-enterprise-stack/SKILL.md) | Optional | Keep ecosystem curation, scope, and consent; native marketplace controls own installation mechanics. |
| [spike](../../skills/spike/SKILL.md) | Thin | Native tools/workspaces supply mechanics; retain disposable experiments, measured evidence, and explicit verdicts. |
| [status-reporting](../../skills/status-reporting/SKILL.md) | Optional | Keep stakeholder structure and tracker-backed metrics beyond a native session recap. |
| [svg-banner](../../skills/svg-banner/SKILL.md) | Optional | Keep the deterministic branded artifact for users who want it. |
| [systematic-debugging](../../skills/systematic-debugging/SKILL.md) | Thin | Preserve hypothesis-first investigation, regression evidence, and per-bug escalation; use native run/fix/test mechanics. |
| [terminal-command-safety](../../skills/terminal-command-safety/SKILL.md) | Thin | Preserve reproduced shell/platform hazards only; discover current lifecycle/permission controls. |
| [test-driven-development](../../skills/test-driven-development/SKILL.md) | Thin | Preserve the deliberate RED-GREEN-REFACTOR policy and carve-outs in a short workflow. |
| [token-waste-elimination](../../skills/token-waste-elimination/SKILL.md) | Keep | Preserve source-instruction redundancy measurement and semantic preservation; compaction solves a different problem. |

## 4. Implementation sequence

Each task below is a bounded change group, not a promised duration. Code or
behavior changes follow RED -> GREEN -> preservation review. Do not introduce
new dependencies merely to execute this plan; use the existing Node suite and
available diagnostics.

```text
T0 baseline -> T1 compatibility fixtures
T1 -> T2 native routing -> T3a canonical workflow consolidation
T3a -> T3 resident policy thinning
T0 -> T4 specialist/reference split
T1 -> T5 activation delivery pilot -> T6 release migration
T3a + T4 -> T7 entrypoint consolidation
T3 + T4 + T6 + T7 -> T8 optional-pack decision
T2 + T3 + T4 + T6 + T7 -> T9 release validation
T8 -> T9 only if a physical package split is approved for this release
```

### T0. Preserve the current baseline

**Files:** existing changed files, [tests/deterministic-helpers.test.cjs](../../tests/deterministic-helpers.test.cjs), [manifest.json](../../manifest.json).

1. Inventory the dirty worktree and separately identify the preceding helper and
   telemetry changes. Do not revert, stash, stage, or commit them implicitly.
2. With implementation approval, include those changes in the candidate under
   test. Use an owner-approved checkpoint if one is needed before migration.
3. Verify `node --test` and `git diff --check` on that candidate. Record actual
   counts/output; do not assume the earlier passing count applies after edits.
4. Keep release validation on a fresh packaged candidate or approved commit, not
   a clean clone of the old baseline that omits the fixes.

**Exit:** the preservation boundary and recoverable baseline are explicit.

### T1. Establish client contracts in disposable fixtures

**Files:** proposed `tests/native-compatibility.test.mjs`; extend [activation-readiness.test.mjs](../../tests/activation-readiness.test.mjs) only where it shares existing helpers.

1. Add failing fixture tests for native-format structure, rule-source discovery,
   command/resource resolution, no duplicate activation, and unchanged adopter
   files. Include instruction-triggered loading, explicit prompt invocation with
   arguments, should-not-fire cases, missing skills/references, and links from
   activated instruction copies. Seed wrong paths/metadata so these tests
   demonstrably fail.
2. Test the smallest supported legacy rule-delivery candidate first. Compare an
   Agent Plugins 1.0 candidate only if necessary. Do not prescribe an unverified
   rule suffix/frontmatter format in production.
3. Record client version, harness, relevant policy, exact input, discovered
   source, observed behavior, and cleanup. Separate discovery from actual
   inclusion and effectiveness.
4. Run live probes only in disposable profiles/workspaces with explicit consent.
   The installed CLI supports `--plugin-dir <directory>`,
   `copilot skill list`, and `copilot instruction list --json`; help for the last
   command explicitly excludes host-projected instructions. It cannot certify
   what the VS Code host injected.
5. Do not call a live LLM behavior test a deterministic unit test. Keep automated
   structural assertions and bounded manual/client observations distinct.

**Exit:** a per-client pass/fail/unverified matrix exists. Failure means keep the
legacy path, not relax the acceptance criteria.

### T2. Make planning, review, browser, and session routing native-first

**Files:** [plan](../../skills/plan/SKILL.md), [platform-awareness](../../skills/platform-awareness/SKILL.md), [browser-tools](../../skills/browser-tools/SKILL.md), [code-review](../../skills/code-review/SKILL.md), [deep-review](../../skills/deep-review/SKILL.md), [adversarial-review](../../skills/adversarial-review/SKILL.md), [render-verify](../../skills/render-verify/SKILL.md), [proactive-awareness](../../skills/proactive-awareness/SKILL.md), [terminal-command-safety](../../skills/terminal-command-safety/SKILL.md).

1. Write failing route/scenario tests for a routine plan, small review, large
   isolated review, native browser success, native browser unavailable, and a
   context-recovery request.
2. Rewrite the owners as short adapters: native facility, retained ACT contract,
   failure/unsupported path, and optional fallback.
3. Remove compulsory repository plan-file creation and large prewritten code
   requirements. Preserve a plan file when the user explicitly requests one.
4. Preserve explicit user-requested independent review, but do not infer that
   every review needs a subagent or a fixed model.
5. Keep `alex-playwright` registered and provisionable during this phase. Do not
   silently install it or remove it based on native-browser existence alone.
6. Revise the obsolete README/browser/console claims identified in F16, with
   tested host/version scope. The resolver workaround becomes conditional until
   a fresh packaged-skill probe passes; do not change user settings here.

**Tests:** extend [activation-routing.test.mjs](../../tests/activation-routing.test.mjs) and [smoke.test.mjs](../../tests/smoke.test.mjs); use T1 fixtures for live-only behavior.

**Exit:** no hardcoded native-tool/model tutorial is required for basic routing,
and specialized verification or approval is not lost.

### T3a. Consolidate canonical workflows before thinning their callers

**Files:** the canonical owners and existing callers in the consolidation table;
their selectively loaded references; [activation-routing.test.mjs](../../tests/activation-routing.test.mjs), [smoke.test.mjs](../../tests/smoke.test.mjs), and [brain-tools.test.cjs](../../tests/brain-tools.test.cjs). The new conversion dispatcher is implemented in T7, not duplicated here.

1. Compare each candidate's trigger, inputs, authority, procedure, stop
   conditions, and result. Record true duplication separately from conflicting
   or domain-specific rules. Preserve the ACT canon and resolve material
   procedure disagreements before moving content.
2. Write failing route/preservation tests for the original entrypoints and the
   proposed modes. Include a should-not-fire case and a case that must retain
   its narrower permission or coverage boundary.
3. Consolidate ACT procedure details into critical-thinking with selectively
   loaded methods/references; leave essential instruction floors resident.
   Consolidate deep-review execution under code-review without turning general
   critique into code-only review or requiring a fixed agent topology.
4. Put repeated read-only recovery under proactive-awareness. Reuse it from
   status, session-health routing, and meditation's read phase; do not let
   invoking it inherit meditation's record-write permission.
5. Extract common claim-distillation under big-idea and shared authoring
   mechanics under compile-brain. Preserve chart-specific output and
   capability-extraction prerequisites as explicit specializations.
6. Route old names to their selected owner/mode, with no second implementation.
   Verify installed-package reference resolution and avoid cyclic loading:
   an owner must not load an alias that immediately loads the owner again.

**Acceptance cases:** general decision critique does not require a code diff;
ordinary review does not load every deep-review method; chart framing still
produces the Chart Brief; capability extraction still requires demonstrated
need and approval; read-only project recovery changes no records; a corpus
request cannot be satisfied by inspecting one artifact.

**Exit:** each consolidated procedure has one authoritative implementation,
preserved specializations and aliases, resolved conflicts, and explicit
permission/coverage boundaries. This does not create packages or authorize
removing independently useful workflows.

### T3. Thin resident instructions and engineering essays

**Files:** all fifteen instructions in section 3.1 for routing/preservation review, prioritizing the seven Thin rows; their matching [governance references](../../instructions/references) and existing owning skills; [bootstrap-project](../../skills/bootstrap-project/SKILL.md), [git-workflow](../../skills/git-workflow/SKILL.md), [meditation](../../skills/meditation/SKILL.md), [project-capability-authoring](../../skills/project-capability-authoring/SKILL.md), [spike](../../skills/spike/SKILL.md), [systematic-debugging](../../skills/systematic-debugging/SKILL.md), [test-driven-development](../../skills/test-driven-development/SKILL.md), [install-visual-companions](../../skills/install-visual-companions/SKILL.md).

1. Build an invariant checklist before shortening each owner. Distinguish tool
   operating instructions from deliberate project policy.
2. Extend preservation tests first for approval, uncertainty, silence, memory
   scope, terminal quoting, per-bug retry evidence, and RED-before-implementation.
3. Keep each instruction's trigger, should-not-fire conditions, essential
   guardrails, and authority limits. Explicitly require skill loading when the
   trigger fires; move execution, validation details, and information to the
   owning skill or its references. Remove duplication and stale host guidance,
   not the guard being routed.
4. Leave optional voice/nudge behavior present until an owner-approved packaging
   decision. Preserve shared inhibition floors regardless of optional features.
5. Measure source/draft reduction using the existing helpers; manually test a
   should-fire and should-not-fire case. Report source-size reduction as source
   size, not actual token/latency savings.

**Tests:** [smoke.test.mjs](../../tests/smoke.test.mjs), [activation-routing.test.mjs](../../tests/activation-routing.test.mjs), [brain-tools.test.cjs](../../tests/brain-tools.test.cjs), and [deterministic-helpers.test.cjs](../../tests/deterministic-helpers.test.cjs).

**Exit:** retained policies have one clear owner and no caller depends on a
removed optional file. Required skill loading is observable, and source,
installed-package, and activated-copy routes all work without an adopter
checkout.

### T4. Split long specialist references without replacing their contracts

**Files:** [humanizer/SKILL.md](../../skills/humanizer/SKILL.md), its [examples](../../skills/humanizer/examples), proposed `skills/humanizer/references/pattern-catalog.md`; [code-review](../../skills/code-review/SKILL.md) and proposed `skills/code-review/references/advanced-audits.md`.

1. Add failing link/preservation tests before extracting content.
2. Keep Humanizer's route selection, source/false-positive boundary, audit-only
   behavior, voice precedence, Copywriter taxonomy, and approval gate in its
   entrypoint. Move the detailed pattern catalog/examples only where explicit
   links load them at the right step.
3. Preserve pattern identities, attribution, source-comparison obligations,
   internal anchors, script paths, and mode-specific output shapes. Inspect
   remaining cross-review quality conditions so no standing telemetry is
   introduced by an extraction.
4. Move advanced review checklists to their reference owner; a routine native
   review must not load a NASA/extension audit by default.
5. Validate from an installed-package fixture with no adopter `skills` tree.
   Use audit-only, rewrite, Copywriter approval, supplied voice, no-findings,
   missing-reference, and small-review scenarios.

**Exit:** content remains reachable and behavior-preserved. This task does not
prove that a native writing feature replaces Humanizer.

### T5. Pilot native instruction delivery before changing activation

**Files:** [plugin.json](../../plugin.json), [manifest.json](../../manifest.json), [bootstrap-core](../../skills/bootstrap-core/SKILL.md), [bootstrap-core.cjs](../../skills/bootstrap-core/scripts/bootstrap-core.cjs), [host-readiness.cjs](../../skills/bootstrap-core/scripts/host-readiness.cjs). Candidate-only paths may include `mcp.json`, `com.github.copilot/rules/`, and `com.github.copilot/commands/`.

1. Use T1 results to choose the smallest supported delivery route. Do not edit
   the shipped manifest just to see whether it works.
2. If Agent Plugins 1.0 is selected, inventory every current metadata/component
   mapping and validate against the exact supported schema. Move embedded MCP
   entries to the required envelope; preserve command names/resources.
3. Give instruction content one authoritative source. If adaptation or packaging
   generation is necessary, validate parity; do not hand-maintain two diverging
   copies of the fifteen policies.
4. Verify global versus file-scoped rule activation, enable/disable, removal,
   fresh-session inclusion, and both clients. Do not assume legacy `applyTo`
   syntax is native-rule metadata.
5. Test MCP launch paths from an arbitrary working directory. Preserve pins,
   credential handling, runtime state, and direct launch without install-on-use.
   In particular, keep the current runtime location compatible until a separate
   tested data-location migration exists.
6. Probe Scout/GitHub Copilot app before changing their advertised delivery.
   If unavailable, keep a compatibility distribution/path or stop for an
   explicit support decision; do not silently relabel them unsupported.

**Tests:** T1 fixture suite; [smoke.test.mjs](../../tests/smoke.test.mjs), [activation-readiness.test.mjs](../../tests/activation-readiness.test.mjs), [reinstall-release.test.mjs](../../tests/reinstall-release.test.mjs), [runtime-launcher.mjs](../../skills/setup-dependencies/scripts/runtime-launcher.mjs).

**Exit:** a complete candidate package, not just a schema-valid manifest, passes
the discovery/inclusion/behavior checks and preserves existing integrations.

### T6. Migrate legacy instruction copies safely

**Depends on:** T5 passing on the intended client. Do not remove bootstrap first.

**Files:** [bootstrap-core.cjs](../../skills/bootstrap-core/scripts/bootstrap-core.cjs), [host-readiness.cjs](../../skills/bootstrap-core/scripts/host-readiness.cjs), [reinstall-and-check.ps1](../../reinstall-and-check.ps1), [activation-readiness.test.mjs](../../tests/activation-readiness.test.mjs), [reinstall-release.test.mjs](../../tests/reinstall-release.test.mjs).

1. Write failing tests for unchanged receipt-owned copies, modified copies,
   foreign ownership, malformed receipts, duplicate native/copied activation,
   native delivery failure, and interrupted migration.
2. Preview exact actions and request profile-write/removal consent separately.
3. Remove only unchanged receipt-owned copies after native activation is
   observed. Preserve modified/unowned files and report conflicts explicitly.
4. Ensure a fresh session ends with exactly one intended policy source. Do not
   publish duplicate activation as a normal steady state.
5. Keep a repair/removal compatibility route while old clients/installations
   need it. Preserve a clear rollback path that restores the prior delivery
   with consent and never deletes user-authored files.

**Exit:** upgrade, no-op repeat, failure, and rollback paths preserve authority
and filesystem ownership. Native enablement and legacy cleanup are distinguishable.

### T7. Consolidate entrypoints in two steps

**Files:** the fifteen [prompts](../../prompts), the owning skills in section 3.2, [manifest.json](../../manifest.json), [plugin.json](../../plugin.json), [activation-routing.test.mjs](../../tests/activation-routing.test.mjs). Proposed owners: `skills/convert/SKILL.md`, `skills/render-chart/SKILL.md`, and `skills/project-status/SKILL.md`.

1. Inventory prompt-only behavior, command arguments, output shape, and old
   names. Use the canonical owners selected in T3a rather than treating every
   original skill as a separate behavioral implementation. Write failing
   installed-package route tests.
2. Move the converter dispatcher, chart orchestration, and project checkpoint
   into their proposed owners. Use the existing converters, chart skills, and
   status logic; do not duplicate their scripts.
3. For the twelve Consolidate candidates, transfer unique rules to the owner
   and make the old command a thin alias. Apply the same thin-entrypoint design
   to the three migrated orchestration prompts after their substantive workflow
   has an owner: parse inputs, pass arguments and constraints, load and follow
   the skill, and return its required result. Do not leave a second execution
   or validation procedure in the prompt.
4. Test manual invocation and automatic discovery independently in CLI,
   VS Code Copilot, and any still-advertised Local command path. Record the
   actual command name instead of assuming spaces or colons are interchangeable.
5. Removing alias files is a later release decision, after compatibility and
   documentation updates. Preserve names deliberately used by existing users.

**Exit:** each workflow has one behavioral owner; alias removal is not used as
a shortcut for preserving behavior. Prompt arguments, user constraints, consent
boundaries, missing-dependency behavior, and output shape are preserved. The
final artifact count is recomputed, not inferred from this baseline table.

### T8. Decide optional distribution after dependency closure

**Files:** [manifest.json](../../manifest.json), [plugin.json](../../plugin.json), [README.md](../../README.md), [setup-dependencies](../../skills/setup-dependencies/SKILL.md), [dependencies.cjs](../../scripts/shared/dependencies.cjs), and the Optional rows in section 3.

1. Treat the categories as optional offerings in documentation first. Do not
   turn the organizational families into plugins/repositories, or create an
   invented profile selector or custom feature flag system just to realize the
   classification.
2. Prepare a small dependency map: writing gate -> Humanizer, rich-email ->
   converter/launcher, chart orchestrator -> chart/theme/render verification,
   native activation -> retained policy sources, and scripts -> shared helpers.
3. Ask the owner to choose: one on-demand distribution, or separately installable
   packs. State the actual trade-off: simpler upgrades versus smaller installed
   discovery surface and optional integrations.
4. If separate packs are approved, propose their concrete install mechanism and
   ownership before moving files. Co-locate or explicitly depend on all required
   resources, shared scripts, and consent gates. Do not assume a native
   intra-plugin dependency/profile mechanism that has not been verified.
5. Keep the Playwright fallback unless each required scenario passes without it.
   Do not remove Flint, converters, or Replicate merely because native tools
   can display files or generate code/images in some sessions.

**Exit:** an approved dependency-closed distribution decision, or an explicit
decision to retain one package. Optional classification alone changes no files.

### T9. Validate and prepare a release

**Files:** [README.md](../../README.md), [ROADMAP.md](../../ROADMAP.md), [RELEASE-CHECKLIST.md](../../RELEASE-CHECKLIST.md), manifests, affected skill/prompt routes, and existing tests.

1. Run targeted tests for each changed contract before the full suite. Require
   passing, failing, and unsupported cases; do not weaken ownership or routing
   assertions just to accommodate a format change.
2. Run the full suite on the complete candidate and a fresh packaged/committed
   copy. Verify package inclusion, counts, links, dependency pins, and arbitrary
   working-directory launches.
3. Repeat the bounded host checks on the final candidate, not an earlier
   fixture. Mark each host/version/harness as observed or unverified.
4. Update manifest inventory, descriptions, installation commands, version
   identity, readiness reporting, and release checklist together. Choose a
   release version explicitly; do not publish differing bytes under a reused
   release identity.
5. Apply the project's external-copy approval gate to README/release copy.
   Preserve accurate unsupported/preview statements.
6. Commit, push, install, update the marketplace, or migrate a real profile only
   after the corresponding approval. None is a side effect of this plan.

**Exit:** the release demonstrates the advertised package and behavior, or it
remains blocked with a specific unmet gate.

## 5. Verification commands and expected evidence

These existing commands were checked against this repository or installed CLI.
They are instructions for implementation, not a claim that migration tests ran
while writing this document.

```powershell
git status --short --branch
git diff --check
copilot --version
copilot help commands
copilot skill --help
copilot instruction list --help
```

Expected: actual baseline/version/help output; no workspace changes. Instruction
listing is not proof of host-projected inclusion.

```powershell
node --test tests\activation-routing.test.mjs tests\smoke.test.mjs tests\brain-tools.test.cjs tests\deterministic-helpers.test.cjs
node --test tests\activation-readiness.test.mjs tests\reinstall-release.test.mjs
node --test
```

Expected: zero failing tests and no unintended fixture/profile writes. Record the
actual totals; no future test count is promised. After creating the proposed
native fixture suite, run it alongside the relevant targeted selector.

The current release checklist also requires direct pin checks and activation
preview. Adapt these to the approved package format without removing their
underlying checks. Do not install dependencies unless a chosen check reports
them missing and the installation is approved.

### Bounded client acceptance matrix

| Surface | Required cases | Gate |
| --- | --- | --- |
| Rules | Always-on and file-scoped policy; wrong scope; disabled/uninstalled rule; no duplicate copied source | Both target clients; exact metadata/source observed, not merely file existence |
| Instruction/prompt routing | Automatic trigger versus explicit request; should-not-fire case; arguments/constraints; required skill loading; missing skill/reference; activated-copy links | One behavioral owner; essential floors remain active before loading; no passive-link success claim |
| Canonical consolidation | Original aliases select the correct mode; no cyclic loading; general critique without code; chart-specific brief; read-only recovery; capability-creation prerequisites; corpus coverage | Shared mechanics do not broaden authority, weaken coverage, or erase a specialization |
| Planning | Relevant research, clarification, reviewable plan, approval boundary, attempted direct workspace write | Keep external/MCP caveat explicit; no universal sandbox claim |
| Review | Seeded real defect, benign counter-case, no input edits, evidence-scoped report | Required project invariants retained; no mandatory nested review chain |
| Browser | Local app, local artifact, console error, screenshot, measured geometry/style, authenticated-tab consent | Native-first only where supported; fallback remains for failing/unverified scenarios |
| Skills/commands | Owning skill and resources resolve with no adopter skill tree; old aliases and new names | Manual and model invocation are separate checks; skipped/unsupported is not pass |
| Memory/continuity | Durable preference versus temporary task; scope; privacy; recovery of actual project record | No forced cloud/local migration, global write, or usage telemetry |
| Specialist split | Copywriter approval, supplied voice, audit-only no edit, absent reference, converter/chart invariant | Behavior preservation, not arbitrary line reduction |
| Upgrade/rollback | Unchanged owned file, modified owned file, foreign file, malformed receipt, interruption | Explicit consent; preserve bytes and recovery evidence |

## 6. Risks, trade-offs, and open decisions

| Challenge | Consequence | Response |
| --- | --- | --- |
| Documentation is ahead of an installed runtime or feature is policy-blocked | A claimed replacement cannot run | Documented is not observed; retain compatibility until the exact host probe passes |
| Shorter instructions lose an exception or stop condition | Silent behavioral regression | Invariant inventory and should-fire/should-not-fire tests precede cuts |
| Related topics are concatenated into a mega-skill | Higher loading cost, competing rules, and accidental authority expansion | Consolidate only shared procedures under explicit owners; keep modes/references selective and specializations independent |
| A hyperlink is mistaken for execution, or resolves only in the checkout | A required skill is skipped or missing after activation | Explicit load-and-follow wording; missing-dependency reporting; installed-package and activated-copy route tests |
| Native rules coexist with copied user instructions | Duplicated/conflicting policy | Ownership-aware migration and fresh-session single-source check |
| Optional packs leave dangling mandatory routes | Broken workflow after a valid install | Dependency closure before optional removal or physical separation |
| Removing aliases breaks habits or automated invocations | Discoverability/compatibility regression | Thin aliases first; removal only as an explicit release decision |
| Large native/context machinery is recreated inside the pack | More maintenance rather than less | No new framework, profile manager, telemetry service, or generalized adapter layer |
| Native review/browser output is treated as proof of semantics | Wrong result receives a success label | Keep dataset/entity/units/approval and unsupported-input checks outside transport claims |
| Old-host support is dropped implicitly | Published compatibility promise becomes false | Keep a compatibility path or obtain a support decision before changing the promise |

**Adversarial self-review:** Conditional. The strongest case against this plan
is that a packaging overhaul costs more than trimming stale guidance. Therefore
T2-T4 can deliver value without production-format migration; T5-T6 proceed only
if the bounded pilot establishes a simpler reliable route. No external critic
or live replacement benchmark is claimed.

Owner decisions before consequential steps:

1. Minimum supported client/harness versions, and continued Scout/app support.
2. Whether writing/voice behavior is optional by default, including the
   audience-gate dependency.
3. Whether a physical pack split is worth its install/upgrade cost.
4. Which aliases remain intentionally supported.
5. The release version and approval to publish/migrate real installations.

## 7. Definition of done

- Every original artifact has a disposition and retained-contract owner.
- Organizational families are distinguished from actual workflow mergers;
  canonical owners, mode selection, and preserved boundaries are explicit.
- Consolidated procedures have no competing implementations or cyclic routes,
  and material rule conflicts are resolved rather than silently discarded.
- Instructions retain triggers and essential safeguards; prompts retain request
  handling and arguments; skills own execution/validation; references hold
  selectively needed information without hiding mandatory boundaries.
- Required skill loading is explicit, useful aliases are preserved, and routes
  work from activated copies as well as installed packages.
- Native replacement claims identify the tested host/version/harness and scope.
- No policy is retired solely because a similarly named native tool exists.
- Rule migration preserves consent, ownership, modified files, and rollback.
- All mandatory routes resolve in an installed-package fixture.
- Existing helper fixes and semantic-telemetry removal remain covered.
- No unsupported case is reported as success.
- Tests, diagnostics, package checks, and bounded client checks pass on the
  final candidate; blocked checks are named rather than silently waived.
- User-facing documentation describes actual installed/released behavior.
- No token, latency, quality, or reliability improvement is claimed without
  measuring that specific outcome.

## 8. Source ledger

Checked on 2026-11-04. Pinned repository links are used where available so the
documented evidence can be revisited after live docs change. Documentation
snapshots can be newer than the stable executable: that is why live checks
remain release gates, rather than facts claimed complete here.

- [CLI 1.0.105 release][cli-release]: metadata verified with the GitHub Releases API.
- [VS Code 1.145 release][vscode-release]: metadata verified with the GitHub Releases API.
- [CLI command reference][cli-reference]: GitHub Docs revision `38db4f04612250b10df9090ff01be36e03f77ddd`, dated 2026-11-03.
- [CLI plugin reference][cli-plugins]: GitHub Docs revision `8e7396e5e2e02bac9caba10c8d944f938bcd9b52`, dated 2026-10-28.
- [CLI changelog][cli-changelog]: stable feature-introduction entries checked; browser rename 1.0.100, Plan restrictions 1.0.71/1.0.74, non-experimental security review 1.0.64.
- VS Code documentation below was checked against official pages; pinned source revision `062330f5d25b5562103c6322a17b255b645e1e67` is dated 2026-11-04:
  - [Planning][vscode-planning]
  - [Plugin authoring][vscode-plugins]
  - [Skill loading, invocation, and metadata][vscode-skills]
  - [Customization/harness compatibility][vscode-customization]
  - [Browser tools][vscode-browser]
  - [Memory][vscode-memory]
  - [Smart actions, tests, and review][vscode-actions]
- [microsoft/vscode#314772][resolver-issue]: state and closure date verified with the GitHub Issues API.
- Local facts were checked in [plugin.json](../../plugin.json), [manifest.json](../../manifest.json), [README.md](../../README.md), the linked artifact owners, [tests](../../tests), and read-only CLI help/version output.

[cli-release]: https://github.com/github/copilot-cli/releases/tag/v1.0.105
[vscode-release]: https://code.visualstudio.com/updates/v1_145
[cli-reference]: https://github.com/github/docs/blob/38db4f04612250b10df9090ff01be36e03f77ddd/content/copilot/reference/copilot-cli-reference/cli-command-reference.md
[cli-plugins]: https://github.com/github/docs/blob/8e7396e5e2e02bac9caba10c8d944f938bcd9b52/content/copilot/reference/copilot-cli-reference/cli-plugin-reference.md
[cli-changelog]: https://github.com/github/copilot-cli/blob/main/changelog.md
[vscode-planning]: https://github.com/microsoft/vscode-docs/blob/062330f5d25b5562103c6322a17b255b645e1e67/docs/agents/run/planning.md
[vscode-plugins]: https://github.com/microsoft/vscode-docs/blob/062330f5d25b5562103c6322a17b255b645e1e67/docs/agents/reference/agent-plugin-reference.md
[vscode-skills]: https://github.com/microsoft/vscode-docs/blob/062330f5d25b5562103c6322a17b255b645e1e67/docs/agent-customization/agent-skills.md
[vscode-customization]: https://github.com/microsoft/vscode-docs/blob/062330f5d25b5562103c6322a17b255b645e1e67/docs/agent-customization/overview.md
[vscode-browser]: https://github.com/microsoft/vscode-docs/blob/062330f5d25b5562103c6322a17b255b645e1e67/docs/agents/run/browser-tools.md
[vscode-memory]: https://github.com/microsoft/vscode-docs/blob/062330f5d25b5562103c6322a17b255b645e1e67/docs/agents/run/memory.md
[vscode-actions]: https://github.com/microsoft/vscode-docs/blob/062330f5d25b5562103c6322a17b255b645e1e67/docs/editing/copilot-smart-actions.md
[resolver-issue]: https://github.com/microsoft/vscode/issues/314772
