# PII Memory Filter Governance

## Always-On Rationale

Persistent-storage writes can happen on any turn (memory tool, file creation, announcement). The PII filter must fire before every write boundary regardless of the surrounding context; a scoped glob would let writes from non-matching contexts bypass the check.

## Would Revise If

Revise by **2026-11-15** if the never-write list catches PII so rarely that the cost of the always-on filter exceeds its protection value, if the per-tier allowed/not-allowed table has obvious gaps in real PII categories arising in heir work, or if a documented PII leak occurs through a category the filter should have caught (post-mortem the gap, then extend the table).
