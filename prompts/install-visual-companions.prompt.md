---
description: "Offer to install marketplace plugins that extend visual authoring: chart rendering, screenshot verification, whiteboard iteration, and PR annotation. Consent-gated, one plugin at a time, never bundled without explicit approval."
lastReviewed: 2026-08-18
---

# /alex-act-one install-visual-companions

Invokes the [install-visual-companions](../skills/install-visual-companions/SKILL.md) skill to offer the 8 visual-workflow companion plugins for consent-gated per-plugin install.

Steps:

1. Load the `install-visual-companions` skill.
2. Ask which companions the user wants. Note that framing, chart reading, and render verification already ship in this plugin as `chart-big-idea`, `chart-interpretation`, and `render-verify`, so none of the companions are required for the core loop.
3. For each requested plugin, verify existence in its claimed marketplace via `copilot plugin marketplace browse <marketplace>` (anti-hallucination discipline).
4. Register `alex-mall` marketplace if not already registered.
5. Run `copilot plugin install <name>@<marketplace>` for each verified plugin.
6. Print install-time caveats for the plugins that need manual post-install steps (`chromium-control-canvas`, `eyeball`, `napkin`, `visual-pr` — Playwright-based, ~100 MiB Chromium download each).
7. Report installed, skipped, and caveats outstanding.

**Would revise if**: the `install-visual-companions` skill is retired, or the companion catalog changes.
