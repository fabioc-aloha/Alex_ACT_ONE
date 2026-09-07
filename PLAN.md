# ONE Alex ACT — Plan

**Drafted:** 2026-09-06 · **Owner:** Fabio Correa · **Status:** In progress

## Progress

| Date | Result |
| --- | --- |
| 2026-09-06 | Repository created at `fabioc-aloha/Alex_ACT_ONE`, private. 59 skills, 17 always-on instructions, 17 slash commands adopted from the six public constellation plugins. AI Operations and the Scout skill bridge scoped out. |
| 2026-09-06 | **Design proven.** ONE installs from source and Microsoft Scout auto-discovers all skills with zero bridge junctions. Registered skill count moved from 61 to 82. |
| 2026-09-06 | Instruction activation previewed successfully: 17 instructions resolve against `~/.copilot/instructions`. Not yet applied. |

Open: Mall publication, VS Code verification with ONE installed, applying the
instruction bootstrap, and deciding whether the now-redundant constellation
plugins are uninstalled locally.

## The Claim

Install one plugin from the Mall. Get ACT on every surface.

## Why This Is Worth Building

Getting a working ACT setup today takes nine steps, and two of them are traps.
Verified tonight by doing it:

1. Register the Mall marketplace
2. Install `alex-act-core`
3. Install `alex-act-illustrator-plugin`
4. Install `alex-act-document-tools`
5. Install `alex-act-ai-operations`
6. Install `alex-act-enterprise` / `alex-act-msft` if wanted
7. Run `/alex-act-core bootstrap-core` to activate 17 instructions
8. Run the bridge doctor to create 42 junctions for Scout
9. Know that `COPILOT_HOME` and `~/.copilot` are different stores, and that
   only `~/.copilot` is the bridge source

Steps 8 and 9 are the traps. `alex-act-core` sat installed in Scout's
`COPILOT_HOME` for 11 days (2026-08-26 to 2026-09-06) and none of its 35 skills
ever loaded, because that is the wrong store. The failure is silent: plugins
list as installed and enabled while providing nothing.

**With ONE: one install, no bridge, no second store, no silent failure.**

## What Is Already True

Measured 2026-09-06. This is the baseline; do not re-inventory it.

| Surface | Reads `~/.copilot/installed-plugins` | Evidence |
| --- | --- | --- |
| Copilot CLI | Yes, native | `copilot plugin list` |
| VS Code + Copilot Chat | Yes, native | Reports 4 plugins matching the store exactly |
| GitHub Copilot app | Unverified — not installed | Only an `icons` stub in `Programs` |
| Microsoft Scout | **No** — scans directories instead | Needed 42 bridge junctions |

Three of four surfaces already consume one user-level install with zero setup.
**Scout is the only outlier.** ONE does not need to solve four problems.

## What ONE Adds

1. **One install instead of six** — skills, instructions, and prompts in a
   single Mall plugin.
2. **Scout without a bridge doctor.**

Nothing else. Any capability that does not serve one of these two is out of
scope for the first release.

## The One Open Decision

How ONE reaches Scout. Both options were measured tonight:

| ONE ships | Scout behavior | Cost |
| --- | --- | --- |
| `.github/skills/` plus a bridge manifest | Clean names (`/plan`) | User must run the bridge doctor — the step ONE exists to remove |
| root `skills/` | Auto-discovered, zero setup | Names become `/agency-one-plan`; no way to exclude a skill from Scout |

Evidence for auto-discovery: `md-to-word` and `rich-email` are registered in
Scout with no junction, because Document Tools uses a root `skills/` layout.

Decide this before writing any code. It determines the package shape.

## First Release: Definition of Done

- [x] Skills load in Copilot CLI — 59 skills installed from source
- [x] Skills load in Microsoft Scout with no bridge doctor run — auto-discovered
- [ ] `copilot plugin install one@alex-mall` succeeds from a clean profile
- [ ] Skills and instructions load in VS Code + Copilot Chat with ONE installed
- [ ] Instructions activate through `bootstrap-core` — previewed, not applied
- [ ] A user who has never seen this repository can follow the README and reach
      a working setup
- [ ] Removing ONE returns the profile to its prior state

Seven checkboxes. Each is verifiable in an afternoon. If a checkbox cannot be
checked, the release does not ship.

## Explicitly Not in the First Release

Recorded so they cannot quietly re-enter scope:

- Parity with the existing constellation, by skill count or otherwise
- Retiring Core, Illustrator, Document Tools, AI Operations, or the Mall
- The GitHub Copilot app, until it is installed and testable
- M365 Copilot Cowork and its publisher inputs
- Governance tooling, provenance receipts, and release-evidence gates beyond
  what shipping requires
- Deprecating `Alex_ACT_Scout` (see dependency below)

## Known Dependency: Scout Deprecation

`Alex_ACT_Scout` cannot be deprecated until ONE carries what only Scout has:

- **66 knowledge records** and **105 evidence events** in
  `OneDrive - Microsoft\Documents\ScoutSkills\`, active 2026-08-31 to 2026-09-05
- The shared-continuity skills that read and write them

Core deliberately removed shared continuity (ADR-020, ADR-038) and enforces its
absence with a contract test. If ONE carries this layer, that boundary needs an
explicit decision, not an assumption.

**Deprecation is gated on a working replacement, not declared in advance.**
ADR-038 declared retirement with no migration path; the repository was never
deleted, and the record stayed false for three weeks.

## How This Plan Fails

Revisit if any of these become true:

- The plan exceeds three pages
- A parity matrix, capability ledger, or skill-count comparison appears
- Two months pass with no checkbox checked
- A second planning document supersedes this one before anything ships
- Scout deprecation is declared before the 66 records have somewhere to go

Review by **2026-10-06**.
