'use client'

import { useState, useCallback } from 'react'

type GlucoseUnit = 'mgdl' | 'mmol'

const CATEGORIES = [
  { label: 'Low (Hypoglycaemia)',  color: '#3b82f6', bg: '#eff6ff', min: 0,   max: 70,   tip: 'Blood glucose below 70 mg/dL is hypoglycaemia. Symptoms include shakiness, sweating, and confusion. If not eating, consult a doctor — especially if this is a recurring fasting reading.' },
  { label: 'Normal',               color: '#16a34a', bg: '#f0fdf4', min: 70,  max: 100,  tip: 'Your fasting blood glucose is in the normal range. Maintain this through a balanced diet, regular exercise, and healthy weight management.' },
  { label: 'Prediabetes',          color: '#d97706', bg: '#fffbeb', min: 100, max: 126,  tip: 'Impaired fasting glucose — a form of prediabetes. This significantly increases your risk of developing type 2 diabetes. Lifestyle changes (diet, exercise, weight loss) can reverse this.' },
  { label: 'Diabetes',             color: '#dc2626', bg: '#fef2f2', min: 126, max: 9999, tip: 'A fasting glucose above 126 mg/dL is consistent with diabetes (confirmed by two separate tests). Medical evaluation and treatment is required. Lifestyle changes and medication can effectively manage this.' },
]

// 1 mmol/L = 18.018 mg/dL
function toMgdl(value: number, unit: GlucoseUnit): number {
  return unit === 'mmol' ? value * 18.018 : value
}

function getCategory(mgdl: number) {
  return CATEGORIES.find(c => mgdl < c.max) ?? CATEGORIES[CATEGORIES.length - 1]
}

const faqs = [
  {
    q: 'What is a normal fasting blood glucose level?',
    a: 'A normal fasting blood glucose level is between 70 and 99 mg/dL (3.9–5.5 mmol/L). The test requires abstaining from food and drink (except water) for at least 8 hours before the blood draw.',
  },
  {
    q: 'What is prediabetes?',
    a: 'Prediabetes (impaired fasting glucose) is a fasting blood glucose between 100 and 125 mg/dL (5.6–6.9 mmol/L). It means blood sugar is higher than normal but not yet in the diabetic range. Without intervention, many people with prediabetes develop type 2 diabetes within 10 years.',
  },
  {
    q: 'At what level is diabetes diagnosed?',
    a: 'A fasting blood glucose of 126 mg/dL (7.0 mmol/L) or higher on two separate occasions is diagnostic of diabetes, as defined by the American Diabetes Association. A random blood sugar above 200 mg/dL with symptoms is also diagnostic.',
  },
  {
    q: 'Can prediabetes be reversed?',
    a: 'Yes — prediabetes is often reversible. The landmark Diabetes Prevention Program showed that losing 5–7% of body weight through diet and 150 minutes per week of moderate exercise reduced the risk of progressing to type 2 diabetes by 58%. Metformin is also used in higher-risk individuals.',
  },
  {
    q: 'What affects fasting blood glucose levels?',
    a: 'Besides diet and physical activity, fasting glucose is affected by stress (raises cortisol, which raises glucose), sleep quality, certain medications (steroids, some antidepressants), illness, and hormonal imbalances. Consistently elevated fasting glucose despite lifestyle changes warrants medical investigation.',
  },
  {
    q: 'What is the difference between fasting glucose and HbA1c?',
    a: 'Fasting blood glucose is a snapshot of your blood sugar at one moment. HbA1c (glycated haemoglobin) reflects average blood sugar over the previous 2–3 months. Both tests are used for diabetes screening. An HbA1c of 5.7–6.4% corresponds to prediabetes; 6.5%+ indicates diabetes.',
  },
]

const references = [
  'Lin J. (2012). "Glucose." Medscape Reference. http://emedicine.medscape.com/article/2087913-overview',
  'American Diabetes Association. (2023). "Standards of Medical Care in Diabetes." Diabetes Care 46 (Suppl 1).',
  'Knowler WC, Barrett-Connor E, Fowler SE, et al. (2002). "Reduction in the Incidence of Type 2 Diabetes with Lifestyle Intervention or Metformin." NEJM 346 (6): 393–403.',
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

interface Result { mgdl: number; mmol: number; category: typeof CATEGORIES[0] }

export default function FastingBloodGlucosePage() {
  const [unit, setUnit]     = useState<GlucoseUnit>('mgdl')
  const [value, setValue]   = useState('')
  const [result, setResult] = useState<Result | null>(null)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [refsOpen, setRefsOpen] = useState(false)
  const [error, setError]   = useState('')

  const calculate = useCallback(() => {
    setError('')
    const num = parseFloat(value)
    if (!num || num <= 0) { setError('Please enter a valid glucose value.'); return }
    const mgdl = toMgdl(num, unit)
    if (mgdl < 20 || mgdl > 600) { setError('Value seems out of range. Please check your units.'); return }
    setResult({
      mgdl: Math.round(mgdl),
      mmol: parseFloat((mgdl / 18.018).toFixed(1)),
      category: getCategory(mgdl),
    })
  }, [value, unit])

  const reset = () => { setValue(''); setResult(null); setError('') }

  // Gauge: map 50–250 mg/dL → 0–180°
  const gaugeAngle = result ? Math.min(Math.max(((result.mgdl - 50) / 200) * 180, 0), 180) : 0

  const tableRows = [
    { range: '< 70 mg/dL',    mmol: '< 3.9',    label: 'Low (Hypoglycaemia)', color: '#3b82f6' },
    { range: '70 – 99 mg/dL', mmol: '3.9 – 5.5', label: 'Normal',             color: '#16a34a' },
    { range: '100 – 125 mg/dL',mmol: '5.6 – 6.9',label: 'Prediabetes',        color: '#d97706' },
    { range: '≥ 126 mg/dL',   mmol: '≥ 7.0',    label: 'Diabetes',            color: '#dc2626' },
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}/>

      <div className="fbg-page">

        {/* ── Hero ── */}
        <div className="fbg-hero">
          <div className="fbg-hero__inner">
            <p className="fbg-hero__eyebrow">Health Numbers</p>
            <h1 className="fbg-hero__title">Fasting Blood Glucose Calculator</h1>
            <p className="fbg-hero__sub">
              Enter your fasting blood sugar reading to screen for normal levels, prediabetes, or diabetes.
            </p>
          </div>
        </div>

        <div className="fbg-body">

          {/* ── Calculator card ── */}
          <div className="fbg-calc-card">

            <div className="fbg-unit-toggle">
              <button className={`fbg-unit-btn${unit === 'mgdl' ? ' active' : ''}`}
                onClick={() => { setUnit('mgdl'); setResult(null) }}>mg/dL</button>
              <button className={`fbg-unit-btn${unit === 'mmol' ? ' active' : ''}`}
                onClick={() => { setUnit('mmol'); setResult(null) }}>mmol/L</button>
            </div>

            <div className="fbg-input-row">
              <div className="fbg-field">
                <label>Fasting blood glucose (8+ hrs without food)</label>
                <div className="fbg-input-wrap">
                  <input
                    type="number" min="0" step="0.1"
                    placeholder={unit === 'mgdl' ? 'e.g. 92' : 'e.g. 5.1'}
                    value={value} onChange={e => setValue(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && calculate()}
                  />
                  <span>{unit === 'mgdl' ? 'mg/dL' : 'mmol/L'}</span>
                </div>
              </div>
            </div>

            {error && <p className="fbg-error">{error}</p>}
            <button className="fbg-calc-btn" onClick={calculate}>Check My Blood Sugar</button>

            {/* ── Result ── */}
            {result && (
              <div className="fbg-result" style={{ borderColor: result.category.color, background: result.category.bg }}>

                {/* Gauge */}
                <div className="fbg-gauge">
                  <svg viewBox="0 0 200 110" className="fbg-gauge__svg">
                    <defs>
                      <linearGradient id="fbgGaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%"   stopColor="#3b82f6"/>
                        <stop offset="15%"  stopColor="#16a34a"/>
                        <stop offset="50%"  stopColor="#d97706"/>
                        <stop offset="70%"  stopColor="#ef4444"/>
                        <stop offset="100%" stopColor="#dc2626"/>
                      </linearGradient>
                    </defs>
                    <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#e5e7eb" strokeWidth="14" strokeLinecap="round"/>
                    <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="url(#fbgGaugeGrad)" strokeWidth="14" strokeLinecap="round"/>
                    <g transform={`rotate(${gaugeAngle - 90}, 100, 100)`}>
                      <line x1="100" y1="100" x2="100" y2="28" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round"/>
                      <circle cx="100" cy="100" r="5" fill="#1e293b"/>
                    </g>
                    <text x="100" y="84" textAnchor="middle" fontSize="18" fontWeight="800" fill="#1e293b">{result.mgdl}</text>
                    <text x="100" y="97" textAnchor="middle" fontSize="7.5" fill="#64748b">mg/dL</text>
                    <text x="100" y="108" textAnchor="middle" fontSize="7" fill="#94a3b8">{result.mmol} mmol/L</text>
                  </svg>
                </div>

                <div className="fbg-result__label" style={{ color: result.category.color }}>
                  {result.category.label}
                </div>
                <p className="fbg-result__tip">{result.category.tip}</p>
                <a className="fbg-result__link"
                  href="http://www.nlm.nih.gov/medlineplus/ency/article/003482.htm"
                  target="_blank" rel="noopener noreferrer">
                  External resource: MedlinePlus — Blood Sugar Test →
                </a>
                <button className="fbg-result__reset" onClick={reset}>Recalculate</button>
              </div>
            )}
          </div>

          {/* ── Reference table ── */}
          <section className="fbg-section">
            <h2>Fasting Blood Glucose Level Chart</h2>
            <p>
              Fasting blood glucose is measured after abstaining from eating for at least 8 hours. The chart below
              uses guidelines from the <strong>American Diabetes Association</strong>.
            </p>
            <div className="fbg-table-wrap">
              <table className="fbg-table">
                <thead>
                  <tr>
                    <th>Fasting Blood Sugar (mg/dL)</th>
                    <th>Approx. mmol/L</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {tableRows.map((row, i) => (
                    <tr key={i} className={result && CATEGORIES[i].label === result.category.label ? 'fbg-table__active' : ''}>
                      <td><span className="fbg-table__dot" style={{ background: row.color }}/>{row.range}</td>
                      <td style={{ color: '#64748b', fontSize: '.82rem' }}>{row.mmol}</td>
                      <td style={{ fontWeight: 700 }}>{row.label}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ── Content section ── */}
          <section className="fbg-section">
            <h2>Understanding Your Result</h2>
            <p>
              Fasting blood glucose levels between <strong>70 and 99 mg/dL</strong> are considered normal. A level
              between 100 and 125 mg/dL means you have impaired fasting glucose — a type of prediabetes — which
              significantly increases your risk of developing type 2 diabetes.
            </p>
            <p>
              A level greater than <strong>126 mg/dL</strong> usually indicates diabetes (confirmed by two separate
              tests). For a comprehensive overview, see the EMG{' '}
              <a href="/diabetes-introduction/">Diabetes section</a>.
            </p>

            <div className="fbg-stages">
              {[
                { label: 'Hypoglycaemia',  range: '< 70 mg/dL',    color: '#3b82f6', desc: 'Blood sugar too low. Can cause dizziness, sweating, confusion. Requires immediate attention if symptoms present.' },
                { label: 'Normal',         range: '70 – 99 mg/dL', color: '#16a34a', desc: 'Healthy fasting range. Maintain with balanced nutrition, regular exercise, and stress management.' },
                { label: 'Prediabetes',    range: '100 – 125 mg/dL',color: '#d97706', desc: 'Impaired fasting glucose. Fully reversible with a 5–7% weight loss and 150 min/week of moderate exercise.' },
                { label: 'Diabetes',       range: '≥ 126 mg/dL',   color: '#dc2626', desc: 'Consistent with diabetes. Requires medical evaluation, lifestyle modification, and possibly medication.' },
              ].map((s, i) => (
                <div key={i} className="fbg-stage-card" style={{ borderLeftColor: s.color }}>
                  <div className="fbg-stage-card__top">
                    <span className="fbg-stage-card__label" style={{ color: s.color }}>{s.label}</span>
                    <span className="fbg-stage-card__range">{s.range}</span>
                  </div>
                  <p className="fbg-stage-card__desc">{s.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ── FAQ ── */}
          <section className="fbg-section">
            <h2>Frequently Asked Questions</h2>
            <div className="fbg-faq">
              {faqs.map((f, i) => (
                <div key={i} className={`fbg-faq__item${openFaq === i ? ' open' : ''}`}>
                  <button className="fbg-faq__q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                    {f.q}
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
                    </svg>
                  </button>
                  {openFaq === i && <div className="fbg-faq__a">{f.a}</div>}
                </div>
              ))}
            </div>
          </section>

          {/* ── References ── */}
          <section className="fbg-section">
            <div className="fbg-refs">
              <button className="fbg-refs__toggle" onClick={() => setRefsOpen(r => !r)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"/>
                </svg>
                References &amp; Citations
                <svg className={`fbg-refs__chevron${refsOpen ? ' open' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
                </svg>
              </button>
              {refsOpen && (
                <ol className="fbg-refs__list">
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
