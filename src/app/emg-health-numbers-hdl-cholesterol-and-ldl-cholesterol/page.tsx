'use client'

import { useState, useCallback } from 'react'

const HDL_CATEGORIES = [
  { label: 'Poor',      color: '#dc2626', bg: '#fef2f2', min: 0,   max: 40,   tip: 'Low HDL is a major risk factor for cardiovascular disease. Aerobic exercise, quitting smoking, and losing excess weight are the most effective ways to raise HDL.' },
  { label: 'Good',      color: '#d97706', bg: '#fffbeb', min: 40,  max: 60,   tip: 'Acceptable HDL level. Aim to push this above 60 mg/dL for cardioprotective benefit through regular exercise and a diet rich in healthy fats.' },
  { label: 'Excellent', color: '#16a34a', bg: '#f0fdf4', min: 60,  max: 9999, tip: 'Excellent. HDL above 60 mg/dL is cardioprotective and associated with a significantly reduced risk of heart disease.' },
]

const LDL_CATEGORIES = [
  { label: 'Ideal — Very High Risk',  color: '#16a34a', bg: '#f0fdf4', min: 0,   max: 70,   tip: 'Optimal for men with existing heart disease or very high cardiovascular risk. This level minimises plaque progression.' },
  { label: 'Ideal — At Risk',         color: '#22c55e', bg: '#f0fdf4', min: 70,  max: 100,  tip: 'Optimal for men at elevated cardiovascular risk. Maintain through diet, exercise, and (if prescribed) statins.' },
  { label: 'Near Ideal',              color: '#84cc16', bg: '#f7fee7', min: 100, max: 130,  tip: 'Near ideal. Room to improve with dietary changes — reduce saturated fat, increase soluble fibre and plant sterols.' },
  { label: 'Borderline High',         color: '#d97706', bg: '#fffbeb', min: 130, max: 160,  tip: 'Borderline high. Lifestyle modification is strongly recommended. Your doctor may discuss medication depending on overall risk profile.' },
  { label: 'High',                    color: '#ea580c', bg: '#fff7ed', min: 160, max: 190,  tip: 'High LDL significantly increases coronary artery disease risk. Medical evaluation and likely treatment is recommended.' },
  { label: 'Very High',               color: '#9f1239', bg: '#fff1f2', min: 190, max: 9999, tip: 'Very high. Strongly associated with atherosclerosis and heart attack risk. Immediate medical attention is advised.' },
]

function getHDLCategory(val: number) {
  return HDL_CATEGORIES.find(c => val < c.max) ?? HDL_CATEGORIES[HDL_CATEGORIES.length - 1]
}
function getLDLCategory(val: number) {
  return LDL_CATEGORIES.find(c => val < c.max) ?? LDL_CATEGORIES[LDL_CATEGORIES.length - 1]
}

const faqs = [
  {
    q: 'What is the difference between HDL and LDL cholesterol?',
    a: 'LDL (low-density lipoprotein) is "bad" cholesterol — it deposits cholesterol on artery walls, leading to plaque build-up and coronary artery disease. HDL (high-density lipoprotein) is "good" cholesterol — it removes LDL from the bloodstream and transports it to the liver for elimination, protecting against heart disease.',
  },
  {
    q: 'What is a good HDL cholesterol level for men?',
    a: 'An HDL level above 60 mg/dL is considered excellent and cardioprotective. Between 40–59 mg/dL is acceptable. Below 40 mg/dL is considered poor and is an independent risk factor for cardiovascular disease. The AHA recommends keeping HDL as high as possible.',
  },
  {
    q: 'What should my LDL cholesterol be?',
    a: 'For most healthy men, LDL below 100 mg/dL is ideal. Men at high cardiovascular risk should aim for below 70 mg/dL. LDL of 130–159 mg/dL is borderline high, 160–189 mg/dL is high, and above 190 mg/dL is very high — all warrantint medical attention.',
  },
  {
    q: 'How can I raise my HDL cholesterol?',
    a: 'The most effective strategies are regular aerobic exercise (150+ min/week), quitting smoking, losing excess weight, consuming healthy fats (olive oil, nuts, avocado), moderate alcohol consumption, and eating fewer refined carbohydrates. Some medications (e.g. niacin) can also raise HDL.',
  },
  {
    q: 'How can I lower my LDL cholesterol?',
    a: 'Key dietary changes include reducing saturated and trans fats, increasing soluble fibre (oats, beans, fruits), adding plant sterols, and eating more fish. Regular exercise and weight loss also help. If lifestyle changes are insufficient, statins are the most proven medication class for LDL reduction.',
  },
  {
    q: 'How often should men get their cholesterol checked?',
    a: 'Men aged 20+ should have a fasting lipid panel every 4–6 years if risk is low. Men with risk factors (family history, high blood pressure, diabetes, smoking, obesity) should be tested more frequently — typically every 1–2 years. Your doctor will advise based on your full risk profile.',
  },
]

const references = [
  'Devkota B. (2012). "HDL Cholesterol." Medscape Reference. http://emedicine.medscape.com/article/2087757-overview',
  'Mir FA. (2012). "LDL Cholesterol." Medscape Reference. http://emedicine.medscape.com/article/2087735-overview',
  'American Heart Association. (2023). "About Cholesterol." heart.org',
  'Stone NJ, Robinson JG, Lichtenstein AH, et al. (2014). "2013 ACC/AHA Guideline on the Treatment of Blood Cholesterol." Circulation 129 (25 Suppl 2): S1–45.',
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

type ActiveTab = 'hdl' | 'ldl'
interface Result {
  hdl: number | null; ldl: number | null
  hdlCat: typeof HDL_CATEGORIES[0] | null
  ldlCat: typeof LDL_CATEGORIES[0] | null
}

export default function CholesterolPage() {
  const [tab, setTab]       = useState<ActiveTab>('hdl')
  const [hdlVal, setHdlVal] = useState('')
  const [ldlVal, setLdlVal] = useState('')
  const [result, setResult] = useState<Result | null>(null)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [refsOpen, setRefsOpen] = useState(false)
  const [error, setError]   = useState('')

  const calculate = useCallback(() => {
    setError('')
    const hdl = hdlVal ? parseFloat(hdlVal) : null
    const ldl = ldlVal ? parseFloat(ldlVal) : null
    if (!hdl && !ldl) { setError('Please enter at least one cholesterol value.'); return }
    if (hdl && (hdl < 5 || hdl > 200)) { setError('HDL value seems out of range (5–200 mg/dL).'); return }
    if (ldl && (ldl < 10 || ldl > 400)) { setError('LDL value seems out of range (10–400 mg/dL).'); return }
    setResult({
      hdl, ldl,
      hdlCat: hdl ? getHDLCategory(hdl) : null,
      ldlCat: ldl ? getLDLCategory(ldl) : null,
    })
  }, [hdlVal, ldlVal])

  const reset = () => { setHdlVal(''); setLdlVal(''); setResult(null); setError('') }

  const activeResult = result && (tab === 'hdl' ? result.hdlCat : result.ldlCat)
  const activeVal    = result && (tab === 'hdl' ? result.hdl : result.ldl)

  // Gauge: HDL 0–100, LDL 0–300
  const gaugeAngle = activeVal
    ? tab === 'hdl'
      ? Math.min(Math.max((activeVal / 100) * 180, 0), 180)
      : Math.min(Math.max((activeVal / 300) * 180, 0), 180)
    : 0

  const hdlRows = [
    { range: '< 40 mg/dL',  label: 'Poor',      color: '#dc2626' },
    { range: '40 – 59 mg/dL',label: 'Good',     color: '#d97706' },
    { range: '> 60 mg/dL',  label: 'Excellent', color: '#16a34a' },
  ]
  const ldlRows = [
    { range: '< 70 mg/dL',    label: 'Ideal — Very High Risk', color: '#16a34a' },
    { range: '< 100 mg/dL',   label: 'Ideal — At Risk',        color: '#22c55e' },
    { range: '100 – 129 mg/dL',label: 'Near Ideal',            color: '#84cc16' },
    { range: '130 – 159 mg/dL',label: 'Borderline High',       color: '#d97706' },
    { range: '160 – 189 mg/dL',label: 'High',                  color: '#ea580c' },
    { range: '≥ 190 mg/dL',   label: 'Very High',              color: '#9f1239' },
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}/>

      <div className="chol-page">

        {/* ── Hero ── */}
        <div className="chol-hero">
          <div className="chol-hero__inner">
            <p className="chol-hero__eyebrow">Health Numbers</p>
            <h1 className="chol-hero__title">HDL &amp; LDL Cholesterol Levels</h1>
            <p className="chol-hero__sub">
              Enter your cholesterol values from a blood test to understand your cardiovascular risk.
            </p>
          </div>
        </div>

        <div className="chol-body">

          {/* ── Calculator card ── */}
          <div className="chol-calc-card">

            <div className="chol-inputs">
              <div className="chol-field">
                <label>HDL Cholesterol <span className="chol-badge chol-badge--good">Good</span></label>
                <div className="chol-input-wrap">
                  <input type="number" min="0" step="1" placeholder="e.g. 55"
                    value={hdlVal} onChange={e => setHdlVal(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && calculate()}/>
                  <span>mg/dL</span>
                </div>
              </div>
              <div className="chol-field">
                <label>LDL Cholesterol <span className="chol-badge chol-badge--bad">Bad</span></label>
                <div className="chol-input-wrap">
                  <input type="number" min="0" step="1" placeholder="e.g. 110"
                    value={ldlVal} onChange={e => setLdlVal(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && calculate()}/>
                  <span>mg/dL</span>
                </div>
              </div>
            </div>

            {error && <p className="chol-error">{error}</p>}
            <button className="chol-calc-btn" onClick={calculate}>Check My Cholesterol</button>

            {/* ── Result ── */}
            {result && (
              <div className="chol-result">
                {/* Result tab switcher */}
                <div className="chol-result-tabs">
                  {result.hdl && (
                    <button className={`chol-result-tab${tab === 'hdl' ? ' active' : ''}`} onClick={() => setTab('hdl')}>
                      HDL: {result.hdl} <span>mg/dL</span>
                    </button>
                  )}
                  {result.ldl && (
                    <button className={`chol-result-tab${tab === 'ldl' ? ' active' : ''}`} onClick={() => setTab('ldl')}>
                      LDL: {result.ldl} <span>mg/dL</span>
                    </button>
                  )}
                </div>

                {activeResult && (
                  <div className="chol-result-body" style={{ borderColor: activeResult.color, background: activeResult.bg }}>
                    {/* Gauge */}
                    <div className="chol-gauge">
                      <svg viewBox="0 0 200 110" className="chol-gauge__svg">
                        <defs>
                          <linearGradient id="hdlGaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%"   stopColor="#dc2626"/>
                            <stop offset="40%"  stopColor="#d97706"/>
                            <stop offset="70%"  stopColor="#16a34a"/>
                            <stop offset="100%" stopColor="#16a34a"/>
                          </linearGradient>
                          <linearGradient id="ldlGaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%"   stopColor="#16a34a"/>
                            <stop offset="33%"  stopColor="#84cc16"/>
                            <stop offset="53%"  stopColor="#d97706"/>
                            <stop offset="70%"  stopColor="#ea580c"/>
                            <stop offset="100%" stopColor="#9f1239"/>
                          </linearGradient>
                        </defs>
                        <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#e5e7eb" strokeWidth="14" strokeLinecap="round"/>
                        <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none"
                          stroke={`url(#${tab === 'hdl' ? 'hdlGaugeGrad' : 'ldlGaugeGrad'})`}
                          strokeWidth="14" strokeLinecap="round"/>
                        <g transform={`rotate(${gaugeAngle - 90}, 100, 100)`}>
                          <line x1="100" y1="100" x2="100" y2="28" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round"/>
                          <circle cx="100" cy="100" r="5" fill="#1e293b"/>
                        </g>
                        <text x="100" y="86" textAnchor="middle" fontSize="18" fontWeight="800" fill="#1e293b">{activeVal}</text>
                        <text x="100" y="99" textAnchor="middle" fontSize="7.5" fill="#64748b">mg/dL</text>
                        <text x="100" y="110" textAnchor="middle" fontSize="7" fill="#94a3b8">{tab.toUpperCase()} Cholesterol</text>
                      </svg>
                    </div>

                    <div className="chol-result__label" style={{ color: activeResult.color }}>{activeResult.label}</div>
                    <p className="chol-result__tip">{activeResult.tip}</p>
                    <a className="chol-result__link"
                      href="http://www.heart.org/HEARTORG/Conditions/Cholesterol/AboutCholesterol/About-Cholesterol_UCM_001220_Article.jsp"
                      target="_blank" rel="noopener noreferrer">
                      External resource: AHA — About Cholesterol →
                    </a>
                    <button className="chol-result__reset" onClick={reset}>Recalculate</button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── HDL table ── */}
          <section className="chol-section">
            <h2>HDL Cholesterol Chart</h2>
            <p>
              HDL cholesterol is the <strong>"good" cholesterol</strong>. It removes LDL cholesterol from the bloodstream
              and transports it to the liver for elimination, protecting against coronary artery disease.
            </p>
            <div className="chol-table-wrap">
              <table className="chol-table">
                <thead>
                  <tr><th>HDL Cholesterol (mg/dL)</th><th>Description</th></tr>
                </thead>
                <tbody>
                  {hdlRows.map((row, i) => (
                    <tr key={i} className={result?.hdlCat?.label === HDL_CATEGORIES[i].label ? 'chol-table__active' : ''}>
                      <td><span className="chol-table__dot" style={{ background: row.color }}/>{row.range}</td>
                      <td style={{ fontWeight: 700 }}>{row.label}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ── LDL table ── */}
          <section className="chol-section">
            <h2>LDL Cholesterol Chart</h2>
            <p>
              LDL cholesterol is the <strong>"bad" cholesterol</strong>. It deposits cholesterol on artery walls,
              causing plaque build-up that leads to coronary artery disease. A high HDL and low LDL is the target
              combination for cardiovascular protection. For a comprehensive overview see EMG's{' '}
              <a href="/cholesterol-introduction/">Cholesterol</a> section.
            </p>
            <div className="chol-table-wrap">
              <table className="chol-table">
                <thead>
                  <tr><th>LDL Cholesterol (mg/dL)</th><th>Description</th></tr>
                </thead>
                <tbody>
                  {ldlRows.map((row, i) => (
                    <tr key={i} className={result?.ldlCat?.label === LDL_CATEGORIES[i].label ? 'chol-table__active' : ''}>
                      <td><span className="chol-table__dot" style={{ background: row.color }}/>{row.range}</td>
                      <td style={{ fontWeight: 700 }}>{row.label}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ── FAQ ── */}
          <section className="chol-section">
            <h2>Frequently Asked Questions</h2>
            <div className="chol-faq">
              {faqs.map((f, i) => (
                <div key={i} className={`chol-faq__item${openFaq === i ? ' open' : ''}`}>
                  <button className="chol-faq__q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                    {f.q}
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
                    </svg>
                  </button>
                  {openFaq === i && <div className="chol-faq__a">{f.a}</div>}
                </div>
              ))}
            </div>
          </section>

          {/* ── References ── */}
          <section className="chol-section">
            <div className="chol-refs">
              <button className="chol-refs__toggle" onClick={() => setRefsOpen(r => !r)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"/>
                </svg>
                References &amp; Citations
                <svg className={`chol-refs__chevron${refsOpen ? ' open' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
                </svg>
              </button>
              {refsOpen && (
                <ol className="chol-refs__list">
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
