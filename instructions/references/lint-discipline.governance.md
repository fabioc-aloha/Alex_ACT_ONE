# Lint Discipline Governance

## Always-On Rationale

Applies to *any* file touched in any session. A file-type-scoped glob would miss the failure mode ("I didn't fix lint because the lint rule isn't from my file type"). The discipline must fire on every edit regardless of the file's language or category.

## Would Revise If

Revise if owning all lint state on touched files repeatedly blocks emergency hotfixes (the rule is wrongly absolute for time-critical scenarios), or if the "pre-existing, not my edit" anti-pattern stops appearing in shipped commits for two full quarters — at which point the rule may be obsoleted because the discipline has been internalized.
