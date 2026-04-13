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

// 1. Create the Resources category if it doesn't exist
let cat = await client.fetch(`*[_type == "category" && name == "Resources"][0]{ _id, name }`)

if (!cat) {
  cat = await client.create({
    _type: 'category',
    name: 'Resources',
    slug: { _type: 'slug', current: 'resources' },
    description: 'In-depth, clinically referenced guides on men\'s health topics.',
  })
  console.log(`✓ Created category: "Resources" (${cat._id})`)
} else {
  console.log(`  Category already exists: "Resources" (${cat._id})`)
}

// 2. Assign to the depression post
const post = await client.fetch(
  `*[_type == "post" && slug.current == "symptoms-of-depression"][0]{ _id, title, "categories": categories[]._ref }`
)

if (post) {
  const alreadyHas = (post.categories || []).includes(cat._id)
  if (!alreadyHas) {
    const updated = [
      ...(post.categories || []).map(ref => ({ _type: 'reference', _ref: ref, _key: ref })),
      { _type: 'reference', _ref: cat._id, _key: cat._id },
    ]
    await client.patch(post._id).set({ categories: updated }).commit()
    console.log(`✓ Added "Resources" category to: "${post.title}"`)
  } else {
    console.log(`  Post already has "Resources" category`)
  }
} else {
  console.log('  Could not find symptoms-of-depression post')
}

console.log('\nDone. Resources category ID:', cat._id)
