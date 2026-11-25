# Application state for coordinated Flint views

Use this reference for a requested dashboard, explorer, or application update.
It complements the installed Flint 1.1.1 app guide, not the MCP `show` API.

| Intent | Keep separate | Verify |
| --- | --- | --- |
| Compare a selection with the whole | Highlight by semantic field and value; leave rows and totals intact | The same identities are emphasized in each linked view without changing the population |
| Inspect a period or region | Change the viewport, not the analytical population | Tick values or domain change; the comparison population and totals stay fixed |
| Analyze a subset | Filter the backing rows; recompute dependent aggregates and denominators | Charts and metrics agree on the filtered scope; show an honest empty state when no rows match |

- Match linked fields and value types across views, including at different
  aggregation levels. Do not silently add a receiver that cannot express the
  selection. Use one owner for each state value so updates do not echo between
  the chart and its controls.
- Read committed changes with `onChange` for shared app state. Use the pinned
  guide for `linkCharts` and `applyUpdate`; inspect whether an update was
  applied, yielded, or dropped. If a new population requires remounting,
  decide which state to restore and which to clear. Verify the mounted result.
- Reuse validated rows for highlight and zoom. Recompute locally if all needed
  rows are loaded; query the authorized source only when the population or an
  aggregate cannot be computed correctly on the loaded rows. For period
  comparisons, check for incomplete periods before drawing conclusions.
- Test highlight, zoom, and filter independently, then test their combination
  and reset. Never infer a successful state change from a new control label.

The Flint chart skill's offline Interaction Lab includes **Separate highlight,
zoom, and filter**. It uses a native Flint board for highlighting and zoom;
the offline host switches between prevalidated boards for filtering, which
clears transient chart state. It does not demonstrate in-place public app API
updates, external queries, or native MCP App delivery.

Design reference: [Data Formulator's chart coordination patterns](https://github.com/microsoft/data-formulator/blob/8fbe65f3e0111d94d70a0955ce0104dd3bef5ed5/py-src/data_formulator/analyst/skills/html_app/SKILL.md#L589).
Its `@df/*` modules, canvas actions, and saved application state are not Flint
APIs or runtime dependencies of this skill.
