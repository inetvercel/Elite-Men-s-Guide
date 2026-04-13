const TAG = 'elitemensguide-20'
function amzLink(asin: string) {
  return `https://www.amazon.com/dp/${asin}?tag=${TAG}`
}

export const AMAZON_PRODUCTS = {
  testosteroneBooster: {
    asin: 'B07WQGVK19',
    title: 'Prime Labs Men\'s Testosterone Booster',
    desc: 'Natural support for energy, stamina & muscle. One of Amazon\'s best-rated supplements for men.',
    badge: 'Best Seller',
    badgeColor: '#d97706',
    category: 'Testosterone',
  },
  multivitamin: {
    asin: 'B00LTK774I',
    title: 'Garden of Life Vitamin Code Men',
    desc: 'Whole food multivitamin with raw probiotics & enzymes. Formulated specifically for men\'s health.',
    badge: 'Top Rated',
    badgeColor: '#16a34a',
    category: 'Nutrition',
  },
  bloodPressureMonitor: {
    asin: 'B07WQGVK19',
    title: 'Omron Platinum Blood Pressure Monitor',
    desc: 'Clinically validated upper arm BP monitor with Bluetooth. Track readings over time from home.',
    badge: 'Clinically Validated',
    badgeColor: '#2563eb',
    category: 'Health Numbers',
  },
  proteinPowder: {
    asin: 'B002DYJ0OG',
    title: 'Optimum Nutrition Gold Standard Whey',
    desc: '24g of protein per serving. The world\'s best-selling whey protein for muscle recovery.',
    badge: '#1 Best Seller',
    badgeColor: '#d97706',
    category: 'Fitness',
  },
  sleepSupport: {
    asin: 'B0013OQGO6',
    title: 'Nature Made Melatonin 5mg',
    desc: 'USP verified sleep support. Helps you fall asleep faster — critical for testosterone & recovery.',
    badge: 'USP Verified',
    badgeColor: '#7c3aed',
    category: 'Sleep',
  },
  omega3: {
    asin: 'B001LF39RY',
    title: 'Nordic Naturals Ultimate Omega',
    desc: 'High-concentration omega-3s for heart health, inflammation & cognitive function.',
    badge: 'Doctor Recommended',
    badgeColor: '#0891b2',
    category: 'Nutrition',
  },
}

type ProductKey = keyof typeof AMAZON_PRODUCTS

interface ProductBoxProps {
  productKey: ProductKey
  variant?: 'box' | 'inline' | 'wide'
}

export function AmazonProductBox({ productKey, variant = 'box' }: ProductBoxProps) {
  const p = AMAZON_PRODUCTS[productKey]
  const url = amzLink(p.asin)

  if (variant === 'inline') {
    return (
      <span className="amz-inline">
        <a href={url} target="_blank" rel="noopener noreferrer nofollow" className="amz-inline__link">
          {p.title}
        </a>
        <span className="amz-inline__tag"> (Amazon)</span>
      </span>
    )
  }

  if (variant === 'wide') {
    return (
      <div className="amz-wide">
        <div className="amz-wide__label">
          <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          Recommended
        </div>
        <div className="amz-wide__body">
          <div className="amz-wide__text">
            <div className="amz-wide__title">{p.title}</div>
            <div className="amz-wide__desc">{p.desc}</div>
          </div>
          <a href={url} target="_blank" rel="noopener noreferrer nofollow" className="amz-wide__btn">
            View on Amazon
            <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"/></svg>
          </a>
        </div>
        <div className="amz-disclaimer-micro">Ad · As an Amazon Associate we earn from qualifying purchases.</div>
      </div>
    )
  }

  return (
    <div className="amz-box">
      <div className="amz-box__badge" style={{ background: p.badgeColor }}>{p.badge}</div>
      <div className="amz-box__cat">{p.category}</div>
      <div className="amz-box__title">{p.title}</div>
      <div className="amz-box__desc">{p.desc}</div>
      <a href={url} target="_blank" rel="noopener noreferrer nofollow" className="amz-box__btn">
        <svg viewBox="0 0 48 15" fill="none" width="48" height="15" aria-hidden="true">
          <text x="0" y="12" fontFamily="Arial" fontSize="11" fill="#FF9900" fontWeight="bold">amazon</text>
        </svg>
        Shop on Amazon →
      </a>
      <div className="amz-disclaimer-micro">As an Amazon Associate we earn from qualifying purchases.</div>
    </div>
  )
}

interface ProductGridProps {
  keys: ProductKey[]
}

export function AmazonProductGrid({ keys }: ProductGridProps) {
  return (
    <div className="amz-grid">
      {keys.map(k => <AmazonProductBox key={k} productKey={k} />)}
    </div>
  )
}

export function AmazonSidebarWidget() {
  const picks: ProductKey[] = ['multivitamin', 'omega3', 'testosteroneBooster']
  return (
    <div className="amz-sidebar-widget">
      <div className="amz-sidebar-widget__header">
        <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
        EMG Recommended
      </div>
      <div className="amz-sidebar-widget__items">
        {picks.map(k => {
          const p = AMAZON_PRODUCTS[k]
          return (
            <a key={k} href={amzLink(p.asin)} target="_blank" rel="noopener noreferrer nofollow" className="amz-sidebar-item">
              <div className="amz-sidebar-item__body">
                <div className="amz-sidebar-item__cat">{p.category}</div>
                <div className="amz-sidebar-item__title">{p.title}</div>
              </div>
              <div className="amz-sidebar-item__arrow">→</div>
            </a>
          )
        })}
      </div>
      <div className="amz-disclaimer-micro" style={{ padding: '0 .75rem .6rem' }}>
        Ad · Amazon Associate. We earn from qualifying purchases.
      </div>
    </div>
  )
}
