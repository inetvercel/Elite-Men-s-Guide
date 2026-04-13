/**
 * verify-youtube-cache.mjs
 * Checks every video ID in youtube-cache.json via YouTube's oEmbed endpoint
 * (no API key needed, no quota). Flags any that are dead/unavailable.
 *
 * Run: node --env-file=.env scripts/verify-youtube-cache.mjs
 */

import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const CACHE_FILE = join(__dirname, '..', 'src', 'data', 'youtube-cache.json')

const cache = JSON.parse(readFileSync(CACHE_FILE, 'utf8'))

async function isAvailable(videoId) {
  try {
    const url = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) })
    return res.ok
  } catch {
    return false
  }
}

console.log(`\nVerifying ${Object.keys(cache).length} cached video IDs via oEmbed...\n`)

const dead = []
for (const [slug, entry] of Object.entries(cache)) {
  const ok = await isAvailable(entry.videoId)
  const mark = ok ? '✓' : '✗ DEAD'
  console.log(`  ${mark}  ${entry.videoId}  ${slug}`)
  if (!ok) dead.push(slug)
  await new Promise(r => setTimeout(r, 150))
}

console.log(`\n${ dead.length === 0 ? '✅ All videos OK!' : `⚠️  ${dead.length} dead video(s):\n` + dead.map(s => '  - ' + s).join('\n') }`)
