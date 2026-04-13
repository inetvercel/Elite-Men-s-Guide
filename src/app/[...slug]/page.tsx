export const revalidate = 3600

import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { getPostBySlug, getRelatedPosts, getAllPostSlugs } from '@/sanity/queries'
import { PortableText } from '@portabletext/react'
import imageUrlBuilder from '@sanity/image-url'
import { client } from '@/sanity/client'
import Image from 'next/image'
import youtubeCache from '@/data/youtube-cache.json'

export async function generateStaticParams() {
  const slugs: string[] = await getAllPostSlugs()
  return slugs.map((slug) => ({ slug: [slug] }))
}

const builder = imageUrlBuilder(client)
function urlFor(source: any) {
  return builder.image(source)
}

const cache = youtubeCache as Record<string, { videoId: string; title: string }>

function isDeadEmbed(html: string) {
  return (
    html.includes('player.vimeo.com') ||
    html.includes('vimeo.com/video') ||
    html.includes('videoseries?list=')
  )
}

function makePtComponents(slug: string, featuredAssetRef?: string) {
  const entry = cache[slug]
  let ytUsed = false // render the YouTube embed only once per post
  let firstImageSkipped = false // skip first body image if it matches featured

  return {
    block: {
      normal: ({ children }: any) => {
        const clean = Array.isArray(children)
          ? children.filter((c: any) => {
              const t = typeof c === 'string' ? c : (c?.props?.children ?? '')
              return typeof t === 'string' ? t.replace(/[\s\n\r]/g, '') !== '' : true
            })
          : children
        const text = Array.isArray(clean)
          ? clean.map((c: any) => (typeof c === 'string' ? c : c?.props?.children ?? '')).join('')
          : ''
        if (!text.replace(/[\s\n\r]/g, '')) return null
        return <p>{clean}</p>
      },
      h1: ({ children }: any) => <h1>{children}</h1>,
      h2: ({ children }: any) => <h2>{children}</h2>,
      h3: ({ children }: any) => <h3>{children}</h3>,
      h4: ({ children }: any) => <h4>{children}</h4>,
      h5: ({ children }: any) => <h5>{children}</h5>,
      h6: ({ children }: any) => <h6>{children}</h6>,
      blockquote: ({ children }: any) => <blockquote>{children}</blockquote>,
    },
    types: {
      image: ({ value }: any) => {
        if (!value?.asset) return null
        const assetRef: string = value.asset?._ref ?? value.asset?._id ?? ''
        // Skip if this is the same asset as the featured image (duplicate)
        if (featuredAssetRef && assetRef && assetRef === featuredAssetRef && !firstImageSkipped) {
          firstImageSkipped = true
          return null
        }
        return (
          <figure>
            <Image
              src={urlFor(value).width(760).auto('format').url()}
              alt={value.alt || ''}
              width={760}
              height={440}
              sizes="(max-width:800px) 100vw, 760px"
            />
            {value.caption && <figcaption>{value.caption}</figcaption>}
          </figure>
        )
      },
      embedBlock: ({ value }: any) => {
        const html: string = value.html ?? ''
        if (!html) return null
        const isTable = /^\s*<table/i.test(html)
        const isIframe = /<iframe/i.test(html)
        if (isTable) {
          return (
            <div className="table-wrap" dangerouslySetInnerHTML={{ __html: html }} />
          )
        }
        if (isIframe) {
          if (isDeadEmbed(html)) {
            if (entry && !ytUsed) {
              ytUsed = true
              return (
                <div className="yt-embed-wrap">
                  <iframe
                    src={`https://www.youtube.com/embed/${entry.videoId}`}
                    title={entry.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )
            }
            return null
          }
          const cleaned = html
            .replace(/\s*width="[^"]*"/gi, '')
            .replace(/\s*height="[^"]*"/gi, '')
            .replace(/\s*style="[^"]*"/gi, '')
          return (
            <div className="embed-wrap" dangerouslySetInnerHTML={{ __html: cleaned }} />
          )
        }
        return <div dangerouslySetInnerHTML={{ __html: html }} />
      },
    },
    marks: {
      link: ({ children, value }: any) => (
        <a
          href={value?.href}
          rel={value?.blank ? 'noopener noreferrer' : undefined}
          target={value?.blank ? '_blank' : undefined}
        >
          {children}
        </a>
      ),
    },
  }
}

type Props = { params: Promise<{ slug: string[] }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug: slugParts } = await params
  const slug = slugParts.join('/')
  const post = await getPostBySlug(slug)
  if (!post) return {}
  const ogImageUrl = post.featuredImage?.asset
    ? urlFor(post.featuredImage.asset).width(1200).height(630).fit('crop').auto('format').url()
    : undefined
  return {
    title: post.seo?.metaTitle || post.title,
    description: post.seo?.metaDescription || post.excerpt,
    alternates: { canonical: post.seo?.canonicalUrl || post.permalink },
    openGraph: {
      title: post.seo?.ogTitle || post.title,
      description: post.seo?.ogDescription || post.excerpt,
      type: 'article',
      publishedTime: post.publishedAt,
      modifiedTime: post.modifiedAt,
      ...(ogImageUrl ? { images: [{ url: ogImageUrl, width: 1200, height: 630 }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: post.seo?.ogTitle || post.title,
      description: post.seo?.ogDescription || post.excerpt,
      ...(ogImageUrl ? { images: [ogImageUrl] } : {}),
    },
  }
}

function hasContent(post: any): boolean {
  const hasBody = Array.isArray(post.body) && post.body.length > 1
  const hasRaw  = typeof post.rawHtml === 'string' && post.rawHtml.replace(/<[^>]+>/g, '').trim().length > 80
  return hasBody || hasRaw
}

export default async function PostPage({ params }: Props) {
  const { slug: slugParts } = await params
  const slug = slugParts[slugParts.length - 1]
  const post = await getPostBySlug(slug)
  if (!post) notFound()

  const catIds: string[] = (post.categories ?? []).map((c: any) => c._id).filter(Boolean)
  const related = catIds.length > 0 ? await getRelatedPosts(slug, catIds, 3) : []

  // Redirect empty posts to their category or homepage
  if (!hasContent(post)) {
    const catSlug = post.categories?.[0]?.slug
    redirect(catSlug ? `/category/${catSlug}` : '/')
  }

  const fmt = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  const publishedDate = post.publishedAt ? fmt(post.publishedAt) : null
  const modifiedDate  = post.modifiedAt && post.modifiedAt !== post.publishedAt ? fmt(post.modifiedAt) : null

  const canonicalUrl = post.seo?.canonicalUrl || post.permalink || `https://elitemensguide.com/${slug}`
  const ogImageUrl = post.featuredImage?.asset
    ? urlFor(post.featuredImage.asset).width(1200).height(630).fit('crop').auto('format').url()
    : null
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://elitemensguide.com'
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      ...(post.categories?.[0] ? [{
        '@type': 'ListItem', position: 2,
        name: post.categories[0].name,
        item: `${SITE_URL}/category/${post.categories[0].slug}/`,
      }] : []),
      { '@type': 'ListItem', position: post.categories?.[0] ? 3 : 2, name: post.title, item: canonicalUrl },
    ],
  }
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt || '',
    url: canonicalUrl,
    datePublished: post.publishedAt,
    dateModified: post.modifiedAt || post.publishedAt,
    author: post.author?.name ? { '@type': 'Person', name: post.author.name } : { '@type': 'Organization', name: "Elite Men's Guide" },
    publisher: {
      '@type': 'Organization',
      name: "Elite Men's Guide",
      url: 'https://elitemensguide.com',
    },
    ...(ogImageUrl ? { image: { '@type': 'ImageObject', url: ogImageUrl, width: 1200, height: 630 } } : {}),
  }

  return (
    <main className="article-wrap">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <header className="article-header">
        {post.categories?.length > 0 && (
          <div className="article-header__cats">
            {post.categories.map((c: any) => (
              <Link key={c._id} href={`/category/${c.slug}`} className="article-header__cat">{c.name}</Link>
            ))}
          </div>
        )}
        <h1 className="article-title">{post.title}</h1>
        <div className="article-divider" />
        <div className="article-meta">
          {post.author?.name && (
            <span className="article-meta__author">By {post.author.name}</span>
          )}
          {post.author?.name && publishedDate && <span className="article-meta__dot">·</span>}
          {publishedDate && (
            <time dateTime={post.publishedAt}>
              Published {publishedDate}
            </time>
          )}
          {modifiedDate && (
            <>
              <span className="article-meta__dot">·</span>
              <span className="article-meta__updated">
                Updated <time dateTime={post.modifiedAt}>{modifiedDate}</time>
              </span>
            </>
          )}
        </div>
      </header>

      {post.featuredImage?.asset && (
        <figure className="article-featured-img">
          <div className="img-crop">
            <Image
              src={urlFor(post.featuredImage.asset).width(760).height(428).fit('crop').auto('format').url()}
              alt={post.featuredImage.alt || post.title}
              width={760}
              height={428}
              priority
              sizes="(max-width:800px) 100vw, 760px"
            />
          </div>
          {post.featuredImage.caption && (
            <figcaption>{post.featuredImage.caption}</figcaption>
          )}
        </figure>
      )}

      <article className="article-body">
        {post.body ? (
          <PortableText value={post.body} components={makePtComponents(slug, post.featuredImage?.asset?._ref)} />
        ) : (
          <div dangerouslySetInnerHTML={{ __html: post.rawHtml ?? '' }} />
        )}
      </article>

      {related.length > 0 && (
        <aside className="related-posts">
          <div className="related-posts__header">
            <h2 className="related-posts__title">Related Articles</h2>
          </div>
          <div className="related-posts__grid">
            {related.map((r: any) => (
              <Link key={r._id} href={`/${r.slug}`} className="related-card">
                <div className="related-card__img">
                  {r.featuredImage?.asset ? (
                    <Image
                      src={urlFor(r.featuredImage.asset).width(480).height(270).fit('crop').auto('format').url()}
                      alt={r.featuredImage.alt || r.title}
                      width={480}
                      height={270}
                      sizes="(max-width:640px) 100vw, 33vw"
                    />
                  ) : <div className="related-card__img-placeholder" />}
                </div>
                <div className="related-card__body">
                  {r.categories?.[0] && (
                    <span className="related-card__cat">{r.categories[0].name}</span>
                  )}
                  <h3 className="related-card__title">{r.title}</h3>
                  {r.excerpt && (() => {
                    let ex: string = r.excerpt.trim()
                    if (ex.toLowerCase().startsWith(r.title.toLowerCase())) {
                      ex = ex.slice(r.title.length).replace(/^[\s\W]+/, '')
                    }
                    ex = ex.slice(0, 110)
                    return ex ? <p className="related-card__excerpt">{ex}…</p> : null
                  })()}
                </div>
                <span className="related-card__cta">Read Article →</span>
              </Link>
            ))}
          </div>
        </aside>
      )}
    </main>
  )
}
