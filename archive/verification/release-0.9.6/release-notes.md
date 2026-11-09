# Alex ACT ONE 0.9.6

This release improves proxy-aware setup, artifact evidence output, and offline
chart readability without changing the reviewed dependency pins.

## Changes

- Detect the exact configured HTTPS Microsoft npm proxy and select its
  confirmed tarball prefix automatically. Explicit routing wins; npm registry
  and security settings remain unchanged, and fetch-policy failures stop.
- Accept explicit repository-owned CLI scenario evidence destinations while
  refusing to overwrite an existing run.
- Measure live SVG text, painted marks and visible outlines against their
  actual backgrounds and opacity. Extend keyboard exploration and Escape
  focus restoration beyond the original chart.
- Retain house palettes with focused contrast settings and opaque points.
  Bounded-score heatmaps use numeric color mapping and readable same-hue
  ramps, preserving the original values and score domain.
- Normalize package verifier roots so relative paths do not cause an endless
  parent-directory walk. A bounded regression reproduces the former timeout.
- Preserve the lean runtime payload, all declared owners/resources, both exact
  Flint demos, and their upstream App bytes and notices.

## Verification boundaries

The exact final release commit requires the full Windows/Ubuntu matrix,
fresh-checkout strict gates, exact demo rebuilds, package/source hashes and
browser acceptance. See [the release record](README.md) for actual results.
Passing structural tests is not all-host behavior or accessibility certification.
Native transcript/form completion, integrated-browser download completion,
broader accessibility, strong write enforcement and runtime rollback remain
separate gaps. Earlier installed `0.9.5` host evidence is not a new `0.9.6` pass.

## Manual installation

The user explicitly chose publication before installation. No installed update
or profile activation was performed by the publishing agent.

After confirming `0.9.6` is available in Mall, close hosts that may lock the
plugin and use a standalone PowerShell terminal in the source checkout:

```powershell
.\reinstall-and-check.ps1 -Refresh -ExpectedVersion 0.9.6
```

The helper updates an enabled Mall installation without uninstalling first,
preserves conflicting instructions, verifies the selected package, and applies
only its matching canonical bootstrap. Restart the host after it succeeds.
Dependency pins are unchanged from `0.9.5`; no optional dependency installation
is required by this release. Optional no-install readiness checks remain a
separate user action.
