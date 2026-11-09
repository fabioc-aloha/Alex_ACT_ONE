# Roadmap

Updated 2026-11-09. This is the product backlog for maintaining and shipping
Alex ACT ONE, not a history of incidents or an adopter-fleet work queue.
The source and Mall `0.9.7` release is published. The user will install it
manually using the script; only earlier `0.9.5` installed-package parity is
recorded. R8 remains next for observable host evidence as access permits.
Runtime upgrade recovery requires a
design decision before implementation.

Release version: `v0.9.7`. Publication is verified, not native installation
or activation. This roadmap describes work beyond the published
baseline's scoped verification, not an instruction to reopen completed repairs or automatically
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
The [0.9.7 release record](archive/verification/release-0.9.7/README.md) owns
the exact source, same-commit gates, payload, browser and public Mall evidence.
Await the user's manual installation result; do not infer it from publication.

### R8. Run fresh live-host scenarios

**Status:** fresh installed `0.9.5` CLI and VS Code `.2` cases ran on 2026-11-08.
[The task-local evidence](archive/verification/host-scenarios/2026-11-08/README.md)
records six complete CLI responses with successful guidance-only process gates
and separately reviewed expected observations. Native VS Code responses show
the representative boundaries, but transcript truncation and two unanswered
clarification forms prevent a complete native verdict. Scout and Copilot app
remain not run by explicit user scope. Historical findings/retests remain
in [scenario evidence](docs/verification/README.md), not rewritten as new passes.
The [additional native probes](archive/verification/host-accessibility/2026-11-08/native-observations.json)
reproduced truncated tool arguments and paused clarification forms. Queued
and separately steered synthetic follow-ups exposed no completed answers,
including after the user reported answering the forms. The user approved
archiving only those test chats, preserving history. R8 remains open; another
identical rerun is not the next action without an observable completion path.

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

### Verify future delivery changes

**Status:** release verification follows the
[release checklist](RELEASE-CHECKLIST.md). Each later source or delivery change
needs its own evidence; an earlier candidate's green CI is not transferable.
The `0.9.4` source hardens reusable artifact/authentication safeguards and
provides a [lean package](docs/package.md), with both Flint demonstrations and
runtime owners retained. Its source-path delivery, publication and installed
parity require separate exact-candidate observations.
[Source and Mall 0.9.5 publication are complete](archive/verification/release-0.9.5/README.md);
after an explicit manual-install publication exception.
The subsequent [host verification](archive/verification/host-scenarios/2026-11-08/README.md)
matched every installed/cache payload file and the preserved instruction
preview against the release. This establishes exact installed bytes, not
complete host semantics or future delivery behavior.
Later changes cannot
inherit those results or move an existing release tag.
The [verification record](docs/testing.md) owns source and package observations;
local Windows results are not a replacement for a green same-commit matrix.

**Next actions**

- Require the activation fixture boundary, conversion source/media/code
  preservation regressions, and corrected browser settling checks to pass
  for the selected candidate. Keep actual browser observations separate from
  structural tests, as described in the [browser evidence](docs/verification/flint-browser.md).
- Keep Mall-first onboarding and preserve the historical direct-install
  deprecation warning in the
  [install reference](docs/install.md#testing-the-repository-candidate).
  Later candidate-route changes need separately approved native installation
  evidence; source mounting or a version string alone is not enough.
- For each candidate, revalidate the exact marketplace source-subdirectory
  schema/adapter when changing the currently published lean route or another
  delivery mechanism.
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
  now refreshes only Alex Mall and reports versions by default; explicit
  `-Apply` in `install-and-check.ps1` installs/updates the latest Mall release,
  bootstraps guarded owned instructions and sets up dependencies from that
  installed owner's pins. It never uninstalls first. That is not staged/transactional rollback
  or standing authority for automatic replacement.

**Done when:** the selected delivery operation is verified end to end.
A source push, tagged release, Mall update, plugin installation, profile
activation, and runtime upgrade are separate operations requiring their own
approval. No publication or installation is authorized by this roadmap.

## Next

### Verify artifact delivery in supported hosts

**Status:** [fresh VS Code artifact observations](archive/verification/host-scenarios/2026-11-08/README.md)
verify a requested plan, native agent JSON, shell output, and direct MCP file
output in Git-visible repository destinations. Ignored-copy and changed-source
controls failed as expected; copying to a Git-visible destination resolved the
synthetic stranded result. Native browser rendering is observed, while its
inline screenshot did not establish file delivery. Scout/Copilot app and
strong host enforcement remain unverified.
[A user-approved external synthetic destination](archive/verification/host-accessibility/2026-11-08/external-artifact.json)
now has exact-byte verification and approved cleanup. Native trusted
download-button activation exposed neither a download event nor a saved file.
That limitation is not replaced by headless download evidence. Synthetic
checker metadata is not a natural host-stranding incident.

**Next actions**

- Later canonical instruction updates still require separately approved
  source/package delivery and exact-target bootstrap operations.
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

### Support unified installation and dependencies on macOS

**Status:** planned documentation only; implementation and native macOS
verification are not authorized by this entry. The current unified
[setup helper](install-and-check.ps1) has Windows-only automatic Pandoc
installation. Existing cross-platform commands are not macOS certification.

**Next actions**

- Define supported macOS versions and Apple Silicon/Intel coverage. Choose
  the supported entry point, including whether PowerShell 7 is a prerequisite,
  before implementation. Preserve the unified contract: default mode reports
  status without installing or activating; only explicit `-Apply` changes
  plugins, instructions or dependencies.
- Verify Alex Mall registration/refresh, latest-release installation/update,
  installed-owner dependency pins, per-profile instruction bootstrap, conflict
  preservation and environment restoration on the selected native hosts.
- Design missing-Pandoc installation through an existing Homebrew and Pillow
  installation in an explicitly selected existing Python environment. Respect
  externally managed Python environments and configured package sources.
  Do not silently install Homebrew/Python, force upgrades, escalate privileges
  or bypass package-manager policy.
- Handle architecture-specific package prefixes, private/global npm locations,
  executable discovery and paths containing spaces. Select compatible browser
  executables and Playwright launch settings without inheriting Windows paths
  or assuming Edge is installed. Keep browser acquisition separately approved.
- Add macOS test/CI coverage for the declared platform baseline, including
  missing prerequisites, failed/no-op installers, denied changes, profile
  conflicts, version drift and no-install modes. Preserve Windows/Ubuntu
  behavior; do not infer native macOS success from their passing fixtures.

**Done when:** a fresh checkout on each claimed macOS architecture has
inspectable default-report and consented apply results, installed-package and
bootstrap verification, selected-Python/Pandoc probes, MCP launches and real
conversion/render output. Record browser/host limitations and preserved
unrelated user state. Unsupported architectures or hosts remain unverified;
no existing release gains a macOS support claim retroactively.

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

**Status:** the [expanded local gate](archive/verification/host-accessibility/2026-11-08/browser.json)
passes baseline SVG text/mark/outline contrast and additional keyboard/focus
restoration on both demos. Approved contrast-tuned theme variants and numeric
heatmap mapping preserve the data and bounded score domain. Screen-reader
speech, remaining gestures/chart families, color-to-color distinguishability,
and integrated-browser saving remain pending.

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
