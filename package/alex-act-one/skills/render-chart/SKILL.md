---
name: render-chart
description: "Orchestrates expert visual storytelling over Flint: frame the claim, inspect data, explore familiar and expressive treatments over one semantic truth layer, select or author a theme, render, compare, iterate, and verify. Use for open-ended chart and data-story requests; preserves fast paths for diagnostic charts, fully formed specs, and explicit treatments."
lastReviewed: 2026-09-18
---

# /alex-act-one render-chart

Follow these steps in order. Skip any step that the user's request has already answered.

For each skill below, use a project override at
`.github/skills/local/<name>/SKILL.md` when one exists. Otherwise use the host's
skill tool to load the named bundled skill. If that tool cannot expose it, read
the explicit bundled link relative to this prompt in the installed ONE package,
not relative to the adopter's working directory. An adopter does not need a
local `skills/` tree. Confirm both the tool lookup and the actual installed
file before reporting a missing capability or recommending installation.

1. **Load [chart-big-idea](../chart-big-idea/SKILL.md)** and produce a Chart Brief using the resolution rule above. Follow its numbered steps: **Step 0** (read the surrounding docs / prose / ticket / section heading for an existing Big Idea before asking the user anything), Step 1 (draft or elicit the Big Idea — use the 3-question ladder one question at a time if Step 0 didn't surface it), Steps 2–5 (story arc, audience, style stance, Brief). Classify the intent as **explanatory, exploratory, or persuasive**, and record a **theme / tone stance**. **Ask the user the TRADITIONAL vs INNOVATIVE style-stance question explicitly** unless they've already stated a preference. The output is the compact Chart Brief block that Steps 3-6 below consume as their constraint.

   Skip only if the user provided a fully-formed spec, is iterating style/color on an already-chosen chart, or is doing purely exploratory data profiling — see the skill's "When to invoke" section.

2. **Load [flint-chart](../flint-chart/SKILL.md)** using the same resolution rule. If it is genuinely unavailable after checking the installed package, report the exact missing capability and stop.

3. **Understand the data.** If the user attached a file, read the first ~20 rows to see column names, types, and cardinality. If not, ask for a sample, file path, or paste. Do not chart blind — the skill's "Sanity-read the values first" rule applies.

4. **Confirm the analytical question** using the Brief and the owning skill's Step 0. Do not re-elicit an existing supported claim. If it conflicts with the data, surface the conflict before choosing a chart.

5. **Pick the creative range.** Use `chart-vocabulary` and the owning skill's chart-selection reference, then verify exact names with the backend catalog. For an open-ended storytelling request, author two materially different candidates over the **same `data` and `semantic_types`**: one familiar and one more expressive. Change the analytical presentation, not merely the palette. Preserve the fast path for an explicit treatment, supplied spec, or diagnostic chart.

6. **Author the candidate `ChartAssemblyInput` values** using the loaded version-matched grammar: exact chartType, real field-to-channel mappings, and registered semantic types. Reuse the semantic truth layer across candidates. For a standalone chart, title the supported finding and use the subtitle for population, period, measure, and units; omit them only when the surrounding artifact supplies the same reading. Select a preset with `list_themes` or load `flint-theme` for a custom system.

   When the requested experience includes exploration, reader gestures, initial
   emphasis, linked views, or app integration, load and follow
   [flint-interactions](../flint-interactions/SKILL.md). Reuse the Brief and
   chart input; do not restart framing. Define behavior/reset acceptance before
   validation, then test it after display. Static-only output needs no interaction pass.

7. **Validate, render, and compare.** For interactive Vega-Lite with App UI support, call `validate_chart`, resolve errors/warnings, then `show({ "chart": input })` with the full spec. Flint 1.0.1 keeps no chart state between calls. Use `render_chart` for requested static output or a host without App UI; Vega-Lite/ECharts support PNG/SVG and Chart.js PNG. Use `compile_chart` for backend JSON. ThemeSpec applies to Vega-Lite in this MCP workflow. Compare the rendered candidates' focal point, reading order, hierarchy, accessibility, and study cost against the Brief.

8. **Verify and iterate — look at what you rendered.** Load [render-verify](../render-verify/SKILL.md) using the same resolution rule. Use the host's built-in browser tools if it has them and they can open the artifact; otherwise the optional `alex-playwright` MCP server. Read console errors _before_ judging the picture, then walk the skill's chart and storytelling checks. Repair visible defects and re-render the smallest responsible layer. Check that the selected picture carries the Brief's Big Idea without relying on surrounding prose to explain what the visual failed to show.

   **Mandatory** after any post-Flint Vega-Lite edit and before committing generated HTML/SVG/PNG. If you have no way to look at the result, say so in Step 9 rather than implying it was checked.

9. **Report** what you chose and why, using the Brief as the spine:
   - The Brief's Big Idea + story arc + style stance
   - Which chart family + chartType you picked
   - Which alternates from the Brief and chart-selection reference you considered
   - The strongest rejected alternative and the trade-off that made it lose
   - Any analytical or chart-framing anti-patterns you avoided
   - **Whether you verified the render, and how** — or that you could not

If the `flint` MCP server isn't registered, point the user at the plugin README's Install section and stop — do not attempt to render.

## Anti-patterns for this prompt

- **Skipping Step 1 (Chart Brief).** Rendering before framing is the top failure mode. The Brief is 10 lines; the wrong chart costs a re-render plus a user correction.
- **Not asking the TRADITIONAL vs INNOVATIVE question.** Both are valid; the user is entitled to the choice. Silent defaults produce mismatches when the audience is glance-time and you picked innovative because it was more interesting to render.
- **Guessing at data shape.** Read the actual rows. Column names lie; sample values don't.
- **Rendering before framing.** If the Brief does not establish a supported analytical message, do not choose a treatment that implies one.
- **Skipping backend catalog verification.** A generic chart-family recommendation is not proof of an exact registered chartType. Verify names and use a supported substitute before authoring.
- **Overloading a single chart.** More than ~5 series on a line, more than ~5 slices on a pie, more than ~4 series on grouped bars → propose Small Multiples (`row`/`column` facet) or split into multiple charts.
- **Claiming a render is correct without opening it.** "The tool returned success" means bytes were written, not that the picture is true. Step 8 exists because `validate_chart` passing and the chart being right are different facts.
- **Palette-only creativity.** A new color set is not a materially different treatment. Change the rhetorical or perceptual strategy.
- **Changing semantics to dramatize an alternative.** Candidate treatments share data and semantic types unless a named upstream transformation changes the analytical question.

## Would Revise If

Revise this prompt if:

- Users consistently skip Step 1 or find the Chart Brief too heavy (indicates `chart-big-idea` needs its "tighten to 3 fields" fallback triggered).
- Users consistently skip Steps 2-5 (indicating the numbered flow is too heavy for the common case).
- Users consistently skip Step 8 (indicating verification belongs inside the render step rather than as its own stage).
- The runtime's validated `show` contract or App UI support changes.
- A reproducible case establishes that an interactive panel already performs a specific verification check; remove only that duplicate check, not the semantic/data verification.
- An owning skill's procedure or reference routes change and this orchestration no longer preserves them.
