# Repository-owned artifacts for Alex ACT ONE

Date: 2026-11-07

Status: Repository recovery and instruction-level safeguards implemented; host enforcement remains proposed

Audience: Alex ACT ONE maintainer and developers configuring its supported agent hosts

## The decision

Make repository storage part of artifact delivery, not an optional cleanup step.
An agent has not delivered a project document, helper or generated output merely
because the file exists in session storage or has a chat link.

Use a shared policy, repository-owned artifact records, and tested runtime
checks together. Instructions guide the agent; a checker proves bounded
properties; host permissions determine which writes can actually be prevented.
Do not describe this combination as universal filesystem enforcement.

## What went wrong

In TheEditor, plans, review reports, previews and helpers were created in agent
session folders. They survived the conversation but were not discoverable through
the repository. Some helpers were later missing on disk and had to be recovered
from saved edit history.

The operational mistake was classifying useful project work as disposable
scratch and failing to promote it into indexed, repository-owned artifacts
before reporting completion. File persistence, artifact registration, repository
storage and GitHub backup were incorrectly treated as equivalent.

The original TheEditor case motivated this guide. This canonical repository's
own recovery evidence is now indexed in:

- [Recovered reports, helper, and supporting evidence](docs/verification/session-recovery/README.md).
- [Original/recovered hashes and declared edits](docs/verification/session-recovery/manifest.json).
- [Current project storage policy](AGENTS.md#project-artifact-storage).

These are local case evidence, not material to copy wholesale into the plugin.
The recovery tests establish recovered-file integrity and navigation; they do
not enforce where an agent writes its next artifact.

## Define the storage contract

### What must belong to the project repository

| Artifact | Required treatment |
| --- | --- |
| Requested plans, proposals, specifications and explanations | Save in the repository, respecting any destination the user specified |
| Source code and helper scripts written for project work | Save in the repository, including useful one-off helpers |
| Charts, diagrams, datasets, presentations and document exports | Save outputs and required supporting sources in repository-owned locations |
| Review reports, decisions, audits and reproducibility receipts | Preserve in the project's existing evidence structure |
| Deliberately frozen manuscript or proof snapshots | Preserve approved inputs and exact bytes; do not silently refresh them |
| Historical outputs and before states worth retaining | Label their version and status; do not confuse them with current deliverables |

Temporary credentials, authentication state, model/runtime databases, transient
tool arguments, interpreter caches and disposable execution data are not project
deliverables. Do not copy them into the repository to satisfy this policy.
Confidential or personal source material still needs an approved storage boundary.

A script is not disposable merely because it was used once. If it carries
project logic or is needed to reproduce the result, it is a project artifact.
When classification is materially uncertain, ask instead of leaving the sole
copy in session storage or indiscriminately archiving everything.

### Proposed shared instruction

```markdown
# Project artifact persistence

Create and retain project documents, plans, code, helpers, generated
deliverables and supporting evidence inside the active project repository.
Respect the user's requested destination. Session or temporary storage is
only for disposable runtime data, never the sole home of a deliverable.

Before presenting an artifact or declaring completion, verify that its
repository file and required dependencies exist, add discoverable repository
links, and report its Git state. If a tool created the output elsewhere,
relocate it safely and verify the result before calling it delivered.

Do not move or overwrite canonical external sources without authorization.
Preserve frozen evidence. Never archive credentials, runtime databases or
unapproved sensitive data. If the host or current mode prevents a permitted
repository write, report the blocker; do not evade it with another tool.

Repository storage does not authorize implementation, installation,
commits, pushes, publication or changes to another project.
```

Treat this as one canonical policy with supported activation routes, not several
independent copies that can drift. A user-approved external delivery destination
needs an explicit exception and, where appropriate, a safe repository record.

## Integrate with existing Alex ACT ONE owners

Confirm these routes in the canonical plugin source before editing. The names
below identify existing workflow owners, not verified source-repository paths.

| Existing owner | Focused integration |
| --- | --- |
| `plan` | Distinguish internal reasoning from a requested plan deliverable; do not leave the latter solely in private planning storage |
| `bootstrap-core` | Activate and verify the shared policy in the selected host's user instruction mechanism |
| `bootstrap-project` | Add a concise project route and suggested output locations without overwriting project-owned instructions |
| `proactive-awareness` | During recovery, report repository artifacts and missing delivery records; do not grant new write authority |
| `meditation` | Reconcile artifact locations and indexes when authorized, rather than using continuity prose as an archive |
| `render-verify` | Verify the final repository artifact and its resources, not only a temporary preview |
| `git-workflow` | Distinguish repository files from staged, committed and remotely verified content |

Prefer extending these owners and a shared checker to adding another broad
"remember to save files" skill. Update any workflow that still recommends session
storage without distinguishing disposable work from requested deliverables.

Planning authority remains separate. A request to plan is not permission to
implement an application. If the host's planning mode forbids the requested
document write, disclose that limitation and obtain the appropriate mode or
write authorization. Do not bypass it through shell or MCP calls.

Author changes in the canonical plugin repository. Do not patch an installed
cache, native session database or activated user-profile copy as the source fix.
Plugin updates, user activation, project adoption and publication are separate
steps requiring their appropriate approval.

## Runtime design

### 1. Resolve the active repository correctly

Derive the project from the session's working directory and verify its Git
worktree root, for example with `git rev-parse --show-toplevel`.
Do not derive the adopter's repository from the hook script's installation
directory or use the repository's common Git directory as the worktree root.

If there is no repository, the root is ambiguous, or multiple projects are
involved, ask for the intended delivery project. Do not silently choose an
installed-plugin directory, home directory or another workspace.

### 2. Choose the destination before generation

Use project conventions such as `docs`, `reports`, `scripts`, `assets` or
`presentations`; these are suggestions, not universal required directories.
Honor a request for a root-level document.

Record the intended deliverable and its dependencies before a producer runs.
Configure tools to write there directly. External temporary production should
be an explicit tool limitation followed by verified delivery, not the default
location for the final artifact.

### 3. Maintain a small repository-owned delivery ledger

Reuse an existing manifest when it can represent delivery state. Otherwise,
propose a small ledger in the project's existing evidence/report structure:

```json
{
  "schema_version": 1,
  "artifacts": [
    {
      "id": "design-note",
      "path": "docs/design-note.md",
      "kind": "document",
      "status": "planned",
      "dependencies": []
    }
  ]
}
```

This is a proposed application schema, not a Copilot or Flint API.
Paths can use a normalized repository-relative representation in the ledger;
convert them to native filesystem paths for execution.

Suggested lifecycle: `planned` -> `written` -> `verified` -> `delivered`.
Record deliberate cancellation or removal so an abandoned plan does not become
an unexplained missing-file failure.

Do not collect prompts, reasoning, credentials, private account details or
complete tool arguments. Keep the ledger about files and delivery.

### 4. Validate file destinations before supported writes

A pre-tool adapter should recognize the host's actual structured file-writing
operations and validate their destination paths:

- Resolve relative paths against the active worktree, not an arbitrary tool cwd.
- Check containment using filesystem paths, not a string-prefix comparison.
- Handle file URIs, Windows drive letters, case, `..`, symlinks and junctions.
- For nonexistent outputs, resolve the nearest existing parent and check it.
- Revalidate at the producer's write boundary; a pre-tool path check alone
  cannot eliminate symlink/junction changes between checking and writing.
- Reject unsupported or ambiguous mutation inputs explicitly.
- Preserve approved read-only access to external sources such as AlexBooks.
- Do not grant new write access because an input document names a destination.

For recognized project-artifact writes outside the approved root, use the
runtime's documented deny/permission mechanism. Diagnostic text alone is not a
blocking decision.

Arbitrary shell programs and external MCP producers can write files not visible
as a structured destination. Parsing their command strings with a regex is not
complete enforcement. Use controlled producer wrappers, verified output records,
or a host/OS write boundary for those cases. State uncovered operations.

### 5. Verify after production

Check that the final artifact exists inside the approved root and that its
declared local dependencies resolve. Validate the exact required format using
existing project tooling where possible.

For a relocation, verify the copy before deleting the specifically identified
source file. Retain the original hash and declared edits when rebasing paths or
redacting environment-specific details. Never recursively delete a session root.

For HTML or diagrams, inspect the final repository version and test resources
and relevant interaction. For source-bound evidence, protect the recorded bytes
from inappropriate newline conversion or automatic regeneration.

An old pre-change hash is not permanent delivery evidence for a mutable file.
Invalidate or refresh its verification record after a declared edit. Keep frozen
snapshots separate from mutable deliverables.

### 6. Gate completion

When supported by the selected host, an agent-stop/completion hook should inspect
the outstanding delivery ledger and the relevant write/output receipts.
It should not treat every ignored cache or unrelated untracked file as an error.

Require:

- No unexplained outstanding project deliverable.
- Valid final destinations and required dependencies.
- No accidental Git ignore rule hiding a deliverable.
- A discoverable repository link or index entry.
- A truthful final Git-state report.

On failure, return the host's documented blocking decision and a concrete reason.
If the checker fails, times out, or receives an unsupported payload, do not turn
that into a pass. Repeated failures should lead to a reported blocker, not an
endless retry loop.

This gate is only as complete as its artifact inventory and observed operations.
A model-maintained ledger alone cannot detect every unregistered file. Combine it
with producer receipts and narrow destination checks. A late session-end callback
is useful for diagnostics but should not be the only delivery check.

## Use the correct host contract

The harness, not the selected model, determines instruction and hook support.
Changing models does not prove that a hook migrated or ran.

The current VS Code documentation describes the Copilot harness shared with the
Copilot app and CLI. Its hooks UI remains a preview experience. GitHub's hooks
reference covers CLI and cloud behavior. Verify execution in the specific
VS Code/Copilot SDK host being deployed rather than assuming documentation for
one surface establishes identical behavior everywhere.

For the Copilot contract, inspect the documented `preToolUse`, `postToolUse`
and `agentStop` events. Do not paste another harness's hook configuration,
input schema or blocking response without a compatibility test.
Keep diagnostics separate from the final machine-readable decision; malformed
or concatenated output can be ignored by a runtime.

User instruction locations differ too:

| Harness | User-wide instruction source described by current documentation |
| --- | --- |
| Copilot | `~/.copilot/copilot-instructions.md` or modular instructions under `~/.copilot/instructions` |
| Claude | `~/.claude/CLAUDE.md` or the supported user rules folder |
| Codex | `AGENTS.md` in the configured Codex home |
| Legacy VS Code Local | The VS Code user-profile instruction mechanism |

Copilot's native user folders are not the same as VS Code profile storage and
do not automatically roam through Settings Sync. Local profile instructions have
their own sync option. Bootstrap and verify the intended host; do not assume
one user file covers every CLI, editor and cloud session.

Hook scripts deployed in a plugin should be versioned with its canonical source.
The required installed runtime/configuration copies are infrastructure, not
adopter project artifacts. Cloud sessions need the supported configuration and
scripts available in their environment; local user hooks are not automatically
present there.

## Acceptance tests before adoption

Test the policy in fresh sessions without repeating it in the prompt.
Use harmless fixtures, no credentials or private manuscript excerpts.

| Case | Required evidence |
| --- | --- |
| Requested root Markdown document | File appears in the active repository root, is indexed and has a valid repository link |
| Plan-only request | No application implementation occurs; permitted document delivery follows the storage contract |
| Nested repository and alternate worktree | Correct active worktree is used, not the plugin installation or common Git directory |
| File writer targets session storage | Recognized write is denied or explicitly redirected through an approved producer |
| Shell-generated HTML and helper | Wrapper/output receipts and completion check identify the real output paths |
| MCP tool returns an external local file | Artifact is not called delivered until its approved repository copy is verified |
| Disposable cache or runtime argument file | Not falsely treated as a project deliverable; no credential archival |
| Missing dependency, ignored output or stale receipt | Completion reports the specific failure, not success |
| Symlink/junction or `..` escape | Containment check rejects the write |
| Canonical manuscript outside the project | Authorized reading works; relocation does not mutate that source |
| Updated mutable document | Old verification is invalidated and the updated file is checked |
| Corrupted frozen evidence | Failure is explicit; snapshot is not silently replaced |
| Subagent creates a project output | Same destination contract and delivery checks apply |
| Hook timeout, malformed output or unsupported schema | No claimed enforcement pass; compatibility blocker is surfaced |
| Approved commit and push | Remote commit identity is checked; repository storage alone is not called remote synchronization |

Test the checker independently with known passing, failing and unsupported
inputs. Also prove that the host actually invokes the deployed hook and honors
its failure response. A valid JSON file, installed plugin, listed instruction or
passing unit test is not evidence of runtime enforcement.

## Rollout and authority

1. Confirm the canonical plugin owner and supported host versions.
2. Approve the exact policy, existing workflow edits, checker and host adapters.
3. Prototype with harmless TheEditor fixtures, keeping current artifacts intact.
4. Test fresh-chat policy inclusion, file writers, shell/MCP coverage and stop
   behavior. Label gaps instead of claiming complete enforcement.
5. Validate canonical-source changes, activation receipts and duplicate routes.
6. Apply to a second project with different output conventions and a worktree.
7. Publish/update the plugin only after its separate release approval.

Instruction-only adoption is smaller and may be sufficient for a lightweight
workflow, but it would not address the demonstrated persistence failure as
strongly. The recommended approach is the shared policy plus tested checks.
Revise that choice if the deployed host cannot expose or honor the required
events: retain the policy and use an explicit project validation command until
the runtime gap is resolved.

If strict prevention of all out-of-repository writes is required, use an
appropriately configured filesystem sandbox or OS permission boundary.
Hooks that cannot observe arbitrary writes cannot provide that guarantee.

## Current status and references

This document is the requested root-level implementation guide. Alex ACT ONE now
has indexed repository copies of its stranded project reports, helper, and
supporting evidence, a tested recovery-integrity checker, and a
[shared instruction-level storage contract](skills/proactive-awareness/references/project-artifact-storage.md).
The repository guidance, resident session-health contract, bootstrap scaffold,
and directly coupled workflow owners route delivery through that contract.

This is not the proposed ongoing ledger/hook enforcement gate. Installed packages,
profile activation, global settings, other repositories, and published releases
were not changed. Fresh-host enforcement and later activation remain separate
[pending delivery work](ROADMAP.md#verify-artifact-delivery-in-supported-hosts).

Official references consulted on 2026-11-07:

- [VS Code custom instruction formats and locations](https://code.visualstudio.com/docs/agents/reference/custom-instructions-reference).
- [Create and verify project instructions](https://code.visualstudio.com/docs/agent-customization/custom-instructions).
- [VS Code hook setup and harness compatibility](https://code.visualstudio.com/docs/agent-customization/hooks).
- [GitHub Copilot hook events, schemas and responses](https://docs.github.com/en/copilot/reference/hooks-reference).

The canonical-source evidence above is sanitized and excludes private manuscript
snapshots, raw runtime event streams, credentials, and disposable state.
Do not bundle another project's private source material with a cross-project
plugin.
