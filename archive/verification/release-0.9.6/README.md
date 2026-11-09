# 0.9.6 release verification

The user explicitly approved publication before manual installation:
"Publish and then I will install it using the script".

This is a `0.9.6`-only publication exception. Native installation, loaded-cache
parity, profile activation and host restart remain unverified until the user
runs the script. It does not relax source, runtime, browser or immutable-tag
requirements, and it grants no standing approval for another release.

## Release binding

Published source: `0e71824e3a931a3beeb3bd8e97c76d3c7273b93b`.
The [release](https://github.com/fabioc-aloha/Alex_ACT_ONE/releases/tag/v0.9.6)
and public Mall select `v0.9.6:package/alex-act-one`.
Earlier candidate commit `1652910` remains preparation evidence, not the cut.
For the completed record when viewing the frozen tag's earlier snapshot, use
[this record on main](https://github.com/fabioc-aloha/Alex_ACT_ONE/blob/main/archive/verification/release-0.9.6/README.md).

## Observed publication results

- [All six same-commit Windows/Ubuntu jobs passed](https://github.com/fabioc-aloha/Alex_ACT_ONE/actions/runs/42549910373).
- Fresh Windows checkout: 633 structural tests passed without failures, skips,
  todos or cancellations. The provisioned Windows CI lane passed 57 integration
  tests; both exact canonical demo rebuilds passed there.
- All 254 payload files and 11,331,512 payload bytes verified against their
  receipt and source hashes; the receipt is additional.
- Fresh release-task Edge acceptance passed both demos. Packaged bootstrap
  preview planned all 15 instructions, reported `apply: false`, and created no
  target directory in the explicit disposable fixture.
- Canonical source-mode Mall packaging validated the two-file metadata entry.
  Metadata commit `7a8a80a6eeb36df3ced6ca71c9bde1c983891c9c` preceded catalog
  generation. Publication commit
  `03cb946214923b6ec9464cf42f09b5710d75dd69` passed all 69 tests and catalog
  validation; the public version/ref/path was verified through GitHub's API.
  GitHub accepted the push with existing rule-bypass notices; no rule changed.
- The prior `v0.9.5` tag still resolves to
  `26d0518ec998817ed2d5c27a66855a58747e820c`. No tag was moved.
- [Structured publication evidence](publication.json) retains exact bindings
  and separately names native installation as deferred.

## Evidence and retained limits

- [Candidate preparation](../candidate-0.9.6/preparation.json) preserves
  earlier package safety, no-write bootstrap and fault-control results.
- [Caught fault controls](../candidate-0.9.6/mutations.txt) remain Git-visible.
- [Fresh browser acceptance](browser.json) records the release task's
  actual retained-demo observations.
- [Native observations](../host-accessibility/2026-11-08/native-observations.json)
  retain transcript/form and integrated-download limitations. R8 remains open.
- [Release notes and manual setup](release-notes.md).

No installed package, active runtime, instruction profile, npm policy or
unrelated marketplace registration is changed by this publication.
