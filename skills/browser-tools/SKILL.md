---
name: browser-tools
description: "Use native browser capabilities first for interactive pages, screenshots, console errors, measured visual checks, local artifacts, and embedded-frame or hidden-tab input troubleshooting. Discover the active host tools; use registered alex-playwright only for missing or unsupported scenarios, with consent boundaries intact."
lastReviewed: 2026-11-05
---

# Native-first Browser Tools

Prefer the current host's native browser tools for navigation, screenshots, accessible content, interactions, console errors, and focused Playwright code when those capabilities are available. Discover the actual tools; do not hardcode a host's API spellings.

Read console errors before judging a render. Measure suspect geometry and computed styles rather than estimating pixels or colors from a screenshot. Verify the requested behavior and report exact pages/flows, results, and limits.

For hidden-page timeouts, sandboxed frames, or input with no visible effect,
load [embedded-browser UAT](references/embedded-browser-uat.md) before retrying.
Diagnose readiness, visibility, and event targeting; distinguish DOM activation
from trusted input and verified state changes. A returned click is not a passed test.

If a required capability is unavailable or unsupported, use the optional alex-playwright MCP fallback only when registered and permitted. Native CLI browser existence does not prove local-file, remote, console, or authentication parity. Do not install or enable integrations silently; report the missing capability if neither route works.

Respect authenticated-tab sharing and consent. Let the user enter credentials. Do not access unrelated local files, accept terms, purchase, or submit consequential actions without approval. Use disposable/attached helpers for a self-contained check and clean up only resources created for it.

Load the [scenario reference](references/browser-scenarios.md) only for the selected local-file, dynamic-page, authentication, or measurement case. Its old tool names are examples to map through current discovery, not guaranteed APIs. For semantic chart/prose checks use [render-verify](../render-verify/SKILL.md).
