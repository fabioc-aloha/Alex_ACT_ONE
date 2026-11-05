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

**Source status:** The current Wikipedia guide classifies this as a historical
indicator associated with 2023–2025 output. Promotion can be appropriate in
marketing copy; revise it only when it harms accuracy, genre, or the intended
voice, not as evidence of AI authorship.

**Words to watch:** boasts a, vibrant, rich (figurative), profound, enhancing its, showcasing, exemplifies, commitment to, natural beauty, nestled, in the heart of, groundbreaking (figurative), renowned, breathtaking, must-visit, stunning

**Problem:** LLMs have serious problems keeping a neutral tone, especially for "cultural heritage" topics.

**Before:**

> Nestled within the breathtaking region of Gonder in Ethiopia, Alamata Raya Kobo stands as a vibrant town with a rich cultural heritage and stunning natural beauty.

**After:**

> Alamata Raya Kobo is a town in the Gonder region of Ethiopia, known for its weekly market and 18th-century church.

### 5. Vague Attributions and Weasel Words

**Words to watch:** Industry reports, Observers have cited, Experts argue, Some critics argue, several sources/publications (when few are cited), widely interpreted or researchers agree (when the cited evidence is narrower)

**Problem:** AI chatbots attribute opinions to vague authorities without specific sources, or present one or two sources as a broad consensus.

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

### Supplemental pattern: Vague Expressions of Connection or Association

**Words to watch:** in connection with/to, connected with/to, in association with, associated with

**Problem:** These phrases can obscure what the relationship actually is, especially when a writer could name a documented role, action, membership, or direct link instead.

**Before:**

> The group was associated with local education initiatives: its 2024 report says it funded an adult-literacy program and a school-library project.

**After:**

> The group funded an adult-literacy program and a school-library project, according to its 2024 report.

Treat these as cues, not banned phrases. "Associated with" may be the most accurate wording when the source itself establishes only a broad or uncertain relationship. Do not invent a more specific connection.

### Supplemental pattern: Unfilled Templates and Placeholders

**Signs to watch:** bracketed fill-in instructions, `{name}`-style fields, `YYYY-XX-XX` dates, or instructions to paste a URL or source

**Problem:** A draft may retain a template prompt or placeholder that should have been completed, removed, or presented as an intentional template.

**Before:**

> The team plans to launch in [month] and will offer [describe the feature].

**After:**

> Fill those fields from the approved brief; if it does not specify them, remove or qualify the claim.

Check the document's purpose first. Placeholders are appropriate in templates and examples; do not replace them with invented details.

### Final-output scaffolding

When auditing or rewriting AI-tell prose, check for unintended model-internal citation fragments (for example, `contentReference` or `turn0search0`), unfilled instructions to add a source or link, and pasted chatbot refusal text such as "As an AI language model". These are cleanup targets when they leak into a deliverable, not authorship tests. In an audit, quote the artifact and ask the author to verify the source or remove the fragment; in a rewrite, repair it only from an approved source. Do not invent a citation or fact. Literal code, documentation about these tokens, quotations, and intentionally blank templates are not findings. Checking whether a citation actually supports a claim is a separate fact-check.

**Source-scope note:** Wikipedia's current guide also flags formulaic headings such as "Awards and recognition." This is an encyclopedic-structure cue, not a general prose rule; use it only when the genre and surrounding text make the pattern relevant.

The guide also discusses overemphasis on identification by primary or tertiary
sources and Wikipedia list titles treated as proper names. These are
genre-specific editorial cues, not reasons to remove legitimate attribution or
rename a topic in general-purpose prose. Verify factual support separately.

## LANGUAGE AND GRAMMAR PATTERNS

### 7. Overused "AI Vocabulary" Words

**High-frequency AI words:** Actually, additionally, align with, crucial, delve, emphasizing, enduring, enhance, fostering, garner, highlight (verb), interplay, intricate/intricacies, key (adjective), landscape (abstract noun), load-bearing, pivotal, showcase, tapestry (abstract noun), testament, underscore (verb), valuable, vibrant

**Problem:** These words appear far more frequently in post-2023 text. They often co-occur.

**Nuance on "load-bearing":** legitimate as canonical vocabulary in ACT-derived work, where it means "a claim that if wrong would break the argument" (analogous to a load-bearing wall). It becomes an AI-tell in three cases: used as a synonym for "important / key / central / vital" where those simpler words would do, repeated ≥3 times within a single document, or applied to soft nouns (a load-bearing feeling, a load-bearing moment). Heuristic: if "important" or "central" substitutes without loss, it was decorative. Count the repetitions before applying the ≥3 threshold; do not estimate them while reading: `grep -oi 'load-bearing' <file> | wc -l` prints the occurrence count.

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

**Problem:** Older LLM text sometimes varies terms to avoid repetition, which can make references hard to follow. Wikipedia now treats this as a historical indicator, not a reliable signature of current models. Do not flag ordinary variation.

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

**Problem:** Earlier LLM text often overused em dashes (—), but Wikipedia's current guide treats this as a historical indicator. A dash alone is not a finding. Revise only when the punctuation hurts clarity or conflicts with the intended style.

> **Note:** Alex ACT bans em-dashes in shipped prose outright. This pattern is relevant when humanizing _third-party_ text that already contains em-dashes, or when reviewing why heir-authored prose felt AI-flavored before the rule was internalized.

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

**Scope:** The Wikipedia guide notes that some chatbots use curly quotation marks, but also cautions that curly quotes are common in human-written, professionally typeset work. Neither curly quotes nor mixed quote styles establish authorship. Change them only when the destination's typography rules require it.

**Before (for a publication that requires straight quotes):**

> The button reads “Save changes.”

**After:**

> The button reads "Save changes."

## COMMUNICATION PATTERNS

### 20. Collaborative Communication Artifacts

**Words to watch:** I hope this helps, Of course!, Certainly!, You're absolutely right!, Would you like..., let me know, here is a...

**Problem:** Text meant as chatbot correspondence gets pasted as content.

**Before:**

> Here is an overview of the French Revolution. I hope this helps! Let me know if you'd like me to expand on any section.

**After:**

> The French Revolution began in 1789 when financial crisis and food shortages led to widespread unrest.

### 21. Knowledge-Cutoff and Source-Limit Disclaimers

**Words to watch:** as of [date], Up to my last training update, While specific details are limited/scarce..., not widely documented in available sources, based on available information, and claims that a source should be treated as X rather than Y

**Problem:** Stock knowledge-cutoff disclaimers are a historical cue. A current concern is an unsupported claim that information is unavailable, followed by speculation about what it "likely" means. A genuine limit in the evidence is not itself a tell; state it plainly and do not fill the gap with a guess.

**Before:**

> The supplied handbook does not give a publication date. It was probably released around 2002 because the formatting looks old.

**After:**

> The supplied handbook does not state its publication date.

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

### 26. Hyphenated Compounds (Not an AI-Tell)

**Scope:** This upstream catalog item is not a pattern in Wikipedia's current guide. Consistent hyphenation is not evidence of AI authorship. Follow the destination's style guide and preserve hyphens when they clarify a compound modifier.

**Before (when the compound modifies a noun):**

> The team delivered a high quality report.

**After:**

> The team delivered a high-quality report.

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
