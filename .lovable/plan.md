

## Problem Analysis

The template preview in the gallery modal is broken because:

1. **Hero blocks use `min-h-screen`** — inside the modal's constrained container, this causes the hero to take up the entire outer viewport, pushing all other content far below the visible area. The hero title text exists but is invisible because it's rendered below the fold of the inner scroll container.

2. **Missing block types** — `TemplateBlockPreview` doesn't handle `resume-matcher`, `quick-links`, `lottie`, `webinar` and falls through to a generic placeholder. Every new block type needs to be manually added to *two* renderers.

3. **CSS isolation is fragile** — the scoped `<style>` injection with CSS variables works partially but many Tailwind classes depend on document-level context.

4. **Maintenance burden** — `TemplateBlockPreview.tsx` (576 lines) is a near-duplicate of `BlockRenderer.tsx` that drifts out of sync whenever blocks are added or changed.

## Solution: iframe-based Full-Page Preview

Replace the inline block rendering with an **iframe** that loads a dedicated preview route. The iframe provides true viewport isolation so `min-h-screen`, scroll indicators, and all CSS work exactly as they would on the real published page.

### Architecture

```text
TemplatePreview (modal)
  ├── Header (name, device switcher, page nav)
  ├── Sidebar (page list, colors)
  └── Preview Area
       └── <iframe src="/admin/template-live-preview?t=templateId&p=pageIndex" />
            └── TemplateLivePreviewPage
                 ├── TemplateBrandingProvider
                 └── BlockRenderer (same as public pages)
```

### Changes

**1. New route: `src/pages/admin/TemplateLivePreviewPage.tsx`**
- Reads template ID and page index from URL params
- Looks up the template from `ALL_TEMPLATES`
- Renders blocks using the real `BlockRenderer` (same component the public site uses)
- Wraps in `TemplateBrandingProvider` for branding context
- Applies the template's dark/light theme
- No admin chrome (no sidebar, no header)

**2. Update `src/components/admin/templates/TemplatePreview.tsx`**
- Replace the `<ScrollArea>` + `TemplateBlockPreview` map with an `<iframe>`
- iframe `src` points to the new route with template ID and page index
- Device mode changes the iframe container width (already works via `getDeviceWidth()`)
- Remove the scoped `<style>` injection (no longer needed)

**3. Register the route in the router**
- Add `/admin/template-live-preview` as a new admin route (no layout wrapper)

**4. Communicate template data to iframe**
- Since templates are static TypeScript data, pass template ID + page index via URL search params
- The iframe page imports `ALL_TEMPLATES` directly — no postMessage or sessionStorage needed

### What This Fixes
- Hero blocks render at proper viewport height inside the iframe
- All 47+ block types work immediately (uses real `BlockRenderer`)
- New blocks added in the future work automatically — no second renderer to maintain
- Dark/light theme isolation works correctly
- Video backgrounds, parallax, scroll indicators all function properly
- Device mode switching (desktop/tablet/mobile) works via iframe width

### Files Affected
| File | Action |
|------|--------|
| `src/pages/admin/TemplateLivePreviewPage.tsx` | Create |
| `src/components/admin/templates/TemplatePreview.tsx` | Update (iframe instead of inline blocks) |
| Router config (App.tsx or similar) | Add route |

`TemplateBlockPreview.tsx` and `TemplateBrandingProvider.tsx` remain for potential other uses but are no longer used by the preview modal.

