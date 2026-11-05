---
name: systematic-debugging
description: Use when encountering any bug, test failure, or unexpected behavior, before proposing fixes. Four-phase root-cause-first method (investigate → pattern-analyze → hypothesize → implement) that beats guess-and-check thrashing.
lastReviewed: 2026-05-26
---

# Systematic Debugging

For a bug, failed test, or unexpected behavior, investigate the root cause before proposing a fix. Native explain/fix/test tools supply execution, not evidence that the diagnosis is right.

1. Establish the exact expected/actual behavior and a reproducible failure.
2. Read the relevant code, error output, recent changes, and working examples; trace one continuous cause rather than splitting a small trace into agents.
3. State a falsifiable hypothesis and test the smallest relevant case.
4. With implementation authority, write/watch a failing regression, make one scoped fix, and rerun the narrow relevant checks before broader regression validation.

Count failed attempts for this unresolved bug from the current task/session record, not from memory or a project-root standing log. At three failed fixes, stop and discuss whether the architecture or hypothesis is wrong before attempting another. Successful fixes and other bugs do not belong in that count.

Load the relevant phase/examples from [execution details](references/execution-details.md). Preserve unrelated changes, privacy, and approval boundaries. Do not broaden scope, hide errors, or claim a root cause from a merely plausible explanation. Report remaining uncertainty and the actual verification.
