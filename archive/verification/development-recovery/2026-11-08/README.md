# Local development repository recovery

Status: Historical recovery. Source synchronization has separate verification.

The user authorized inspection, scoped repository guidance patches, and copying
missing project files into their owning repositories. This pass covers the
17 top-level Git worktrees under `C:\Development` and their matching local
session files areas, not deleted saved edits or unavailable remote sessions.

## Results

[results.json](results.json) records per-repository copy counts, existing
repository copies, exclusions, and the owning recovery indexes.
The recovery copied 128 reviewed artifacts into eight owning repositories.
Original session files and existing repository recovery archives were preserved.
SurveyFunnel's retained screenshots were reviewed using a repository-owned
contact sheet; original PNG bytes were copied unchanged.

Storage guidance was added only where missing. Existing guidance in ACT ONE,
AlexBooks, and TheEditor remained unchanged. Steward's local behavior change
has its own approved decision and curation evidence.

Each owning manifest records original/recovered SHA-256 and declared privacy
or link adjustments. Recovered helpers are historical evidence, not installed
or integrated automation. Current application code, manuscript sources, native
session databases, installed packages, account selection, and remote branches
were not modified.

## Exclusions and limits

Runtime packages, caches, raw event streams, disposable clones, credential-like
content, raw production definitions, identity-bearing data, and unreviewed
encoded payloads were not imported. Their owning manifests preserve the
excluded-path/reason inventory without the content.
Existing binary evidence in earlier archives was not recopied or edited.
These exclusions are not evidence that arbitrary source files are safe.

Steward's main audit helper was initially flagged by the conservative credential
screen. Inspection confirmed its only hit was an explicit synthetic test-token
literal. It was recovered after that review; the manifest records the exception.

No Git credential settings, commits, pushes, deployment, or publication were
performed by this recovery. GitHub account pinning remains a separately scoped
operation; Azure DevOps configuration must not receive a GitHub-specific fix.

The user subsequently authorized source synchronization with each repository's
configured upstream. Policy-required PRs are permitted for protected Azure
branches; ordinary GitHub changes remain direct-to-main. Unrelated DOCX edits
remain outside the recovery commits. This does not authorize production
deployment or a plugin release. The synchronization snapshot is recorded in
[sync-results.json](sync-results.json).

## Verification

The [recovery helper](../../../../scripts/recover-local-artifacts.mjs) defaults to
preview and requires explicit repository/session roots and a destination.
It checks worktree ownership, deduplication, containment, changed inputs,
source preservation, recovered hashes, and declared exclusions. It refuses to
overwrite an existing recovery.

```powershell
node --test tests\local-artifact-recovery.test.mjs
node scripts\recover-local-artifacts.mjs --verify --repository-root '<owning repository>' --destination '<its recovery directory>'
```

All recovered files must remain visible to Git unless a separately approved
storage boundary requires otherwise. Narrow attributes preserve recovered
historical bytes without normalizing their whitespace or line endings.
This is task-local recovery evidence, not an all-host write-enforcement claim.
