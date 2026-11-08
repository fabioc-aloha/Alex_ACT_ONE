# Alex ACT ONE 0.9.5: aligned manual setup without bundled image generation

- Removed Replicate's skill, MCP configuration, dependency pin, provisioning
  route, installer option, and active guidance. Historical snapshots stay
  outside the runtime package. Existing private packages, credentials, and
  user-owned server registrations are not deleted.
- Added explicit `-Refresh` to the root plugin helper. It refreshes Mall and
  updates an existing enabled Mall installation, never uninstalling first.
  Default preservation, duplicate/source checks, and activation conflict
  guards remain. Failed or no-op updates cannot activate a stale release.
- Updated reviewed stable npm pins from the configured Microsoft proxy:
  Playwright MCP `0.0.84`, JSZip `3.10.2`, Mermaid CLI `12.0.0`, canvas `1.1.0`,
  Chart.js `4.6.1`, and SDK `1.32.2`. Flint and svgexport pins remain current.
  The read-only update audit correctly handles scalar/single-result-array
  metadata and rejects ambiguous, malformed, prerelease, or regressed values.
- Optional dependency installation honors the selected runtime and verifies
  exact metadata, real MCP startup, Mermaid SVG, and SVG-to-PNG output.
  Both Flint demos were rebuilt and passed real Edge acceptance with the
  upgraded renderer inputs.

## Installation boundary

The maintainer will install manually from a standalone terminal. This release
does not claim a completed local upgrade, activation, fresh host MCP connection,
or removal of old user state. Native CLI install/list inconsistencies observed
in the attached environment are not resolved by this source change.

Install the matching plugin before updating its private runtime:

```powershell
$ErrorActionPreference = 'Stop'
.\reinstall-and-check.ps1 -Refresh -ExpectedVersion 0.9.5
.\install-optional-dependencies.ps1
# Review the preview before applying:
.\install-optional-dependencies.ps1 -Apply
.\install-optional-dependencies.ps1 -VerifyOnly
```

If npm refuses backend tarballs with `EALLOWREMOTE`, stop and preview explicit
per-command routing for the confirmed rejected prefix. The root README
documents the prefix verified through `https://packagefeedproxy.microsoft.io/npm/`.
Do not enable remote fetching, switch registries, or suppress installation errors.
Pandoc/Pillow and optional companion/Microsoft plugins remain separate opt-in
operations. Restart the host after verified setup.

Source publication requires the complete same-commit Windows/Ubuntu Node 24/26
matrix. All-host behavior, accessibility expansion, and runtime rollback design
retain their separate acceptance gates.

## Verified source

- Frozen commit: `26d0518ec998817ed2d5c27a66855a58747e820c`.
- [All six hosted jobs passed](https://github.com/fabioc-aloha/Alex_ACT_ONE/actions/runs/42517956711).
- Fresh GitHub checkout: 608 structural and 57 integration tests passed,
  without failures, skips, todos, or cancellations.
- Both exact demo rebuilds, payload/source hashes, and standalone real Edge
  acceptance passed. Real Mermaid SVG and SVG-to-PNG checks passed with the
  upgraded pins in an isolated runtime.
