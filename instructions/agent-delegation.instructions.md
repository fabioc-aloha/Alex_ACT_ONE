---
description: "Delegate mechanical work to worker subagents (workers in .github/agents/) so the parent session keeps capacity for ACT applied to the user's real problem"
applyTo: "**/*agent*,**/*delegate*,**/*subagent*,**/*author*,**/*diagram*,**/*convert*,**/*assembl*"
lastReviewed: 2026-05-01
---

# Agent Delegation

> Worker agents isolate mechanical work so the parent keeps judgment in the parent context.

## Why this rule exists

When the parent session is consumed by mechanical work, its capacity for the user's actual decision is reduced. Worker subagents absorb bounded authoring and rendering work into isolated contexts where outputs can be validated against fixed criteria.

Delegation is useful only when a matching worker is **currently loaded** in the session and its isolation benefit exceeds dispatch overhead. Core ships no worker agents itself; this instruction fires only when a heir workspace or another installed plugin contributes them.

## When to delegate (conditional check)

**Before authoring any markdown document, diagram, file conversion, or other mechanical artifact directly, check whether a matching worker sub-agent is loaded in the current session.** If yes, delegate. If not, proceed in the parent — this instruction adds no friction when workers are unavailable.

Workers are `.agent.md` files discovered from any of the Copilot agent locations (`~/.copilot/agents/`, `<workspace>/.github/agents/`, plugin `agents/` directories). Use `list_agents` (when available) or scan the runtime's agent set to see what is loaded.

Common worker patterns heirs may install (for example via `Alex_ACT_Steward/.github/agents/` or the illustrator plugin):

| Worker SA | Take this when the task is... |
| --- | --- |
| `markdown-author` | Authoring or substantively editing a markdown document (README, ADR, executive summary, prose-heavy `.md` artifact, frontmatter, tables, lists) |
| `illustrator` | Creating a single diagram (mermaid flowchart / sequence / state / class, SVG, ASCII art) |
| `document-assembler` | Stitching rendered diagrams into a draft markdown file that already contains 2 or more `<!-- ILLUSTRATOR: ... -->` placeholders |

These are examples of workers the discipline was designed around, not a requirement. If none of them exist in the current session, the parent handles the work directly and no delegation happens.

## Delegation decision table (when workers are loaded)

| Situation | Action |
| --- | --- |
| User asks for a substantive markdown doc (>~10 lines, prose-heavy) AND `markdown-author` is loaded | Delegate to `markdown-author` |
| User asks for a diagram of any kind AND `illustrator` is loaded | Delegate to `illustrator` |
| User asks for a doc that includes **one** diagram AND both workers are loaded | Delegate to `markdown-author` first; it returns a `<!-- ILLUSTRATOR: ... -->` placeholder; parent then delegates to `illustrator`; parent assembles the single block |
| User asks for a doc that includes **2 or more** diagrams AND all three workers are loaded | Delegate to `markdown-author` first (it writes the draft with N placeholders to a file); then delegate to `document-assembler` with the file path. The assembler dispatches all illustrators in parallel and stitches |
| Matching worker is not loaded | Do the work in the parent — no delegation |
| User asks the parent to *think about* something (analysis, decision, ACT pass) | Stay in the parent. Reasoning work belongs here |
| User asks for a one-line markdown edit (typo fix, single-character change) | Stay in the parent. Below the SA's overhead threshold |
| User asks for a plan, architecture review, or trade-off analysis | Stay in the parent |
| User asks for code generation, refactoring, or debugging | Stay in the parent (no SA worker for this domain yet) |
| User explicitly tells the parent to do the work directly | Stay in the parent. User intent overrides the policy |

## What "delegate" means in practice

Use the `runSubagent` tool with the loaded worker's exact name and a focused brief describing exactly what you need. The brief should include:

- The task in one sentence
- Any specific content requirements (headings, sections, tone)
- Any specific style requirements not covered by the SA's own skills
- For an illustrator worker: the diagram type, the nodes/relationships to show, and any layout preferences

The SA returns a result. Surface that result to the user (with assembly if needed for orchestration).

## What NOT to do

- **Do not fabricate a worker name.** If `markdown-author` (or any other worker) is not loaded in the current session, do not call `runSubagent('markdown-author', ...)` — it will fail. Verify the agent set first.
- **Do not author a markdown document directly when a matching worker IS loaded.** This is the most common failure mode when workers are available. The parent's training favors direct action; this instruction overrides that default when workers exist.
- **Do not draw a diagram directly when a matching worker IS loaded.** Same reason.
- **Do not delegate reasoning tasks.** ACT, frame audits, alternatives generation, severity checks belong in the parent. Worker SAs are for mechanical output, not judgment.
- **Do not invoke a worker SA via `/<name>` slash command.** Workers are `user-invocable: false` for a reason — the user shouldn't have to know they exist. The parent invokes them transparently via `runSubagent`.

## Self-check before authoring mechanical output

Before calling `apply_patch` on a substantive Markdown document or rendering a Mermaid block in the parent, ask:

1. *Is this mechanical work?* (markdown lint, diagram rendering, file conversion)
2. *Is there a matching worker SA currently loaded in the session?*
3. If yes to both: **stop. Delegate to the SA instead.**
4. If no to either: proceed in the parent.

If the model finds itself doing mechanical work in the parent and there was a matching loaded SA available, that's a violation of this instruction. Catch it on the next opportunity.

## Falsifiability

This instruction is wrong if, after 30 days of usage in a workspace that has loaded worker SAs, the parent still does mechanical work directly more than 25% of the time on tasks where a matching SA is loaded. That would mean either (a) the instruction language isn't strong enough, (b) `runSubagent` selection by description match is unreliable, or (c) the principle itself doesn't hold in practice.

A related failure mode: if this instruction is bypassed by fabricating a worker name that is not loaded (an agent-hallucination pattern), sharpen the load-check discipline. If neither ever happens because no workspace loads matching workers, the instruction is decorative for that heir — no defect, just no fire.

If either firing pattern occurs, escalate to a same-cycle proposal and revise.
