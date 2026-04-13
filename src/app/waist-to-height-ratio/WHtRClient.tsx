'use client'

import { useState, useCallback } from 'react'

// WHtR categories for men (Ashwell / Browning thresholds)
const WHTR_CATEGORIES = [
  { max: 0.35, label: 'Underweight',          color: '#3b82f6', bg: '#eff6ff', tip: 'Your waist is very small relative to your height. Consider speaking with a doctor about healthy weight gain.' },
  { max: 0.43, label: 'Healthy — Slim',       color: '#10b981', bg: '#ecfdf5', tip: 'You are in great shape. Slim and healthy — keep up regular activity and a balanced diet.' },
  { max: 0.53, label: 'Healthy',              color: '#16a34a', bg: '#f0fdf4', tip: 'Your waist-to-height ratio is in the healthy range. Maintain this with consistent exercise and good nutrition.' },
  { max: 0.58, label: 'Overweight',           color: '#d97706', bg: '#fffbeb', tip: 'You are carrying more abdominal fat than is ideal. Small reductions in waist size significantly reduce cardiometabolic risk.' },
  { max: 0.63, label: 'Seriously Overweight', color: '#ea580c', bg: '#fff7ed', tip: 'Your risk of diabetes, high blood pressure and heart disease is elevated. A structured diet and exercise plan is recommended.' },
  { max: 999,  label: 'Morbidly Obese',       color: '#9f1239', bg: '#fff1f2', tip: 'Please speak with a healthcare professional. Significant health risks are present. Medical support is strongly advised.' },
]

function getCategory(whtr: number) {
  return WHTR_CATEGORIES.find(c => whtr < c.max) ?? WHTR_CATEGORIES[WHTR_CATEGORIES.length - 1]
}

// Convert all inputs to cm
function toCm(val: number, unit: 'in' | 'cm'): number {
  return unit === 'in' ? val * 2.54 : val
}
function heightToCm(ft: number, inches: number, unit: 'imperial' | 'metric', cm: number): number {
  return unit === 'imperial' ? ft * 30.48 + inches * 2.54 : cm
}

const faqs = [
  {
    q: 'What is a healthy Waist-to-Height Ratio for men?',
    a: 'For men, a WHtR below 0.50 is generally considered healthy. The Ashwell "shape-up" guideline states: keep your waist to less than half your height. A ratio of 0.43–0.53 is the healthy range for adult men.',
  },
  {
    q: 'Is WHtR better than BMI?',
    a: 'Many researchers and the European Congress on Obesity consider WHtR to be a superior predictor of cardiometabolic risk. Unlike BMI, it directly measures abdominal fat — the most dangerous type — and is not skewed by muscle mass or frame size.',
  },
  {
    q: 'How do I measure my waist correctly?',
    a: 'Measure at the belly button level with a tape measure, not at your trouser waistband (which is typically lower and smaller). Stand relaxed, breathe out normally, and measure without pulling the tape tight. Do not rely on your clothing size — manufacturers often add extra room.',
  },
  {
    q: 'Why is abdominal fat particularly dangerous?',
    a: 'Visceral fat — fat stored around the abdomen — surrounds organs like the heart, liver and kidneys. It is metabolically active and releases inflammatory compounds. Abdominal fat increases risk of type 2 diabetes, cardiovascular disease, and high blood pressure far more than fat around the hips or thighs.',
  },
  {
    q: 'Can I reduce my WHtR through exercise?',
    a: 'Yes. A combination of cardiovascular exercise and resistance training, combined with a calorie-controlled diet, is the most effective approach to reducing waist circumference. Even a small reduction in waist size (2–3 cm) can meaningfully lower your cardiometabolic risk.',
  },
  {
    q: 'What does a WHtR of 0.5 mean?',
    a: 'A ratio of exactly 0.50 means your waist measurement is exactly half your height. This is widely used as the boundary between healthy and overweight for both men and women, backed by a 2010 systematic review across 300,000 people.',
  },
]

const references = [
  'Schneider HJ, Friedrich N, Klotsche J, et al. (2010). "The predictive value of different measures of obesity for incident cardiovascular events and mortality." J Clin Endocrinol Metab 95 (4): 1777–1785.',
  'Lee CM, Huxley RR, Wildman RP, Woodward M. (2008). "Indices of abdominal obesity are better discriminators of cardiovascular risk factors than BMI: a meta-analysis." J Clin Epidemiol 61 (7): 646–653.',
  'Browning LM. (2010). "A systematic review of waist-to-height ratio as a screening tool for the prediction of cardiovascular disease and diabetes: 0·5 could be a suitable global boundary value." Nutrition Research Reviews 23 (02): 247–69.',
  'Savva SC, Lamnisos D, Kafatos AG. (2013). "Predicting cardiometabolic risk: waist-to-height ratio or BMI. A meta-analysis." Diabetes Metab Syndr Obes 6: 403–419.',
  'Ashwell M, Gunn P, Gibson S. (2012). "Waist-to-height ratio is a better screening tool than waist circumference and BMI for adult cardiometabolic risk factors: systematic review and meta-analysis." Obes Rev 13 (3): 275–286.',
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

type WaistUnit  = 'in' | 'cm'
type HeightUnit = 'imperial' | 'metric'

interface Result { whtr: number; pct: number; category: typeof WHTR_CATEGORIES[0] }

export default function WHtRCalculatorPage() {
  const [waistUnit, setWaistUnit]   = useState<WaistUnit>('in')
  const [heightUnit, setHeightUnit] = useState<HeightUnit>('imperial')

  const [waist, setWaist]   = useState('')
  const [waistCm, setWaistCm] = useState('')
  const [ft, setFt]         = useState('')
  const [inVal, setInVal]   = useState('')
  const [cm, setCm]         = useState('')

  const [result, setResult]   = useState<Result | null>(null)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [refsOpen, setRefsOpen] = useState(false)
  const [error, setError]     = useState('')

  const calculate = useCallback(() => {
    setError('')
    const waistCmVal = toCm(
      waistUnit === 'in' ? parseFloat(waist) || 0 : parseFloat(waistCm) || 0,
      waistUnit === 'in' ? 'in' : 'cm'
    )
    const heightCmVal = heightToCm(
      parseFloat(ft) || 0, parseFloat(inVal) || 0, heightUnit, parseFloat(cm) || 0
    )

    if (waistCmVal < 30 || waistCmVal > 200) { setError('Please enter a valid waist measurement.'); return }
    if (heightCmVal < 100 || heightCmVal > 250) { setError('Please enter a valid height.'); return }

    const whtr = waistCmVal / heightCmVal
    const pct  = Math.round(whtr * 100)
    setResult({ whtr, pct, category: getCategory(whtr) })
  }, [waistUnit, heightUnit, waist, waistCm, ft, inVal, cm])

  const reset = () => {
    setWaist(''); setWaistCm(''); setFt(''); setInVal(''); setCm('')
    setResult(null); setError('')
  }

  // Gauge: map WHtR 0.30 → 0.70 to 0 → 180 degrees
  const gaugeAngle = result ? Math.min(Math.max(((result.whtr - 0.30) / 0.40) * 180, 0), 180) : 0

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="whtr-page">

        {/* ── Hero ── */}
        <div className="whtr-hero">
          <div className="whtr-hero__inner">
            <p className="whtr-hero__eyebrow">Health Numbers</p>
            <h1 className="whtr-hero__title">Waist-to-Height Ratio Calculator</h1>
            <p className="whtr-hero__sub">
              A better predictor of cardiovascular risk than BMI. Keep your waist to less than half your height.
            </p>
          </div>
        </div>

        <div className="whtr-body">

          {/* ── Calculator card ── */}
          <div className="whtr-calc-card">

            {/* Unit toggles */}
            <div className="whtr-toggles">
              <div className="whtr-toggle-group">
                <span className="whtr-toggle-label">Waist unit</span>
                <div className="whtr-toggle">
                  {(['in','cm'] as WaistUnit[]).map(u => (
                    <button key={u} className={`whtr-toggle-btn${waistUnit === u ? ' active' : ''}`}
                      onClick={() => { setWaistUnit(u); setResult(null) }}>{u}</button>
                  ))}
                </div>
              </div>
              <div className="whtr-toggle-group">
                <span className="whtr-toggle-label">Height unit</span>
                <div className="whtr-toggle">
                  {(['imperial','metric'] as HeightUnit[]).map(u => (
                    <button key={u} className={`whtr-toggle-btn${heightUnit === u ? ' active' : ''}`}
                      onClick={() => { setHeightUnit(u); setResult(null) }}>
                      {u === 'imperial' ? 'ft / in' : 'cm'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Inputs */}
            <div className="whtr-inputs">
              <div className="whtr-field">
                <label>Waist circumference</label>
                {waistUnit === 'in' ? (
                  <div className="whtr-input-wrap">
                    <input type="number" min="20" max="80" step="0.1" placeholder="e.g. 34"
                      value={waist} onChange={e => setWaist(e.target.value)} />
                    <span>in</span>
                  </div>
                ) : (
                  <div className="whtr-input-wrap">
                    <input type="number" min="50" max="200" step="0.5" placeholder="e.g. 86"
                      value={waistCm} onChange={e => setWaistCm(e.target.value)} />
                    <span>cm</span>
                  </div>
                )}
              </div>

              <div className="whtr-field">
                <label>Height</label>
                {heightUnit === 'imperial' ? (
                  <div className="whtr-height-row">
                    <div className="whtr-input-wrap">
                      <input type="number" min="3" max="8" placeholder="5"
                        value={ft} onChange={e => setFt(e.target.value)} />
                      <span>ft</span>
                    </div>
                    <div className="whtr-input-wrap">
                      <input type="number" min="0" max="11" placeholder="10"
                        value={inVal} onChange={e => setInVal(e.target.value)} />
                      <span>in</span>
                    </div>
                  </div>
                ) : (
                  <div className="whtr-input-wrap">
                    <input type="number" min="100" max="250" placeholder="e.g. 178"
                      value={cm} onChange={e => setCm(e.target.value)} />
                    <span>cm</span>
                  </div>
                )}
              </div>
            </div>

            {error && <p className="whtr-error">{error}</p>}

            <button className="whtr-calc-btn" onClick={calculate}>Calculate WHtR</button>

            {/* ── Result ── */}
            {result && (
              <div className="whtr-result" style={{ borderColor: result.category.color, background: result.category.bg }}>

                {/* Gauge */}
                <div className="whtr-gauge">
                  <svg viewBox="0 0 200 110" className="whtr-gauge__svg">
                    <defs>
                      <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%"   stopColor="#3b82f6"/>
                        <stop offset="20%"  stopColor="#10b981"/>
                        <stop offset="45%"  stopColor="#16a34a"/>
                        <stop offset="65%"  stopColor="#d97706"/>
                        <stop offset="80%"  stopColor="#ea580c"/>
                        <stop offset="100%" stopColor="#9f1239"/>
                      </linearGradient>
                    </defs>
                    <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#e5e7eb" strokeWidth="14" strokeLinecap="round"/>
                    <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="url(#gaugeGrad)" strokeWidth="14" strokeLinecap="round"/>
                    <g transform={`rotate(${gaugeAngle - 90}, 100, 100)`}>
                      <line x1="100" y1="100" x2="100" y2="28" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round"/>
                      <circle cx="100" cy="100" r="5" fill="#1e293b"/>
                    </g>
                    <text x="100" y="88" textAnchor="middle" fontSize="20" fontWeight="800" fill="#1e293b">{result.pct}%</text>
                    <text x="100" y="103" textAnchor="middle" fontSize="8" fill="#64748b">WHtR = {result.whtr.toFixed(2)}</text>
                  </svg>
                </div>

                <div className="whtr-result__label" style={{ color: result.category.color }}>
                  {result.category.label}
                </div>
                <p className="whtr-result__tip">{result.category.tip}</p>
                <a className="whtr-result__link" href="https://en.wikipedia.org/wiki/Waist-to-height_ratio" target="_blank" rel="noopener noreferrer">
                  External resource: Wikipedia — Waist-to-Height Ratio →
                </a>
                <button className="whtr-result__reset" onClick={reset}>Recalculate</button>
              </div>
            )}
          </div>

          {/* ── WHtR table ── */}
          <section className="whtr-section">
            <h2>WHtR Results for Men</h2>
            <p>The table below categorises the ratios and provides a description of each category for men.</p>
            <div className="whtr-table-wrap">
              <table className="whtr-table">
                <thead>
                  <tr>
                    <th>WHtR</th>
                    <th>Ratio</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { range: '< 35%',    ratio: '< 0.35', label: 'Underweight',          color: '#3b82f6' },
                    { range: '35 – 43%', ratio: '0.35 – 0.43', label: 'Healthy: Slim',   color: '#10b981' },
                    { range: '43 – 53%', ratio: '0.43 – 0.53', label: 'Healthy',         color: '#16a34a' },
                    { range: '53 – 58%', ratio: '0.53 – 0.58', label: 'Overweight',      color: '#d97706' },
                    { range: '58 – 63%', ratio: '0.58 – 0.63', label: 'Seriously Overweight', color: '#ea580c' },
                    { range: '> 63%',    ratio: '> 0.63', label: 'Morbidly Obese',       color: '#9f1239' },
                  ].map((row, i) => (
                    <tr key={i} className={result && WHTR_CATEGORIES[i].label === result.category.label ? 'whtr-table__active' : ''}>
                      <td><span className="whtr-table__dot" style={{ background: row.color }} />{row.range}</td>
                      <td style={{ color: '#64748b', fontSize: '.82rem' }}>{row.ratio}</td>
                      <td style={{ fontWeight: 700 }}>{row.label}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ── How to measure ── */}
          <section className="whtr-section">
            <h2>How to Determine Your WHtR</h2>
            <p>
              First, measure your waist size with a tape measure <strong>at the belly button</strong>. Do not measure your
              waist where your pants sit — this area is often smaller than your true waist. It is important to actually
              measure your waist size and not rely on your pant size. Many clothing manufacturers make their sizes larger
              than stated on the label to avoid offending customers.
            </p>
            <div className="whtr-callout">
              <div className="whtr-callout__icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"/>
                </svg>
              </div>
              <div>
                Divide your waist (in any unit) by your height <strong>in the same unit</strong>. The resulting number
                is your WHtR. A value under <strong>0.50</strong> means your waist is less than half your height — the
                key boundary for healthy risk.
              </div>
            </div>
          </section>

          {/* ── BMI vs WHtR ── */}
          <section className="whtr-section">
            <h2>BMI vs. Waist-to-Height Ratio</h2>
            <p>
              BMI is generally more well known than the waist-to-height ratio for measuring body composition. Nevertheless,
              many physicians believe WHtR to be the superior measure. This is because BMI can be skewed by an individual's
              frame or quantity of muscle mass — the WHtR is a far better measure for anyone with significant muscle mass.
            </p>
            <p>
              The European Congress on Obesity has stated that WHtR is the best way to predict a person's risk of serious
              health problems such as diabetes, high blood pressure, and heart disease.
            </p>
            <p>
              Unlike BMI, the WHtR is based on waist size — the most dangerous place to carry weight. Abdominal fat
              affects organs like the heart, liver, and kidneys far more adversely than fat around the hips and bottom
              in terms of cardiometabolic risk.
            </p>
            <div className="whtr-compare-grid">
              <div className="whtr-compare-card whtr-compare-card--bad">
                <div className="whtr-compare-card__title">BMI Limitations</div>
                <ul>
                  <li>Doesn&apos;t distinguish muscle from fat</li>
                  <li>Skewed by frame size</li>
                  <li>Misclassifies muscular men as overweight</li>
                  <li>Ignores fat distribution</li>
                </ul>
              </div>
              <div className="whtr-compare-card whtr-compare-card--good">
                <div className="whtr-compare-card__title">WHtR Advantages</div>
                <ul>
                  <li>Directly measures abdominal fat</li>
                  <li>Simple &amp; universal boundary (0.50)</li>
                  <li>Not skewed by muscle mass</li>
                  <li>Better predictor of cardiometabolic risk</li>
                </ul>
              </div>
            </div>
          </section>

          {/* ── FAQ ── */}
          <section className="whtr-section">
            <h2>Frequently Asked Questions</h2>
            <div className="whtr-faq">
              {faqs.map((f, i) => (
                <div key={i} className={`whtr-faq__item${openFaq === i ? ' open' : ''}`}>
                  <button className="whtr-faq__q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                    {f.q}
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
                    </svg>
                  </button>
                  {openFaq === i && <div className="whtr-faq__a">{f.a}</div>}
                </div>
              ))}
            </div>
          </section>

          {/* ── References ── */}
          <section className="whtr-section">
            <div className="whtr-refs">
              <button className="whtr-refs__toggle" onClick={() => setRefsOpen(r => !r)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"/>
                </svg>
                References &amp; Citations
                <svg className={`whtr-refs__chevron${refsOpen ? ' open' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
                </svg>
              </button>
              {refsOpen && (
                <ol className="whtr-refs__list">
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
