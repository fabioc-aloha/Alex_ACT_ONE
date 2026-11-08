---
description: "Guards native memory and repository continuity write boundaries against sensitive data on every persistent write"
applyTo: "**"
lastReviewed: 2026-08-18
---

# pii-memory-filter

## Activation and resident floor

Before every persistent write, including native memory and repository continuity.

Never store credentials, sensitive personal data, contact details, client identities, or user-identifying paths in memory. Minimize scope and retain work facts only. Use appropriate secret storage, not a memory tier. Resolve ambiguous preference scope before saving; do not silently infer global scope.

## Required execution

When the trigger requires the detailed workflow, load and follow [ethical-reasoning](../skills/ethical-reasoning/SKILL.md) in **persistence** mode, including its runtime-pii-memory-filter reference where applicable. These guardrails apply before loading; a hyperlink alone is not execution.

Use native skill discovery first. Links are relative to the canonical installed instruction source, not this activated profile copy or an adopter checkout. If discovery is unavailable, locate the canonical alex-act-one package through native plugin discovery and use its bootstrap preview `routing.skillRoutes` and `routing.canonicalRoot` to resolve the linked skill. Report a missing owner/reference explicitly; never skip a required check or claim it completed. Loading grants no additional write, installation, send, or publication authority.
