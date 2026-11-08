# Roadmap

Updated 2026-11-08. This is the product backlog for maintaining and shipping
Alex ACT ONE, not a history of incidents or an adopter-fleet work queue.
The current priority is to prepare the local candidate for verified delivery.
The dependency-audit repair remains a maintenance follow-up; R8 remains next
for host evidence as access permits. Runtime upgrade recovery requires a
design decision before implementation.

Release version: `v0.9.5`. This roadmap describes work beyond its scoped
verification, not an instruction to reopen completed repairs or automatically
change existing installations. See
[installation sources](docs/install.md#installation-sources) for the distinction.
Current verification belongs in [testing](docs/testing.md),
[scenario evidence](docs/verification/README.md), and
[browser evidence](docs/verification/flint-browser.md), not duplicated here.

## Now

**Product focus:** review and qualify the next candidate through the
[delivery gate](#verify-future-delivery-changes). Completed cross-repository
recovery and synchronization are archived; they do not add ongoing operations
to this backlog.

### R8. Run fresh live-host scenarios

**Status:** the CLI invocation is fixed and the revised suite has real model
results in [scenario evidence](docs/verification/README.md). Fresh `.2` reasoning
also loaded the required references in VS Code without coaching.
The recovery finding has a canonical correction, a passing scoped CLI source
retest, and frozen/delivered-package evidence in the
[v0.9.0 release record](https://github.com/fabioc-aloha/Alex_ACT_ONE/releases/tag/v0.9.0).
The original finding and isolated retest remain preserved. Scout and the Copilot app remain not run. Existing candidate
installations require an explicitly approved upgrade to receive new source.

Use the [versioned cases and run guide](docs/verification/README.md) to exercise
reasoning, review, recovery, conversion, chart, and draft-only workflows.
Preserve missing-input, denied-tool fixture, unsupported-output, read-only,
and approval-boundary cases rather than testing only successful requests.

**Next actions**

- Repeat in Scout and the Copilot app as access permits. Expand VS Code coverage
  only with separately observed cases, not by inheriting the boundary-test result.
- Record the loaded plugin root, source revision when available, host/version,
  model/settings, instruction state, exact invocation, response, and tool actions.
- For Scout, verify the shared Copilot CLI store, **Load Copilot CLI skills**,
  the plugin-root check, separate MCP registration, and full restart.
  Use the no-write host activation readiness report before any consented apply.
- Keep unavailable hosts marked not run and unavailable observations unverified.
  Synthetic denied-tool facts are not proof that a real host enforced a denial.

**Done when:** each available host has task-local, inspectable results in the
[manual evidence template](RELEASE-CHECKLIST.md#manual-release-evidence), including
failures and limitations. Discovery, instruction loading, MCP connectivity, and
end-to-end behavior must remain separate claims. Do not mark an inaccessible
host freshly verified or infer semantic compliance from structural tests.

### Repair the dependency update audit

**Status:** reproducible reporting defect found during the
[local installation audit](docs/testing.md#092-local-installation-verification);
the `0.9.5` source repair is awaiting release verification. The configured registry returns array-wrapped
metadata, so equal version strings were reported as updates. A prerelease
`latest` tag was also incorrectly described as a stable update.

**Next actions**

- Correct the existing
  [update auditor](skills/setup-dependencies/scripts/provision-runtime.mjs)
  to handle scalar and single-result array metadata consistently. Reject
  malformed or ambiguous responses explicitly rather than reporting success.
- Distinguish a newer stable version from a prerelease or otherwise anomalous
  `latest` tag. Use fresh metadata for current-version claims without changing
  the configured registry or npm policy.
- Extend the existing
  [runtime readiness tests](tests/runtime-readiness.test.mjs) with equal-version,
  changed-version, scalar/array, prerelease, malformed, and multi-result cases,
  retaining explicit subprocess error and timeout reporting.
- Review surfaced npm and Pillow updates separately. Preserve reviewed source
  pins, the isolated demo lock, and the active runtime until compatibility,
  artifact, and separately approved delivery checks pass.

**Done when:** regression tests prove equal versions remain current across
supported response shapes, only newer stable versions are reported as stable
updates, and invalid or prerelease metadata has an explicit non-success outcome.
The audit remains read-only and no package upgrade is implied by its results.

### Verify future delivery changes

**Status:** release verification follows the
[release checklist](RELEASE-CHECKLIST.md). Each later source or delivery change
needs its own evidence; an earlier candidate's green CI is not transferable.
The `0.9.4` source hardens reusable artifact/authentication safeguards and
provides a [lean package](docs/package.md), with both Flint demonstrations and
runtime owners retained. Its source-path delivery, publication and installed
parity require separate exact-candidate observations.
[Source and Mall publication are complete](archive/verification/release-0.9.4/README.md);
local installation/activation remain deferred to the user's manual reinstall
after an explicit publication exception. Enabled flags and a Git-cache copy
did not establish an installed plugin in the attached environment.
Later changes cannot
inherit those results or move an existing release tag.
The [verification record](docs/testing.md) owns source and package observations;
local Windows results are not a replacement for a green same-commit matrix.

**Next actions**

- Require the activation fixture boundary, conversion source/media/code
  preservation regressions, and corrected browser settling checks to pass
  for the selected candidate. Keep actual browser observations separate from
  structural tests, as described in the [browser evidence](docs/verification/flint-browser.md).
- Keep Mall-first onboarding. Direct installs succeeded for this candidate but
  emitted a deprecation warning covering repositories, URLs, and local paths.
  Plan a separately approved marketplace-based candidate route rather than
  relying on direct installs for future CLI versions. This is future delivery
  planning, not an additional implementation blocker for `0.9.0`. Preserve the observed
  warning in the [install reference](docs/install.md#testing-the-repository-candidate).
  No Mall publication or installation switch is implied by this correction.
- Validate the exact marketplace source-subdirectory schema/adapter or another
  supported delivery mechanism before switching to the lean package.
  Preserve all required runtime owners/resources and both exact Flint demos,
  while keeping maintainer archive and source-only CI tooling out of that package.
  Disposable plugin-directory discovery is not marketplace-install verification.
- For each approved source change, commit and push the reviewed candidate to main.
- Require the Windows/Ubuntu structural matrix, provisioned integration lanes,
  and exact demo rebuilds for that same commit. Verify from a clean clone using
  the [environment contract](docs/testing.md).
- Attach applicable live-host results and explicit unresolved limitations.
  Follow the [release checklist](RELEASE-CHECKLIST.md), not a green-test
  shorthand for release readiness.
- If publication is requested, choose a new version, review source-versus-release
  notices, publish an immutable release, and update the optional Mall route.
  Do not move existing published tags.
- Before enabling automatic plugin replacement, design and test staged delivery
  and rollback without overwriting unrelated profile state. The source helper
  currently verifies matching installations and refuses automatic upgrades.

**Done when:** the selected delivery operation is verified end to end.
A source push, tagged release, Mall update, plugin installation, profile
activation, and runtime upgrade are separate operations requiring their own
approval. No publication or installation is authorized by this roadmap.

## Next

### Verify artifact delivery in supported hosts

**Status:** the product has a shared artifact-delivery contract and local
checker corrections with regression coverage. Verify their behavior in
supported hosts as product capabilities. The completed incident recovery is
historical evidence, not the remaining work or proof of host enforcement.

**Next actions**

- Deliver and activate the updated canonical instructions only after the
  separately approved source/package and exact-target bootstrap operations.
- Exercise the [storage contract](skills/proactive-awareness/references/project-artifact-storage.md)
  in fresh supported-host sessions: requested plans, shell/MCP output,
  subagents, ignored deliverables, and explicit external destinations.
- If stronger enforcement is approved, implement the bounded ledger/checker
  and host adapters from the
  [persistence guide](ARTIFACT-PERSISTENCE-FOR-ALEX-ACT-ONE.md).
  First prove supported hook schemas, invocation, and blocking decisions with
  harmless fixtures. Name arbitrary-write and unavailable-host gaps.
- Keep repository storage, frozen recovery integrity, remote backup, installed
  activation, and runtime enforcement as separate verification claims.

**Done when:** available-host observations prove the claimed instruction
behavior and any approved runtime enforcement; unsupported operations remain
explicitly unverified. The recovery checker does not certify future writes.

### R9. Make runtime upgrades reproducible and recoverable

**Status:** design decision pending; active-runtime changes remain deferred.

The [provisioner](skills/setup-dependencies/scripts/provision-runtime.mjs)
installs into shared active state. The [CI/demo lock](ci/runtime/package-lock.json)
protects build reproducibility, not user-runtime upgrade recovery.

**Decide first**

- Which runtime packages and transitive dependencies are locked, how integrity
  is reviewed, and how selected-server upgrades preserve unselected packages.
- How a candidate runtime is staged, verified, selected, and rolled back across
  supported platforms without silently switching a running host.
- How retained runtimes are owned and eventually cleaned up without removing
  user or unrelated package state.

**Done when:** a failed stage leaves the previous runtime usable; versions,
launches, and real rendering pass before an explicitly approved switch; rollback
is demonstrated in disposable fixtures. Preserve configured registries, npm
policy, explicit runtime-root selection, consent, and host reload boundaries.
Do not use the active user runtime as a failure-test fixture.

### Extend accessibility and browser coverage

**Status:** the scoped local browser gate exists; broader coverage is pending.

Build on the [recorded browser scope and limitations](docs/verification/flint-browser.md)
rather than rerunning the same happy path and calling it full accessibility.

**Next actions**

- Verify actual screen-reader announcements and keyboard traversal across the
  remaining chart types, controls, gestures, and focus-restoration paths.
- Measure SVG text and meaningful chart-color contrast, beyond the sampled shell.
- Verify saved-spec completion in a native integrated browser where supported;
  headless Edge saving is not evidence that the native host saved a file.
- Add browser/OS cases where they change a supported-delivery claim. Decide
  browser provisioning explicitly before adding a required CI browser lane.

**Done when:** the expanded cases have reproducible observations, regression
coverage for fixes, and a published evidence boundary. Unsupported paths stay
blocked or unverified; they must not be hidden behind a passing aggregate.

## Watchlist

- **Native instruction delivery:** retain preview-first bootstrap and receipts
  until supported-host probes establish real activation and safe removal.
  Skill discovery alone is not the retirement gate.
- **Scout command support:** use owning-skill invocation while plugin prompt
  commands remain unavailable in the recorded baseline. Recheck when the host
  changes; do not add another alias to compensate for a missing host surface.
- **Dependency changes:** review version/integrity changes, launch/render behavior,
  upstream notices, and exact artifact differences before updating pins or locks.
  Do not relax registry policy or artifact checks to make an upgrade pass.

## Completion rules

- Keep this repository focused on maintaining and shipping Alex ACT ONE.
  Adopter files/backlogs and fleet or governance operations remain in their
  owning repositories; a past authorized recovery grants no standing scope.
- Close work against its stated acceptance evidence, not implementation alone.
- Keep evidence with the candidate/task; collect no cross-session skill telemetry
  or standing behavioral ledger.
- Keep related docs, generated catalogs, and links consistent. Link to canonical
  results rather than copying changing totals into the roadmap.
- Preserve explicit consent for installation, activation, sending, publication,
  and runtime switching. No unattended changes are planned.
- Provider-specific operations remain outside ONE; no new shared continuity
  store or replacement for human judgment is planned.
