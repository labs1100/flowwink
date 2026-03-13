

# Premium Block Styling — Consid-Inspired Alternating Backgrounds

## What Consid Does
Consid.se uses **full-width section backgrounds that alternate** between white and light gray (or dark sections), creating visual rhythm and separation without explicit dividers. Each section fills the full viewport width, content is generous with padding, and the alternating color creates a premium "magazine" feel.

## Current Problem
Our blocks render as floating content inside a plain `<main>` — no background alternation, no full-width section wrapping. Everything looks like it's on the same flat surface.

## Plan

### 1. Add `sectionBackground` property to ContentBlock type
Extend `ContentBlock` in `src/types/cms.ts` with an optional `sectionBackground` field:
- `'none'` (default/transparent)
- `'muted'` (subtle bg-muted/50)
- `'accent'` (bg-accent/10)
- `'dark'` (bg-foreground text-background — inverted)
- `'auto-alternate'` — special value, handled at render time

### 2. Update BlockRenderer to wrap blocks in full-width sections
In `BlockRenderer.tsx`, wrap each block's output in a full-width `<section>` element that applies the background. When `sectionBackground` is set, the section gets full-bleed background color with generous vertical padding (py-16 md:py-24).

### 3. Add auto-alternating logic in PublicPage / PreviewPage
Pass the block's **index** (already passed) down. When a page or template opts into alternating mode (or per-block), use the index to alternate between transparent and `bg-muted/30` backgrounds automatically.

The smartest approach: do this at the **page render level** so BlockRenderer receives the computed background. In `PublicPage.tsx` and `PreviewPage.tsx`, wrap each `<BlockRenderer>` call in a `<section>` with alternating backgrounds. Skip alternation for full-bleed blocks (hero, parallax-section, announcement-bar, map, marquee).

### 4. Add admin control for section backgrounds
Add a simple background picker to `BlockWrapper.tsx` controls — a small icon button with a popover offering the 4 background options. This lets template authors and admins control per-block backgrounds.

### 5. Update templates to use alternating backgrounds
Update the consult-agency template (and optionally others) to set `sectionBackground` on blocks for that premium alternating feel. For consult-agency specifically, use `'muted'` on every other content block.

### 6. Increase default section padding
Currently blocks have minimal vertical spacing. Add generous `py-16 md:py-20 lg:py-24` padding to section-wrapped blocks for that spacious Consid feel. This applies in the public `<section>` wrapper, not in individual block components.

## Files to Modify

| File | Change |
|------|--------|
| `src/types/cms.ts` | Add `sectionBackground` to `ContentBlock` |
| `src/components/public/BlockRenderer.tsx` | Wrap output in `<section>` with background + generous padding |
| `src/components/admin/blocks/BlockWrapper.tsx` | Add background picker control |
| `src/data/templates/consult-agency.ts` | Set alternating backgrounds on blocks |
| `src/pages/PublicPage.tsx` | Minor: ensure `<main>` has no conflicting styles |

## Technical Detail

```text
┌─────────────────────────────────────────────┐
│  <section class="bg-transparent py-20">     │  ← Hero (full-bleed, skip)
│    [Hero Block]                              │
├─────────────────────────────────────────────┤
│  <section class="bg-muted/30 py-20">        │  ← Alternating: muted
│    <div class="container mx-auto max-w-6xl">│
│      [Resume Matcher Block]                 │
│    </div>                                   │
├─────────────────────────────────────────────┤
│  <section class="bg-transparent py-20">     │  ← Alternating: clear
│    <div class="container mx-auto max-w-6xl">│
│      [Logos Block]                          │
│    </div>                                   │
├─────────────────────────────────────────────┤
│  <section class="bg-muted/30 py-20">        │  ← Alternating: muted
│    ...                                      │
└─────────────────────────────────────────────┘
```

