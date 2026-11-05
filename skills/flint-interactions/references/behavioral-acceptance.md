# Flint behavioral acceptance

Load for themed interactive charts, linked views, filtering, state layers, or
responsive boards. The installed Flint interaction/theme/board resources still
own exact grammar. These checks complement validation; they are not a preset
catalog or another renderer.

## Probe the meaning, not a DOM accident

| Behavior | Required observation | False success to reject |
| --- | --- | --- |
| Highlight or group focus | Intended semantic identities remain emphasized; unrelated marks dim as specified; source rows remain intact | Some opacity changed, without checking which records it represents |
| Linked selection | Shared-field condition reaches every intended recipient, with the selected group visibly present | Every base line dimmed, while no selected-group overlay was drawn |
| Filter | Visible rows match the active field/range condition, and reset restores the expected population | A control label changed, but frame-timed filtering never ran |
| Reorder | Category positions change, while identities and values remain the same; reset restores the stated order | DOM order changed, or a test expects the DOM nodes themselves to be sorted |
| Brush zoom | Axis domains or viewport state change to the requested region; reset restores the original domains | Only a transient brush rectangle appeared |
| Agent-authored updates | Each layer's intended emphasis/annotation is drawn without rewriting data or unrelated state | The layer is accepted, but no visible annotation or emphasis appears |

Flint can draw the selected series in an overlay while muting its base marks.
Inspect the overlay and its represented group, not only the original paths.
Compare semantic identities, field values, or accessible descriptions across
themes; a theme can change circles to other symbols or remove a value axis.
When testing reordering, use geometry or the exposed order state rather than
DOM order. Fixed role/shape counts are not portable acceptance criteria.

## Match instructions to rendered affordances

- Inspect actual filter controls before writing directions. A declared widget
  can render as toggle buttons rather than checkboxes. Test the first choice,
  adding another choice, the all-values action, and range input against source
  rows; document whether the view hides or merely highlights excluded records.
- A legend/key used as a control must persist so a reader can restore a hidden
  series. A theme may use end-of-series labels that disappear with that series.
  Test hide **and** restore under every advertised theme. If needed, use a small
  supported ThemeSpec override for a persistent key, then revalidate and rerender.
- Read compiler/console warnings as well as schema warnings. Layered line/point
  legends can conflict even when validation returns no warnings. Change the
  responsible supported theme policy only after reproducing the conflict; do
  not hide warning output or blanket-disable legends. Removing a decorative
  legend requires another way to identify series and must not remove a control.
- For keyboard navigation, focus the actual focusable tab stop, not merely the
  `role="application"` container. Follow its announced Enter/arrow instructions;
  verify the focused mark's identity/caption and the required Escape behavior.

## Establish a comparable neutral state

Persistent selection, hover feedback, keyboard focus, and initial update layers
are separate state. Clear the intended interaction, move the pointer to a
neutral location, and align focus before comparing with the baseline. A
still-hovered mark can retain emphasis after Escape correctly clears selection.
For transient hover, leaving the target is the reset; do not invent an Escape
contract absent from the preset. Reset must preserve intentional initial layers
unless the requested reset explicitly includes them.

Use the native state read-back where available, but corroborate it with the
visible result. A state report alone can miss a failed recipient overlay.
Likewise, a static preview may intentionally show only the base chart, not its
interactive or initial-state layers; label that distinction.

## Test the delivered surface

For a narrow/mobile board, inspect every chart's rendered bounds against its
clipping container, not just page overflow. Explicit tall/fixed cell settings can
prevent a chart from fitting even after the grid stacks its columns. Prefer the
native adaptive layout unless a fixed size is required and verified; do not
silently crop plots or reduce source data to make them fit.

An offline gallery must validate its real embedded runtime and theme variants,
not substitute custom JavaScript that merely resembles the requested preset.
Keep data, runtime versions, and representative rebuild/test commands
reproducible; retain upstream notices when redistributing a bundled runtime.
Do not install packages or vendor another renderer without the corresponding
user request and consent.

Return acceptance results for the cases actually exercised. Separate schema,
DOM activation, trusted pointer/keyboard, linked-recipient, image-decode, and
download evidence; unsupported checks remain explicitly unverified.
