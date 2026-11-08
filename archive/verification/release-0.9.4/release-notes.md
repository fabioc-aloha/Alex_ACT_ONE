# Alex ACT ONE 0.9.4: verified safeguards in a lean runtime payload

## Changes

- Mall selects `v0.9.4:package/alex-act-one`, excluding maintainer archives
  from the runtime payload while retaining all declared owners/resources and
  both Flint demonstrations.
- Artifact detection verifies Git-visible recovered bytes, detects changed
  originals, and reports missing or unsupported evidence explicitly.
- Native filesystem resolution handles Windows DOS short names. Detection and
  source-only recovery share worktree matching without accepting another
  worktree's explicit `cwd`.
- Git authentication checks verify the selected account, actual credential
  helper, repository access, and atomic configuration rollback.

## Verification

- Frozen source: `ba657521416a51fbe84696b6676db3fb69a36778`.
- [Full same-commit matrix](https://github.com/fabioc-aloha/Alex_ACT_ONE/actions/runs/42498345981):
  all six Windows/Ubuntu Node 24/26 structural and Node 26 integration jobs
  passed.
- Fresh-checkout integration, both exact Windows demo rebuilds, payload
  source/hash checks, and a no-write activation preview passed.
- Standalone Edge acceptance passed for both demos.
- The payload contains 254 files and 11,297,938 bytes, verified against its
  receipt. The receipt itself is additional metadata.

## Local installation remains unverified

The attached environment reports successful installation but does not produce
an installed-plugin entry or discover the plugin's skills. It sets an enabled
flag and fetches a Git-cache copy; those are not proof of installation. A
published `0.9.3` root-route control has the same failure, so this does not
establish a source-path-specific defect.

The maintainer explicitly approved source/Mall publication with this local
installation gate deferred to a manual reinstall. No successful local upgrade,
activation, or new live-host observation is claimed. Existing runtime pins are
unchanged. Paid image APIs, all-host behavior, accessibility, and runtime
rollback design retain their documented limits.

## Manual upgrade

Use a standalone terminal outside the attached agent session:

```powershell
copilot plugin marketplace update alex-mall
copilot plugin update alex-act-one@alex-mall
copilot plugin list --json
```

Require one enabled `alex-act-one@alex-mall` entry reporting `0.9.4` before
running the repository's reinstall/activation helper. It deliberately refuses
automatic replacement of a mismatched installation:

```powershell
pwsh -File .\reinstall-and-check.ps1 -ExpectedVersion 0.9.4
```

If inventory or activation reports a conflict, stop and preserve the existing
profile. Restart the host after a verified upgrade; cached skills are not
evidence that the new package loaded.
