import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '404 – Page Not Found',
  description: 'The page you are looking for could not be found.',
}

export default function NotFound() {
  return (
    <div className="not-found">
      <div className="not-found__inner">
        <span className="not-found__code">404</span>
        <h1 className="not-found__title">Page Not Found</h1>
        <p className="not-found__body">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="not-found__actions">
          <Link href="/" className="not-found__btn not-found__btn--primary">Go to Homepage</Link>
          <Link href="/category/mens-health" className="not-found__btn not-found__btn--secondary">Browse Articles</Link>
        </div>
        <div className="not-found__links">
          <span>Popular topics:</span>
          <Link href="/category/mens-health">Men&apos;s Health</Link>
          <Link href="/category/testosterone">Testosterone</Link>
          <Link href="/category/exercise">Fitness</Link>
          <Link href="/category/nutrition">Nutrition</Link>
          <Link href="/category/aging">Aging</Link>
        </div>
      </div>
    </div>
  )
}
