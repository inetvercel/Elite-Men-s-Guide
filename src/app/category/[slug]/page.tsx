export const revalidate = 3600

import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getCategoryBySlug, getPostsByCategory, getAllCategories } from '@/sanity/queries'
import imageUrlBuilder from '@sanity/image-url'
import { client } from '@/sanity/client'

export async function generateStaticParams() {
  const cats = await getAllCategories()
  return cats.map((c: { slug: string }) => ({ slug: c.slug }))
}

const builder = imageUrlBuilder(client)
function urlFor(source: any) { return builder.image(source) }

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

type Props = { params: Promise<{ slug: string }> }

function contentLabel(slug: string) {
  return slug === 'tools' || slug === 'tools-calculators' ? 'tool' : 'article'
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const category = await getCategoryBySlug(slug)
  if (!category) return {}
  const label = contentLabel(slug)
  const labelPlural = label === 'tool' ? 'Tools' : 'Articles'
  return {
    title: `${category.name} ${labelPlural}`,
    description: category.description || `Browse all ${category.name} ${label}s on Elite Men's Guide.`,
    alternates: { canonical: `https://elitemensguide.com/category/${slug}/` },
  }
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://elitemensguide.com'

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params
  const [category, posts] = await Promise.all([
    getCategoryBySlug(slug),
    getPostsByCategory(slug, 100),
  ])

  if (!category) notFound()

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      ...(category.parent ? [
        { '@type': 'ListItem', position: 2, name: category.parent.name, item: `${SITE_URL}/category/${category.parent.slug}/` },
        { '@type': 'ListItem', position: 3, name: category.name, item: `${SITE_URL}/category/${slug}/` },
      ] : [
        { '@type': 'ListItem', position: 2, name: category.name, item: `${SITE_URL}/category/${slug}/` },
      ]),
    ],
  }

  const label    = contentLabel(slug)
  const labelPlural = label === 'tool' ? 'Tools' : 'Articles'
  const hero     = posts[0]
  const featured = posts.slice(1, 3)
  const rest     = posts.slice(3)

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      {/* ── Category Header ── */}
      <div className="cat-header">
        <div className="cat-header__inner">
          {category.parent && (
            <div className="cat-header__breadcrumb">
              <Link href="/">Home</Link>
              <span>›</span>
              <Link href={`/category/${category.parent.slug}`}>{category.parent.name}</Link>
              <span>›</span>
              <span>{category.name}</span>
            </div>
          )}
          {!category.parent && (
            <div className="cat-header__breadcrumb">
              <Link href="/">Home</Link>
              <span>›</span>
              <span>{category.name}</span>
            </div>
          )}
          <h1 className="cat-header__title">{category.name}</h1>
          {category.description && (
            <p className="cat-header__desc">{category.description}</p>
          )}
          <div className="cat-header__count">{posts.length} {label}{posts.length !== 1 ? 's' : ''}</div>
        </div>
      </div>

      <div className="home-content">

        {/* ── Hero Post ── */}
        {hero && (
          <div className="home-section">
            <Link href={`/${hero.slug}`} className="hero-post">
              <div className="hero-post__img">
                {hero.featuredImage?.asset ? (
                  <Image
                    src={urlFor(hero.featuredImage.asset).width(1200).height(520).auto('format').url()}
                    alt={hero.featuredImage.alt || hero.title}
                    width={1200} height={520}
                    priority
                    sizes="100vw"
                  />
                ) : <div className="hero-post__img-placeholder" />}
                <div className="hero-post__overlay">
                  <div className="hero-post__cat">{category.name}</div>
                  <h2 className="hero-post__title">{hero.title}</h2>
                  {hero.excerpt && (() => { let ex = hero.excerpt.trim(); if (ex.toLowerCase().startsWith(hero.title.toLowerCase())) ex = ex.slice(hero.title.length).replace(/^[\s\W]+/, ''); ex = ex.slice(0, 180); return ex ? <p className="hero-post__excerpt">{ex}…</p> : null })()}
                  {hero.publishedAt && <div className="hero-post__meta">{fmtDate(hero.publishedAt)}</div>}
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* ── Featured Pair ── */}
        {featured.length > 0 && (
          <div className="home-section">
            <div className="featured-pair">
              {featured.map((post: any) => (
                <article key={post._id} className="featured-card">
                  <Link href={`/${post.slug}`} className="featured-card__img">
                    {post.featuredImage?.asset ? (
                      <Image
                        src={urlFor(post.featuredImage.asset).width(700).height(420).auto('format').url()}
                        alt={post.featuredImage.alt || post.title}
                        width={700} height={420}
                        sizes="(max-width:768px) 100vw, 50vw"
                      />
                    ) : <div className="card-img-placeholder" />}
                  </Link>
                  <div className="featured-card__body">
                    <div className="post-card__cat">{category.name}</div>
                    <h2 className="featured-card__title">
                      <Link href={`/${post.slug}`}>{post.title}</Link>
                    </h2>
                    {post.excerpt && (() => { let ex = post.excerpt.trim(); if (ex.toLowerCase().startsWith(post.title.toLowerCase())) ex = ex.slice(post.title.length).replace(/^[\s\W]+/, ''); ex = ex.slice(0, 140); return ex ? <p className="post-card__excerpt">{ex}…</p> : null })()}
                    {post.publishedAt && <div className="post-card__meta">{fmtDate(post.publishedAt)}</div>}
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {/* ── All remaining posts grid ── */}
        {rest.length > 0 && (
          <div className="home-section">
            <div className="section-label"><span>All {category.name} {labelPlural}</span></div>
            <div className="post-grid">
              {rest.map((post: any) => (
                <article key={post._id} className="post-card">
                  {post.featuredImage?.asset ? (
                    <Link href={`/${post.slug}`} className="post-card__img">
                      <Image
                        src={urlFor(post.featuredImage.asset).width(480).height(280).auto('format').url()}
                        alt={post.featuredImage.alt || post.title}
                        width={480} height={280}
                        sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
                      />
                    </Link>
                  ) : <div className="post-card__img card-img-placeholder" />}
                  <div className="post-card__body">
                    <div className="post-card__cat">{category.name}</div>
                    <h2 className="post-card__title"><Link href={`/${post.slug}`}>{post.title}</Link></h2>
                    {post.excerpt && (() => { let ex = post.excerpt.trim(); if (ex.toLowerCase().startsWith(post.title.toLowerCase())) ex = ex.slice(post.title.length).replace(/^[\s\W]+/, ''); ex = ex.slice(0, 110); return ex ? <p className="post-card__excerpt">{ex}…</p> : null })()}
                    {post.publishedAt && <div className="post-card__meta">{fmtDate(post.publishedAt)}</div>}
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {posts.length === 0 && (
          <div className="cat-empty">
            <p>No {label}s found in this category yet.</p>
            <Link href="/" className="home-hero__cta" style={{ marginTop: '1.5rem' }}>Back to Home</Link>
          </div>
        )}

      </div>
    </>
  )
}
