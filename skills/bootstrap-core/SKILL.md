---
name: bootstrap-core
description: "Activates, verifies, repairs, or removes this plugin's user-scope runtime instructions from canonical installed sources. Use after installing or updating Alex ACT ONE, when ACT behavior or Alex Finch identity is inactive, or when bootstrap receipt hashes drift."
lastReviewed: 2026-09-07
---

# Bootstrap Core

Activate the plugin's own runtime with nothing else installed. Copilot plugins
expose skills and commands but do not load `.instructions.md` files as plugin
components. This skill copies only the canonical instruction sources the plugin
manifest declares, plus their receipt, to the active user instruction location
after explicit consent.

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

Instructions activate per app, not per machine. Each app that sets its own
`COPILOT_HOME` gets its own target, so activation runs once per app.

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

The receipt owns only the files this plugin installed. It never claims a
greeting instruction from another plugin or any user-authored file. A valid
legacy mixed receipt is evidence for preserving matching bytes, not authority to
rewrite or delete another plugin's state.

For compatibility with receipts written by earlier versions, the receipt still
records `alex-act-core` as `bootstrappedBy` and as each entry's `owner`. The
filename is current; the identifier inside is not. Changing it invalidates every
receipt already on disk, so it waits for a migration path.

## Repair And Idempotency

A current bootstrap requires:

1. Canonical source instructions matching the manifest inventory exactly.
2. A schema-v2 receipt carrying the installed plugin version.
3. One disjoint receipt entry per instruction.
4. Source, destination, and receipt SHA-256 parity.

Equal versions do not hide byte drift. A second preview after apply must report
only preserve actions and a preserved receipt.

## Remove Instructions

Preview removal with `--remove`. Apply only after explicit removal consent by
adding `--apply`. The script removes only receipt-owned destinations whose
current hashes still match the receipt. Modified or unowned files are preserved
and reported. Receipt entries must match the manifest-backed ownership set
exactly; unsafe, duplicate, foreign, or malformed entries fail closed before
path resolution. Clean removal verifies every deletion and removes the
receipt. Modified owned bytes and their receipt remain as recovery evidence.
Files owned by another plugin's receipt are never removed.

## Boundaries

- Self-activation is not general plugin lifecycle management.
- Do not install, update, enable, disable, or uninstall plugins here.
- Do not copy plugin directories, caches, settings, or unowned instructions.
- Do not write unowned instruction or external continuity state.
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

Revise by **2026-12-07** if this plugin alone cannot activate every declared
source, a preview mutates state, a receipt claims a file it does not own, source
resolution fails in a delivered plugin, or removal deletes modified bytes.
