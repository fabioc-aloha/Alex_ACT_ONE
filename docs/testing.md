# Verification environments and release gates

Release version: `0.9.5`. Use the
[release record](https://github.com/fabioc-aloha/Alex_ACT_ONE/releases/tag/v0.9.5)
for the frozen commit's CI, clean-clone, artifact, and delivered-package results.
The dated baseline runs below do not substitute for same-commit release evidence.
Live-host and browser observations retain their separately documented limits.

The source workflow targets Windows Server 2025 and Ubuntu 24.04 on x64.
Ordinary pushes run structural jobs on Node 24 and provisioned integration jobs
on Node 26, on both OSes. Manual dispatch and the weekly scheduled run add
Node 26 structural jobs for the full release matrix.
These are verification targets, not certification of every Copilot host or OS.
macOS and other Node versions are not covered by this workflow.

## Post-release proxy-routing source verification

The unreleased checkout recognizes only the configured HTTPS Microsoft
packagefeedproxy npm endpoint and its confirmed backend prefix. Shared
detection is exercised through both the optional PowerShell installer and
Node MCP provisioner. The focused routing/runtime run passed 107 tests without
failures, skips, or todos, including private/global routing, explicit precedence,
read-only previews/verification, npm 12 guards, lookalike registries, and
failure without retries or policy changes. This is not a new full release matrix.

After the user's manual setup, native inventory reports enabled `0.9.5` from
Mall, and installed-source bootstrap verification matched all 15 instructions
and the current receipt. The root dependency helper's no-install `-VerifyOnly`
check passed all six selected pins, both MCP launchers, real Mermaid SVG, and
SVG-to-PNG output using installed Edge. User packages were not reinstalled
by these checks. Full installed payload parity and live-host loading remain
separate observations. Published `v0.9.5` bytes are unchanged; automatic proxy
detection is still a source-only improvement pending release delivery.

## What runs where

The [2026-11-08 fresh-host record](../archive/verification/host-scenarios/2026-11-08/README.md)
separately verifies the installed `0.9.5` package, all six exact CLI `.2`
scenarios, limited native VS Code transcripts, and actual repository-owned
artifact outputs. Its 21 runner/scenario/storage regression tests passed.
Those model/host observations are not a new release matrix or all-host
certification. Other hosts, live external-destination approval, and strong
write enforcement remain unverified.

The [candidate package gate](package.md) separately checks the explicit
distribution boundary, exact demo preservation, all declared assets/resources,
local package links, and disposable bootstrap behavior. Source-only CI and
maintainer archive verification remain source-checkout responsibilities; a
lean runtime package is not a Git checkout or all-host certification.

| Lane | Prerequisites | Required evidence |
| --- | --- | --- |
| Structural | Git checkout, Node 24+, PowerShell 7; Windows also requires Windows PowerShell 5.1 | Catalog/role drift check, read-only structural assessment, dependency-free tests, and fake-install/activation safety cases |
| Integration | Explicit reviewed MCP runtime, JSZip from the shared registry, Pandoc 3.13, reviewed Mermaid CLI | Actual MCP version/launch and three-backend render tests, real HTML/Word conversion, and installed Mermaid CLI startup |
| Canonical demo rebuild | Windows integration environment | Byte-for-byte checks of both generated HTML pages; Git preserves their LF endings |

Canonical demos additionally require `@napi-rs/canvas@1.1.0`,
`chart.js@4.6.1`, and `@modelcontextprotocol/sdk@1.32.2`, defined in
`SHOWCASE_PACKAGES` in the shared dependency registry. CI installs them only in
its disposable demo/runtime prefix. The builder checks server-resolved versions
before generating output and never changes an existing runtime to match them.
For local rebuilds, use a separately approved isolated build environment.
`--describe-runtime` reports the actual renderer versions, bundled font hashes,
and text metrics without creating a report.

The disposable profile is declared in [ci/runtime/package.json](../ci/runtime/package.json)
and locked by [ci/runtime/package-lock.json](../ci/runtime/package-lock.json).
It includes integrity-checked transitive versions, not just the renderer
top-level pins. The workflow copies both files to its temporary runtime and uses
`npm ci --ignore-scripts`; it does not install into this checkout or an active
user runtime. Tests require the profile's direct versions to match the shared
registry. The lock's `registry.npmjs.org` URLs use npm's documented sentinel for
the currently configured registry, not a workflow registry override.

The `0.9.4` hosted diagnosis found matching bundled-font hashes but canvas 1.1.0,
Chart.js 4.6.1, and SDK 1.32.2 instead of the reviewed versions. Canvas measured
different glyph widths, changing SVG paths and raster output. The `0.9.5`
upgrade separately reviews those newer renderer inputs and rebuilds the demos;
it does not reinterpret the earlier mismatch as a passing exact check.
A subsequent notice-only mismatch exposed `@hono/node-server` 2.1.6 versus
2.1.4; the isolated lock also freezes that indirect build input. No paths or
notice content are normalized away, and the exact artifact check remains.
The profile does not upgrade a user's runtime; staged upgrades and rollback
remain R9.

The demo CLI sets its own process timezone to UTC before loading renderers.
It does not change the OS or parent process, or impose a timezone on the live
viewer. Integration tests compare real exports from UTC and Eastern caller
environments so a local date boundary cannot silently change the artifact.
Static SVG serialization also rounds only scalar position attributes and
`translate` coordinates to three decimal places (0.001 SVG-unit precision).
Tests bound each scalar rounding change to 0.0005 SVG units. Text, analytical
data, compiled specs, view boxes, paths, sizes, colors, opacity, and other
transform coefficients remain exact. Unit-bearing or multi-value position
attributes are left unchanged. This is not a general SVG validator or sanitizer.
The byte-for-byte artifact check still fails on any remaining difference; it
does not use a blanket whitespace, numeric, or image-similarity tolerance.

The test runner has no npm test-framework dependency or root package manifest.
Release verification nevertheless needs PowerShell; integration also needs the
named optional tools. Ordinary `node --test` may skip missing runtime/converter
cases locally. A release lane cannot pass with skipped, todo, cancelled, failed,
empty, or unreported tests.

The [gate](../scripts/verification-gate.mjs) discovers the test files and records every
lane/platform exclusion. Provisioned cases live in dedicated files rather than
being silently skipped inside the structural lane. Actual Windows npm-shim
tests run on Windows; their exclusion on Linux is explicit. Newly added test
files join the structural lane unless classified as provisioned tests.

## Running locally

These commands do not install packages:

```powershell
node scripts\verification-gate.mjs --lane structural
```

### Repository artifact recovery

The `0.9.4` source retention cleanup keeps 93 historical artifacts
(5,016,321 bytes) and records 127 approved pruned entries in the custody
manifest. The [retention implementation](../archive/verification/recovery-retention-review/2026-11-08/implementation.json)
and [approval inventory](../archive/verification/recovery-retention-review/2026-11-08/README.md)
preserve reasons, original/recovered hashes, and the prior Git commit.
The initial recovery counts below are historical, not the current physical
archive size. Current checker regressions include missing, corrupt, ignored,
stale and alternate-manifest evidence, explicit login selection, real synthetic
helper execution, and configuration rollback. Source results are not installed-package verification; the release record
owns the separately observed publication and installation evidence.

On 2026-11-07, the authorized recovery retained 220 historical files
(9,318,096 recovered bytes) from this repository's local sessions, verified
their recovered SHA-256 values, and confirmed the originals were unchanged.
The [index and manifest](../archive/verification/session-recovery/README.md) distinguish
original hashes from privacy/link-edited copies, exclude disposable runtime
state, and record a byte-identical duplicate session. Empty failed-producer
JSON outputs remain explicitly classified historical failures.

The scoped run passed 79 tests with no skips across recovery, artifact storage,
multi-account Git auth, native compatibility, project bootstrap, documentation,
and recovery boundaries.
The local-link check passed 197 links in 14 recovered/policy documents.
These are recovery-integrity and declared-contract checks, not proof of
future host enforcement or fresh browser acceptance.

```powershell
node scripts\session-recovery.mjs
node skills\proactive-awareness\scripts\check-session-artifacts.cjs --repository-root .
node skills\git-workflow\scripts\check-git-auth.cjs --repository-root .
node --test tests\session-recovery.test.mjs tests\artifact-storage.test.mjs tests\git-auth.test.mjs
```

The checker reads only repository evidence. It rejects missing or corrupt files,
unregistered evidence, unsupported/empty inventories, undeclared edits, and
path/junction escapes without overwriting a failed historical record.
Future host enforcement retains its
[separate acceptance gate](../ROADMAP.md#verify-artifact-delivery-in-supported-hosts).

The live session detector additionally reads explicitly scoped local session
files and Git-visible repository artifacts. It does not classify unavailable
scope, unsupported formats or links as a clean result. Deliberate pruning can
account for exact source hashes without recreating discarded scratch; changed
originals cannot reuse that decision. The Git auth preview uses read-only
identity/access probes; branch protection remains unverified by that preview.

### Structural and integration isolation

The structural lane gives its child tests a disposable home/profile and an
absent private runtime. Installation tests must still pass their own explicit
temporary runtime and reject writes outside that path inside the mock.
An environment override alone is not a sufficient installation-test boundary.

After separately provisioning the reviewed tools with consent, select an
existing runtime explicitly before integration checks:

```powershell
$env:ALEX_ACT_ONE_RUNTIME_ROOT = '<absolute provisioned runtime path>'
node scripts\verification-gate.mjs --lane integration
```

Use native path separators outside Windows. Integration preflight fails on
missing/mismatched packages or tools instead of allowing the tests to skip.
The Word converter uses the same selected runtime for its optional JSZip
fallback. Version probes establish launchability, not host MCP connection or
paid API authentication.

## Hosted workflow

[Verify source candidate](../.github/workflows/verify.yml) runs on pushes to
`main`, manual dispatch, and a weekly schedule, not pull requests. Structural
and integration jobs run independently in parallel; every required job must
pass. Ordinary pushes use the minimum supported Node for structural coverage
on both OSes. Manual and scheduled runs cover both Node 24 and 26.

Before publication, explicitly dispatch the full workflow on the candidate
branch and verify its `headSha` is the frozen candidate commit:

```powershell
gh workflow run verify.yml --ref main
```

A green push run alone is not full release evidence. Use the full manual
matrix for runtime/dependency changes too; the weekly run is compatibility
monitoring, not evidence for a different candidate. Event-specific concurrency
groups keep an ordinary push from cancelling a full manual run. Only older
push runs are automatically cancelled by a newer run in the same group.

Actions are pinned to reviewed immutable commits, checkout
does not persist credentials, and token permissions are read-only.

Only disposable integration runners install packages. MCP, JSZip, and Mermaid
direct versions agree with the [shared dependency registry](../scripts/shared/dependencies.cjs).
The pinned Node setup action caches npm's download cache using the isolated
runtime lockfile. Installed `node_modules` directories are not cached:
`npm ci --ignore-scripts` still creates and integrity-checks each fresh runtime.
The workflow uses the runner's configured npm registry without a registry URL
override, suppresses lifecycle scripts for these installs, and does not request
API credentials or browser downloads. Pandoc 3.13 is installed by the pinned
Pandoc setup action.

Windows shell-free tool resolution uses a bounded 30-second discovery budget,
with the command and error in failures, instead of the earlier five-second
cold-start limit. Successful existing paths are cached only inside the current
process and discovery environment (PATH, PATHEXT, and working directory);
removed paths and environment changes trigger new lookup. Discovery uses the
same environment/directory as the tool. Missing tools and failed lookups are
not cached as successes, and neither tests nor jobs are automatically retried.

Update the isolated lock deliberately when changing its dependency graph, then
review package versions, integrity, configured-registry portability, upstream
notices, and real artifact differences. Do not disable a failing check or relax
the artifact contract to conceal a dependency change. This CI/demo profile is
not an implementation of staged production-runtime installation or rollback.

Read the job's actual environment, prerequisite report, TAP totals, exclusions,
and failure output. A valid workflow file or local Windows run is not proof
that the hosted Windows/Linux matrix passed. Use the same candidate commit's
green hosted run as release evidence.

### Recorded verification

The [2026-11-05 hosted run](https://github.com/fabioc-aloha/Alex_ACT_ONE/actions/runs/42102913755)
passed at commit `6c90220`:

| Job | Observed result |
| --- | --- |
| Windows 2025 structural, Node 24 and 26 | 371 passed per job; no skips, todos, or cancellations |
| Ubuntu 24.04 structural, Node 24 and 26 | 322 passed per job; no skips, todos, or cancellations |
| Windows and Ubuntu integration, Node 26 | 18 passed per job; no skips, todos, or cancellations |
| Canonical Windows artifacts | Both HTML pages matched byte-for-byte; tracked checkout remained unchanged |

Counts differ by explicitly selected platform cases and shells; do not combine
matrix totals into an effectiveness claim. This is dated evidence for that
commit, not an automatic green result for later source changes or a new release.

The later [onboarding run](https://github.com/fabioc-aloha/Alex_ACT_ONE/actions/runs/42107469576)
also passed every required job at `b6cc870` on 2026-11-05. It does not verify
subsequent working-tree changes; record their own checks before publication.

### 0.9.1 readiness corrections

[Run 42259125372](https://github.com/fabioc-aloha/Alex_ACT_ONE/actions/runs/42259125372)
at `a6a3038` failed two Ubuntu activation fixture-copy cases on both Node
versions, skipping provisioned jobs. The recursive copy walked the entire
checkout, including concurrent test scratch directories. Node's recursive copy
reaches `ERR_INTERNAL_ASSERTION` on unsupported entries such as Unix sockets;
PowerShell subprocess fixtures use their scratch directory as `TMPDIR`.
Activation fixtures now copy only the shipped activation surfaces. A regression
excludes scratch state and includes a real Unix-domain socket on Linux.
Production activation behavior and the required matrix are not weakened.
The Markdown-link smoke check likewise reads Git's tracked source inventory,
not transient Markdown created and removed by concurrent tests. Its regression
requires the README to remain covered while excluding scratch documents.

The conversion regressions require uppercase Markdown and debug paths to
preserve the input, reject source aliases before writes, isolate media for two
different DOCX outputs in one directory, and preserve literal code through
cleanup, heading normalization, and comment removal. Media directories are
named after the complete Markdown output filename; special characters are
URL-encoded in links. Repeated conversion must not alter another output's media.
Real Pandoc cases exercise batch media and literal-code roundtrips.

Browser regressions require bringing the resized iframe onscreen before frame
work, reject premature settling before the pinned renderer's resize debounce,
and retain the one-pixel clipping limit. See
[browser diagnosis and evidence](verification/flint-browser.md) for the actual
failure and the separate local-browser gate. These corrections shipped in
`v0.9.1` (full manual run [`42273804899`](https://github.com/fabioc-aloha/Alex_ACT_ONE/actions/runs/42273804899)
at `a7b4ba6`: 533 Windows and 474 Ubuntu structural tests per job, 58
integration tests per OS, and both canonical Windows demo rebuilds). Version
`v0.9.2` adds explicit `-BrowserExecutablePath` renderer-verification and
non-destructive fetch-policy and cleanup recovery regressions (80 tests across
PowerShell 7 and Windows PowerShell 5.1). Version `v0.9.3` recovers stranded
session-state project artifacts into the repository index, adds the shared
artifact-storage contract across instructions and workflows, and ships
deterministic helpers and regressions for session-artifact detection and
multi-account non-interactive GitHub credential pinning (576 Windows structural
tests).

### 0.9.2 local installation verification

Observed 2026-11-06 on Windows x64, Node `26.13.0`, against release commit
`32e94005825c248968f31e0bbe69be3a531dd435`. The latest published release, remote
`main`, and peeled `v0.9.2` tag selected that commit. The same-commit
[manual CI run 42304698572](https://github.com/fabioc-aloha/Alex_ACT_ONE/actions/runs/42304698572)
was independently confirmed successful; its full release evidence remains in
the [release record](https://github.com/fabioc-aloha/Alex_ACT_ONE/releases/tag/v0.9.2).

| Check | Observed result |
| --- | --- |
| CLI user-store and loaded VS Code cache | Both `0.9.2`; all 304 tracked source files present, no content differences, and 5 line-ending-only differences per copy |
| Bootstrap preview and profile receipt | Schema-v2 receipt at `0.9.2`; 15 preserve actions, preserved receipt, no conflicts |
| Structural lane in the Git checkout | 553 passed; no failures, skips, todos, or cancellations |
| Integration lane against the installed VS Code package | 58 passed; no failures, skips, todos, or cancellations |
| Optional dependency verification with 0.9.2's then-supported options | All 7 selected pins and 3 MCP launchers verified; actual Mermaid SVG and SVG-to-PNG rendering passed with installed Edge |
| Live MCP probes | Flint theme listing and Playwright tab listing succeeded; the retired image provider's public-model lookup returned HTTP 401 |

The initial structural run against the installed cache failed three
Git-dependent checks because that directory has no `.git` metadata.
The documented structural prerequisite is a Git checkout; rerunning the full
lane there passed. This does not invalidate the installed-package integration
result or justify weakening the Git-dependent checks.

The configured npm registry returned array-wrapped metadata and a prerelease
value for Playwright's `latest` tag. The bundled update audit incorrectly
reported equal versions as updates and called the prerelease stable. An
independent normalized, fresh-metadata check identified newer stable npm pins;
Pillow also had a newer upstream release. At the time, these were review
candidates, not approved upgrades. The audit correction and reviewed npm pin
upgrades subsequently shipped in
[0.9.5](../archive/verification/release-0.9.5/README.md); Pillow remains a
separate manual setup choice.

No dependencies, credentials, profile instructions, or host configuration were
changed, and no paid image generation was attempted. Replicate launchability
does not establish API authorization. These observations do not certify every
host, semantic skill scenario, browser interaction, or runtime rollback path.
The scoped runtime description check confirmed the reviewed demo renderer
versions; the audit did not rebuild the demonstration pages or repeat browser
acceptance.

Historical pre-upgrade baseline: the earlier CLI store and VS Code cache held
`0.9.1`, with 15 profile instructions preserved. Refreshing `w/mixed`
working-tree files from the Git index restored `w/crlf` checkout parity and a
`preserve:15` bootstrap preview against the `0.9.1` receipt. That is historical
activation evidence, not the current installation state.

## Executable documentation examples

Instruction `role` metadata is generated from canonical instruction
descriptions, not maintained as a second procedure:

```powershell
node scripts\update-docs.mjs --write
node scripts\update-docs.mjs --check
node --test tests\documentation-examples.test.mjs tests\documentation.test.mjs
```

The Rich Email validation examples are explicitly marked and mapped to a
curated safe test. The tests execute their real shipped targets from an
installed-copy fixture and unrelated working directory. Opening Outlook is an
illustrative, consent-dependent example and is never executed by these tests.
Other snippets are not automatically treated as runnable or verified.
Register and test new executable examples explicitly; never evaluate arbitrary
Markdown shell blocks as a documentation checker.

## Onboarding verification

The [first-session guide](getting-started.md) uses Mall-first installation.
The [install reference](install.md#mall-option) keeps the reviewed-release
route canonical and records the observed deprecation of direct source installs.
Source and Mall can share a plugin version while having different contents,
so record the loaded root and revision when available.

Run the focused documentation and routing checks without installing anything:

```powershell
node --test tests\documentation.test.mjs tests\documentation-examples.test.mjs tests\onboarding.test.mjs tests\smoke.test.mjs tests\native-compatibility.test.mjs
node scripts\update-docs.mjs --check
node skills\compile-brain\scripts\check-links.cjs README.md ROADMAP.md RELEASE-CHECKLIST.md docs\getting-started.md docs\install.md docs\testing.md
```

The onboarding regression copies shipped files to a temporary installed-package
fixture and runs bootstrap with an explicit disposable profile target, an empty
tool PATH, and an unrelated adopter workspace. It checks that preview creates no
instructions, fixture apply verifies hashes and receipt, and the next preview
preserves every instruction and receipt without changes. The adopter workspace
remains empty. Navigation checks include the preserved README anchors and the
relocated host reference; generated catalogs remain canonical in the README.

The documented plugin installation commands are not executed by these tests.
The synthetic reasoning prompt has a reader-facing success rubric, not a
machine-verified model outcome. Skill invocation, loaded instructions, and
observed behavior in a real host remain separate R8 evidence.

## Scenario and browser evidence

The [versioned scenario kit](verification/README.md) covers representative
skill families and failure/consent boundaries. Its tests check fixture structure,
declared skill owners, and coverage; they do not grade model responses or turn
unrun hosts into verified rows.

The [CLI scenario runner](../scripts/run-skill-scenarios.mjs) probes one explicitly
selected installed executable with automatic updates disabled, exposes only
guidance-loading tools, and sends exact versioned prompts via stdin.
Its [deterministic regressions](../tests/skill-scenario-runner.test.mjs) cover
version-bound flag selection, explicit session-local package selection, and
fail-closed response/tool/mutation evidence. A disposable corrected source copy
can be selected without installing it; read-reference digests preserve its
identity after cleanup.
Real model results require the separate semantic review described in the
[scenario run guide](verification/README.md#running-the-cli-scenarios).

The [browser acceptance guide](verification/flint-browser.md) documents the
optional real-browser gate and its recorded scope. It runs outside the existing
CI lanes because those runners do not provision browser binaries. Do not silently
add browser downloads to satisfy it.

```powershell
node --test tests\evaluation-guide.test.mjs tests\skill-scenarios.test.mjs tests\showcase-provenance.test.mjs tests\flint-browser-acceptance.test.mjs
node scripts\flint-browser-acceptance.mjs --channel msedge
```

The first command validates deterministic helpers and documentation contracts,
not actual browser behavior. The second runs the existing Playwright package
and installed browser, including saved-file verification and cleanup.
Generated pages expose source status and deterministic input/content provenance;
the original embedded App and upstream notices remain unchanged.

## Evidence limits

The adversarial-regression checks use disposable profiles, project scaffolds
and converter outputs. They do not reinstall a real plugin, activate a user
profile, send email or provision dependencies:

```powershell
node --test tests\reinstall-release.test.mjs tests\install-optional-dependencies.test.mjs tests\activation-conflicts.test.mjs tests\bootstrap-project.test.mjs
node --test tests\brain-tools.test.cjs tests\deterministic-helpers.test.cjs tests\process-launch.test.mjs tests\tool-shims.test.cjs tests\runtime-readiness.test.mjs tests\documentation-examples.test.mjs
node --test tests\markdown-inline-code.test.cjs tests\md-to-word.test.mjs tests\converter-safety.test.cjs tests\output-publication.test.cjs tests\rich-email.test.cjs
```

Real DOCX media preservation, detached Word conversion, HTML TOC and local-image
embedding run in `tests\conversion-runtime.test.cjs` with existing Pandoc and
the explicitly selected runtime. Use the strict integration lane above to
reject missing prerequisites or skipped cases. Mocked renderer failures and
PowerShell SVG-input checks do not establish browser readiness.

Converter regressions also cover literal image examples in DOCX code alongside
real media, and malformed PNG chunks, checksums, compressed data, raster length,
and row filters. Failed PNG validation must not call Pandoc or replace a prior
diagram/Word output. Positive rendering fixtures use checksum-correct PNG bytes.

Version `0.9.1` regressions additionally cover email-header controls (including
test mode), executable source/rendered HTML, encoded UNC/device paths, code
inside Markdown containers, and the exact 256 MiB PNG raster budget. Renderer
and Pandoc failures preserve the complete prior document/media set. Publication
tests inject later replacement and rollback failures; they do not prove
power-loss or process-crash atomicity. Installer fixtures verify first-install
behavior and refusal to replace existing or cross-source packages in both
Windows PowerShell versions; no real profile or CLI installation is modified.

CI is not live Copilot skill invocation, browser gesture/accessibility UAT, a
security audit, New Outlook opening/sending, or a paid Replicate request.
Those require their own scoped evidence and consent. See the
[release checklist](../RELEASE-CHECKLIST.md) and [roadmap](../ROADMAP.md).
