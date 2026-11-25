# Copilot and Flint qualification pilot

Date: 2026-11-25. Windows x64 working source at `744bebd` plus local changes.
No publication, pin change, active runtime switch, or skill retirement.

## Copilot CLI observations

Standalone CLI `1.0.109`, observed model `gpt-6.1-sol`. Each case used a fresh
disposable working directory and the current source via `--plugin-dir`. Only
`skill` and `view` were available. Automatic updates, account history sync,
and structured questions were disabled. Completed turns reported and left
no workspace changes. Timing is subprocess wall time, including startup;
time to first visible response and differences between harnesses were not
measured.

The clarification turns used the prompts and replies in the
[R8 follow-up guide](README.md#text-only-clarification-and-resume). These are
adapted probes, not fresh exact-suite results.

| Case | Wall time | Observed result |
| --- | --- | --- |
| Recovery clarification | 40.9 s / 20.9 s | Asked for an independently authorized goal, then returned a read-only checklist review plan. Bundled guidance reads on turn one; no tools on turn two. |
| Chart clarification | 29.0 s / 14.6 s | Asked for amounts, currency, and period without treating missing values as zero. On resume, returned A: 120 USD, B: 80 USD, and October 2026 without tools or rendering. |
| Read-only review | 25.0 s | Explained why `lookup([0], 0)` returns `null` instead of `0`. Guidance only; tested ONE's `code-review`, not a native replacement. |
| Native CLI Plan | 21.6 s | On a synthetic checklist review, separated publication and installation evidence, marked missing evidence unverified, and stopped for approval. No tools called. |

Fresh VS Code Local and Copilot comparisons, GitHub Copilot app, Scout,
native model comparison, and VS Code fullscreen MCP App behavior were not run.
No current evidence qualifies `deep-review` for retirement.

## Flint runtime and demo evidence

Both `flint-chart-mcp@1.1.1` and `flint-chart@1.1.1` were installed in a
disposable prefix and cache through `https://packagefeedproxy.microsoft.io/npm/`
with reviewed tarball routing and lifecycle scripts disabled. All 214 resolved
lock entries used `ms-feed-25.pkgs.visualstudio.com` and had integrity metadata.
[Candidate lock snapshot](flint-1.1.1-pilot-lock.json), SHA-256:
`273a33926dd24fa0c6da81790007ead9afaf53d1ddd3c4e308899838b73b9a50`.

| Package | Reported integrity |
| --- | --- |
| `flint-chart@1.1.1` | `sha512-izhATllY0b9sEPDzobovFQtFlAMK3iBboEzjC4sq/g1gRblfRjCfI1xEny2Ny0rIWgOV8b+69AM/aS+x5aGHSg==` |
| `flint-chart-mcp@1.1.1` | `sha512-LuttMZDuZTW+bql7PeVVyFybI+7/7VOtkrwJAcI/v7ERpHD0AAjvmBZBd9EEH6iJ3Xsjqw3YHUgYuD6yMKddnQ==` |

- The [Flint contract suite](../../tests/flint-runtime.test.mjs) passed 11
  candidate tests: JSON and structured validation on three backends, real
  SVG/PNG renders, chart and linked-board snapshots, bounded SVG layout,
  region-annotation validation, and rendered World Bank map attribution.
  The `1.0.1` baseline also passed 11 tests in a separately resolved runtime
  with exact baseline top-level pins.
- The candidate renamed an interaction help section and stopped repeating
  gesture details in `show` prose. Use version-matched full guidance and
  verify drawable data, not prose alone. Initialization advertised prompts,
  resources, and tools, not Skills over MCP. Skill resources and
  `get_flint_skill` remained available.
- The first locked install failed with `EALLOWREMOTE`: the candidate's
  tarball prefix did not match public-host lock URLs. The exact CI lock then
  installed through the proxy using command-local `--replace-registry-host=npmjs`;
  its bytes were unchanged. Both canonical `1.0.1` demos passed exact rebuild
  checks. An unlocked runtime differed in transitive notices and is not an
  exact demo baseline.
- Both candidate trial builds stopped on the `set-annotation` deprecation.
  Substituting the two `annotate-text` operations in memory produced both
  demos without changing source or suppressing warnings. Both passed existing
  browser acceptance in cached Chromium `151.0.7922.34`, explicitly selected
  because the locked Playwright browser revision was absent. This verifies
  the offline App simulation, not native Copilot behavior. No browser was
  downloaded.

Next upgrade gate: review the candidate lock and notices, migrate the two
annotation operations with the paired pins, review demo differences, and
verify native App/fullscreen and static artifact paths on the claimed hosts.
