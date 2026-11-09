# 0.9.6 release verification

The user explicitly approved publication before manual installation:
"Publish and then I will install it using the script".

This is a `0.9.6`-only publication exception. Native installation, loaded-cache
parity, profile activation and host restart remain unverified until the user
runs the script. It does not relax source, runtime, browser or immutable-tag
requirements, and it grants no standing approval for another release.

## Release binding

The immutable release must select the final source commit whose full six-job
Windows/Ubuntu matrix passes after release notices and payload regeneration.
Earlier candidate commit `1652910` is preparation evidence, not the final cut.
Publication and Mall results are added after they are actually observed.
For the completed record after publication, use
[this record on main](https://github.com/fabioc-aloha/Alex_ACT_ONE/blob/main/archive/verification/release-0.9.6/README.md).

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
