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

const toolsCatId = 'BsycCMsYX1ZJdBHTajR8G1'
const toolsCatRef = { _type: 'reference', _ref: toolsCatId, _key: toolsCatId }

// 1. Remove infographic (not a tool)
const infographic = await client.fetch(
  `*[_type == "post" && slug.current == "7-health-numbers-every-man-know"][0]{ _id, title, "categories": categories[]._ref }`
)
if (infographic) {
  const filtered = (infographic.categories || []).filter(ref => ref !== toolsCatId)
  await client.patch(infographic._id)
    .set({ categories: filtered.map(ref => ({ _type: 'reference', _ref: ref, _key: ref })) })
    .commit()
  console.log(`✓ Removed Tools category from: "${infographic.title}"`)
}

// 2. Restore Tools category to BMI Calculator (was incorrectly removed)
const bmiCalc = await client.fetch(
  `*[_type == "post" && slug.current == "emg-health-numbers-body-mass-index-calculator"][0]{ _id, title, "categories": categories[]._ref }`
)
if (bmiCalc) {
  const already = (bmiCalc.categories || []).includes(toolsCatId)
  if (!already) {
    const updated = [...(bmiCalc.categories || []).map(ref => ({ _type: 'reference', _ref: ref, _key: ref })), toolsCatRef]
    await client.patch(bmiCalc._id).set({ categories: updated }).commit()
    console.log(`✓ Restored Tools category to: "${bmiCalc.title}"`)
  } else {
    console.log(`  (BMI Calculator already has Tools category)`)
  }
}

console.log('\nDone.')
