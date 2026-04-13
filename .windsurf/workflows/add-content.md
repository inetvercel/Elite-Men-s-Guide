---
description: Safely add new rich content articles or update existing posts without breaking the site
---

# Safe Content Workflow for Elite Men's Guide

## Rule: Two Ways to Add Content

### Option A — Sanity Post (existing URL, e.g. a post already indexed)
Use this when you want to **keep the existing URL** and add to the body in Sanity.

1. Write a patch script in `scripts/patch-[slug].mjs` using the existing pattern from `scripts/get-depression-post.mjs`
2. Fetch the post by slug, merge new blocks AFTER existing body, commit via `client.patch().set({ body: merged }).commit()`
3. Run: `node scripts/patch-[slug].mjs`
4. Delete the script after use
5. **Do NOT add the slug to `TOOL_REDIRECTS` in `src/app/[...slug]/page.tsx`** — the Sanity route handles it automatically

### Option B — New Static Page (new URL, interactive content, calculators)
Use this when you want a **new dedicated page** (e.g. `/new-topic/page.tsx`) with custom layout/interactivity.

1. Create `src/app/[new-slug]/page.tsx`
2. **Do NOT add this slug to `TOOL_REDIRECTS`** — Next.js static routes automatically take priority over `[...slug]`
3. If a Sanity post exists with the same slug, it will be shadowed by the static page (no redirect needed)

---

## TOOL_REDIRECTS — Only Use For These Cases
The map in `src/app/[...slug]/page.tsx` called `TOOL_REDIRECTS` should ONLY be used when:
- A Sanity post slug **differs** from the static page path (e.g. old WP slug → new path)
- You need an explicit alias redirect

**Never redirect a slug to the same path it already resolves to** — this causes ERR_TOO_MANY_REDIRECTS.

---

## Sanity Content Rules
- Use `block()` helper for paragraphs and headings (`h2`, `h3`, `normal`)
- Use `linkSpan()` helper for hyperlinks that open in new tabs
- Always merge: `[...existingBody, ...newBlocks]` — never replace the whole body
- `invisible: true` on a post hides it from homepage/listings but keeps the URL live for Google

## Amazon CTAs
- Add products to `AMAZON_PRODUCTS` in `src/app/components/AmazonCTA.tsx`
- Keys must match exactly when used in `<AmazonProductBox productKey="..." />` or `<AmazonProductGrid keys={[...]} />`
- UK users (en-GB locale) automatically get `amazon.co.uk` + tag `elitemensguide-21`
- All others get `amazon.com` + tag `elitemensguide-20`

## Before Every Commit Checklist
- [ ] No new slug added to `TOOL_REDIRECTS` unless it's a genuine alias (different source → different dest)
- [ ] All `productKey` values used in JSX exist in `AMAZON_PRODUCTS`
- [ ] Any new static page at `/foo/page.tsx` does NOT have `/foo` in `TOOL_REDIRECTS`
- [ ] `git add` only the files changed, then `git commit -m "..."` and `git push`
