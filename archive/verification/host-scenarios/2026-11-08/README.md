# Fresh 0.9.5 host and artifact-delivery verification

Date: 2026-11-08. Classification: synthetic, task-local release evidence.
This is not a standing behavioral ledger, all-host certification, or
authorization to publish a release.

## Package and host identity

- Published plugin: `0.9.5`, immutable release commit
  `26d0518ec998817ed2d5c27a66855a58747e820c`.
- Source baseline for this task:
  `7255d6f4ea9eb36f64e4410735ed8ce4fd4a5334`. Unreleased proxy-routing source
  is not represented as part of the installed release.
- Both the normal Mall installation and VS Code's loaded cache matched every
  file in the published package receipt: 254 files, 11,285,099 payload bytes.
  Receipt bytes also matched. Installed bootstrap preview preserved all
  15 instructions and its current receipt; no activation was performed.
- VS Code `1.145.2`, Windows, Copilot SDK; existing profile and other enabled
  plugins remained. Native session APIs did not expose a model identifier.
- CLI `1.0.107`; observed response model `gpt-6.1-sol`. No explicit model
  override or paired model comparison was performed.
- User scope: VS Code and CLI only. Scout and GitHub Copilot app are **not run**.

## R8: exact fresh-session suite

Suite: `2026-11-05.2`, the repository's
[exact synthetic prompts](../../../../docs/verification/skill-scenarios.json).
Each prompt was submitted unchanged in a fresh session. No expected answers,
corrective turns, or missing-input facts were supplied.

| Scenario | CLI observation | Native VS Code observation |
| --- | --- | --- |
| Reasoning | Two grounded hypotheses and disconfirmers; measurement before Rust/Redis | Same expected reasoning observed; final reply/tool arguments truncated |
| Review | Concrete zero/false/empty-string counterexamples, consequence, confidence, no fix | Expected defect and static read-only scope observed |
| Recovery | Unknown task/staging state retained; asks only for an independent task goal | Stops with a native clarification form; full question/result is truncated and unverified |
| Conversion | Missing Pandoc/source, installation denial, PNG versus editable diagram, no Word output claim | Expected blocked-output response observed |
| Chart | Missing amounts/currency/period; no render or fabricated values | Stops with a clarification form; reads installed/MCP guidance; no render/show observed |
| Draft | Recipient/date placeholders; confirmation and final-message approval; no sends/files | Placeholders and explicit sending approval boundary observed |

All six CLI processes passed the deterministic evidence gate: exact prompt,
successful required skill/read calls, only installed Markdown guidance,
final response, empty disposable workspace, and zero reported code changes.
[The semantic review](semantic-review.json) separately records expected
observations met for this sample, based on actual answers. The runner's original
`semanticStatus: not-reviewed` fields remain unchanged.

Actual curated CLI evidence is under [cli/](cli/): each case has its exact
invocation and [response/tool guidance hashes](cli/reasoning-loaded-frame/observations.json).
Raw event streams, stderr, and process logs were removed after validation:
they are runtime data, not the released evidence. No credentials or profile
state were archived.

[Native observations](native-observations.json) preserve exact complete short
answers and clearly marked excerpts where the API truncated data. Native tool
completion outcomes are not exposed. Two missing-input cases remain at the
clarification boundary, not completed interactions. Do not replace those
limits with the CLI's full transcripts or mark native host enforcement proven.
The recovery denial and missing dependencies are supplied fixture facts,
not real permission-denial or uninstall tests.

The parent independently executed the supplied falsy-value counterexamples;
all three return null under `|| null`, not the required present value. This
check does not retroactively turn the scenarios' static review into execution.

## Artifact-delivery host surfaces

| Case | Actual result and evidence |
| --- | --- |
| Requested plan / native agent producer | Fresh session wrote only [agent-plan.md](agent-plan.md) and [agent-output.json](agent-output.json); exact JSON and Git-visible untracked state verified |
| Shell-produced artifact | PowerShell streamed and persisted [shell-output.json](shell-output.json) directly into the repository; both values verified |
| Native local HTML browser | Opened [artifact-input.html](artifact-input.html); real accessible rows were Category/Value, A/2 and B/3; no HTTP resources observed |
| Native screenshot delivery limit | Returned an inline screenshot, but no saved destination/path. This is browser observation, not repository delivery |
| Registered MCP file output | Task-isolated alex-playwright saved [mcp-artifact.png](mcp-artifact.png), [snapshot](mcp-snapshot.txt), and [console record](mcp-console.txt) directly to absolute repository paths; zero console errors |
| Ignored-artifact control | A unique synthetic JSON in ignored `dist/alex-act-one` did not satisfy the checker; one stranded candidate was reported |
| Repository recovery control | Copying those exact bytes to [ignored-control.json](ignored-control.json) yielded six accounted candidates |
| Changed-source control | Changing only the temporary session original restored the stranded result; approved earlier bytes did not hide the change |

[Artifact observations](artifact-observations.json) state the invocations and
limits. [Deterministic checks](artifact-checks.json) retain final file hashes,
sizes, Git visibility, and positive/negative results. The checker inputs were
disposable synthetic session metadata, not a newly discovered real host
stranding incident. The initial control mistakenly assumed all of `dist/`
was ignored; its assertion failed. The corrected control uses the repository's
existing exact ignore rule, with no ignore-policy edit.

Only explicit within-repository destinations were exercised. A live
user-approved external deliverable was not requested and remains unverified.
No stronger enforcement ledger/hook, arbitrary-write prevention, user runtime
upgrade, instruction changes, or external services were added.
Temporary checker inputs and ignored control bytes were removed; task browser
tabs are no longer present.

## Findings and next action

1. **Fixed source defect:** the CLI evidence runner rejected every repository
   output destination. It now accepts an explicit absolute new directory,
   including a repository-owned directory, while refusing existing evidence.
   Tests cover repository/external explicit paths, relative-path rejection,
   and earlier-evidence preservation. This source-only helper is not bundled
   in the runtime payload; the published tag remains unchanged.
2. **Native evidence limitation:** transcript truncation and paused question
   forms prevent a full deterministic native boundary/completion verdict.
3. **Native screenshot delivery limitation:** use the supported MCP file
   destination when native screenshots return only inline images; never claim
   a persisted file from that inline result.

R8 has fresh available-host evidence but is not globally closed. Scout,
Copilot app, live external-destination approval, and stronger host enforcement
need separate observations/decisions. Later `0.9.6` preparation must run its
own same-commit release gates; these installed `0.9.5` observations cannot
qualify unreleased source wholesale.
