---
name: flint-chart
description: "Use when the user wants to visualize data — from 'which chart should I use?' to 'render this'. Helps pick the right chart from the analytical question (comparison / trend / distribution / relationship / proportion / flow / KPI), then authors a ChartAssemblyInput and renders via the flint-chart-mcp server (Vega-Lite / ECharts / Chart.js). Transform data before Flint; style tweaks after Flint."
lastReviewed: 2026-11-05
---

# Flint chart authoring and rendering

Reviewed runtime: `flint-chart-mcp@1.0.1` with exact `flint-chart@1.0.1`.
Flint owns its language; Alex owns analytical framing, evidence, consent, and
render verification. Do not copy a static schema/type catalog into this skill.

## Load the installed language first

Read `flint://agent-skill` or call `get_flint_skill({ "skill": "chart" })`.
For reader behavior, chart-state updates, or linked views, load and follow
[flint-interactions](../flint-interactions/SKILL.md) and its selected native
`interaction` or `board` skill/resource. Use `list_chart_types`, `list_interaction_presets`, and
`list_themes` to verify actual capabilities before promising them. Report an
unavailable resource/tool instead of inventing grammar.

The [language and backend boundary](references/flint-language-reference.md)
provides orientation, not a replacement for version-matched schemas. For
selection, load only the relevant [question-to-chart guidance](references/chart-selection.md).

## Step 0: Frame the analytical question

When the user has not supplied a complete spec, load
[chart-big-idea](../chart-big-idea/SKILL.md). Reuse an existing Chart Brief and
explicit treatment rather than asking the same questions again. A diagnostic
chart or a small style iteration can use the owner's fast path.

Check the source data, actual values, population, period, units, denominator,
and grain. Separate totals from their parts. Compute material shares/ratios
using a tool; if computation is blocked, label the claim unverified rather
than reporting prose arithmetic as evidence.

## Step 1: Choose an exact supported chartType

Use the exact case-sensitive name from `list_chart_types` for the chosen
backend, for example `Stacked Bar Chart`, not a snake_case family hint.
The [selection reference](references/chart-selection.md) covers the analytical
question, anti-patterns, and substitutions; the runtime catalog settles support.
Do not treat arbitrary layering suggestions as standalone registered chart types.

## Step 2: Bind data and encodings

Author `ChartAssemblyInput`, not backend-native output. Use actual field names
and registered semantic types; `Category` and `Quantity` are safe defaults
when their meaning fits. Keep the same data/semantic truth layer for alternate
treatments. Transform data before Flint: do not invent a transformation API.

For small synthetic/prepared tables, use `data.values`. `data.url` supports
local JSON/CSV/TSV when the server permits file references, not remote URL fetch.
Use a real parser for quoted CSV. Do not manually reserialize a large dataset.
Preserve the claim in `chart_spec.title`; use `subtitle` for population,
period, measure, and units. Do not invent missing metadata.

## Step 3: Theme, interaction, and presentation

For custom themes, load [flint-theme](../flint-theme/SKILL.md) and its
version-matched grammar. In the exposed three-backend MCP workflow, ThemeSpec
applies to Vega-Lite; do not claim ECharts/Chart.js parity. The library's
additional backends are separate from the MCP backend enum.

When the request or exploratory session calls for behavior/state/linking, load
and follow [flint-interactions](../flint-interactions/SKILL.md) to choose the
smallest compatible workflow and define gesture/reset acceptance. It owns
`interaction_spec` versus `updates` versus linking decisions; this skill keeps
the base chart/data/display contract. Static-only requests do not acquire
interactions. Use `validate_board` before displaying a board.

## Step 4: Validate, then display

- For interactive Vega-Lite with App UI support: call `validate_chart` first,
  resolve errors/warnings, then `show({ "chart": input })` with the whole input.
  The server retains no chart state between calls. A later update requires
  sending the revised complete input; earlier cards remain as they were.
- For a board: validate, then `show({ "board": boardInput })`.
- Use `render_chart` for requested static output or a host without App UI:
  Vega-Lite/ECharts support SVG and PNG; Chart.js supports PNG only.
  Inspect MCP content blocks separately: keep SVG as one complete XML root
  ending at `</svg>`, with summary/report text outside the artifact. Never
  concatenate all text blocks into an SVG file or data URI. For image blocks,
  preserve their MIME type and data; check browser decode or `naturalWidth > 0`.
- Use `compile_chart` for backend-native JSON. Do not send edited backend
  JSON back to Flint as a portable input. If narrow post-compile styling is
  needed, render it with that backend and verify the actual result.

## Step 5: Verify the output, not merely the spec

Load and follow [render-verify](../render-verify/SKILL.md) after rendering,
especially after a backend edit. Inspect console errors, marks, title/labels,
units, data values, clipping, and the intended claim. A valid spec can still
render the wrong story. Use native browser tools first, then the registered
fallback for unavailable scenarios; report any verification gap.

For publication-specific formatting, load the
[publication preset](references/publication-preset.md), and the applicable
[print SVG](../print-svg-style-guide/SKILL.md) or
[figure generator](../figure-generator/SKILL.md) contract.

## Runtime and project integration

Use the plugin's direct Node launcher and reviewed exact pins. Never substitute
an unpinned npx server, change npm registry/policy, or install dependencies
silently. Missing state routes to [setup-dependencies](../setup-dependencies/SKILL.md).
Only add `flint-chart@1.0.1` and approved renderer peers to a user's project
when project integration is explicitly requested and approved.

Report the chosen analytical treatment, strongest rejected alternative, actual
backend/tool path, warnings, and observed verification. Do not claim a native
feature, model, font, or App UI was available merely because documentation names it.

## Would Revise If

Revise when installed tool/resource schemas, chart names, display semantics,
backend support, theme behavior, or a reproduced visual failure contradict this
contract. The exact runtime catalog outranks stale copied examples.
