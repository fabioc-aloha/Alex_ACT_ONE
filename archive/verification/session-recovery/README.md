# Recovered project artifacts

Recovered on 2026-11-07 from local sessions belonging specifically to
`fabioc-aloha/Alex_ACT_ONE`. These are historical reports and supporting evidence,
not current verification, an active backlog, or authorization to rerun old helpers.

On 2026-11-08 the user approved the full lean retention review: 127 empty,
duplicate, polling, and redundant/provisional artifacts were pruned. The archive
retains 93 historical files (5,016,321 bytes); all 99 archive recommendations
across historical and recovery-created files remain preserved.
The [approval inventory and implementation receipt](../recovery-retention-review/2026-11-08/README.md)
record the decisions. The manifest keeps the original 220-file inventory
accounted for through retained and pruned entries, including original/recovered
hashes, review IDs, reasons, and the prior Git commit from which removed bytes
remain recoverable. External originals and published Git history are unchanged.

## Reports and helper

| Artifact | Purpose |
| --- | --- |
| [Native-feature audit](history/11372d9c-45f0-4e30-8d17-f7c60c3eb4f9/copilot-native-replacement-audit-2026-11-04.md) | Original simplification recommendations |
| [Installed skill-test report](history/11372d9c-45f0-4e30-8d17-f7c60c3eb4f9/skill-test-report-2026-11-05.md) | Dated test findings and limitations, with supporting traces alongside it |
| [0.9.0 release notes](history/11372d9c-45f0-4e30-8d17-f7c60c3eb4f9/release-0.9.0.md) | Historical release and delivery evidence |
| [Production-readiness review](history/3e832a77-ed36-4c86-a4ee-070100b1c775/production-readiness-review.md) | Original findings and their subsequent resolution |
| [Delivery-verification helper](history/3e832a77-ed36-4c86-a4ee-070100b1c775/verify-mall-delivery.cjs) | Frozen helper pinned to an older source commit and release; not a current release gate |

The same history directories preserve related assessments, test logs, JSON
observations, screenshots, release-note inputs, and failed diagnostics.
Separate historical browser and `0.9.2` installation checks are retained under
their originating session IDs. The production-review session's second copy was
checked byte-for-byte and recorded as a duplicate rather than archived twice.

## Inventory, privacy, and integrity

[manifest.json](manifest.json) inventories every recovered file, its original
and recovered byte length and SHA-256, declared redactions, source session ID,
and deliberately excluded runtime files. It stores no user-identifying home path.

User-home paths and email addresses in textual evidence are redacted. Historical
local links are rebased where their targets survive; unavailable source links
remain labeled historical text. Reports carry an explicit historical-status
notice. Source-bound hashes in reports are not fresh verification.
Originals remain untouched outside the
repository; the repository copy is independently usable without session storage.
The manifest distinguishes redacted bytes from the original bytes.
Git preserves historical byte streams without newline or whitespace cleanup;
whitespace checks remain enabled for current source and documentation.

Disposable clones, command-argument files, process logs/locks, and raw runtime
event streams are excluded. Semantic observations, failure output, and useful
project helpers are retained. Installed packages, credentials, global settings,
native databases, and sibling-project artifacts were not imported.
Credential-pattern screening is a bounded check, not proof that arbitrary
external content is safe to publish.

## Verification

Run from the repository root:

```powershell
node scripts\session-recovery.mjs
node --test tests\session-recovery.test.mjs tests\artifact-storage.test.mjs
```

The checker verifies inventory completeness, exact recovered bytes, declared
edits, privacy screening, and real-path containment. It rejects missing,
corrupted, unregistered, escaping, linked, empty, or unsupported evidence.
It never refreshes historical files to make a failure pass.

The recovery command in the [versioned helper](../../../scripts/session-recovery.mjs)
is only for this authorized historical inventory and requires the explicit
session root. It refuses to overwrite an existing or partial recovery.
It is not a hook or an all-filesystem enforcement mechanism.

Future artifact delivery follows the
[shared storage contract](../../../skills/proactive-awareness/references/project-artifact-storage.md).
Current verification and pending work remain in
[testing](../../../docs/testing.md) and [ROADMAP](../../../ROADMAP.md).
