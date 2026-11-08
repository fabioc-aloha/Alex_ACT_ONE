# Synthetic HTML Table Delivery Plan

Goal: verify delivery of a synthetic HTML table with records A=2 and B=3.
This is planning only; the permission boundary is procedural, not a claimed
host-enforced restriction. No HTML implementation or browser execution is authorized.

## Separate Evidence Surfaces

1. **File creation:** create only this plan and the supporting
   [JSON record](agent-output.json) at the approved repository destinations.
   Refuse existing destinations; verify real paths, file existence, and the
   exact JSON structure and values. HTML creation requires separate approval.
2. **Git visibility:** inspect ignore rules and actual Git status for both
   files. Report untracked, staged, or committed state accurately; do not stage,
   commit, or push. Disk existence alone does not establish Git visibility.
3. **Model response:** report actual file paths and observed checks with links
   to both artifacts. Chat text is not evidence of file persistence, HTML
   rendering, or host delivery.
4. **Host/browser observation:** after separately authorized HTML creation and
   observation, inspect the final repository HTML in the host/browser and
   verify category/value headers and exactly two data rows: A=2 and B=3.
   Until then, HTML creation and host/browser rendering remain unperformed
   and unverified, even if the plan and JSON pass their checks.

Acceptance now covers only the plan and JSON, their contents, containment,
linked dependency, ignore state, and Git visibility. No external destinations,
credentials, installation, downloads, instruction edits, or delegation.
