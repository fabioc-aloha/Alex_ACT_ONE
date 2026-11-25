# Flint 1.1.1 runtime boundary

Reviewed 2026-11-25 through the configured Microsoft npm proxy and an isolated
MCP handshake. Exact source pins: `flint-chart-mcp@1.1.1` and `flint-chart@1.1.1`.
This is orientation, not a vendored schema or claim that future releases match.

## Source-owned grammar

Read `flint://agent-skill`, `flint://theme-skill`,
`flint://interaction-skill`, and `flint://board-skill` as needed, or use
`get_flint_skill` with skill `chart`, `theme`, `interaction`, or `board`.
For application code only, use `flint://app-skill` or `get_flint_skill` with
skill `app`. These are MCP resources and a tool, not proof of Skills over MCP
discovery or native App UI support.
The optional section argument selects a heading. Verify actual chart templates,
channels, presets, and themes with the corresponding runtime tools.

## Reviewed tools

- `compile_chart`: portable input to backend JSON.
- `validate_chart`: report without drawing; read the primary JSON or structured
  content, not the optional prose block. Supports relevant initial updates.
- `render_chart`: static image/vector output.
- `list_chart_types`, `list_themes`, `list_interaction_presets`: discovery.
- `get_flint_skill`: version-matched authoring guidance.
- `validate_board`: board validation.
- `show`: validated complete chart or board input to a live App UI card.

Use validate then show for interactive output. No implicit persistent chart
object exists. Inspect drawable App state rather than inferring behavior from
the `show` response text.
Send the full revised spec on later calls. Validate and report unsupported input
instead of assuming display success.

## Backend and data boundary

The MCP enum is `vegalite`, `echarts`, or `chartjs`. Library-only backends
are not additional MCP rendering choices. Vega-Lite and ECharts render SVG/PNG;
Chart.js renders PNG. In the pinned MCP comparison, the same ThemeSpec changed
Vega-Lite output but not ECharts or Chart.js output. Library-level layout
support does not establish MCP theme parity. The application guide also
describes Plotly, which is not an MCP backend choice here.

Use exact catalog names, such as `Bar Chart` or `Stacked Bar Chart`, not
snake_case aliases. Inspect the catalog instead of inferring support from a
generic chart family. Calendar Heatmap and Table availability are
backend-specific; the runtime catalog is authoritative.

For a compact board cell or fixed export size, consult the installed chart
guide: `baseSize` is a target and `canvasSize` is a ceiling, not a guarantee
of readable output. Check the actual size, title wrapping, legend, and marks
at the requested dimensions.

Data uses inline rows or permitted local JSON/CSV/TSV. Remote URL fetching is
not the local-file-reference feature. Parse CSV correctly, transform before
charting, preserve semantic types across alternate treatments, and verify
entity/units/period as well as numeric membership.

For geographic comparisons, use the installed catalog to confirm map support.
Match boundary IDs to the data, and verify attribution, represented regions,
and any fallback warnings in the rendered result. Check unmatched region keys
and coordinate order. Use area color for rates or shares and sized points for
totals. Keep comparable views on the same scale when the measure and units
match; distinguish missing data from zero. The isolated Vega-Lite
fixture verified bundled World Bank boundaries and rendered attribution;
it does not establish custom boundary URL or cross-backend support.

## Examples and documentation

- [Offline Flint Showcase](../resources/flint-showcase.html) and
  [Interaction Lab](../resources/flint-experimental.html): canonical Alex ACT ONE
  demos with inspectable starting specs. They ship with this skill and run in a
  browser without a checkout, server, or internet connection.
- [Official Flint gallery](https://microsoft.github.io/flint-chart/#/gallery):
  worked examples by chart type and backend. The Vega-Lite gallery includes
  point maps and choropleths at both U.S. and world scales.
- [Official Flint documentation](https://microsoft.github.io/flint-chart/#/documentation):
  complete starter specs and guides for chart types, themes, interactions, and
  application integration.

If a host does not expose bundled files, use the official links when online or
Flint's installed authoring resources when available. No checkout is required.

Use these examples for patterns, not as version-matched tool schemas. Check the
installed catalog for the target backend and validate any adapted input before
rendering. The [upstream repository](https://github.com/microsoft/flint-chart)
provides source and release notes. npm configuration remains the registry
authority. No global installation, registry override, or unpinned fetch is
part of a render operation.
