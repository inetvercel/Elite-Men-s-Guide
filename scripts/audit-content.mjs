import { createClient } from '@sanity/client'
import path from 'path'
import { existsSync } from 'fs'
import { readFile, writeFile } from 'fs/promises'
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

const c = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',
  token: process.env.SANITY_API_TOKEN,
  apiVersion: '2024-01-01',
  useCdn: false,
})

// Find a post with a table and a post with a video
const [withTable, withVideo, lowBody, allTitles] = await Promise.all([
  c.fetch('*[_type=="post" && rawHtml match "*<table*"][0]{title,slug,rawHtml}'),
  c.fetch('*[_type=="post" && (rawHtml match "*youtube*" || rawHtml match "*iframe*" || rawHtml match "*wp-block-embed*")][0]{title,slug,rawHtml}'),
  c.fetch('*[_type=="post" && length(body) < 5][0..9]{title,slug,"bodyLen":length(body),rawHtml}'),
  c.fetch('*[_type=="post"]{title}'),
])

console.log('\n=== Posts with low body block count (may have parsing issues) ===')
for (const p of lowBody) {
  console.log(`  [${p.bodyLen} blocks] "${p.title}"`)
  if (p.rawHtml) console.log('    Raw snippet:', p.rawHtml.slice(0,200).replace(/\n/g,' '))
}

if (withTable) {
  console.log('\n=== Table sample ===')
  console.log('Post:', withTable.title)
  const tableMatch = withTable.rawHtml.match(/<table[\s\S]*?<\/table>/i)
  if (tableMatch) console.log(tableMatch[0].slice(0, 600))
}

if (withVideo) {
  console.log('\n=== Video/embed sample ===')
  console.log('Post:', withVideo.title)
  const iframe = withVideo.rawHtml.match(/<iframe[\s\S]*?>/i)
  const embed = withVideo.rawHtml.match(/wp-block-embed[\s\S]{0,300}/i)
  if (iframe) console.log('iframe:', iframe[0].slice(0,300))
  if (embed) console.log('embed block:', embed[0].slice(0,300))
}

// Check for HTML entities in titles
const badTitles = allTitles.filter(p => /&amp;|&quot;|&#\d+;|&lt;|&gt;/.test(p.title))
console.log(`\n=== Titles with HTML entities: ${badTitles.length} ===`)
for (const p of badTitles.slice(0, 10)) console.log(' ', p.title)

await writeFile(path.join(base, '.import-cache', 'audit.json'), JSON.stringify({ withTable, withVideo, lowBody }, null, 2))
console.log('\nFull audit saved to .import-cache/audit.json')
