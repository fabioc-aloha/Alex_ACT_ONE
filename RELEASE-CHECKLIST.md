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

## 8. The tree is clean and the push is a fast-forward

```text
git status --short
git fetch origin && git rev-list --count HEAD..origin/main
```

Clean tree, zero commits behind. Then push.

## 9. After Mall delivery, verify a real installation

Close any host that may lock the installed package, then run this from the
release checkout:

```powershell
.\reinstall-and-check.ps1
```

The script reinstalls `alex-act-one@alex-mall`, verifies the plugin inventory
and installed manifest, applies the canonical instructions, and checks the
receipt's ownership, version, and instruction entries. It proves installed
bytes and receipt state, not that a host observed activation after restart.

## What is deliberately not here

- **Content quality.** Whether a skill is any good is a human judgment, and no
  checklist will take it over.
- **A version bump ritual.** The version lives in `plugin.json` and
  `manifest.json` and they are checked against each other; bumping it is a
  decision, not a step.
- **Changelog generation.** Commit messages carry the reasoning. A generated
  list of subjects would restate them with less.
