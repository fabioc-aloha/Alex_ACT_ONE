# Your first session with Alex ACT ONE

Install the pack, approve activation in one app, then try a read-only reasoning
workflow. You need a working GitHub Copilot setup and Node 24 or newer, but
**no optional runtime tools**, API tokens, or paid services for this example.
Copilot CLI is the reference path below; VS Code also exposes the activation
command. Other hosts have [their own setup steps](install.md#where-alex-act-one-works).

Release version: `0.10.0`.
Verify the installed version and delivery source;
this guide does not establish that a host loaded the instructions.

## 1. Install

Install the reviewed release from [Alex Mall](install.md#mall-option). Use the
[README appendix](../README.md#appendix-manual-installation) for terminal
commands. You can skip full dependency setup. If a missing tool later blocks
the requested output, the skill will check for a fallback or ask before
setting up the dependency.

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

Activation stops before writing if instructions conflict. Review the
[conflict procedure](../skills/bootstrap-core/SKILL.md#instruction-conflicts);
do not add an overwrite flag to get past it.

## 3. Verify

After the approved apply, ask the agent:

```text
Use bootstrap-core to preview the same installed version and target again.
Do not apply or repair anything. Tell me whether every instruction and the
activation record would be preserved without changes.
```

The preview should show no pending changes for the same version and profile.
Investigate missing or changed files before continuing.

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
Do not edit or write files. Apart from loading skill guidance, including
its required bundled references, do not use tools or commands for this exercise.
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
- [Optional tools](install.md#optional-extra-tools-for-a-few-skills): set up only
    what the skills you use need.
- [Flint demos](README.md#flint-demonstrations): try charts in a browser without
    installing an MCP server.
