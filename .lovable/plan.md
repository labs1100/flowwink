

## Problem

During template installation, every individual mutation hook (create page, create blog post, create product, delete page, etc.) fires its own success toast. With a full template like FlowWink containing ~8 pages, 6 blog posts, 4 products, KB articles, plus deletions of old content — that's easily 40-50 toasts stacking up.

## Solution: Global "silent mode" flag

Create a simple React context that the template installer can toggle on during bulk operations. Each mutation hook checks this flag and skips its toast when silent mode is active. The installer already shows its own progress UI and a final summary toast, so nothing is lost.

### Changes

**1. New file: `src/contexts/ToastSilencer.tsx`**
- A small context with a `silent` boolean and `setSilent` setter
- Provider wraps the app (or just the admin layout)
- Export a `useToastSilent()` hook that returns the current silent state

**2. Update `src/hooks/useTemplateInstaller.ts`**
- Import `useToastSilent` and call `setSilent(true)` before starting installation, `setSilent(false)` when done (including error paths)

**3. Update mutation hooks that fire toasts (~8-10 hooks)**
- In each `onSuccess`/`onError` callback, wrap the toast call with `if (!silent)` check
- Affected hooks: `useBlogPosts`, `useProducts`, `useProductCategories`, `useKnowledgeBase`, `useSiteSettings`, `useGlobalBlocks`, `useBookings`, `useModules`, and any others called during installation
- Alternative simpler approach: instead of modifying every hook, add a `{ silent?: boolean }` option to the `mutateAsync` call and pass it through the mutation context — React Query supports passing a `variables` context that `onSuccess` can read

**Recommended approach (simplest):** Use React Query's mutation meta/context pattern:

```typescript
// In useCreateBlogPost:
onSuccess: (_data, _vars, context) => {
  queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
  if (!context?.silent) {
    toast({ title: 'Post created' });
  }
}

// In useTemplateInstaller:
await createBlogPost.mutateAsync(data, { context: { silent: true } });
```

Actually, the simplest approach that touches the fewest files: **a global ref-based silencer** — no context provider needed.

### Revised minimal approach

**1. New file: `src/lib/toast-silencer.ts`** (3 lines)
```typescript
export const toastSilencer = { silent: false };
```

**2. Update `src/hooks/useTemplateInstaller.ts`**
- Set `toastSilencer.silent = true` before install, `false` after (in finally block)

**3. Create a wrapper in `src/hooks/use-toast.ts` or a shared helper**
- Wrap the `toast()` function to check `toastSilencer.silent` before firing
- This way ALL toasts are suppressed during installation with zero changes to individual hooks

### Files to change

| File | Change |
|------|--------|
| `src/lib/toast-silencer.ts` | New — simple `{ silent: false }` module export |
| `src/hooks/use-toast.ts` | Wrap `toast()` to check silencer before dispatching |
| `src/components/ui/sonner.tsx` | Wrap sonner's `toast` export similarly |
| `src/hooks/useTemplateInstaller.ts` | Toggle `toastSilencer.silent` around the install flow |

This approach requires changing only 4 files total and suppresses all toasts (both shadcn and sonner) during bulk operations while keeping error toasts from the installer itself working (by calling the original unwrapped toast after setting silent back to false).

