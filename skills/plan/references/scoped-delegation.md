# Scoped Delegation

Use this reference only for explicitly authorized delegation. Prefer the host's
native worker controls when available. If no suitable worker is available,
report the limitation and continue directly only within the approved scope.

## Brief the worker

- Give each worker a distinct task, the source or worktree to use, the exact
  deliverable and its destination, and the evidence needed to accept it.
- Make research and review read-only: return findings in the worker's response
  unless a report file was explicitly approved. For implementation, name the
  files the worker owns and prohibit overlapping edits.
- State what stays out of scope. A brief cannot add permission to create
  branches, change profiles, install tools, use credentials, send, or publish.
  Being able to call a tool does not authorize using it.

## Verify against the brief

Check actual worker status and visible results before diagnosing a stall.
Distinguish a running worker, a blocked worker, and a completed output that
has not been reviewed. If the host does not expose status, say it is unknown.

Before accepting a result, inspect its evidence, scoped diff, or named artifact
and run the agreed checks you can actually perform. A worker's summary is not
proof that a test ran or that a file reached its destination. Report unexpected
changes and exclude them from the deliverable. Do not delete, revert, or publish
unexpected work without separate approval. Report what was verified and what
remains unverified.

**Example:** Ask an authorized read-only worker to review a specified diff for
regressions and return file and line references with a reproducible check. Do
not grant edits, branch creation, or publication. Verify the cited findings
against the diff yourself before reporting them.

Adapted from [Muse's Scoped Delegation skill](https://github.com/fabioc-aloha/Alex_ACT_ONE_Muse/blob/9ac82e253fb4bbee08d1ddac35029497dbb47199/skills/scoped-delegation/SKILL.md).
