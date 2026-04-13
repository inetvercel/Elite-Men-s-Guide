/**
 * fill-missing-images.mjs
 *
 * Finds posts with no featured image, searches Unsplash for a relevant photo,
 * uploads it to Sanity CDN, and patches the post document.
 *
 * Usage:
 *   node scripts/fill-missing-images.mjs           → process 5 posts (preview run)
 *   node scripts/fill-missing-images.mjs --limit=20 → process 20 posts
 *   node scripts/fill-missing-images.mjs --all      → process all missing
 *
 * No duplicate photos: used Unsplash IDs are saved to .import-cache/used-unsplash-ids.json
 */

import { createClient } from '@sanity/client'
import { createWriteStream, existsSync } from 'fs'
import { readFile, writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import https from 'https'
import { pipeline } from 'stream/promises'
import os from 'os'

// ── Env loader (same pattern as import-from-wordpress.mjs) ──────────────────
const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function loadEnv() {
  const base = path.join(__dirname, '..')
  const envPath = existsSync(path.join(base, '.env.local'))
    ? path.join(base, '.env.local')
    : existsSync(path.join(base, '.env'))
      ? path.join(base, '.env')
      : null
  if (!envPath) return
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

const UNSPLASH_KEY  = process.env.UNSPLASH_ACCESS_KEY
const PROJECT_ID    = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const DATASET       = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const API_TOKEN     = process.env.SANITY_API_TOKEN

if (!UNSPLASH_KEY) { console.error('❌  UNSPLASH_ACCESS_KEY not set'); process.exit(1) }
if (!PROJECT_ID)   { console.error('❌  NEXT_PUBLIC_SANITY_PROJECT_ID not set'); process.exit(1) }
if (!API_TOKEN)    { console.error('❌  SANITY_API_TOKEN not set'); process.exit(1) }

// ── Args ─────────────────────────────────────────────────────────────────────
const args   = process.argv.slice(2)
const ALL    = args.includes('--all')
const LIMIT  = ALL ? 9999 : (parseInt(args.find(a => a.startsWith('--limit='))?.split('=')[1] ?? '5') || 5)

console.log(`\n🖼  fill-missing-images — limit: ${ALL ? 'ALL' : LIMIT}\n`)

// ── Sanity client ─────────────────────────────────────────────────────────────
const sanity = createClient({
  projectId: PROJECT_ID,
  dataset: DATASET,
  apiVersion: '2024-01-01',
  token: API_TOKEN,
  useCdn: false,
})

// ── Cache dir for used photo IDs ──────────────────────────────────────────────
const CACHE_DIR  = path.join(__dirname, '..', '.import-cache')
const USED_IDS_PATH = path.join(CACHE_DIR, 'used-unsplash-ids.json')

async function loadUsedIds() {
  try {
    const raw = await readFile(USED_IDS_PATH, 'utf8')
    return new Set(JSON.parse(raw))
  } catch { return new Set() }
}

async function saveUsedIds(set) {
  await mkdir(CACHE_DIR, { recursive: true })
  await writeFile(USED_IDS_PATH, JSON.stringify([...set], null, 2))
}

// ── Unsplash photo fetch (random endpoint — 5000 req/hr, no rate limit issues) ─
async function searchUnsplash(query, usedIds, attempt = 0) {
  // Use /photos/random with a query topic — much higher rate limit than /search/photos
  const url = `https://api.unsplash.com/photos/random?query=${encodeURIComponent(query)}&orientation=landscape&content_filter=high&count=5`
  const data = await fetchJson(url, { Authorization: `Client-ID ${UNSPLASH_KEY}` })
  const photos = Array.isArray(data) ? data : (data?.results ?? [])
  if (!photos.length) return null

  for (const photo of photos) {
    if (!usedIds.has(photo.id)) return photo
  }

  // All 5 were duplicates — retry up to 3 times with different random batch
  if (attempt < 3) return searchUnsplash(query, usedIds, attempt + 1)
  return null
}

function fetchJson(url, headers = {}) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'Accept': 'application/json', ...headers } }, res => {
      let body = ''
      res.on('data', c => body += c)
      res.on('end', () => {
        try { resolve(JSON.parse(body)) }
        catch { reject(new Error(`JSON parse error for ${url}: ${body.slice(0, 200)}`)) }
      })
    }).on('error', reject)
  })
}

// ── Download image to temp file ───────────────────────────────────────────────
function downloadToTemp(url, filename) {
  return new Promise((resolve, reject) => {
    const dest = path.join(os.tmpdir(), filename)
    const file = createWriteStream(dest)
    https.get(url, res => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        // follow redirect
        https.get(res.headers.location, res2 => {
          pipeline(res2, file).then(() => resolve(dest)).catch(reject)
        }).on('error', reject)
        return
      }
      pipeline(res, file).then(() => resolve(dest)).catch(reject)
    }).on('error', reject)
  })
}

// ── Upload asset to Sanity ────────────────────────────────────────────────────
async function uploadToSanity(filePath, filename) {
  const { createReadStream } = await import('fs')
  return sanity.assets.upload('image', createReadStream(filePath), {
    filename,
    contentType: 'image/jpeg',
  })
}

// ── Build search query from post title + category ────────────────────────────
function decodeHtml(str) {
  return str
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#\d+;/g, ' ').replace(/&[a-z]+;/gi, ' ')
}

function buildSearchQuery(post) {
  const catName = decodeHtml(post.categories?.[0]?.name ?? '')
  const title = post.title
    // Remove site name suffixes like "– Elite Men's Guide" or "- ELITE MEN'S GUIDE"
    .replace(/\s*[–\-—]+\s*(elite\s*men'?s?\s*guide|emg)\s*/gi, '')
    // Remove trailing "– ..." anything after an em/en dash
    .replace(/\s*[–—]\s*.+$/, '')
    // Remove "Video" standalone word
    .replace(/\bvideo\b/gi, '')
    // Decode HTML entities
    .replace(/&#\d+;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&[a-z]+;/gi, ' ')
    // Strip filler words
    .replace(/\b(the|a|an|of|in|on|for|to|and|or|with|how|what|why|when|is|are|does|do|your|you|our|my|vs\.?)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 60)

  const terms = [catName, title].filter(Boolean).join(' ').trim()
  return terms.slice(0, 80)
}

// ── Upload with retry ─────────────────────────────────────────────────────────
async function uploadToSanityWithRetry(filePath, filename, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await uploadToSanity(filePath, filename)
    } catch (err) {
      if (attempt === retries) throw err
      console.log(`   ⚠  Upload attempt ${attempt} failed (${err.statusCode ?? err.message}) — retrying in ${attempt * 2}s…`)
      await new Promise(r => setTimeout(r, attempt * 2000))
    }
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────
const posts = await sanity.fetch(
  `*[_type == "post" && status == "publish" && !defined(featuredImage.asset)] | order(publishedAt desc) [0...$limit] {
    _id, title, "categories": categories[]->{name, "slug": slug.current}
  }`,
  { limit: LIMIT }
)

if (!posts.length) {
  console.log('✅  No posts missing a featured image!')
  process.exit(0)
}

console.log(`Found ${posts.length} posts without a featured image.\n`)

const usedIds = await loadUsedIds()
let patched = 0
let skipped = 0

for (const post of posts) {
  const query = buildSearchQuery(post)
  console.log(`\n[${patched + skipped + 1}/${posts.length}] "${post.title}"`)
  console.log(`   🔍 Unsplash query: "${query}"`)
  try {

  const photo = await searchUnsplash(query, usedIds)
  if (!photo) {
    console.log(`   ⚠  No unused photo found — skipping`)
    skipped++
    continue
  }

  console.log(`   📷 Photo: ${photo.id} by @${photo.user.username} — "${photo.description || photo.alt_description || 'untitled'}"`)

  // Download the "regular" size (1080px wide)
  const imgUrl = photo.urls.regular
  const tempFile = await downloadToTemp(imgUrl, `unsplash-${photo.id}.jpg`)

  // Upload to Sanity (with retry)
  const asset = await uploadToSanityWithRetry(tempFile, `unsplash-${photo.id}.jpg`)
  console.log(`   ⬆  Uploaded → ${asset._id}`)

  // Patch the post
  await sanity
    .patch(post._id)
    .set({
      featuredImage: {
        _type: 'image',
        asset: { _type: 'reference', _ref: asset._id },
        alt: photo.alt_description || photo.description || post.title,
        caption: `Photo by ${photo.user.name} on Unsplash`,
        wpUrl: photo.links.html,
      },
    })
    .commit()

  // Mark ID as used
  usedIds.add(photo.id)
  console.log(`   ✅  Patched post`)
  patched++

  // Trigger Unsplash download event (required by API guidelines)
  https.get(photo.links.download_location, { headers: { Authorization: `Client-ID ${UNSPLASH_KEY}` } }, () => {}).on('error', () => {})

  // Brief pause to respect rate limits (Unsplash free = 50 req/hr)
  await new Promise(r => setTimeout(r, 1500))
  } catch (err) {
    console.log(`   ❌  Error: ${err.message ?? err}`)
    skipped++
  }
}

await saveUsedIds(usedIds)

console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
console.log(`✅  Done — ${patched} patched, ${skipped} skipped`)
console.log(`📁  Used IDs saved to .import-cache/used-unsplash-ids.json`)
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`)
