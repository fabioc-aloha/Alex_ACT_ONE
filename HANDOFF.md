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
- Local installation remains enabled `0.9.3`. The attached CLI's apparent
  install success did not yield an installed entry or skill discovery.
  The user explicitly approved publication and will run the manual reinstall.
  No `0.9.5` local upgrade, activation, or refreshed host cache is claimed.
- Completed recovery, retention, and synchronization records are preserved
  in [the archive](archive/README.md). That work is closed historical context,
  not an active product goal. Dependency pins and unresolved product decisions
  retain their existing acceptance gates.

## Blockers

- The deferred local installation/activation gate remains open. Verify one
  enabled `0.9.5` Mall entry and actual installed bytes before running the
  activation helper. Do not treat cached source or enabled flags as installation.
- Later delivery changes require their own reviewed commit and fresh
  same-commit release evidence. The dated manual-install exceptions do not
  relax future release gates.
- Remaining live-host/accessibility evidence and runtime rollback design remain in
  [ROADMAP.md](ROADMAP.md). Do not close them using historical test results.
- Artifact guidance and checkers are not an all-filesystem host permission
  boundary; stronger enforcement retains its separate product acceptance gate.

## Next Action

The user will run [the reinstall/activation helper](reinstall-and-check.ps1)
with `-Refresh -ExpectedVersion 0.9.5` from a standalone terminal, then preview
and apply [optional dependencies](install-optional-dependencies.ps1).
Refresh never uninstalls first or forces instruction conflicts. Preserve
profile conflicts and reviewed runtime pins; verify the loaded root after a
host restart. The [release notes](archive/verification/release-0.9.5/release-notes.md)
contain the command sequence. Continue product maintenance from
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
