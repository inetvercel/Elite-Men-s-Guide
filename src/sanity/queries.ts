import { client } from './client'

export const postFields = `
  _id,
  wpId,
  title,
  "slug": slug.current,
  permalink,
  publishedAt,
  modifiedAt,
  status,
  excerpt,
  "featuredImage": featuredImage {
    alt,
    caption,
    wpUrl,
    "url": asset->url,
    asset
  },
  "categories": categories[]->{_id, name, "slug": slug.current},
  "tags": tags[]->{_id, name, "slug": slug.current},
  "author": author->{name, "slug": slug.current},
  seo
`

export const postBodyFields = `
  body[] {
    ...,
    _type == "image" => {
      ...,
      "url": asset->url,
      asset
    }
  }
`

const CACHE = { next: { revalidate: 3600 } }

export async function getAllPosts(limit = 100, offset = 0) {
  return client.fetch(
    `*[_type == "post" && status == "publish" && invisible != true] | order(publishedAt desc) [$offset...$end] {
      ${postFields}
    }`,
    { offset, end: offset + limit },
    CACHE
  )
}

export async function getPostBySlug(slug: string) {
  return client.fetch(
    `*[_type == "post" && slug.current == $slug][0] {
      ${postFields},
      ${postBodyFields},
      rawHtml
    }`,
    { slug },
    CACHE
  )
}

export async function getPostByPermalink(permalink: string) {
  return client.fetch(
    `*[_type == "post" && permalink == $permalink][0] {
      ${postFields},
      ${postBodyFields}
    }`,
    { permalink },
    CACHE
  )
}

export async function getAllPostSlugs() {
  return client.fetch(`*[_type == "post" && status == "publish" && invisible != true].slug.current`, {}, CACHE)
}

export async function getPostsByCategory(categorySlug: string, limit = 100) {
  return client.fetch(
    `*[_type == "post" && status == "publish" && invisible != true && $slug in categories[]->slug.current]
      | order(publishedAt desc)[0...$limit] {
      ${postFields}
    }`,
    { slug: categorySlug, limit },
    CACHE
  )
}

export async function getCategoryBySlug(slug: string) {
  return client.fetch(
    `*[_type == "category" && slug.current == $slug][0] {
      _id, name, "slug": slug.current, description,
      "parent": parent->{name, "slug": slug.current},
      "postCount": count(*[_type == "post" && status == "publish" && invisible != true && ^._id in categories[]._ref])
    }`,
    { slug },
    CACHE
  )
}

export async function getAllCategories() {
  return client.fetch(`*[_type == "category"] | order(name asc) {
    _id, name, "slug": slug.current, description, "parent": parent->{name, "slug": slug.current}
  }`, {}, CACHE)
}

export async function getTotalPostCount() {
  return client.fetch(`count(*[_type == "post" && status == "publish" && invisible != true])`, {}, CACHE)
}

export async function getRelatedPosts(currentSlug: string, categoryIds: string[], limit = 3) {
  return client.fetch(
    `*[
      _type == "post" &&
      status == "publish" &&
      invisible != true &&
      slug.current != $slug &&
      count((categories[]._ref)[@ in $catIds]) > 0 &&
      defined(featuredImage.asset)
    ] | order(publishedAt desc) [0...$limit] {
      ${postFields}
    }`,
    { slug: currentSlug, catIds: categoryIds, limit },
    CACHE
  )
}
