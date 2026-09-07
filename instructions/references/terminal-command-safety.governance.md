# Terminal Command Safety Governance

## Always-On Rationale

Terminal commands fire from any task regardless of file context (build, test, git, deployment, exploration). Safety rules — especially the Backtick Hazard — must apply before every `run_in_terminal` call. A pattern-scoped glob would silence the protection in the cases most likely to ship destructive failures.

## Falsifier — Backtick Hazard

The Backtick Hazard rule is essential because the underlying defect is unfixed in VS Code through 1.128 ([microsoft/vscode#295620](https://github.com/microsoft/vscode/issues/295620), open, milestone _On Deck_). Re-evaluate when #295620 closes; until then, the temp-file pattern is mandatory.
