> Historical recovery; not current certification or an active issue list.
> See [current change history](../../../../../CHANGELOG.md).

# Installed skill test report

Date: 2026-11-05. Package: alex-act-one 0.7.0. Live harness: Copilot CLI 1.0.105.

## Result

- 63/63 skills discovered; 63/63 passed source/direct-resource checks after triaging illustrative paths.
- Installed automated suite: 261 passed, zero failed, zero skipped.
- Actual converter/helper/preview cases: 13/13 passed.
- Twelve primary live scenarios completed, plus one chart retest with all resident instructions activated.
- Primary scenario dispositions after inspecting outputs: {"pass":8,"pass-with-limitations":2,"limited":1,"needs-correction":1}.
- 19 unique skills appear in CLI invocation traces. This is not exhaustive behavioral coverage.
- Flint SVG generation, source-matching marks, rendered value ratio, fallback browser interaction, screenshot, and console checks passed.

## Finding

**Medium: chart framing uses an unsupported Flint identifier.**

The composition row in [chart-big-idea](../../../../../skills/chart-big-idea/SKILL.md) recommends `stacked_bar_chart`. Both the standalone and activated live runs emitted it as a suggested chartType. The actual Flint validator rejects it; `Stacked Bar Chart` validates. Other snake_case hints in the same table require mapping too. This is a handoff defect; full render-chart orchestration may perform a later lookup and was not live-tested here.

The initial chart run also reported a derived percentage after shell execution was denied. The activated-instruction retest recovered through SQL and grounded the same value in tool output. Do not equate the first standalone-skill run with the fully activated plugin.

No plugin or repository changes were made to fix the finding during this test request.

## Representative live cases

| Case | Disposition | Evidence |
| --- | --- | --- |
| act-canon | pass | [Trace](skill-test-evidence/act-canon.log) |
| framing-alias | pass | [Trace](skill-test-evidence/framing-alias.log) |
| humanizer-audit | pass | [Trace](skill-test-evidence/humanizer-audit.log) |
| deep-review | pass-with-limitations | [Trace](skill-test-evidence/deep-review.log) |
| copywriter-approval | pass | [Trace](skill-test-evidence/copywriter-approval.log) |
| native-plan | pass | [Trace](skill-test-evidence/native-plan.log) |
| project-recovery | pass-with-limitations | [Trace](skill-test-evidence/project-recovery.log) |
| compile-preservation | limited | [Trace](skill-test-evidence/compile-preservation.log) |
| capability-should-not-fire | pass | [Trace](skill-test-evidence/capability-should-not-fire.log) |
| chart-brief-route | needs-correction | [Trace](skill-test-evidence/chart-brief-route.log) |
| setup-no-install | pass | [Trace](skill-test-evidence/setup-no-install.log) |
| conversion-dispatch | pass | [Trace](skill-test-evidence/conversion-dispatch.log) |
| chart-with-activation | Numeric evidence recovered through SQL; identifier still needs correction | [Trace](skill-test-evidence/chart-with-activation.log) |

## Limits and harness triage

- Compiler returned an honest review draft; mandatory executable verification was permission-blocked, so it was not certified execution-ready.
- Some review/recovery shell checks were also denied by noninteractive approval. Their output limitations were inspected rather than silently counted as executable passes.
- Native browser local-file reading/measurement worked, but pointer clicks timed out in a hidden tab. The retained Playwright fallback passed the same interaction and rendered-value checks. This is a host/test limitation, not evidence that the fallback should be removed.
- Three apparent resource misses were template placeholders (`<your-diagram>` and `<slug>`), not missing packaged resources.
- All primary fixture workspaces preserved identical file hashes. Native Plan mode allowed private session plans; those disposable profiles were removed.
- The normal activation preview still reports fifteen preserve actions and a preserved receipt.

- No exhaustive behavioral invocation of all 63 skills, all references, or all edge cases.
- No paid image generation or Replicate account/authentication check.
- No real email sending or Outlook draft opening.
- No real plugin/dependency installation, commits, pushes, publication, profile migration, or user-setting changes.
- No full production TDD, mutation, security-hardening, meditation-write, or cloud-integration workflow.
- No Scout or GitHub Copilot app session; representative live skill traces are CLI 1.0.105.

## Per-skill evidence coverage

“CLI” means an observed skill invocation, not every behavior proven. “Script” means an additional fixture exercised a bundled executable, including disposable bootstrap activation. “Integration” means the synthetic rendering/browser chain was checked using the loaded skill guidance. A dash means not exercised in that additional category, not that the installed automated suite provides no helper coverage for it.

| Skill | Discovery/resources | CLI | Script | Integration |
| --- | --- | --- | --- | --- |
| act-tenets | pass | yes | - | - |
| adversarial-review | pass | - | - | - |
| annotate-screenshot | pass | - | - | - |
| anti-hallucination | pass | yes | - | - |
| ascii-chart | pass | - | yes | - |
| assess-brain | pass | yes | - | - |
| big-idea | pass | yes | - | - |
| bootstrap-core | pass | - | yes | - |
| bootstrap-project | pass | - | yes | - |
| browser-tools | pass | - | - | yes |
| chart-big-idea | pass | yes | - | - |
| chart-interpretation | pass | - | - | - |
| chart-vocabulary | pass | - | - | - |
| code-review | pass | yes | - | - |
| communication-craft | pass | - | - | - |
| compile-brain | pass | yes | - | - |
| convert | pass | yes | - | - |
| corpus-qa-sweep | pass | - | - | - |
| critical-thinking | pass | yes | - | - |
| deep-review | pass | yes | - | - |
| doc-hygiene | pass | - | - | - |
| docs-shell | pass | - | - | - |
| docx-to-md | pass | - | yes | - |
| ethical-reasoning | pass | - | - | - |
| evaluate-before-adopting | pass | - | - | - |
| figure-generator | pass | - | - | - |
| flint-chart | pass | - | - | yes |
| flint-theme | pass | - | yes | - |
| git-workflow | pass | - | - | - |
| html-to-md | pass | - | yes | - |
| humanizer | pass | yes | - | - |
| install-visual-companions | pass | yes | - | - |
| lint-clean-markdown | pass | - | - | - |
| markdown-mermaid | pass | - | - | - |
| markdown-sanitization-chain | pass | - | - | - |
| md-to-eml | pass | - | yes | - |
| md-to-html | pass | - | yes | - |
| md-to-txt | pass | - | yes | - |
| md-to-word | pass | yes | yes | - |
| meditation | pass | - | - | - |
| mutation-testing | pass | - | - | - |
| plan | pass | yes | - | - |
| platform-awareness | pass | - | - | - |
| print-svg-style-guide | pass | - | - | - |
| proactive-awareness | pass | yes | - | - |
| problem-framing-audit | pass | yes | - | - |
| project-capability-authoring | pass | yes | - | - |
| project-status | pass | yes | - | - |
| render-chart | pass | - | - | - |
| render-verify | pass | - | - | yes |
| replicate-imagery | pass | - | - | - |
| rich-email | pass | - | yes | - |
| risk-analysis | pass | - | - | - |
| security-and-hardening | pass | - | - | - |
| setup-dependencies | pass | - | - | - |
| setup-enterprise-stack | pass | - | yes | - |
| spike | pass | - | - | - |
| status-reporting | pass | - | - | - |
| svg-banner | pass | - | yes | - |
| systematic-debugging | pass | - | - | - |
| terminal-command-safety | pass | yes | - | - |
| test-driven-development | pass | - | - | - |
| token-waste-elimination | pass | - | - | - |

[Machine-readable details](skill-test-results-2026-11-05.json) include accepted scope, output checks, fixture results, and remaining gaps.
