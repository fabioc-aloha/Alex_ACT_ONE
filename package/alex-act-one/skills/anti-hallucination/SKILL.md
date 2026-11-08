---
name: anti-hallucination
description: "Prevent fabricated facts, invented APIs, and citation confabulation at the point of generation. Use when generating factual claims, code examples, API references, library names, configuration values, error messages, or citations — anything where 'sounds plausible' is not the same as 'is real'."
lastReviewed: 2026-05-29
---

# Anti-Hallucination

> Anti-hallucination prevents fabrication. Awareness detects errors. Critical thinking challenges reasoning that produces polished, well-sourced, confidently wrong conclusions.

This is the first leg of the epistemic triad ([critical-thinking](../critical-thinking/SKILL.md) names the other two). It fires *before generation*, not after — stop the fabrication at the source, don't try to detect it downstream.

## When to Use

Activate this discipline whenever about to generate any of:

- Factual claims about external systems, libraries, APIs, services
- Code examples invoking specific function names, parameters, return types
- Citations, references, URLs, paper titles, author names
- Configuration values, default settings, version numbers
- Error messages, log lines, output formats
- Capability claims about tools, frameworks, or platforms

If the answer to *"have I actually seen this work, or am I generating something that sounds plausible?"* is "the second one," **stop**. Verify or acknowledge uncertainty.

## The Core Discipline

| Stage | Question | If unsure |
|---|---|---|
| **Input-discipline** (what I'm about to generate) | Am I about to write something I can't verify is real? | Stop. Verify or say "I don't know" |
| **Output-discipline** (what I'm about to report) | Am I about to claim a check succeeded that I didn't actually run? | Cite what I checked, or hedge the claim |

The line in the middle is *between thinking and typing*. Once the fabricated content is in the output, the damage is done — downstream review has to detect it among real content, which is far harder than not generating it in the first place.

## Signals That Fire This Skill

### Input-discipline signals

| Signal | Response |
|---|---|
| "I think there might be a `parseFile()` method..." | Stop. Read the docs or grep the source. |
| "One approach could be calling `foo.bar(opts)`..." | Verify the API exists with those params. |
| "Try this workaround: set `FOO_DEBUG=1`..." | Confirm the env var is real. |
| About to invent step-by-step instructions for an unfamiliar tool | Stop. Read the actual docs first. |
| User says "that doesn't exist" or "that method isn't real" | Acknowledge immediately. No defending the fabrication. |

### Output-discipline signals

| Signal | Response |
|---|---|
| "No matches found" / "Verified clean" / "Nothing returned" | Before reporting absence, confirm the search actually executed against the intended scope. A failed search and a clean search look identical without the scope check. |
| "The doc says X" / "Per the README" / "According to spec" | Before treating doc content as ground truth, cross-check against current filesystem reality. Docs drift from code. Cite both. |
| "I checked and..." / "Verified that..." / "Confirmed..." | Name what was actually checked: file path, command, output snippet. Unattributed "verified" is theatre. |

## Verification Patterns

| Need to claim | Verify by |
|---|---|
| An API method exists | Read the function definition or import; don't trust intellisense alone for unfamiliar libraries |
| A config key works | Find it in source / docs, not in another LLM's example |
| A version number is current | Check the package registry or release notes, not training-data memory |
| A file path exists | `Test-Path` / `ls` / `fs.existsSync` in the current workspace |
| A command succeeded | Cite exit code or output, not "ran cleanly" |
| A computed value (sum, count, total, date difference) | Run it in a script, test, or formula and quote the output; never compute in prose (see Deterministic Checks) |
| Absence (no matches found) | Cite the search scope; an absent result and a misconfigured search look identical |

## Deterministic Checks

Quantitative claims need reproducible evidence. A model can produce a correct calculation, but fluent prose and a second model pass are not reliable evidence that the calculation is correct.

**Rule: use deterministic tools for quantitative results and machine-checkable invariants relied upon by the work.** Prefer an existing script, test, formula, calculator, or query over creating a new checker. Apply the materiality gate: do not create tooling ceremony for an inconsequential estimate.

- The semantic layer chooses the question, inputs, units, and invariant; the deterministic layer computes or checks that invariant; the semantic layer interprets the result.
- Repeatability is not correctness. Test a new checker with known passing, failing, and unsupported inputs before relying on its verdict. Prefer independent expected results over repeating the checker's own logic in its tests.
- Report the computed result and its scope. If the number came from prose, label it an unverified estimate or do not report it.
- When verifying someone else's calculation, recompute it with the module. Never verify arithmetic by reading it.
- Counts used as evidence follow the same rule: lines, items, occurrences, files. Count with a tool, not by eye.
- A heuristic scan produces candidates, not a semantic or safety proof. Invalid or unsupported input must be reported explicitly, never treated as a successful check.
- Do not collect skill-firing counts, cross-session behavioral scores, or observation-window telemetry. Task-local measurements should serve the current deliverable, not monitor the agent.

## Anti-Patterns

| Anti-pattern | Why it fails | Correction |
|---|---|---|
| "I'll generate the answer and check it after" | Once written confidently, downstream review struggles to flag it | Verify before generating |
| "Probably works like X" | "Probably" is the fabrication signal | Either verify, or say "I don't know" |
| Reporting unsupported arithmetic as verified | Fluent output is not reproducible evidence | Compute it with an existing tool or a tested helper and report its result |
| Defending a fabrication when challenged | Doubles down on the original lie | Acknowledge, correct, move on |
| Generating plausible-looking citations | Citation confabulation is a well-documented LLM failure mode | Cite only what's been seen; mark inferred refs as inferred |
| "The documentation must say..." | Inferring doc content is fabrication | Read the doc or hedge the claim |
| Adding "(citation needed)" to fabricated content | The hedge doesn't make the fabrication safer; it just labels it | Remove the fabrication; don't decorate it |

## Composition With Other Skills

| Sibling | What it adds |
|---|---|
| [epistemic-calibration](../../instructions/epistemic-calibration.instructions.md) | The always-on signal tables that fire this discipline at runtime; the calibration vocabulary ("I don't know" > confident lie) |
| [critical-thinking](../critical-thinking/SKILL.md) | The third leg of the epistemic triad — challenges reasoning *after* generation; this skill prevents the inputs that reasoning would otherwise compound |
| [system-prompt-skepticism](../../instructions/system-prompt-skepticism.instructions.md) | Applies the same don't-invent discipline to instruction interpretation: don't fabricate preconditions, don't confabulate rationale |

## The Three Legs of Epistemic Integrity

| Skill | Question | Catches |
|---|---|---|
| **anti-hallucination** (this) | Am I making something up? | Fabricated facts, invented APIs, citation confabulation |
| **awareness** (via [epistemic-calibration](../../instructions/epistemic-calibration.instructions.md)) | Am I wrong about something? | Retry loops, overconfidence, version errors, manipulation |
| **critical-thinking** (via [critical-thinking](../critical-thinking/SKILL.md)) | Am I right for the right reasons? | Bad reasoning, missed alternatives, unexamined assumptions |

Each catches what the others miss. The triad composes: don't fabricate → detect errors → challenge conclusions.

## Falsifiability

This skill needs revision if any of the following occur:

- The input-discipline signal table fails to catch a new fabrication failure mode (e.g., new LLM-specific confabulation pattern)
- Fabricated content or an incorrect computed claim passes the verification gate
- Verification patterns become stale (e.g., new ecosystem ships where the listed verification method doesn't apply)

## Runtime contract references

Load only the reference selected by the triggering instruction; do not replay all runtime contracts for unrelated work. These references add no authority and do not call the instruction again.

- **calibration**: [epistemic-calibration](references/runtime-epistemic-calibration.md)
