import type { MetadataRoute } from 'next'
import { client } from '@/sanity/client'

export const revalidate = 43200

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://elitemensguide.com'

const STATIC_PAGES: MetadataRoute.Sitemap = [
  { url: `${BASE_URL}/about/`,         changeFrequency: 'monthly',  priority: 0.6 },
  { url: `${BASE_URL}/contact/`,       changeFrequency: 'monthly',  priority: 0.4 },
  { url: `${BASE_URL}/terms-service/`, changeFrequency: 'yearly',   priority: 0.3 },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, categories] = await Promise.all([
    client.fetch<{ slug: string; modifiedAt: string; publishedAt: string }[]>(
      `*[_type == "post" && status == "publish"] | order(publishedAt desc) {
        "slug": slug.current,
        modifiedAt,
        publishedAt
      }`
    ),
    client.fetch<{ slug: string }[]>(
      `*[_type == "category"] { "slug": slug.current }`
    ),
  ])

  const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${BASE_URL}/${post.slug}`,
    lastModified: post.modifiedAt ?? post.publishedAt,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  const categoryEntries: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${BASE_URL}/category/${cat.slug}/`,
    changeFrequency: 'daily',
    priority: 0.7,
  }))

  return [
    {
      url: BASE_URL,
      lastModified: new Date().toISOString(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...categoryEntries,
    ...postEntries,
    ...STATIC_PAGES,
  ]
}
