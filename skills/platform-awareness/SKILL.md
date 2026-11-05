---
name: platform-awareness
description: "Discover current host capabilities and verify Copilot CLI/VS Code platform claims against native help and official documentation. Use for deferred tools, harness differences, native features, MCP/browser availability, and reproduced compatibility exceptions; do not assume historical settings or tool names."
lastReviewed: 2026-08-03
---

# Platform Awareness

Use the current host's tool discovery, help, settings inspection, and official documentation instead of memorized tool-name or release tables. Discover deferred tools before invoking them and distinguish the client, harness, model, policy, stable/preview status, and actually available capability.

## Compatibility exceptions

The [historical platform notes](references/platform-history.md) are reference material, not current defaults. The old skill-resolver issue was closed; do not automatically disable a resolver or change user settings. Reproduce a failure in a fresh packaged-skill session before recommending a scoped workaround, and obtain settings-write consent.

A loaded skill is not evidence that its instructions were followed. A documented native feature is not runtime parity. Report unavailable capabilities and retain a tested fallback. Do not hardcode model choices or infer that a failed lookup proves retirement.

Use native context/compaction/session interfaces where available. Claim measured token or latency savings only from the actual loader/runtime, not source-file line counts.
