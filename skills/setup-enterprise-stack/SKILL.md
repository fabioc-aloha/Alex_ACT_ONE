---
name: setup-enterprise-stack
description: "Emit and (with consent) install the Copilot CLI settings block for the public Microsoft ecosystem: Azure, Fabric, Power BI, and Microsoft 365 Agents Toolkit. Defaults to **repo scope** (`.github/copilot/settings.json`) because these are project-specific tools; a Python data-analysis workspace does not need Azure skills loaded. Use `--user` to make the plugins available in every workspace. Use when someone on a Microsoft-subscribed tenant wants these public plugins enabled for the current project, or when auditing / repairing the Microsoft ecosystem enablement in a workspace or user profile."
lastReviewed: 2026-08-02
---

# Setup Enterprise Stack

Emit the paste-ready `enabledPlugins` + `extraKnownMarketplaces` block for the four public Microsoft ecosystem plugins any Microsoft-subscribed tenant can use, and optionally install them after explicit user consent. **Defaults to repo scope** — these are project-specific tools.

## When to fire

- Heir asks to enable the Microsoft ecosystem — "set up Azure + Fabric + Power BI + M365 for Copilot"
- Heir invokes `/alex-act-one setup-enterprise`
- Heir asks what block goes into `~/.copilot/settings.json` for the public Microsoft plugins
- Auditing or repairing a workspace where some of them are missing, disabled, or stale

## The plugins

| Plugin | Marketplace ID | Marketplace source | Purpose |
|---|---|---|---|
| `azure` | `azure-skills` | github: `microsoft/azure-skills` | Azure resource authoring + ops + diagnostics + RBAC + storage + compute |
| `fabric-skills` | `copilot-plugins` (default) | (built-in) | Complete Fabric bundle: consumption, operations, and authoring. Absorbed the retired persona-axis bundles (`fabric-consumption`, `fabric-operations`, `fabric-authoring`), which survive only as deprecated aliases |
| `powerbi-authoring` | `fabric-collection` | github: `microsoft/skills-for-fabric` | Power BI report design + authoring + planning + management |
| `microsoft-365-agents-toolkit` | `copilot-plugins` (default) | (built-in) | Declarative agent authoring, Teams app dev, UI widget dev |

`copilot-plugins` is the built-in Copilot marketplace and does not need explicit registration. `azure-skills` and `fabric-collection` are additional marketplaces the heir must register in `extraKnownMarketplaces` before enabling their plugins.

## Prerequisites

Before running any install command, verify the heir has:

- **Copilot CLI**: `copilot --version` >= 1.0.75. If missing, direct the heir to <https://github.com/github/copilot-cli> for installation.
- **Azure subscription**: required to actually invoke `azure@azure-skills` skills against real resources. The plugin registers without a subscription, but skill invocations against `az` will fail without one.
- **Fabric workspace**: required for `fabric-skills` to reach a live capacity. Registration and skill loading do not require a workspace.
- **Power BI license**: `powerbi-authoring@fabric-collection` requires either a Power BI Pro or Premium Per User license for authoring against real workspaces.
- **Microsoft 365 tenant**: required for `microsoft-365-agents-toolkit@copilot-plugins` when publishing agents; not required for local scaffolding.

Missing prerequisites do not block registration; they surface at first skill invocation. Warn the heir but do not refuse to emit the block.

## Emit block

Produce this block as an emitable, paste-ready JSON snippet. Do not modify the heir's `~/.copilot/settings.json` without explicit consent (see Install flow below).

### Emit-only safety boundary

When the user selects emit only, or does not select a mode and receives the
safe default, do not create or update todos, tasks, plan items, or any other
host planning state. Do not modify files, settings, plugins, or marketplace
registrations. Return the block and guidance directly.

```json
{
  "extraKnownMarketplaces": {
    "azure-skills": {
      "source": { "source": "github", "repo": "microsoft/azure-skills" }
    },
    "fabric-collection": {
      "source": { "source": "github", "repo": "microsoft/skills-for-fabric" }
    }
  },
  "enabledPlugins": {
    "azure@azure-skills": true,
    "fabric-skills@copilot-plugins": true,
    "powerbi-authoring@fabric-collection": true,
    "microsoft-365-agents-toolkit@copilot-plugins": true
  }
}
```

The block enables all seven. Heirs edit their local `enabledPlugins` after paste to drop plugins they do not need — for example, a heir on Azure only can remove the six Fabric / Power BI / M365 entries.

## Scope decision (do this first)

Before any of the three modes below, decide the target scope:

| Scope | Target file | Use when |
|---|---|---|
| **Repo (default)** | `.github/copilot/settings.json` in the current workspace | The heir is set up on a project that touches Azure / Fabric / Power BI / M365. These plugins load only in this workspace; other projects stay lean. File gets committed — teammates inherit the setup on clone. |
| **User (opt-in via `--user`)** | `~/.copilot/settings.json` on the current machine | The heir uses the Microsoft ecosystem across most or all of their projects and wants the plugins loaded in every workspace. |

Default is repo scope. These are project-specific tools (Azure = Azure projects; Fabric = Fabric projects; etc.); loading them at user scope means every non-Microsoft workspace pays the context cost for skills the heir will never invoke there.

The rule: *"Am I this? → user scope. Am I working on this? → repo scope."* The seven target plugins answer the second question, not the first.

Ask the heir which scope, or accept an explicit `--user` flag. Default to repo when unspecified.

## Install flow

Three modes. Ask the heir which they want; default to (1). Every mode uses the scope decided above.

### 1. Emit only (default, safe)

Print the JSON block above with instructions targeted at the chosen scope:

> **Repo scope (default)**: Paste this block into `.github/copilot/settings.json` in the current workspace. Create the file if it does not exist. If the file already has `extraKnownMarketplaces` or `enabledPlugins` keys, merge — do not overwrite existing entries. Commit the file (it belongs in source control; teammates will inherit the setup on clone). Then run the individual `copilot plugin install <name>@<marketplace>` commands shown in consent-gated auto-install mode.
>
> **User scope (`--user` opt-in)**: Paste this block into `~/.copilot/settings.json` on this machine. If the file already has keys, merge. The block will apply to every workspace you open on this machine.

No filesystem write. No CLI invocation. Heir owns the paste + install.

### 2. Consent-gated auto-install

Only after explicit "yes, install them" from the heir. Merge the block into the target file per the chosen scope:

```powershell
# Repo scope (default): merge into <workspace>/.github/copilot/settings.json
# User scope (--user):  merge into ~/.copilot/settings.json
# then run the marketplace + install commands:
copilot plugin marketplace add microsoft/azure-skills
copilot plugin marketplace add microsoft/skills-for-fabric
copilot plugin install azure@azure-skills
copilot plugin install fabric-skills@copilot-plugins
copilot plugin install powerbi-authoring@fabric-collection
copilot plugin install microsoft-365-agents-toolkit@copilot-plugins
```

Additive settings merge: if the target file already has an `enabledPlugins` map with unrelated entries, preserve them. If it already has entries for one of them, warn but do not overwrite unless the heir also asked to reset.

**Marketplaces register at user scope regardless of the enabledPlugins scope choice.** The `marketplace add` commands write to `~/.copilot/settings.json` `extraKnownMarketplaces` — that is where the CLI reads marketplace registration from. Only the `enabledPlugins` map moves between user and repo scope in this skill.

### 3. Audit only

Read the current settings file at the chosen scope. Under `--user`, read `~/.copilot/settings.json`; otherwise read `.github/copilot/settings.json` in the workspace. Compare against the target block, produce a table:

| Plugin | Currently enabled at chosen scope? | Currently enabled at other scope? | Marketplace registered? | Action |
|---|---|---|---|---|
| `azure@azure-skills` | yes/no | yes/no | yes/no | `install` / `enable-only` / `move-scope` / `nothing` |
| `fabric-skills@copilot-plugins` | yes/no | yes/no | (built-in) | `install` / `enable-only` / `move-scope` / `nothing` |
| ... | | | | |

The "other scope" column surfaces heirs who accidentally enabled at user scope when repo scope was intended (or vice versa). Do not modify anything. Report only. Heir decides what to do with the audit.

## Safety rules

- **Never** overwrite a settings file (repo OR user) without explicit consent from the heir.
- **Never** disable a plugin the heir did not ask to disable — merge, don't replace.
- **Never** install plugins from marketplaces outside the two named (`microsoft/azure-skills`, `microsoft/skills-for-fabric`). Any expansion needs a separate proposal.
- **Never** silently pick user scope. Default is repo. Only switch to user on explicit `--user` request from the heir.
- **Do** warn if the heir already has `enabledPlugins` entries at *either* scope that conflict with these (for example, a pre-existing `fabric-skills@my-fork` at repo scope with the target `fabric-skills@copilot-plugins` at user scope would produce a plugin-name collision the CLI resolves via last-write-wins).
- **Do** verify the CLI version before offering install mode; refuse to proceed if the CLI is too old (missing the marketplace-add subcommand).
- **Do** remind the heir that the repo file gets committed — teammates will inherit the setup on next `git pull`.

## Anti-patterns

| Anti-pattern | Correction |
|---|---|
| Emit the block AND auto-install without asking | Emit is always safe; install requires explicit yes |
| Overwrite an existing settings file | Merge; preserve unrelated keys |
| Default to user scope silently | Default is repo scope per PLUGIN-INTEGRATION § 2; user scope requires explicit `--user` |
| Skip the scope-decision step | Every invocation must decide scope before offering modes |
| Install a subset without telling the heir which the block excluded | List every plugin the heir will get and every one the block does not enable |
| Skip prerequisite check | Missing subscriptions do not block registration but do block real skill use — always warn |
| Include Microsoft-internal plugins (WorkIQ, `org-report`, Agency framework) | Those are internal-only and out of scope; this skill covers the public ecosystem |

## Composes with

- The always-on discipline baseline and the visual-authoring skills ship in this
  same package, so nothing extra is needed for them
- Microsoft-internal tooling (WorkIQ, Agency framework, `org-report`) is separate and only useful inside Microsoft's corporate network

## Falsifiability

Sunset or revise this skill by **2027-01-30** (6 months) if any of the following fires:

- Any target plugin is renamed, moved, or deprecated upstream, making the emitted block stale. This fired once: the persona-axis Fabric bundles were retired into `fabric-skills` and the skill kept emitting all three for months. Verify each name with `copilot plugin marketplace browse` before emitting.
- Microsoft ships a new plugin in the same ecosystem that heirs consistently install alongside these seven (block is incomplete).
- The `copilot plugin marketplace add` CLI syntax changes (install flow is broken on emit).
- Two or more heirs report the auto-install mode overwriting unrelated settings (safety rule failed).

Track outcomes in the maintaining repo's curation log.

## Related

- [`/alex-act-one setup-enterprise`](../../prompts/setup-enterprise.prompt.md) — namespaced slash-command entry point

- Steward's user-brain inventory § 184 — source spec for this block
