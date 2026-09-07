---
name: install-visual-companions
description: "Offer to install eight marketplace plugins that extend visual-authoring workflows: chart rendering, screenshot verification, whiteboard iteration, and PR annotation. Consent-gated, one plugin at a time, never bundled without explicit approval. Use when the user asks to enable visual-workflow tooling, or when chart, figure, or print-SVG authoring produces artifacts that need runtime verification."
lastReviewed: 2026-09-07
---

# install-visual-companions

Eight marketplace plugins extend this plugin's visual authoring: chart rendering, screenshot verification, whiteboard iteration, PR annotation, and the vision loop that closes an apparent runtime-capability gap through composition rather than new authorship.

**None ship with this plugin.** Install them one at a time, per workload, with explicit consent. Plugin names surfaced by description-match are inferred, not verified, so confirm each one against `copilot plugin marketplace browse` before installing.

## When to fire

- The user asks: "install visual companions" / "add screenshot tooling" / "enable chart-rendering plugins" / "install eyeball" / "install the vision loop"
- The user invokes `/alex-act-one install-visual-companions`
- The user's declared workload involves any of:
  - Chart authoring, data storytelling, or dashboard rendering
  - Report / document generation that needs visual verification
  - PR review workflows with screenshots or annotations
  - Iterative chart design where seeing the render matters
- The `render-verify` skill flags a claim that would benefit from a screenshot audit

## When NOT to fire

- Pure-code work, non-visual data pipelines, backend / infra without UI — the companions add zero cost when not installed but non-trivial install-time friction when installed

## The eight companion plugins

Verified across four rounds of live install testing in 2026. The round-4 column records what was actually exercised.

| Plugin | Marketplace | Purpose | Round-4 verified? |
|---|---|---|---|
| `chromium-control-canvas` | `awesome-copilot` | Browser preview + screenshot | ✅ (see caveats) |
| `eyeball` | `awesome-copilot` | Screenshot audit with claim-proof output doc | ✅ (see caveats) |
| `diagram-viewer` | `awesome-copilot` | SVG / diagram drill-down preview | ✅ clean install |
| `napkin` | `awesome-copilot` | Whiteboard for iterative chart design | ⚪ Untested |
| `image-annotations` | `alex-mall` | PIL callouts + labels on screenshots. Optional: [`annotate-screenshot`](../annotate-screenshot/SKILL.md) covers this in-plugin; reach for the companion only for automatic multi-label placement or pixel diffing | ✅ |
| `chart-interpretation` | `alex-mall` | Read charts, extract insights (reverse of authoring) | ✅ |
| `visual-artifact-qa` | `alex-mall` | Render-time verification (visual output that passes static checks can still fail to render) | ✅ |
| `visual-pr` | `awesome-copilot` | PR screenshot + annotation embed workflow | ⚪ Skills-only, needs real PR to exercise |

> `storytelling-requirements` was a ninth companion until 2026. Its framing
> role now ships here as [`chart-big-idea`](../chart-big-idea/SKILL.md), so it
> needs no install.

## Vision loop composition

Discovered via GH-APP-SUPPORT Round 3. The framing gate moved in-plugin on
2026-08-18, so the loop now needs three installs rather than four:

```text
chart-big-idea  →  visual-artifact-qa  →  chart-interpretation  →  eyeball
 (framing gate,      (render check)        (read-back audit)      (claim proof)
  in-plugin)
```

Composes end-to-end with zero conflicts. Closes what looks like a runtime-capability gap (multimodal vision on agent output) via composition, not net-new authorship. The vision loop is why the "canonical bundle" for the loop is the 3 companions above plus in-plugin framing; the other 5 fill adjacent gaps.

## Expert storytelling stages

These are task-triggered options, not one required bundle. Check availability
before routing; a missing companion is healthy and does not make this plugin
incomplete.

| Storytelling moment | Optional companion | Role |
| --- | --- | --- |
| **Requirements and audience** | [`chart-big-idea`](../chart-big-idea/SKILL.md) (in-plugin) | Capture audience, Big Idea, questions, evidence, and delivery target. No install needed. |
| **Spatial ideation** | `napkin` | Sketch composition or sequence while the layout question is unresolved. |
| **Independent reading** | `chart-interpretation` | Read the candidate from the audience side; surface patterns, omissions, bias, and competing narratives. |
| **Render QA** | `visual-artifact-qa` | Add static output checks around the visual inspection boundary. |
| **Evidence-rich review** | `eyeball` | Pair factual claims with source screenshots when auditable visual evidence is required. |
| **Critique and handoff** | `image-annotations`, `visual-pr` | Mark specific defects and carry reviewed screenshots into a pull request. |

Never install a companion silently. Route only to installed capabilities unless
the heir explicitly invokes this skill and approves each requested plugin.

## Consent flow

### Step 1 — Confirm the workload

Print the 8-plugin table. Ask the heir:

> "Which visual companions do you want? Reply 'vision loop' (visual-artifact-qa + chart-interpretation + eyeball, 3 plugins, the composition pattern from GH-APP-SUPPORT; the framing gate is already in-plugin as chart-big-idea), 'all eight', or name specific plugins. Reply 'skip' to install nothing."

Default to no action if the heir says "skip" or does not respond. Never install without an explicit consent list per plugin.

### Step 2 — Verify each exists in its marketplace

Marketplaces change, and plugin names surfaced by description-match are inferred rather than verified. Confirm each name against a marketplace browse before installing.

For each plugin the heir named:

```pwsh
copilot plugin marketplace browse <marketplace>
```

Scan the output for the plugin name. If not found, report to the heir and drop it from the install list. Continue with the rest.

### Step 3 — Marketplace registration

Both `awesome-copilot` and `alex-mall` need to be registered in `~/.copilot/settings.json` `extraKnownMarketplaces`:

- `awesome-copilot` → typically pre-registered by Copilot CLI; verify with `copilot plugin marketplace list`
- `alex-mall` → `copilot plugin marketplace add fabioc-aloha/Alex_Skill_Mall` if not registered

### Step 4 — Install commands

Run the install commands in the heir's chosen order:

```pwsh
copilot plugin install <name>@<marketplace>
```

Example — install the vision-loop bundle:

```pwsh
copilot plugin install visual-artifact-qa@alex-mall
copilot plugin install chart-interpretation@alex-mall
copilot plugin install eyeball@awesome-copilot
```

Per-plugin, one at a time. If any install fails, report it to the heir and continue with the others (installs are independent).

### Step 5 — Install-time caveats

After the install commands complete, print the heir the caveats for the plugins they installed:

**`chromium-control-canvas`** — Needs 3 manual post-install steps:

1. `cd` to the extension dir + `npm install`
2. `npx playwright install chromium` (~112 MiB download)
3. A `python -m http.server` workaround for `file://` URLs (upstream limitation)

Node Playwright is required.

> This `file://` limitation belongs to `chromium-control-canvas`'s own bundled
> Chromium, not to the host. VS Code's integrated browser opens `file://`
> directly. Do not install this plugin merely to view a local file \u2014 see
> `render-verify` \u00a7 _When `file://` is not enough_.

**`eyeball`** — Needs 2 manual post-install steps:

1. `pip install playwright`
2. `python -m playwright install chromium` (~100 MiB, independent from Node Playwright — installing one does not satisfy the other, per upstream recommendation 5 in GH-APP-SUPPORT)

Also: default output path is `~/Desktop`, which is OneDrive-redirected on many Windows setups. If audit artifacts must not sync to corporate OneDrive, override the output path.

**`napkin` and `visual-pr`** — Also Playwright-based; may hit the same first-launch friction pattern as chromium-control-canvas.

**Both browser-based plugins** — Re-download Chromium (~100 MiB each) rather than sharing a common install (upstream recommendation 6 in GH-APP-SUPPORT).

### Step 6 — Report

Print a summary:

- Plugins installed (with marketplace + version)
- Plugins skipped (with reason: marketplace-browse failed / heir declined / already installed)
- Manual post-install steps outstanding (per caveats above; the heir must run them)
- Vision loop status: if all 3 external vision-loop companions are installed, tell the heir "vision loop is complete — you can invoke the composition end-to-end via any of the render-verify workflows"

## Anti-patterns

| Anti-pattern | Correction |
|---|---|
| Bundle all 8 without asking | Consent-gated, per-plugin. The 8 are heir-workload-dependent. |
| Install without verifying marketplace-browse | Per the `plugin-management` Safety rule — plugin names can be LLM-hallucinated. Verify first. |
| Skip the caveats step | Chromium download + Python Playwright + OneDrive-redirect trip most heirs on first use. Print them proactively. |
| Install into `.github/copilot/settings.json` at repo scope | Visual companions are heir-scoped tools, not project-scoped. User scope only. |
| Offer visual companions to a heir doing pure backend work | Zero-cost when not installed, but not free. Only offer when the workload calls for them. |

## Composes with

- [`render-verify`](../render-verify/SKILL.md) — this plugin's own visual-output audit skill; the vision loop extends it with cross-plugin composition
- [`chart-big-idea`](../chart-big-idea/SKILL.md) — owns the framing gate at the input side of the vision loop since 2026-08-18, replacing the retired `storytelling-requirements` companion

## Falsifiability

This skill is decorative if by 2026-11-01 (90 days):

- Users never invoke `/alex-act-one install-visual-companions` and always install companions ad-hoc
- The 8-plugin catalog goes stale (a plugin is retired or moved to a different marketplace) and is not refreshed
- The vision-loop composition pattern proves brittle in sustained use

Track outcomes in your project's own curation or decision log.
