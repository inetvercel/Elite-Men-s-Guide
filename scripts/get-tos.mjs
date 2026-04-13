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

const client = createClient({ projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID, dataset: 'production', apiVersion: '2024-01-01', useCdn: false })
const post = await client.fetch('*[_type == "post" && slug.current == "terms-service"][0]{title, rawHtml, body}')
console.log('Title:', post?.title)
console.log('Body blocks:', post?.body?.length)
console.log('Raw HTML length:', post?.rawHtml?.length)
console.log('\n--- RAW HTML (first 3000 chars) ---\n')
console.log(post?.rawHtml?.slice(0, 3000))
