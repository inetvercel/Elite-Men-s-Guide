# Elite Mens Guide — Next.js + Sanity

WordPress → Sanity migration + Next.js frontend for [elitemensguide.com](https://elitemensguide.com).

---

## Stack

- **Next.js 14** (App Router)
- **Sanity v3** (CMS + embedded Studio at `/studio`)
- **TypeScript**
- Import script: zero extra dependencies beyond `@sanity/client`

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create a Sanity project

Go to [sanity.io/manage](https://sanity.io/manage) → New project → name it `elitemensguide`.

Note your **Project ID** and **Dataset** (default: `production`).

Create an **API token** with **Editor** (write) access.

### 3. Configure environment

```bash
cp .env.local.example .env.local
```

Fill in `.env.local`:

```env
NEXT_PUBLIC_SANITY_PROJECT_ID=abc123xyz
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=sk...yourWriteToken
WORDPRESS_BASE_URL=https://elitemensguide.com
```

### 4. Add CORS origin in Sanity

In [sanity.io/manage](https://sanity.io/manage) → your project → API → CORS Origins:
- Add `http://localhost:3000` (for dev)
- Add your production domain

---

## Import WordPress Content

Run the importer once your `.env.local` is configured:

```bash
npm run import
```

**What it imports:**
| Item | Detail |
|------|--------|
| Categories | Full hierarchy with parent refs |
| Tags | All tags |
| Authors | All authors |
| Posts | All published + draft posts |
| Pages | All WordPress pages |
| Featured images | Uploaded to Sanity CDN |
| Body images | All `<figure>/<img>` blocks uploaded to Sanity CDN |
| Internal links | Rewritten to relative paths (domain stripped) |
| External links | Preserved with `target="_blank"` |
| SEO meta title | Scraped from Yoast `<title>` / `og:title` |
| SEO meta description | Scraped from Yoast `meta[name=description]` |
| OG title/description | Scraped from `og:` meta tags |
| Twitter card | Scraped from `twitter:` meta tags |
| Canonical URL | From `rel="canonical"` in HTML head |
| Exact permalinks | Stored as `/slug/` path from WP |
| Portable Text | Full HTML → Sanity block content conversion |
| Raw HTML backup | Stored in `rawHtml` field as fallback |

**The importer is resumable** — re-running it will skip already-imported posts (matched by `wpId`).

---

## Development

```bash
npm run dev
```

- Site: `http://localhost:3000`
- Sanity Studio: `http://localhost:3000/studio`

---

## Project Structure

```
src/
  app/
    layout.tsx          # Root layout
    page.tsx            # Homepage (post grid)
    [...slug]/page.tsx  # Dynamic post/page route
    studio/[[...tool]]/page.tsx  # Embedded Sanity Studio
  sanity/
    client.ts           # Sanity client
    queries.ts          # GROQ queries
    schemas/
      index.ts
      post.ts           # Post schema (full)
      author.ts
      category.ts
      tag.ts
      seoFields.ts      # Reusable SEO object
scripts/
  import-from-wordpress.mjs   # The importer
```

---

## Sanity Schema Fields (Post)

| Field | Type | Description |
|-------|------|-------------|
| `wpId` | number | Original WordPress post ID |
| `title` | string | Post title |
| `slug` | slug | URL slug |
| `permalink` | string | Exact WP path e.g. `/my-post/` |
| `publishedAt` | datetime | Original publish date |
| `modifiedAt` | datetime | Last modified date |
| `status` | string | `publish` / `draft` / `private` |
| `author` | reference | → author doc |
| `featuredImage` | image | With alt, caption, original WP URL |
| `categories` | array | → category refs |
| `tags` | array | → tag refs |
| `excerpt` | text | Post excerpt |
| `body` | array | Portable Text (blocks + images) |
| `rawHtml` | text | Original WP HTML (backup) |
| `seo` | object | metaTitle, metaDescription, canonical, og*, twitter* |

---

## Notes

- Yoast SEO data is **not** exposed via the WP REST API without a plugin/auth token. The importer scrapes it from the rendered HTML `<head>` of each post URL.
- Body images inside `<figure>` blocks are **uploaded to Sanity** — no more dependency on WP media server.
- The `permalink` field stores the exact WordPress URL path so you can set up redirects or match routes precisely.
