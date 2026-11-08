# Changelog

Completed-change history lives here; pending work remains in [ROADMAP.md](ROADMAP.md).
An Unreleased entry does not imply publication, installation, or activation.

## Unreleased

- Repaired the post-release source CI gates: restored explicit candidate
  marketplace verification wording and rebuilt both Flint demos in the
  reviewed isolated lockfile runtime. Exact comparisons prove that only the
  dependency-source provenance hash changed; chart inputs and rendered bytes
  are otherwise unchanged. Strict local structural/integration gates and
  [fresh Edge acceptance](archive/verification/source-ci/2026-11-08/browser.json)
  passed. The published `v0.9.5` tag, payload, Mall route, and active runtimes
  remain unchanged; hosted qualification requires the exact candidate commit.
- Ran fresh installed `0.9.5` CLI/native VS Code scenarios and actual
  plan/agent/shell/MCP artifact-delivery checks.
  [Task evidence](archive/verification/host-scenarios/2026-11-08/README.md)
  separates complete CLI response review from native transcript/missing-input
  limits, and repository file parity from host enforcement. Scout and Copilot
  app remain not run. Repaired the source CLI runner's forced outside-repository
  output restriction while preserving existing-evidence rejection; no new
  release or installed-package modification is implied.
- Detect the configured Microsoft packagefeedproxy npm endpoint in the root
  optional installer and MCP provisioner, using one shared exact-endpoint
  matcher. Preview reports the confirmed backend prefix; npm 12+ apply uses
  per-command routing without changing registry/security policy. Other
  registries remain unchanged, explicit prefixes take precedence, and continued
  fetch-policy failures stop without retries. The immutable `v0.9.5` payload
  is unchanged; this source improvement requires separate release delivery.

## 0.9.5 - 2026-11-08

- Published [v0.9.5](https://github.com/fabioc-aloha/Alex_ACT_ONE/releases/tag/v0.9.5)
  at `26d0518ec998817ed2d5c27a66855a58747e820c` after the full six-job matrix,
  fresh-checkout 608/57 strict test lanes, exact rebuilt demos and Edge acceptance
  passed. Mall validation passed 69 tests and the public route was verified.
  [Evidence](archive/verification/release-0.9.5/README.md) records manual
  installation as deferred; no user runtime or credentials were replaced.
- Added explicit `-Refresh` for native Mall/plugin updates without uninstalling
  first. Default mismatched-version preservation and activation conflict guards
  remain; an unsuccessful/no-op update cannot activate a stale release.
- Aligned optional dependency runtime selection with the host environment and
  updated the root README's manual plugin/tool setup commands.
- Updated exact npm pins from fresh stable metadata through the configured
  Microsoft proxy: Playwright MCP `0.0.84`, JSZip `3.10.2`, Mermaid CLI `12.0.0`,
  canvas `1.1.0`, Chart.js `4.6.1`, and SDK `1.32.2`. Source compatibility and
  same-commit release gates passed; later changes need their own evidence.
- Repaired the read-only version audit's scalar/array handling, semantic stable
  version comparison, and explicit rejection of ambiguous, prerelease, malformed,
  or regressed registry metadata.
- Removed Replicate's skill, MCP declaration, package pin, installer opt-in, and
  active documentation routes. Charts, SVG, Mermaid, and annotation remain;
  generative imagery requires separately configured host/provider capability.
  Historical release evidence, existing credentials/private packages, and
  user-owned external server registrations are not deleted.

## 0.9.4 - 2026-11-08

- Published [v0.9.4](https://github.com/fabioc-aloha/Alex_ACT_ONE/releases/tag/v0.9.4)
  from `ba657521416a51fbe84696b6676db3fb69a36778` after the full six-job
  same-commit matrix, fresh-checkout gates, exact demos and Edge acceptance
  passed. Mall selects the release's lean runtime path; its curated validation
  passed. [Publication evidence](archive/verification/release-0.9.4/README.md)
  records the explicitly approved manual-install exception. The local
  installation remains `0.9.3`; no upgraded activation or host cache is claimed.
- Canonicalized existing session workspace aliases, including Windows DOS
  short names, with native filesystem resolution. Detection and the
  source-only recovery helper share the same worktree matcher; a different
  explicit `cwd` cannot borrow another worktree's `git_root`. Regressions
  reproduce the prior false `no-matching-sessions` result; linked artifact
  copies still cannot qualify as delivery. Failed candidates were blocked,
  not published.
- Selected the lean `package/alex-act-one` source-path payload for release
  delivery, preserving every declared runtime owner/resource and both Flint
  demonstrations. Source and payload hashes distinguish checkout line endings
  from exact delivered bytes. The release record owns the final same-commit
  gates, disposable marketplace route proof, Mall publication, and local
  installation/activation results; assembly alone is not any of those checks.
- 2026-11-08: Refocused repository guidance, product README, handoff, roadmap,
  and documentation/package indexes on maintaining and shipping Alex ACT ONE.
  Completed recovery and synchronization remain historical incident evidence,
  not active fleet operations or a parallel backlog. The next action is
  qualifying the reusable safeguards and lean package for verified delivery;
  existing dependency, host, accessibility, rollback and provider decisions
  remain open. No publication or installed update is implied.
- 2026-11-08: Separated maintainer history into
  [the archive](archive/README.md) and added a lean
  [documentation index](docs/README.md). The retained frozen recovery artifacts
  moved without content changes; relocation receipts declare index/link edits.
  Added an explicit [candidate package boundary](docs/package.md), retaining
  both exact Flint demonstrations, all runtime owners/resources, user guides,
  reusable verification inputs and the documented standalone email test.
  Packaging excludes maintainer evidence and source-only CI/recovery tooling.
  Tests verify custody, local links, disposable activation/idempotency and
  missing-file rejection. Mall, published versions and live installations are
  unchanged; candidate distribution remains separately approved.
- 2026-11-08: Applied the approved [lean retention review](archive/verification/recovery-retention-review/2026-11-08/README.md):
  pruned 127 redundant/empty/provisional historical files, retained 93
  historical artifacts and all 99 archive recommendations, and preserved
  hashes, decisions and the recovery commit in the manifest. Repaired session
  accounting to validate actual Git-visible bytes and supported manifests,
  detect changed originals, and distinguish unavailable/unsupported scope.
  Repaired Git authentication checks with explicit account selection,
  structured no-refresh status, actual helper/token identity verification,
  read-access probes, prepared configuration validation and atomic rollback.
  These source changes do not publish a release or update installed caches.
- 2026-11-08: Added a task-local, preview-first
  [local recovery helper](scripts/recover-local-artifacts.mjs) and regression
  controls for authorized development-repository artifact recovery.
  The [local inspection and results](archive/verification/development-recovery/2026-11-08/README.md)
  record 128 copied artifacts in eight owning repositories, preserved existing
  archives and originals, portable guidance additions, and explicit privacy/raw
  data exclusions. The user subsequently authorized source synchronization
  through each repository's upstream and required policies. This is not an
  installed update or release; unrelated changes remain outside the commits.

## 0.9.3 - 2026-11-07

- Added deterministic safeguards for both non-interactive multi-account
  GitHub authentication and session-state artifact stranding (`a8aff02`):
  - [`skills/git-workflow/scripts/check-git-auth.cjs`](skills/git-workflow/scripts/check-git-auth.cjs)
    detects missing `gh` credential helpers (`credential.interactive=never`
    failures in Copilot shells) and multi-account `gh` drift (including
    Enterprise Managed User underscore logins), and pins `.git/config` to the
    repository's GitHub account after consent without storing tokens on disk.
  - [`skills/proactive-awareness/scripts/check-session-artifacts.cjs`](skills/proactive-awareness/scripts/check-session-artifacts.cjs)
    scans matching `~/.copilot/session-state` folders read-only to surface any
    deliverables not accounted for in the repository working tree or recovery
    manifest, wired into `proactive-awareness`, `project-status`,
    `git-workflow`, and `bootstrap-project`.
- Recovered stranded project reports, a useful release-verification
  helper, and related historical evidence into the
  [repository recovery index](archive/verification/session-recovery/README.md)
  (`bf74451`). Original and recovered hashes, declared privacy/link edits,
  duplicate verification, and runtime exclusions are retained in its manifest.
  Originals remain untouched; frozen recovered bytes have an independent tested
  checker.
- Added a [shared artifact-storage contract](skills/proactive-awareness/references/project-artifact-storage.md)
  to repository guidance, the resident session-health floor, new project
  scaffolds, and planning/bootstrap/recovery/meditation/rendering/Git owners.
  Requested plans are no longer classified as private planning scratch.
  Instructions do not claim universal filesystem enforcement.
- Recorded the local `0.9.2` installation and dependency audit in
  [verification history](docs/testing.md#092-local-installation-verification),
  added the [Replicate retirement proposal](https://github.com/fabioc-aloha/Alex_ACT_ONE/blob/v0.9.4/ROADMAP.md#consider-retiring-bundled-replicate-support),
  and refreshed offline Flint demonstration provenance for `0.9.3`.

## 0.9.2 - 2026-11-06

- Added an explicit `-BrowserExecutablePath` option to the optional dependency
  installer ([`100433d`](https://github.com/fabioc-aloha/Alex_ACT_ONE/commit/100433d54dcdacbf06c5f39e876a1ccd3d395b3a)).
  It validates the selected or inherited browser path before installing
  packages and passes the selection only to renderer processes. There is no
  automatic browser selection, browser download, or parent-environment change.
- Added actionable fetch-policy and access-denied cleanup diagnostics without
  automatic retries, package-directory deletion, or npm policy changes.
  Updated installation guidance. Local Windows verification passed 80 installer
  regressions across PowerShell 7 and Windows PowerShell 5.1, plus actual Mermaid
  SVG and SVG-to-PNG rendering using an explicitly selected installed Edge.
- Reconciled [HANDOFF.md](HANDOFF.md), [RELEASE-CHECKLIST.md](RELEASE-CHECKLIST.md),
  [docs/testing.md](docs/testing.md), and the `0.9.1` release history below with
  published tag [`v0.9.1`](https://github.com/fabioc-aloha/Alex_ACT_ONE/releases/tag/v0.9.1)
  (`a7b4ba6`, manual CI run `42273804899`) and the `-BrowserExecutablePath` and
  working-tree line-ending (`w/mixed`) verification checks. Refreshed offline
  Flint demonstration provenance for `0.9.2`.

## 0.9.1 - 2026-11-06

- Streamlined push CI to run minimum-Node structural and Node 26 integration
  lanes while retaining the full Node 24/26 matrix on manual dispatch and
  weekly runs, and hardened Windows command discovery with per-process path
  caching in [`a7b4ba6`](https://github.com/fabioc-aloha/Alex_ACT_ONE/commit/a7b4ba6facab0c54ffa435833cc590bb18789b37).
  [Full same-commit manual run 42273804899](https://github.com/fabioc-aloha/Alex_ACT_ONE/actions/runs/42273804899)
  passed 533 Windows structural tests per job, 474 Ubuntu structural tests per
  job on Node 24/26, 58 provisioned integration tests per OS, and both canonical
  Windows demo rebuilds, and was published to `Alex_Skill_Mall` in
  [`3c740ba`](https://github.com/fabioc-aloha/Alex_Skill_Mall/commit/3c740ba9a1e506d9a4f65878b8bd775b0e26e740).
- Confined the Markdown-link smoke scan to tracked source documents after
  release preparation exposed it reading a concurrent, already-removed fixture.
  A failing-then-passing regression preserves shipped-document coverage.
- Fixed the production-review findings in pushed commit
  [`e41ccc4`](https://github.com/fabioc-aloha/Alex_ACT_ONE/commit/e41ccc43a6202af7b83e12d8d133906210c0b14d):
  case-insensitive HTML outputs and source-alias guards, per-output DOCX media
  namespaces, literal-code-aware cleanup, and compatible encoded-image validation.
  Corrected Mermaid fallback claims in the HTML and email guides.
- Restricted activation fixtures to shipped surfaces rather than copying
  concurrent scratch state. A Linux socket regression covers the entry type
  that reached Node's recursive-copy assertion.
- Corrected browser verification to bring resized iframes onscreen, wait beyond
  the renderer debounce, and use trusted keyboard activation for saved specs.
  A longer settling interval alone failed; the decisive visibility intervention
  resumed the same stalled charts without remounting. Pointer actions that did
  not deliver clicks were not counted as successful downloads.
- [Same-commit hosted run 42267875970](https://github.com/fabioc-aloha/Alex_ACT_ONE/actions/runs/42267875970)
  passed all required jobs: Windows structural 526 per job, Ubuntu structural
  467 per job on Node 24/26, provisioned integration 58 per OS, and both exact
  Windows artifacts. A fresh local clone passed 526 structural, 58 integration,
  and both artifact checks with an unchanged checkout. Three fresh standalone
  Edge gates passed both pages. No required lane had skipped or failed tests.
  Related diagnostics and documentation links passed.
- Committed and pushed source repairs in
  [`d0d3215`](https://github.com/fabioc-aloha/Alex_ACT_ONE/commit/d0d3215fe585293bad4b1376703e7462b8d8d5b2)
  and
  [`a6a3038`](https://github.com/fabioc-aloha/Alex_ACT_ONE/commit/a6a3038b5f354e662aa8fa2c95a4e9f5ba3b7bd7):
  email-header and executable-HTML checks, network/device image-path rejection,
  literal-code preservation, staged document/media publication with handled-error
  rollback, and a 256 MiB decompressed PNG budget.
- Changed the source installation helper to verify matching installations in
  place, install only when absent, and refuse automatic replacement or
  cross-source duplicates. This deliberately avoids claiming plugin rollback.
- Local Windows/Node 26 verification for `a6a3038` passed 508 structural and
  56 integration tests, with no failures, skips, cancellations, or todos.
  Related diagnostics and documentation links passed. See
  [verification environments and limits](docs/testing.md).
- Hosted verification for that earlier revision was **not green**:
  [run 42259125372](https://github.com/fabioc-aloha/Alex_ACT_ONE/actions/runs/42259125372)
  passed Windows structural jobs but failed Ubuntu structural jobs on both
  Node 24 and 26; provisioned jobs were skipped. Both Ubuntu jobs report
  `ERR_INTERNAL_ASSERTION` in Node's `fs.cpSync` while preparing the
  canonical-route and redirected-owner cases in
  [native-compatibility.test.mjs](tests/native-compatibility.test.mjs).
  Root cause and same-commit integration/artifact evidence were unresolved at
  that revision; the later `e41ccc4` result above closes that source blocker.
- Applied the installed plugin's project scaffold after preview and consent.
  Project guidance, compatibility adapters, handoff, episodic-directory README,
  and workspace settings were created locally; existing tracked files were
  unchanged. Template comparisons, diagnostics, and a second no-op preview
  passed before continuity reconciliation. The files remained uncommitted during
  the readiness review; this release includes the approved scaffold and continuity
  records without adding episodic summaries.

## Published baseline

The [v0.9.0 release record](https://github.com/fabioc-aloha/Alex_ACT_ONE/releases/tag/v0.9.0)
owns earlier release history and delivery evidence. Its frozen and delivered
package recovery checks passed, completing that roadmap verification item.
The original recovery finding and isolated-source retest remain in
[scenario evidence](docs/verification/README.md).

The repairs above ship in `0.9.1`, `0.9.2`, and `0.9.3`, not `0.9.0`. See the
[0.9.1 release record](https://github.com/fabioc-aloha/Alex_ACT_ONE/releases/tag/v0.9.1),
[0.9.2 release record](https://github.com/fabioc-aloha/Alex_ACT_ONE/releases/tag/v0.9.2),
and [0.9.3 release record](https://github.com/fabioc-aloha/Alex_ACT_ONE/releases/tag/v0.9.3)
for final publication and delivery evidence. Preparing a release does not
automatically upgrade the active plugin, profile instructions, or runtime.
