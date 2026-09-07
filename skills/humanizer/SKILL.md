---
name: humanizer
description: Use when the user wants to humanize, de-AI, de-slop, or un-ChatGPT a piece of text — strip AI-isms and add real voice — or wants a copywriter pass that reviews existing copy for a named audience (e.g., non-native English readers) using an idiom/tone/register/ambiguity/grammar taxonomy and an approval-gated before/after table workflow. Scans for 29 documented AI-writing patterns (Wikipedia's "Signs of AI writing") and produces a draft → self-audit → final rewrite. Optional voice-calibration from a user-provided writing sample. Adapted from Hermes Agent / blader/humanizer.
lastReviewed: 2026-09-03
---

# Humanizer: AI-Tell Removal and Audience Copy Review

Two modes for two different problems. **AI-tell removal** identifies and strips signs of AI-generated text to make writing sound natural and human, based on Wikipedia's "Signs of AI writing" guide (maintained by WikiProject AI Cleanup), derived from observations of thousands of AI-generated text instances. **Copywriter Mode** reviews existing, human-written copy for how well it lands with a specific named audience — the source text may contain no AI tells at all.

**Key insight:** LLMs use statistical algorithms to guess what should come next. The result tends toward the most statistically likely completion, which is how the telltale patterns below get baked in.

## When to use this skill

Load this skill whenever the user asks to:

- "humanize", "de-AI", "de-slop", or "un-ChatGPT" a piece of text
- rewrite something so it doesn't sound like it was written by an LLM
- edit a draft (blog post, essay, PR description, docs, memo, email, tweet, resume bullet) to sound more natural
- match their voice in writing they're producing
- review text for AI tells before publishing
- review or write copy for a **named audience** (e.g., non-native English professional readers, executives, external customers) — use **Copywriter Mode** below instead of the AI-tell patterns; the source text may already be entirely human-written

Also apply this skill to **your own** output when writing user-facing prose — release notes, PR descriptions, documentation, long-form explanations, summaries. If your project ships a prose-authoring worker agent with a banned-vocabulary filter (for example, Steward's `markdown-author` or the illustrator plugin's), the always-on filter strips the worst tells; humanizer is the deeper on-demand pass that catches what slips through when the user explicitly cares about voice quality.

**Composes with — not replaces — other prose disciplines:**

- A prose-authoring worker agent (like `markdown-author` in projects that ship one) typically carries a short banned-vocabulary filter (`delve`, `myriad`, `tapestry`, `seamlessly`, `leverage`, etc.) and a quick audit that fires on every markdown task. Humanizer is the **deeper, on-demand pass** — 29 patterns with before/after examples, voice calibration, and an iterative draft-audit-final loop.
- Some project brains ban em-dashes outright in shipped prose (Alex ACT itself does, per Steward's Cardinal Rule 2). Humanizer Pattern 14 documents the _reason_ (em-dash overuse is a well-known AI tell), useful when humanizing third-party text that already contains them.

## How to apply it

The text usually arrives one of three ways:

1. **Inline** — user pastes the text directly into the message. Work on it in-place, reply with the rewrite.
2. **File** — user points at a file. Read it with the workspace read tool, then apply edits with the workspace edit tool. For markdown docs in a repo, a targeted patch per section is cleaner than rewriting the whole file.
3. **Voice calibration sample** — user provides an additional sample of their own writing (inline or by file path) and asks you to match it. Read the sample first, then rewrite. See the Voice Calibration section below.

Always show the rewrite to the user. For file edits, show a diff or the changed section — don't silently overwrite.

## Your task

When given text to humanize:

1. **Identify AI patterns** — scan for the 29 patterns listed below.
2. **Rewrite problematic sections** — replace AI-isms with natural alternatives.
3. **Preserve meaning** — keep the core message intact.
4. **Maintain voice** — match the intended tone (formal, casual, technical, etc.). If a voice sample was provided, match it specifically.
5. **Add soul** — don't just remove bad patterns, inject actual personality. See PERSONALITY AND SOUL below.
6. **Do a final anti-AI pass** — ask yourself: "What makes the below so obviously AI generated?" Answer briefly with any remaining tells, then revise one more time.

## Voice Calibration (optional)

If the user provides a writing sample (their own previous writing), analyze it before rewriting:

1. **Read the sample first.** Note:
   - Sentence length patterns (short and punchy? Long and flowing? Mixed?)
   - Word choice level (casual? academic? somewhere between?)
   - How they start paragraphs (jump right in? Set context first?)
   - Punctuation habits (lots of dashes? Parenthetical asides? Semicolons?)
   - Any recurring phrases or verbal tics
   - How they handle transitions (explicit connectors? Just start the next point?)

2. **Match their voice in the rewrite.** Don't just remove AI patterns — replace them with patterns from the sample. If they write short sentences, don't produce long ones. If they use "stuff" and "things," don't upgrade to "elements" and "components."

3. **When no sample is provided,** fall back to the default behavior (natural, varied, opinionated voice from the PERSONALITY AND SOUL section below).

### How to provide a sample

- Inline: "Humanize this text. Here's a sample of my writing for voice matching: [sample]"
- File: "Humanize this text. Use my writing style from [file path] as a reference."

## Copywriter Mode: Audience-Aware Language Review

Distinct from AI-tell removal above: this mode reviews **existing, human-written** copy for how
well it lands with a **specific named audience** — most often non-native English professional
readers, but also executives, external customers, or any audience with different assumptions than
the author's. Use it when the user asks to review a site, document, or deck "for [audience]," or
wants a copywriter's pass rather than a de-AI pass. The source text does not need to show any AI
tells at all; a fully human-written page can still land wrong for a reader it wasn't written for.

The `audience-copy-review` instruction fires this mode automatically for user-facing and
customer-facing artifacts, including your own output. It is not limited to explicit user requests.

### Scope: don't confuse literacy gaps with language nuance

Confirm what's actually in scope before producing findings. Two different problems get conflated
by default:

- **Domain literacy** (acronyms, internal terminology, jargon the audience already knows from
  working in the field) — usually **out of scope**. Flagging every acronym on a page written by
  and for domain experts creates noise the user will immediately reject.
- **Language nuance** (idiom, tone, register, ambiguity, grammar) — the actual target. This is
  copy that would be understood differently, or not at all, by a careful reader in a professional
  but non-native-English context, regardless of how well they know the subject matter.

If unsure which applies, ask once, early, before producing findings — don't assume
acronym-expansion is wanted by default; a domain-expert audience usually doesn't need it.

### The five-tag taxonomy

Tag every finding with exactly one of these, so the _kind_ of concern is explicit, not just the
fix:

| Tag | Meaning |
| --- | --- |
| `[idiom]` | A figurative phrase that does not mean its literal words ("pick two," "hold the line," "in flight"). |
| `[tone]` | Wording that reads more blunt, combative, or slogan-like than the underlying fact warrants. |
| `[register]` | Casual or conversational wording sitting next to formal language in the same passage. |
| `[ambiguity]` | A word or phrase with a plausible second meaning that isn't the intended one ("bandwidth," "running," "one room"). |
| `[grammar]` | A sentence whose construction — not its vocabulary — could slow a careful reader down (a clipped dash standing in for a missing clause, an unusual verb formation). |

### Workflow: hero first, approval-gated, one page at a time

1. **Scope the review.** Confirm the audience, confirm domain literacy is out of scope (see
   above), and **enumerate the reader-facing surfaces explicitly** — not just "the site." Chapter
   subtitles, diagram labels, `alt` text, meta descriptions, and card captions often live in JSON
   or front matter that looks like structured data. A reviewer told to review "the prose" will
   apply a sensible-looking scope rule and exclude them. In a controlled run, that exact
   exclusion hid three of four occurrences of a title-level idiom.
2. **Read before touching anything.** A full read-only pass across the whole scope, tagging every
   finding, is cheaper and more defensible than piecemeal edits — do this even if changes will be
   approved incrementally. On a corpus too large to read in one pass, use the three-phase review
   below.
3. **Present the hero first.** For any page, review title, subtitle/tagline, and lede as a
   **before/after table** before the rest of the page. These carry the most weight and the highest
   visibility (page `<title>`, meta description, H1) — get them right, and get explicit sign-off,
   before touching supporting content.
4. **One approval per table.** Never apply a finding the user hasn't explicitly approved. A table
   with unapproved rows is a proposal, not a change.
5. **Recurring phrases are a single decision, not N decisions.** If a phrase repeats across many
   pages (a tagline, a slogan, a piece of established brand voice), surface it once, name where
   else it recurs, and ask whether fixing it everywhere would meaningfully change the voice — then
   apply the same decision consistently. Don't silently fix only the first occurrence and leave
   the rest inconsistent.
6. **Verify before calling it done.** After applying an approved change, re-render or re-read the
   actual output (not just the diff) to confirm it landed as intended.
7. **Move to the next scope only after the current one is fully resolved.** Finish one
   page/section end-to-end before starting the next — partial coverage across many pages is
   harder to track than full coverage of one.

### The three-phase review: sweep, close read, harvest

For a corpus larger than a few pages, run both phases. They are not redundant, and the second does
not replace the first.

**Why both.** A controlled comparison on a 35-file web-book ran three independent reviews over
identical content, same audience, same taxonomy: a mechanical sweep, a blind close read, and a
blind three-phase run. Twenty-three distinct findings; **only two were found by all three**. The
first gap is not coverage — the reviewers read the same files. It is **threshold**:

| | Mechanical sweep | Close read |
| --- | --- | --- |
| Threshold | None — reports every hit | High — judgment skips marginal cases |
| Ceiling | The pattern list | What is actually on the page |
| Catches | Known fixed phrases, typography, formal register | Ordinary words carrying a second sense, compressed constructions, cultural references |
| Misses | Anything not on the list | Marginal items a reader judges tolerable |
| Cost | Minutes | Hours |

The sweep caught `need not` and an `[ambiguity]` on _live_ that a close read passed over as
tolerable. The close read caught _software estate_, _below the line_, and _distribution play_ —
none of them idioms, all ordinary words carrying a second sense, none matchable by any list. The
methods fail in opposite directions, which is why either alone leaves most findings unfound.

**Phase 1 — mechanical sweep.** Scan the corpus for known idiom families, formal-register
constructions, ambiguity candidates, and dash/arrow typography. A seed list is in
[`references/copywriter-sweep-patterns.md`](references/copywriter-sweep-patterns.md).

Match **multi-line**. Hard-wrapped files split phrases across line breaks, so `crown a winner`
becomes `crown a\nwinner` and a single-line scan returns "no matches" — a false negative that
looks exactly like clean copy. Wrapping is often inconsistent within one corpus, so a single-line
tool appears to work on most files while silently missing the wrapped ones.

Prove the match mode before trusting an empty result. The cheapest proof is a **control scan**:
run the same patterns single-line and multi-line, and compare the counts. If multi-line returns
more, the difference is exactly what a single-line tool would have missed. In one run the counts
were 4 and 5, and the extra hit was a phrase wrapped across two lines on the landing page.

Phase 1 output is a **candidate list, not findings**. Candidates are rejected during Phase 2 as a
normal outcome, not a failure. The rejection rate is a health signal: **zero rejections means the
list is too narrow** to be doing real work, and **near-total rejection means it is too noisy** to
be worth running. A quarter rejected is a working list.

**Phase 2 — close read.** Read every sentence and judge comprehension. Do not work down the Phase
1 list; read the prose. For each passage: does every phrase mean its literal words, and is any
figurative sense recoverable from context? Could a sentence be parsed a second way? Does the
register hold? Does the construction force a re-read? Does any reference assume a national
background? Resolve every Phase 1 candidate explicitly — accept it as a finding or record why it
was rejected.

**Mark each finding with its origin** — surfaced by the sweep, or found only by reading. Without
that, the workflow cannot be audited and the rejection rate cannot be read.

If the corpus is large, delegate Phase 2 to a subagent per section with the audience, the scope
exclusion, and the taxonomy restated in full. A reviewer who has already seen the findings cannot
produce an independent read, so on a high-stakes corpus run Phase 2 blind — without access to the
Phase 1 output — and merge afterwards. That costs a merge step and buys genuine independence.

**A close read is one sample, not a census.** Phase 2 is executed by a language model, and model
sampling is stochastic: the same brief over the same corpus produces different findings on
different runs. This is a property of the instrument, not a failure of the reviewer, and it should
be designed around rather than discovered.

In the comparison behind this workflow, two separate close reads of one corpus each missed the
other's two highest-ranked findings, and both reported the corpus as being in good shape. Treat
that as the expected shape of a single pass. Do not read one clean report as coverage.

Two caveats on that number, because the run was not a controlled one. The second read used a
different brief from the first, so method difference, brief difference, and sampling noise are
confounded and cannot be separated from that data. It was also a single corpus. The finding is
therefore directional — a single pass under-covers — not a measured rate.

So on high-stakes copy — a landing page, a launch announcement, a title, anything expensive to get
wrong in public — **run the close read more than once and union the results**:

1. Use an **identical brief** each run. Varying the brief measures the brief, not the corpus.
2. Run each pass **blind** to the others' findings. A reviewer who has seen prior output will
   converge on it, which manufactures agreement rather than testing it.
3. **Union the findings.** A finding that appears in one run is not weaker for being single-source
   unless another run explicitly considered and rejected it. Silence is not rejection.
4. Use **agreement count as a confidence tier**, not as a filter. Found by every run: high
   confidence, act first. Found once: still real, needs a judgement call. In the comparison, the
   highest-value finding of the whole exercise appeared in exactly one run.
5. Where runs **disagree on a recommendation** rather than on existence, a further run arbitrates.
   In the comparison a third pass dropped one over-flagged finding and confirmed one that a single
   pass had missed.

Elsewhere, one pass plus the sweep is the right cost. Ensembling is cheap relative to publishing
copy that misleads a reader, and it is the correct response to a stochastic instrument.

**Phase 3 — harvest.** Every fixed phrase Phase 2 found that Phase 1 missed joins the project's
pattern list. It moves permanently from expensive detection to free. Record low-risk keeps too, so
the next reviewer does not re-litigate a settled decision.

The economics only work on the second pass and after. The first run costs more than either method
alone. What repays it is that a living corpus is re-reviewed: subsequent runs sweep the whole
corpus mechanically against a list that keeps growing, and close-read only what changed since the
last pass.

**What harvesting cannot do.** It converts a discovered phrase into a free future catch. It does
not convert the class. _Estate_, _play_, and _bar_ are ordinary words — adding them bare to a
pattern list produces hundreds of false positives. Only the specific collocation is listable, and
only after a reader has already found it. The close read never becomes unnecessary; on a stable
corpus it simply has less left to find.

### Before/after table format

```markdown
| Element | Current | Proposed | Why |
| --- | --- | --- | --- |
| Claim (tagline) | "Fast and nimble isn't free when it breaks someone else's work." | "Moving quickly has a cost when it breaks another team's work." | `[idiom]` "isn't free" is idiomatic and slightly elliptical for a non-native reader. |
```

One row per finding, one tag per row. If a single element (a lede, a paragraph) carries two
different concerns, split it into two rows scoped to the specific sentence or phrase rather than
stacking tags in one "Why" cell — a row carrying two tags can't be approved or rejected
independently, which breaks the approval gate. Keep "Why" short and specific — name the tag and
the concrete reason, not a vague "sounds unnatural."

### Composes with

- **Voice Calibration** (above) still applies: don't flatten every idiom into bland corporate
  phrasing. A phrase that is low-risk and clearly understood, even if figurative, may be worth
  keeping — that's a legitimate outcome of the review, not a failure to find something.
- **PERSONALITY AND SOUL** (below): Copywriter Mode's goal is comprehension, not sterility. A
  rewrite that removes an idiom but also removes all personality has overcorrected — flag that
  tension explicitly rather than defaulting to the blandest possible phrasing.
- [communication-craft](../communication-craft/SKILL.md): use that skill for audience-lead
  structure (So-What/What/Now-What, stakes-calibrated feedback voice); use Copywriter Mode for
  sentence-level language fit within an already-established structure.

A worked example (a fictional internal tool's homepage, reviewed for a non-native-English
engineering audience) is in
[`examples/copywriter-mode-example.md`](examples/copywriter-mode-example.md).

## PERSONALITY AND SOUL

Avoiding AI patterns is only half the job. Sterile, voiceless writing is just as obvious as slop. Good writing has a human behind it.

### Signs of soulless writing (even if technically "clean")

- Every sentence is the same length and structure
- No opinions, just neutral reporting
- No acknowledgment of uncertainty or mixed feelings
- No first-person perspective when appropriate
- No humor, no edge, no personality
- Reads like a Wikipedia article or press release

### How to add voice

**Have opinions.** Don't just report facts — react to them. "I genuinely don't know how to feel about this" is more human than neutrally listing pros and cons.

**Vary your rhythm.** Short punchy sentences. Then longer ones that take their time getting where they're going. Mix it up.

**Acknowledge complexity.** Real humans have mixed feelings. "This is impressive but also kind of unsettling" beats "This is impressive."

**Use "I" when it fits.** First person isn't unprofessional — it's honest. "I keep coming back to..." or "Here's what gets me..." signals a real person thinking.

**Let some mess in.** Perfect structure feels algorithmic. Tangents, asides, and half-formed thoughts are human.

**Be specific about feelings.** Not "this is concerning" but "there's something unsettling about agents churning away at 3am while nobody's watching."

### Before (clean but soulless)

> The experiment produced interesting results. The agents generated 3 million lines of code. Some developers were impressed while others were skeptical. The implications remain unclear.

### After (has a pulse)

> I genuinely don't know how to feel about this one. 3 million lines of code, generated while the humans presumably slept. Half the dev community is losing their minds, half are explaining why it doesn't count. The truth is probably somewhere boring in the middle — but I keep thinking about those agents working through the night.

## CONTENT PATTERNS

### 1. Undue Emphasis on Significance, Legacy, and Broader Trends

**Words to watch:** stands/serves as, is a testament/reminder, a vital/significant/crucial/pivotal/key role/moment, underscores/highlights its importance/significance, reflects broader, symbolizing its ongoing/enduring/lasting, contributing to the, setting the stage for, marking/shaping the, represents/marks a shift, key turning point, evolving landscape, focal point, indelible mark, deeply rooted

**Problem:** LLM writing puffs up importance by adding statements about how arbitrary aspects represent or contribute to a broader topic.

**Before:**

> The Statistical Institute of Catalonia was officially established in 1989, marking a pivotal moment in the evolution of regional statistics in Spain. This initiative was part of a broader movement across Spain to decentralize administrative functions and enhance regional governance.

**After:**

> The Statistical Institute of Catalonia was established in 1989 to collect and publish regional statistics independently from Spain's national statistics office.

### 2. Undue Emphasis on Notability and Media Coverage

**Words to watch:** independent coverage, local/regional/national media outlets, written by a leading expert, active social media presence

**Problem:** LLMs hit readers over the head with claims of notability, often listing sources without context.

**Before:**

> Her views have been cited in The New York Times, BBC, Financial Times, and The Hindu. She maintains an active social media presence with over 500,000 followers.

**After:**

> In a 2024 New York Times interview, she argued that AI regulation should focus on outcomes rather than methods.

### 3. Superficial Analyses with -ing Endings

**Words to watch:** highlighting/underscoring/emphasizing..., ensuring..., reflecting/symbolizing..., contributing to..., cultivating/fostering..., encompassing..., showcasing...

**Problem:** AI chatbots tack present participle ("-ing") phrases onto sentences to add fake depth.

**Before:**

> The temple's color palette of blue, green, and gold resonates with the region's natural beauty, symbolizing Texas bluebonnets, the Gulf of Mexico, and the diverse Texan landscapes, reflecting the community's deep connection to the land.

**After:**

> The temple uses blue, green, and gold colors. The architect said these were chosen to reference local bluebonnets and the Gulf coast.

### 4. Promotional and Advertisement-like Language

**Words to watch:** boasts a, vibrant, rich (figurative), profound, enhancing its, showcasing, exemplifies, commitment to, natural beauty, nestled, in the heart of, groundbreaking (figurative), renowned, breathtaking, must-visit, stunning

**Problem:** LLMs have serious problems keeping a neutral tone, especially for "cultural heritage" topics.

**Before:**

> Nestled within the breathtaking region of Gonder in Ethiopia, Alamata Raya Kobo stands as a vibrant town with a rich cultural heritage and stunning natural beauty.

**After:**

> Alamata Raya Kobo is a town in the Gonder region of Ethiopia, known for its weekly market and 18th-century church.

### 5. Vague Attributions and Weasel Words

**Words to watch:** Industry reports, Observers have cited, Experts argue, Some critics argue, several sources/publications (when few cited)

**Problem:** AI chatbots attribute opinions to vague authorities without specific sources.

**Before:**

> Due to its unique characteristics, the Haolai River is of interest to researchers and conservationists. Experts believe it plays a crucial role in the regional ecosystem.

**After:**

> The Haolai River supports several endemic fish species, according to a 2019 survey by the Chinese Academy of Sciences.

### 6. Outline-like "Challenges and Future Prospects" Sections

**Words to watch:** Despite its... faces several challenges..., Despite these challenges, Challenges and Legacy, Future Outlook

**Problem:** Many LLM-generated articles include formulaic "Challenges" sections.

**Before:**

> Despite its industrial prosperity, Korattur faces challenges typical of urban areas, including traffic congestion and water scarcity. Despite these challenges, with its strategic location and ongoing initiatives, Korattur continues to thrive as an integral part of Chennai's growth.

**After:**

> Traffic congestion increased after 2015 when three new IT parks opened. The municipal corporation began a stormwater drainage project in 2022 to address recurring floods.

## LANGUAGE AND GRAMMAR PATTERNS

### 7. Overused "AI Vocabulary" Words

**High-frequency AI words:** Actually, additionally, align with, crucial, delve, emphasizing, enduring, enhance, fostering, garner, highlight (verb), interplay, intricate/intricacies, key (adjective), landscape (abstract noun), load-bearing, pivotal, showcase, tapestry (abstract noun), testament, underscore (verb), valuable, vibrant

**Problem:** These words appear far more frequently in post-2023 text. They often co-occur.

**Nuance on "load-bearing":** legitimate as canonical vocabulary in ACT-derived work, where it means "a claim that if wrong would break the argument" (analogous to a load-bearing wall). It becomes an AI-tell in three cases: used as a synonym for "important / key / central / vital" where those simpler words would do, repeated ≥3 times within a single document, or applied to soft nouns (a load-bearing feeling, a load-bearing moment). Heuristic: if "important" or "central" substitutes without loss, it was decorative.

**Before:**

> Additionally, a distinctive feature of Somali cuisine is the incorporation of camel meat. An enduring testament to Italian colonial influence is the widespread adoption of pasta in the local culinary landscape, showcasing how these dishes have integrated into the traditional diet.

**After:**

> Somali cuisine also includes camel meat, which is considered a delicacy. Pasta dishes, introduced during Italian colonization, remain common, especially in the south.

### 8. Avoidance of "is"/"are" (Copula Avoidance)

**Words to watch:** serves as/stands as/marks/represents [a], boasts/features/offers [a]

**Problem:** LLMs substitute elaborate constructions for simple copulas.

**Before:**

> Gallery 825 serves as LAAA's exhibition space for contemporary art. The gallery features four separate spaces and boasts over 3,000 square feet.

**After:**

> Gallery 825 is LAAA's exhibition space for contemporary art. The gallery has four rooms totaling 3,000 square feet.

### 9. Negative Parallelisms and Tailing Negations

**Problem:** Constructions like "Not only...but..." or "It's not just about..., it's..." are overused. So are clipped tailing-negation fragments such as "no guessing" or "no wasted motion" tacked onto the end of a sentence instead of written as a real clause.

**Before:**

> It's not just about the beat riding under the vocals; it's part of the aggression and atmosphere. It's not merely a song, it's a statement.

**After:**

> The heavy beat adds to the aggressive tone.

**Before (tailing negation):**

> The options come from the selected item, no guessing.

**After:**

> The options come from the selected item without forcing the user to guess.

### 10. Rule of Three Overuse

**Problem:** LLMs force ideas into groups of three to appear comprehensive.

**Before:**

> The event features keynote sessions, panel discussions, and networking opportunities. Attendees can expect innovation, inspiration, and industry insights.

**After:**

> The event includes talks and panels. There's also time for informal networking between sessions.

### 11. Elegant Variation (Synonym Cycling)

**Problem:** AI has repetition-penalty code causing excessive synonym substitution.

**Before:**

> The protagonist faces many challenges. The main character must overcome obstacles. The central figure eventually triumphs. The hero returns home.

**After:**

> The protagonist faces many challenges but eventually triumphs and returns home.

### 12. False Ranges

**Problem:** LLMs use "from X to Y" constructions where X and Y aren't on a meaningful scale.

**Before:**

> Our journey through the universe has taken us from the singularity of the Big Bang to the grand cosmic web, from the birth and death of stars to the enigmatic dance of dark matter.

**After:**

> The book covers the Big Bang, star formation, and current theories about dark matter.

### 13. Passive Voice and Subjectless Fragments

**Problem:** LLMs often hide the actor or drop the subject entirely with lines like "No configuration file needed" or "The results are preserved automatically." Rewrite these when active voice makes the sentence clearer and more direct.

**Before:**

> No configuration file needed. The results are preserved automatically.

**After:**

> You do not need a configuration file. The system preserves the results automatically.

## STYLE PATTERNS

### 14. Em Dash Overuse

**Problem:** LLMs use em dashes (—) more than humans, mimicking "punchy" sales writing. In practice, most of these can be rewritten more cleanly with commas, periods, or parentheses.

> **Note for Edition heirs:** Cardinal Rule 2 in the heir brain bans em-dashes in shipped prose outright. This pattern is relevant when humanizing _third-party_ text that already contains em-dashes, or when reviewing why heir-authored prose felt AI-flavored before the rule was internalized.

**Before:**

> The term is primarily promoted by Dutch institutions—not by the people themselves. You don't say "Netherlands, Europe" as an address—yet this mislabeling continues—even in official documents.

**After:**

> The term is primarily promoted by Dutch institutions, not by the people themselves. You don't say "Netherlands, Europe" as an address, yet this mislabeling continues in official documents.

### 15. Overuse of Boldface

**Problem:** AI chatbots emphasize phrases in boldface mechanically.

**Before:**

> It blends **OKRs (Objectives and Key Results)**, **KPIs (Key Performance Indicators)**, and visual strategy tools such as the **Business Model Canvas (BMC)** and **Balanced Scorecard (BSC)**.

**After:**

> It blends OKRs, KPIs, and visual strategy tools like the Business Model Canvas and Balanced Scorecard.

### 16. Inline-Header Vertical Lists

**Problem:** AI outputs lists where items start with bolded headers followed by colons.

**Before:**

> - **User Experience:** The user experience has been significantly improved with a new interface.
> - **Performance:** Performance has been enhanced through optimized algorithms.
> - **Security:** Security has been strengthened with end-to-end encryption.

**After:**

> The update improves the interface, speeds up load times through optimized algorithms, and adds end-to-end encryption.

### 17. Title Case in Headings

**Problem:** AI chatbots capitalize all main words in headings.

**Before:**

> ## Strategic Negotiations And Global Partnerships

**After:**

> ## Strategic negotiations and global partnerships

### 18. Emojis

**Problem:** AI chatbots often decorate headings or bullet points with emojis.

**Before:**

> 🚀 **Launch Phase:** The product launches in Q3
> 💡 **Key Insight:** Users prefer simplicity
> ✅ **Next Steps:** Schedule follow-up meeting

**After:**

> The product launches in Q3. User research showed a preference for simplicity. Next step: schedule a follow-up meeting.

### 19. Curly Quotation Marks

**Problem:** ChatGPT uses curly quotes ("...") instead of straight quotes ("...").

**Before:**

> He said "the project is on track" but others disagreed.

**After:**

> He said "the project is on track" but others disagreed.

## COMMUNICATION PATTERNS

### 20. Collaborative Communication Artifacts

**Words to watch:** I hope this helps, Of course!, Certainly!, You're absolutely right!, Would you like..., let me know, here is a...

**Problem:** Text meant as chatbot correspondence gets pasted as content.

**Before:**

> Here is an overview of the French Revolution. I hope this helps! Let me know if you'd like me to expand on any section.

**After:**

> The French Revolution began in 1789 when financial crisis and food shortages led to widespread unrest.

### 21. Knowledge-Cutoff Disclaimers

**Words to watch:** as of [date], Up to my last training update, While specific details are limited/scarce..., based on available information...

**Problem:** AI disclaimers about incomplete information get left in text.

**Before:**

> While specific details about the company's founding are not extensively documented in readily available sources, it appears to have been established sometime in the 1990s.

**After:**

> The company was founded in 1994, according to its registration documents.

### 22. Sycophantic/Servile Tone

**Problem:** Overly positive, people-pleasing language.

**Before:**

> Great question! You're absolutely right that this is a complex topic. That's an excellent point about the economic factors.

**After:**

> The economic factors you mentioned are relevant here.

## FILLER AND HEDGING

### 23. Filler Phrases

**Before → After:**

- "In order to achieve this goal" → "To achieve this"
- "Due to the fact that it was raining" → "Because it was raining"
- "At this point in time" → "Now"
- "In the event that you need help" → "If you need help"
- "The system has the ability to process" → "The system can process"
- "It is important to note that the data shows" → "The data shows"

### 24. Excessive Hedging

**Problem:** Over-qualifying statements.

**Before:**

> It could potentially possibly be argued that the policy might have some effect on outcomes.

**After:**

> The policy may affect outcomes.

### 25. Generic Positive Conclusions

**Problem:** Vague upbeat endings.

**Before:**

> The future looks bright for the company. Exciting times lie ahead as they continue their journey toward excellence. This represents a major step in the right direction.

**After:**

> The company plans to open two more locations next year.

### 26. Hyphenated Word Pair Overuse

**Words to watch:** third-party, cross-functional, client-facing, data-driven, decision-making, well-known, high-quality, real-time, long-term, end-to-end

**Problem:** AI hyphenates common word pairs with perfect consistency. Humans rarely hyphenate these uniformly, and when they do, it's inconsistent. Less common or technical compound modifiers are fine to hyphenate.

**Before:**

> The cross-functional team delivered a high-quality, data-driven report on our client-facing tools. Their decision-making process was well-known for being thorough and detail-oriented.

**After:**

> The cross functional team delivered a high quality, data driven report on our client facing tools. Their decision making process was known for being thorough and detail oriented.

### 27. Persuasive Authority Tropes

**Phrases to watch:** The real question is, at its core, in reality, what really matters, fundamentally, the deeper issue, the heart of the matter

**Problem:** LLMs use these phrases to pretend they are cutting through noise to some deeper truth, when the sentence that follows usually just restates an ordinary point with extra ceremony.

**Before:**

> The real question is whether teams can adapt. At its core, what really matters is organizational readiness.

**After:**

> The question is whether teams can adapt. That mostly depends on whether the organization is ready to change its habits.

### 28. Signposting and Announcements

**Phrases to watch:** Let's dive in, let's explore, let's break this down, here's what you need to know, now let's look at, without further ado

**Problem:** LLMs announce what they are about to do instead of doing it. This meta-commentary slows the writing down and gives it a tutorial-script feel.

**Before:**

> Let's dive into how caching works in Next.js. Here's what you need to know.

**After:**

> Next.js caches data at multiple layers, including request memoization, the data cache, and the router cache.

### 29. Fragmented Headers

**Signs to watch:** A heading followed by a one-line paragraph that simply restates the heading before the real content begins.

**Problem:** LLMs often add a generic sentence after a heading as a rhetorical warm-up. It usually adds nothing and makes the prose feel padded.

**Before:**

```text
## Performance

Speed matters.

When users hit a slow page, they leave.
```

**After:**

```text
## Performance

When users hit a slow page, they leave.
```

---

## Process

**If Copywriter Mode was invoked** (audience-targeted review, see above), follow that workflow
instead of the steps below — it replaces the draft/self-audit loop with the before/after table
and approval gate.

1. Read the input text carefully (read the file with the workspace read tool if it's a file).
2. Identify all instances of the patterns above.
3. Rewrite each problematic section.
4. Ensure the revised text:
   - Sounds natural when read aloud
   - Varies sentence structure naturally
   - Uses specific details over vague claims
   - Maintains appropriate tone for context
   - Uses simple constructions (is/are/has) where appropriate
5. Present a draft humanized version.
6. Prompt yourself: "What makes the below so obviously AI generated?"
7. Answer briefly with the remaining tells (if any).
8. Prompt yourself: "Now make it not obviously AI generated."
9. Present the final version (revised after the audit).
10. If the text came from a file, apply the edit with the workspace edit tool (targeted patch preferred, full rewrite only when the entire file needs to change) and show the user what changed.

## Output Format

For AI-tell removal, provide:

1. Draft rewrite
2. "What makes the below so obviously AI generated?" (brief bullets)
3. Final rewrite
4. A brief summary of changes made (optional, if helpful)

For Copywriter Mode, provide the before/after table described above, scoped to the current page or
section, and stop for explicit approval before applying anything.

## Full Example

End-to-end demonstration of the draft → self-audit → final rewrite loop is in [`examples/full-example.md`](examples/full-example.md). Read it once on first invocation to see how all 29 patterns compound in a single piece of AI-flavored prose and how the iterative pass strips them out.

A Copywriter Mode worked example is in [`examples/copywriter-mode-example.md`](examples/copywriter-mode-example.md).

## Related

- Optional: a prose-authoring worker agent (`.github/agents/markdown-author.agent.md` in projects that ship one) — always-on prose worker with a banned-vocabulary filter and a quick audit; humanizer is the deeper on-demand pass when the user explicitly wants AI-tell removal
- [code-review](../code-review/SKILL.md) — post-write review skill; humanizer is post-write _prose_ cleanup with a different rubric
- [doc-hygiene](../doc-hygiene/SKILL.md) — anti-drift rules for living documents; humanizer is anti-AI-tells for any prose
- [meditation](../meditation/SKILL.md) — when a humanizer pass surfaces a recurring AI tell in your own output, that's the signal a discipline addition might be earned; route through meditation
- [communication-craft](../communication-craft/SKILL.md) — use for audience-lead _structure_ (So-What/What/Now-What, stakes-calibrated feedback voice); use Copywriter Mode above for sentence-level language _fit_ (idiom/tone/register/ambiguity/grammar) within an already-established structure — the two compose on the same document
- `audience-copy-review` instruction — the always-on gate that decides when Copywriter Mode fires without being asked
- Some project brains ban em-dashes outright in shipped prose (see for example Steward's Cardinal Rule 2 in `.github/copilot-instructions.md`); Pattern 14 above documents the underlying reason

## Would Revise If

- **Event-based**: zero observed invocations across the fleet within 90 days — sunset (skill is decorative on top of `markdown-author`'s always-on prose discipline). Sink to Mall rather than removing entirely so heirs who write a lot of public-facing prose can install on demand.
- **Date-based**: 2026-09-07 (90 days from adoption). If by then `humanizer` is invoked but consistently overrides heir voice in ways the heir reverts ≥3 times, the Voice Calibration section is failing — either tighten the calibration discipline or rebalance toward voice-preserving rewrites.
- **Counter-evidence**: if a heir reports that the 29-pattern catalog flags legitimate stylistic choices (e.g., humor that uses Rule of Three intentionally) as AI tells ≥3 times in a quarter, the patterns are too aggressive — add explicit "false positive" carve-outs.
- **Copywriter Mode, event-based**: if a heir reports Copywriter Mode flagging domain acronyms or jargon as findings ≥2 times despite the Scope section above, tighten the "confirm scope first" instruction — the mode is drifting back into acronym-expansion territory it was explicitly narrowed away from.
- **Copywriter Mode, counter-evidence**: if a heir reports the taxonomy tags being applied inconsistently (the same finding tagged differently across sessions) ≥3 times, the five-tag definitions need sharper examples, not more tags.
- **Copywriter Mode, counter-evidence**: if a heir reports the hero-first staging feels slower than a single full-page table on short pages, add an explicit "skip hero-first staging for pages under N words" exception rather than dropping the staged approach for every page.
- **Copywriter Mode, three-phase review**: if a project's harvested pattern list stops producing new Phase 1 catches across three consecutive reviews while Phase 2 keeps finding novel items, harvesting is not compounding as designed — the findings are ordinary-word second senses rather than fixed phrases, and the sweep should be scoped down to typography and register rather than grown.
- **Copywriter Mode, ensembling**: if repeated close reads over the same corpus with an identical brief converge on substantially the same findings across three separate corpora, sampling variance is smaller than assumed and the ensembling recommendation is over-engineering — drop back to a single pass plus the sweep. Conversely, if a controlled N-run trial shows the union still growing at five runs, the guidance understates how many passes high-stakes copy needs.

## Attribution

This skill is adapted from [Hermes Agent's port](https://github.com/NousResearch/hermes-agent) of [blader/humanizer](https://github.com/blader/humanizer) (MIT licensed), which is itself based on [Wikipedia: Signs of AI writing](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing), maintained by WikiProject AI Cleanup. The patterns documented there come from observations of thousands of instances of AI-generated text on Wikipedia.

Original author: Siqi Chen ([@blader](https://github.com/blader)). Source upstream: <https://github.com/blader/humanizer> (version 2.5.1). The 29 patterns, personality/soul section, and full worked example are preserved verbatim from the source. Adapted for Edition with neutral tool references (workspace read/edit) replacing Hermes-native tool names (`read_file`, `patch`, `write_file`), composition notes with `markdown-author` agent and Cardinal Rule 2, and ACT-shape frontmatter + `## Would Revise If` falsifier. Original MIT license preserved upstream. **Copywriter Mode** (the five-tag taxonomy, hero-first approval-gated workflow, and before/after table format) is an Alex ACT addition, not part of the upstream `blader/humanizer` port — derived from a real audience-language-review engagement, then genericized.

Key insight from Wikipedia: "LLMs use statistical algorithms to guess what should come next. The result tends toward the most statistically likely result that applies to the widest variety of cases."
