/**
 * audit-empty-posts.mjs
 * Finds posts with no body content (or only 1 empty block) and no rawHtml,
 * plus posts with very short content. Outputs a JSON report.
 */
import { createClient } from '@sanity/client'
import { writeFile, mkdir } from 'fs/promises'
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
  const { readFile } = await import('fs/promises')
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

const posts = await client.fetch(`
  *[_type == "post" && status == "publish"] | order(publishedAt desc) {
    _id, title, "slug": slug.current, permalink, publishedAt,
    "bodyLen": length(body),
    "rawHtmlLen": length(rawHtml),
    "rawHtmlSnip": rawHtml[0..300],
    "categories": categories[]->{name, "slug": slug.current}
  }
`)

const CACHE = path.join(__dirname, '..', '.import-cache')
await mkdir(CACHE, { recursive: true })

const empty = []
const thin  = []

for (const p of posts) {
  const hasBody   = p.bodyLen > 1
  const hasRaw    = p.rawHtmlLen > 50
  const rawIsJunk = !hasRaw || /^\s*(<p>)?(<!\[CDATA\[)?\s*(<\/p>)?\s*$/.test(p.rawHtmlSnip ?? '')

  if (!hasBody && rawIsJunk) {
    empty.push({ _id: p._id, title: p.title, slug: p.slug, permalink: p.permalink, categories: p.categories })
  } else if (!hasBody && hasRaw && p.rawHtmlLen < 400) {
    thin.push({ _id: p._id, title: p.title, slug: p.slug, bodyLen: p.bodyLen, rawHtmlLen: p.rawHtmlLen, rawSnip: p.rawHtmlSnip })
  }
}

const report = { empty, thin, totalPosts: posts.length }
await writeFile(path.join(CACHE, 'empty-posts.json'), JSON.stringify(report, null, 2))

console.log(`\nTotal published posts: ${posts.length}`)
console.log(`\n🗑  Empty posts (${empty.length}):`)
empty.forEach(p => console.log(`  [${p._id}] "${p.title}" → /${p.slug}`))
console.log(`\n📄  Thin posts (${thin.length}):`)
thin.forEach(p => console.log(`  [${p._id}] "${p.title}" → /${p.slug}  (rawHtml: ${p.rawHtmlLen} chars)`))
console.log(`\nFull report → .import-cache/empty-posts.json\n`)
