---
name: spike
description: Use when the user wants to feel out an idea before committing to a real build — "spike this out", "try it", "is this even possible?", "compare A vs B". Throwaway experiments that decompose into 2-5 feasibility questions, build minimal observable prototypes, and return VALIDATED / PARTIAL / INVALIDATED verdicts. Disposable by design. Adapted from Hermes Agent / GSD.
lastReviewed: 2026-06-07
---

# Spike

Use a spike for a real feasibility uncertainty before a production commitment. Native planning, isolated workspaces, and task execution provide mechanics; the contract is a bounded disposable experiment.

State the hypothesis, observable success/failure conditions, smallest representative input, and what decision the result will change. With the required approval, build only the experiment needed to test it; do not silently graduate throwaway code into production.

For performance, use a timed harness on the same input, repeat measurements, and report the median and run count from tool output. Separate measured timings from subjective quality judgments.

Load the matching method/template in [execution details](references/execution-details.md). Preserve privacy and authority: do not install dependencies, provision services, spend credits, publish, or perform destructive cleanup without the applicable consent.

Return VALIDATED, PARTIAL, or INVALIDATED against the stated conditions, with evidence, limitations, and the next decision. Keep source/worktree changes isolated and clean up only the resolved temporary resources this task owns.
