import { createClient } from '@sanity/client'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  useCdn: false,
  apiVersion: '2023-01-01',
})

const posts = await client.fetch('*[_type == "post"] | order(title asc) {title, slug, body[]{_type, html}}')

const withVideo = posts.filter(p =>
  p.body && p.body.some(b =>
    b.html && (
      b.html.includes('youtube') ||
      b.html.includes('youtu.be') ||
      b.html.includes('vimeo') ||
      b.html.includes('<iframe') ||
      b.html.includes('video')
    )
  )
)

console.log(`\nFound ${withVideo.length} posts with video embeds:\n`)
withVideo.forEach(p => {
  const videoBlocks = p.body.filter(b => b.html && (b.html.includes('youtube') || b.html.includes('youtu.be') || b.html.includes('vimeo') || b.html.includes('<iframe') || b.html.includes('video')))
  videoBlocks.forEach(b => {
    // Extract src from iframe
    const srcMatch = b.html.match(/src=["']([^"']+)["']/)
    const src = srcMatch ? srcMatch[1] : '(no src found)'
    console.log(`  SLUG: /${p.slug.current}/`)
    console.log(`  TITLE: ${p.title}`)
    console.log(`  EMBED: ${src}`)
    console.log()
  })
})
