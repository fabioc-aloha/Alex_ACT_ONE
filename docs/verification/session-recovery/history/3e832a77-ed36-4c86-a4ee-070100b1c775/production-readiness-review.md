> Historical recovery; not current certification or an active issue list.
> See [current change history](../../../../../CHANGELOG.md).

# Production-readiness review

Date: 2026-11-06

## Resolution after implementation

All six findings below were addressed in
[`e41ccc4`](https://github.com/fabioc-aloha/Alex_ACT_ONE/commit/e41ccc43a6202af7b83e12d8d133906210c0b14d),
pushed directly to main. The original review and failures remain below as history.

- HTML output/debug names preserve uppercase Markdown sources and reject aliases.
- DOCX outputs own separate, URL-encoded media namespaces; their acceptance
  validator handles literal encoded filename characters correctly.
- Cleanup, heading normalization, and comment removal preserve literal code.
- Activation fixtures exclude transient checkout scratch, including Unix sockets.
- HTML/email fallback guidance matches the supported Mermaid subset.
- Browser checks keep resized frames onscreen, require stable geometry beyond
  the renderer debounce, and verify real downloads through trusted keyboard
  activation. Increasing the quiet interval alone did not resolve offscreen
  throttling; that failed diagnostic was retained.

[Same-commit CI](https://github.com/fabioc-aloha/Alex_ACT_ONE/actions/runs/42267875970)
passed every required job: Windows structural 526 per job and Ubuntu 467 per job
on Node 24/26, both provisioned lanes 58, and both exact Windows demo artifacts.
A fresh local Git clone of the exact commit passed 526 structural and 58
integration tests and both exact artifacts without changing its checkout.
Three fresh both-page Edge gates passed, including actual saved-file validation.
Diagnostics and edited-document links passed.

Evidence: [structural](fix-structural.txt),
[integration and artifacts](fix-integration-and-artifacts.txt),
[clean clone](fix-clean-clone.txt), and
[first corrected browser gate](browser-fixed-1.json)
(the second and third reports are retained alongside it).

The published `v0.9.0` package, active installation, profile instructions, and
runtime were not upgraded. Broader host/accessibility/runtime-recovery roadmap
items are not implied complete. Pre-existing untracked project scaffold files
remain uncommitted; local handoff/history were reconciled without publishing them.

## Original review

**Verdict: do not approve the current source for a new production release.**
The automated Windows gates pass, but disposable end-to-end probes reproduce
silent data loss. Required hosted verification is also incomplete.

## Project understanding and scope

Alex ACT ONE is a user-level Copilot workflow plugin, not a hosted application.
It delivers on-demand skills, prompt aliases, preview-first resident-instruction
activation, document-conversion executables, and optional chart/browser/image MCP
runtimes. Package delivery, instruction activation, runtime provisioning, and
host behavior have separate approval and verification boundaries.

The generated inventory reports 64 skills, 15 prompts, 15 resident instructions,
and 3 MCP registrations. This review covered the current checkout at
`a6a3038b5f354e662aa8fa2c95a4e9f5ba3b7bd7`, including its pre-existing local
continuity/roadmap changes. The published `v0.9.0` release instead identifies
`5ef51f20b018afb35a409b2c47976df4e9e57fcf`.

Direct source inspection focused on activation/receipt ownership, runtime
selection/provisioning/launch, installation safeguards, conversion and output
publication, verification infrastructure, onboarding, release documentation,
and roadmap/evidence consistency. The installed read-only Markdown analyzer
assessed the package's declared Markdown surfaces. The automated test lanes
were executed, not every skill manually exercised.

No repository files, installed packages, user-profile instructions, or runtime
dependencies were changed. Test-owned temporary fixtures were removed.

## Findings

### 1. HIGH: HTML conversion can overwrite its Markdown input

Location: [default output selection](../../../../../skills/md-to-html/scripts/md-to-html.cjs)
and [output write](../../../../../skills/md-to-html/scripts/md-to-html.cjs).

The default filename replacement is case-sensitive. Running the converter on
`NOTES.MD` without an explicit destination leaves the destination equal to the
input, then writes HTML over the original Markdown with exit status zero.

**Observed:** `sourcePreserved=false`, `sourceNowHtml=true`,
`separateHtmlExists=false`, using the actual converter and Pandoc in a disposable
directory.

**Required correction:** derive extensions case-insensitively and reject
input/output aliasing before any write, including debug-output selection.
Add regressions for uppercase/mixed-case extensions and explicit aliases.
Confidence: high; directly reproduced.

### 2. HIGH: Batch DOCX conversion replaces earlier documents' images

Location: [sequential image names](../../../../../skills/docx-to-md/scripts/docx-to-md.cjs),
[shared destinations](../../../../../skills/docx-to-md/scripts/docx-to-md.cjs),
and [fixed images namespace](../../../../../skills/docx-to-md/scripts/docx-to-md.cjs).

Each conversion restarts numbering and publishes into the same sibling
`images` directory. Two different documents with a first PNG both reference
`images/image-001.png`; the second successful conversion replaces the first
document's image. The documented
[batch workflow](../../../../../skills/docx-to-md/SKILL.md)
therefore silently corrupts earlier outputs.

**Observed:** two real DOCX files with distinct valid red/blue PNGs produced the
same reference. After the second conversion, the first document's referenced
bytes equaled the second document's image, not its own.

**Required correction:** use document-specific media namespaces or an equivalent
collision-safe ownership scheme. Test two distinct outputs in one directory and
verify that reconverting one cannot change the other's media.
Confidence: high; directly reproduced.

### 3. HIGH: DOCX cleanup changes literal code content

Location: [unconditional cleanup](../../../../../skills/docx-to-md/scripts/docx-to-md.cjs)
and [pipeline invocation](../../../../../skills/docx-to-md/scripts/docx-to-md.cjs).

Cleanup regexes run over the entire Markdown document, including literal code.
For example, `{.underline}` is removed even when it is a string in a code sample.
The image-extraction code has code-aware handling, but that does not protect
earlier cleanup.

**Observed:** Pandoc preserved `const style = "{.underline}";` through a real
Markdown-to-DOCX-to-Markdown roundtrip. The shipped converter instead emitted
`const style = "";`.

**Required correction:** apply prose cleanup outside literal code and add
roundtrip fidelity tests for inline, indented, fenced, and container-nested code.
Confidence: high; directly reproduced.

### 4. HIGH: Required hosted verification is red for the current source

Location: [fixture copies](../../../../../tests/native-compatibility.test.mjs)
and [second fixture copy](../../../../../tests/native-compatibility.test.mjs).

[Hosted run 42259125372](https://github.com/fabioc-aloha/Alex_ACT_ONE/actions/runs/42259125372)
matches `a6a3038`. Both Ubuntu Node 24/26 structural jobs report 447 passed and
2 failed. Failures are `ERR_INTERNAL_ASSERTION` during `fs.cpSync` setup of the
canonical-route and redirected-owner fixtures. Windows structural jobs passed;
provisioned jobs were skipped.

This proves a release-gate failure, not a production activation defect or a
specific Node root cause. The local Windows pass cannot replace it.

**Required correction:** establish the fixture-copy cause without weakening the
assertions, then obtain a green same-commit Windows/Ubuntu matrix, provisioned
lanes, and artifact checks. Already tracked in the
[delivery roadmap](../../../../../ROADMAP.md).
Confidence: high for the gate failure; root cause unresolved.

### 5. MEDIUM: Mermaid fallback documentation overstates supported output

Location: [supported-format table](../../../../../skills/md-to-html/SKILL.md)
versus [fallback implementation](../../../../../scripts/shared/mermaid-pipeline.cjs).

Documentation promises table fallbacks for sequence, class, state, ER, and pie
diagrams. The current implementation accepts only the supported graph/flowchart
subset and retains original source for unsupported diagrams.

**Observed:** flowchart input produced tables; valid sequence and pie inputs
produced the explicit unsupported/source-retained fallback.

**Required correction:** document the actual fallback boundary and test those
claims. Source retention is the safe behavior; do not broaden parsing merely
to match an inaccurate table.
Confidence: high; source inspection and direct function probes agree.

### 6. MEDIUM: Standalone browser acceptance is not reliably green

Location: [resize acceptance](../../../../../scripts/flint-browser-acceptance.mjs).

The standalone browser command exited 1 on Edge `157.0.4341.42`. The editorial
page timed out at its 10-second settled resize assertion; the experimental page
passed. Other checks, including saved-spec validation, passed.

A targeted editorial rerun instrumented to capture geometry on failure passed,
so no stable clipping defect or root cause was established. Preserve both
observations: the later pass does not erase the initial failure.

**Required correction:** diagnose the intermittent resize/render/harness
interaction and establish repeatable acceptance on the supported browser.
Do not silently relax the fit threshold or report a clean aggregate.
Confidence: high for the observed intermittent gate failure; cause unresolved.

## Verification performed

| Check | Result |
| --- | --- |
| Strict structural lane, Windows x64, Node 26.13.0 | 508 passed; zero failures, skips, todos, or cancellations |
| Strict integration lane against explicitly selected existing runtime | 56 passed; zero failures, skips, todos, or cancellations |
| MCP package/version/launch preflight | Exact Flint, Playwright, and Replicate pins passed; host connectivity and paid authentication not established |
| Both canonical demo builder `--check` modes | Byte-for-byte match |
| Generated inventory/catalog/role drift check | Passed |
| Installed read-only Markdown analyzer | No static findings; before/after content hashes identical |
| Core living-document relative links | 234 checked across 6 files; zero misses |
| Actual conversion edge-case probes | Reproduced findings 1-3 despite passing suites |
| Direct Mermaid fallback probes | Confirmed finding 5 |
| Offline Edge acceptance | Editorial resize failed; experimental passed; targeted editorial follow-up passed |
| Whitespace check | `git diff --check` passed |
| Worktree preservation | Initial modified/untracked inventory unchanged |

Preserved task-local gate evidence:
[structural](review-structural.txt),
[integration](review-integration.txt), and
[original browser result](review-browser.json).

## Documentation and roadmap assessment

The onboarding and release documents correctly distinguish installation,
activation, runtime provisioning, and host verification. Generated catalogs and
the checked links agree with the source. They explicitly disclose remaining
Scout/Copilot-app, accessibility, and runtime rollback limits.

The roadmap correctly records the failed hosted gate and defers runtime-upgrade
design rather than pretending the CI lock provides production rollback.
Its immediate order should put the confirmed conversion data-loss repairs and
their regressions alongside the existing hosted blocker, before expanding host
coverage. Track the browser instability and fallback-documentation correction
in the existing roadmap, not a second backlog.

The source safety repairs after `v0.9.0` are not delivered by that immutable
release. A future corrected release needs a new reviewed version and its own
package-delivery evidence; current source tests do not certify the old payload.
The existing local roadmap edit and untracked guidance/changelog/handoff also
need reconciliation before a clean-clone release check; they were intentionally
not staged or altered during this review.

R9 remains a prerequisite for claiming recoverable runtime upgrades, not proof
that a fresh install with unchanged pins must fail. Unavailable host scenarios
remain unverified, not automatic failures of every supported surface.

## Decision and limits

The competing interpretation was that passing Windows tests and historical
release evidence might justify scoped readiness. The real data-loss
counterexamples and current red hosted gate disconfirm that interpretation for
the current source candidate.

**Would revise the verdict after** the reproducible data-loss cases have passing
regressions, documentation matches behavior, and the selected clean candidate
passes its required same-commit release gates with explicit host/browser limits.

No fresh Linux execution, fresh-clone full run, live-host scenario suite,
screen-reader assessment, dedicated vulnerability audit, paid Replicate request,
Outlook opening/sending, installation, publication, or runtime upgrade was
performed. This is an evidence-scoped readiness review, not certification that
every skill or supported host is production-safe.
