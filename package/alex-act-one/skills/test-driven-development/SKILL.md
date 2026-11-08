---
name: test-driven-development
description: Use for any feature, bug fix, refactor, or behavior change — enforces RED-GREEN-REFACTOR. Write the failing test first, watch it fail, write minimal code to pass, refactor. Carve out only throwaway prototypes, generated code, configuration files. Adapted from Hermes Agent / obra/superpowers.
lastReviewed: 2026-06-07
---

# Test-Driven Development

For a feature, bug fix, refactor, or behavior change, use RED -> GREEN -> REFACTOR. Native test generation and test/fix loops are mechanics, not proof of test-first work.

1. Define the expected behavior with a focused test using the real code path.
2. Run it and confirm it fails for the intended missing/incorrect behavior, not a syntax or fixture error.
3. Implement the simplest scoped correction.
4. Run the focused check; then run the relevant regression coverage. Refactor only while green.

Use existing runners and helpers. Prefer meaningful boundary/failure cases to tests that repeat implementation logic. Do not silently weaken a test to pass, invent coverage, or delete user-authored work to simulate a RED state.

Carve-outs for throwaway prototypes, generated code, and configuration need explicit agreement. Preserve implementation/commit/publication approval boundaries. Load [execution details](references/execution-details.md) only for the relevant examples or a specific testing difficulty; its generic examples do not override scope or consent.

Report the failing-then-passing commands and what they demonstrate. A passing test is evidence about that test, not a correctness guarantee for untested behavior.
