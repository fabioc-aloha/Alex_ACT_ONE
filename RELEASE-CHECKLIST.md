# Release Checklist

Every item here exists because something got through without it. The dates say
when, so a step nobody can justify can be removed rather than cargo-culted.

Work top to bottom. A failure stops the release; it does not become a note in
the release announcement.

The maintainer explicitly approved one scoped exception for `0.9.4`: publish
the fully verified source and Mall entry while deferring local installation to
a manual reinstall. [The evidence](archive/verification/release-0.9.4/README.md)
records the failed native installation observations and exact approval.
Installation/activation are not claimed. Future releases retain the normal
fail-closed gates; this exception is not standing permission to bypass them.

For `0.9.5`, the user separately approved publication of the tested source and
Mall entry with manual installation. [Its record](archive/verification/release-0.9.5/README.md)
separates complete source/runtime/browser gates from unclaimed local activation.
Neither dated decision relaxes the requirements for subsequent releases.

For `0.9.6`, the user explicitly requested: "Publish and then I will install
it using the script". This separately authorizes source and Mall publication
with native installation/activation deferred to the user. The
[release record](archive/verification/release-0.9.6/README.md) retains that
scoped decision and the exact source/runtime/browser gates. No earlier
exception is inherited, and no future release receives standing approval.

## Candidate packaging boundary

When a release proposes lean distribution, use the
[candidate package contract](docs/package.md) and its existing packaging tests.
Require every manifest owner/resource, exact Flint demonstration, documented
runtime dependency, and local adoption link to survive the package allowlist.
Keep maintainer history outside the generated package. Validate a real
disposable marketplace installation through the precise approved source route
before changing Mall or a normal user store, unless the release's explicitly
recorded manual-install exception applies. Archive relocation alone is not
proof that the selected source-subdirectory payload was delivered.

## 1. The suite passes on a fresh clone

Use the [verification environments and release gates](docs/testing.md). The
[source workflow](.github/workflows/verify.yml) targets Windows/Ubuntu with
Node 24/26 structural jobs and Node 26 provisioned jobs. Record the actual
environment and require every job for the same candidate commit to pass.
Use **manual dispatch** for that full matrix; ordinary push runs intentionally
cover only Node 24 structural plus Node 26 integration on both OSes. Dispatch
the candidate branch with `gh workflow run verify.yml --ref main` and confirm
the run's `headSha` matches the reviewed candidate before accepting its results.
Structural and provisioned jobs run in parallel; neither substitutes for the
other. A green reduced push run does not satisfy this release gate.

```text
git clone --depth 1 https://github.com/fabioc-aloha/Alex_ACT_ONE.git <tmp>
cd <tmp>
node scripts/verification-gate.mjs --lane structural
```

Not the working copy. A fresh clone is the only thing that proves the release
does not depend on a file that is gitignored, uncommitted, or synced by hand.
Then run the explicitly provisioned integration lane on its disposable runner;
do not count missing prerequisites or skipped runtime tests as release success.
The convenience `node --test` command is not a substitute for both strict gates.

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
write to a user's profile. Because `bootstrap-core` hashes raw instruction
bytes, confirm `git ls-files --eol` shows no `w/mixed` working-tree files
before comparing a repository checkout preview against an installed profile.

Run the conflict regression suite:

```powershell
node --test tests\activation-conflicts.test.mjs tests\activation-readiness.test.mjs
```

Default apply must leave all files and receipt bytes untouched when a modified
or unowned destination exists. An overwrite requires a separate backup, preview,
and explicit approval; reinstall automation must not add the override itself.
Verify upgrades, migration, stale-plan rejection, and interrupted-apply recovery
only in disposable targets, never by mutating a real profile for a test.

> Added 2026-09-07. `bootstrap-core` hardcoded a count of 15 instructions, so
> adding a sixteenth — exactly what `compile-brain` and `meditation` exist to do
> — made activation fail while every structural test stayed green.

## 3. Each MCP server starts and reports its pinned version

```text
node skills/setup-dependencies/scripts/runtime-launcher.mjs flint --version
node skills/setup-dependencies/scripts/runtime-launcher.mjs playwright --version
```

The reported version must match the pin. Exit 0 alone is not enough: a launcher
can start cleanly while running something other than the reviewed build.

For Flint, check both the MCP server and its exact `flint-chart` library pin.
Run `node --test tests/flint-runtime.test.mjs tests/flint-upgrade.test.mjs`
against the candidate runtime. The compatibility suite exercises the real
three-backend renderers, version-matched resources, validated `show`, and invalid
input paths. A direct MCP response is not proof that a host displayed its App UI.
Keep an older active runtime untouched until its matching plugin is ready.

For the source readiness repairs, run
`node --test tests/runtime-readiness.test.mjs tests/tool-shims.test.cjs tests/conversion-runtime.test.cjs`.
Check actual runtime selection, missing/malformed metadata, stale libraries,
failed launches, timeouts, literal Windows arguments, and real converter output.
Report optional-tool skips explicitly. `--version` readiness is not a host MCP
connection or renderer-readiness proof.

Any mocked installer must receive an explicit disposable runtime root and refuse
writes outside it. Environment-variable-only isolation is not sufficient when
testing an older provisioner that may ignore that variable. After npm returns
success, verify the installed packages and selected launch probes before reporting
provisioning success; host reconnection remains a separate check.

> Added 2026-09-07. The launcher guarded `@playwright/mcp` at 0.0.78 while the
> pin and the installed runtime were both 0.0.80, so the server could not start
> on any host — and `check-dependencies` reported it healthy throughout, because
> it reads the pin table rather than the launcher.

## 4. Counts are avoided, or checked

The README has one generated source inventory and generated skill, prompt, and
instruction catalogs. Regenerate them after changing asset metadata or routing:

```powershell
node scripts\update-docs.mjs --write
node scripts\update-docs.mjs --check
node --test tests\documentation.test.mjs tests\documentation-examples.test.mjs tests\onboarding.test.mjs tests\smoke.test.mjs tests\native-compatibility.test.mjs
node skills\compile-brain\scripts\check-links.cjs README.md ROADMAP.md RELEASE-CHECKLIST.md docs\getting-started.md docs\install.md docs\testing.md
```

The check compares filesystem and manifest inventories, rejects missing skill
owners, checks derived instruction role metadata, and verifies that the generated sections are current. Do not copy
counts into new prose when a link to the inventory is enough.

`tests/documentation-examples.test.mjs` verifies the explicitly marked safe
examples against an installed copy from an unrelated directory. Keep opening or
sending examples illustrative and consent-dependent; never execute arbitrary
Markdown blocks to expand coverage.

The [first-session guide](docs/getting-started.md) uses Mall-first installation
with its registration prerequisite. The
[install reference](docs/install.md#mall-option) keeps the reviewed-release
route canonical and labels direct source testing deprecated. Preserve the
observed CLI warning; help listing a command is not evidence against deprecation.
Verify that both paths describe their delivery source accurately. The onboarding test exercises
activation only in an explicit disposable profile, verifies the second preview
is unchanged, and checks old README section anchors. It does not execute plugin
install commands or prove host loading. Do not use the reinstall helper as a
documentation test: it changes the real installation and profile.

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

### Generated offline Flint pages

When the candidate includes the demonstration pages, rebuild and check both
with the exact provisioned runtime:

```powershell
node scripts\build-flint-showcase.mjs
node scripts\build-flint-showcase.mjs --experimental
node scripts\build-flint-showcase.mjs --check
node scripts\build-flint-showcase.mjs --experimental --check
node --test tests\flint-showcase.test.mjs tests\flint-experimental.test.mjs tests\flint-interactions.test.mjs
```

Open the actual local files in the internal browser. Inspect image decode and
console errors, exercise meaningful gestures and reset, check linked recipients,
and resize the live board. A successful build or valid spec is not browser UAT.
Keep upstream notices embedded, and do not install packages or change the
runtime merely to rebuild the docs. Record host limitations explicitly,
including an unobserved download completion rather than claiming it passed.

Run the [reusable local-browser gate](docs/verification/flint-browser.md) with
an existing approved Playwright runtime and installed browser:

```powershell
node scripts\flint-browser-acceptance.mjs --channel msedge
```

Require its actual JSON report and zero exit status. Missing, failed, or blocked
required checks cannot count as success. The gate saves and validates test-owned
JSON files, then removes them; it does not install a browser or change a runtime.
Keep integrated-browser and headless-browser evidence separate.
Resize checks must wait beyond the pinned renderer's debounce before accepting
unchanged geometry; do not advance through stale fitting plots or relax the
one-pixel clipping limit to hide a failure.

## 5. Anything the release renames is checked on both sides

Server keys, launcher routes, skill directory names, manifest entries, and the
paths that reference them. The suite covers `plugin.json` → launcher routes;
everything else is manual.

> Added 2026-09-07. The Playwright server was renamed to `alex-playwright` to
> avoid colliding with a host's built-in, while the launcher route stayed
> `playwright`. Renaming one side only would have been silent.

## 6. Host reach is re-stated, not assumed

The [host delivery table](docs/install.md#where-alex-act-one-works) describes a
specific set of surfaces per app, alongside dated observations.
After any change to `plugin.json`, the manifest, or the prompts, confirm the row
is still true rather than inheriting last release's word.

Verified means someone ran it there. "Not yet tested" is an acceptable entry and
a better one than a guess.

Record the installed root, delivery source, and source revision when available.
Source and Mall packages can declare the same version while containing different
bytes; version equality alone is not source parity. Do not mark an unavailable
revision or host activation result as verified.

For native-first candidates, distinguish native skill discovery/invocation from
native rule activation. Keep legacy bootstrap, receipt ownership, aliases, and
browser fallback until the corresponding target-host scenarios pass. An empty
native instruction list is not an activation success. The bootstrap preview's
`routing.canonicalRoot` and `routing.skillRoutes` must resolve instruction owners
from an installed package, not the adopter's working directory.

Run the compatible routing suite before considering a delivery change:

```text
node --test tests/native-compatibility.test.mjs tests/activation-routing.test.mjs tests/activation-readiness.test.mjs
```

> Added 2026-09-07. The table said Scout was "Verified" across every surface
> while slash commands did not reach it at all and no MCP server was registered.

### Manual release evidence

Copy this blank table into the candidate's task-local release evidence.
It is a manual observation template, not a standing cross-session ledger or
skill-firing telemetry. Do not fill a row from an expected answer.
Use the [versioned synthetic scenarios](docs/verification/README.md) for
representative workflows and missing-input, denied-tool, unsupported-output,
read-only, and approval-boundary cases.

| Source revision / release | Scenario | Host / version | Actual invocation | Observed result | Evidence / limitations |
| --- | --- | --- | --- | --- | --- |
| Record exact candidate and loaded package | Record scenario ID / version | CLI, VS Code, Scout, or Copilot app; actual version | Exact prompt or command and relevant permissions | not run / observed / failed / blocked / unverified | Artifact or transcript reference, input path, and unobserved requirements |

Record model/settings, sample size, and profile isolation for paired model
comparisons. For each host, distinguish package discovery, skill invocation,
instruction loading, tool connection, and end-to-end behavior. Preserve failures
and denied actions. Mark unavailable host/version/revision evidence unverified;
leave inaccessible hosts not run. Never upgrade a supported-delivery row to
freshly verified because another host passed or a structural test was green.

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

When a new release is approved, update the README's source-versus-release notice
and the install reference's version comparison against the actual candidate.
Keep unreleased work distinct from the version delivered through Mall.

> Added 2026-10-16. The Wikipedia-derived catalog needed a source refresh;
> a prior review date alone does not establish release-time freshness.

## 9. The tree is clean and the push is a fast-forward

```text
git status --short
git fetch origin && git rev-list --count HEAD..origin/main
```

Clean tree, zero commits behind. Then push.

## 10. After Mall delivery, verify a real installation

Mall is the normal reviewed-release path in the
marketplace-first [getting-started guide](docs/getting-started.md).
This section applies only after separately approved Mall publication and
installation; a source push does not authorize running the helper below.

Close any host that may lock the installed package, then run this from the
release checkout:

```powershell
.\reinstall-and-check.ps1
```

The current source helper verifies a matching existing release in place and
installs only when absent. It refuses older, disabled, duplicate, or cross-source
installations before changing package state; it never uninstalls a package.
Use a separately reviewed upgrade operation instead of automatic replacement
until staged plugin delivery and rollback are implemented.

The script checks ONE's public marketplace routes:
`alex-mall`, `awesome-copilot`, `copilot-plugins`, `azure-skills`, and
`fabric-collection`. It registers missing entries at user scope using the
expected GitHub sources, preserves existing matching/default registrations,
and stops on duplicates, source mismatches, or failed registration.
Registration may access the network and change user configuration; it does
not install optional plugins or alter private/local marketplaces.
The release-script regression tests exercise both PowerShell 7 and Windows
PowerShell 5.1 on Windows, including inventories with unrelated entries.

The script installs `alex-act-one@alex-mall` only if absent, verifies the plugin inventory
and installed manifest, applies the canonical instructions, and checks the
receipt's ownership, version, and instruction entries in the selected
`-CopilotHome` / `COPILOT_HOME` / default home. It verifies manifest and instruction
receipt state, not whole-package source parity or host activation after restart.

Optional npm dependencies have a separate, preview-first installer:

```powershell
.\install-optional-dependencies.ps1
.\install-optional-dependencies.ps1 -Apply
```

It reads the shared version pins and uses the configured npm registry.
Flint, Playwright, and JSZip go into ONE's private runtime; Mermaid CLI and
svgexport use the npm global prefix;
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

To verify rendering with an existing compatible browser when npm lifecycle
scripts blocked Puppeteer's browser setup, pass its absolute executable path
explicitly (or validate an inherited `PUPPETEER_EXECUTABLE_PATH`):

```powershell
$browser = 'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
.\install-optional-dependencies.ps1 -VerifyOnly -BrowserExecutablePath $browser
```

The selected path is validated before any `npm` command runs and is passed only
to renderer child processes (`mmdc` and `svgexport`); it does not auto-detect a
browser or alter the parent environment. Browser acquisition remains a separate
decision because Puppeteer downloads browsers outside the npm feed. The pinned
svgexport package also uses an old, deprecated Puppeteer browser build; review
that before allowing a download.

The existing renderer-readiness checks and browser-download restrictions
are unchanged.

With npm 12, a proxy that advertises a different tarball host can trigger
`EALLOWREMOTE` even when the exact package version is available.
The source helpers detect the configured HTTPS Microsoft packagefeedproxy npm
endpoint and preview the confirmed backend-prefix routing. Other registries
are unchanged. Verify automatic private/global routing, explicit precedence,
no-write preview, npm 12+ rejection, and failure without automatic retries.
The published `0.9.5` payload retains explicit-only routing. To override the
detected mapping or select another confirmed backend prefix:

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
