Adapted from Cole Nussbaumer Knaflic's _Storytelling with Data_ framing. Write ONE sentence that:

1. **States a unique point of view** — not a topic. "Adoption is up" beats "Q3 adoption metrics".
2. **Conveys what's at stake** — why the reader should care. "…so we need to reallocate the training budget" beats "…which is notable".
3. **Is a complete sentence** — subject + verb + object. If it reads like a chart title, tighten it into a claim.

**Template**: _"[Subject] [did/is/shows] [specific finding], [therefore/so-what implication]."_

**Examples:**

| Weak (topic)               | Strong (Big Idea)                                                                                                                                        |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| "Sales by region"          | "The West region grew 3× faster than the rest of the company last quarter, so the FY26 hiring plan should shift 15 headcount west."                      |
| "AI readiness scores"      | "One-third of respondents are Skeptics with BI below the Likert midpoint — training programs that treat them the same as Enthusiasts will underperform." |
| "Portfolio risk over time" | "Portfolio VaR crossed the policy ceiling in three of the last five quarters — the risk-appetite statement needs a formal review."                       |

### If the Big Idea is still not clear after Step 0 — help the user find it

Run this 3-question elicitation ladder. Ask **one question at a time**; stop as soon as a Big Idea sentence writes itself. Do not batch the questions — batching is an interrogation, not a conversation.

1. **"What surprised you in this data?"** — the surprise is almost always the Big Idea. If nothing surprised, the chart may not have a claim to make (in which case, ask whether it's decorative / reference-only).
2. **"What decision should change if this chart lands?"** — gets the "so-what" clause. If no decision changes, the chart is informational; that's fine, but the Big Idea shape shifts from persuasive to descriptive.
3. **"If a colleague read only the chart title and moved on, what one sentence do you want stuck in their head?"** — the Big Idea reframed as a headline the user can imagine writing. This one usually unlocks users who couldn't answer #1 or #2 abstractly.

**If all three come back vague** ("just show the data", "I don't know, you pick"): propose a Big Idea _yourself_ from Step 0 context + what the data actually shows, mark it clearly as `**Proposal**:`, and let the user confirm or edit. Do not stall waiting for a perfect answer. A specific proposal the user can react to is faster than an open-ended prompt.

**Anti-pattern**: running the whole ladder in one message ("What surprised you? What decision changes? What headline?"). One question, wait, listen, next.
