import { createClient } from '@sanity/client'
import { readFile, existsSync } from 'fs'
import { promisify } from 'util'
import path from 'path'
import { fileURLToPath } from 'url'

const readFileAsync = promisify(readFile)
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const envPath = path.join(__dirname, '..', '.env')
const raw = await readFileAsync(envPath, 'utf8')
for (const line of raw.split('\n')) {
  const t = line.trim()
  if (!t || t.startsWith('#')) continue
  const eq = t.indexOf('=')
  if (eq === -1) continue
  const k = t.slice(0, eq).trim(), v = t.slice(eq + 1).trim()
  if (!process.env[k]) process.env[k] = v
}

const c = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
})

const [total, noAsset, hasWpOnly] = await Promise.all([
  c.fetch('count(*[_type == "post" && status == "publish"])'),
  c.fetch('count(*[_type == "post" && status == "publish" && !defined(featuredImage.asset)])'),
  c.fetch('count(*[_type == "post" && status == "publish" && defined(featuredImage.wpUrl) && !defined(featuredImage.asset)])'),
])

console.log(`Total published posts:          ${total}`)
console.log(`Missing featuredImage.asset:    ${noAsset}`)
console.log(`Has wpUrl but no .asset:        ${hasWpOnly}`)
console.log(`Have proper Sanity asset:       ${total - noAsset}`)
