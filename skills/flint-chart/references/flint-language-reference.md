# Flint 1.0.1 runtime boundary

Reviewed 2026-11-05 through the configured Microsoft npm proxy and an isolated
MCP handshake. Exact pins: `flint-chart-mcp@1.0.1` and `flint-chart@1.0.1`.
This is orientation, not a vendored schema or claim that future releases match.

## Source-owned grammar

Read `flint://agent-skill`, `flint://theme-skill`,
`flint://interaction-skill`, and `flint://board-skill` as needed, or use
`get_flint_skill` with skill `chart`, `theme`, `interaction`, or `board`.
The optional section argument selects a heading. Verify actual chart templates,
channels, presets, and themes with the corresponding runtime tools.

## Reviewed tools

- `compile_chart`: portable input to backend JSON.
- `validate_chart`: report without drawing; supports relevant initial updates.
- `render_chart`: static image/vector output.
- `list_chart_types`, `list_themes`, `list_interaction_presets`: discovery.
- `get_flint_skill`: version-matched authoring guidance.
- `validate_board`: board validation.
- `show`: validated complete chart or board input to a live App UI card.

Use validate then show for interactive output. This 1.0.1 interface replaces
the previous interactive-view tool; no implicit persistent chart object exists.
Send the full revised spec on later calls. Validate and report unsupported input
instead of assuming display success.

## Backend and data boundary

The MCP enum is `vegalite`, `echarts`, or `chartjs`. Library-only backends
are not additional MCP rendering choices. Vega-Lite and ECharts render SVG/PNG;
Chart.js renders PNG. ThemeSpec affects Vega-Lite in this MCP workflow, not
ECharts/Chart.js. The library guidance also describes Plotly, separately.

Use exact catalog names, such as `Bar Chart` or `Stacked Bar Chart`, not
snake_case aliases. Inspect the catalog instead of inferring support from a
generic chart family. Calendar Heatmap and Table availability are
backend-specific; the runtime catalog is authoritative.

Data uses inline rows or permitted local JSON/CSV/TSV. Remote URL fetching is
not the local-file-reference feature. Parse CSV correctly, transform before
charting, preserve semantic types across alternate treatments, and verify
entity/units/period as well as numeric membership.

## References and installation

[Flint documentation](https://microsoft.github.io/flint-chart/) and the
[upstream repository](https://github.com/microsoft/flint-chart) provide
conceptual/developer context. For exact 1.0.1 details use the installed resources
and tool schemas rather than unversioned web examples. npm configuration remains
the registry authority. No global installation, registry override, or unpinned
fetch is part of a render operation.
