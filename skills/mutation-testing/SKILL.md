---
name: "mutation-testing"
description: "Meta-test your test harness — apply small intentional defects to production code, expect the suite to catch each one. Surfaces silent coverage gaps that 100% line coverage hides."
lastReviewed: 2026-05-31
---

# Mutation Testing

A green test suite tells you the tests passed. It does not tell you whether the tests would have caught a real defect. Mutation testing closes that gap: introduce a one-character defect in production code, run the suite, expect at least one test to fail. Survivors are coverage gaps.

> **Coverage measures whether the line was executed. Mutation measures whether the line was meaningfully asserted on.** The two are not the same.

## When to fire

- After authoring a new test file, before declaring it "covers" the module
- After adding tests to a previously-untested module
- Before publishing any release that newly depends on a module's correctness
- When a code review surfaces "this is tested, but I'm not sure the tests assert what we think they do"

**Do NOT fire** when:

- The code under test is throwaway (one-off scripts, scratch experiments)
- A formal mutation-testing tool (`stryker`, `mutmut`) is already in CI — that supersedes the manual protocol below
- The cost of running the suite once is high (long integration tests) — sample the high-risk mutations instead of running all of them

## The protocol

For each load-bearing branch / guard / constant in the module:

1. **Copy the project or a supported test fixture to a temporary location.**
   The mutation target must be inside that copy, never the working tree.
2. **Apply a one-character defect** that flips the behavior (invert a comparison, change a numeric literal, replace a guard with `if (false)`)
3. **Run the suite against the copy** — `npm test` or the project's canonical
   entry point, with any required root override targeting the copy.
4. **Expect ≥ 1 failure.** If the suite still passes, that branch has no real coverage.
5. **Discard the copy** before applying the next mutation.
6. **Record the result** — caught / survived / precondition-not-found.

The source files must remain unchanged. A mutation run that requires restoring a
working-tree file is already too risky: an interrupted process, a failed write,
or another tool reading the file can leave a real defect behind.

## Isolated Mutation Harness

```pwsh
function Test-Mutation {
    param(
        [string]$ProjectRoot,
        [string]$RelativePath,
        [string]$Find,
        [string]$Replace,
        [string]$Name,
        [scriptblock]$RunTests
    )

    $sandbox = Join-Path ([System.IO.Path]::GetTempPath()) ("mutation-" + [guid]::NewGuid())
    try {
        New-Item -ItemType Directory -Force -Path $sandbox | Out-Null
        Copy-Item -LiteralPath $ProjectRoot -Destination (Join-Path $sandbox 'project') -Recurse
        $copyRoot = Join-Path $sandbox 'project'
        $target = Join-Path $copyRoot $RelativePath
        $original = Get-Content -LiteralPath $target -Raw
        if (-not $original.Contains($Find)) { "[$Name] PRECONDITION-NOT-FOUND"; return }

        Set-Content -LiteralPath $target -Value $original.Replace($Find, $Replace) -NoNewline
        $exitCode = & $RunTests $copyRoot
        if ($exitCode -ne 0) { "[$Name] CAUGHT" } else { "[$Name] *** SURVIVED ***" }
    } finally {
        Remove-Item -LiteralPath $sandbox -Recurse -Force -ErrorAction SilentlyContinue
    }
}

# The test command receives the disposable project root. Adapt its root override
# or fixture option to your project; do not silently fall back to the real root.
$runTests = {
    param($copyRoot)
    Push-Location $copyRoot
    try { npm test; return $LASTEXITCODE } finally { Pop-Location }
}

Test-Mutation $PWD 'lib/semver.js' 'if (pa.major !== pb.major)' 'if (pa.major === pb.major)' 'M2 major-equality inverted' $runTests
```

For a small validator, a purpose-built temporary fixture is often cheaper than
copying the whole project. Steward's ONE-check suite uses that pattern: it
generates disposable fixtures and temporary validator copies, then asserts the
working validators' bytes remain unchanged.

## Counter-Test Detection Rules

A detector needs two proofs. First, inject the live defect it exists to catch
into an isolated active artifact and assert that it reports a failure. Then add
the innocent case that previously caused a false positive and assert silence.

For example, a rule against a retired process must flag a new active route that
revives the process, while allowing historical prose that says the process was
retired. A counter-test for a detection rule keeps a correct historical record
from looking like the defect itself.

## High-value mutation patterns

| Production-code shape | Mutation that catches a real defect |
| --- | --- |
| `if (cond) return X` (guard) | Replace `cond` with `false` — proves the guard fires |
| `a < b ? -1 : 1` (compare) | Swap the branches — proves ordering is asserted |
| `a !== b` (inequality) | Replace with `a === b` — proves the inequality matters |
| `Object.freeze(X)` | Strip the freeze — proves callers depend on immutability |
| `flag === 'specific-value'` | Change the literal — proves the value matters, not just truthiness |
| `Object.assign({}, src, ...)` (immutable merge) | Drop the `{}` (mutates `src`) — proves no-mutation is asserted |
| `arr.filter(x => x.kind === 'edition')` (filter) | Replace with `true` — proves the filter has data to filter against |
| `fs.writeFileSync(p, v, { flag: 'wx' })` (exclusive write) | Drop the flag — proves exclusivity matters |

## Anti-patterns the protocol catches

**1. Filter with no input data.** A `.filter(e => e.name !== 'local')` test passes trivially when the test data contains zero `local/` entries. Mutation: replace with `e => true`. If no test fails, the filter is unverified. Fix by **seeding test data that would be filtered out** and asserting it doesn't appear in the output.

**2. Exports that production never calls.** Easy to grep: `Select-String -Path src/,extension.js -Pattern "exportedName"` — if production callers are zero, the unit tests are testing dead code. Either wire the export into production or remove it.

**3. Platform-skipped tests with no fallback.** A symlink-cycle test that skips on Windows is no coverage on Windows. Look for `t.skip(...)` and ask: does the protected behavior have a deterministic, platform-independent test alongside it?

**4. "Didn't throw" assertions.** A test that builds a 60-level deep tree and asserts the call "didn't throw" is true even with the depth cap removed. Add a sharp assertion: with cap=50, the depth-60 leaf must be **unreachable**.

**5. Frontmatter-only tests.** A test that JSON.parse's a manifest and asserts `keys.includes('spec_version')` passes even when the field has the wrong value. Assert on the **value**, not just key presence.

## What "good coverage" looks like

For each production module:

- **Every load-bearing branch has a mutation that catches its removal.** Not "every line is covered" — every branch where flipping the condition would ship a real defect.
- **The mutation that catches it names the behavior** (e.g., "stale-lock breaking disabled" → caught by `stale lock (>10min mtime) broken atomically` test).
- **Active-filter tests where source data doesn't naturally exercise the filter.** Seed the data; verify the filter fires.
- **Reference-equality tests for null-result fast paths** (e.g., a pure function that returns the input unchanged on null provenance — assert `out === input`).

## Worked examples from the field

| Mutation | Production code | Test that caught it | Lesson |
| --- | --- | --- | --- |
| `marker_schema_version: 2` → `1` | `lib/edition-install.js applyStaticFetchMarkerFields` | "all six v2 fields" asserts `marker_schema_version === 2` | Assert on the literal value, not just presence |
| `if (_seen.has(real))` → `if (false)` | `lib/fs-utils.js listFilesRecursive` | "pre-populated _seen short-circuits the walk" | Exploit the function's internal parameters (`_seen`, `_depth`) for deterministic platform-independent coverage |
| `e.name !== 'local'` → `e.isDirectory()` (filter removed) | `.github/scripts/build-edition-manifest.cjs` | "regenerates without leaking local/ entries (active filter test)" | When the source tree has no `local/` dirs, the filter has nothing to filter against — seed temp `local/` subdirs to make the filter measurable |
| `Object.assign({}, marker, ...)` → `Object.assign(marker, ...)` | `lib/edition-install.js applyStaticFetchMarkerFields` | "does not mutate the input marker" | The `{}` is load-bearing; mutate it to prove the test asserts immutability |

## Quality bar

A mutation-testing pass is complete when:

- Every named branch in the production module has a mutation entry in your run log
- Every survivor was either closed by a new test or explicitly accepted with a reason (e.g., "behavior is internal-only, no public contract")
- The total mutations-caught ratio is recorded (e.g., "15 of 16 mutations caught; M8 deferred")
- The working tree's source files remain unchanged throughout the run, and the
    temporary copy is removed after each mutation

## Anti-patterns

| Anti-pattern | Correction |
| --- | --- |
| Running mutations on throwaway code | Use the protocol on production modules with real consumers; throwaway code is throwaway |
| Reading "coverage 100%" as "tests are good" | Coverage is a necessary but insufficient signal; mutation tells you whether the assertion was meaningful |
| Mutating a live source file then restoring it | Use a temporary copy; restore logic cannot protect an interrupted live mutation |
| Manually running 20 mutations one at a time | Use the isolated harness above; it handles copy disposal + result aggregation |
| Treating a SURVIVED mutation as a test-quality problem alone | Often it surfaces a production-code design problem (dead export, untestable branch) |

## Falsifiability — would revise if

- Event-based: if a formal mutation-testing tool (Stryker, mutmut) is adopted in CI, this skill becomes documentation for the manual fallback only; trim the protocol section accordingly.
- Counter-evidence: if applying the protocol consistently catches zero mutations on three consecutive new test files, either the tests are unusually rigorous (good — note it) or the mutation set is too shallow (revise the "high-value patterns" table).

## Origin

Codified 2026-05-31 after meta-testing a static-fetch test harness (commit `4163f67`). The protocol caught two real coverage gaps (symlink-cycle protection and depth-cap enforcement in `lib/fs-utils.js`) that platform-skipped tests had been silently hiding. Applied a second time to another test harness, where it caught two more gaps (local/ filter on skills and instructions in `build-edition-manifest.cjs`). 12 of 12 caught after gap-closing — the protocol is the reason the final harnesses are trustworthy.

## Related

- [code-review/SKILL.md](../code-review/SKILL.md) — pre-publish review; mutation testing is the final layer when code review surfaces test-quality concerns
- Release preflight discipline — releases that newly depend on a module's correctness should mutation-test it first (Alex ACT itself formalizes this in the Steward release ritual)
