# Handoff

## Current State

- The selected release is `0.9.3`. The
  [0.9.3 release record](https://github.com/fabioc-aloha/Alex_ACT_ONE/releases/tag/v0.9.3)
  owns final source, publication, CI, and Mall-delivery evidence; earlier
  `0.9.2` local audit evidence remains in
  [verification history](docs/testing.md#092-local-installation-verification).
- Release `0.9.3` recovers stranded reports and supporting evidence in
  [the repository recovery index](docs/verification/session-recovery/README.md),
  adds shared instruction-level artifact-storage safeguards, and ships
  deterministic helpers for
  [session-artifact detection](skills/proactive-awareness/scripts/check-session-artifacts.cjs)
  and [multi-account GitHub credential pinning](skills/git-workflow/scripts/check-git-auth.cjs).
  Dependency pins and Replicate retirement proposal status are unchanged.
- Source maintenance adds a scoped recovery helper and
  [development-repository recovery evidence](docs/verification/development-recovery/2026-11-08/README.md).
  The user approved local recovery, then separately authorized synchronizing
  its scoped changes through each repository's upstream and required policies.
  The synchronization snapshot owns per-repository results and blockers.
  This does not authorize installation, production deployment, or a release.

## Blockers

- The dependency update audit has reproducible reporting errors; Replicate's
  live public-model probe returned HTTP 401 despite a successful launch check.
  Their scope and pending decisions are recorded in [ROADMAP.md](ROADMAP.md).
- Remaining host evidence, accessibility coverage, and runtime rollback design
  retain their existing acceptance gates. Local readiness is not an all-host
  production certification.
- The storage policy is effective repository guidance, not a tested host
  permission boundary. Installed-package activation and hook enforcement retain
  the [artifact-delivery gate](ROADMAP.md#verify-artifact-delivery-in-supported-hosts).

## Next Action

Review and authorize the scoped
[dependency-audit repair](ROADMAP.md#repair-the-dependency-update-audit), with
regressions in the existing readiness suite. R8 remains the next host-evidence
track as access permits. Follow the
[delivery tasks](ROADMAP.md#verify-future-delivery-changes) for any later source
or package operation. Active installation switching and runtime upgrades remain
separately approved operations.

## Verification

- The [local installation verification](docs/testing.md#092-local-installation-verification)
  records source structural and installed-package integration results,
  activation parity, renderer checks, and separate host/API observations.
  Structural checks require the Git checkout, not the installed cache.
- Prior release and pre-upgrade activation evidence is preserved in
  [CHANGELOG.md](CHANGELOG.md) and [docs/testing.md](docs/testing.md). This session
  did not repeat the demonstration rebuilds or full browser acceptance.
- [Artifact recovery verification](docs/testing.md#repository-artifact-recovery)
  records exact recovered hashes, original preservation, and targeted
  policy/routing/bootstrap regressions. The checker can run without external
  session storage.

## References

- [Pending work](ROADMAP.md)
- [Completed history and release evidence](CHANGELOG.md)
- [Verification contract](docs/testing.md)
- [Release gates](RELEASE-CHECKLIST.md)
