'use client'

import { useState } from 'react'
import Link from 'next/link'

const NAV_LINKS = [
  { label: 'Health',       href: '/category/mens-health' },
  { label: 'Fitness',      href: '/category/exercise' },
  { label: 'Testosterone', href: '/category/testosterone' },
  { label: 'Nutrition',    href: '/category/nutrition' },
  { label: 'Lifestyle',    href: '/category/lifestyle' },
  { label: 'Aging',        href: '/category/aging' },
  { label: 'Tools',        href: '/category/tools' },
  { label: 'About',        href: '/about/' },
]

export default function MobileNav() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        className="mobile-nav__toggle"
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
      >
        <span className={`mobile-nav__icon ${open ? 'mobile-nav__icon--open' : ''}`}>
          <span /><span /><span />
        </span>
      </button>

      {open && (
        <div className="mobile-nav__drawer" onClick={() => setOpen(false)}>
          <nav className="mobile-nav__links" onClick={e => e.stopPropagation()}>
            {NAV_LINKS.map(l => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)}>{l.label}</Link>
            ))}
          </nav>
        </div>
      )}
    </>
  )
}
