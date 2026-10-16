# Release Checklist

Every item here exists because something got through without it. The dates say
when, so a step nobody can justify can be removed rather than cargo-culted.

Work top to bottom. A failure stops the release; it does not become a note in
the release announcement.

## 1. The suite passes on a fresh clone

```text
git clone --depth 1 https://github.com/fabioc-aloha/Alex_ACT_ONE.git <tmp>
cd <tmp> && node --test
```

Not the working copy. A fresh clone is the only thing that proves the release
does not depend on a file that is gitignored, uncommitted, or synced by hand.

> Added 2026-09-07. Everything verified that day had been hand-copied into the
> installed plugin directories, so nothing yet showed whether a real install
> would produce the same package.

## 2. Activation runs, and plans what the manifest declares

```text
node skills/bootstrap-core/scripts/bootstrap-core.cjs
```

Exit 0, `apply: false`, and `expectedFiles` equal to the manifest's instruction
count. The suite asserts this, but run it once by hand before a release. With no
arguments, it is a no-write preview; `apply: false` is part of the result.
The preview exposes the instruction set that a later consented apply would
write to a user's profile.

> Added 2026-09-07. `bootstrap-core` hardcoded a count of 15 instructions, so
> adding a sixteenth — exactly what `compile-brain` and `meditation` exist to do
> — made activation fail while every structural test stayed green.

## 3. Each MCP server starts and reports its pinned version

```text
node skills/setup-dependencies/scripts/runtime-launcher.mjs flint --version
node skills/setup-dependencies/scripts/runtime-launcher.mjs playwright --version
node skills/setup-dependencies/scripts/runtime-launcher.mjs replicate --version
```

The reported version must match the pin. Exit 0 alone is not enough: a launcher
can start cleanly while running something other than the reviewed build.

> Added 2026-09-07. The launcher guarded `@playwright/mcp` at 0.0.78 while the
> pin and the installed runtime were both 0.0.80, so the server could not start
> on any host — and `check-dependencies` reported it healthy throughout, because
> it reads the pin table rather than the launcher.

## 4. Counts are avoided, or checked

Most of this documentation deliberately says "every skill" and "All / None"
rather than a number, because prose has no compiler behind it. Where a count
genuinely informs a reader — the README headline, which helps someone decide
whether to install — it stays and the suite verifies it:

```text
node --test          # manifest and disk agree, both directions
                     # README and ROADMAP quote the real counts
```

So this step is mostly a question rather than a command: if the release adds a
count to prose, either remove it or confirm the suite covers it. A number the
suite does not check will eventually be wrong.

Historical notes are the exception. "Retiring one command left 16 slash commands
in four places" is a fact about the past and should not be updated. Keep those
in blockquotes — the test skips them.

> Added 2026-09-07. Retiring one command left "16 slash commands" in four
> places, and the same release found hardcoded instruction counts in nine more,
> including two that broke activation outright.

## 5. Anything the release renames is checked on both sides

Server keys, launcher routes, skill directory names, manifest entries, and the
paths that reference them. The suite covers `plugin.json` → launcher routes;
everything else is manual.

> Added 2026-09-07. The Playwright server was renamed to `alex-playwright` to
> avoid colliding with a host's built-in, while the launcher route stayed
> `playwright`. Renaming one side only would have been silent.

## 6. Host reach is re-stated, not assumed

The compatibility table in the README claims a specific set of surfaces per app.
After any change to `plugin.json`, the manifest, or the prompts, confirm the row
is still true rather than inheriting last release's word.

Verified means someone ran it there. "Not yet tested" is an acceptable entry and
a better one than a guess.

> Added 2026-09-07. The table said Scout was "Verified" across every surface
> while slash commands did not reach it at all and no MCP server was registered.

## 7. New tests are confirmed able to fail

For each test added this release, reintroduce the fault it guards against and
watch it go red. A test that cannot fail is decoration, and it is worse than no
test because it reads as coverage.

> Added 2026-09-07 alongside the first suite. Four mutations were run; each was
> caught by the test that should have caught it.

## 8. Check the humanizer source when the skill changes

If the release changes [`skills/humanizer/SKILL.md`](skills/humanizer/SKILL.md),
compare it with the current
[Wikipedia guide](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing)
before release. Check the skill's last comparison and next due date, and
record what changed or that no catalog change was needed. The skill requires
a manual check at least every 30 days and before a humanizer release; this
is not an unattended job. If the guide cannot be checked, stop the release
rather than claim the catalog is current.

When the new humanizer routes ship, remove or update the README's
source-checkout notice so it describes the published release accurately.

> Added 2026-10-16. The Wikipedia-derived catalog needed a source refresh;
> a prior review date alone does not establish release-time freshness.

## 9. The tree is clean and the push is a fast-forward

```text
git status --short
git fetch origin && git rev-list --count HEAD..origin/main
```

Clean tree, zero commits behind. Then push.

## 10. After Mall delivery, verify a real installation

Close any host that may lock the installed package, then run this from the
release checkout:

```powershell
.\reinstall-and-check.ps1
```

Before reinstalling, the script checks ONE's public marketplace routes:
`alex-mall`, `awesome-copilot`, `copilot-plugins`, `azure-skills`, and
`fabric-collection`. It registers missing entries at user scope using the
expected GitHub sources, preserves existing matching/default registrations,
and stops on duplicates, source mismatches, or failed registration.
Registration may access the network and change user configuration; it does
not install optional plugins or alter private/local marketplaces.
The release-script regression tests exercise both PowerShell 7 and Windows
PowerShell 5.1 on Windows, including inventories with unrelated entries.

The script then reinstalls `alex-act-one@alex-mall`, verifies the plugin inventory
and installed manifest, applies the canonical instructions, and checks the
receipt's ownership, version, and instruction entries. It proves installed
bytes and receipt state, not that a host observed activation after restart.

Optional npm dependencies have a separate, preview-first installer:

```powershell
.\install-optional-dependencies.ps1
.\install-optional-dependencies.ps1 -Apply
```

It reads the shared version pins and uses the configured npm registry.
Flint, Playwright, and JSZip go into ONE's private runtime; Mermaid CLI and
svgexport use the npm global prefix. Replicate is excluded by default;
companion plugins, Pandoc, and Pillow are not installed. Browser downloads
may occur during installation.
All pins are checked before installation; registry or policy failures stop
the script without registry changes or policy overrides. A failed install
may leave partial package state. Success verifies installed versions and
the pinned MCP launchers; reload the host afterward.

The installer also verifies real Mermaid-to-SVG and SVG-to-PNG output in
temporary files. If npm blocks Puppeteer's lifecycle scripts, the packages
can be installed while their required browser binaries remain absent;
the installer must fail renderer readiness rather than report success.
Warnings from successful npm commands remain visible as text, not PowerShell
error records. Do not enable lifecycle scripts globally to hide the warning.

To check an existing installation without reinstalling or querying package
availability, use:

```powershell
.\install-optional-dependencies.ps1 -VerifyOnly
```

Browser acquisition is a separate decision because Puppeteer downloads
browsers outside the npm feed. The pinned svgexport package also uses an old,
deprecated Puppeteer browser build; review that before allowing a download.

To include the shared pinned Replicate MCP package in the private runtime,
add `-IncludeReplicate` to preview, apply, or verification:

```powershell
.\install-optional-dependencies.ps1 -IncludeReplicate
.\install-optional-dependencies.ps1 -Apply -IncludeReplicate
.\install-optional-dependencies.ps1 -VerifyOnly -IncludeReplicate
```

Combine this with `-RegistryTarballPrefix` when needed by the configured proxy.
Installation verifies Replicate's package and launcher version only. Actual
image generation requires `REPLICATE_API_TOKEN` and a paid account; the
installer does not read or store credentials or make paid API calls.
The existing renderer-readiness checks and browser-download restrictions
are unchanged.

With npm 12, a proxy that advertises a different tarball host can trigger
`EALLOWREMOTE` even when the exact package version is available.
For the Microsoft proxy feed prefix verified on 2026-10-16, explicitly route
those URLs back through the configured proxy:

```powershell
.\install-optional-dependencies.ps1 -RegistryTarballPrefix 'https://ms-feed-25.pkgs.visualstudio.com/1es-public/_packaging/npm-public/npm/registry/'
# Review the preview, then repeat with -Apply.
```

This uses npm's per-install `replace-registry-host` URL-prefix routing. It
does not change the configured registry, npmrc, or `allow-remote` policy,
and does not fetch directly from the backend to evade the proxy's delay.
Use only the backend prefix advertised by the approved proxy; if it changes,
verify the replacement rather than enabling arbitrary remote URLs.

## What is deliberately not here

- **Content quality.** Whether a skill is any good is a human judgment, and no
  checklist will take it over.
- **A version bump ritual.** The version lives in `plugin.json` and
  `manifest.json` and they are checked against each other; bumping it is a
  decision, not a step.
- **Changelog generation.** Commit messages carry the reasoning. A generated
  list of subjects would restate them with less.
