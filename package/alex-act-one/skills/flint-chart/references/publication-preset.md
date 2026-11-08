## Publication config preset (books, reports, exec-facing)

When the render target is a book chapter, a print report, or an exec-facing
document, three settings routinely need to be pinned across every chart in the
artifact so the visuals read as one voice. This is a Vega-Lite `config` block
you can drop into the compiled spec (via Step 3 semantic types →
`compile_chart` → backend edit as described above).

> **Print variant of the brand palette.** The categorical range
> below (blue-800 / amber-700 / green-700 / gray-500 / red-700) is the
> **print-quality variant** of the Alex ACT `chart.categorical` palette. The
> **screen variant** (`#10b981` / `#0ea5e9` / `#f59e0b` / `#8b5cf6` / `#ef4444`)
> lives in your project's `.github/config/brand-palette.json`. Same 5-role
> semantic categorical, deeper contrast for paper.

Pin this once at the top of the artifact's chart set; regenerated charts
inherit it without per-chart overrides.

```json
{
  "config": {
    "background": "transparent",
    "font": "Inter, system-ui, sans-serif",
    "axis": {
      "labelColor": "#6b7280",
      "titleColor": "#1f2937",
      "gridColor": "#e5e7eb",
      "labelFontSize": 12,
      "titleFontSize": 13
    },
    "title": {
      "color": "#1f2937",
      "fontSize": 18,
      "fontWeight": 700,
      "anchor": "middle"
    },
    "range": {
      "category": ["#1e40af", "#b45309", "#15803d", "#6b7280", "#b91c1c"]
    }
  }
}
```

**Semantic discipline in the categorical range** — the palette carries meaning
across the artifact, so use each color only for its assigned role:

- `#1e40af` (blue-800) — correct / principled / primary emphasis
- `#b45309` (amber-700) — Composition family / warning / footer takeaway
- `#15803d` (green-700) — approval / correction
- `#6b7280` (gray-500) — muted / de-emphasised
- `#b91c1c` (red-700) — rejection / critique / target line

**Report typography scale** for the HTML surrounding the chart (not the chart
itself):

| Role                       | Style                                                             |
| -------------------------- | ----------------------------------------------------------------- |
| Report title               | 18pt / 700 / `#1f2937`                                            |
| Section header             | 14pt / 700 / `#1f2937`                                            |
| Body copy                  | 15-16px / `#1f2937` (text) or `#6b7280` (asides)                  |
| REJECTED / APPROVED badges | 12pt / 700 white on red-700 or green-700, `rx="3"` 80x20 pill    |

Print-legibility floor for figures embedded in the artifact: 12px at a 640
viewBox is 5.93pt — the instructional minimum. For the full print-legibility
grammar (formula, `data-print-role` markers, text-fits ladder), the Tailwind
semantic palette, and the composition idioms (BEFORE/AFTER paired panels,
numbered critique callouts, family-band abstracts, 5-Visual Rule dashboards),
see the [`print-svg-style-guide`](../../print-svg-style-guide/SKILL.md) skill.
For the engineering discipline that emits SVGs conforming to that guide
(hand-authored `.mjs` generators, `data-sha256` audit hash, dataset-first with
contract tests, dataset inversion), see the
[`figure-generator`](../../figure-generator/SKILL.md) skill.

Adapted from a published decision-analysis book's figure-authoring practice.
