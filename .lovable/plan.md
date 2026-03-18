

## Analysis: BentoGrid Spacing in FlowWink Template

### Current Spacing Stack

The BentoGridBlock has several layers of spacing that compound:

| Element | Current Value | Effect |
|---------|--------------|--------|
| Section padding | `py-16 md:py-24` | 96px top+bottom on desktop |
| Header → grid gap | `mb-12 md:mb-16` | 64px below title |
| Grid row minimum | `auto-rows-[minmax(180px,auto)]` | Each row ≥ 180px |
| Card internal padding | `p-6` (24px) | All sides |
| Grid gap (medium) | `gap-5` (20px) | Between cards |

A `large` (2×2) card gets minimum **380px height** (2×180 + 20 gap) but the content (icon + title + 2-line description) only fills ~150px. That leaves **230px of empty space** — which is where the "airiness" comes from.

### Two Adjustments

**1. Tighten the component spacing slightly:**
- Reduce min row height from `180px` → `160px`
- Reduce section padding from `py-16 md:py-24` → `py-12 md:py-20`
- Reduce header margin from `mb-12 md:mb-16` → `mb-8 md:mb-12`

**2. Enrich the `large` span item content in the template:**
The "Deep Organizational Memory" card (2×2, `large`) has good text but could use more to fill the space meaningfully. Add a short bullet list or secondary detail paragraph so the card feels intentionally spacious rather than accidentally empty.

### Files to Change

| File | Change |
|------|--------|
| `src/components/public/blocks/BentoGridBlock.tsx` | Tighten section padding, header margin, and min row height |
| `src/data/templates/flowwink-platform.ts` | Expand description for the two `large` span items (`bg-memory` and `bg-browser`) with richer detail |

This keeps the premium feel while reducing the "lost in space" effect — especially on the large cards.

