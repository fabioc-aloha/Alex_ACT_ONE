# Handoff

## Current State

- The mission is to maintain and ship Alex ACT ONE. Resume product maintenance,
  verification, and release preparation from [ROADMAP.md](ROADMAP.md), not
  cross-repository recovery or fleet operations.
- The published baseline is
  [0.9.6](https://github.com/fabioc-aloha/Alex_ACT_ONE/releases/tag/v0.9.6),
  frozen at `0e71824e3a931a3beeb3bd8e97c76d3c7273b93b`. The full same-commit
  source matrix passed. Mall publication selects `v0.9.6` and
  `package/alex-act-one`; [the release evidence](archive/verification/release-0.9.6/README.md)
  records exact source, payload, browser, and public catalog observations.
- The user explicitly approved publication before their manual script
  installation. GitHub and Mall delivery are verified; native `0.9.6`
  installation, cache parity, activation and host restart remain unverified.
  The earlier [preparation evidence](archive/verification/candidate-0.9.6/preparation.json)
  remains historical. The relative-path package-verification hang was fixed.
- The user approved `0.9.7` publication and a fresh manual-install exception.
  Final metadata, version-stamped demos, source/payload hashes and same-commit
  gates are being qualified. Do not treat earlier source CI as this release
  cut. The [release record](archive/verification/release-0.9.7/README.md)
  separates public delivery from unverified native setup; macOS stays pending.
- Unreleased source now simplifies the root helper: default mode registers
  missing Alex Mall, refreshes registered catalogs and reports installed/latest
  versions. Only `-Apply` installs or updates the latest Mall version and
  activates owned instructions with conflict checks. No checkout version pin,
  optional dependency install, uninstall or forced overwrite is required.
  Stale retired-provider script comments were removed. The frozen `0.9.6`
  payload and installed state are not modified by these source changes.
- The single public source entry point is now `install-and-check.ps1`.
  Default mode reports dependencies too. `-Apply` installs the latest Mall
  plugin, bootstraps owned instructions, then uses that installed owner's pins
  and launcher for dependency setup. It adds only missing Windows Pandoc
  (winget) and selected-Python Pillow, without upgrading existing system tools
  or installing Python. The two old root helper names are removed from source;
  frozen release snapshots are unchanged.
- The release includes hardened artifact/account checks, native Windows path
  resolution, regression coverage, and the [lean package boundary](docs/package.md).
  Both Flint demonstrations are retained with the reviewed locked pins.
  Replicate support is removed; old user state is not deleted. The root helpers
  support guarded explicit updates and selected-runtime verification.
- After the earlier manual reinstall, the last recorded native inventory was enabled `0.9.5`
  from `alex-mall`. The then-loaded installed cache reported `0.9.5`; consented
  bootstrap verification matched all 15 instruction hashes and the unchanged
  current receipt. This does not prove every host loaded the instructions.
- The user's dependency installation succeeded with explicit proxy routing.
  A later no-install check verified all six selected pins, both MCP launchers,
  Mermaid SVG, and SVG-to-PNG rendering with existing Edge. Host MCP
  connectivity remains separate.
- Release `0.9.6` detects the exact configured Microsoft npm proxy and
  selects its confirmed tarball prefix automatically. Explicit routing wins;
  npm settings/security policy are unchanged. The installed/released `0.9.5`
  payload remains immutable and does not contain this `0.9.6` improvement.
- Post-release CI exposed missing candidate marketplace wording and stale
  demo provenance. Both are repaired in source; exact rebuilds changed only
  the dependency-source hash. Standalone strict local gates and fresh Edge
  acceptance passed; [testing](docs/testing.md#post-release-source-ci-repair)
  records the working-source evidence separately from hosted qualification.
- The `0.9.6` hardening adds measured SVG contrast and broader
  keyboard/focus checks. Both demos pass with contrast-tuned house themes,
  opaque points and a numeric bounded-score heatmap mapping. Exact external
  synthetic artifact bytes verified at an approved destination and were
  removed as authorized. [Fresh observations](archive/verification/host-accessibility/2026-11-08/native-observations.json)
  retain native transcript/form and saved-download limits; only the two
  paused test chats were archived with consent. No installed state changed.
- Fresh installed `0.9.5` host evidence is in
  [the task record](archive/verification/host-scenarios/2026-11-08/README.md).
  Exact installed/cache payload parity passed. All six CLI `.2` responses have
  complete guidance-only evidence and separately reviewed expected behavior.
  Native VS Code excerpts show the boundaries but remain truncated; two
  missing-input forms stop at clarification. Scout/Copilot app were not run.
- Actual plan/agent/shell/MCP artifact files are repository-owned and Git-visible.
  Ignored and changed-source synthetic controls exposed stranded artifacts.
  Those host observations added no write-blocking hooks, stronger enforcement
  or installation changes. The CLI runner now accepts a new
  explicit repository evidence directory instead of forcing output outside it.
- Completed recovery, retention, and synchronization records are preserved
  in [the archive](archive/README.md). That work is closed historical context,
  not an active product goal. Dependency pins and unresolved product decisions
  retain their existing acceptance gates.

## Blockers

- Exact installed/cache `0.9.5` bytes were verified; the `0.9.6` release's
  native installation is not. Native transcript completeness, unanswered
  clarification flows, additional hosts, coverage beyond the approved
  synthetic external destination, and stronger write enforcement remain gaps.
  Do not treat file parity alone as complete host behavior.
- Later delivery changes require their own reviewed commit and fresh
  same-commit release evidence. The dated manual-install exceptions do not
  relax future release gates.
- Remaining live-host/accessibility evidence and runtime rollback design remain in
  [ROADMAP.md](ROADMAP.md). Do not close them using historical test results.
- Artifact guidance and checkers are not an all-filesystem host permission
  boundary; stronger enforcement retains its separate product acceptance gate.

## Next Action

From the current source checkout, use `.\install-and-check.ps1` to refresh
catalogs and inspect installed/latest versions; add `-Apply` only for a
user-approved update, instruction bootstrap and full dependency setup.
Review the selected Python, system managers, private/global destinations and
browser readiness before applying. Use a standalone terminal
after closing hosts that may lock the package.
Leave installation to the user unless separately authorized. Record actual
installed root/version, package/cache parity, bootstrap receipt and restart
observations separately; publication does not prove any of them.
Preserve the immutable `v0.9.6` tag and its exact verified payload. Later
delivery changes require their own reviewed commit and fresh gates.
Continue R8/artifact-host observations only for the remaining authorized gaps
in [ROADMAP.md](ROADMAP.md), using the frozen task evidence rather than rerunning
known cases and calling them broader coverage. The 107 focused
routing/runtime tests passed in disposable fixtures; real configured-proxy
previews and no-install dependency/render checks also passed. The
[unified setup helper](install-and-check.ps1) needs no explicit
prefix for the recognized proxy in this checkout. Preserve profile conflicts,
reviewed pins, and the frozen release payload. Continue product maintenance from
[ROADMAP.md](ROADMAP.md); R8 remains open. The scalar/array stable-version audit
repair is complete and tested.
Do not resume adopter-recovery operations from this handoff.

## Verification

- [0.9.6 verification](archive/verification/release-0.9.6/README.md) records
  the frozen source, six-job matrix, exact payload, fresh browser observations,
  public Mall route and explicitly deferred manual installation.
- [Testing](docs/testing.md) owns verification environments and dated limits;
  structural release checks require a Git checkout, not an installed cache.
- [0.9.5 verification](archive/verification/release-0.9.5/README.md) records
  passing source gates and publication separately from its then-deferred installation.
  [Fresh host evidence](archive/verification/host-scenarios/2026-11-08/README.md)
  owns the subsequent installed-package observations and their limits.
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
