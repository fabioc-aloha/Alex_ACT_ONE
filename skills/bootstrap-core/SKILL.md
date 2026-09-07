---
name: bootstrap-core
description: "Activates, verifies, repairs, or removes Core's 17 user-scope runtime instructions from canonical installed sources. Use after installing or updating Core, when Core identity or ACT behavior is inactive, or when Core receipt hashes drift."
lastReviewed: 2026-08-21
---

# Bootstrap Core

Activate Core's own runtime without requiring Manager. Copilot plugins expose
skills and commands but do not load `.instructions.md` files as plugin
components. This skill copies only Core's 17 canonical instruction sources and
its Core-owned receipt to the active user instruction location after explicit
consent.

## Preview First

Run the bundled script without `--apply`:

```text
node <this-skill>/scripts/bootstrap-core.cjs
```

The preview resolves exactly 17 canonical sources from the installed Core
plugin root, verifies exact parity with Core's manifest instruction inventory,
calculates source and destination hashes, reports the resolved distribution
target and its source, reports create, replace, or preserve actions, includes
the current Core version, inspects legacy mixed-receipt evidence, and writes
nothing.

When `COPILOT_HOME` is an absolute path, the default target is
`$COPILOT_HOME/instructions`; otherwise it is `~/.copilot/instructions`. Use
`--target-instructions <path>` only for an explicit alternate target or a
disposable test. Use `--workspace-instructions <path>` to recursively report
possible workspace overlap before applying user-scope instructions.

## Apply After Consent

Show the resolved target, its source, exact file actions, user scope, receipt
action, overlap report, and current Core version. Ask:

> Activate these 17 Core instructions for every workspace on this machine?

After an explicit yes, rerun the same command with `--apply`. The script writes
only changed files, writes `.alex-act-core-bootstrap.json` atomically when its
content needs creation or refresh, and verifies every destination and the
receipt against canonical sources. A no-op apply preserves receipt bytes.

The receipt owns only Core files. It never claims Manager's greeting
instruction or any user-authored file. A valid legacy mixed receipt is evidence
for preserving matching bytes, not authority to rewrite or delete Manager state.

## Repair And Idempotency

A current bootstrap requires:

1. Exactly 17 canonical Core source instructions.
2. A schema-v2 Core receipt with the installed Core version.
3. Sixteen disjoint Core-owned receipt entries.
4. Source, destination, and receipt SHA-256 parity.

Equal versions do not hide byte drift. A second preview after apply must report
only preserve actions and a preserved receipt.

## Remove Core Instructions

Preview removal with `--remove`. Apply only after explicit removal consent by
adding `--apply`. The script removes only receipt-owned destinations whose
current hashes still match the receipt. Modified or unowned files are preserved
and reported. Receipt entries must match Core's exact manifest-backed ownership
set; unsafe, duplicate, foreign, or malformed entries fail closed before path
resolution. Clean removal verifies all 17 deletions and removes the receipt.
Modified owned bytes and their receipt remain as recovery evidence. Manager
greeting and Manager receipt files are never removed.

## Boundaries

- Core self-activation is not general plugin lifecycle management.
- Do not install, update, enable, disable, or uninstall plugins here.
- Do not copy plugin directories, caches, settings, or non-Core instructions.
- Do not write non-Core instruction or external continuity state.
- Do not fetch instruction bodies from the network.
- Do not silently apply during install or session start.
- Do not delete by filename glob; receipt and hash ownership are required.

## Anti-Patterns

| Anti-pattern | Correction |
| --- | --- |
| Require Manager before Core can activate | Run Core's own bootstrap command |
| Copy instructions without preview | Show exact actions and machine-wide scope first |
| Treat a skill as equivalent to always-applied policy | Activate the canonical instruction files |
| Delete every `alex-act-*` file | Remove only valid Core receipt entries with matching hashes |
| Let Core own Manager greeting | Keep separate Core and Manager receipts |

## Would Revise If

Revise by **2026-11-15** if Core-alone cannot activate all 17 sources, a
preview mutates state, a receipt claims a Manager or user-owned file, source
resolution fails in a delivered plugin, or removal deletes modified bytes.
