/**
 * WordPress → Sanity Import Script
 * elitemensguide.com
 *
 * Imports: posts, pages, categories, tags, authors
 * Handles: featured images, body images, internal links, external links,
 *          SEO meta (from Yoast HTML head), exact WP permalinks,
 *          full portable text conversion with image upload to Sanity CDN,
 *          resumable (skip already-imported posts via wpId lookup).
 *
 * Usage:
 *   node scripts/import-from-wordpress.mjs
 *
 * Required env vars (.env.local):
 *   NEXT_PUBLIC_SANITY_PROJECT_ID
 *   NEXT_PUBLIC_SANITY_DATASET
 *   SANITY_API_TOKEN        (write access)
 *   WORDPRESS_BASE_URL      (default: https://elitemensguide.com)
 */

import { createClient } from '@sanity/client'
import { createReadStream } from 'fs'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import https from 'https'
import http from 'http'

// ---------------------------------------------------------------------------
// Load .env.local manually (no dotenv dep required — pure Node built-ins)
// ---------------------------------------------------------------------------
const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function loadEnv() {
  const base = path.join(__dirname, '..')
  const envPath = existsSync(path.join(base, '.env.local'))
    ? path.join(base, '.env.local')
    : existsSync(path.join(base, '.env'))
      ? path.join(base, '.env')
      : null
  if (!envPath) {
    console.warn('⚠  No .env.local or .env found — relying on existing process.env')
    return
  }
  const { readFile } = await import('fs/promises')
  const raw = await readFile(envPath, 'utf8')
  for (const line of raw.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx === -1) continue
    const key = trimmed.slice(0, eqIdx).trim()
    const val = trimmed.slice(eqIdx + 1).trim()
    if (!process.env[key]) process.env[key] = val
  }
}

await loadEnv()

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const WP_BASE = (process.env.WORDPRESS_BASE_URL ?? 'https://elitemensguide.com').replace(/\/$/, '')
const WP_API = `${WP_BASE}/wp-json/wp/v2`

const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',
  token: process.env.SANITY_API_TOKEN,
  apiVersion: '2024-01-01',
  useCdn: false,
})

const CACHE_DIR = path.join(__dirname, '..', '.import-cache')
if (!existsSync(CACHE_DIR)) await mkdir(CACHE_DIR, { recursive: true })

// ---------------------------------------------------------------------------
// Utility helpers
// ---------------------------------------------------------------------------

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

/**
 * Fetch JSON from a URL with retry + exponential back-off.
 */
async function fetchJson(url, retries = 5, delayMs = 1000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'EMG-Importer/1.0' },
        signal: AbortSignal.timeout(30_000),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)
      return await res.json()
    } catch (err) {
      if (attempt === retries) throw err
      console.warn(`  Retry ${attempt}/${retries} for ${url}: ${err.message}`)
      await sleep(delayMs * attempt)
    }
  }
}

/**
 * Fetch raw HTML from a URL (for Yoast SEO scraping).
 */
async function fetchHtml(url, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'EMG-Importer/1.0' },
        signal: AbortSignal.timeout(20_000),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return await res.text()
    } catch (err) {
      if (attempt === retries) return null
      await sleep(1500 * attempt)
    }
  }
  return null
}

/**
 * Download a binary URL and upload as a Sanity asset.
 * Returns the Sanity asset { _ref, _type: 'reference' } or null on failure.
 */
async function uploadImageToSanity(imageUrl, filename) {
  try {
    const res = await fetch(imageUrl, {
      headers: { 'User-Agent': 'EMG-Importer/1.0' },
      signal: AbortSignal.timeout(60_000),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const arrayBuffer = await res.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const ext = path.extname(filename || new URL(imageUrl).pathname).slice(1) || 'jpg'
    const mimeMap = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',
      svg: 'image/svg+xml',
    }
    const contentType = mimeMap[ext.toLowerCase()] ?? 'image/jpeg'

    const asset = await sanity.assets.upload('image', buffer, {
      filename: filename || path.basename(new URL(imageUrl).pathname),
      contentType,
    })

    return { _ref: asset._id, _type: 'reference' }
  } catch (err) {
    console.warn(`  ⚠  Image upload failed for ${imageUrl}: ${err.message}`)
    return null
  }
}

// ---------------------------------------------------------------------------
// Paginate all records from a WP REST endpoint
// ---------------------------------------------------------------------------
async function wpFetchAll(endpoint, params = {}) {
  const results = []
  let page = 1
  const perPage = 100

  while (true) {
    const qs = new URLSearchParams({ per_page: perPage, page, ...params }).toString()
    const url = `${WP_API}/${endpoint}?${qs}`
    let data
    try {
      data = await fetchJson(url)
    } catch (err) {
      console.warn(`  Could not fetch ${url}: ${err.message}`)
      break
    }
    if (!Array.isArray(data) || data.length === 0) break
    results.push(...data)
    if (data.length < perPage) break
    page++
    await sleep(200)
  }
  return results
}

// ---------------------------------------------------------------------------
// Yoast SEO extraction from HTML <head>
// ---------------------------------------------------------------------------
function extractYoastSeo(html, wpLink) {
  if (!html) return {}

  const get = (pattern) => {
    const m = html.match(pattern)
    return m ? m[1].replace(/&quot;/g, '"').replace(/&#039;/g, "'").trim() : undefined
  }

  return {
    metaTitle: get(/<title>([^<]+)<\/title>/)
      || get(/property="og:title"\s+content="([^"]+)"/),
    metaDescription: get(/name="description"\s+content="([^"]+)"/)
      || get(/property="og:description"\s+content="([^"]+)"/),
    canonicalUrl: get(/rel="canonical"\s+href="([^"]+)"/) || wpLink,
    ogTitle: get(/property="og:title"\s+content="([^"]+)"/),
    ogDescription: get(/property="og:description"\s+content="([^"]+)"/),
    ogImage: get(/property="og:image"\s+content="([^"]+)"/),
    twitterTitle: get(/name="twitter:title"\s+content="([^"]+)"/),
    twitterDescription: get(/name="twitter:description"\s+content="([^"]+)"/),
  }
}

// ---------------------------------------------------------------------------
// HTML → Portable Text conversion
// ---------------------------------------------------------------------------
/**
 * Very thorough HTML-to-Portable-Text parser using native DOM-like parsing
 * via regex walking (no jsdom required — zero extra deps).
 *
 * Handles: p, h1-h6, ul/ol/li, blockquote, a (internal/external),
 *          strong/b, em/i, u, s/del/strike, code, pre, figure/img,
 *          wp-block-image figures, inline images.
 */
/**
 * Decode common HTML entities to unicode.
 */
function decodeEntities(str) {
  if (!str) return str
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#8220;/g, '\u201c')
    .replace(/&#8221;/g, '\u201d')
    .replace(/&#8216;/g, '\u2018')
    .replace(/&#8217;/g, '\u2019')
    .replace(/&#8211;/g, '\u2013')
    .replace(/&#8212;/g, '\u2014')
    .replace(/&#038;/g, '&')
    .replace(/&#8230;/g, '\u2026')
    .replace(/&#8243;/g, '\u2033')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
}

function htmlToPortableText(html, wpBaseUrl) {
  if (!html) return []

  const blocks = []
  const internalDomain = new URL(wpBaseUrl).hostname

  // ---- Strip CDATA wrappers inserted by some WP themes/plugins ----
  // Pattern: <p><!\[CDATA\[ ... \]\]></p>  or bare <!\[CDATA\[ ... \]\]>
  let src = html
    .replace(/<p>\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*<\/p>/gi, '$1')
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, '$1')

  // Strip wrapping <section class="entry-content"> or similar containers
  src = src
    .replace(/<section[^>]*class="[^"]*entry-content[^"]*"[^>]*>([\s\S]*?)<\/section>/gi, '$1')
    .replace(/<div[^>]*class="[^"]*entry-content[^"]*"[^>]*>([\s\S]*?)<\/div>/gi, '$1')

  // Normalise whitespace
  src = src
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  // ---- Helpers ----

  function makeKey() {
    return Math.random().toString(36).slice(2, 10)
  }

  function isInternalUrl(href) {
    try {
      if (href.startsWith('/') || href.startsWith('#')) return true
      const u = new URL(href)
      return u.hostname === internalDomain
    } catch {
      return false
    }
  }

  /**
   * Rewrite internal absolute links to relative paths.
   * e.g. https://elitemensguide.com/my-post/ → /my-post/
   */
  function normaliseHref(href) {
    try {
      const u = new URL(href)
      if (u.hostname === internalDomain) {
        return u.pathname + u.search + u.hash
      }
    } catch {
      // relative already
    }
    return href
  }

  /**
   * Parse inline HTML into Portable Text spans with marks.
   */
  function parseInlineContent(inner, markDefs) {
    const spans = []

    function addSpan(text, marks = []) {
      if (!text) return
      spans.push({ _type: 'span', _key: makeKey(), text, marks })
    }

    function processSegment(segment, activeMarks) {
      // Link: <a href="...">text</a>
      const linkPattern = /<a\s+(?:[^>]*\s)?href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi
      // Bold
      const boldPattern = /<(?:strong|b)[^>]*>([\s\S]*?)<\/(?:strong|b)>/gi
      // Italic
      const emPattern = /<(?:em|i)[^>]*>([\s\S]*?)<\/(?:em|i)>/gi
      // Underline
      const uPattern = /<u[^>]*>([\s\S]*?)<\/u>/gi
      // Strike
      const sPattern = /<(?:s|del|strike)[^>]*>([\s\S]*?)<\/(?:s|del|strike)>/gi
      // Code
      const codePattern = /<code[^>]*>([\s\S]*?)<\/code>/gi

      let remaining = segment
      let lastIdx = 0

      // Combined walker
      const allPatterns = [
        { re: /<a\s+(?:[^>]*\s)?href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, type: 'link' },
        { re: /<(?:strong|b)[^>]*>([\s\S]*?)<\/(?:strong|b)>/gi, type: 'strong' },
        { re: /<(?:em|i)[^>]*>([\s\S]*?)<\/(?:em|i)>/gi, type: 'em' },
        { re: /<u[^>]*>([\s\S]*?)<\/u>/gi, type: 'underline' },
        { re: /<(?:s|del|strike)[^>]*>([\s\S]*?)<\/(?:s|del|strike)>/gi, type: 'strike-through' },
        { re: /<code[^>]*>([\s\S]*?)<\/code>/gi, type: 'code' },
      ]

      // Find the earliest match across all patterns
      function findFirst(str, startAt) {
        let earliest = null
        let earliestIdx = Infinity
        for (const { re, type } of allPatterns) {
          re.lastIndex = startAt
          const m = re.exec(str)
          if (m && m.index < earliestIdx) {
            earliest = { m, type }
            earliestIdx = m.index
          }
        }
        return earliest
      }

      let cursor = 0
      while (cursor < remaining.length) {
        const found = findFirst(remaining, cursor)
        if (!found) {
          const plain = stripTags(remaining.slice(cursor))
          if (plain) addSpan(plain, [...activeMarks])
          break
        }

        const { m, type } = found
        // Text before match
        const before = stripTags(remaining.slice(cursor, m.index))
        if (before) addSpan(before, [...activeMarks])

        if (type === 'link') {
          const href = m[1]
          const linkKey = makeKey()
          const internal = isInternalUrl(href)
          markDefs.push({
            _key: linkKey,
            _type: 'link',
            href: normaliseHref(href),
            blank: !internal,
            isInternal: internal,
          })
          const linkText = stripTags(m[2])
          if (linkText) addSpan(linkText, [...activeMarks, linkKey])
        } else {
          const inner2 = m[1] || m[2] || ''
          processSegment(inner2, [...activeMarks, type])
        }

        cursor = m.index + m[0].length
      }
    }

    processSegment(inner, [])
    return spans
  }

  function stripTags(str) {
    return decodeEntities(str.replace(/<[^>]+>/g, ''))
  }

  function makeTextBlock(style, innerHtml) {
    const markDefs = []
    const children = parseInlineContent(innerHtml, markDefs)
    if (children.length === 0) return null
    return {
      _type: 'block',
      _key: makeKey(),
      style,
      markDefs,
      children,
    }
  }

  function makeListItem(listType, innerHtml) {
    const markDefs = []
    const children = parseInlineContent(innerHtml, markDefs)
    return {
      _type: 'block',
      _key: makeKey(),
      style: 'normal',
      listItem: listType,
      level: 1,
      markDefs,
      children,
    }
  }

  /**
   * Parse full list <ul> or <ol> into multiple block list items.
   */
  function parseList(html, listType) {
    const items = []
    const liRe = /<li[^>]*>([\s\S]*?)<\/li>/gi
    let m
    while ((m = liRe.exec(html)) !== null) {
      items.push(makeListItem(listType, m[1]))
    }
    return items
  }

  /**
   * Extract image info from <figure> or <img> tag.
   */
  function extractImageInfo(html) {
    const srcMatch = html.match(/src="([^"]+)"/)
    const altMatch = html.match(/alt="([^"]*)"/)
    const captionMatch = html.match(/<figcaption[^>]*>([\s\S]*?)<\/figcaption>/)
    if (!srcMatch) return null
    // Use largest original image (strip WP size suffixes like -1024x683)
    let src = srcMatch[1]
    src = src.replace(/-\d+x\d+(\.[a-z]+)$/i, '$1')
    return {
      src,
      alt: altMatch ? stripTags(altMatch[1]) : '',
      caption: captionMatch ? stripTags(captionMatch[1]) : '',
    }
  }

  // ---------------------------------------------------------------------------
  // Top-level block parser
  // ---------------------------------------------------------------------------
  // We walk through the HTML token by token matching block-level elements
  const topLevelRe = new RegExp(
    [
      // figures (images, embeds)
      '(<figure[^>]*>[\\s\\S]*?<\\/figure>)',
      // headings
      '(<h([1-6])[^>]*>[\\s\\S]*?<\\/h\\3>)',
      // paragraphs
      '(<p[^>]*>[\\s\\S]*?<\\/p>)',
      // blockquote
      '(<blockquote[^>]*>[\\s\\S]*?<\\/blockquote>)',
      // ul
      '(<ul[^>]*>[\\s\\S]*?<\\/ul>)',
      // ol
      '(<ol[^>]*>[\\s\\S]*?<\\/ol>)',
      // pre/code
      '(<pre[^>]*>[\\s\\S]*?<\\/pre>)',
      // table (convert to embed)
      '(<table[\\s\\S]*?<\\/table>)',
      // iframes / embeds
      '(<iframe[^>]*>[\\s\\S]*?<\\/iframe>)',
      '(<iframe[^/]*/?>)',
    ].join('|'),
    'gi'
  )

  let match
  while ((match = topLevelRe.exec(src)) !== null) {
    const full = match[0]

    // Heading
    if (/^<h([1-6])/i.test(full)) {
      const level = full.match(/^<h([1-6])/i)[1]
      const inner = full.replace(/^<h[^>]+>/i, '').replace(/<\/h[1-6]>$/i, '')
      const block = makeTextBlock(`h${level}`, inner)
      if (block) blocks.push(block)
      continue
    }

    // Paragraph
    if (/^<p[\s>]/i.test(full)) {
      const inner = full.replace(/^<p[^>]*>/i, '').replace(/<\/p>$/i, '')
      const trimmedInner = inner.trim()
      // Skip empty paragraphs
      if (!trimmedInner || trimmedInner === '&nbsp;') continue
      // Paragraph containing only an image (possibly wrapped in <a>)
      const imgOnlyMatch = trimmedInner.match(/^(?:<a[^>]*>\s*)?(<img[^>]*\/>|<img[^>]*>)(?:\s*<\/a>)?$/i)
      if (imgOnlyMatch) {
        // Extract href from wrapping anchor if present
        const hrefMatch = trimmedInner.match(/^<a[^>]*href="([^"]+)"/i)
        const info = extractImageInfo(trimmedInner)
        if (info) {
          const imgBlock = {
            _type: 'image',
            _key: makeKey(),
            asset: { _ref: '__UPLOAD__', _wpUrl: info.src },
            alt: info.alt,
            caption: info.caption,
            wpUrl: info.src,
          }
          if (hrefMatch) imgBlock.linkHref = normaliseHref(hrefMatch[1])
          blocks.push(imgBlock)
        }
        continue
      }
      // Paragraph containing only an iframe/embed
      if (/^<iframe/i.test(trimmedInner)) {
        blocks.push({ _type: 'embedBlock', _key: makeKey(), html: trimmedInner })
        continue
      }
      const block = makeTextBlock('normal', inner)
      if (block) blocks.push(block)
      continue
    }

    // Blockquote
    if (/^<blockquote/i.test(full)) {
      const inner = full.replace(/^<blockquote[^>]*>/i, '').replace(/<\/blockquote>$/i, '')
      const block = makeTextBlock('blockquote', inner)
      if (block) blocks.push(block)
      continue
    }

    // Unordered list
    if (/^<ul/i.test(full)) {
      blocks.push(...parseList(full, 'bullet'))
      continue
    }

    // Ordered list
    if (/^<ol/i.test(full)) {
      blocks.push(...parseList(full, 'number'))
      continue
    }

    // Pre / code block
    if (/^<pre/i.test(full)) {
      const inner = stripTags(full)
      if (inner.trim()) {
        blocks.push({
          _type: 'block',
          _key: makeKey(),
          style: 'normal',
          markDefs: [],
          children: [{ _type: 'span', _key: makeKey(), text: inner.trim(), marks: ['code'] }],
        })
      }
      continue
    }

    // Figure (image or embed)
    if (/^<figure/i.test(full)) {
      // wp-block-embed (YouTube, Vimeo, etc.) → extract URL and make clean embed
      if (/wp-block-embed/i.test(full) || /<iframe/i.test(full)) {
        // Try to get a clean iframe from inside
        const iframeMatch = full.match(/<iframe[\s\S]*?(?:\/?>|<\/iframe>)/i)
        // Try to get YouTube/Vimeo URL from figcaption or div
        const urlMatch = full.match(/https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|vimeo\.com\/)[^\s"<']+/i)
        let embedHtml = iframeMatch ? iframeMatch[0] : full
        if (urlMatch && !iframeMatch) {
          // Build a clean embed URL
          const rawUrl = urlMatch[0]
          let embedUrl = rawUrl
          const ytMatch = rawUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]+)/i)
          const vimeoMatch = rawUrl.match(/vimeo\.com\/(?:video\/)?(\d+)/i)
          if (ytMatch) embedUrl = `https://www.youtube.com/embed/${ytMatch[1]}`
          else if (vimeoMatch) embedUrl = `https://player.vimeo.com/video/${vimeoMatch[1]}`
          embedHtml = `<iframe src="${embedUrl}" width="100%" height="450" frameborder="0" allowfullscreen loading="lazy"></iframe>`
        }
        blocks.push({ _type: 'embedBlock', _key: makeKey(), html: embedHtml })
        continue
      }
      // Image figure — image may be wrapped in <a>
      const info = extractImageInfo(full)
      if (info) {
        const hrefMatch = full.match(/<a[^>]*href="([^"]+)"/i)
        const imgBlock = {
          _type: 'image',
          _key: makeKey(),
          asset: { _ref: '__UPLOAD__', _wpUrl: info.src },
          alt: info.alt,
          caption: info.caption,
          wpUrl: info.src,
        }
        if (hrefMatch) imgBlock.linkHref = normaliseHref(hrefMatch[1])
        blocks.push(imgBlock)
      }
      continue
    }

    // Table → HTML embed block (preserves full formatting)
    if (/^<table/i.test(full)) {
      // Clean up excessive whitespace inside table
      const cleanTable = full
        .replace(/\n\s*\n/g, '\n')
        .replace(/\t/g, '')
      blocks.push({ _type: 'embedBlock', _key: makeKey(), html: cleanTable })
      continue
    }

    // Bare iframe → embed
    if (/^<iframe/i.test(full)) {
      // Normalise Vimeo/YouTube URLs
      let embedHtml = full
      const ytMatch = full.match(/src="[^"]*(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)[^"]*"/i)
      const vimeoMatch = full.match(/src="[^"]*vimeo\.com\/(?:video\/)?(\d+)[^"]*"/i)
      if (ytMatch) {
        embedHtml = full.replace(/src="[^"]*"/, `src="https://www.youtube.com/embed/${ytMatch[1]}"`)
      } else if (vimeoMatch) {
        embedHtml = full.replace(/src="[^"]*"/, `src="https://player.vimeo.com/video/${vimeoMatch[1]}"`)
      }
      // Ensure 100% width and standard attributes
      embedHtml = embedHtml
        .replace(/width="[^"]*"/, 'width="100%"')
        .replace(/height="[^"]*"/, 'height="450"')
      blocks.push({ _type: 'embedBlock', _key: makeKey(), html: embedHtml })
      continue
    }
  }

  return blocks
}

// ---------------------------------------------------------------------------
// Upload images found in Portable Text blocks
// ---------------------------------------------------------------------------
async function resolveBodyImages(blocks) {
  const resolved = []
  for (const block of blocks) {
    if (block._type === 'image' && block.asset?._wpUrl) {
      const url = block.asset._wpUrl
      console.log(`    Uploading body image: ${url}`)
      const assetRef = await uploadImageToSanity(url, path.basename(new URL(url).pathname))
      const newBlock = { ...block }
      if (assetRef) {
        newBlock.asset = assetRef
      } else {
        newBlock.asset = undefined
        newBlock._failedUrl = url
      }
      delete newBlock._wpUrl
      resolved.push(newBlock)
    } else {
      resolved.push(block)
    }
  }
  return resolved
}

// ---------------------------------------------------------------------------
// Phase 1: Import categories
// ---------------------------------------------------------------------------
async function importCategories(wpCategories) {
  console.log('\n📁 Importing categories...')
  const idMap = {} // wpId → sanityId

  // First pass: create all without parent refs
  for (const cat of wpCategories) {
    const existing = await sanity.fetch(
      `*[_type == "category" && wpId == $id][0]._id`,
      { id: cat.id }
    )
    if (existing) {
      idMap[cat.id] = existing
      console.log(`  ✓ Category already exists: ${cat.name}`)
      continue
    }

    const doc = {
      _type: 'category',
      wpId: cat.id,
      name: cat.name,
      slug: { _type: 'slug', current: cat.slug },
      description: cat.description || undefined,
      wpParentId: cat.parent || undefined,
    }

    const created = await sanity.create(doc)
    idMap[cat.id] = created._id
    console.log(`  ✅ Category created: ${cat.name}`)
    await sleep(150)
  }

  // Second pass: wire up parent references
  for (const cat of wpCategories) {
    if (!cat.parent || !idMap[cat.parent] || !idMap[cat.id]) continue
    await sanity
      .patch(idMap[cat.id])
      .set({ parent: { _type: 'reference', _ref: idMap[cat.parent] } })
      .commit()
    await sleep(100)
  }

  return idMap
}

// ---------------------------------------------------------------------------
// Phase 2: Import tags
// ---------------------------------------------------------------------------
async function importTags(wpTags) {
  console.log('\n🏷  Importing tags...')
  const idMap = {}

  for (const tag of wpTags) {
    const existing = await sanity.fetch(
      `*[_type == "tag" && wpId == $id][0]._id`,
      { id: tag.id }
    )
    if (existing) {
      idMap[tag.id] = existing
      continue
    }

    const doc = {
      _type: 'tag',
      wpId: tag.id,
      name: tag.name,
      slug: { _type: 'slug', current: tag.slug },
      description: tag.description || undefined,
    }

    const created = await sanity.create(doc)
    idMap[tag.id] = created._id
    console.log(`  ✅ Tag created: ${tag.name}`)
    await sleep(150)
  }

  return idMap
}

// ---------------------------------------------------------------------------
// Phase 3: Import authors
// ---------------------------------------------------------------------------
async function importAuthors(wpPosts) {
  console.log('\n👤 Importing authors...')
  const authorIds = [...new Set(wpPosts.map((p) => p.author).filter(Boolean))]
  const idMap = {}

  for (const authorId of authorIds) {
    const existing = await sanity.fetch(
      `*[_type == "author" && wpId == $id][0]._id`,
      { id: authorId }
    )
    if (existing) {
      idMap[authorId] = existing
      continue
    }

    let wpAuthor
    try {
      wpAuthor = await fetchJson(`${WP_API}/users/${authorId}`)
    } catch {
      console.warn(`  ⚠  Could not fetch author ${authorId}`)
      continue
    }

    const doc = {
      _type: 'author',
      wpId: wpAuthor.id,
      name: wpAuthor.name,
      slug: { _type: 'slug', current: wpAuthor.slug },
      bio: wpAuthor.description || undefined,
      url: wpAuthor.url || undefined,
    }

    const created = await sanity.create(doc)
    idMap[authorId] = created._id
    console.log(`  ✅ Author created: ${wpAuthor.name}`)
    await sleep(150)
  }

  return idMap
}

// ---------------------------------------------------------------------------
// Phase 4: Import posts (and pages)
// ---------------------------------------------------------------------------
async function importPosts(wpPosts, categoryIdMap, tagIdMap, authorIdMap) {
  console.log(`\n📝 Importing ${wpPosts.length} posts/pages...`)
  let imported = 0
  let skipped = 0
  let failed = 0

  for (const post of wpPosts) {
    try {
      // Check if already imported (resumable)
      const existing = await sanity.fetch(
        `*[_type == "post" && wpId == $id][0]._id`,
        { id: post.id }
      )
      if (existing) {
        skipped++
        continue
      }

      console.log(`\n  [${imported + 1}/${wpPosts.length}] "${decodeEntities(post.title.rendered)}"`)

      // ----------------------------------------------------------------
      // SEO: scrape Yoast from HTML <head>
      // ----------------------------------------------------------------
      const postHtml = await fetchHtml(post.link)
      const seoData = extractYoastSeo(postHtml, post.link)

      // ----------------------------------------------------------------
      // Featured image
      // ----------------------------------------------------------------
      let featuredImage = undefined
      if (post.featured_media && post._embedded?.['wp:featuredmedia']?.[0]) {
        const media = post._embedded['wp:featuredmedia'][0]
        const originalUrl =
          media.media_details?.sizes?.full?.source_url ||
          media.source_url

        console.log(`    Uploading featured image: ${originalUrl}`)
        const assetRef = await uploadImageToSanity(
          originalUrl,
          media.slug + path.extname(new URL(originalUrl).pathname)
        )
        if (assetRef) {
          featuredImage = {
            _type: 'image',
            asset: assetRef,
            alt: media.alt_text || '',
            caption: media.caption?.rendered ? stripTagsSimple(media.caption.rendered) : '',
            wpUrl: originalUrl,
          }
        }
      } else if (post.featured_media) {
        // Fetch media separately if not embedded
        try {
          const media = await fetchJson(`${WP_API}/media/${post.featured_media}`)
          const originalUrl =
            media.media_details?.sizes?.full?.source_url || media.source_url
          console.log(`    Uploading featured image (separate fetch): ${originalUrl}`)
          const assetRef = await uploadImageToSanity(
            originalUrl,
            media.slug + path.extname(new URL(originalUrl).pathname)
          )
          if (assetRef) {
            featuredImage = {
              _type: 'image',
              asset: assetRef,
              alt: media.alt_text || '',
              caption: media.caption?.rendered ? stripTagsSimple(media.caption.rendered) : '',
              wpUrl: originalUrl,
            }
          }
        } catch {
          console.warn(`    ⚠  Featured media ${post.featured_media} not found`)
        }
      }

      // ----------------------------------------------------------------
      // Body content → Portable Text
      // ----------------------------------------------------------------
      console.log(`    Converting body content...`)
      const rawBlocks = htmlToPortableText(post.content.rendered, WP_BASE)
      console.log(`    Uploading ${rawBlocks.filter((b) => b._type === 'image').length} body images...`)
      const bodyBlocks = await resolveBodyImages(rawBlocks)

      // ----------------------------------------------------------------
      // Exact permalink (path only, no domain)
      // ----------------------------------------------------------------
      let permalink
      try {
        permalink = new URL(post.link).pathname
      } catch {
        permalink = `/${post.slug}/`
      }

      // ----------------------------------------------------------------
      // Category & tag refs
      // ----------------------------------------------------------------
      const categoryRefs = (post.categories || [])
        .filter((id) => categoryIdMap[id])
        .map((id) => ({ _type: 'reference', _ref: categoryIdMap[id], _key: makeKey() }))

      const tagRefs = (post.tags || [])
        .filter((id) => tagIdMap[id])
        .map((id) => ({ _type: 'reference', _ref: tagIdMap[id], _key: makeKey() }))

      // ----------------------------------------------------------------
      // Author ref
      // ----------------------------------------------------------------
      const authorRef = authorIdMap[post.author]
        ? { _type: 'reference', _ref: authorIdMap[post.author] }
        : undefined

      // ----------------------------------------------------------------
      // Excerpt (strip HTML)
      // ----------------------------------------------------------------
      const excerpt = stripTagsSimple(post.excerpt?.rendered || '').replace(/\s+Read more.*$/i, '').trim()

      // ----------------------------------------------------------------
      // Assemble Sanity document
      // ----------------------------------------------------------------
      const doc = {
        _type: 'post',
        wpId: post.id,
        title: decodeEntities(post.title.rendered),
        slug: { _type: 'slug', current: post.slug },
        permalink,
        publishedAt: post.date_gmt ? new Date(post.date_gmt).toISOString() : undefined,
        modifiedAt: post.modified_gmt ? new Date(post.modified_gmt).toISOString() : undefined,
        status: post.status,
        author: authorRef,
        featuredImage,
        categories: categoryRefs.length ? categoryRefs : undefined,
        tags: tagRefs.length ? tagRefs : undefined,
        excerpt: excerpt || undefined,
        body: bodyBlocks,
        rawHtml: post.content.rendered,
        seo: {
          metaTitle: seoData.metaTitle || decodeEntities(post.title.rendered),
          metaDescription: seoData.metaDescription || excerpt || undefined,
          canonicalUrl: seoData.canonicalUrl,
          ogTitle: seoData.ogTitle || undefined,
          ogDescription: seoData.ogDescription || undefined,
          twitterTitle: seoData.twitterTitle || undefined,
          twitterDescription: seoData.twitterDescription || undefined,
        },
      }

      // ----------------------------------------------------------------
      // OG image upload (if separate from featured)
      // ----------------------------------------------------------------
      if (seoData.ogImage && !featuredImage) {
        const ogAsset = await uploadImageToSanity(seoData.ogImage, 'og-image.jpg')
        if (ogAsset) {
          doc.seo.ogImage = { _type: 'image', asset: ogAsset }
        }
      }

      await sanity.create(doc)
      imported++
      console.log(`    ✅ Imported successfully`)

      // Rate-limit: be gentle with the Sanity API
      await sleep(300)
    } catch (err) {
      failed++
      console.error(`  ❌ Failed to import post ${post.id}: ${err.message}`)
      console.error(err.stack)
    }
  }

  console.log(`\n  📊 Posts: ${imported} imported, ${skipped} skipped, ${failed} failed`)
}

function stripTagsSimple(html) {
  return decodeEntities(html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')).trim()
}

function makeKey() {
  return Math.random().toString(36).slice(2, 10)
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log('🚀 Elite Mens Guide — WordPress → Sanity Importer')
  console.log(`   Source: ${WP_BASE}`)
  console.log(`   Target: Sanity project ${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID} / ${process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production'}\n`)

  if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || !process.env.SANITY_API_TOKEN) {
    console.error('❌ Missing required env vars. Copy .env.local.example → .env.local and fill in values.')
    process.exit(1)
  }

  // ------------------------------------------------------------------
  // Fetch everything from WP
  // ------------------------------------------------------------------
  console.log('🔍 Fetching WordPress data...')

  const [wpCategories, wpTags, wpPosts, wpPages] = await Promise.all([
    wpFetchAll('categories'),
    wpFetchAll('tags'),
    wpFetchAll('posts', { _embed: 1 }),
    wpFetchAll('pages', { _embed: 1 }),
  ])

  console.log(`  Categories: ${wpCategories.length}`)
  console.log(`  Tags:       ${wpTags.length}`)
  console.log(`  Posts:      ${wpPosts.length}`)
  console.log(`  Pages:      ${wpPages.length}`)

  // Save raw data cache for debugging
  await writeFile(
    path.join(CACHE_DIR, 'wp-data.json'),
    JSON.stringify({ wpCategories, wpTags, postsCount: wpPosts.length, pagesCount: wpPages.length }, null, 2)
  )

  // ------------------------------------------------------------------
  // Import taxonomy + authors first
  // ------------------------------------------------------------------
  const allPosts = [...wpPosts, ...wpPages]
  const categoryIdMap = await importCategories(wpCategories)
  const tagIdMap = await importTags(wpTags)
  const authorIdMap = await importAuthors(allPosts)

  // ------------------------------------------------------------------
  // Import posts + pages
  // ------------------------------------------------------------------
  await importPosts(allPosts, categoryIdMap, tagIdMap, authorIdMap)

  console.log('\n\n🎉 Import complete!')
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
