import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About Elite Men\'s Guide',
  description: 'Learn about Elite Men\'s Guide — independent, expert-reviewed health and fitness content for men who want to live longer, stronger, and smarter.',
  alternates: { canonical: 'https://elitemensguide.com/about/' },
}

const pillars = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
    ),
    title: 'Evidence-Based',
    body: 'Every article is grounded in peer-reviewed research, clinical guidelines, and expert consensus — not marketing copy.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"/>
      </svg>
    ),
    title: 'Independent',
    body: 'We are sponsor-free. No advertiser influences what we publish. Editorial decisions are made solely in the interest of our readers.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/>
      </svg>
    ),
    title: 'Men-First',
    body: 'Our content is written specifically for men — covering the health topics that matter most at every stage of life.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z"/>
      </svg>
    ),
    title: 'Actionable Tools',
    body: 'Beyond articles, we build interactive calculators and health trackers so you can apply what you learn to your own numbers.',
  },
]

const topics = [
  { name: 'Men\'s Health', href: '/category/mens-health/', icon: '🏥' },
  { name: 'Fitness & Exercise', href: '/category/exercise/', icon: '💪' },
  { name: 'Testosterone', href: '/category/testosterone/', icon: '⚡' },
  { name: 'Nutrition', href: '/category/nutrition/', icon: '🥗' },
  { name: 'Lifestyle', href: '/category/lifestyle/', icon: '🌿' },
  { name: 'Aging', href: '/category/aging/', icon: '⏳' },
]

export default function AboutPage() {
  return (
    <div className="about-page">

      {/* ── Hero ── */}
      <section className="about-hero">
        <div className="about-hero__inner">
          <p className="about-hero__eyebrow">Who We Are</p>
          <h1 className="about-hero__title">
            The Definitive Guide<br />
            <span className="about-hero__title--gold">for Men</span>
          </h1>
          <p className="about-hero__sub">
            Elite Men&apos;s Guide is an independent health and fitness resource built for men who take
            their wellbeing seriously. We cut through the noise with clear, research-backed
            information — so you can make smarter decisions about your health.
          </p>
          <div className="about-hero__ctas">
            <Link href="/category/mens-health/" className="about-hero__cta about-hero__cta--primary">
              Explore Articles
            </Link>
            <Link href="/category/tools/" className="about-hero__cta about-hero__cta--secondary">
              Try Our Tools
            </Link>
          </div>
        </div>
        <div className="about-hero__badge">
          <div className="about-hero__badge-inner">
            <span className="about-hero__badge-num">282<span>+</span></span>
            <span className="about-hero__badge-label">Expert Articles</span>
          </div>
          <div className="about-hero__badge-inner">
            <span className="about-hero__badge-num">10<span>+</span></span>
            <span className="about-hero__badge-label">Health Tools</span>
          </div>
          <div className="about-hero__badge-inner">
            <span className="about-hero__badge-num">100<span>%</span></span>
            <span className="about-hero__badge-label">Independent</span>
          </div>
        </div>
      </section>

      {/* ── Mission ── */}
      <section className="about-mission">
        <div className="about-section__inner">
          <div className="about-mission__text">
            <p className="about-section__eyebrow">Our Mission</p>
            <h2 className="about-section__title">Helping men live longer,<br />stronger, and smarter</h2>
            <p>
              Men face unique health challenges — yet reliable, men-specific health information is
              surprisingly hard to find. Elite Men&apos;s Guide was founded to fix that.
            </p>
            <p>
              We cover the full spectrum of men&apos;s health: from testosterone and heart health to
              fitness programming, nutrition science, and the realities of aging. Our content
              is written in plain English, backed by clinical evidence, and updated as the science
              evolves.
            </p>
            <p>
              We are an independent company. Our content is free from influence by sponsors,
              partners, or advertisers. The information we provide is designed to support — not
              replace — your relationship with your physician.
            </p>
          </div>
          <div className="about-mission__visual">
            <div className="about-mission__card">
              <blockquote>
                &ldquo;The information provided on this site is designed to support, not replace,
                the relationship that exists between a patient and his existing physician.&rdquo;
              </blockquote>
              <cite>— Elite Men&apos;s Guide Editorial Policy</cite>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pillars ── */}
      <section className="about-pillars">
        <div className="about-section__inner about-section__inner--center">
          <p className="about-section__eyebrow">What Sets Us Apart</p>
          <h2 className="about-section__title">Built on four core principles</h2>
          <div className="about-pillars__grid">
            {pillars.map((p) => (
              <div key={p.title} className="about-pillar">
                <div className="about-pillar__icon">{p.icon}</div>
                <h3 className="about-pillar__title">{p.title}</h3>
                <p className="about-pillar__body">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Topics ── */}
      <section className="about-topics">
        <div className="about-section__inner about-section__inner--center">
          <p className="about-section__eyebrow">What We Cover</p>
          <h2 className="about-section__title">Deep expertise across six key areas</h2>
          <div className="about-topics__grid">
            {topics.map((t) => (
              <Link key={t.name} href={t.href} className="about-topic-card">
                <span className="about-topic-card__icon">{t.icon}</span>
                <span className="about-topic-card__name">{t.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Disclaimer ── */}
      <section className="about-disclaimer">
        <div className="about-section__inner">
          <h2 className="about-disclaimer__title">Medical Disclaimer</h2>
          <p>
            The content on Elite Men&apos;s Guide is provided for educational and informational
            purposes only. It is not intended to be a substitute for professional medical advice,
            diagnosis, or treatment. Always seek the advice of your physician or other qualified
            health provider with any questions you may have regarding a medical condition.
          </p>
          <p>
            Elite Men&apos;s Group, LLC maintains a strict separation between editorial content
            and any advertising. Under no circumstances does acceptance of advertising constitute
            an endorsement of the advertised product or service.
          </p>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="about-cta-band">
        <div className="about-section__inner about-section__inner--center">
          <h2>Ready to take control of your health?</h2>
          <p>Explore our articles, try our interactive tools, or get in touch.</p>
          <div className="about-cta-band__btns">
            <Link href="/" className="about-hero__cta about-hero__cta--primary">Browse All Topics</Link>
            <Link href="/contact/" className="about-hero__cta about-hero__cta--secondary">Contact Us</Link>
          </div>
        </div>
      </section>

    </div>
  )
}
