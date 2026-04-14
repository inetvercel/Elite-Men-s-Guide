import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'
import MobileNav from './components/MobileNav'

export const metadata: Metadata = {
  title: {
    default: "Elite Men's Guide – Men's Health, Fitness, and Testosterone Information",
    template: "%s – Elite Men's Guide",
  },
  description: "Elite Men's Guide provides men's health, fitness, and testosterone information to help men live healthier, stronger lives.",
  metadataBase: new URL('https://elitemensguide.com'),
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@elitemensguide',
  },
  openGraph: {
    siteName: "Elite Men's Guide",
    type: 'website',
    locale: 'en_US',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-RS6LLDTNQ4"
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-RS6LLDTNQ4');
          `}
        </Script>
        <nav className="site-nav">
          <div className="site-nav__inner">
            <a href="/" className="site-nav__logo">
              <span className="logo-mark">
                <svg viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="34" height="34" rx="3" fill="#0d1f33"/>
                  <polygon points="6,8 16,8 28,26 18,26" fill="#d4a017"/>
                  <polygon points="13,8 20,8 28,18 21,18" fill="#f0b429" opacity="0.7"/>
                </svg>
              </span>
              <span className="logo-text">
                <span className="logo-text__elite">Elite</span>
                <span className="logo-text__sub">Men&apos;s Guide</span>
              </span>
            </a>
            <ul className="site-nav__links">
              <li><a href="/category/mens-health">Health</a></li>
              <li><a href="/category/exercise">Fitness</a></li>
              <li><a href="/category/testosterone">Testosterone</a></li>
              <li><a href="/category/nutrition">Nutrition</a></li>
              <li><a href="/category/lifestyle">Lifestyle</a></li>
              <li><a href="/category/aging">Aging</a></li>
              <li><a href="/tools">Tools</a></li>
              <li><a href="/about/">About</a></li>
            </ul>
            <MobileNav />
          </div>
        </nav>
        {children}
        <footer className="site-footer">
          <p>© {new Date().getFullYear()} Elite Men&apos;s Guide &nbsp;·&nbsp; The Definitive Guide for Men</p>
          <p style={{marginTop: '0.5rem', fontSize: '0.75rem', opacity: 0.6}}>
            <a href="/about/">About</a>
            &nbsp;·&nbsp;
            <a href="/contact/">Contact</a>
            &nbsp;·&nbsp;
            <a href="/terms-service/">Terms of Use</a>
          </p>
        </footer>
      </body>
    </html>
  )
}
