> Historical recovery; not current certification or an active issue list.
> See [current change history](../../../../../CHANGELOG.md).

# Alex ACT ONE 0.9.0

## What changed

- Added the Flint interaction workflow and self-contained editorial and experimental chart galleries, with deterministic build provenance and reproducible browser acceptance.
- Hardened instruction activation: modified or unowned conflicts block the whole apply; replacement requires a separately approved preview. Receipt ownership, migration, stale plans, and removal remain guarded.
- Fixed Windows tool-shim execution, literal inline-code preservation during conversion, and dependency readiness/root selection. Readiness distinguishes package/version/launch checks from unobserved host connectivity.
- Added versioned reasoning, review, recovery, conversion, chart, and draft-only scenarios. The CLI runner uses one version-bound executable, exact stdin prompts, guidance-only tools, and inspectable response/tool evidence.
- Corrected recovery guidance so policy-denied continuity is not requested through a user-mediated or alternate channel, and unobserved staging state is not invented.
- Refreshed Mall-first onboarding, generated catalogs, evaluation limits, release guidance, and the forward-looking roadmap.

## Frozen source and verification

Source commit: `5ef51f20b018afb35a409b2c47976df4e9e57fcf`.

- [Same-commit hosted verification](https://github.com/fabioc-aloha/Alex_ACT_ONE/actions/runs/42145892936): all six required jobs passed. Windows/Ubuntu structural lanes covered Node 24/26; both provisioned lanes used Node 26. Required test lanes had no skips, todos, or cancellations; both canonical Windows demo rebuilds matched exactly.
- A fresh public clone of this exact commit passed 401 structural tests and both exact demo rebuilds, leaving the checkout unchanged.
- The frozen package's recovery case ran through CLI 1.0.88 using its existing default model, `claude-sonnet-5`. It loaded the corrected guidance, kept staging state unknown, refused alternate-channel handoff retrieval, and asked only for the task goal/next action. No code or workspace files were changed.
- Local integration passed 18 tests without skips. Both offline pages passed the standalone Edge acceptance gate, including saved JSON validation and cleanup.
- Documentation/catalog drift checks and living-document link checks passed. The previous `v0.8.0` tag is unchanged.
- Mall delivery was published at [`b362a07`](https://github.com/fabioc-aloha/Alex_Skill_Mall/commit/b362a07d4cc7600f75485c0fc246868933a2495a); its 69 tests and catalog validation passed. A real `alex-act-one@alex-mall` install in a disposable profile delivered `0.9.0`, matched all 291 tracked source files (allowing only text checkout line-ending normalization), and exposed all 64 manifest-declared skills.
- The delivered package's activation preview wrote nothing; an explicitly temporary target verified all 15 instructions and its receipt, then preserved them on a second preview. The temporary profile was removed. The active repository candidate, real instruction bytes/receipt, and optional runtime were unchanged.

The original push run stalled in GitHub job finalization after successful steps; the full matrix was rerun on the unchanged commit rather than treating that incomplete status as success. The successful run linked above is the release gate.

## Scope and known limits

CLI/VS Code scenario observations and browser checks are scoped evidence, not a general reliability claim. Scout and the Copilot app were not freshly tested for this release. Native integrated-browser saved-download completion, screen-reader speech, every chart's keyboard path, all chart-color contrast, and a dedicated vulnerability audit are not established.

Concurrent full-suite/browser runs produced bounded resize timeouts; the release browser gate passed when run separately. Concurrent/stress behavior is not certified, and the timeout reports were retained.

## Installation and upgrade

Use the reviewed marketplace route:

```powershell
copilot plugin marketplace add fabioc-aloha/Alex_Skill_Mall
copilot plugin install alex-act-one@alex-mall
copilot plugin list --json
```

Skip marketplace registration if already registered. Verify the loaded version/root, fully restart the host, then preview `bootstrap-core` and approve its exact target/actions before activation. Installing or uninstalling a plugin does not by itself replace or remove activated profile instructions.

Direct repository, URL, and local-path installs still worked during testing but emitted a deprecation warning; they are not the recommended delivery path.

Existing installations do not update automatically. Switching an active repository candidate back to Mall, profile activation, and optional runtime changes require their own consent. Runtime package pins are unchanged in 0.9.0; this release does not require a runtime upgrade.

See the [installation reference](https://github.com/fabioc-aloha/Alex_ACT_ONE/blob/v0.9.0/docs/install.md), [scenario evidence and limitations](https://github.com/fabioc-aloha/Alex_ACT_ONE/blob/v0.9.0/docs/verification/README.md), and [future roadmap](https://github.com/fabioc-aloha/Alex_ACT_ONE/blob/v0.9.0/ROADMAP.md).
