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
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

// ── 1. Create (or find) the Tools & Calculators category ────────────────────
let toolsCat = await client.fetch('*[_type == "category" && slug.current == "tools"][0]{_id, name}')

if (!toolsCat) {
  toolsCat = await client.create({
    _type: 'category',
    name: 'Tools & Calculators',
    slug: { _type: 'slug', current: 'tools' },
    description: 'Free health and fitness calculators and tools for men.',
  })
  console.log(`✅ Created category: "Tools & Calculators" (${toolsCat._id})`)
} else {
  console.log(`ℹ️  Category already exists: "${toolsCat.name}" (${toolsCat._id})`)
}

// ── 2. Tool post slugs to assign ────────────────────────────────────────────
const toolSlugs = [
  '7-health-numbers-every-man-know',
  'basal-metabolic-rate-bmr-calculator',
  'body-mass-index',
  'emg-health-numbers-body-mass-index-calculator',
  'emg-health-numbers-body-mass-index',
  'emg-health-numbers-testosterone-levels',
  'emg-health-numbers-waist-to-height-ratio',
  'testosterone-resource-center',
  'waist-to-height-ratio',
]

// ── 3. Patch each post to include the tools category ────────────────────────
for (const slug of toolSlugs) {
  const post = await client.fetch(
    '*[_type == "post" && slug.current == $slug][0]{_id, title, "cats": categories[]._ref}',
    { slug }
  )
  if (!post) { console.log(`  ⚠  Not found: /${slug}`); continue }

  // Only add if not already in the category
  if (post.cats?.includes(toolsCat._id)) {
    console.log(`  ↩  Already has Tools: "${post.title}"`)
    continue
  }

  await client
    .patch(post._id)
    .setIfMissing({ categories: [] })
    .append('categories', [{ _type: 'reference', _ref: toolsCat._id, _key: `tools-${Date.now()}` }])
    .commit()

  console.log(`  ✅ Tagged: "${post.title}"`)
  await new Promise(r => setTimeout(r, 200))
}

console.log('\n🎉 Done — all tool posts now assigned to "Tools & Calculators"')
