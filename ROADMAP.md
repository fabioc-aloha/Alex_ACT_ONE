# Roadmap

Prioritized from the end-to-end source and documentation review on 2026-11-05.
R1-R4 are now repaired in the source candidate with regression coverage.
R6 is implemented; R5's source workflow and local gates are implemented pending
hosted-matrix verification. Remaining items await implementation. Nothing here
authorizes changing an installation or publishing a release.

## Review Baseline

| Surface | Evidence and limits |
| --- | --- |
| Source versus release | Published baseline is `v0.8.0`. The interaction skill, offline demos, recent UAT guidance, and generated documentation improvements are source-only additions. See the [current inventory](README.md#source-package-inventory). |
| Automated baseline | The complete existing suite passed 315 tests with zero failures and zero skips on Windows, Node `26.13.0`, and PowerShell `7.6.9`. This is a dated environment result, not a supported-platform matrix. |
| Brain structure | The read-only analyzer reported no findings and preserved assessed hashes. It checks structure and declared routes, not semantic effectiveness. |
| Lifecycle and output probes | Disposable fixtures reproduced the activation, Windows-launch, dependency-detection, and inline-code problems listed under P1. No real profile or runtime was modified. |
| Review coverage | Installation, activation/removal, dependency provisioning/launch, representative conversion and drafting workflows, skill ownership/tests, and project documentation. Documentation received a separate read-only review. |
| Not established | Exhaustive live execution of every skill, fresh-install parity on every supported host/OS, a vulnerability audit, paid image generation, or successful native-browser file saving. |

Passing structural tests is not a release-readiness verdict. The additional
failure probes below passed through gaps in the current coverage.

## Working Today

- One payload in the shared Copilot CLI store can serve the supported hosts. Scout requires
  **Load Copilot CLI skills**, a plugin-root check, separate MCP registration,
  and a full restart. A no-write host activation readiness report exists;
  discovery and readiness do not prove observed activation.
- Instructions and prompts are thin routes to canonical skill owners, with
  selected references, preserved aliases, and explicit consent boundaries.
  Tested deterministic helpers support material quantitative checks without
  cross-session skill telemetry.
- Preview-first activation and receipt-backed removal exist. Source activation
  now blocks modified/unowned conflicts before any writes; replacement needs a
  separately previewed, explicitly approved override. Removal preserves modified bytes.
  Runtime packages are retained after uninstall by design. Profile instructions
  need their own consented removal; uninstall is not proof of complete cleanup.
- The [dependency registry](scripts/shared/dependencies.cjs) exact-pins reviewed
  top-level npm packages. Flint also has an independently pinned library and
  root/server-resolved version guards. This is not a locked transitive graph.
- The source [editorial gallery](docs/flint-showcase.html) and
  [experimental interaction lab](docs/flint-experimental.html) demonstrate
  validated Flint 1.0.1 inputs, real embedded rendering, and synthetic records.
  Native-browser UAT has exercised selected gestures, reset, linked views, and
  narrow layouts; download completion remains unverified.
- [Generated asset catalogs](scripts/update-docs.mjs) check filesystem/manifest
  parity and explicit execution-owner routes. They do not validate every prose
  claim, executable example, or actual host invocation.

## Source Repairs Completed: R1-R4

The original failures were reproduced before correction. These repairs are
source-only until a separately approved release and installation.

| ID | Original failure | Source correction and evidence | Verified scope |
| --- | --- | --- | --- |
| R1 | Activation could overwrite modified or unowned instructions. | [Conflict-aware planner/apply](skills/bootstrap-core/scripts/bootstrap-core.cjs) blocks the whole apply by default; host readiness reports blocked; `--overwrite-conflicts` needs separate approval and cannot bypass receipt validation. | [Activation regressions](tests/activation-conflicts.test.mjs) cover foreign/modified files, unchanged upgrades, migration, stale plans, receipt ownership, no-write blocking, and explicit recovery after a failed apply. No real profile was used. |
| R2 | Windows `.cmd` tool launching failed with `EINVAL`. | [Shared command resolution](scripts/shared/process-command.cjs) maps known npm tools to validated package bins and launches Node without a shell; synchronous and asynchronous consumers share it. | [Real shim-layout regressions](tests/tool-shims.test.cjs) cover global/local package bins, spaces, literal metacharacters, native executables, and escaping bin rejection. Existing npm-prefix behavior remains covered. |
| R3 | Prose transforms altered literal inline code. | [Shared preprocessing](scripts/shared/markdown-preprocessor.cjs) protects single/multi-backtick inline spans and fenced content while retaining intended prose transforms. | [Span regressions](tests/markdown-inline-code.test.cjs) and [real HTML/Word conversion](tests/conversion-runtime.test.cjs) verify literals, multiline spans, headings, tables, and links. Actual diagram/rendering coverage remains a separate prerequisite-dependent check. |
| R4 | Empty package directories looked ready and runtime selection diverged. | [Shared runtime state](scripts/shared/runtime-status.cjs) drives detector/launcher/provisioner selection and distinguishes installation, version, bounded launch, and unobserved host connection. Provisioning verifies its outcome before success. | [Readiness regressions](tests/runtime-readiness.test.mjs) cover malformed/empty packages, version/library drift, failed/hanging launches, CLI root selection, and isolated mocked installs. Fixture installers refuse writes outside their exact temporary root. |

Version probes do not prove MCP host connectivity or paid API authentication.
The release/environment/host gates below remain open.

Repair verification on 2026-11-05: the full suite passed 357 tests with zero
failures or skips. Real HTML/Word conversion and installed Mermaid CLI startup
passed; read-only launch probes passed for the existing pinned MCP packages.
Both offline-demo rebuild checks and the generated catalog drift check passed.
This is source verification, not publication or a new host-activation claim.

## P1: Repeatable Release and Contract Gates

### R5. Automate the supported-environment baseline

**Implemented, hosted verification pending.** The
[workflow](.github/workflows/verify.yml) uses push/manual triggers and reviewed
immutable actions with read-only permissions. Structural jobs target Windows
2025/Ubuntu 24.04 with Node 24/26; provisioned runtime/converter jobs use Node 26.
The [gate](scripts/test-gate.mjs) rejects failed, skipped, todo, cancelled,
empty, or unreported runs. Provisioning is restricted to disposable CI runners.

Local Windows verification passed both lanes. This is not yet a claim that the
hosted Linux/Node 24 matrix passed. See the
[environment contract](docs/testing.md) for prerequisites, platform exclusions,
canonical demo rebuilds, and evidence limits. The transitive lock/staging
policy remains R9 rather than an implied guarantee of top-level pins.

**Remaining acceptance:** the clean hosted matrix passes for the same candidate
commit, including R1-R4 regressions and provisioned renderer/converter checks.

### R6. Check executable examples and metadata, not just Markdown links

**Completed in source.** Rich Email names its real test/validator paths and
resolves them from the installed plugin. Marked validation examples run against
an installed-copy fixture from an unrelated directory; Outlook opening is
explicitly illustrative and never executed by the checker. Replicate points to
the actual plugin manifest rather than a nonexistent workspace config.

Instruction roles now derive from canonical descriptions through
[update-docs](scripts/update-docs.mjs); the read-only check rejects metadata
drift. [Example tests](tests/documentation-examples.test.mjs) and
[catalog tests](tests/documentation.test.mjs) cover these contracts. Unmarked
snippets are not claimed as executed or exhaustively verified.

## P2: Product Experience and Evidence

### R7. Make first success obvious, then split reference from onboarding

The [README quick install](README.md#quick-install) explains installation and
activation, but needs a short first-workflow example, expected result, and
activation verification. The large catalog and platform detail serve reference
use better than a first session.

**Acceptance:** a fresh reader can install, activate, run one no-extra-dependency
workflow, and identify success from a single short guide. Keep generated catalogs
canonical; move detailed setup/reference material behind links rather than copy
it. Clearly separate published-package, source-checkout, and demo-only features.
Proofread navigation while reorganizing, without rewriting the project's voice.

### R8. Add scenario-level skill and host evidence

[Routing tests](tests/native-compatibility.test.mjs) and
[UAT-guidance tests](tests/visual-uat-guidance.test.mjs) protect contract text and
packaging; they do not prove that a model followed the procedure. Historical host
tests must not become current-release compatibility claims.

**Acceptance:** keep versioned synthetic scenarios for representative reasoning,
review, recovery, conversion, chart, and draft-only workflows. Include missing
input, read-only/no-write, denied tool, unsupported output, and approval-boundary
cases. Record release/commit, host/version, actual invocation, observed result,
and limitations in a compact release-evidence table. No cross-session usage or
skill-firing telemetry. Recheck CLI, VS Code, Scout, and the Copilot app before
upgrading a supported-delivery row to freshly verified.

### R9. Make runtime upgrades reproducible and recoverable

[Provisioning](skills/setup-dependencies/scripts/provision-runtime.mjs) currently
installs into shared active state; top-level version pins do not freeze
transitive dependencies or provide rollback.

**Acceptance:** decide a reviewed lock/integrity policy for runtime dependencies;
stage an upgrade, verify versions and launch/render behavior, then switch only
after consent. A failed stage leaves the previous runtime usable. Preserve
configured registries and npm policy, selected-server upgrades, and reload
boundaries. R4's readiness model is a prerequisite.

### R10. Make the demos and manual UAT evidence portable

The [offline reports](README.md#flint-charts-and-interaction-demos) provide real
examples; browser UAT is still a manual sequence, and native download completion
was not observed.

**Acceptance:** retain reproducible offline builds and add a reusable browser
acceptance harness for image decode, themed controls, semantic linked recipients,
reset, resize, and saved-spec validation in a host that supports downloads.
Run a dedicated keyboard/focus/live-region/contrast pass rather than infer
accessibility from one navigation check. Downloaded pages should carry source
status and deterministic build provenance; keep standalone offline delivery and
upstream notices. Test provenance generation without making identical builds
depend on the wall clock.

### R11. Separate evaluation hypotheses from demonstrated outcomes

The [evaluation guide](docs/launch/evaluation-guide.md) is a useful comparison
exercise, not evidence that a short run establishes durable reliability gains.

**Acceptance:** name CLI as the reference path and state coverage limits or host
adaptations. Label desired signals as hypotheses, provide a task-local results
table with sample size and limitations, and avoid general product claims from a
single comparison. Treat a manual release-evidence template as part of the
[release checklist](RELEASE-CHECKLIST.md), not a standing behavioral ledger.

## External Dependency Watch

**Scout prompt commands:** no plugin prompt surface has been demonstrated in the
recorded Scout baseline. Keep owning-skill invocation as the documented fallback.
Recheck when Scout changes; this needs host support, not another ONE command alias.

**Native rule delivery:** retain legacy bootstrap and receipts until the
target-host activation gate passes. Native skill discovery is not that gate.

## Not Planned

- Replacing human judgment or treating a passing static check as semantic proof.
- Silent activation, installation, external sending, or publication.
- Telemetry or cross-session behavioral usage scoring.
- A new shared continuity store. Existing project guidance remains authoritative.
- Provider operations in ONE. AI Operations remains a separate Mall plugin for
  users who need provider-specific planning and integrations.

## Completion Rules

An item is complete only when its acceptance gate is demonstrated, related
documentation matches the behavior, and the result is in the reviewed source.
Publication and user-level installation require their own approval. R1-R4 are
implemented in source; R6 is complete, R5 awaits hosted verification, and
R7-R11 remain open.
