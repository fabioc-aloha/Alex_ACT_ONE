# 0.9.5 release verification

Published source: `26d0518ec998817ed2d5c27a66855a58747e820c`.
The [release](https://github.com/fabioc-aloha/Alex_ACT_ONE/releases/tag/v0.9.5)
and public Mall select `v0.9.5:package/alex-act-one`.
The user will reinstall manually; no local upgrade or activation is claimed.

## Evidence

- [All six same-commit Windows/Ubuntu jobs passed](https://github.com/fabioc-aloha/Alex_ACT_ONE/actions/runs/42517956711).
- Fresh GitHub checkout: 608 structural and 57 integration tests passed, with
  no failures, skips, todos, or cancellations.
- Both exact demo rebuilds and all payload/source hashes passed. The runtime
  payload contains 254 files and 11,285,099 bytes; its receipt is additional.
- [Real Edge acceptance](browser.json) passed both retained demos using the
  upgraded renderer inputs.
- [Microsoft-proxy pin selection](npm-pins.json) records all nine current stable
  source pins and the explicit locked-registry URL rebasing.
- Real optional dependency verification passed six selected package versions,
  both MCP launchers, Mermaid SVG, and SVG-to-PNG rendering in the disposable
  runtime. No active user runtime or npm policy was changed.
- [Release notes and manual setup sequence](release-notes.md).

The initial local source gate encountered a file-rename `EPERM` in an activation
fixture. It was not counted as success. All 26 activation/conflict cases then
passed in a targeted run, followed by the complete clean-checkout gates and
hosted matrix above. Earlier stale generated candidates and disposable runtime
state were removed from source analysis only after ownership/hash checks.

The snapshot in [retired assets](../../retired-assets/manifest.json) preserves
the old skill's exact published bytes so frozen archive citations remain
verifiable. It is inactive, excluded from the package, and not a replacement
for the removed skill. No removed-provider packages or configuration remain
in the active manifest, source installer, or locked runtime.

Mall metadata was committed at
`48eabd6a51cdac67586dc61254344ca6039e03e0` before catalog generation.
Publication commit `09b7eed4ac4fc375035658ee648d7fa67732821d` was pushed with
69 passing tests and catalog validation. Public version/ref/path were verified.
GitHub accepted the push with a rule-bypass notice; no rule was edited.

The temporary runtime and verification checkout were removed. Installed ONE
remained enabled `0.9.3`. The user explicitly approved source/Mall publication
and will use the updated scripts manually. All-host behavior, broader
accessibility, and runtime rollback design remain separate pending work.
