---
name: doc-hygiene
description: Documentation hygiene — anti-drift rules, code-documentation placement, count elimination, and living document maintenance. Use when auditing docs or comments for drift, fixing hardcoded counts and dead links, documenting code for adopters, or deciding whether a document is living or historical.
lastReviewed: 2026-08-07
---

# Doc Hygiene

> Prevent documentation drift through structural rules — not manual vigilance.

## The Count Problem

Hardcoded counts (e.g., "109 skills", "28 instructions", "6 agents") in prose become stale within days during active development. Every count is a future bug.

### Rules

| Rule | Do | Don't |
|------|----|-------|
| **No counts in prose** | "See the skills catalog for the current list" | "Alex has 109 skills" |
| **Counts in tables OK** | Tables with `| Count | Value |` format are scannable and updatable | Counts buried in paragraphs |
| **Single source of truth** | One canonical location per metric | Same count in 5 files |
| **Link, don't copy** | "See brain-health-grid for current list" | Duplicate the list inline |
| **Timestamp proximity** | Counts near a "Last Updated" date are acceptable | Undated counts |

### Canonical Sources

The filesystem is always the source of truth. Derive counts from directories, not from prose.

| Metric | Canonical Source | Why |
|--------|-----------------|-----|
| Skill count | `.github/skills/` directory count (or generated catalog if present) | Filesystem is truth |
| Instruction count | `.github/instructions/` directory listing | Filesystem is truth |
| Prompt count | `.github/prompts/` directory listing | Filesystem is truth |
| Agent count | `.github/agents/` directory listing | Filesystem is truth |
| Command count | `package.json` `contributes.commands` (if applicable) | Code is truth |
| Connection count | Brain QA validation output | Validated at runtime |

### Acceptable Count Locations

Counts are **tolerated** (not encouraged) in these specific locations because they serve as dashboards:

| File | Purpose | Update Cadence |
|------|---------|----------------|
| `copilot-instructions.md` Memory Stores table | AI working context | Per release |
| `README.md` architecture tree | User-facing overview | Per release |

All other files should use **descriptive references** instead of counts.

## Document Freshness

### Staleness Indicators

| Signal | Action |
|--------|--------|
| Count doesn't match filesystem | Fix count or replace with reference |
| "Last Updated" older than 30 days on living doc | Review for accuracy |
| Version number doesn't match current release | Update or archive |
| References to removed/renamed files | Fix or remove reference |

### Living vs Historical Documents

| Type | Examples | Count Policy |
|------|----------|-------------|
| **Living** | README, copilot-instructions, ROADMAP, USER-MANUAL | Minimize counts; keep current |
| **Historical** | Research papers, competitive analyses, archived docs | Counts are snapshots — leave as-is |
| **Generated** | brain-health-grid output | Counts are output of audit — OK |

## Docs-as-Architecture

Documentation in a cognitive architecture IS architecture. Apply the same engineering rigor to docs that you would to code:

| Code Concept | Docs Equivalent |
|-------------|-----------------|
| Broken import | Broken cross-reference link |
| Stale dependency | Stale count or version number |
| Orphan module | File not linked from any index |
| Circular dependency | Two files claiming to be source of truth |
| Dead code | Archived content still linked from living docs |

**Principle**: If a doc change would break another doc's accuracy, it's a breaking change. Treat it as such.

## Code Documentation Ladder

Put each claim at the narrowest layer that can own it without duplication. Comments explain why and invariants; broader documents explain use, contracts, history, or decisions.

| Layer | Owns | Keep out |
|---|---|---|
| **Inline comment** | A non-obvious invariant, workaround, safety boundary, or reason the local implementation has its shape | Line-by-line narration, tutorial prose, or behavior the code already states clearly |
| **Adoption guide** | Setup, upgrade, verification, extension points, and environment-specific pitfalls for someone consuming a detached bundle | Internal implementation history or repository-only paths that disappear when copied |
| **Technical reference** | Stable contracts, schemas, supported modes, and externally observable semantics | Volatile control flow or implementation details that belong beside the code |
| **Changelog** | What changed, compatibility impact, and required user action | The complete rationale or operating instructions |
| **Decision record** | Why one architecture or policy won over credible alternatives | Current usage instructions or details already visible in code |

### Rules

| Condition | Action |
|---|---|
| Code changes invalidate a nearby explanation | Change or delete the comment in the same change; a stale comment is a defect, not history |
| A load-bearing documentation claim affects routing, security, compatibility, or supported behavior | Back the claim with an executable check at the closest stable boundary |
| Behavior changes by origin, path, exit-code, or trust-boundary semantics | Document the distinction beside the boundary and cover each material branch in tests |
| A starter, template, or other detached bundle can leave its repository | Ship a local adoption guide with the bundle; repository-level links are supporting context, not the only instructions |
| A list or count can be derived from files or metadata | Generate or test it instead of maintaining prose by hand |

Do not narrate what each line does. Explain the constraint a future maintainer might otherwise remove, the consequence of violating it, and the evidence that protects it.

### Anti-Patterns

| Anti-pattern | Correction |
|---|---|
| Comment says code sets body padding after the implementation moved to an in-flow spacer | Rewrite it around the layout invariant, then add a regression for the rendered spacing |
| Reference says a feature is enabled by default while configuration keeps it opt-in | Test the default and describe the observed contract |
| Adoption steps enumerate a fixed bundle by hand | Derive the inventory from the package manifest and test recursive completeness |
| Copied starter points only to docs in its source repository | Include a portable guide inside the copied bundle |

## Link Integrity

### Rules

| Rule | Enforcement |
|------|-------------|
| Every markdown link in living docs must resolve | Grep + verify during audit |
| Every important file in a folder should be linked from its `README.md` | Orphan check |
| Moving a file requires updating ALL references in the same commit | Grep for filename in all .md files before moving |
| Archived docs removed from active indexes | Don't link to `archive/` from living docs |
| Use relative paths within doc trees | `./architecture/FILE.md` not absolute paths |

### Link Integrity Checker

```bash
# Find all markdown links and verify they resolve
find . -name "*.md" -exec grep -oP '\[.*?\]\((?!http)[^)]+\)' {} + | while read match; do
  file=$(echo "$match" | sed -E 's/.*\(([^)]+)\).*/\1/')
  dir=$(dirname "$match" | cut -d: -f1)
  target="$dir/$file"
  if [ ! -f "$target" ] && [ ! -d "$target" ]; then
    echo "BROKEN: $match"
  fi
done
```

```typescript
// Programmatic link integrity check
import { glob } from 'glob';
import { readFile } from 'fs/promises';
import { dirname, resolve, existsSync } from 'path';

async function checkLinkIntegrity(docsRoot: string): Promise<string[]> {
  const broken: string[] = [];
  const mdFiles = await glob(`${docsRoot}/**/*.md`);

  for (const file of mdFiles) {
    const content = await readFile(file, 'utf-8');
    const linkRegex = /\[.*?\]\((?!http)([^)]+)\)/g;
    let match;

    while ((match = linkRegex.exec(content)) !== null) {
      const linkPath = match[1].split('#')[0]; // Remove anchors
      const absolutePath = resolve(dirname(file), linkPath);

      if (!existsSync(absolutePath)) {
        broken.push(`${file}: ${match[0]} -> ${absolutePath}`);
      }
    }
  }

  return broken;
}
```

### Orphan Detection

A file is orphaned if it exists in a doc folder but is not referenced by any index or parent document. Orphans are either:

- **Forgotten knowledge** → add to appropriate index
- **Stale artifacts** → archive or delete

### Repo-Wide Purpose Audit

When the question is "does every file in this repo have a purpose?" (not "is this doc folder tidy?"), file-by-file inspection at hundreds of files burns context without changing outcomes. Probe **structural signals** instead:

| Signal | What to check | Action |
|---|---|---|
| Folder named `*_obsolete/`, `*/archive/`, `legacy/`, `deprecated/` | Self-declared exit zone | Confirm history is the only consumer, then prune or rename to drop the misleading label |
| Status field reads `Shipped`, `Decided`, `Accepted` | Proposal that landed | Move to `shipped/` subdir or fold into ADR/ledger |
| Script with zero cross-refs (`git grep -l <basename>` returns only self) | Likely one-shot migration done | Verify with `git log -1 --format='%s'` — if subject says `chore: migrate X` and migration is in changelog, delete |
| Asset folder with both `archive/` and `canonical/` siblings | Superseded variants | The `canonical/` siblings are the live set; `archive/` is prunable |

The yield is decision buckets, not a per-file list. Surface the buckets and let the user pick — single-pass deletion at this scale is high-blast-radius.

## Would Revise If

Revise if the anti-drift rules let stale counts ship to released artifacts twice in a quarter, or if the 'living vs historical' classification produces disputes the rules cannot resolve.

By **2026-11-07**, revise the code-documentation ladder if two reviews still find stale mechanism comments, two projects duplicate one claim across three or more layers, or a recurring documentation artifact cannot be classified by the ladder.
