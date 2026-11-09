# Alex ACT ONE 0.9.7

One root setup script now handles plugin installation, owned-instruction
bootstrap and capability tools, with explicit consent for changes.

## Changes

- Replace the two source root helpers with `install-and-check.ps1`.
- Default mode connects missing Alex Mall, refreshes registered catalogs and
  reports plugin/dependency versions without installation or activation.
- `-Apply` installs/updates the latest Mall plugin, bootstraps only its owned
  instructions with conflict checks, then uses that installed owner's
  dependency pins and launchers rather than an unrelated checkout.
- Install only missing Windows Pandoc through winget and missing Pillow in an
  explicitly selected existing Python environment. Existing system tools are
  checked, not silently upgraded. No Python installation, forced elevation,
  agreement acceptance or package-manager policy bypass is added.
- Retain exact npm pins, configured package sources, no-install `-VerifyOnly`
  checks, real renderer checks and explicit failure reporting. A failed
  dependency stage does not pretend the whole setup succeeded or roll back an
  earlier successful plugin stage.
- Update dependency skill guidance, help, package inputs and active links;
  remove stale retired-provider script references. Preserve older release
  snapshots and route a historical helper link to its immutable version.
- Record macOS installation/dependency support as pending roadmap work only.

## Verification boundaries

The final release requires its own full Windows/Ubuntu matrix, fresh-checkout
strict gates, exact demo rebuilds, package/source hashes and browser acceptance.
See [the release record](README.md) for actual results. Passing fixtures do not
prove native installation, real system-package changes, all-host behavior or
accessibility certification. macOS remains unverified.

## Manual setup

The user approved publication before manual installation. No installed update,
real-profile activation or active-runtime change is performed by publication.
From a checkout containing this release, use standalone PowerShell:

```powershell
.\install-and-check.ps1
# Review versions, Python, package destinations and browser readiness first.
# Close hosts that lock the plugin/runtime, then explicitly apply:
.\install-and-check.ps1 -Apply
```

Default mode can register Alex Mall and refresh catalog caches. `-Apply` also
sets up capability tools; it is not just a plugin update. Python must already
exist, and automatic missing-Pandoc installation requires Windows winget.
Core reasoning does not require the full tool set. Restart the host after
successful setup; package probes do not prove host connectivity.
