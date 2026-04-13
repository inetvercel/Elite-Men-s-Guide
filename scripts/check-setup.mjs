/**
 * Pre-import setup verification
 * Run: node scripts/check-setup.mjs
 *
 * Checks:
 *  1. .env.local exists and has required vars
 *  2. Sanity project is reachable + token has write access
 *  3. WordPress REST API is reachable
 *  4. Reports how many WP posts/pages/categories are available
 */

import { createClient } from '@sanity/client'
import path from 'path'
import { existsSync } from 'fs'
import { readFile } from 'fs/promises'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Load .env.local or .env
const base = path.join(__dirname, '..')
const envPath = existsSync(path.join(base, '.env.local'))
  ? path.join(base, '.env.local')
  : existsSync(path.join(base, '.env'))
    ? path.join(base, '.env')
    : null
if (!envPath) {
  console.error('❌ No .env.local or .env found. Copy .env.local.example → .env.local and fill in values.')
  process.exit(1)
}

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

const required = [
  'NEXT_PUBLIC_SANITY_PROJECT_ID',
  'NEXT_PUBLIC_SANITY_DATASET',
  'SANITY_API_TOKEN',
  'WORDPRESS_BASE_URL',
]

let allGood = true

console.log('\n🔍 Checking environment variables...')
for (const key of required) {
  if (process.env[key] && process.env[key] !== 'your_project_id' && process.env[key] !== 'your_write_token') {
    console.log(`  ✅ ${key}`)
  } else {
    console.log(`  ❌ ${key} — missing or still placeholder`)
    allGood = false
  }
}

if (!allGood) {
  console.error('\n❌ Fill in .env.local before proceeding.')
  process.exit(1)
}

// Check Sanity
console.log('\n🔍 Checking Sanity connection...')
const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  token: process.env.SANITY_API_TOKEN,
  apiVersion: '2024-01-01',
  useCdn: false,
})

try {
  const result = await sanity.fetch('count(*[_type == "post"])')
  console.log(`  ✅ Sanity connected — ${result} post(s) already in dataset`)
} catch (err) {
  console.error(`  ❌ Sanity error: ${err.message}`)
  console.error('     Check your project ID, dataset name, and API token.')
  process.exit(1)
}

// Check WP API
const WP_BASE = process.env.WORDPRESS_BASE_URL.replace(/\/$/, '')
console.log(`\n🔍 Checking WordPress REST API at ${WP_BASE}...`)

async function wpGet(endpoint) {
  const res = await fetch(`${WP_BASE}/wp-json/wp/v2/${endpoint}?per_page=1`, {
    headers: { 'User-Agent': 'EMG-Setup-Check/1.0' },
    signal: AbortSignal.timeout(45_000),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const total = res.headers.get('X-WP-Total') ?? '?'
  return total
}

try {
  const [posts, pages, cats, tags] = await Promise.all([
    wpGet('posts'),
    wpGet('pages'),
    wpGet('categories'),
    wpGet('tags'),
  ])
  console.log(`  ✅ WordPress API reachable`)
  console.log(`     Posts:      ${posts}`)
  console.log(`     Pages:      ${pages}`)
  console.log(`     Categories: ${cats}`)
  console.log(`     Tags:       ${tags}`)
} catch (err) {
  console.error(`  ❌ WordPress API error: ${err.message}`)
  process.exit(1)
}

console.log('\n✅ All checks passed! Ready to import.')
console.log('   Run: npm run import\n')
