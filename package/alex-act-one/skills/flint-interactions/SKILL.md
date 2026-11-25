---
name: flint-interactions
description: "Choose and verify interactive Flint chart behavior: highlight, brush, zoom, legend toggles, filters, annotations, keyboard navigation, linked views, and reset. Use when a reader should explore a chart, an agent updates its state, or an app connects to it. Route to Flint's installed interaction grammar; distinguish behavior, state, boards, and application code. Do not add interactions to static-only output."
lastReviewed: 2026-11-05
---

# Flint interactions

Turn the reader's question into a small, testable interaction contract.
Flint owns its grammar and presets; this skill owns intent selection, authority,
and behavioral acceptance. Interactions add behavior to a chart, not new chart types.

## When to use

- **Should fire:** "Let me brush a period and reset it", "compare series on
  hover", "filter by region", "link the selection to this other chart", or
  "highlight these records when the chart opens".
- **Should not fire:** a static PNG/PDF export, a bare noninteractive spec, or
  a title/color-only edit with no requested exploration or behavior.
- An exploratory session can justify interactions without a named gesture.
  Identify the reader's actual question; do not install every available preset
  merely because the user said "interactive".

If called by chart authoring, keep its existing input and Chart Brief. Do not
reload the caller or restart framing. For a direct request without a chart,
identify the data, exact chart type, encodings, delivery host, and intended
reader task before choosing behavior; clarify only material missing decisions.

## 1. Load the installed authority

Read `flint://interaction-skill` or call
`get_flint_skill({ "skill": "interaction" })` before writing a spec.
Use the relevant section from that runtime's returned guide. If a section
title is unknown or rejected, read the full guide without `section` rather
than guessing. Do not copy its preset, option, update-op, or programming-API
catalog here.

Call `list_chart_types` for the backend and
`list_interaction_presets` with the exact `chartType`. For a selected preset,
inspect its options and supported reset gestures. Chart support alone is not
enough: actual fields, discrete legends, continuous axes, and faceting can
change whether an interaction is admitted.

If the resource or a required tool is unavailable, report the missing capability.
If the Flint runtime or its host connection is the blocker, load [Setup Dependencies](../setup-dependencies/SKILL.md#when-another-skill-is-blocked).
Do not invent names or silently substitute a static picture for requested
interactivity. The reviewed interaction workflow targets Vega-Lite;
do not infer ECharts/Chart.js or static-output parity from successful rendering.

## 2. Select the workflow, not just a gesture

| Request | Owner-produced result | Load from Flint |
| --- | --- | --- |
| Reader acts on a chart | `interaction_spec` beside the existing chart input | Interaction guide: preset and validation guidance |
| Agent supplies emphasis, annotations, ordering, or viewport state | `updates` layers with the full chart input | Interaction guide: chart updates and supported operations |
| Several charts share a selection | Board `link_spec`, or application linking code only when requested | Board guide: link fields and send/receive behavior |
| Application reacts to a chart, or a preset cannot express the behavior | Approved project code using `flint-chart/interactive` | [Application integration route](../flint-chart/SKILL.md#runtime-and-project-integration) |

For controls that coordinate charts and metrics, use the bundled
[application state patterns](references/application-state.md).

Behavior and state are different. Read the current chart input, user edits,
selection/filter/viewport state, and existing update layers when available.
Preserve unrelated state and panel edits; do not guess an absent state snapshot.
Use semantic field identities, not pixel coordinates or fabricated row IDs.
On Flint 1.1.1, use `annotate-text` for a point or mark note and a supported
region annotation for a range. Do not introduce the deprecated
`set-annotation` operation. Validate the layer and verify the annotation in
the output the user requested.

Preserve source data, semantic types, units, and analytical meaning. An explicitly
requested filter changes the view, not the underlying dataset. Do not silently
drop rows or change a denominator to make an interaction appear useful.

## 3. Define observable acceptance before authoring

For each selected behavior, record:

- The reader task and the smallest compatible preset or supported alternative.
- The target field/marks, gesture or external input, and expected visible/state change.
- Its reset or neutral-state behavior; for transient interactions, test pointer
  exit rather than inventing a persistent reset gesture.
- Keyboard access and activation/reset behavior appropriate to the task, with
  any host or preset limitation explicit.
- Gesture ownership, ordering, and conflict resolution when presets compose.
  Avoid competing drag, double-click, legend-click, or retained-focus handlers.

For linked views, define the fields each chart actually carries, which charts
send/receive, and how selection and reset affect the other view. Load the native
board grammar rather than inventing a second linking schema.

## 4. Author, validate, and display

Use only names/options supported by the installed grammar. Preset options belong
in their supported options object. A bespoke callback needs an application host
that runs code; it is not executable JSON inside an MCP chart.

Call `validate_chart` with the complete chart and relevant `interaction_spec`
or `updates`; use `validate_board` for a linked board. Inspect every error and
warning. A valid chart can still have a dropped interaction or a yielded trigger.
Do not report that behavior as working. Correct the conflict or explain the
unsupported part and agree on a meaningful alternative.

For App UI output, send the same validated complete chart or board to `show`.
No server-side chart handle persists between calls: to revise it, preserve
relevant current edits/state and send the full updated input again.
If the host cannot display interactive output, report the limitation; provide
static output only as an explicitly described alternative.

## 5. Exercise behavior and reset

Load and follow [render-verify](../render-verify/SKILL.md) for visual/data checks.
For themed controls, linked views, filtering, state layers, or narrow boards,
load [behavioral acceptance](references/behavioral-acceptance.md) before choosing
the probes. Test rendered affordances and semantic identity, not assumed DOM shape.
Validation is not proof of working interaction. In a visible mounted chart:

1. Capture the before state and check console errors and baseline values/marks.
2. Perform each intended gesture, control change, or supported external update.
3. Check the after state and visible response against the acceptance contract,
   including linked recipients and preservation of unaffected data.
4. Perform reset, pointer exit, or return to the stated neutral state. Verify
   keyboard behavior separately where promised and repeat after any conflict fix.

Prefer available native browser tools, retaining a permitted registered fallback
for unsupported cases. A screenshot or accepted `show` response alone does not
establish that a gesture, reset, keyboard path, or linked selection worked.
If the live surface/state cannot be inspected, mark those checks **unverified**;
do not infer them from the spec or a static export.

## Output and authority

Return the requested spec/update/code or chart, the chosen behavior and reason,
resolved warnings/conflicts, and tested versus unverified acceptance cases.
For spec-only requests, label runtime behavior unverified and do not force display.
Do not claim all presets, backends, hosts, or accessibility paths were tested.

Opening records, changing external app state, sending data, installing packages,
or modifying project code requires the corresponding user request and approval.
A click handler or chart selection is not blanket consent for those effects.
Use synthetic fixtures for potentially consequential tests.

## Would revise if

Revise when installed grammar/preset discovery contradicts this routing,
validation silently drops a requested behavior, gesture/reset or keyboard
tests expose a gap, or linked/app authority becomes ambiguous.

## References

- [Interaction demos and concepts](https://microsoft.github.io/flint-chart/#/interactions)
- [Flint example and documentation index](../flint-chart/references/flint-language-reference.md#examples-and-documentation)

Live documentation illustrates intent; the installed runtime remains the exact
language authority. This skill changes neither runtime pins nor installation.
