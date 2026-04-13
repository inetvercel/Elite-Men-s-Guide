export const revalidate = 3600

import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getAllPosts, getAllCategories } from '@/sanity/queries'
import imageUrlBuilder from '@sanity/image-url'
import { client } from '@/sanity/client'

const builder = imageUrlBuilder(client)
function urlFor(source: any) { return builder.image(source) }
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://elitemensguide.com'

export const metadata: Metadata = {
  alternates: { canonical: SITE_URL },
  openGraph: {
    url: SITE_URL,
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: "Elite Men's Guide",
  url: SITE_URL,
  potentialAction: {
    '@type': 'SearchAction',
    target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/search?q={search_term_string}` },
    'query-input': 'required name=search_term_string',
  },
}

const NAV_CATS = [
  { name: 'Health',        slug: 'mens-health' },
  { name: 'Fitness',       slug: 'exercise' },
  { name: 'Testosterone',  slug: 'testosterone' },
  { name: 'Nutrition',     slug: 'nutrition' },
  { name: 'Lifestyle',     slug: 'lifestyle' },
  { name: 'Aging',         slug: 'aging' },
]

function cleanExcerpt(excerpt: string, title: string, max: number): string {
  let ex = excerpt.trim()
  if (ex.toLowerCase().startsWith(title.toLowerCase())) ex = ex.slice(title.length).replace(/^[\s\W]+/, '')
  return ex.slice(0, max)
}

function PostCard({ post }: { post: any }) {
  const ex = post.excerpt ? cleanExcerpt(post.excerpt, post.title, 110) : ''
  return (
    <article className="post-card">
      {post.featuredImage?.asset ? (
        <Link href={`/${post.slug}`} className="post-card__img">
          <Image
            src={urlFor(post.featuredImage.asset).width(480).height(280).auto('format').url()}
            alt={post.featuredImage.alt || post.title}
            width={480} height={280}
            sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
          />
        </Link>
      ) : <div className="post-card__img post-card__img--placeholder" />}
      <div className="post-card__body">
        {post.categories?.[0] && (
          <Link href={`/category/${post.categories[0].slug}`} className="post-card__cat">
            {post.categories[0].name}
          </Link>
        )}
        <h2 className="post-card__title">
          <Link href={`/${post.slug}`}>{post.title}</Link>
        </h2>
        {ex && <p className="post-card__excerpt">{ex}…</p>}
        {post.publishedAt && (
          <div className="post-card__meta">{fmtDate(post.publishedAt)}</div>
        )}
      </div>
    </article>
  )
}

export default async function HomePage() {
  const posts = await getAllPosts(30)

  const hero     = posts[0]
  const featured = posts.slice(1, 3)
  const popular  = posts.slice(3, 8)   // sidebar popular list
  const mainGrid = posts.slice(8, 17)  // 3-col grid
  const bottom   = posts.slice(17, 26) // bottom full-width grid

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {/* ── Site Hero Banner ── */}
      <section className="home-hero">
        <div className="home-hero__eyebrow">The Definitive Guide for Men</div>
        <h1>Elite <span>Men&apos;s</span> Guide</h1>
        <p>Evidence-based health, fitness &amp; lifestyle guidance for men who want to perform at their best.</p>
        <a href="#articles" className="home-hero__cta">Browse All Articles</a>
      </section>

      <div className="home-content" id="articles">

        {/* ══════ MAIN + SIDEBAR LAYOUT ══════ */}
        <div className="page-with-sidebar">

          {/* ── LEFT: main editorial content ── */}
          <main className="page-main">

            {/* Hero post */}
            {hero && (
              <div className="home-section">
                <div className="section-label"><span>Editor&apos;s Pick</span></div>
                <Link href={`/${hero.slug}`} className="hero-post">
                  <div className="hero-post__img">
                    {hero.featuredImage?.asset ? (
                      <Image
                        src={urlFor(hero.featuredImage.asset).width(900).height(500).auto('format').url()}
                        alt={hero.featuredImage.alt || hero.title}
                        width={900} height={500}
                        priority sizes="(max-width:1024px) 100vw, 66vw"
                      />
                    ) : <div className="hero-post__img-placeholder" />}
                    <div className="hero-post__overlay">
                      {hero.categories?.[0] && (
                        <div className="hero-post__cat">{hero.categories[0].name}</div>
                      )}
                      <h2 className="hero-post__title">{hero.title}</h2>
                      {hero.excerpt && (() => { const ex = cleanExcerpt(hero.excerpt, hero.title, 160); return ex ? <p className="hero-post__excerpt">{ex}…</p> : null })()}
                      {hero.publishedAt && (
                        <div className="hero-post__meta">{fmtDate(hero.publishedAt)}</div>
                      )}
                    </div>
                  </div>
                </Link>
              </div>
            )}

            {/* Featured pair */}
            {featured.length > 0 && (
              <div className="home-section">
                <div className="section-label"><span>Latest</span></div>
                <div className="featured-pair">
                  {featured.map((post: any) => (
                    <article key={post._id} className="featured-card">
                      <Link href={`/${post.slug}`} className="featured-card__img">
                        {post.featuredImage?.asset ? (
                          <Image
                            src={urlFor(post.featuredImage.asset).width(560).height(340).auto('format').url()}
                            alt={post.featuredImage.alt || post.title}
                            width={560} height={340}
                            sizes="(max-width:768px) 100vw, 33vw"
                          />
                        ) : <div className="card-img-placeholder" />}
                      </Link>
                      <div className="featured-card__body">
                        {post.categories?.[0] && (
                          <Link href={`/category/${post.categories[0].slug}`} className="post-card__cat">
                            {post.categories[0].name}
                          </Link>
                        )}
                        <h2 className="featured-card__title">
                          <Link href={`/${post.slug}`}>{post.title}</Link>
                        </h2>
                        {post.excerpt && (() => { const ex = cleanExcerpt(post.excerpt, post.title, 130); return ex ? <p className="post-card__excerpt">{ex}…</p> : null })()}
                        {post.publishedAt && (
                          <div className="post-card__meta">{fmtDate(post.publishedAt)}</div>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}

            {/* 3-col grid */}
            {mainGrid.length > 0 && (
              <div className="home-section">
                <div className="section-label"><span>More Articles</span></div>
                <div className="post-grid-3">
                  {mainGrid.map((post: any) => (
                    <PostCard key={post._id} post={post} />
                  ))}
                </div>
              </div>
            )}

          </main>

          {/* ── RIGHT: persistent sidebar ── */}
          <aside className="page-sidebar">

            {/* Popular widget */}
            <div className="widget">
              <div className="widget__header">
                <span>Popular Articles</span>
              </div>
              <div className="widget__popular">
                {popular.map((post: any, i: number) => (
                  <Link key={post._id} href={`/${post.slug}`} className="popular-item">
                    <span className="popular-item__num">{String(i + 1).padStart(2, '0')}</span>
                    <div className="popular-item__body">
                      {post.categories?.[0] && (
                        <div className="popular-item__cat">{post.categories[0].name}</div>
                      )}
                      <div className="popular-item__title">{post.title}</div>
                    </div>
                    {post.featuredImage?.asset && (
                      <div className="popular-item__img">
                        <Image
                          src={urlFor(post.featuredImage.asset).width(80).height(60).auto('format').url()}
                          alt={post.featuredImage.alt || post.title}
                          width={80} height={60}
                        />
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            </div>

            {/* Categories widget */}
            <div className="widget">
              <div className="widget__header"><span>Browse Topics</span></div>
              <div className="widget__cats">
                {NAV_CATS.map(cat => (
                  <Link key={cat.slug} href={`/category/${cat.slug}`} className="widget-cat-link">
                    <span>{cat.name}</span>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </Link>
                ))}
              </div>
            </div>

          </aside>
        </div>

        {/* ── Bottom full-width grid ── */}
        {bottom.length > 0 && (
          <div className="home-section">
            <div className="section-label"><span>Explore More</span></div>
            <div className="post-grid">
              {bottom.map((post: any) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
          </div>
        )}

      </div>
    </>
  )
}
