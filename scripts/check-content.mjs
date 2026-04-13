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

const c = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',
  token: process.env.SANITY_API_TOKEN,
  apiVersion: '2024-01-01',
  useCdn: false,
})

const [total, withImg, sample, sampleRaw] = await Promise.all([
  c.fetch('count(*[_type=="post"])'),
  c.fetch('count(*[_type=="post" && defined(featuredImage.asset)])'),
  c.fetch('*[_type=="post"][0..4]{title,slug,"bodyLen":length(body),"hasRaw":defined(rawHtml)}'),
  c.fetch('*[_type=="post" && defined(rawHtml)][0]{title,rawHtml}'),
])

console.log('\n=== Content Audit ===')
console.log(`Total posts:        ${total}`)
console.log(`With featured img:  ${withImg}`)
console.log('\nSample posts:')
for (const p of sample) {
  console.log(`  "${p.title}" — body blocks: ${p.bodyLen ?? 0}, hasRaw: ${p.hasRaw}`)
}
if (sampleRaw) {
  console.log('\nRaw HTML sample (first 800 chars):')
  console.log(sampleRaw.rawHtml?.slice(0, 800))
}
