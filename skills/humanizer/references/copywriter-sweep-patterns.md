# Copywriter Mode — sweep pattern seed list

Phase 1 input for the three-phase review described in `SKILL.md`. Copy this into a project as a
starting point, then grow it: every fixed phrase harvested from a Phase 2 semantic read joins the
project's own copy permanently.

## How to run it

Match **multi-line**. This is not optional. Hard-wrapped files split phrases across line breaks,
so `crown a winner` becomes `crown a\nwinner` and a single-line scan reports "no matches" — a
false negative indistinguishable from clean copy. Allow `\s+` wherever a space appears in a
multi-word phrase.

Wrapping is often inconsistent within one corpus, which makes the failure worse: a single-line
tool appears to work on most files and quietly misses the wrapped ones. Confirm the match mode is
working by verifying one known hit before trusting any "no matches" result.

Phase 1 output is a **candidate list, not findings**. Every candidate must be explicitly accepted
or rejected during Phase 2.

## Seed families

Business and strategy idiom:

`double down` · `table stakes` · `land grab` · `arms race` · `the race is on` · `make or break` ·
`uphill battle` · `level playing field` · `moving the needle` · `punch above` · `head start` ·
`leapfrog` · `playbook` · `endgame` · `long game` · `low-hanging fruit` · `boil the ocean` ·
`in the weeds` · `at the end of the day` · `the jury is out` · `writing on the wall` ·
`tip of the iceberg` · `north star` · `crown a winner` · `race to the bottom` · `zero-sum`

Technical and product idiom:

`under the hood` · `out of the box` · `off the shelf` · `front and center` · `plug and play` ·
`bake in` · `baked in` · `ship it` · `dogfood` · `bleeding edge` · `heavy lifting` ·
`spin up` · `stand up` (as in provision) · `land and expand`

Sporting, military, and card-game metaphor (high national-specificity):

`league table` · `clear the bar` · `raise the bar` · `move the goalposts` · `own goal` ·
`slam dunk` · `home run` · `curveball` · `full court press` · `first base` · `ballpark` ·
`show your hand` · `ace up the sleeve` · `all in` · `double or nothing` · `brinkmanship` ·
`scorched earth` · `beachhead` · `war chest` · `rearguard`

Formal or literary register in otherwise plain prose:

`need not` · `ought not` · `shall` (outside legal text) · `hitherto` · `heretofore` ·
`notwithstanding` · `insofar as` · `albeit` · `whilst` · `amongst`

Ambiguity candidates — ordinary words with a common second sense:

`live` · `bandwidth` · `running` · `surface` (as verb) · `sound` (as adjective) · `concrete` ·
`novel` · `subject` · `present` · `object` · `address` · `table` (as verb: US and UK senses are
opposite) · `quite` (US intensifier vs UK diminisher) · `momentarily`

Construction and typography:

`\w--\w` (glued double hyphen) · ` - ` (spaced hyphen standing in for a dash) · `->` (ASCII arrow)
· `,\s*however\s*,` mid-sentence · stacked parentheticals · a colon-joined elliptical clause
(`It does:`, `It is:`)

## Harvested — AI Wars of 2026, 2026-09-03

Added after semantic passes found these with no matchable pattern. They are cheap to catch now:

| Phrase | Tag | Note |
| --- | --- | --- |
| `software estate` / `agent estates` | `[ambiguity]` | British-IT sense of *estate*; reads first as property or inheritance |
| `below the line` | `[idiom]` | Unglossed exclusion idiom; worst inside a glossary definition |
| `distribution play` / `the play` | `[idiom]` | *Play* as a strategic-move noun |
| `crown a company` / `crown a champion` | `[idiom]` | Determiner variants an exact-phrase scan for `crown a winner` misses |
| `clear that bar` | `[idiom]` | Determiner variant of `clear the bar` |
| `live hypotheses` / `live explanations` / `live options` | `[ambiguity]` | *Live* as active-or-in-contention; collocation only, never the bare word |
| `talk past each other` | `[idiom]` | Fail to engage with each other's meaning; opaque read literally |
| `plays out` / `play out` | `[register]` | Conversational phrasal verb inside formal prose |
| `manufacture overnight` | `[idiom]` | Low risk; usually keep |
| `proving ground` | `[idiom]` | Low risk; usually keep |
| `prove hollow` | `[idiom]` | Low risk; usually keep |
| `where work gets done` | `[idiom]` | Low risk; usually keep |
| `go nowhere` / `push back` | `[idiom]` | Low risk in casual or social copy; usually keep |

Recording low-risk keeps matters as much as recording changes. It stops the next reviewer from
re-litigating a decision that was already made deliberately.

Two entries above — `crown a company` and `clear that bar` — are **determiner variants** of
patterns already in the seed families. Exact-phrase scans miss them. When harvesting, add the
variant rather than assuming the base phrase covers it.

## The limit of harvesting

Harvesting converts a **specific discovered phrase** into a free future catch. It does not convert
the **class**.

The three highest-value findings in the AI Wars review were *estate*, *play*, and *bar* — ordinary
words carrying a second sense. Adding bare `play` or `bar` to a pattern list produces hundreds of
false positives and is worse than useless; only the specific collocation is listable, and only
after a human or semantic reader has already found it.

So the semantic pass never becomes unnecessary. On a stable corpus it simply has less left to
find, which is exactly the compounding return the three-phase design is built to produce.
