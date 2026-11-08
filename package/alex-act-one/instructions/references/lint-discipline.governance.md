# Lint Discipline Governance

## Always-On Rationale

Applies to *any* file touched in any session. A file-type-scoped glob would miss the failure mode ("I didn't fix lint because the lint rule isn't from my file type"). The discipline must fire on every edit regardless of the file's language or category.

## Would Revise If

Revise if a concrete hotfix exposes a conflict between lint ownership and time-critical correctness, or the prescribed checks fail to catch an error in a modified file. Use the actual failure as evidence; do not track long-term compliance rates.
