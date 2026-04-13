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

const post = await client.fetch(
  `*[_type == "post" && slug.current == "symptoms-of-depression"][0]{
    _id, title, "slug": slug.current, excerpt, rawHtml,
    "bodyText": pt::text(body),
    "categories": categories[]->{name, "slug": slug.current},
    publishedAt, modifiedAt
  }`
)

console.log('\nTitle:', post?.title)
console.log('Slug:', post?.slug)
console.log('Excerpt:', post?.excerpt)
console.log('Categories:', post?.categories?.map((c) => c.name).join(', '))
console.log('\n--- Body Text (first 3000 chars) ---\n')
const body = post?.bodyText || post?.rawHtml?.replace(/<[^>]+>/g, ' ') || '(empty)'
console.log(body.slice(0, 3000))
