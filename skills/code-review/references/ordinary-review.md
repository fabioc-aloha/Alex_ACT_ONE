# Code Review Skill

> Good reviews catch bugs. Great reviews teach the author something.

## Review Priority (What Matters Most)

1. **Correctness** — Does it do what it's supposed to?
2. **Security** — Can it be exploited?
3. **Maintainability** — Will the next person understand this?
4. **Performance** — Will it scale?
5. **Style** — Is it consistent? (ideally enforced by linters, not humans)

## 3-Pass Review

| Pass | Focus | What You're Looking For | Time |
| ---- | ----- | ----------------------- | ---- |
| 1. Orientation | Big picture | Does the approach make sense? Is the scope right? Over-engineered? | 2-3 min |
| 2. Logic | Deep read | Edge cases, null handling, error paths, concurrency, off-by-one | 10-15 min |
| 3. Polish | Surface | Naming, duplication, test coverage, docs | 3-5 min |

**Pass 1 shortcut**: Read the PR description and test names first. They reveal intent faster than code.

## Comment Prefixes

| Prefix | Meaning | Author Response |
| ------ | ------- | --------------- |
| `[blocking]` | Must fix before merge | Fix it |
| `[suggestion]` | Better approach exists | Consider it, explain if declining |
| `[question]` | I don't understand | Clarify (in code, not just in reply) |
| `[nit]` | Trivial style issue | Fix if easy, skip if not |
| `[praise]` | This is well done | Appreciate it |

### Good vs Bad Comment Examples

| Bad | Why | Good |
| --- | --- | ---- |
| "This is confusing" | Vague, unhelpful | "[suggestion] This nested ternary is hard to follow. Consider extracting to a named function like `isEligibleForDiscount()`." |
| "Fix this" | No context | "[blocking] This accepts user input without sanitization. Use `escapeHtml()` before rendering." |
| "Why?" | Sounds hostile | "[question] What's the motivation for the custom sort here vs `Array.sort()`? Is there a performance concern?" |
| "LGTM" (on 500-line PR) | Rubber stamp | "Pass 1: Approach looks right. Pass 2 comments below. Pass 3: naming is clean." |

### Reviewer and Author Posture

Most review friction is posture, not substance. Both sides carry an obligation:

| Reviewer | Author |
| --- | --- |
| Assume positive intent | Be open to feedback |
| Ask questions, don't demand | Explain your reasoning |
| Focus on the code, not the person | Don't take feedback personally |
| Offer alternatives, not just criticism | Acknowledge good suggestions |

A review exists to catch bugs before users do, raise code quality through collaboration, spread knowledge across the team, keep patterns consistent, and leave a written record of why a decision was made. If a comment serves none of those, it is noise.

## Review Checklist

### Security

- [ ] No secrets, tokens, or API keys in code
- [ ] User input validated/sanitized before use
- [ ] Auth checks on protected endpoints
- [ ] No SQL/command injection vectors
- [ ] Sensitive data not logged

### Logic

- [ ] Edge cases handled (empty input, null, boundary values)
- [ ] Error paths return meaningful messages
- [ ] Async operations have timeout/cancellation
- [ ] State changes are atomic (no partial updates)
- [ ] All new branches have test coverage

### Quality

- [ ] Tests cover the *changed behavior*, not just the changed lines
- [ ] No debug code (console.log, TODO-hacks)
- [ ] Public API changes documented
- [ ] Backward compatibility considered
- [ ] **Every export is called by production** — grep the consumer code for each exported symbol; an exported function tested by unit tests but never called by production is dead weight that lies about what the system does (often surfaces "the feature is promised in CHANGELOG but never wired"). If the test suite passes but production doesn't import the function, either wire it in or remove it.
- [ ] **Filter-style guards have test data that exercises them** — a `filter(x => x !== 'local')` on a list with zero `local` entries is unverified; for mutation-testing coverage seed the input. See [mutation-testing](../../mutation-testing/SKILL.md).

### Architecture

- [ ] Change is in the right layer (not business logic in the controller)
- [ ] New dependencies justified
- [ ] No unnecessary coupling introduced

## Anti-Patterns

| Anti-Pattern | What Happens | Instead |
| ------------ | ------------ | ------- |
| Rubber-stamp | Bugs ship | Actually read Pass 1-3 |
| Bikeshedding | Hours on naming, ignore logic bugs | Spend 80% on Pass 2 |
| Gatekeeping | Reviewees dread PRs | Teach, don't block |
| Week-long queue | PRs go stale, conflicts pile up | Review within 4 hours, merge within 24 |
| Style wars | Team friction | Automate style (ESLint, Prettier, etc.) |
| Everything-is-blocking | Author overwhelmed | Use prefix system honestly |
