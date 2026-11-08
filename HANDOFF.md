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
- Post-release CI exposed missing candidate marketplace wording and stale
  demo provenance. Both are repaired in source; exact rebuilds changed only
  the dependency-source hash. Standalone strict local gates and fresh Edge
  acceptance passed; [testing](docs/testing.md#post-release-source-ci-repair)
  records the working-source evidence separately from hosted qualification.
- The approved next-candidate hardening adds measured SVG contrast and broader
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
  No host write-blocking hooks, stronger enforcement, installation changes,
  or external publication occurred. The source CLI runner now accepts a new
  explicit repository evidence directory instead of forcing output outside it.
- Completed recovery, retention, and synchronization records are preserved
  in [the archive](archive/README.md). That work is closed historical context,
  not an active product goal. Dependency pins and unresolved product decisions
  retain their existing acceptance gates.

## Blockers

- Exact installed/cache bytes are verified; native transcript completeness,
  unanswered clarification flows, additional hosts, approved external
  artifact destinations, and stronger write enforcement remain separate gaps.
  Do not treat file parity alone as complete host behavior.
- Later delivery changes require their own reviewed commit and fresh
  same-commit release evidence. The dated manual-install exceptions do not
  relax future release gates.
- Remaining live-host/accessibility evidence and runtime rollback design remain in
  [ROADMAP.md](ROADMAP.md). Do not close them using historical test results.
- Artifact guidance and checkers are not an all-filesystem host permission
  boundary; stronger enforcement retains its separate product acceptance gate.

## Next Action

Use the repaired candidate's exact-commit full matrix and clean-checkout results
to qualify the unreleased proxy-routing and repository-evidence runner changes.
If those gates pass, choose whether to prepare a new release; publication,
Mall updates, installation, and activation still require separate approval.
If any gate fails, repair that candidate before proceeding.
Continue R8/artifact-host observations only for the remaining authorized gaps
in [ROADMAP.md](ROADMAP.md), using the frozen task evidence rather than rerunning
known cases and calling them broader coverage. The 107 focused
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
