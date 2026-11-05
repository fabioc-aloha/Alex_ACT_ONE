# Verification environments and release gates

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

## Evidence limits

CI is not live Copilot skill invocation, browser gesture/accessibility UAT, a
security audit, New Outlook opening/sending, or a paid Replicate request.
Those require their own scoped evidence and consent. See the
[release checklist](../RELEASE-CHECKLIST.md) and [roadmap](../ROADMAP.md).
