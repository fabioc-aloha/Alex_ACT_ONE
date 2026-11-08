# Candidate package verification

Status: Dated candidate observations; release delivery has separate evidence.

The [package contract](../../package.md) owns inclusion, exclusions and the
distribution gate. The [earlier candidate receipt](candidate-receipt.json)
records its included source/output hashes and declared package-only edits.
The selected `0.9.4` [release payload receipt](../../../package/alex-act-one/package-receipt.json)
is distinct from this earlier candidate and must match the actual delivered
package. Final publication and installation observations belong in the
[release record](https://github.com/fabioc-aloha/Alex_ACT_ONE/releases/tag/v0.9.4).
The receipt is preserved here because the reproducible build directory is
ignored local output, not remotely backed-up delivery.

## Observations

- The explicit allowlist includes all declared runtime owners/resources,
  both exact Flint HTML demonstrations, user guides, reusable verification
  inputs, and the documented standalone email test.
- Maintainer history and source-only recovery/CI tools are absent.
- A disposable bootstrap preview wrote nothing; temporary activation verified
  the instruction receipt and a second preview preserved it.
- Native Copilot CLI plugin discovery accepted the generated directory as
  an enabled external plugin under an isolated temporary profile. This was
  a discovery probe, not a normal-user installation.
- Missing package files fail verification. Retained archival evidence moved
  without changing its bytes.

The local generated package can create expected duplicate-body advisories
when a generic brain assessment scans both source and ignored build output.
Those are not duplicated active runtime owners: assess the generated package
separately when inspecting package scope, and use a fresh source checkout for
release/source QA. No advisory is presented as proof of runtime correctness.

## Recheck

```powershell
node scripts\build-plugin-package.mjs --check
node --test tests\plugin-package.test.mjs
```

The current-source check additionally rejects source files changed since the
package was built; it does not reuse an old receipt as current verification.
Package/Mall subdirectory compatibility, fresh behavior in other hosts,
release publication and normal local installation remain separate gates.
