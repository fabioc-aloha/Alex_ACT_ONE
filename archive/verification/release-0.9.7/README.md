# 0.9.7 release verification

The user requested publication and separately approved both release-task
options: publication before their manual installation, and disposable
locked-runtime preparation with staged generated-payload replacement.
This is a `0.9.7`-only exception, not inherited permission from an older release.

Native installation/cache parity, real-profile activation, actual
Pandoc/Pillow installation and host restart remain unverified. Their isolated
fixtures are not real-host observations. No publishing step runs the unified
helper's live `-Apply` path or changes the active user runtime.

## Release binding

Published source: `32db8b9752e501a5ef4287327fa9f30fe9d53224`.
The [release](https://github.com/fabioc-aloha/Alex_ACT_ONE/releases/tag/v0.9.7)
and public Mall select `v0.9.7:package/alex-act-one`.
Earlier source commits and reduced push CI remain separate from this cut.
When viewing the frozen tag's earlier snapshot, use
[this record on main](https://github.com/fabioc-aloha/Alex_ACT_ONE/blob/main/archive/verification/release-0.9.7/README.md)
for completed publication results.

## Observed publication results

- [All six same-commit Windows/Ubuntu jobs passed](https://github.com/fabioc-aloha/Alex_ACT_ONE/actions/runs/42715595855).
- Fresh Windows checkout: 694 structural and 57 integration tests passed,
  without failures, skips, todos or cancellations. Both exact demo rebuilds
  and every source/payload hash passed; tracked sources remained unchanged.
- The runtime payload contains 253 files and 11,346,217 bytes; its receipt is
  additional. It bundles only the unified public root script, not the two
  retired root helper names.
- Fresh release-task Edge acceptance passed both demos. Packaged bootstrap
  preview planned 15 instructions with `apply: false` and created no target.
  The selected disposable activation/package/orchestration run passed 47 tests.
- Mall was fast-forwarded to preserve upstream catalog commit
  `34d63c83711826ca4c3468297581cf97d84b3423` before publication work.
  Canonical metadata commit `b8ef5123c9a9d3ac58c4f71bc640351a41b5245c`
  preceded curated generation. Publication commit
  `54668ef57960b86d787cc80262f41e08e178efc9` passed all 69 tests and catalog
  validation. Unrelated plugin identities/versions were preserved.
- The public GitHub API and the actual raw catalog URL used by the setup
  script both advertised version `0.9.7`, ref `v0.9.7`, and
  path `package/alex-act-one`. GitHub accepted the Mall push with existing
  rule-bypass notices; no rule configuration changed.
- [Structured publication evidence](publication.json) retains exact bindings
  and explicitly deferred native setup. The prior `v0.9.6` tag remains at
  `0e71824e3a931a3beeb3bd8e97c76d3c7273b93b`; no tag was moved.

## Evidence and retained limits

- [Fresh browser acceptance](browser.json) records the release task's actual
  retained-demo observations.
- [Release notes and manual setup](release-notes.md).
- [Fault-control results](mutations.txt) record four sampled safety guards
  caught in disposable copies: report-only plugin/dependency behavior,
  installed-owner pin selection and preserving existing system tools.
  The actual source hash was unchanged; this is not exhaustive mutation coverage.
- The package receipt verifies the exact source/allowlist boundary and retains
  every declared owner/resource and both exact demos.
- Plugin/bootstrap, dependency-manager and orchestration tests use isolated
  fixtures. Report-only behavior, installed-owner pins, manager failures and
  no-ops, profile conflicts and policy boundaries must remain covered.
- [Prior native observations](../host-accessibility/2026-11-08/native-observations.json)
  retain transcript/form and integrated-download gaps. R8 remains open.
- macOS setup is roadmap-only; no macOS installation claim is added.

No prior published tag, active runtime, real instruction profile, npm/pip
configuration or unrelated marketplace registration is changed.
