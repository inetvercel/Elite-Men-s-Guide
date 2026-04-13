'use client'

import { useState, useCallback } from 'react'

// BP categories — systolic takes priority, but diastolic can independently elevate
const BP_CATEGORIES = [
  { label: 'Hypotension',         color: '#3b82f6', bg: '#eff6ff', sysMax: 90,  diasMax: 60,  tip: 'Your blood pressure is below the normal range. This can cause dizziness or fainting. If symptomatic, consult a doctor.' },
  { label: 'Ideal',               color: '#16a34a', bg: '#f0fdf4', sysMax: 120, diasMax: 80,  tip: 'Excellent. Your blood pressure is in the ideal range. Maintain this through regular exercise, a balanced diet, and low salt intake.' },
  { label: 'Prehypertension',     color: '#d97706', bg: '#fffbeb', sysMax: 140, diasMax: 90,  tip: 'Slightly elevated. Not yet hypertension but an early warning. Lifestyle changes — less sodium, more exercise — can bring this back to ideal.' },
  { label: 'Hypertension Stage 1',color: '#ea580c', bg: '#fff7ed', sysMax: 160, diasMax: 100, tip: 'Stage 1 hypertension. Your doctor should be consulted. Lifestyle modification and possibly medication is recommended.' },
  { label: 'Hypertension Stage 2',color: '#dc2626', bg: '#fef2f2', sysMax: 180, diasMax: 110, tip: 'Stage 2 hypertension. Medical treatment is strongly recommended. This significantly increases cardiovascular risk.' },
  { label: 'Hypertension Stage 3',color: '#9f1239', bg: '#fff1f2', sysMax: 9999, diasMax: 9999, tip: 'Severe hypertension. Seek medical attention. This level carries a high risk of stroke, heart attack, and kidney failure.' },
]

function getCategory(sys: number, dias: number) {
  if (sys < 90 || dias < 60) return BP_CATEGORIES[0]  // Hypotension
  if (sys < 120 && dias < 80) return BP_CATEGORIES[1] // Ideal
  if (sys < 140 && dias < 90) return BP_CATEGORIES[2] // Prehypertension
  if (sys < 160 && dias < 100) return BP_CATEGORIES[3] // Stage 1
  if (sys < 180 && dias < 110) return BP_CATEGORIES[4] // Stage 2
  return BP_CATEGORIES[5] // Stage 3
}

const faqs = [
  {
    q: 'What is a normal blood pressure for men?',
    a: 'A normal (ideal) blood pressure is between 90/60 mmHg and 119/79 mmHg. Blood pressure of 120–139 systolic or 80–89 diastolic is classified as prehypertension. Anything at or above 140/90 is hypertension.',
  },
  {
    q: 'What do the two numbers in a blood pressure reading mean?',
    a: 'The top number (systolic) measures the pressure in your arteries when your heart beats. The bottom number (diastolic) measures the pressure between beats when your heart is resting. Both numbers are clinically important.',
  },
  {
    q: 'How common is high blood pressure in men?',
    a: 'A 2005 US survey found that among men aged 20 and older, over 40 million have prehypertension, over 12 million have stage 1 hypertension, and over 4 million have stage 2 hypertension. Hypertension is one of the most common preventable health conditions.',
  },
  {
    q: 'Why is high blood pressure so dangerous?',
    a: 'High blood pressure is the most important modifiable risk factor for coronary heart disease (the leading cause of death in North America), stroke, congestive heart failure, end-stage kidney disease, and vascular disease. Mild-to-moderate hypertension left untreated is associated with a 30% risk of atherosclerotic disease and a 50% risk of organ damage after just 8–10 years.',
  },
  {
    q: 'How can I lower my blood pressure naturally?',
    a: 'Effective lifestyle strategies include: reducing sodium intake (aim for < 2,300 mg/day), regular aerobic exercise (30 min most days), maintaining a healthy weight, limiting alcohol, quitting smoking, managing stress, and following a DASH diet rich in fruits, vegetables, and low-fat dairy.',
  },
  {
    q: 'When should I see a doctor about blood pressure?',
    a: 'You should consult a doctor if your readings are consistently at or above 130/80 mmHg (Stage 1 by newer AHA guidelines), or immediately if above 180/120 mmHg. Readings vary throughout the day — a single elevated reading is not a diagnosis, but a pattern warrants medical evaluation.',
  },
]

const references = [
  'Kamran R. (2012). "Hypertension." Medscape Reference. http://emedicine.medscape.com/article/241381-overview',
  'Riaz K, Batuman V. (2012). "Hypertension." Medscape Reference. http://emedicine.medscape.com/article/241381-overview',
  'Qureshi AI, Suri MF, Kirmani JF, Divani AA. (2005). "Prevalence and trends of prehypertension and hypertension in United States: National Health and Nutrition Examination Surveys 1976 to 2000." Med Sci Monit 11 (9): CR403–409.',
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

interface Result { sys: number; dias: number; category: typeof BP_CATEGORIES[0] }

export default function BloodPressurePage() {
  const [sys, setSys]     = useState('')
  const [dias, setDias]   = useState('')
  const [result, setResult] = useState<Result | null>(null)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [refsOpen, setRefsOpen] = useState(false)
  const [error, setError] = useState('')

  const calculate = useCallback(() => {
    setError('')
    const s = parseFloat(sys)
    const d = parseFloat(dias)
    if (!s || !d || s <= 0 || d <= 0) { setError('Please enter both systolic and diastolic values.'); return }
    if (s < 40 || s > 300) { setError('Systolic value seems out of range (40–300 mmHg).'); return }
    if (d < 20 || d > 200) { setError('Diastolic value seems out of range (20–200 mmHg).'); return }
    if (d >= s) { setError('Diastolic pressure should be lower than systolic.'); return }
    setResult({ sys: s, dias: d, category: getCategory(s, d) })
  }, [sys, dias])

  const reset = () => { setSys(''); setDias(''); setResult(null); setError('') }

  // Gauge: map systolic 60 → 220 to 0 → 180 degrees
  const gaugeAngle = result ? Math.min(Math.max(((result.sys - 60) / 160) * 180, 0), 180) : 0

  const tableRows = [
    { sys: '< 90',     dias: '< 60',    label: 'Hypotension',          color: '#3b82f6' },
    { sys: '90 – 119', dias: '60 – 79', label: 'Ideal',                color: '#16a34a' },
    { sys: '120 – 139',dias: '80 – 89', label: 'Prehypertension',      color: '#d97706' },
    { sys: '140 – 159',dias: '90 – 99', label: 'Hypertension Stage 1', color: '#ea580c' },
    { sys: '160 – 179',dias: '100 – 109',label:'Hypertension Stage 2', color: '#dc2626' },
    { sys: '≥ 180',    dias: '≥ 110',   label: 'Hypertension Stage 3', color: '#9f1239' },
  ]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="bp-page">

        {/* ── Hero ── */}
        <div className="bp-hero">
          <div className="bp-hero__inner">
            <p className="bp-hero__eyebrow">Health Numbers</p>
            <h1 className="bp-hero__title">Blood Pressure Chart for Men</h1>
            <p className="bp-hero__sub">
              Enter your systolic and diastolic readings to understand your blood pressure category and cardiovascular risk.
            </p>
          </div>
        </div>

        <div className="bp-body">

          {/* ── Calculator card ── */}
          <div className="bp-calc-card">

            <div className="bp-inputs">
              <div className="bp-field">
                <label>Systolic (top number)</label>
                <div className="bp-input-wrap">
                  <input
                    type="number" min="40" max="300" placeholder="e.g. 120"
                    value={sys} onChange={e => setSys(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && calculate()}
                  />
                  <span>mmHg</span>
                </div>
              </div>
              <div className="bp-field">
                <label>Diastolic (bottom number)</label>
                <div className="bp-input-wrap">
                  <input
                    type="number" min="20" max="200" placeholder="e.g. 80"
                    value={dias} onChange={e => setDias(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && calculate()}
                  />
                  <span>mmHg</span>
                </div>
              </div>
            </div>

            {error && <p className="bp-error">{error}</p>}

            <button className="bp-calc-btn" onClick={calculate}>Check My Blood Pressure</button>

            {/* ── Result ── */}
            {result && (
              <div className="bp-result" style={{ borderColor: result.category.color, background: result.category.bg }}>

                {/* Gauge */}
                <div className="bp-gauge">
                  <svg viewBox="0 0 200 110" className="bp-gauge__svg">
                    <defs>
                      <linearGradient id="bpGaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%"   stopColor="#3b82f6"/>
                        <stop offset="20%"  stopColor="#16a34a"/>
                        <stop offset="45%"  stopColor="#d97706"/>
                        <stop offset="63%"  stopColor="#ea580c"/>
                        <stop offset="80%"  stopColor="#dc2626"/>
                        <stop offset="100%" stopColor="#9f1239"/>
                      </linearGradient>
                    </defs>
                    <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#e5e7eb" strokeWidth="14" strokeLinecap="round"/>
                    <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="url(#bpGaugeGrad)" strokeWidth="14" strokeLinecap="round"/>
                    <g transform={`rotate(${gaugeAngle - 90}, 100, 100)`}>
                      <line x1="100" y1="100" x2="100" y2="28" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round"/>
                      <circle cx="100" cy="100" r="5" fill="#1e293b"/>
                    </g>
                    <text x="100" y="84" textAnchor="middle" fontSize="16" fontWeight="800" fill="#1e293b">{result.sys}/{result.dias}</text>
                    <text x="100" y="97" textAnchor="middle" fontSize="7.5" fill="#64748b">systolic / diastolic</text>
                    <text x="100" y="108" textAnchor="middle" fontSize="7" fill="#94a3b8">mmHg</text>
                  </svg>
                </div>

                <div className="bp-result__label" style={{ color: result.category.color }}>
                  {result.category.label}
                </div>
                <p className="bp-result__tip">{result.category.tip}</p>
                <button className="bp-result__reset" onClick={reset}>Recalculate</button>
              </div>
            )}
          </div>

          {/* ── Reference table ── */}
          <section className="bp-section">
            <h2>Blood Pressure Measurements</h2>
            <p>
              All blood pressure measurements include two numbers: the <strong>systolic number</strong> (top — pressure
              during ventricular contraction) and the <strong>diastolic number</strong> (bottom — pressure during
              ventricular relaxation).
            </p>
            <div className="bp-table-wrap">
              <table className="bp-table">
                <thead>
                  <tr>
                    <th>Systolic (mmHg)</th>
                    <th>Diastolic (mmHg)</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {tableRows.map((row, i) => (
                    <tr key={i} className={result && BP_CATEGORIES[i].label === result.category.label ? 'bp-table__active' : ''}>
                      <td><span className="bp-table__dot" style={{ background: row.color }}/>{row.sys}</td>
                      <td style={{ color: '#64748b' }}>{row.dias}</td>
                      <td style={{ fontWeight: 700 }}>{row.label}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ── Context ── */}
          <section className="bp-section">
            <h2>Why Blood Pressure Matters</h2>
            <p>
              High blood pressure is the <strong>most important modifiable risk factor</strong> for coronary heart
              disease (the leading cause of death in North America), stroke (the third leading cause), congestive heart
              failure, end-stage kidney disease, and vascular disease.
            </p>
            <p>
              Mild-to-moderate hypertension, if left completely untreated, is associated with a <strong>30% risk of
              atherosclerotic disease</strong> and a <strong>50% risk of organ damage</strong> after only 8–10 years
              of onset.
            </p>
            <p>
              A 2005 survey in the United States found that in the male population aged 20 years or older, over
              40 million men have prehypertension, over 12 million have stage 1 hypertension, and over 4 million
              have stage 2 hypertension. For a comprehensive overview, see EMG's{' '}
              <a href="/blood-pressure-introduction/">Blood Pressure</a> section.
            </p>

            <div className="bp-risk-grid">
              {[
                { icon: '♥', label: 'Coronary Heart Disease', note: '#1 cause of death' },
                { icon: '🧠', label: 'Stroke',                 note: '#3 cause of death' },
                { icon: '🫀', label: 'Heart Failure',          note: 'Congestive' },
                { icon: '🩺', label: 'Kidney Disease',         note: 'End-stage renal' },
              ].map((item, i) => (
                <div key={i} className="bp-risk-card">
                  <div className="bp-risk-card__icon">{item.icon}</div>
                  <div className="bp-risk-card__label">{item.label}</div>
                  <div className="bp-risk-card__note">{item.note}</div>
                </div>
              ))}
            </div>
          </section>

          {/* ── FAQ ── */}
          <section className="bp-section">
            <h2>Frequently Asked Questions</h2>
            <div className="bp-faq">
              {faqs.map((f, i) => (
                <div key={i} className={`bp-faq__item${openFaq === i ? ' open' : ''}`}>
                  <button className="bp-faq__q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                    {f.q}
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
                    </svg>
                  </button>
                  {openFaq === i && <div className="bp-faq__a">{f.a}</div>}
                </div>
              ))}
            </div>
          </section>

          {/* ── References ── */}
          <section className="bp-section">
            <div className="bp-refs">
              <button className="bp-refs__toggle" onClick={() => setRefsOpen(r => !r)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"/>
                </svg>
                References &amp; Citations
                <svg className={`bp-refs__chevron${refsOpen ? ' open' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
                </svg>
              </button>
              {refsOpen && (
                <ol className="bp-refs__list">
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
