---
description: "Runs a read-only Markdown assessment of a local project brain or plugin source. Use when reviewing instructions, skills, prompts, agents, bundled Markdown resources, research documentation, and static capability routes before proposing changes."
---

# assess-brain

Load and follow [assess-brain](../skills/assess-brain/SKILL.md) in **assessment** mode. Pass the user's arguments, inputs, and explicit constraints unchanged; clarify only missing material inputs. The canonical skill owns the compatibility command constraints, execution, and validation.

Return the owning skill's required result and verification limits. This entrypoint grants no additional authority: preserve the owner's approval, privacy, read-only, draft-only, and installation/publication boundaries as applicable.

Resolve links from the canonical installed alex-act-one package, never an assumed adopter checkout. If skill discovery is unavailable, locate that package with the host's native plugin discovery and read the linked source. Report a missing skill/reference and stop rather than silently skipping the workflow.
