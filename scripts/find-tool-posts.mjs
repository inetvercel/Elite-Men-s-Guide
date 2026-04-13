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

// Find posts whose title or slug suggests they are tools/calculators
const posts = await client.fetch(`*[_type == "post" && status == "publish"] | order(title asc) {
  _id, title, "slug": slug.current, "categories": categories[]->{name}
}`)

const toolKeywords = /calculator|tool|checker|quiz|bmi|body mass|resource center|health numbers/i
const tools = posts.filter(p => toolKeywords.test(p.title) || toolKeywords.test(p.slug))

console.log(`\nFound ${tools.length} likely tool posts:\n`)
for (const t of tools) {
  console.log(`  • "${t.title}"`)
  console.log(`    slug: /${t.slug}`)
  console.log(`    cats: ${t.categories?.map(c=>c.name).join(', ') || 'none'}\n`)
}
