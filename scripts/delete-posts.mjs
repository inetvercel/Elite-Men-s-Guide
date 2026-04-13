/**
 * Deletes all post documents from Sanity (leaves categories/tags/authors intact).
 * Run standalone or as part of: npm run reimport
 */
import { createClient } from '@sanity/client'
import path from 'path'
import { existsSync } from 'fs'
import { readFile } from 'fs/promises'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const base = path.join(__dirname, '..')
const envPath = existsSync(path.join(base, '.env.local')) ? path.join(base, '.env.local') : path.join(base, '.env')
const raw = await readFile(envPath, 'utf8')
for (const line of raw.split('\n')) {
  const t = line.trim(); if (!t || t.startsWith('#')) continue
  const eq = t.indexOf('='); if (eq === -1) continue
  const k = t.slice(0, eq).trim(), v = t.slice(eq + 1).trim()
  if (!process.env[k]) process.env[k] = v
}

const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',
  token: process.env.SANITY_API_TOKEN,
  apiVersion: '2024-01-01',
  useCdn: false,
})

console.log('🗑  Fetching existing post documents...')
const ids = await sanity.fetch('*[_type == "post"]._id')
console.log(`   Found ${ids.length} posts`)

if (ids.length === 0) {
  console.log('   Nothing to delete.')
  process.exit(0)
}

const BATCH = 100
for (let i = 0; i < ids.length; i += BATCH) {
  const batch = ids.slice(i, i + BATCH)
  const tx = sanity.transaction()
  for (const id of batch) tx.delete(id)
  await tx.commit()
  console.log(`   Deleted ${Math.min(i + BATCH, ids.length)}/${ids.length}`)
}

console.log('✅ All posts deleted.\n')
