---
name: install-visual-companions
description: "Offer to install marketplace plugins that extend visual-authoring workflows: chart rendering, screenshot verification, whiteboard iteration, and PR annotation. Consent-gated, one plugin at a time, never bundled without explicit approval. Use when the user asks to enable visual-workflow tooling, or when chart, figure, or print-SVG authoring produces artifacts that need runtime verification."
lastReviewed: 2026-09-07
---

# Visual Companion Setup

Use native capability discovery first. A visual task does not itself justify installing a browser, screenshot auditor, renderer, or plugin. If the active host covers the requested scenario, use it; retain registered fallbacks for unavailable or unverified cases.

For a real remaining gap, load the relevant catalog entry and consent procedure in [execution details](references/execution-details.md). Catalog verification dates are historical evidence: verify the current plugin name, publisher, marketplace, dependencies, and scope before offering installation.

Offer only applicable choices. Require explicit consent for each integration and its installation scope; no answer means no action. Never install a bundle silently or treat missing optional companions as a broken Core installation.

Use supported native marketplace/plugin commands for discovery and lifecycle. Do not modify global settings or registration without their own consent. Confirm actual tool/resource availability after installation; a successful install does not prove a rendered result is correct.

Return what was available, the concrete gap, approved actions, observed readiness, and any remaining setup. Existing framing, chart interpretation, and render verification require no extra companion when their native prerequisites are already satisfied.
