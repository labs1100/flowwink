

## Template Design Review — Spacing & Background Audit

### Problem: Double Padding

The core issue is architectural. `BlockRenderer` wraps **every** non-full-bleed block in a `<section>` with `py-12 md:py-16 lg:py-20`. But most blocks also render their **own** `<section>` with internal padding (`py-12`, `py-16`, even `py-24`). This stacks up to **~160px** of vertical padding between content areas.

Blocks with their own padding (confirmed):

| Block | Internal padding | + BlockRenderer wrapper | Total |
|---|---|---|---|
| StatsBlock | `py-12 md:py-20` | `py-12 md:py-16 lg:py-20` | ~320px |
| PricingBlock | `py-12 md:py-16` | `py-12 md:py-16 lg:py-20` | ~288px |
| AccordionBlock | `py-16` | `py-12 md:py-16 lg:py-20` | ~288px |
| TwoColumnBlock | `py-16` | `py-12 md:py-16 lg:py-20` | ~288px |
| TimelineBlock | `py-16 md:py-24` | `py-12 md:py-16 lg:py-20` | ~352px |
| ComparisonBlock | `py-12 md:py-16` | `py-12 md:py-16 lg:py-20` | ~256px |
| FeaturesBlock | `py-12` | `py-12 md:py-16 lg:py-20` | ~256px |
| InfoBoxBlock | `py-16` | `py-12 md:py-16 lg:py-20` | ~288px |
| TeamBlock | `py-12 md:py-16` | `py-12 md:py-16 lg:py-20` | ~256px |
| GalleryBlock | `py-12 md:py-16` | `py-12 md:py-16 lg:py-20` | ~256px |
| ImageBlock | `py-16` (non-fullbleed) | `py-12 md:py-16 lg:py-20` | ~288px |
| CTABlock | `py-16` | `py-12 md:py-16 lg:py-20` | ~288px |
| KbHubBlock | `py-16` | `py-12 md:py-16 lg:py-20` | ~288px |

### Problem: PreviewPage Missing SELF_STYLED

`PreviewPage.tsx` does NOT apply the `SELF_STYLED` skip logic. It applies muted backgrounds to blocks that handle their own styling (e.g. Stats with `bg-primary/5`), creating ugly layered backgrounds in the admin preview.

### Problem: Template Live Preview Missing Alternation

`TemplateLivePreviewPage` passes NO `resolvedBackground` — templates preview without any background alternation, which differs from how they actually render on the live site.

---

### Plan

#### 1. Centralize spacing — remove internal padding from blocks

**Strategy**: BlockRenderer already provides section padding. Remove redundant `py-*` from all block components listed above. The wrapper handles vertical rhythm; blocks just render content.

For each block: strip the outer `<section className="py-*">` wrapper and render content directly (keep `container`, `max-w-*`, `px-*`).

**Affected files** (~15 block components):
- `StatsBlock.tsx` — remove `py-12 md:py-20`, also remove `bg-primary/5` (should come from sectionBackground)
- `PricingBlock.tsx` — remove `py-12 md:py-16`
- `AccordionBlock.tsx` — remove `py-16`
- `TwoColumnBlock.tsx` — remove `py-16` (both layouts)
- `TimelineBlock.tsx` — remove `py-16 md:py-24`
- `ComparisonBlock.tsx` — remove `py-12 md:py-16`
- `FeaturesBlock.tsx` — remove `py-12`
- `InfoBoxBlock.tsx` — remove `py-16`
- `TeamBlock.tsx` — remove `py-12 md:py-16`
- `GalleryBlock.tsx` — remove `py-12 md:py-16`
- `ImageBlock.tsx` — remove `py-16` (non-fullbleed case)
- `CTABlock.tsx` — remove `py-16` from all variants
- `KbHubBlock.tsx` — remove `py-16`
- `NewsletterBlock.tsx` — remove internal `py-12`/`py-6`/`py-8`
- `CategoryNavBlock.tsx` — remove `py-12 md:py-16`
- `FeaturedProductBlock.tsx` — remove `py-16 md:py-24`
- `QuickLinksBlock.tsx` — remove `py-6 md:py-8`

#### 2. Tighten the BlockRenderer wrapper padding

Reduce from `py-12 md:py-16 lg:py-20` to a modern, tighter `py-8 md:py-12 lg:py-16`. This gives clean breathing room without the spacious 2020s-era look.

**File**: `BlockRenderer.tsx` line 347

#### 3. Fix PreviewPage — add SELF_STYLED logic

Copy the `SELF_STYLED` set and skip-logic from `PublicPage.tsx` into `PreviewPage.tsx` (lines 135-148) so admin preview matches live rendering.

**File**: `PreviewPage.tsx`

#### 4. Fix TemplateLivePreviewPage — add alternation

Add the same FULL_BLEED + SELF_STYLED alternation logic to `TemplateLivePreviewPage.tsx` so template previews match live behavior.

**File**: `TemplateLivePreviewPage.tsx`

#### 5. Audit StatsBlock self-styling

`StatsBlock` hardcodes `bg-primary/5`. This should either be removed (let sectionBackground handle it) or the block should be in FULL_BLEED. Recommendation: remove it and let templates set `sectionBackground: 'accent'` on stats blocks that need a tinted background.

---

### Execution Order

1. Tighten `BlockRenderer` wrapper padding (1 file)
2. Strip internal padding from all ~15 block components (parallel edits)
3. Fix `PreviewPage` SELF_STYLED parity (1 file)
4. Fix `TemplateLivePreviewPage` alternation (1 file)
5. Remove hardcoded backgrounds from StatsBlock

