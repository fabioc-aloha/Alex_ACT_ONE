# ONE Alex ACT

Install once. Get ACT on every surface.

**Status:** In development. Not yet published to the Mall.

## What This Is

ONE carries the Alex ACT constellation in a single plugin: epistemic discipline,
critical thinking, engineering craft, visual authoring, document conversion,
brain compilation, and AI provider planning.

| Component | Count |
| --- | --- |
| Skills | 59 |
| Always-on instructions | 17 |
| Slash commands | 17 |

Excluded from the first release:

- **AI Operations** (`model-router`, `model-task-execution`, `setup-ai-operations`).
  It is the only component requiring paid third-party accounts and API tokens,
  and the only one that can spend money. It serves neither of ONE's two goals.
- **The Scout skill bridge.** ONE exists so that no bridge is needed, and the
  bridge's junctions actively break `copilot plugin install`.
- **The private MSFT plugin**, because ONE is intended for Mall distribution.

## Why It Exists

A working ACT setup currently takes nine steps across two plugin stores, and two
of them are traps. `alex-act-core` can sit installed and enabled for days while
providing nothing, because Microsoft Scout reads a different directory than the
one `COPILOT_HOME` points at. The failure is silent.

ONE replaces that with one install and one activation step.

## Surfaces

| Surface | How it reads ONE |
| --- | --- |
| Copilot CLI | Native plugin discovery |
| VS Code + GitHub Copilot Chat | Native plugin discovery |
| Microsoft Scout | Directory scan of the user-level plugin store |
| GitHub Copilot app | Untested — not yet verified on a machine with the app installed |

ONE ships skills at the package root so that every one of these surfaces finds
them without a bridge, a junction, or a second store.

## Install

Not yet available from the Mall. To try the current source:

```powershell
copilot plugin install fabioc-aloha/Alex_ACT_ONE
```

Then activate the always-on instructions:

```text
/alex-act-one bootstrap-core
```

Instructions are not installable through the plugin manifest, so activation is a
separate, consented step. It previews every file before writing anything.

## What Is Not Here Yet

- Mall publication
- Verification on the GitHub Copilot app
- The shared knowledge base and evidence ledger currently owned by
  `Alex_ACT_Scout`
- AI provider planning and execution (see the exclusions above)
- Any claim that the existing constellation plugins are superseded

## License

MIT. See [LICENSE](LICENSE).

Component sources are the Alex ACT constellation repositories, all MIT licensed
and authored by the same maintainer.
