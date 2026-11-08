---
description: "Creates a reviewable optimized instruction, skill, prompt, or agent from an explicitly selected Markdown file or user-identified text. Use when improving an existing brain artifact or turning supplied material into a reusable one."
---

# compile-brain

Load and follow [compile-brain](../skills/compile-brain/SKILL.md) in **authoring** mode. Pass the user's arguments, inputs, and explicit constraints unchanged; clarify only missing material inputs. The canonical skill owns the compatibility command constraints, execution, and validation.

Return the owning skill's required result and verification limits. This entrypoint grants no additional authority: preserve the owner's approval, privacy, read-only, draft-only, and installation/publication boundaries as applicable.

Resolve links from the canonical installed alex-act-one package, never an assumed adopter checkout. If skill discovery is unavailable, locate that package with the host's native plugin discovery and read the linked source. Report a missing skill/reference and stop rather than silently skipping the workflow.
