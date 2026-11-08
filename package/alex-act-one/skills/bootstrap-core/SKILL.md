---
name: bootstrap-core
description: "Activates, verifies, repairs, or removes this plugin's user-scope runtime instructions from canonical installed sources. Use after installing or updating Alex ACT ONE, when ACT behavior or Alex Finch identity is inactive, or when bootstrap receipt hashes drift."
lastReviewed: 2026-11-05
---

# Bootstrap Core

Activate this package's legacy instruction delivery with nothing else installed.
Current Copilot clients document native plugin rules, but that is not proof this
legacy package's instructions are active. Until the native-delivery compatibility
gate passes on supported hosts, this skill copies only manifest-declared
canonical instructions and their receipt after explicit consent.

The session-health instruction carries the
[shared artifact storage contract](../proactive-awareness/references/project-artifact-storage.md).
Verify its inclusion in the selected installed package and activation preview.
A canonical-source edit does not update an installed cache or user profile;
installation and activation remain separately approved steps. Instruction
parity is not proof of host-enforced delivery.

## Preview First

Run the bundled script without `--apply`:

```text
node <this-skill>/scripts/bootstrap-core.cjs
```

The preview resolves the canonical sources from the installed plugin root,
verifies exact parity with the plugin manifest's instruction inventory,
calculates source and destination hashes, reports the resolved distribution
target and its source, reports create, replace, or preserve actions, includes
the installed plugin version, inspects legacy mixed-receipt evidence, and writes
nothing.

When `COPILOT_HOME` is an absolute path, the default target is
`$COPILOT_HOME/instructions`; otherwise it is `~/.copilot/instructions`. Use
`--target-instructions <path>` only for an explicit alternate target or a
disposable test. Use `--workspace-instructions <path>` to recursively report
possible workspace overlap before applying user-scope instructions.

The preview also exposes `routing.canonicalRoot` and `routing.skillRoutes`.
Resolve instruction-to-skill links against the canonical installed source,
not the activated profile directory. Missing, undeclared, or externally
redirected skill owners block activation before any writes. Native skill
discovery remains the preferred loading mechanism; the routing map is a
read-only fallback, not evidence that a skill was invoked.

Instructions activate per app, not per machine. Each app that sets its own
`COPILOT_HOME` gets its own target, so activation runs once per app.

## Host Readiness

Start with a host-specific readiness report when the activation steps are
unclear:

```text
node <this-skill>/scripts/host-readiness.cjs --host scout
node <this-skill>/scripts/host-readiness.cjs --host scout --json
```

Supported hosts are `copilot-cli`, `vscode`, `github-copilot-app`, and `scout`.
The report runs the bootstrap preview for the selected target and names what
still belongs to that host. It writes no instructions or MCP registry entries,
does not enable UI settings, and cannot prove a host has restarted or observed
the activation.

For Scout, the report also previews its separate MCP registration and names the
required **Load Copilot CLI skills** setting and full restart. Review the
existing bootstrap and registrar previews, then run each `--apply` command
separately after consent.

## Apply After Consent

Show the resolved target, its source, exact file actions, user scope, receipt
action, overlap report, and installed plugin version. Ask:

> Activate these instructions for every workspace on this machine?

Quote the actual count from the preview's `expectedFiles` rather than a number
remembered from last time.

After an explicit yes, rerun the same command with `--apply`. The script writes
only changed files, writes `.alex-act-one-bootstrap.json` atomically when its
content needs creation or refresh, and verifies every destination and the
receipt against canonical sources. A no-op apply preserves receipt bytes.

### Instruction conflicts

The default preview reports `blocked: true` and names conflicts when a matching
destination is unowned or differs from both its receipt and the current source.
`--apply` then fails before writing any instruction or receipt. Host readiness
also reports `blocked`, not ready-to-apply. Unchanged receipt-owned older
instructions can still upgrade normally.

Do not silently resolve a conflict or add an overwrite flag. Back up the affected
files and receipt, explain which custom bytes would be lost and which unowned
files would become receipt-owned, then preview the same target with
`--overwrite-conflicts` but without `--apply`. Only after explicit approval of
those exact replacements may the same command use both flags.
This override cannot be combined with removal and does not bypass receipt
validation or stale-plan checks.

The receipt owns only installed or explicitly adopted instruction files; ordinary
activation never claims a user-authored file merely because its name matches.
A legacy mixed receipt is evidence, not authority to rewrite another plugin's state.

Receipts written through version 0.3.0 record `alex-act-core` as
`bootstrappedBy` and as each entry's `owner`, with a former source path. A
subsequent `--apply` validates their hashes and migration shape, then refreshes
them to `alex-act-one` ownership and the canonical `instructions/` source path
without rewriting unchanged instruction files. Preview reports the legacy
receipt as a refresh; `--remove` continues to recognize it as owned until the
migration runs.

## Repair And Idempotency

A current bootstrap requires:

1. Canonical source instructions matching the manifest inventory exactly.
2. A schema-v2 receipt carrying the installed plugin version.
3. One disjoint receipt entry per current instruction, retaining valid owned
   retired entries so a later consented removal can clean them.
4. Source, destination, and receipt SHA-256 parity.

Equal versions do not hide byte drift. A second preview after apply must report
only preserve actions and a preserved receipt.
An I/O failure may leave partial canonical writes, but must not publish a success
receipt or leave temporary write files. Stop, inspect a fresh preview, and use
the separately consented conflict-recovery flow when ownership is incomplete;
do not infer ownership from a partially written file.

## Remove Instructions

Preview removal with `--remove`. Apply only after explicit removal consent by
adding `--apply`. The script removes only receipt-owned destinations whose
current hashes still match the receipt. Modified or unowned files are preserved
and reported. Current entries must match manifest-backed ownership; retained
retired entries must satisfy the same owner, name, source-path, and hash rules.
Unsafe, duplicate, foreign, or malformed entries fail closed before path
resolution. Valid retired entries remain owned across upgrades.
Clean removal verifies every deletion and removes the
receipt. Modified owned bytes and their receipt remain as recovery evidence.
Files owned by another plugin's receipt are never removed.

## Boundaries

- Self-activation is not general plugin lifecycle management.
- Do not install, update, enable, disable, or uninstall plugins here.
- Do not copy plugin directories, caches, settings, or unowned instructions.
- Do not write unowned instructions without the separately previewed and approved
  conflict override. Never write external continuity state here.
- Do not fetch instruction bodies from the network.
- Do not silently apply during install or session start.
- Do not delete by filename glob; receipt and hash ownership are required.

## Anti-Patterns

| Anti-pattern | Correction |
| --- | --- |
| Require another plugin before this one can activate | Run this plugin's own bootstrap command |
| Copy instructions without preview | Show exact actions and machine-wide scope first |
| Treat a skill as equivalent to always-applied policy | Activate the canonical instruction files |
| Delete every `alex-act-*` file | Remove only valid receipt entries with matching hashes |
| Claim a greeting instruction this plugin did not install | Keep separate receipts per owning plugin |
| Assume one activation covers every app | Run activation in each app that sets its own `COPILOT_HOME` |

## Would Revise If

Revise if this plugin alone cannot activate every declared
source, a preview mutates state, a receipt claims a file it does not own, source
resolution fails in a delivered plugin, or removal deletes modified bytes.

## Compatibility command constraints: bootstrap-core

Preview exact profile actions first. Apply only after explicit activation/repair consent; removal needs its own explicit consent. Block foreign or modified owned files by default; conflict replacement requires a separate backup, preview, and explicit approval.
