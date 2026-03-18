

## Problem Analysis

Two distinct issues identified:

### 1. Blog images turning "brown" (corrupted) after template installation
The blog posts in `src/data/template-blog-posts.ts` reference Unsplash URLs (e.g. `https://images.unsplash.com/photo-...?w=1200`). During installation, the `process-image` edge function fetches these, but Unsplash can rate-limit, redirect, or return degraded responses to server-side requests — resulting in corrupted or broken images uploaded to storage.

### 2. Missing image extraction for team/member blocks
The `extractImagesFromBlockData` function in `src/lib/image-extraction.ts` has gaps — it does not extract:
- `members[].image` (used by consult-agency team blocks)
- `members[].photo` (used by securehealth team blocks)
- `items[].image` or `items[].avatar` (used in various blocks)

These images stay as external Unsplash URLs and are never downloaded to local storage.

---

## Solution: Bundle template images as static assets

Instead of downloading from Unsplash at install time (fragile, slow, rate-limited), bundle the most important template images directly in `public/templates/` as static assets. These ship with the repo and are always available.

### Changes

**1. Add static template images to `public/templates/`**
- Create folders: `public/templates/blog/`, `public/templates/team/`, `public/templates/hero/`
- Download and save ~30-40 key images locally (compressed, ~50-100KB each as WebP/JPEG)
- These are the same Unsplash photos already referenced, just pre-downloaded

**2. Update template data files to use local paths**
- Change blog post `featured_image` URLs from `https://images.unsplash.com/...` to `/templates/blog/...`
- Change team member `image`/`photo` URLs similarly
- Change hero `backgroundImage` URLs similarly
- Affected files: `src/data/template-blog-posts.ts`, all template files in `src/data/templates/`

**3. Update `isExternalUrl` in `src/lib/image-extraction.ts`**
- Treat `/templates/...` paths as local (skip downloading them — they're already available)
- The installer will store the relative path directly; the site serves them from `public/`

**4. Update installer image logic in `src/hooks/useTemplateInstaller.ts`**
- For local `/templates/...` images: upload them from the browser to cms-images storage during install (fetch from own origin, upload to storage)
- This is fast and reliable — no external network dependency

**5. Fix extraction gaps in `src/lib/image-extraction.ts`**
- Add `members[].image`, `members[].photo` to extracted fields
- Add `items[].image`, `items[].avatar`, `items[].photo` to generic array handling
- This ensures ALL images are processed during installation

### File summary

| File | Change |
|------|--------|
| `public/templates/blog/*.jpg` | New — ~20 blog featured images |
| `public/templates/team/*.jpg` | New — ~15 team member photos |
| `public/templates/hero/*.jpg` | New — ~5 hero backgrounds |
| `src/data/template-blog-posts.ts` | Update `featured_image` URLs to `/templates/blog/...` |
| `src/data/templates/*.ts` (all 9) | Update team/hero image URLs to `/templates/...` |
| `src/lib/image-extraction.ts` | Fix missing `members[]` extraction; handle local `/templates/` paths |
| `src/hooks/useTemplateInstaller.ts` | Add local-image-upload flow (fetch from origin → upload to storage) |

### Why this works
- Images ship with the project — no Unsplash dependency at install time
- When the repo is forked on GitHub, images come along automatically
- The installer uploads them to cms-images storage for runtime use
- Eliminates rate-limiting, CORS, and edge function timeout issues entirely
- Blog images will never be "brown" again

