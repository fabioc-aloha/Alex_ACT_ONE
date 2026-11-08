> Historical recovery; not current certification or an active issue list.
> See [current change history](../../../../../CHANGELOG.md).

# Copilot native-feature replacement audit

Date: 2026-11-04

Scope: GitHub Copilot CLI and GitHub Copilot in VS Code. No repository files,
installed customizations, settings, or plugins were changed by this audit.

## Conclusion

Use Copilot for the machinery; retain ACT for the decisions, standards, and
specialized outputs that the machinery does not specify.

The pack should not present all 90 artifacts as equally necessary Core.
Native planning, review agents, browsers, memory, session management, skill
invocation, and plugin rules materially reduce the need for custom machinery.
They do not automatically replace ACT's reasoning contract, publication approval,
domain standards, or tested converters.

| Recommendation | Instructions | Prompts | Skills | Total |
| --- | ---: | ---: | ---: | ---: |
| Keep | 5 | 0 | 14 | 19 |
| Thin | 7 | 0 | 14 | 21 |
| Optional | 3 | 0 | 29 | 32 |
| Consolidate | 0 | 12 | 0 | 12 |
| Migrate | 0 | 3 | 3 | 6 |
| Total | 15 | 15 | 60 | 90 |

These are recommendations, not authorization to delete artifacts. In particular,
the 12 consolidation candidates are not 12 complete workflows made obsolete by
Copilot. They are separate entrypoints whose owning skills can carry the work.

## Baseline and evidence limits

- Latest stable CLI verified through GitHub Releases: **1.0.105**, published
  **2026-10-28 UTC**; its changelog entry is dated 2026-10-27. The installed CLI
  also reports 1.0.105. [R1]
- Latest CLI prerelease found: **1.0.106-9**, published 2026-11-04. It is not the
  replacement baseline. [R3]
- Latest stable VS Code verified through its release API and release notes:
  **1.145.0**, released **2026-11-04**. The installed editor version was not
  inspected. [R2]
- VS Code's **Copilot** and **Local** harnesses are not interchangeable. Memory,
  prompt files, subagent configuration, and customization locations differ. [V5]
- VS Code `/research` is documented as an **Insiders preview**. Marketplace
  browsing, repository-local memory, and terminal sandboxing also have
  feature-specific preview/experimental qualifications. None is assumed
  universally available merely because it appears in current documentation.
  [V1], [V4], [V5], [V8]
- All 90 manifest entrypoints were inventoried from the current checkout,
  including the preceding local fixes. Retirement-sensitive candidates and
  nontrivial prompt workflows were inspected beyond their names.
- This is a declared-contract and documentation audit, not a live benchmark of
  90 workflows. Feature availability is better established than complete
  behavioral equivalence. No mandatory retirement is claimed from similarity
  of names or from an unsuccessful search.
- "Keep" means no equivalent replacement for the artifact's particular contract
  was established here. It does not prove that the artifact improves every task.
- "Optional" means specialization or product preference, not broken content and
  not a claim that the native model cannot perform the task.

## Decision meanings

| Decision | Meaning |
| --- | --- |
| Keep | Retain the distinct policy, standard, or deterministic capability. Keep skills on demand, not automatically always loaded. |
| Thin | Delegate mechanics to native features; retain only the missing contract, safety boundary, or project convention. |
| Optional | Move out of mandatory Core into an opt-in domain, craft, integration, or voice pack. |
| Consolidate | Prefer the owning skill's native invocation; preserve prompt-only rules and intentionally supported aliases before removing the wrapper. |
| Migrate | A native mechanism or more portable native format is the right target, but compatibility or behavior must be validated before retirement. |

## Native features that change the assessment

| Capability | Copilot CLI | VS Code | Important limit |
| --- | --- | --- | --- |
| Planning | `/plan`; built-in tools that clearly mutate workspace files are blocked. [C1] | Plan agent, plan review, approval, and implementation controls. [V1] | CLI documentation explicitly excludes an airtight guarantee: ambiguous shell commands and connected external/MCP tools can escape the planning safety net. |
| Code review | `/review`, read-only `code-review`, and `security-review`; complementary-model `rubber-duck`. [C1] | Native code-review actions and harness-dependent isolated subagents. [V2], [V9] | A review command does not promise ACT's output shape, NASA checklist, or domain-specific invariants. |
| Browser verification | A built-in browser plugin is documented in the stable changelog; renamed `browser-use` in 1.0.100. [C4] | Built-in navigation, screenshots, interactions, console errors, and Playwright code; no external MCP server required. [V3] | CLI browser parity for every local-file, console, and permission scenario was not tested. |
| Context and continuity | `/context`, `/compact`, automatic compaction, `/resume`, memory, and session-history tools. [C1], [C3], [C4] | Native session/context controls; Copilot Memory or Local memory files depending on harness. [V4], [V8] | Durable repository task/handoff records are a separate project convention. Cloud memory is not a task backlog. |
| Skill invocation | Native skill discovery and invocation. [C1] | Progressive skill loading and skill slash commands. [V6] | Loading a skill is not evidence that its requirements were followed. |
| Plugin instructions | Agent Plugins format has Copilot-specific rules under `com.github.copilot/rules/`. [C2] | Plugin-provided custom instructions are documented as rules. [V7] | The current legacy manifest does not acquire these semantics automatically. |
| Project initialization | `/init` generates repository guidance and agentic setup. [C1] | Native custom-instruction creation and customization UI. [V5] | Neither establishes the pack's exact additive settings and preservation contract by default. |
| Skill creation and session analysis | `/chronicle`, including documented skill-proposal commands and instruction improvement. [C1], [C3], [C4] | Native skill/customization authoring and session features; precise controls depend on harness. [V4], [V5], [V6] | Do not activate usage monitoring or behavioral scoring as a replacement for the telemetry intentionally removed from this project. |

## Instructions: all 15

These are decisions about resident policy, not suggestions to replace custom
standards with a generic statement that "Copilot is smart enough."

| Artifact | Decision | Native coverage and remaining value |
| --- | --- | --- |
| [act-pass](../../../../../instructions/act-pass.instructions.md) | Keep | Native Plan and review provide execution surfaces, not the seven-step materiality/alternatives/disconfirmation contract. Keep one canonical procedure. [C1], [V1] |
| [alex-finch-personality](../../../../../instructions/alex-finch-personality.instructions.md) | Optional | Identity and voice are product choices, not a missing platform capability. A concise user instruction can express them; do not make a branded personality mandatory for engineering users. [V5] |
| [audience-copy-review](../../../../../instructions/audience-copy-review.instructions.md) | Keep | Native rewriting does not establish the named-audience, six-tag, before/after, approval-before-application contract. Retain the gate if this is a product promise. [V5], [V6] |
| [critical-thinking](../../../../../instructions/critical-thinking.instructions.md) | Thin | Keep a short route to the reasoning skill; remove protocol duplication with act-pass and problem-framing. Native Plan is useful infrastructure, not an equivalent reasoning standard. [V1] |
| [emotional-intelligence](../../../../../instructions/emotional-intelligence.instructions.md) | Optional | Tone adaptation can be a short voice preference. The full affect-detection policy is an experience choice, not a demonstrated missing native feature. [V5] |
| [epistemic-calibration](../../../../../instructions/epistemic-calibration.instructions.md) | Keep | Native research, citations, tools, and test loops help, but do not define ACT's evidence-scoped completion claims and deterministic/semantic boundary. [C1], [V8] |
| [lint-discipline](../../../../../instructions/lint-discipline.instructions.md) | Thin | Native Problems, code actions, and test/fix loops supply mechanics. Preserve the desired ownership and escalation policy in a few rules; the lint provider remains a separate dependency. [V2] |
| [no-deferred-debt](../../../../../instructions/no-deferred-debt.instructions.md) | Thin | Replace broad task-expansion pressure with a scoped completion/escalation rule. Native agents can fix issues, but do not justify unrelated repairs or silently expanded authority. [V1], [V8] |
| [pii-memory-filter](../../../../../instructions/pii-memory-filter.instructions.md) | Thin | Use native memory controls, scopes, retention, and deletion mechanisms. Keep a short privacy guard covering every write boundary; update obsolete memory-file assumptions for each harness. [V4] |
| [problem-framing-audit](../../../../../instructions/problem-framing-audit.instructions.md) | Keep | Native planning clarifies requirements, but the explicit symptom/cause reframe and permission to change the problem are distinctive ACT behavior beyond coding plans. [V1] |
| [reliance-nudges](../../../../../instructions/reliance-nudges.instructions.md) | Optional | Permissions and review UI already supply intervention points. Behavioral nudges are an opt-in experience policy; retain silence/inhibition constraints if enabled. [V8] |
| [session-health-monitoring](../../../../../instructions/session-health-monitoring.instructions.md) | Thin | Native token/context displays, compaction, memory, and resume replace most window-health machinery. Keep only the explicit repository-continuity convention and permission boundaries. [C1], [C3], [V4], [V8] |
| [system-prompt-skepticism](../../../../../instructions/system-prompt-skepticism.instructions.md) | Keep | A native planning or review feature does not implement ACT's precondition audit. Preserve it as reasoning discipline within applicable authority and safety boundaries. [C1], [V1] |
| [terminal-command-safety](../../../../../instructions/terminal-command-safety.instructions.md) | Thin | Native command safety, permissions, output capture, and sandboxing replace host-mechanism narration. Retain tested shell-quoting and safe temporary-file rules; sandboxing does not fix quoting. [C1], [V8] |
| [worldview](../../../../../instructions/worldview.instructions.md) | Thin | Native security/permissions remain the enforcement layer. Keep only ACT-specific ethical decision boundaries and a route to ethical-reasoning; generic refusal prose is not an implemented security control. [C1], [V8] |

## Prompts: all 15

Native skill invocation can remove an extra entrypoint, not its workflow.
There are three substantive dispatch/orchestration prompts that must not be
treated as empty wrappers.

VS Code's standalone prompt-file feature is Local-harness-specific. This pack's
legacy plugin `commands` are a separate compatibility path: that limitation does
not prove its existing commands are broken. Verify both invocation paths during
a migration. [V5], [C2]

| Artifact | Decision | Native replacement or preservation requirement |
| --- | --- | --- |
| [assess-brain](../../../../../prompts/assess-brain.prompt.md) | Consolidate | Invoke assess-brain as a native skill; preserve explicit target selection and the read-only analyzer boundary. [C1], [V6] |
| [banner](../../../../../prompts/banner.prompt.md) | Consolidate | Invoke svg-banner; preserve any prompt-only output/brand options before removing the alias. This does not replace the generator with a native banner product. [V6] |
| [bootstrap-core](../../../../../prompts/bootstrap-core.prompt.md) | Consolidate | Direct skill invocation can replace the wrapper. Retirement of the underlying activation workflow depends on the native-rule migration below. [C2], [V6] |
| [bootstrap-project](../../../../../prompts/bootstrap-project.prompt.md) | Consolidate | Invoke the slim project-setup skill; retain preview, additive merging, and explicit repository consent. [V6] |
| [compile-brain](../../../../../prompts/compile-brain.prompt.md) | Consolidate | Invoke compile-brain; preserve explicit input selection, no silent writes, and the behavior-preservation receipt. [V6] |
| [convert](../../../../../prompts/convert.prompt.md) | Migrate | This is a real multi-format dispatcher, not a single-skill wrapper. Make it an optional portable dispatcher skill or supported client command. Preserve format selection, ambiguity handling, and output validation. [C2], [V5], [V6] |
| [critical-thinking](../../../../../prompts/critical-thinking.prompt.md) | Consolidate | Native skill invocation can carry the explicit ACT pass. Move any prompt-only marker/output requirements into its owner first. [V6] |
| [install-visual-companions](../../../../../prompts/install-visual-companions.prompt.md) | Consolidate | Invoke the native-first companion skill only when an extra integration is actually needed; do not install a browser stack just to reproduce built-in VS Code tools. [V3], [V6] |
| [meditate](../../../../../prompts/meditate.prompt.md) | Consolidate | Invoke meditation; preserve its explicitly authorized project-record reconciliation. `/chronicle improve` alone is not that workflow. [C3], [V6] |
| [problem-framing-audit](../../../../../prompts/problem-framing-audit.prompt.md) | Consolidate | Invoke the framing skill; retain the explicit user-facing reframe/approval contract. [V6] |
| [render-chart](../../../../../prompts/render-chart.prompt.md) | Migrate | Preserve as an optional orchestration skill: chart brief, one semantic truth layer, alternative treatments, Flint/theme selection, render, compare, and verify. Native browsers replace transport, not this workflow. [V3], [V6] |
| [rich-email](../../../../../prompts/rich-email.prompt.md) | Consolidate | Invoke rich-email; ensure draft-only behavior, validation, recipient confirmation, and no-send boundaries survive consolidation. [V6] |
| [setup-dependencies](../../../../../prompts/setup-dependencies.prompt.md) | Consolidate | Invoke setup-dependencies; native plugin installation does not inspect Pandoc or reproduce pinned runtime validation. [C2], [V6] |
| [setup-enterprise](../../../../../prompts/setup-enterprise.prompt.md) | Consolidate | Invoke optional setup-enterprise-stack; preserve emit/install/audit modes and chosen scope. Native marketplace controls own installation mechanics. [C2], [V7] |
| [status](../../../../../prompts/status.prompt.md) | Migrate | Preserve the read-only project checkpoint as a skill or supported native command. `/chronicle standup` covers recent session work, but not necessarily current Git state, authoritative tasks, handoff, or project QA. It is not equivalent to the stakeholder-oriented status-reporting skill. [C3], [V6] |

## Skills: all 60

For Optional rows, both hosts can execute scripts or load skills; that generic
ability is not counted as a product-specific replacement. The remaining value
column states what would be lost if the artifact were simply removed.

| Artifact | Decision | CLI and VS Code coverage; remaining value |
| --- | --- | --- |
| [act-tenets](../../../../../skills/act-tenets/SKILL.md) | Keep | Neither native Plan nor review defines ACT's ten-tenet canon. Keep one on-demand source of the project's reasoning vocabulary. [C1], [V1] |
| [adversarial-review](../../../../../skills/adversarial-review/SKILL.md) | Thin | CLI rubber-duck supplies a native independent critic; VS Code supplies harness-dependent isolated subagents. Keep the choice of adversarial method and stakes gate, not duplicate dispatch machinery. [C1], [V9] |
| [annotate-screenshot](../../../../../skills/annotate-screenshot/SKILL.md) | Optional | Native screenshots capture the source; they do not establish the Pillow annotation, upscaling, supersampling, or legibility contract. Keep in a visual-authoring pack. [V3], [V6] |
| [anti-hallucination](../../../../../skills/anti-hallucination/SKILL.md) | Keep | Native research/tools can supply evidence, but the materiality, independent checker tests, and unsupported-input rules remain custom. Keep concise and consistent with resident calibration. [C1], [V6] |
| [ascii-chart](../../../../../skills/ascii-chart/SKILL.md) | Optional | No equivalent fixed-width ASCII rendering/checking contract was established. Preserve its deterministic layout helpers if terminal reporting is in scope. [C1], [V6] |
| [assess-brain](../../../../../skills/assess-brain/SKILL.md) | Keep | Native `/init` and customization editors are not the read-only artifact/route/cost analyzer with immutability verification. [C1], [V5] |
| [big-idea](../../../../../skills/big-idea/SKILL.md) | Optional | Native writing assistance does not specify this distillation/removal test. Keep as an editorial specialization rather than invoking a long writing protocol for every engineering summary. [V6] |
| [bootstrap-core](../../../../../skills/bootstrap-core/SKILL.md) | Migrate | Native plugin rules are the target in both clients. Current legacy packaging and existing receipt-owned user files require a staged migration; do not delete the helper first. [C2], [V7] |
| [bootstrap-project](../../../../../skills/bootstrap-project/SKILL.md) | Thin | Use `/init` or native customization creation for generic guidance. Retain only the pack's additive settings, existing-file preservation, and optional project-continuity scaffold. [C1], [V5] |
| [browser-tools](../../../../../skills/browser-tools/SKILL.md) | Thin | Prefer native browsers: VS Code covers navigation, console errors, screenshots, interactions, and Playwright; CLI has a built-in browser plugin. Retain selection, measurement, consent, and tested fallback rules. [V3], [C4] |
| [chart-big-idea](../../../../../skills/chart-big-idea/SKILL.md) | Optional | A native browser or coding agent does not define the audience, intended claim, analytical denominator, and style-stance brief. [V3], [V6] |
| [chart-interpretation](../../../../../skills/chart-interpretation/SKILL.md) | Optional | Native visual understanding is an input capability, not this chart-reading/deception-analysis method. Treat as a reusable specialist guide. [V6] |
| [chart-vocabulary](../../../../../skills/chart-vocabulary/SKILL.md) | Optional | Retain the communication-goal taxonomy and chart-selection constraints only for visualization users; no equivalent native catalog was verified. [V6] |
| [code-review](../../../../../skills/code-review/SKILL.md) | Thin | Default ordinary reviews to CLI `/review`/code-review or VS Code review actions. Keep project-specific review contracts; move NASA/extension-audit material to optional references. [C1], [V2] |
| [communication-craft](../../../../../skills/communication-craft/SKILL.md) | Optional | Audience/SBI/needs-elicitation frameworks are editorial choices, not missing native tools. Keep on demand for the users who want that method. [V6] |
| [compile-brain](../../../../../skills/compile-brain/SKILL.md) | Keep | Native instruction/skill authoring is adjacent. It does not establish behavior inventories, semantic preservation, intended-destination links, reduction gates, and authority boundaries. [V5], [V6] |
| [corpus-qa-sweep](../../../../../skills/corpus-qa-sweep/SKILL.md) | Keep | Native agents can run checks, but the complete-corpus/output-boundary contract is not supplied by a single browser or code-review action. [V3], [V8] |
| [critical-thinking](../../../../../skills/critical-thinking/SKILL.md) | Keep | Native Plan/research are tools for investigation; the substantive alternatives/evidence/disconfirmation method remains the product's core. [C1], [V1] |
| [deep-review](../../../../../skills/deep-review/SKILL.md) | Thin | Native isolated reviewers and rubber-duck replace custom execution scaffolding. Keep optional perspective prompts/synthesis rules; do not force three agents on evidence that fits one review. [C1], [V9] |
| [doc-hygiene](../../../../../skills/doc-hygiene/SKILL.md) | Keep | Generate Docs is not document/code consistency checking, historical-vs-living classification, or stale-count prevention. Keep the anti-drift contract, using executable checks where appropriate. [V2] |
| [docs-shell](../../../../../skills/docs-shell/SKILL.md) | Optional | Native Markdown editing/preview and canvases are not the same deployable manifest-driven HTML site. Retain only for users of that shell. [R2], [V6] |
| [docx-to-md](../../../../../skills/docx-to-md/SKILL.md) | Optional | Generic file reading is not a validated Pandoc conversion with extracted images and cleanup. Keep in a document-conversion pack. [V6] |
| [ethical-reasoning](../../../../../skills/ethical-reasoning/SKILL.md) | Optional | Platform security controls are not a moral-tradeoff/privacy-by-design framework. Retain on demand for consequential design work. [C1], [V8] |
| [evaluate-before-adopting](../../../../../skills/evaluate-before-adopting/SKILL.md) | Keep | Native marketplaces manage discovery/trust/installation, not payload correctness or fit. Official VS Code guidance itself separates trust from review and discovery from effectiveness. [V5], [V7] |
| [figure-generator](../../../../../skills/figure-generator/SKILL.md) | Optional | Native coding/image/browser capabilities do not define deterministic dataset-backed SVG generation, provenance hashes, or regeneration contracts. [V3], [V6] |
| [flint-chart](../../../../../skills/flint-chart/SKILL.md) | Optional | Native tools can display artifacts, but do not replace Flint's ChartAssemblyInput, backend mappings, and analytical selection rules. Keep with its external integration. [V6], [V7] |
| [flint-theme](../../../../../skills/flint-theme/SKILL.md) | Optional | Generic styling is not the Flint ThemeSpec contract or its cross-chart verification. Keep only with Flint. [V6], [V7] |
| [git-workflow](../../../../../skills/git-workflow/SKILL.md) | Thin | Native Git UI, commit-message generation, diffs, and agent shell tools cover common mechanics. Preserve explicit approval and recovery cautions; AI conflict resolution remains Experimental in VS Code. [V2] |
| [html-to-md](../../../../../skills/html-to-md/SKILL.md) | Optional | Keep the actual converter where users need its output contract. Native browser reading is not equivalent to producing a validated Markdown file. [V3], [V6] |
| [humanizer](../../../../../skills/humanizer/SKILL.md) | Optional | Keep for users who want its named-audience taxonomy, author-voice preservation, candidate/semantic distinction, and approval table. Native rewriting does not establish those rules. Split the long catalog into references rather than treating its entire body as generally necessary. [V5], [V6] |
| [install-visual-companions](../../../../../skills/install-visual-companions/SKILL.md) | Thin | Native browsers and plugin management replace much default setup. Keep a short, consent-gated path to genuinely missing whiteboard/annotation integrations; extras should be opt-in. [V3], [V7] |
| [lint-clean-markdown](../../../../../skills/lint-clean-markdown/SKILL.md) | Optional | Prefer an actual configured Markdown linter/formatter and native diagnostics for enforcement. The style checklist can remain optional; native Markdown preview alone does not enforce all markdownlint rules. [V2] |
| [markdown-mermaid](../../../../../skills/markdown-mermaid/SKILL.md) | Optional | Native rendering/preview, where available, does not replace semantic palette rules, layout constraints, or renderer-specific pitfalls. Keep the authoring guide and checks in a visual pack. [V6] |
| [markdown-sanitization-chain](../../../../../skills/markdown-sanitization-chain/SKILL.md) | Optional | Copilot's sandbox or review agent does not sanitize an adopter's web application. Retain the specific rendering/security guidance where that stack is used. [C1], [V8] |
| [md-to-eml](../../../../../skills/md-to-eml/SKILL.md) | Optional | Native prose generation is not RFC 5322/MIME/CID conversion. Keep the converter for email-export users. [V6] |
| [md-to-html](../../../../../skills/md-to-html/SKILL.md) | Optional | Native preview is not the standalone HTML/CSS/embedded-resource output contract. Keep only where that artifact is needed. [V6] |
| [md-to-txt](../../../../../skills/md-to-txt/SKILL.md) | Optional | Simple cases can be requested directly from the agent; retain the tested conversion wrapper only if consistent Pandoc output/options matter. [V6] |
| [md-to-word](../../../../../skills/md-to-word/SKILL.md) | Optional | Native ability to author code does not establish professional DOCX styles, SVG/Mermaid handling, and document post-processing. Keep in the document pack. [V6] |
| [meditation](../../../../../skills/meditation/SKILL.md) | Thin | Native history and `/chronicle improve` cover retrospective inputs. Retain explicitly authorized reconciliation of actual changelog/tasks/handoff/AGENTS records and separate approval for new capabilities. [C3], [V4] |
| [mutation-testing](../../../../../skills/mutation-testing/SKILL.md) | Keep | Generate Tests and automatic test reruns are not mutation testing. Retain isolated mutation/counter-test discipline or adopt a real mutation runner; neither is established by native generation alone. [V2] |
| [plan](../../../../../skills/plan/SKILL.md) | Migrate | Use native Plan as the default. Keep only optional project-specific plan templates/verification constraints. The current skill's compulsory long plans and repository plan-file writes duplicate or fight native planning workflow. [C1], [V1] |
| [platform-awareness](../../../../../skills/platform-awareness/SKILL.md) | Migrate | Replace the static release/tool catalog with native discovery and current official docs. Keep only short, currently reproducible exceptions. The old skill-resolver issue is closed; do not retain its permanent workaround without a fresh probe. [C1], [V5], [I1] |
| [print-svg-style-guide](../../../../../skills/print-svg-style-guide/SKILL.md) | Optional | Native browser verification does not specify print-point floors, print-role markers, palette, or publication geometry. Keep its tested invariant checker and domain rules when printing matters. [V3], [V6] |
| [proactive-awareness](../../../../../skills/proactive-awareness/SKILL.md) | Thin | Native resume/history/memory and CLI goals replace much state discovery. Retain only relevant project-record recovery and nonintrusive consent rules; obsolete `/memories/session/` assumptions are harness-specific. [C1], [C3], [V4] |
| [problem-framing-audit](../../../../../skills/problem-framing-audit/SKILL.md) | Keep | Native Plan does not define the complete non-coding framing method or its symptom/cause distinction. Retain the on-demand method behind the short resident gate. [V1] |
| [project-capability-authoring](../../../../../skills/project-capability-authoring/SKILL.md) | Thin | Use native skill/customization creation, or explicitly requested CLI skill proposals, for drafting. Retain proof-of-need, prior-art search, scope, approval, tests, and privacy boundaries. [C1], [C4], [V6] |
| [render-verify](../../../../../skills/render-verify/SKILL.md) | Keep | Native browsers replace transport, including the old console-access rationale for an extra MCP server in VS Code. Keep semantic/prose coupling, complete-corpus checks, and failure catalogs. [V3] |
| [replicate-imagery](../../../../../skills/replicate-imagery/SKILL.md) | Optional | A provider/model-specific integration. A session exposing an image tool is not proof of a universal CLI/VS Code replacement for Replicate models and account behavior. Retain only if that service/model choice is required. [V6], [V7] |
| [rich-email](../../../../../skills/rich-email/SKILL.md) | Optional | Native writing assistance is not validated MIME plus a Windows New Outlook unsent-draft launcher. Keep only for that output workflow and preserve no-send boundaries. [V6] |
| [risk-analysis](../../../../../skills/risk-analysis/SKILL.md) | Keep | Native Plan can discuss risks, but does not impose this project's likelihood/impact/approval routing. Keep a concise decision contract, not usage tracking. [V1] |
| [security-and-hardening](../../../../../skills/security-and-hardening/SKILL.md) | Optional | Native security-review detects likely defects; it does not replace design-time OWASP guidance, trust-boundary reasoning, or application security tests. Move the general handbook out of mandatory Core. [C1] |
| [setup-dependencies](../../../../../skills/setup-dependencies/SKILL.md) | Keep | Native plugin installation is not system-tool probing, reviewed dependency pins, runtime metadata checks, and render smoke tests. Make browser/MCP dependencies conditional on genuine gaps. [C2], [V3] |
| [setup-enterprise-stack](../../../../../skills/setup-enterprise-stack/SKILL.md) | Optional | Native marketplace/configuration controls own installation. The remaining Microsoft ecosystem curation, scope policy, and audit table are a domain-specific convenience. [C2], [V7] |
| [spike](../../../../../skills/spike/SKILL.md) | Thin | Native Plan, task execution, and worktrees supply mechanics. Preserve the disposable experiment, explicit hypothesis, timed measurements, and VALIDATED/PARTIAL/INVALIDATED result contract. [C1], [V1], [V8] |
| [status-reporting](../../../../../skills/status-reporting/SKILL.md) | Optional | CLI `/chronicle standup` covers a basic session recap. Keep custom stakeholder framing, decisions, risks, and tracker-backed metrics only when that richer report is requested. [C3] |
| [svg-banner](../../../../../skills/svg-banner/SKILL.md) | Optional | A branded deterministic artifact generator, not a missing native agent capability. Keep for users of that banner format; remove from minimal engineering Core. [V6] |
| [systematic-debugging](../../../../../skills/systematic-debugging/SKILL.md) | Thin | Native fix/explain/test loops cover execution. Keep the hypothesis-first investigation, regression evidence, and correctly scoped failed-attempt escalation; remove generic tool-operation tutorials. [V2] |
| [terminal-command-safety](../../../../../skills/terminal-command-safety/SKILL.md) | Thin | Use native command lifecycle, approvals, and sandbox diagnostics. Retain only shell/platform hazards actually reproduced on supported hosts; sandbox status is not a quoting guarantee. [C1], [V8] |
| [test-driven-development](../../../../../skills/test-driven-development/SKILL.md) | Thin | Native test generation and test/fix loops are not guaranteed RED-before-implementation. Keep that deliberate policy and exceptions as a short workflow; remove the generic testing essay. [V2] |
| [token-waste-elimination](../../../../../skills/token-waste-elimination/SKILL.md) | Keep | Native compaction reduces conversation context, not persistent source-instruction redundancy. Keep measured artifact-cost reduction and semantic preservation. [C1], [V6] |

## Highest-value changes to consider next

### 1. Migrate activation, not policy

The assertion in bootstrap-core that plugins cannot load instructions is no longer
a universal platform fact. Both current clients document plugin rules. [C2], [V7]

However, this checkout's `plugin.json` is a legacy manifest without an Agent
Plugins `$schema`. Simply adding rules or deleting bootstrap is not a migration.
The native format also changes MCP layout and metadata/component conventions.

Pilot a separately approved native-format package:

1. Define explicit mappings for always-on versus scoped rules.
2. Move MCP configuration and client-specific components to supported locations.
3. Check discovery, inclusion, and behavior in fresh CLI and VS Code sessions.
4. Confirm disabled/uninstalled rules cease applying and scope is correct.
5. Remove only unchanged receipt-owned legacy copies after native activation is
   demonstrated. Preserve modified/unowned files and retain compatibility for
   any older hosts still deliberately supported.

### 2. Prefer native planning and review

Use `/plan`/Plan for planning and native reviewers for ordinary reviews. Keep
ACT-specific framing, risk, approval, and evidence requirements as short inputs.
Do not treat Plan mode as a complete external-tool sandbox or a code-review
result as a correctness guarantee. [C1], [V1], [V2]

### 3. Make the browser native-first

VS Code's built-in browser now documents console errors as well as screenshots
and Playwright. The pack's older reason for requiring a separate browser server
needs revision. Keep `alex-playwright` as an explicit fallback until the CLI
browser and required local-file/remote/permission scenarios are tested; the
stable changelog establishes its native browser plugin exists, not full parity.
[V3], [C4]

### 4. Consolidate entrypoints without deleting workflows

The 12 wrappers are consolidation candidates. The chart orchestrator, converter
dispatcher, and project-status checkpoint must retain their behavior. A portable
skill is the preferred home when a standalone VS Code prompt file is insufficient
for the selected harness. Preserve legacy command names only when the alias is
intentionally supported and tested. [V5], [V6]

### 5. Separate Core from opt-in packs

Suggested packaging, not an instruction to create more infrastructure:

- **Core:** ACT reasoning, evidence/completion discipline, privacy/approval
  boundaries, artifact assessment/preservation, and lightweight native routing.
- **Engineering craft:** mutation testing, selected debugging/TDD/risk guidance,
  advanced review, security references.
- **Writing and documents:** humanizer, communication, converters, rich email,
  branded banners, docs-shell.
- **Data and visuals:** charts, Flint, print SVG, figures, annotation, and
  provider-specific image integrations.
- **Integrations and voice:** Microsoft ecosystem setup and optional personality,
  emotional adaptation, and reliance nudges.

An on-demand skill's full body is not automatically an always-on cost.
Nevertheless, broad descriptions and mandatory triggers can make large
specializations fire too often. For humanizer specifically, retain its distinct
Copywriter contract if wanted, but load the long pattern catalog as references.
[V6]

### 6. Retire stale host assumptions only after fresh probes

The skill-resolver issue cited by platform-awareness,
[microsoft/vscode#314772](https://github.com/microsoft/vscode/issues/314772), was
closed on 2026-09-17. That removes the justification for treating its workaround
as permanently current; it does not independently prove every harness is fixed.
Test a packaged skill in fresh target sessions before removing the compatibility
branch. [I1]

Memory should likewise use the active harness's documented interface. Do not
assume Local memory-file paths in a Copilot Memory session. Preserve privacy and
explicit repository-record authority during this change. [V4]

## Verification before any retirement

Use disposable fixtures and the intended harness, with no ACT rules repeated
inside the test request. This is a bounded compatibility exercise, not a return
to cross-session usage telemetry.

| Candidate | Required check |
| --- | --- |
| Native plugin rules | Discovery, actual inclusion, always-on/scoped behavior, enable/disable, uninstall, and safe legacy-copy cleanup on both clients. |
| Native Plan | Research/clarification, reviewable plan, approval boundary, blocked direct workspace mutation, and explicit treatment of external tools. |
| Native review | Finds a seeded real defect without invented findings or edits; preserves the review scope and required evidence format where retained. |
| Native browser | Local app and local artifact, console errors, screenshot, geometry/style measurement, authentication consent, and cleanup. |
| Native skill entrypoints | Correct owning skill and resources resolve; prompt-only rules and intentionally supported aliases remain reachable. |
| Native memory/continuity | Correct user/repository/session scope, privacy boundary, resume behavior, and preservation of the actual authoritative project records. |
| Native skill drafting | Project-local scope, prior-art check, approval, no unintended global/native-memory writes, and executable validation. |

Would revise the recommendations if a target-host probe fails, a preview feature
is unavailable under policy, an artifact has an unrecorded unique requirement,
or a native feature demonstrates the complete contract currently marked Keep.

## Sources

Primary sources were consulted on 2026-11-04. Current docs can describe features
with different lifecycle states; specific qualifications above take precedence
over a broad "latest stable" label.

- **R1**: [Copilot CLI 1.0.105 release][R1]; metadata verified through the GitHub Releases API.
- **R2**: [VS Code 1.145 release notes][R2]; 1.145.0 metadata verified through the GitHub Releases API.
- **R3**: [Copilot CLI 1.0.106-9 prerelease][R3].
- **C1**: [Copilot CLI command reference][C1], including built-in agents and Plan-mode security.
- **C2**: [Copilot CLI plugin reference][C2], including legacy versus Agent Plugins formats and Copilot-specific rules.
- **C3**: [Using CLI session data and chronicle][C3].
- **C4**: [Copilot CLI changelog][C4]: native browser plugin rename in 1.0.100; Plan restrictions in 1.0.71/1.0.74; security-review availability in 1.0.64; skill-proposal review in 1.0.66.
- **V1**: [Plan work with agents][V1].
- **V2**: [AI smart actions, tests, fixes, and code review][V2].
- **V3**: [Built-in browser tools][V3].
- **V4**: [Memory by agent harness][V4].
- **V5**: [Customization and harness compatibility][V5].
- **V6**: [Agent Skills][V6].
- **V7**: [Agent plugins and plugin-provided rules][V7].
- **V8**: [AI features cheat sheet and lifecycle qualifications][V8].
- **V9**: [Subagents and harness-specific controls][V9].
- **I1**: [microsoft/vscode#314772][I1], closure date verified through the GitHub Issues API.

[R1]: https://github.com/github/copilot-cli/releases/tag/v1.0.105
[R2]: https://code.visualstudio.com/updates/v1_145
[R3]: https://github.com/github/copilot-cli/releases/tag/v1.0.106-9
[C1]: https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-command-reference
[C2]: https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-plugin-reference
[C3]: https://docs.github.com/en/copilot/how-tos/copilot-cli/use-copilot-cli/chronicle
[C4]: https://github.com/github/copilot-cli/blob/main/changelog.md
[V1]: https://code.visualstudio.com/docs/agents/run/planning
[V2]: https://code.visualstudio.com/docs/editing/copilot-smart-actions
[V3]: https://code.visualstudio.com/docs/agents/run/browser-tools
[V4]: https://code.visualstudio.com/docs/agents/run/memory
[V5]: https://code.visualstudio.com/docs/agent-customization/overview
[V6]: https://code.visualstudio.com/docs/agent-customization/agent-skills
[V7]: https://code.visualstudio.com/docs/agent-customization/agent-plugins
[V8]: https://code.visualstudio.com/docs/agents/reference/ai-features-cheat-sheet
[V9]: https://code.visualstudio.com/docs/agents/run/subagents
[I1]: https://github.com/microsoft/vscode/issues/314772
