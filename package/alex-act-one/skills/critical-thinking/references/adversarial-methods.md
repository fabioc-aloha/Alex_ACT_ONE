# Adversarial Review

> **ACT Tenet VIII**: If you cannot steelman the counter-argument, you have not understood the argument.

Methods for **structured skepticism** beyond self-critique.

## When to Use

| Trigger                    | Action                       |
| -------------------------- | ---------------------------- |
| High-stakes decision       | Request adversarial review   |
| "This seems too good"      | Apply red team thinking      |
| Groupthink forming         | Assign devil's advocate role |
| Before committing publicly | Stress-test the position     |

## Adversarial Review Methods

### 1. Red Team / Blue Team

| Role          | Purpose                | Mindset                 |
| ------------- | ---------------------- | ----------------------- |
| **Blue Team** | Proposes and defends   | "Here's why this works" |
| **Red Team**  | Attacks and challenges | "Here's how this fails" |

**Process**:

1. Blue Team presents proposal
2. Red Team has dedicated time to find flaws
3. Blue Team responds to challenges
4. Iterate until Red Team is out of ammunition
5. Decide based on what survived

### 2. Pre-Mortem (Prospective Hindsight)

> "Imagine it's 6 months from now and this failed spectacularly. What happened?"

| Question                            | Surfaces          |
| ----------------------------------- | ----------------- |
| "What killed it?"                   | Fatal flaws       |
| "What obvious thing did we miss?"   | Blind spots       |
| "What external event surprised us?" | Dependency risks  |
| "What did we know but ignore?"      | Willful blindness |
| "Who said 'I told you so'?"         | Unheard dissent   |

### 3. Steel Manning (Strongest Counter-Argument)

Before dismissing an objection, make it **stronger**:

| Weak Counter                 | Steel-Manned Version                                                           |
| ---------------------------- | ------------------------------------------------------------------------------ |
| "Competitors might catch up" | "Competitor X has 10x our resources and recently hired our former tech lead"   |
| "Users might not adopt"      | "Similar products failed because users were satisfied with existing workflows" |
| "It's too expensive"         | "At projected volumes, unit economics are negative for 18 months"              |

**Test**: Could the person who raised the objection say "yes, that's what I meant, but stated better"?

### 4. Murphyjitsu (Systematic Failure Modes)

For each component, ask: "What could go wrong here specifically?"

| Component | Failure Mode   | Likelihood | Mitigation   |
| --------- | -------------- | ---------- | ------------ |
| [Part 1]  | [How it fails] | H/M/L      | [Prevention] |
| [Part 2]  | [How it fails] | H/M/L      | [Prevention] |

### 5. The 10/10/10 Test

| Timeframe  | Question                                           |
| ---------- | -------------------------------------------------- |
| 10 minutes | How will I feel about this decision in 10 minutes? |
| 10 months  | How will I feel in 10 months?                      |
| 10 years   | How will I feel in 10 years?                       |

**Purpose**: Escapes short-term emotional reactions.

### 6. Cross-Model External Critic (highest-fidelity)

Methods 1-5 above are **same-model in-session** disciplines — one agent, one model, one context, role-separating between proposer and critic. That inherits three failure modes: confirmation bias from shared context, sycophancy toward the proposer's earlier claim, and blind spots co-shared with the proposer. When stakes justify the tool overhead, route the critique to a _different_ model in a _fresh_ context.

**Important — this brain is not code-focused.** OOB Copilot capabilities (`rubber-duck` agent, `code-review` agent, `/fix`, `/explain`) are engineered primarily for **code** artifacts. This brain fires on decisions, prose, plans, ADRs, framework edits, book chapters, curation moves — code is a downstream consequence of project needs, not the primary target. Route the critique to the mechanism that matches the artifact.

**Native routing:** discover the available critic or isolated-agent capability for the current host. Use a complementary model only when supported and justified; do not hardcode a model, CLI argument recipe, or parallel-agent topology. For general prose or decisions, supply the artifact and ask for evidence-backed criticism without requiring a code diff.

**When to reach for cross-model** (Materiality gate):

- Constitutional decisions (ADRs, framework edits, canon changes)
- Release cuts and irreversible operations
- Any output where "I convinced myself" is a plausible failure mode
- User confidence is high AND stakes are high (sycophancy risk peaks)

**When same-model in-session is enough**:

- Low-stakes work — Materiality gate exits before the pass fires
- The critique surfaces via _different discipline_, not different model — e.g. three-perspectives (Advocate / Skeptic / Architect) works on same-model because roles separate the analysis, not models
- No cross-model channel is available and the stakes don't warrant paying manual switching cost

**Compose, don't replace**: Cross-model critic wraps any of methods 1-5. Pre-mortem run by a different model on a fresh context beats pre-mortem run by the proposer on their own context. Same for Red/Blue, Steel Man, Murphyjitsu.

## Devil's Advocate Role

When assigned as devil's advocate:

### Do

- Attack the strongest parts, not just the weak ones
- Propose specific, realistic failure scenarios
- Maintain the role even when you personally agree
- Document all challenges raised

### Don't

- Be negative without being constructive
- Attack people instead of ideas
- Give up if your first objection is answered
- Sandbag (hold back real concerns)

### Signaling Devil's Advocate Mode

```markdown
**Devil's Advocate Challenge**:
[Playing devil's advocate — this isn't necessarily my view]

1. [Challenge 1]
2. [Challenge 2]
3. [Challenge 3]

**Most serious concern**: [Which one keeps me up at night]
```

## Review Deliverables

Every adversarial review should produce:

### Status Decision

| Status             | Meaning                    | Action                    |
| ------------------ | -------------------------- | ------------------------- |
| 🟢 **Approved**    | Passed review, proceed     | Document any observations |
| 🟡 **Conditional** | Proceed if [conditions]    | List required changes     |
| 🔴 **Blocked**     | Cannot proceed until fixed | List blocking issues      |

### Challenge Register

| #   | Challenge   | Severity | Response        | Resolved? |
| --- | ----------- | -------- | --------------- | --------- |
| 1   | [Objection] | H/M/L    | [How addressed] | ✅/❌     |

## Anti-Patterns

| Pattern                        | Problem                      | Fix                              |
| ------------------------------ | ---------------------------- | -------------------------------- |
| Token devil's advocate         | Going through motions        | Genuinely try to break it        |
| Adversarial ≠ hostile          | Destructive criticism        | Structured, respectful challenge |
| Ignoring raised concerns       | Wasted review                | Track and respond to all         |
| Only reviewing when convenient | Skipping when rushed         | High-stakes = mandatory review   |
| Defensive response             | Treating challenge as attack | "Thank you, let me address that" |

## Would Revise If

- Adversarial review consistently fails to surface real weaknesses (protocol is decorative)
- The protocol creates analysis paralysis that blocks shipping more than it prevents defects
- A lighter-weight challenge method achieves equivalent defect-detection at lower cost
- The OOB `rubber-duck` or `general-purpose` CLI agents materially change shape (rename, retirement, model-override syntax change) — refresh the routing table
