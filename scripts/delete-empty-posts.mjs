/**
 * delete-empty-posts.mjs
 * Deletes all posts identified by audit-empty-posts.mjs as having no content.
 * Run audit-empty-posts.mjs first to generate .import-cache/empty-posts.json
 */
import { createClient } from '@sanity/client'
import { readFile } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function loadEnv() {
  const base = path.join(__dirname, '..')
  const envPath = existsSync(path.join(base, '.env.local'))
    ? path.join(base, '.env.local')
    : existsSync(path.join(base, '.env')) ? path.join(base, '.env') : null
  if (!envPath) return
  const raw = await readFile(envPath, 'utf8')
  for (const line of raw.split('\n')) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const eq = t.indexOf('=')
    if (eq === -1) continue
    const k = t.slice(0, eq).trim(), v = t.slice(eq + 1).trim()
    if (!process.env[k]) process.env[k] = v
  }
}
await loadEnv()

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

const reportPath = path.join(__dirname, '..', '.import-cache', 'empty-posts.json')
if (!existsSync(reportPath)) {
  console.error('❌  Run audit-empty-posts.mjs first to generate the report.')
  process.exit(1)
}

const { empty } = JSON.parse(await readFile(reportPath, 'utf8'))

if (!empty.length) {
  console.log('✅  No empty posts to delete.')
  process.exit(0)
}

console.log(`\n🗑  Deleting ${empty.length} empty posts...\n`)

let deleted = 0
for (const post of empty) {
  try {
    await client.delete(post._id)
    console.log(`  ✅  Deleted: "${post.title}" (/${post.slug})`)
    deleted++
  } catch (err) {
    console.log(`  ❌  Failed: "${post.title}" — ${err.message}`)
  }
}

console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
console.log(`✅  Deleted ${deleted} / ${empty.length} empty posts`)
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`)
