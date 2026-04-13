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

const TITLE = process.argv[2]
if (!TITLE) { console.error('Usage: node delete-post-by-title.mjs "Post Title"'); process.exit(1) }

const client = createClient({ projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID, dataset: 'production', apiVersion: '2024-01-01', token: process.env.SANITY_API_TOKEN, useCdn: false })

const posts = await client.fetch('*[_type == "post" && title == $title]{_id, title, "slug": slug.current}', { title: TITLE })
if (!posts.length) { console.log(`No posts found with title: "${TITLE}"`); process.exit(0) }

for (const p of posts) {
  await client.delete(p._id)
  console.log(`✅ Deleted: "${p.title}" (/${p.slug}) [${p._id}]`)
}
