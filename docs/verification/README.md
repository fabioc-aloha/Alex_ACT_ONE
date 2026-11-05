# Scenario verification

The [versioned synthetic suite](skill-scenarios.json) makes representative
reasoning, review, recovery, conversion, chart, and draft-only requests portable.
The expected observations are review criteria, not recorded model answers.
Schema and packaging tests are not semantic proof that a host followed a skill.

## Run a scenario

1. Select the candidate source revision and record the actual loaded package.
   Record host/version, model/settings, instruction state, and permissions.
2. Use an isolated disposable workspace/profile where required. Do not install,
   activate, upgrade, or remove anything without separate approval.
3. Paste a case's exact `prompt` in a fresh session. Invoke the named skill
   through that host's available surface. Do not add coaching from its expected
   observations or a prior response.
4. Preserve the actual response and tool calls, including a no-tool observation
   where applicable. Compare each expected observation and forbidden action
   against what happened; record observed, failed, blocked, or unverified.
5. Use the [manual release-evidence table](../../RELEASE-CHECKLIST.md#manual-release-evidence).
   Include scenario ID and suite version, limitations, and the evidence location.
   A denied tool or missing output must not become a success-shaped fallback.

Denied-tool and unavailable-dependency cases supply **synthetic fixture facts**.
They do not require triggering a real policy denial, accessing restricted files,
removing tools, or bypassing a restriction. Report fixture-based reasoning
separately from an actually observed host denial.

The review case has a deterministic counterexample: `lookup([0], 0)` should
preserve zero but the supplied `|| null` expression returns null. A reviewer
must still explain its consequence. The chart and conversion cases intentionally
stop before output; do not generate paid images or install packages to make
them appear successful. Draft-only means no file, Outlook opening, or sending.

## Evidence status

| Host | Current suite execution | Limits |
| --- | --- | --- |
| Copilot CLI | not run | Source fixture validation is not a fresh model session |
| VS Code with Copilot SDK | not run | Loading skills while authoring this suite is not an independent scenario run |
| Microsoft Scout | not run | No fresh host access or invocation observed |
| GitHub Copilot app | not run | Historical host observations do not cover this suite |

This is a release-candidate checklist, not a standing behavioral ledger.
Keep no cross-session skill telemetry or firing counts. Update a host row only
from an actual scoped run. Do not infer activation, tool connectivity, semantic
quality, or compatibility from another host's result.

See [testing](../testing.md) for executable artifact tests and
[the evaluation guide](../launch/evaluation-guide.md) for the limits of paired
model comparisons. [Offline browser acceptance](flint-browser.md) records real
local demo execution; it does not fill the unrun Copilot scenario rows above.
