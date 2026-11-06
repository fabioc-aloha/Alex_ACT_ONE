# Verification environments and release gates

Release version: `0.9.0`. Use the
[release record](https://github.com/fabioc-aloha/Alex_ACT_ONE/releases/tag/v0.9.0)
for the frozen commit's CI, clean-clone, artifact, and packaged recovery results.
The dated baseline runs below do not substitute for same-commit release evidence.
Live-host and browser observations retain their separately documented limits.

The source workflow targets Windows Server 2025 and Ubuntu 24.04 on x64.
Structural jobs use Node 24 and 26; provisioned integration jobs use Node 26.
These are verification targets, not certification of every Copilot host or OS.
macOS and other Node versions are not covered by this workflow.

## What runs where

| Lane | Prerequisites | Required evidence |
| --- | --- | --- |
| Structural | Git checkout, Node 24+, PowerShell 7; Windows also requires Windows PowerShell 5.1 | Catalog/role drift check, read-only structural assessment, dependency-free tests, and fake-install/activation safety cases |
| Integration | Explicit reviewed MCP runtime, JSZip from the shared registry, Pandoc 3.13, reviewed Mermaid CLI | Actual MCP version/launch and three-backend render tests, real HTML/Word conversion, and installed Mermaid CLI startup |
| Canonical demo rebuild | Windows integration environment | Byte-for-byte checks of both generated HTML pages; Git preserves their LF endings |

Canonical demos additionally require `@napi-rs/canvas@1.0.10`,
`chart.js@4.5.1`, and `@modelcontextprotocol/sdk@1.32.1`, defined in
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

The hosted diagnosis found matching bundled-font hashes but canvas 1.1.0,
Chart.js 4.6.1, and SDK 1.32.2 instead of the reviewed versions. Canvas measured
different glyph widths, changing SVG paths and raster output. These explicit build pins fix renderer input drift rather than rounding paths.
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
`main` and manual dispatch, not pull requests. The integration jobs wait for the
structural matrix. Actions are pinned to reviewed immutable commits, checkout
does not persist credentials, and token permissions are read-only.

Only disposable integration runners install packages. MCP, JSZip, and Mermaid
direct versions agree with the [shared dependency registry](../scripts/shared/dependencies.cjs).
The workflow uses the runner's configured npm registry without a registry URL
override, suppresses lifecycle scripts for these installs, and does not request
API credentials or browser downloads. Pandoc 3.13 is installed by the pinned
Pandoc setup action.

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

CI is not live Copilot skill invocation, browser gesture/accessibility UAT, a
security audit, New Outlook opening/sending, or a paid Replicate request.
Those require their own scoped evidence and consent. See the
[release checklist](../RELEASE-CHECKLIST.md) and [roadmap](../ROADMAP.md).
