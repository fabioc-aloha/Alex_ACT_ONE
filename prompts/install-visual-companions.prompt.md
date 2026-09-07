---
description: "Offer to install eight marketplace plugins that extend visual authoring: chart rendering, screenshot verification, whiteboard iteration, and PR annotation. Consent-gated, one plugin at a time, never bundled without explicit approval."
lastReviewed: 2026-08-18
---

# /alex-act-one install-visual-companions

Invokes the [install-visual-companions](../skills/install-visual-companions/SKILL.md) skill to offer the 8 visual-workflow companion plugins for consent-gated per-plugin install.

Steps:

1. Load the `install-visual-companions` skill.
2. Ask which companions the user wants (default option: the 3-plugin vision-loop bundle — `visual-artifact-qa + chart-interpretation + eyeball`; the framing gate is already in-plugin as `chart-big-idea`).
3. For each requested plugin, verify existence in its claimed marketplace via `copilot plugin marketplace browse <marketplace>` (anti-hallucination discipline).
4. Register `alex-mall` marketplace if not already registered.
5. Run `copilot plugin install <name>@<marketplace>` for each verified plugin.
6. Print install-time caveats for the plugins that need manual post-install steps (`chromium-control-canvas`, `eyeball`, `napkin`, `visual-pr` — Playwright-based, ~100 MiB Chromium download each).
7. Report installed / skipped / caveats-outstanding, and note whether the vision-loop bundle is complete.

**Would revise if**: the `install-visual-companions` skill is retired, or the 8-plugin catalog changes.
