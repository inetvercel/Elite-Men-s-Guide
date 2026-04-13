'use client'

import { useState, useCallback } from 'react'

// Testosterone ranges (ng/dL)
const T_CATEGORIES = [
  { max: 200,  label: 'Critically Low',  color: '#9f1239', bg: '#fff1f2', tip: 'Severely deficient. Speak with an endocrinologist or urologist immediately. Treatment is almost always indicated at this level.' },
  { max: 300,  label: 'Low',             color: '#dc2626', bg: '#fef2f2', tip: 'Below the clinical normal range. Symptoms of low testosterone are likely. A doctor should evaluate whether treatment is appropriate.' },
  { max: 400,  label: 'Low-Normal',      color: '#d97706', bg: '#fffbeb', tip: 'Technically within range but on the lower end. Symptoms may still be present if this represents a significant drop from your personal baseline.' },
  { max: 700,  label: 'Normal',          color: '#16a34a', bg: '#f0fdf4', tip: 'Within the healthy reference range. Maintain optimal levels through resistance training, quality sleep, and a balanced diet.' },
  { max: 900,  label: 'High-Normal',     color: '#0369a1', bg: '#eff6ff', tip: 'Excellent — upper end of the natural range. Associated with peak physical performance and vitality.' },
  { max: 9999, label: 'Above Range',     color: '#7e22ce', bg: '#faf5ff', tip: 'Above the typical reference range. If not using testosterone therapy, this warrants investigation. If on TRT, discuss dosage with your prescriber.' },
]

function getCategory(level: number) {
  return T_CATEGORIES.find(c => level < c.max) ?? T_CATEGORIES[T_CATEGORIES.length - 1]
}

// Convert nmol/L → ng/dL  (1 nmol/L = 28.842 ng/dL)
function toNgDl(value: number, unit: 'ngdl' | 'nmol'): number {
  return unit === 'nmol' ? value * 28.842 : value
}

const faqs = [
  {
    q: 'What is the normal testosterone level for men?',
    a: 'Normal total testosterone levels for adult men range from 300 to 1050 ng/dL (10.4–36.4 nmol/L). One man can have a level nearly three times higher than another and both be considered clinically normal. The range is broad by design.',
  },
  {
    q: 'What is considered low testosterone (Low T)?',
    a: 'Levels below 300 ng/dL (10.4 nmol/L) are generally classified as low by most clinical guidelines. However, diagnosis is not purely numerical — a man whose levels have dropped significantly from a personal baseline may be symptomatic even if still technically within the normal range.',
  },
  {
    q: 'What are the symptoms of low testosterone?',
    a: 'Common symptoms include decreased libido, fatigue, reduced muscle mass, increased body fat (especially abdominal), depression, poor concentration, reduced bone density, and erectile dysfunction. Low T has also been associated with cardiovascular disease and type 2 diabetes.',
  },
  {
    q: 'How is testosterone measured?',
    a: 'A simple morning blood test measures total testosterone. Because levels fluctuate throughout the day (peaking in the morning), tests should ideally be taken between 7–10am. Two separate readings on different days are usually required before a diagnosis of hypogonadism is made.',
  },
  {
    q: 'What is the difference between total and free testosterone?',
    a: 'Total testosterone measures all testosterone in the blood. Free testosterone (roughly 2–3%) is unbound and biologically active. A man can have a normal total testosterone but low free testosterone (due to high SHBG), still experiencing symptoms. Both values are clinically relevant.',
  },
  {
    q: 'Can testosterone levels be improved naturally?',
    a: 'Yes. Resistance training (especially compound lifts), quality sleep (7–9 hours), maintaining a healthy body weight, adequate dietary fat and zinc, and managing stress all support healthy testosterone production. Obesity, alcohol, and chronic stress are among the biggest suppressors.',
  },
]

const references = [
  'Miner MM. (2011). "Low Testosterone Medscape CME Expert Column Series. Issue 3: Delivering Safe and Effective Testosterone Replacement Therapy." Medscape Education.',
  'Bhasin S, Cunningham GR, Hayes FJ, et al. (2010). "Testosterone Therapy in Men with Androgen Deficiency Syndromes: An Endocrine Society Clinical Practice Guideline." Journal of Clinical Endocrinology & Metabolism 95 (6): 2536–2559.',
  'Traish AM, Miner MM, Morgentaler A, Zitzmann M. (2011). "Testosterone Deficiency." The American Journal of Medicine 124 (7): 578–587.',
  'Wu FC, Tajar A, Beynon JM, et al. (2010). "Identification of Late-Onset Hypogonadism in Middle-Aged and Elderly Men." New England Journal of Medicine 363: 123–135.',
]

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(f => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
}

type TUnit = 'ngdl' | 'nmol'

interface Result { ngdl: number; nmol: number; category: typeof T_CATEGORIES[0] }

export default function TestosteroneLevelsPage() {
  const [unit, setUnit]     = useState<TUnit>('ngdl')
  const [value, setValue]   = useState('')
  const [result, setResult] = useState<Result | null>(null)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [refsOpen, setRefsOpen] = useState(false)
  const [error, setError]   = useState('')

  const calculate = useCallback(() => {
    setError('')
    const num = parseFloat(value)
    if (!num || num <= 0) { setError('Please enter a valid testosterone level.'); return }
    const ngdl = toNgDl(num, unit)
    if (ngdl < 10 || ngdl > 5000) { setError('Value seems out of range. Please check your units.'); return }
    setResult({ ngdl: Math.round(ngdl), nmol: parseFloat((ngdl / 28.842).toFixed(1)), category: getCategory(ngdl) })
  }, [value, unit])

  const reset = () => { setValue(''); setResult(null); setError('') }

  // Gauge: map 0–1200 ng/dL to 0–180 degrees
  const gaugeAngle = result ? Math.min(Math.max((result.ngdl / 1200) * 180, 0), 180) : 0

  const tableRows = [
    { range: '< 200 ng/dL',       label: 'Critically Low',  color: '#9f1239' },
    { range: '200 – 300 ng/dL',   label: 'Low',             color: '#dc2626' },
    { range: '300 – 400 ng/dL',   label: 'Low-Normal',      color: '#d97706' },
    { range: '400 – 700 ng/dL',   label: 'Normal',          color: '#16a34a' },
    { range: '700 – 900 ng/dL',   label: 'High-Normal',     color: '#0369a1' },
    { range: '> 900 ng/dL',       label: 'Above Range',     color: '#7e22ce' },
  ]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="testo-page">

        {/* ── Hero ── */}
        <div className="testo-hero">
          <div className="testo-hero__inner">
            <p className="testo-hero__eyebrow">Health Numbers</p>
            <h1 className="testo-hero__title">Testosterone Levels for Men</h1>
            <p className="testo-hero__sub">
              Enter your blood test result to understand where you stand — and what it means for your health.
            </p>
          </div>
        </div>

        <div className="testo-body">

          {/* ── Calculator card ── */}
          <div className="testo-calc-card">

            <div className="testo-unit-toggle">
              <button className={`testo-unit-btn${unit === 'ngdl' ? ' active' : ''}`}
                onClick={() => { setUnit('ngdl'); setResult(null) }}>ng/dL</button>
              <button className={`testo-unit-btn${unit === 'nmol' ? ' active' : ''}`}
                onClick={() => { setUnit('nmol'); setResult(null) }}>nmol/L</button>
            </div>

            <div className="testo-input-row">
              <div className="testo-field">
                <label>Your testosterone level</label>
                <div className="testo-input-wrap">
                  <input
                    type="number" min="0" step="0.1"
                    placeholder={unit === 'ngdl' ? 'e.g. 550' : 'e.g. 19.1'}
                    value={value} onChange={e => setValue(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && calculate()}
                  />
                  <span>{unit === 'ngdl' ? 'ng/dL' : 'nmol/L'}</span>
                </div>
              </div>
            </div>

            {error && <p className="testo-error">{error}</p>}

            <button className="testo-calc-btn" onClick={calculate}>Check My Level</button>

            {/* ── Result ── */}
            {result && (
              <div className="testo-result" style={{ borderColor: result.category.color, background: result.category.bg }}>

                {/* Gauge */}
                <div className="testo-gauge">
                  <svg viewBox="0 0 200 110" className="testo-gauge__svg">
                    <defs>
                      <linearGradient id="testoGaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%"   stopColor="#9f1239"/>
                        <stop offset="17%"  stopColor="#dc2626"/>
                        <stop offset="33%"  stopColor="#d97706"/>
                        <stop offset="58%"  stopColor="#16a34a"/>
                        <stop offset="75%"  stopColor="#0369a1"/>
                        <stop offset="100%" stopColor="#7e22ce"/>
                      </linearGradient>
                    </defs>
                    <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#e5e7eb" strokeWidth="14" strokeLinecap="round"/>
                    <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="url(#testoGaugeGrad)" strokeWidth="14" strokeLinecap="round"/>
                    <g transform={`rotate(${gaugeAngle - 90}, 100, 100)`}>
                      <line x1="100" y1="100" x2="100" y2="28" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round"/>
                      <circle cx="100" cy="100" r="5" fill="#1e293b"/>
                    </g>
                    <text x="100" y="86" textAnchor="middle" fontSize="18" fontWeight="800" fill="#1e293b">{result.ngdl}</text>
                    <text x="100" y="100" textAnchor="middle" fontSize="8" fill="#64748b">ng/dL</text>
                    <text x="100" y="110" textAnchor="middle" fontSize="7.5" fill="#94a3b8">{result.nmol} nmol/L</text>
                  </svg>
                </div>

                <div className="testo-result__label" style={{ color: result.category.color }}>
                  {result.category.label}
                </div>
                <p className="testo-result__tip">{result.category.tip}</p>
                <a className="testo-result__link" href="http://www.medscape.com/viewarticle/543997_3" target="_blank" rel="noopener noreferrer">
                  External resource: Medscape — Testosterone Therapy →
                </a>
                <button className="testo-result__reset" onClick={reset}>Recalculate</button>
              </div>
            )}
          </div>

          {/* ── Reference table ── */}
          <section className="testo-section">
            <h2>Testosterone Levels Chart</h2>
            <div className="testo-table-wrap">
              <table className="testo-table">
                <thead>
                  <tr>
                    <th>Total Testosterone (ng/dL)</th>
                    <th>Approx. nmol/L</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {tableRows.map((row, i) => (
                    <tr key={i} className={result && T_CATEGORIES[i].label === result.category.label ? 'testo-table__active' : ''}>
                      <td><span className="testo-table__dot" style={{ background: row.color }}/>{row.range}</td>
                      <td style={{ color: '#64748b', fontSize: '.82rem' }}>
                        {i === 0 ? '< 6.9' : i === 1 ? '6.9 – 10.4' : i === 2 ? '10.4 – 13.9' : i === 3 ? '13.9 – 24.3' : i === 4 ? '24.3 – 31.2' : '> 31.2'}
                      </td>
                      <td style={{ fontWeight: 700 }}>{row.label}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ── Content ── */}
          <section className="testo-section">
            <h2>Understanding Your Testosterone Level</h2>
            <p>
              Testosterone level is an important indicator of hormonal health. Low testosterone levels have been associated
              with <a href="/obesity-introduction/">cardiovascular disease, obesity</a>,{' '}
              <a href="/diabetes-introduction/">diabetes</a>, decreased libido, decreased energy, and depression.
            </p>
            <p>
              A simple blood test is used to measure total testosterone level. Normal testosterone levels range from{' '}
              <strong>300 ng/dL to 1050 ng/dL</strong>. Levels below 300 ng/dL are considered clinically low. EMG also
              provides more information on{' '}
              <a href="/testosterone-replacement-therapy-introduction/">low testosterone and testosterone replacement therapy</a>.
            </p>

            <div className="testo-callout">
              <div className="testo-callout__icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>
                </svg>
              </div>
              <div>
                <strong>Important:</strong> The normal range is broad — one man can have a testosterone level nearly
                3× higher than another and both be considered normal. A change from your <em>personal baseline</em> is
                just as important as the absolute number. A man with decreased testosterone may be symptomatic even if
                his new lower level still falls within the reference range.
              </div>
            </div>

            <p style={{ marginTop: '1rem' }}>
              Ultimately, the diagnosis of low testosterone and the decision to pursue treatment is considered on an
              individual basis — not simply based on numerical guidelines for generally accepted "normal" levels.
            </p>
          </section>

          {/* ── Age decline section ── */}
          <section className="testo-section">
            <h2>How Testosterone Changes with Age</h2>
            <p>
              Testosterone production peaks in the late teens and early twenties, then declines at approximately
              <strong> 1–2% per year</strong> after age 30. By age 70, many men have total testosterone levels 30–50%
              lower than they did at their peak.
            </p>
            <div className="testo-age-grid">
              {[
                { age: '20s', range: '600 – 1050', note: 'Peak production' },
                { age: '30s', range: '500 – 900',  note: 'Gradual decline begins' },
                { age: '40s', range: '400 – 800',  note: 'More noticeable drop' },
                { age: '50s', range: '350 – 700',  note: 'Symptoms more common' },
                { age: '60s+',range: '250 – 600',  note: 'Low T increasingly likely' },
              ].map((r, i) => (
                <div key={i} className="testo-age-card">
                  <div className="testo-age-card__age">{r.age}</div>
                  <div className="testo-age-card__range">{r.range} <span>ng/dL</span></div>
                  <div className="testo-age-card__note">{r.note}</div>
                </div>
              ))}
            </div>
          </section>

          {/* ── FAQ ── */}
          <section className="testo-section">
            <h2>Frequently Asked Questions</h2>
            <div className="testo-faq">
              {faqs.map((f, i) => (
                <div key={i} className={`testo-faq__item${openFaq === i ? ' open' : ''}`}>
                  <button className="testo-faq__q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                    {f.q}
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
                    </svg>
                  </button>
                  {openFaq === i && <div className="testo-faq__a">{f.a}</div>}
                </div>
              ))}
            </div>
          </section>

          {/* ── References ── */}
          <section className="testo-section">
            <div className="testo-refs">
              <button className="testo-refs__toggle" onClick={() => setRefsOpen(r => !r)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"/>
                </svg>
                References &amp; Citations
                <svg className={`testo-refs__chevron${refsOpen ? ' open' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
                </svg>
              </button>
              {refsOpen && (
                <ol className="testo-refs__list">
                  {references.map((ref, i) => <li key={i}>{ref}</li>)}
                </ol>
              )}
            </div>
          </section>

        </div>
      </div>
    </>
  )
}
