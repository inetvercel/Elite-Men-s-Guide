'use client'

const TAG_US = 'elitemensguide-20'
const TAG_UK = 'elitemensguide-21'

function amzLink(asin: string) {
  const isUK = typeof navigator !== 'undefined' &&
    (navigator.language?.startsWith('en-GB') ||
     (navigator as any).languages?.some((l: string) => l === 'en-GB'))
  return isUK
    ? `https://www.amazon.co.uk/dp/${asin}?tag=${TAG_UK}`
    : `https://www.amazon.com/dp/${asin}?tag=${TAG_US}`
}

export const AMAZON_PRODUCTS = {
  testosteroneBook: {
    asin: '1764604113',
    title: 'Diet for Men: Testosterone Optimization Guide',
    desc: 'The complete nutrition guide for men looking to naturally optimise testosterone through diet, lifestyle and targeted eating strategies.',
    badge: 'Editor\'s Pick',
    badgeColor: '#b45309',
    category: 'Testosterone',
  },
  exerciseEncyclopedia: {
    asin: 'B0FP8VKYJZ',
    title: 'Mad Skills Exercise Encyclopedia',
    desc: 'The ultimate bodyweight training reference — hundreds of exercises with step-by-step technique breakdowns for home or gym.',
    badge: 'Top Rated',
    badgeColor: '#16a34a',
    category: 'Fitness',
  },
  ropelessJumpRope: {
    asin: 'B0GL7S4KZ6',
    title: 'Ropeless Weighted Jump Rope',
    desc: 'Train cardio anywhere with zero space needed. Weighted handles for strength + low-impact conditioning — perfect home gym tool.',
    badge: 'Home Gym Essential',
    badgeColor: '#0891b2',
    category: 'Home Gym',
  },
  multivitamin: {
    asin: 'B00LTK774I',
    title: 'Garden of Life Vitamin Code Men',
    desc: 'Whole food multivitamin with raw probiotics & enzymes. Formulated specifically for men\'s health.',
    badge: 'Top Rated',
    badgeColor: '#16a34a',
    category: 'Nutrition',
  },
  omega3: {
    asin: 'B001LF39RY',
    title: 'Nordic Naturals Ultimate Omega',
    desc: 'High-concentration omega-3s for heart health, inflammation & cognitive function.',
    badge: 'Doctor Recommended',
    badgeColor: '#0891b2',
    category: 'Nutrition',
  },
  bloodPressureMonitor: {
    asin: 'B0C2DQSVLT',
    title: 'Omron Platinum Blood Pressure Monitor',
    desc: 'Clinically validated upper arm BP monitor with Bluetooth. Track readings over time from home.',
    badge: 'Clinically Validated',
    badgeColor: '#2563eb',
    category: 'Health Numbers',
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
  const picks: ProductKey[] = ['testosteroneBook', 'exerciseEncyclopedia', 'ropelessJumpRope']
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
