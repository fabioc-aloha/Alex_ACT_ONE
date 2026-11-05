# No Deferred Debt Governance

## Always-On Rationale

Debt surfaces in any context (script run, doc audit, file edit, command output). The "fix in same turn" discipline must fire whenever debt is observed, not only when working on specific file types. A scoped glob would create the failure mode it's designed to prevent.

## Would Revise If

- A known defect is deferred without identifying the decision that blocks its resolution.
- The prescribed fix introduces a regression or bypasses required user approval.
- A concrete task expands into unrelated work because the scope boundary is unclear; clarify
  that boundary rather than creating a debt-surfacing counter.
