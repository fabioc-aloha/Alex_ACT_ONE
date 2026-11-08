# Analytical chart selection

These are analytical recommendations, not a version-independent API catalog. Confirm the exact chart name and backend with list_chart_types before authoring; the current runtime catalog takes precedence over a stale example.

## Step 0 — pick the chart (when the user hasn't said which one)

**Skip this step** if the user already named the chart type (e.g. "scatter of
weight vs mpg"). Jump to Step 1 and author the spec. Otherwise, work down this
list before choosing a `chartType`.

### 0.1 One-sentence message — the Big Idea

Before choosing a chart, establish the message it should carry. **Load the
`chart-big-idea` skill and run it now** — look in
`.github/skills/local/chart-big-idea/SKILL.md` first (heir-installed), then
`skills/chart-big-idea/SKILL.md` (baseline).

It does four things this step cannot do inline:

- **Reads the surrounding context first** — the prose next to the insertion
  point, the ticket, the section heading, prior captions — so you do not ask the
  user to re-articulate a claim they already wrote.
- **Questions the intent** — whether the chart should exist at all, and whether
  the stated purpose is the real one. If the intended message and the data
  disagree, that surfaces here rather than after rendering.
- **Elicits the Big Idea** with a three-question ladder, one question at a time,
  when it is not written down anywhere.
- **Asks the TRADITIONAL vs INNOVATIVE style stance**, which changes the
  chartType you pick in §0.2.

The output is a compact Chart Brief. Treat it as the constraint on everything
below: §0.2 selection, §0.4 coverage, and the spec you author in Steps 1-3.

If the required chart framing owner is unavailable, report the missing dependency rather than silently skipping the framing contract. Use an existing supplied Brief without re-eliciting it.

### 0.2 Question → family → chart

> **Deeper reference**: the [`chart-vocabulary`](../../chart-vocabulary/SKILL.md) skill carries the full 7-goal × ~30-chart catalog, CSAR evaluation loop, override decision table, and 5-visual rule. Reach for it when the 7 rows below aren't enough, when evaluating an AI-suggested chart, or when the artifact will be hand-authored (not rendered via Flint).

| Analytical question            | Family       | Primary chart                                                                                                     | Alternates                                                                                                                                                                                                                                                                               |
| ------------------------------ | ------------ | ----------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Rank or compare categories?    | Comparison   | `Bar Chart` (2-15 items; horizontal orientation for long labels)                                                  | `Grouped Bar Chart` (2-4 series), `Stacked Bar Chart` (composition + total; use `stackMode: normalize` for 100% stacked), `Slope Chart` (before/after 2 periods), `Bar Chart` with `row`/`column` facet (many items, aka Small Multiples), `Waterfall Chart` (sequential adds/subtracts) |
| Change over continuous time?   | Trend        | `Line Chart`                                                                                                      | `Area Chart` (volume emphasis), `Bar Chart` + `Line Chart` combo via multi-encoding `y: ["bars", "line"]` (dual metric with different scales), `Sparkline` (in-table trend)                                                                                                              |
| How are values distributed?    | Distribution | `Histogram` (one variable)                                                                                        | `Boxplot` (compare groups + stats), `Violin Plot` (compare + shape, Vega-Lite), `Strip Plot` (every point matters), `Density Plot` (smooth shape), `ECDF Plot` (cumulative)                                                                                                              |
| Correlation between variables? | Relationship | `Scatter Plot`                                                                                                    | `Scatter Plot` with `size` channel (3 vars, aka Bubble), `Regression` (with fit line), `Connected Scatter Plot` (trajectory over time), `Parallel Coordinates` (many vars, ECharts)                                                                                                      |
| Part of a whole?               | Proportion   | `Bar Chart` (most accurate) or `Stacked Bar Chart` with `stackMode: normalize`                                    | `Pie Chart` (**only** if one slice dominates ≥60% OR comparing to 50%), donut (use the center for a KPI) — `Donut Chart` on Vega-Lite, `Doughnut Chart` on Chart.js, `Pie Chart` + `innerRadius` on ECharts, `Treemap` (many/hierarchy, ECharts), `Sunburst Chart` (interactive hierarchy, ECharts), `Funnel Chart` (sequential stages, ECharts)                       |
| Flow between stages?           | Flow         | `Sankey Diagram` (linear flow, ECharts)                                                                           | `Streamgraph` (aesthetic, precision sacrificed), `Heatmap` (matrix pattern), `Chord`-like flows → use `Sankey Diagram` instead                                                                                                                                                           |
| Progress toward a target?      | KPI          | `Bullet Chart` (Few's superior alternative to gauges: actual + target + qualitative ranges in one horizontal bar) | `KPI Card` (single number with delta), `Sparkline` (in-table trend), `Gauge Chart` (ECharts — reserve for high-visibility single-KPI tiles only)                                                                                                                                         |

### 0.3 Anti-patterns — don't recommend

- **Pie with >5 slices** — humans can't compare angles; use `Bar Chart` or `Stacked Bar Chart` with `stackMode: normalize`
- **Pie without a dominant slice** — if no category is ≥60% or the story isn't "X vs the rest", use a `Bar Chart`
- **Word cloud for real analysis** — position and word length distort; use `Bar Chart` of top-N terms (not in Flint; export to another tool)
- **Dual-axis combo without justification** — dual axes mislead by aligning unrelated scales; consider two separate charts
- **Truncated Y-axis on bars** — exaggerates differences; always start `Bar Chart` at zero (Flint does this by default; don't override)
- **Streamgraph when precise values matter** — the flowing baseline sacrifices readability; use `Area Chart` instead
- **Gauge over Bullet** — `Bullet Chart` packs actual + target + qualitative bands in less space with more precision
- **More than 5 series on a Line Chart** — becomes a spaghetti chart; use `row`/`column` facet (Small Multiples) or highlight one series and gray out the rest

### 0.4 Flint coverage — substitutes when the ideal chart isn't native

Some charts from wider visualization literature aren't in Flint's registry.
Recommend the substitute, not the missing chart:

| Ideal chart                                                             | Flint substitute                                               | How                                                                                     |
| ----------------------------------------------------------------------- | -------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Waffle Chart (10×10 grid %)                                             | `Bar Chart` or `Stacked Bar Chart` with `stackMode: normalize` | Labeled percentage bar communicates the same "N out of 100"                             |
| Chord Diagram (circular flows)                                          | `Sankey Diagram` (ECharts backend)                             | Linear flow is easier to read anyway                                                    |
| Pareto Chart (bars + cumulative %)                                      | `Bar Chart` + `Line Chart` via multi-encoding                  | Sort bars descending, overlay cumulative-% line                                         |
| Beeswarm Plot (every point)                                             | `Strip Plot` with `stepWidth`, `pointSize`, `opacity`          | Jittered points instead of packed; same "every dot is real" story                       |
| Ridgeline Plot (many densities)                                         | `Violin Plot` with `row` facet                                 | Density curves stacked per group                                                        |
| Small Multiples                                                         | any chart with `row` or `column` encoding                      | Native facet support                                                                    |
| Word Cloud / Sentiment / NPS Gauge / Likert / Mind Map                  | Not in Flint's scope                                           | Export prepared data to Power BI / Tableau / dedicated tool                             |
| Hierarchy visualization                                                  | `"Tree"` (ECharts only)                                       | Use `detail` for node labels, `color` for parent grouping, and `size` for values; validate the installed catalog before authoring |
| Control Chart / Run Chart / Pareto / Process Capability (SPC)           | Not in Flint's scope                                           | Use a dedicated SPC / Six Sigma tool; Flint isn't built for statistical process control |
| Decomposition Tree / Key Influencers / Smart Narrative (AI-Powered)     | Not in Flint's scope                                           | These are Power BI features; Flint is a chart compiler, not an analytics engine         |
| Table / Matrix (precise value lookup)                                   | Use a data table (not Flint)                                   | Stephen Few's rule — tables for lookup, graphs for pattern                              |

This table is a **catalog** boundary: Flint does not offer these chart types.
[`ascii-chart`](../../ascii-chart/SKILL.md) carries a separate **medium** boundary
listing forms ASCII cannot carry at all, such as pie, donut, sunburst, violin,
and streamgraph, because angle and smooth curves need resolution a character
cell does not have. The two lists barely overlap and are not interchangeable: a
chart absent here may render fine in ASCII, and a chart Flint renders well may
be impossible in ASCII.
