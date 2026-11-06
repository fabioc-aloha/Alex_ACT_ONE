# Handoff

## Current State

- The selected package version is `0.9.2`, including the `100433d` optional
  dependency installer recovery/browser-path additions and the `0.9.2` release
  documentation and continuity reconciliation. The
  [0.9.2 release record](https://github.com/fabioc-aloha/Alex_ACT_ONE/releases/tag/v0.9.2)
  owns final source, publication, CI, and Mall-delivery evidence.
- Prior release [`v0.9.1`](https://github.com/fabioc-aloha/Alex_ACT_ONE/releases/tag/v0.9.1)
  shipped at `a7b4ba6` ([manual CI run 42273804899](https://github.com/fabioc-aloha/Alex_ACT_ONE/actions/runs/42273804899))
  and was published to `Alex_Skill_Mall` (`3c740ba`). The local Copilot CLI
  plugin store and VS Code cache currently have `0.9.1@alex-mall` installed
  with all 15 profile instructions preserved; preparing `0.9.2` does not
  automatically upgrade the active installation or runtime.

## Blockers

- No source-verification blocker remains for `0.9.2` or the earlier `0.9.1`
  production-review findings.
- Remaining host evidence, accessibility coverage, and runtime rollback design
  retain their limits and acceptance gates in [ROADMAP.md](ROADMAP.md).

## Next Action

Verify the loaded package version/root before further host tests, then continue
R8 remaining-host evidence as access permits. Follow the
[delivery tasks](ROADMAP.md#verify-future-delivery-changes) for any later source
or package operation. Active installation switching and runtime upgrades remain
separate operations from source release preparation.

## Verification

- Local Windows/Node 26 verification for `0.9.2` passed 553 structural tests
  and 58 provisioned integration tests with no skips, failures, cancellations,
  or todos, including 80 optional-installer regressions across PowerShell 7 and
  Windows PowerShell 5.1.
- Optional dependency verification (`-VerifyOnly -IncludeReplicate -BrowserExecutablePath`)
  verified all 7 pinned packages, 3 MCP launchers, and real Mermaid SVG and
  SVG-to-PNG rendering with installed Edge.
- Both offline Flint demonstration pages were rebuilt with `0.9.2` provenance
  and passed byte-for-byte checks and standalone headless Edge acceptance.
- Refreshing `w/mixed` working-tree files from the Git index restored clean
  `w/crlf` checkout parity (`preserve:15` on `bootstrap-core` preview against
  the `0.9.1` profile receipt).
- For `v0.9.1` (`a7b4ba6`), hosted manual CI run `42273804899` passed 533
  Windows structural tests per job, 474 Ubuntu structural tests per job on
  Node 24/26, 58 provisioned integration tests per OS, and both canonical
  Windows demo rebuilds.

## References

- [Pending work](ROADMAP.md)
- [Completed history and release evidence](CHANGELOG.md)
- [Verification contract](docs/testing.md)
- [Release gates](RELEASE-CHECKLIST.md)
