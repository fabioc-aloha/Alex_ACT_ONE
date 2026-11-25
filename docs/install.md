# Install and host reference

Start with [your first session](getting-started.md). Use this page to check
what your app supports and what an optional tool unlocks.

## Installation sources

Release version: `0.10.0`. macOS setup is not yet verified; the PowerShell
setup helper is for the Windows release path.

| Source | What to use it for |
| --- | --- |
| Mall | The recommended way to install the reviewed release. |
| Repository | Unreleased source. Direct installation is deprecated and is not the normal setup path. |
| Optional runtime | Extra tools for specific skills. Installing ONE does not provision these tools or activate instructions. |

Existing installations do not update automatically. After updating, check the
version and source your app actually loaded before approving profile changes.
A checkout with the same version is not a
substitute for the installed package.

## Where Alex ACT ONE Works

| App | Skills | Activation | Companion tools |
| --- | --- | --- | --- |
| Copilot CLI | Installed plugin | `/alex-act-one bootstrap-core` | MCP registration comes from the plugin. |
| VS Code with GitHub Copilot Chat | Installed plugin | `/alex-act-one bootstrap-core` | MCP registration comes from the plugin. |
| Microsoft Scout | Reuses the Copilot CLI installation | Ask for `bootstrap-core` by name | Register MCP servers separately only if needed. |
| GitHub Copilot app | Installed plugin | Ask for `bootstrap-core` by name | Check what the app exposes before relying on a tool. |

Tool availability and live chart display depend on the host. See the
[verification notes](verification/README.md) for the scope of tested behavior.

## Install

### 1. Install the plugin

#### Mall option

Install **Alex ACT ONE** from Alex Mall. For the exact terminal commands, use
the [README's manual installation appendix](../README.md#appendix-manual-installation).

### 2. Turn on the always-on instructions, once in each app

If you want ONE's instructions active across conversations, ask the app to
preview activation using the command or skill name above. Review the target
profile and proposed changes before approving. If existing instructions
conflict, stop and see the [conflict procedure](../skills/bootstrap-core/SKILL.md#instruction-conflicts).
See [first-session verification](getting-started.md#3-verify) to check the result.

### What you get after each step

- Installing the plugin makes its skills available in apps that discover it.
- Activating instructions adds the always-on behavior to the selected app's
  profile. You can use skills without doing this.
- Setting up a dependency enables the capability that needs it. You can wait
  until that capability is part of your task.

### Using Claude Code instead?

ONE's skills follow the Agent Skills format. See the
[manual copy instructions](../README.md#use-skills-in-claude-code).
Copilot's activation and command aliases do not transfer. Claude Code execution
is not verified by ONE's Copilot tests.

### On Microsoft Scout, register the MCP servers

Enable **Load Copilot CLI skills** and use the same ONE installation as Copilot
CLI, rather than keeping a second Scout copy. Scout does not expose plugin
slash commands; ask for skills by name.

If you need Flint or the Playwright fallback, follow the
[Scout registration guide](../skills/setup-dependencies/SKILL.md#registering-the-servers-with-microsoft-scout).
Confirm the preview's plugin root matches the one Scout loaded. Review and
approve any changes, then fully quit and restart Scout. Check the
required tools in the target app; listing a tool does not prove it can display
a live chart or save a file.

### Optional: extra tools for a few skills

**Skip full dependency setup unless you need it.** Core skills don't require
these tools. If a dependency blocks the requested output, the skill checks for
a supported fallback. If none fits, it loads
[Setup Dependencies](../skills/setup-dependencies/SKILL.md#when-another-skill-is-blocked)
for a read-only check and asks before installing or registering anything.

| If you want to... | You may need |
| --- | --- |
| Convert Word, HTML, Markdown, or email documents | Pandoc |
| Render Mermaid diagrams or export SVG as PNG | Mermaid CLI or svgexport, depending on the output |
| Annotate a screenshot | Pillow in the selected Python environment |
| Render a Flint chart | The Flint MCP runtime matching your installed ONE package |
| Check rendered output in a browser | Your host's browser tools, or the Playwright MCP fallback if needed |

You can also ask for `setup-dependencies` by name, or run
`/alex-act-one setup-dependencies` in Copilot CLI or VS Code. Use the same
package for setup and launch so the pins match.

### Scripts for reinstalling and optional setup

Use the [README appendix](../README.md#appendix-manual-installation) for the
full installer or dependency-only preview. The full installer also handles
plugin installation and instruction activation; it is not necessary for
ordinary skill use.

#### Reinstall and verify ONE

See [manual reinstall and verification](../README.md#reinstall-and-verify-one).

#### Install or check optional dependencies

See [manual dependency setup](../README.md#install-or-check-optional-dependencies)
and the [installed-package setup guide](../skills/setup-dependencies/SKILL.md#installed-package-setup).
