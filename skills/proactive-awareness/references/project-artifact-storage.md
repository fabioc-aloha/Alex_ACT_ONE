# Project artifact storage and delivery

Choose the active project's Git worktree root from the session working
directory, not from the installed plugin or its common Git directory. If the
project or an approved external destination is ambiguous, ask before producing
a deliverable.

## Storage contract

Requested documents, plans, reports, code, useful one-off helpers, generated
outputs, and their required supporting sources belong in the project repository.
Respect an explicitly requested destination. Use the project's existing
documentation, scripts, assets, and evidence conventions; do not invent a
second backlog or archive everything indiscriminately.

Private planning storage is for internal reasoning, not the sole copy of a
requested plan. Session persistence and a chat artifact link are not repository
delivery. Configure producers and subagents with the repository destination
before they run. If a tool can only produce externally, copy the approved output
and its dependencies into the repository, then verify the final repository
version. Do not delete the original before verifying the copy.

Disposable tool arguments, locks, caches, runtime databases, authentication
state, and installed runtime/configuration copies are not project artifacts.
Never archive credentials, personal source material without its approved
storage boundary, or another project's files under this policy. Minimize and
document redactions. Preserve frozen evidence and record original and recovered
hashes separately when authorized edits are necessary.

## Delivery check

Before presenting a project artifact or declaring completion:

1. Enumerate the deliverables and required dependencies for the approved task.
   Reuse a project index or manifest when present.
2. Confirm every final file exists within the approved worktree or explicitly
   approved external destination. Resolve real paths, including junctions,
   symlinks, and nonexistent parents; a string prefix is not containment.
3. Validate the actual required format and local links/resources using existing
   tooling. For rendered output, inspect the final repository version.
4. Check Git ignore state. Add discoverable repository links and distinguish
   written, staged, committed, pushed, and remotely verified states.
5. Report each missing, blocked, deliberately excluded, or unverified item.
   A stale hash or a successful temporary preview is not final-file evidence.
   Run the read-only [session-artifact checker](../scripts/check-session-artifacts.cjs)
   (`node <proactive-awareness>/scripts/check-session-artifacts.cjs --repository-root <repo>`)
   to confirm no deliverables for the active repository were left unaccounted in
   `~/.copilot/session-state/<id>/files/`.
   Bound the scope with `--session <id>` when appropriate. The checker verifies
   actual Git-visible bytes, source hashes, and supported recovery manifests,
   not merely a remembered session/path pair. It reports linked or unsupported
   inputs and unavailable/empty session scope separately from clean results.
   Explicit approved pruning records may retire exact original hashes; they
   must retain their decision and recovery commit. Changed originals still
   require delivery or a new retention decision.

These are instruction-level safeguards and an explicit verification procedure,
not universal filesystem enforcement. Tests establish only their stated scope.
Do not claim a host hook ran without observing invocation and failure handling.

## Authority

Storage requirements grant no implementation, installation, deletion, commit,
push, publication, global activation, or cross-project authority. Plan-only and
read-only requests remain so. If the host blocks an otherwise requested document
write, report the limitation and obtain the appropriate mode or approval; never
evade it through shell, MCP, or another file writer.
