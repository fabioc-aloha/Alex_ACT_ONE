# Offline Flint browser acceptance

The [acceptance harness](../../scripts/flint-browser-acceptance.mjs) exercises
the actual [editorial gallery](../flint-showcase.html) and
[interaction lab](../flint-experimental.html). It does not substitute a renderer
or modify the embedded upstream App.

## Run it

Use the already provisioned Playwright package and an installed Chromium-family
browser. This command installs nothing and opens only the two local files:

```powershell
node scripts\flint-browser-acceptance.mjs --channel msedge
```

Use `--runtime-root <absolute existing runtime>` to select a different approved
runtime, or `--channel chrome` for an installed Chrome browser. Missing packages
or browsers fail explicitly; the harness does not download one. It runs in a
fresh headless browser, closes every page and the browser in `finally`, and saves
downloaded specs only to test-owned temporary files that it removes afterward.
The JSON result goes to stdout; a failed or blocked required check exits nonzero.
Run this browser gate separately from CPU-intensive full-suite jobs. During
release preparation, concurrent runs reached the bounded resize deadline while
standalone runs passed; this is not evidence that concurrent/stress execution
has been certified. Preserve timeout reports rather than treating them as passes.

The exported `verifyShowcasePage(page, options)` can also use an existing
Playwright page scoped to a local demo. `nativeFocus: true` opts into the
documented child-frame CDP path and restores focus emulation afterward.
`downloads: false` records a blocked check, never a successful file-save result.
Neither current host code runner supported importing this module; the recorded
run below therefore used the direct Node CLI, not an integrated-browser run.

## Required checks

| Check | Evidence required |
| --- | --- |
| Offline | Fresh load with HTTP(S) blocked; no attempted requests or browser errors |
| Images | Every backend image decodes to nonzero dimensions |
| Matrix | Every sample/theme/story variant mounts its expected real charts |
| Keyboard | Shell Tab order and an actual chart Enter step change the announced focus target |
| Keyboard matrix | Baseline keyboard-enabled examples enter chart navigation and restore its root label and actual focus with Escape |
| Focus | Visible indicator and measured contrast of at least 3:1 against its adjacent shell background |
| Live regions | Shell and chart feedback regions exist; speech itself is not observed |
| Contrast | Sampled shell text and controls measure at least 4.5:1 |
| Chart contrast | Observed baseline SVG text measures at least 4.5:1 (3:1 for large text); painted marks or their visible outlines measure at least 3:1 |
| Linked selection | Selected semantic identities are emphasized in every recipient; base populations stay intact |
| Reset | Escape and Reset example restore populations and emphasis |
| Resize | Settled plots fit their nearest clipping containers at desktop, tablet, and narrow widths |
| Saved spec | Trusted keyboard activation produces a download event and actual saved file, equal to the selected starting input |
| Provenance | Embedded data and upstream App digests match their actual payloads |

The chart audit resolves value labels against underlying painted marks rather
than the canvas alone, ignores fully transparent hit-test overlays, and
composites opacity before measuring. Unsupported paints and out-of-viewport
targets fail explicitly. Coverage is baseline keyboard-enabled examples and
their themes, excluding intentional update-layer dimming; color-to-color
distinguishability, gradients, complex paint stacks and all chart families are
not certified. Additional keyboard traversal uses the first theme on each page.

The [2026-11-08 hardening evidence](https://github.com/fabioc-aloha/Alex_ACT_ONE)
records passing expanded checks. Demo themes retain their inherited visual
systems with focused contrast overrides and opaque points. Heatmap colors use
numeric mapping over the original bounded score domain and darker same-hue
ramps, avoiding missing intermediate values and unreadable in-cell labels.
Static previews use the same contrast settings; they are not separate
browser-contrast certification. The bundled upstream App remains unchanged.
[Native download observations](https://github.com/fabioc-aloha/Alex_ACT_ONE)
record trusted activation without a download event or saved file; the passing
headless saved-file check does not close that integrated-host gap.

After each viewport change, resize checks bring the viewer onscreen so
Chromium does not suspend offscreen cross-origin frame work. Resize settling
requires repeated exact agreement between the current iframe
and child viewport widths before measuring plot fit, then 300 ms of unchanged
viewport, chart, and clipping geometry. The pinned Flint renderer debounces
relayout by 150 ms, so two fitting samples 100 ms apart can still describe the
old layout. The one-pixel clipping and chart-fit thresholds are unchanged.

Line charts may dim every base path and redraw the selected series in an
overlay. The harness checks the selected series' unique stroke identity in
that overlay, not just a changed opacity or the presence of any overlay.
Unsupported or ambiguous identity mapping cannot pass.

## Recorded local evidence

Tested on 2026-11-05 in Windows, Node `26.13.0`, and headless Edge
`156.0.4314.58`, against the working source candidate based on `b6cc870`.
This is not a same-commit hosted CI result or a published release. Each HTML
file carries the tested build's source-input and content digests.

| Page | Render matrix | Linked recipients | Layout widths | Saved starting input | Result |
| --- | --- | --- | --- | --- | --- |
| Editorial | 24 variants | Region totals and store points | 1440, 768, 390 | `flint-linked-swiss.json`, exact JSON match | All required checks passed |
| Experimental | 27 variants | Rank, run scatter, and ECDF overlays | 1440, 768, 390 | `flint-linked-lab-de-stijl.json`, exact JSON match | All required checks passed |

The pass caught two artifact defects: explicit live sizes disabled upstream
responsive relayout, and the experimental focus ring lacked sufficient
contrast against its dark background. Live inputs now omit fixed sizes while
static previews keep their export sizing. The experimental ring uses the
existing accent color; measured focus contrast passed the required threshold.
The scatter examples in the lab also declare supported accessible navigation.

Native VS Code screenshots were separately inspected for the editorial
desktop board and experimental mobile board. Native saved-download completion
remains unverified. A headless Edge save is not proof of a native host download.

### 2026-11-06 resize diagnosis

A standalone Edge `157.0.4341.42` run timed out on editorial resizing while the
experimental page passed; a targeted follow-up passed. Instrumented repeated
editorial runs later reproduced stable 474/512-pixel SVGs inside 320-pixel
clipping containers at the narrow viewport. This was real stale layout, not
pixel jitter or a reason to loosen the acceptance threshold.

The narrow viewport moved the iframe below the visible window: its top was
1050 pixels in a 1000-pixel viewport, even though `visibilityState` remained
`visible`. Bringing that same stalled frame onscreen let both charts fit within
three seconds, without remounting or changing inputs. The gate now scrolls the
viewer into view after every viewport change before waiting on frame work.

The old gate could also advance before the upstream 150 ms relayout debounce.
It now requires an unchanged-geometry quiet interval beyond that debounce
before advancing. Extending that interval alone did not resolve offscreen
throttling; those failed diagnostic runs remain part of the investigation.
Deterministic regressions check visibility ordering, delayed geometry changes,
persistent clipping, and both sides of the existing one-pixel limit. The bundled
upstream App and generated pages are unchanged. Required standalone acceptance
must still pass; earlier timeouts remain failures, not discarded observations.

The onscreen-frame correction also exposed a download setup failure: a parent
pointer action returned without delivering a click to the disclosure, leaving
its button hidden. The saved-file check now focuses and activates the disclosure
and button with trusted Enter keys, waits for button visibility before listening
for the download, and still saves and validates the real file. Instrumented
keyboard events reached both intended targets and produced the native download.
This is keyboard-download evidence, not a claim that the failed pointer action
worked.

After both harness corrections, three consecutive fresh standalone gates on
Windows/Node `26.13.0` and Edge `157.0.4341.42` passed every required check for
both pages, including actual saved JSON validation. These are working-source
observations, not a new release, integrated-browser download proof, or stress
certification.

## Provenance and limits

Build provenance records normalized-LF source-input SHA-256 digests, the exact
embedded data/App digests, renderer package versions, and bundled-font hashes.
It contains no home directory, wall-clock timestamp, or moving Git HEAD.
Rebuild with the [reviewed environment](../testing.md) and use both builder
`--check` modes to verify exact outputs. Do not edit the generated HTML by hand.

This is representative pointer/keyboard behavior, sampled shell contrast, and a
live-region DOM check, not an accessibility certification. It does not cover
every chart's keyboard path, all SVG text/colors, screen-reader announcements,
every gesture preset, all browsers, or installed Copilot skill/host parity.
Keep those limits separate from the [scenario suite](README.md).
