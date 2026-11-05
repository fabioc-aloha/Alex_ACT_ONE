# Your first session with Alex ACT ONE

Install the pack, approve activation in one app, then try a read-only reasoning
workflow. You need a working GitHub Copilot setup and Node 24 or newer, but
**no optional runtime tools**, API tokens, or paid services for this example.
Copilot CLI is the reference path below; VS Code also exposes the activation
command. Other hosts have [their own setup steps](install.md#where-alex-act-one-works).

## 1. Install

Install directly from the repository in your terminal:

```powershell
copilot plugin install fabioc-aloha/Alex_ACT_ONE
```

This installs repository source, which can include unreleased changes.
For the reviewed release instead, use the [Mall option](install.md#mall-option).
No marketplace registration is needed for the direct command.

Open a Copilot session and confirm it discovers the installed `bootstrap-core`
and `critical-thinking` skills. If either is missing, stop and check the loaded
plugin root and version; do not activate from an unrelated checkout.
See [installation options](install.md#1-install-the-plugin).

## 2. Activate

In the app where you want the always-on instructions, run:

```text
/alex-act-one bootstrap-core
```

If that command is unavailable, ask: "Use the installed Alex ACT ONE
bootstrap-core skill to preview activation. Do not apply it yet."

Review the installed version, target profile, and proposed file actions.
Activation affects every workspace using that profile, not just this project.
Give approval only for the target and actions you want. Installing the plugin
alone does not activate instructions; repeat activation in each app you use.

The source-only conflict guard is not in published `v0.8.0`. Review existing
files before approving replacements; do not assume the release will block them.
If blocked in the source candidate, stop and review the
[conflict procedure](../skills/bootstrap-core/SKILL.md#instruction-conflicts);
do not add an overwrite flag to get past it.

## 3. Verify

After the approved apply, ask the agent:

```text
Use bootstrap-core to preview the same installed version and target again.
Do not apply or repair anything. Report expectedFiles, every file action,
and the receipt action.
```

Success means every current instruction is `preserve`, the receipt action is
`preserve`, and the version and target match the approved preview. After apply,
the script also checks destination hashes and reports `receiptCurrent: true`.
Missing files, replacement actions, or a stale receipt need investigation.

This verifies files, not that the host has loaded them. Start a new session
(fully restart Scout), then ask the host to list the active Alex instructions
and their source paths. If it cannot expose that evidence, record host loading
as **unverified**. A plausible answer to the next exercise does not prove it.

## 4. Try one workflow

Paste this into that session:

<!-- first-workflow -->
```text
Use the critical-thinking skill in act-pass mode.
This is a synthetic dashboard case: someone reports that loading takes
8 seconds and proposes a Rust rewrite or Redis caching. No timings have
been measured beyond that report.
Do not edit or write files. Apart from loading the skill guidance,
do not use tools or commands for this exercise.
Give two plausible explanations, evidence that would disconfirm each,
and the next measurement to collect. Mark what remains unknown rather
than choosing a rewrite or cache without evidence.
```

Look for competing explanations, evidence that could rule each out, and a
specific next measurement. The response should distinguish the reported delay
from measured facts and leave files unchanged. Exact wording is not the test.
This is one practice case, not evidence of general reliability gains.

## What to try next

- [Skills and commands](../README.md#the-skills): choose a workflow for your work.
- [Install and host reference](install.md): Scout, other hosts, optional tools,
  and reinstall boundaries.
- [Roadmap](../ROADMAP.md): the published baseline is `v0.8.0`; repository installs
  can include later source-only repairs and the interaction skill, which are not
  yet released through Mall. The offline galleries are demo-only files to open
  in a browser, not proof your MCP runtime is ready.
