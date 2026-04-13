/**
 * build-youtube-cache.mjs
 * Searches YouTube for the best matching video for every post that contains
 * a dead Vimeo or YouTube-playlist embed. Writes results to:
 *   src/data/youtube-cache.json
 *
 * Run: node --env-file=.env scripts/build-youtube-cache.mjs
 */

import { createClient } from '@sanity/client'
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const OUT_FILE = join(ROOT, 'src', 'data', 'youtube-cache.json')

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY
if (!YOUTUBE_API_KEY) { console.error('Missing YOUTUBE_API_KEY'); process.exit(1) }

const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  useCdn: false,
  apiVersion: '2023-01-01',
})

// Load existing cache so we only call API for new/missing entries
const existing = existsSync(OUT_FILE) ? JSON.parse(readFileSync(OUT_FILE, 'utf8')) : {}

// ── Helpers ────────────────────────────────────────────────────────────────

function hasDeadEmbed(body) {
  return body?.some(b => {
    if (b._type !== 'embedBlock' || !b.html) return false
    const h = b.html
    return (
      h.includes('player.vimeo.com') ||
      h.includes('vimeo.com/video') ||
      h.includes('videoseries?list=') // dead YT playlists
    )
  })
}

/** Parse ISO 8601 duration (PT4M13S) to seconds */
function parseDuration(iso) {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!m) return 0
  return (parseInt(m[1] || 0) * 3600) + (parseInt(m[2] || 0) * 60) + parseInt(m[3] || 0)
}

/** Build a good search query from post title */
function buildQuery(title) {
  const cleaned = title
    .replace(/[-–—]\s*(elite\s*men['']?s?\s*guide|emg)/gi, '')
    .replace(/\bvideo\b/gi, '')
    .replace(/:\s*\d+\s*hd\s*videos?/gi, '')  // strip "14 HD Videos" counts
    .replace(/\s+/g, ' ')
    .trim()

  // Non-exercise topics get a different suffix
  const isExercise = /exercise|workout|stretch|plank|crunch|squat|curl|press|raise|twist|sit.?up|lower back|ab /i.test(cleaned)
  const isMedical  = /testosterone|therapy|blood pressure|blood sugar|glucose|cholesterol/i.test(cleaned)

  if (isMedical) return cleaned + ' explained'
  if (isExercise) return cleaned + ' full tutorial'
  return cleaned + ' guide'
}

/** Fetch durations + status for a list of video IDs */
async function getVideoDetails(ids) {
  const url = new URL('https://www.googleapis.com/youtube/v3/videos')
  url.searchParams.set('part', 'contentDetails,status')
  url.searchParams.set('id', ids.join(','))
  url.searchParams.set('key', YOUTUBE_API_KEY)
  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`Videos API error ${res.status}`)
  const data = await res.json()
  return data.items ?? []
}

/** Call YouTube Data API v3 search, return best video (longest ≥ 3 min, embeddable) */
async function searchYouTube(query) {
  const url = new URL('https://www.googleapis.com/youtube/v3/search')
  url.searchParams.set('part', 'snippet')
  url.searchParams.set('q', query)
  url.searchParams.set('type', 'video')
  url.searchParams.set('videoEmbeddable', 'true')
  url.searchParams.set('videoDuration', 'medium')  // 4–20 min bracket
  url.searchParams.set('maxResults', '10')
  url.searchParams.set('safeSearch', 'moderate')
  url.searchParams.set('relevanceLanguage', 'en')
  url.searchParams.set('key', YOUTUBE_API_KEY)

  const res = await fetch(url.toString())
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`YouTube API error ${res.status}: ${err}`)
  }
  const data = await res.json()
  const ids = (data.items ?? []).map(i => i.id.videoId).filter(Boolean)
  if (!ids.length) return null

  // Verify embeddability + duration via Videos API
  const details = await getVideoDetails(ids)

  let best = null
  let bestSeconds = 0
  for (const v of details) {
    // Skip private, unlisted-if-not-embeddable, or non-embeddable videos
    const status = v.status ?? {}
    if (status.privacyStatus === 'private') continue
    if (status.embeddable === false) continue

    const secs = parseDuration(v.contentDetails?.duration ?? '')
    if (secs >= 180 && secs > bestSeconds) {
      bestSeconds = secs
      best = v.id
    }
  }
  // Fall back to first embeddable result if nothing ≥ 3 min passed
  if (!best) {
    for (const v of details) {
      if ((v.status?.privacyStatus !== 'private') && (v.status?.embeddable !== false)) {
        best = v.id
        break
      }
    }
  }
  return best ?? null
}

// ── Main ───────────────────────────────────────────────────────────────────

const posts = await sanity.fetch(
  '*[_type == "post"] | order(slug.current asc) {title, slug, body[]{_type, html}}'
)

// Deduplicate by slug (some posts are duplicated in Sanity)
const seen = new Set()
const toProcess = posts.filter(p => {
  if (seen.has(p.slug?.current)) return false
  seen.add(p.slug?.current)
  return hasDeadEmbed(p.body)
})

console.log(`\nPosts with dead embeds: ${toProcess.length}`)
console.log(`Already cached:        ${Object.keys(existing).length}`)

const cache = { ...existing }
let added = 0
let skipped = 0
let failed = 0

for (const post of toProcess) {
  const slug = post.slug.current
  if (cache[slug]) {
    skipped++
    continue
  }

  const query = buildQuery(post.title)
  process.stdout.write(`  Searching: "${query.substring(0, 60)}"... `)

  try {
    const videoId = await searchYouTube(query)
    if (videoId) {
      cache[slug] = { videoId, title: post.title, query }
      console.log(`✓ ${videoId}`)
      added++
    } else {
      console.log('✗ no result')
      failed++
    }
  } catch (e) {
    console.log(`✗ ERROR: ${e.message}`)
    failed++
  }

  // Respect API rate limit — 1 request per 200ms
  await new Promise(r => setTimeout(r, 220))
}

// Write output
const dataDir = join(ROOT, 'src', 'data')
if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true })
writeFileSync(OUT_FILE, JSON.stringify(cache, null, 2))

console.log(`\nDone. Added: ${added}, Skipped (cached): ${skipped}, Failed: ${failed}`)
console.log(`Cache written to: src/data/youtube-cache.json`)
