# Handoff

## Current State

- The mission is to maintain and ship Alex ACT ONE. Resume product maintenance,
  verification, and release preparation from [ROADMAP.md](ROADMAP.md), not
  cross-repository recovery or fleet operations.
- The published baseline is
  [0.9.5](https://github.com/fabioc-aloha/Alex_ACT_ONE/releases/tag/v0.9.5),
  frozen at `26d0518ec998817ed2d5c27a66855a58747e820c`. The full same-commit
  source matrix passed. Mall publication selects `v0.9.5` and
  `package/alex-act-one`; [the release evidence](archive/verification/release-0.9.5/README.md)
  records exact source, payload, browser, and public catalog observations.
- The release includes hardened artifact/account checks, native Windows path
  resolution, regression coverage, and the [lean package boundary](docs/package.md).
  Both Flint demonstrations are retained and rebuilt with reviewed newer pins.
  Replicate support is removed; old user state is not deleted. The root helpers
  now support explicit safe refresh and selected-runtime verification.
- After the user's manual reinstall, native inventory reports enabled `0.9.5`
  from `alex-mall`. The loaded installed cache reports `0.9.5`; consented
  bootstrap verification matched all 15 instruction hashes and the unchanged
  current receipt. This does not prove every host loaded the instructions.
- The user's dependency installation succeeded with explicit proxy routing.
  A later no-install check verified all six selected pins, both MCP launchers,
  Mermaid SVG, and SVG-to-PNG rendering with existing Edge. Host MCP
  connectivity remains separate.
- Unreleased source now detects the exact configured Microsoft npm proxy and
  selects its confirmed tarball prefix automatically. Explicit routing wins;
  npm settings/security policy are unchanged. The installed/released `0.9.5`
  payload remains immutable and does not contain this source improvement.
- Completed recovery, retention, and synchronization records are preserved
  in [the archive](archive/README.md). That work is closed historical context,
  not an active product goal. Dependency pins and unresolved product decisions
  retain their existing acceptance gates.

## Blockers

- Full installed-payload byte parity and broader live-host observations remain
  separate from the verified inventory, instruction parity, and dependency
  checks. Do not treat an enabled flag alone as complete host verification.
- Later delivery changes require their own reviewed commit and fresh
  same-commit release evidence. The dated manual-install exceptions do not
  relax future release gates.
- Remaining live-host/accessibility evidence and runtime rollback design remain in
  [ROADMAP.md](ROADMAP.md). Do not close them using historical test results.
- Artifact guidance and checkers are not an all-filesystem host permission
  boundary; stronger enforcement retains its separate product acceptance gate.

## Next Action

Qualify the unreleased proxy-routing source change through the existing
release gates before separately approved publication. The 107 focused
routing/runtime tests passed in disposable fixtures; real configured-proxy
previews and no-install dependency/render checks also passed. The
[optional installer](install-optional-dependencies.ps1) needs no explicit
prefix for the recognized proxy in this checkout. Preserve profile conflicts,
reviewed pins, and the frozen release payload. Continue product maintenance from
[ROADMAP.md](ROADMAP.md); R8 remains open. The scalar/array stable-version audit
repair is complete and tested.
Do not resume adopter-recovery operations from this handoff.

## Verification

- [Testing](docs/testing.md) owns verification environments and dated limits;
  structural release checks require a Git checkout, not an installed cache.
- [0.9.5 verification](archive/verification/release-0.9.5/README.md) records
  passing source gates and publication separately from deferred installation.
  Earlier [candidate package verification](docs/verification/package/README.md)
  is historical; rebuild a payload after changing its included source.
- [CHANGELOG.md](CHANGELOG.md) and the archive preserve completed history.
  Post-publication documentation does not move the frozen release tag or
  imply local installation or provider authorization.

## References

- [Pending work](ROADMAP.md)
- [Completed history and release evidence](CHANGELOG.md)
- [Verification contract](docs/testing.md)
- [Release gates](RELEASE-CHECKLIST.md)
