import { createClient } from '@sanity/client'
import { existsSync } from 'fs'
import { readFile } from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
async function loadEnv() {
  const base = path.join(__dirname, '..')
  const envPath = existsSync(path.join(base, '.env.local')) ? path.join(base, '.env.local') : path.join(base, '.env')
  const raw = await readFile(envPath, 'utf8')
  for (const line of raw.split('\n')) {
    const t = line.trim(); if (!t || t.startsWith('#')) continue
    const eq = t.indexOf('='); if (eq === -1) continue
    const k = t.slice(0, eq).trim(), v = t.slice(eq + 1).trim()
    if (!process.env[k]) process.env[k] = v
  }
}
await loadEnv()

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
})

// Slugs of posts that should NOT be in Tools & Calculators
const NON_TOOL_SLUGS = [
  'testosterone-resource-center',
  'emg-health-numbers-body-mass-index',
  'emg-health-numbers-waist-to-height-ratio',
  '7-health-numbers-every-man-should-know-infographic',
  'emg-health-numbers-testosterone-levels',
]

// First find the Tools & Calculators category ID
const toolsCat = await client.fetch(
  `*[_type == "category" && (name match "Tools*" || name match "*Calculators*")][0]{ _id, name }`
)

if (!toolsCat) {
  console.error('Could not find Tools & Calculators category')
  process.exit(1)
}
console.log(`\nFound category: "${toolsCat.name}" (${toolsCat._id})\n`)

// Fetch the posts
const posts = await client.fetch(
  `*[_type == "post" && slug.current in $slugs]{ _id, title, "slug": slug.current, "categories": categories[]._ref }`,
  { slugs: NON_TOOL_SLUGS }
)

if (!posts.length) {
  console.log('No matching posts found. Check slugs.')
  process.exit(0)
}

for (const post of posts) {
  const filtered = (post.categories || []).filter(ref => ref !== toolsCat._id)
  await client.patch(post._id)
    .set({ categories: filtered.map(ref => ({ _type: 'reference', _ref: ref, _key: ref })) })
    .commit()
  console.log(`✓ Removed Tools category from: "${post.title}"`)
}

console.log('\nDone.')
