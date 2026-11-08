## Mission-Critical Review (NASA Standards)

For safety-critical projects, apply NASA/JPL Power of 10 rules during review:

### Blocking Violations (Must Fix)

| Rule | Check For | Detection |
| ---- | --------- | --------- |
| **R1** | Recursive function without `maxDepth` parameter | `grep -rn "function.*\(" \| xargs grep -l "walk\|traverse\|recurse"` |
| **R2** | `while` loop without iteration counter | Enumerate every loop with `grep -rn "while\s*(" src/` first; judge only whether each listed loop is bounded by a counter |
| **R3** | Unbounded array growth | `push()` in loops without size checks |

### High Priority (Strong Recommendation)

| Rule | Check For | Detection |
| ---- | --------- | --------- |
| **R4** | Function > 60 lines | Deterministic count: `node scripts/structure-metrics.cjs <path>` reports per-function line counts (or ESLint `max-lines-per-function` where configured); never count lines by eye |
| **R5** | Missing entry assertions | Public functions without precondition checks |
| **R8** | Nesting > 4 levels | Same script: `structure-metrics.cjs` reports max nesting depth per function (or ESLint `max-depth`); never judge depth from indentation |

### Medium Priority (Consider)

| Rule | Check For | Detection |
| ---- | --------- | --------- |
| **R6** | Variable declared far from use | Manual review |
| **R7** | Unchecked return values | `grep` for ignored returns |
| **R9** | Deep property access without `?.` | `obj.prop.prop.prop` chains |
| **R10** | Compiler warnings | Build output |

**Trigger**: User mentions "mission-critical", "NASA standards", "high reliability", or "safety-critical"

## Review Timing

| PR Size | Expected Review Time | If Larger |
| ------- | -------------------- | --------- |
| < 100 lines | < 30 min | — |
| 100-400 lines | 30-60 min | Ideal size |
| 400+ lines | 60+ min | Ask author to split |
| 1000+ lines | Don't | Refuse; request breakdown |

---

## Extension Audit Methodology (VS Code Extensions)

**When**: Before release, after major refactoring, or on quality concerns

**Scope**: Multi-dimensional code quality analysis beyond standard code review

### 5-Dimension Audit Framework

| Dimension | Focus | Tools/Methods | Output |
| --------- | ----- | ------------- | ------ |
| **Debug & Logging** | Console statements, debug code | `grep -r "console\\.log\|console\\.debug"` | Categorize: legitimate vs removable |
| **Dead Code** | Unused imports, orphaned files, broken refs | TypeScript compilation + manual scan | List dead commands, UI, dependencies |
| **Performance** | Blocking I/O, sync operations, bottlenecks | `grep -r "Sync\(" src/`, profiling | Async refactoring candidates |
| **Menu Validation** | All commands/buttons work | Manual testing + error logs | Broken commands, missing handlers |
| **Dependencies** | Unused packages, leftover references | package.json vs import analysis | Removable dependencies |

### Audit Report Template

**Numbers rule:** every count and ratio in this template comes from `scripts/audit-tally.cjs`, never from tallying grep output or dividing in prose. Run `node scripts/audit-tally.cjs console <root>` for the console scan, add `--categories <file>` (one `path:line:legitimate` or `path:line:removable` entry per hit, after you categorize) for the split, and `node scripts/audit-tally.cjs ratio <working> <broken>` for the menu-validation ratio.

```markdown
## Executive Summary
- Console statements: X remaining (Y legitimate, Z removable)
- Dead code: [commands/UI/dependencies list]
- Performance: [blocking operations count]
- Menu validation: [working/broken ratio]

## Recommendations
1. [Category]: [Issue] → [Action] (Priority: Critical/High/Medium)
2. [Category]: [Issue] → [Action] (Priority: Critical/High/Medium)
```

### Console Statement Categorization

| Category | Keep? | Examples |
| -------- | ----- | -------- |
| **Enterprise compliance** | ✅ | Audit logs, security events, GDPR actions |
| **User feedback** | ✅ | TTS status, long-running ops, critical errors |
| **Debug noise** | ❌ | Setup verbosity, migration logs, info messages |
| **Development artifacts** | ❌ | "Entering function X", temporary debugging |

### Performance Red Flags

- **Synchronous file I/O** in UI thread: `fs.readFileSync`, `fs.existsSync`, `fs.readdirSync`
  - **Fix**: Convert to `fs-extra` async: `await fs.readFile`, `await fs.pathExists`, `await fs.readdir`
- **Blocking operations** in activation: Heavy computation before extension ready
  - **Fix**: Defer to background, show loading state, or lazy-load
- **Serial operations** that could be parallel: Sequential awaits for independent tasks
  - **Fix**: `Promise.all([op1(), op2(), op3()])`

### Dead Code Detection Pattern

1. **Scan command registrations**: `vscode.commands.registerCommand('command.id', ...)`
2. **Scan UI references**: Search HTML/views for command IDs
3. **Cross-check**: Commands in UI but not registered = broken; registered but unused = dead
4. **Verify disposables**: Removed commands should have disposable cleanup too

### Post-Audit Verification

- [ ] TypeScript compiles: `npm run compile` → exit 0
- [ ] No orphaned imports: All imports resolve
- [ ] Version aligned: package.json, CHANGELOG, copilot-instructions match
- [ ] Smoke test: Extension activates, 3 random commands work

**Pattern applies to**: VS Code extensions, Electron apps, Node.js services with UI

## Would Revise If

Revise if reviews repeatedly miss security or correctness defects that adversarial review (`deep-review` skill) catches on the same PR, or if the 3-pass model produces consistent false-positive `[blocking]` comments that authors reasonably decline.
