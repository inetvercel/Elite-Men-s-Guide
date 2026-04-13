import { createClient } from '@sanity/client'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  useCdn: false,
  apiVersion: '2023-01-01',
})

const posts = await client.fetch(
  '*[_type == "post"] | order(title asc) { title, slug, "hasImage": defined(featuredImage.asset) }'
)

const missing = posts.filter(p => !p.hasImage)
const hasImage = posts.filter(p => p.hasImage)

console.log(`\nTotal posts:          ${posts.length}`)
console.log(`Has featured image:   ${hasImage.length}`)
console.log(`Missing image:        ${missing.length}\n`)

missing.forEach(p => console.log(`  - /${p.slug?.current}/  →  ${p.title}`))
