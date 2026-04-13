'use client'

import { useState, useCallback } from 'react'

const BMI_CATEGORIES = [
  { min: 0,    max: 18.5, label: 'Underweight',     color: '#3b82f6', bg: '#eff6ff', tip: 'You may be at risk of nutritional deficiencies. Consider speaking with your doctor.' },
  { min: 18.5, max: 25,   label: 'Normal Weight',   color: '#16a34a', bg: '#f0fdf4', tip: 'You are in the healthy range. Maintain this through balanced diet and regular exercise.' },
  { min: 25,   max: 30,   label: 'Overweight',      color: '#d97706', bg: '#fffbeb', tip: 'Small lifestyle changes — more movement, better nutrition — can make a big difference.' },
  { min: 30,   max: 35,   label: 'Obese (Class 1)', color: '#ea580c', bg: '#fff7ed', tip: 'Speak with a healthcare professional about a safe weight management plan.' },
  { min: 35,   max: 40,   label: 'Obese (Class 2)', color: '#dc2626', bg: '#fef2f2', tip: 'Medical guidance is strongly recommended. Significant health risks are present.' },
  { min: 40,   max: 999,  label: 'Morbidly Obese',  color: '#9f1239', bg: '#fff1f2', tip: 'Please consult a doctor immediately. Significant intervention may be needed.' },
]

function getCategory(bmi: number) {
  return BMI_CATEGORIES.find(c => bmi >= c.min && bmi < c.max) ?? BMI_CATEGORIES[BMI_CATEGORIES.length - 1]
}

function calcBMI(weight: number, feet: number, inches: number, unit: 'imperial' | 'metric' | 'stones') {
  if (unit === 'imperial') {
    const totalInches = feet * 12 + inches
    if (!weight || !totalInches) return null
    return (703 * weight) / (totalInches * totalInches)
  } else if (unit === 'stones') {
    // weight = stones, feet = extra lbs; convert to total lbs first
    const totalLbs = weight * 14 + feet
    const totalInches = inches
    if (!totalLbs || !totalInches) return null
    return (703 * totalLbs) / (totalInches * totalInches)
  } else {
    const heightM = feet / 100
    if (!weight || !heightM) return null
    return weight / (heightM * heightM)
  }
}

const faqs = [
  {
    q: 'What is a healthy BMI for men?',
    a: 'A BMI between 18.5 and 24.9 is considered healthy for adult men. However, BMI is a screening tool, not a diagnostic measure. Muscular men may have a higher BMI while still being very healthy.',
  },
  {
    q: 'Is BMI accurate for muscular men?',
    a: 'BMI does not distinguish between muscle and fat mass. A highly muscular man can have a BMI in the "overweight" range while carrying very little body fat. For muscular individuals, waist-to-height ratio or body fat percentage are more accurate indicators.',
  },
  {
    q: 'How is BMI calculated?',
    a: 'BMI is calculated by dividing your weight in kilograms by the square of your height in metres (kg/m²). In imperial units: BMI = 703 × weight (lbs) ÷ height (inches)².',
  },
  {
    q: 'What are the limitations of BMI?',
    a: 'BMI does not account for body composition (muscle vs fat), age, ethnicity, or fat distribution. It can misclassify athletic individuals as overweight and fail to identify "skinny fat" individuals (normal BMI, high body fat percentage).',
  },
  {
    q: 'What is a better alternative to BMI?',
    a: 'The waist-to-height ratio is considered by many researchers and the European Congress on Obesity to be a better predictor of cardiovascular disease risk and metabolic health than BMI, because it accounts for abdominal fat, which is the most dangerous type.',
  },
]

const references = [
  'Keys, A.; Fidanza, F.; Karvonen, M.J.; Kimura, N.; Taylor, H.L. (1972). "Indices of relative weight and obesity". Journal of Chronic Diseases. 25 (6–7): 329–343.',
  'Mifflin, MD; St Jeor, ST; Hill, LA; Scott, BJ; Daugherty, SA; Koh, YO (1990). "A new predictive equation for resting energy expenditure in healthy individuals". The American Journal of Clinical Nutrition 51 (2): 241–7. PMID 2305711.',
  'Speakman, John R.; Król, Elzbieta; Johnson, Maria S. (2004). "The Functional Significance of Individual Variation in Basal Metabolic Rate". Physiological and Biochemical Zoology 77 (6): 900–915.',
  'Lee CM, Huxley RR, Wildman RP, Woodward M. "Indices of abdominal obesity are better discriminators of cardiovascular risk factors than body mass index: a meta-analysis." J Clin Epidemiol. Jul 2008; 61 (7): 646–653.',
  'Browning, LM. "A systematic review of waist-to-height ratio as a screening tool for the prediction of cardiovascular disease and diabetes: 0·5 could be a suitable global boundary value." Nutrition Research Reviews, 2010 23 (02): 247–69.',
  'Savva SC, Lamnisos D, Kafatos AG. "Predicting cardiometabolic risk: waist-to-height ratio or body mass index. A meta-analysis." Diabetes Metab Syndr Obes. 2013; 6: 403–419.',
  'Ashwell M, Gunn P, Gibson S. "Waist-to-height ratio is a better screening tool than waist circumference and body mass index for adult cardiometabolic risk factors: systematic review and meta-analysis." Obes Rev. 2012; 13 (3): 275–286.',
  'Osama H. Obesity. Medscape Reference; 2012. http://emedicine.medscape.com/article/123702-overview',
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

export default function BMICalculatorPage() {
  const [unit, setUnit] = useState<'imperial' | 'metric' | 'stones'>('imperial')
  const [weight, setWeight] = useState('')   // lbs (imperial) | stones (stones) | kg (metric)
  const [feet, setFeet]   = useState('')     // ft (imperial/stones height) | extra lbs (stones weight)
  const [inches, setInches] = useState('')   // in (imperial) | total inches (stones height)
  const [cm, setCm]       = useState('')
  const [kg, setKg]       = useState('')
  const [stLbs, setStLbs] = useState('')     // extra lbs portion for stones unit
  const [stFt, setStFt]   = useState('')     // height feet for stones unit
  const [stIn, setStIn]   = useState('')     // height inches for stones unit
  const [bmi, setBmi]     = useState<number | null>(null)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [refsOpen, setRefsOpen] = useState(false)
  const [hasCalculated, setHasCalculated] = useState(false)

  const calculate = useCallback(() => {
    let result: number | null = null
    if (unit === 'imperial') {
      result = calcBMI(parseFloat(weight), parseFloat(feet) || 0, parseFloat(inches) || 0, 'imperial')
    } else if (unit === 'stones') {
      const totalInches = (parseFloat(stFt) || 0) * 12 + (parseFloat(stIn) || 0)
      result = calcBMI(parseFloat(weight) || 0, parseFloat(stLbs) || 0, totalInches, 'stones')
    } else {
      result = calcBMI(parseFloat(kg), parseFloat(cm), 0, 'metric')
    }
    setBmi(result)
    setHasCalculated(true)
  }, [unit, weight, feet, inches, cm, kg, stLbs, stFt, stIn])

  const reset = () => {
    setWeight(''); setFeet(''); setInches(''); setCm(''); setKg('')
    setStLbs(''); setStFt(''); setStIn('')
    setBmi(null); setHasCalculated(false)
  }

  const category = bmi ? getCategory(bmi) : null
  const gaugeAngle = bmi ? Math.min(Math.max(((bmi - 10) / 40) * 180, 0), 180) : 0

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="bmi-page">
        {/* ── Hero ── */}
        <div className="bmi-hero">
          <div className="bmi-hero__inner">
            <p className="bmi-hero__eyebrow">Health Numbers</p>
            <h1 className="bmi-hero__title">BMI Calculator for Men</h1>
            <p className="bmi-hero__sub">
              Calculate your Body Mass Index instantly. Understand what it means — and its limitations — for men.
            </p>
          </div>
        </div>

        <div className="bmi-body">

          {/* ── Calculator card ── */}
          <div className="bmi-calc-card">
            <div className="bmi-unit-toggle">
              <button
                className={`bmi-unit-btn${unit === 'imperial' ? ' active' : ''}`}
                onClick={() => { setUnit('imperial'); reset() }}
              >lbs / ft</button>
              <button
                className={`bmi-unit-btn${unit === 'stones' ? ' active' : ''}`}
                onClick={() => { setUnit('stones'); reset() }}
              >st / ft</button>
              <button
                className={`bmi-unit-btn${unit === 'metric' ? ' active' : ''}`}
                onClick={() => { setUnit('metric'); reset() }}
              >kg / cm</button>
            </div>

            <div className="bmi-inputs">
              {unit === 'imperial' ? (
                <>
                  <div className="bmi-field">
                    <label>Weight</label>
                    <div className="bmi-input-wrap">
                      <input
                        type="number" min="50" max="700" placeholder="e.g. 185"
                        value={weight} onChange={e => setWeight(e.target.value)}
                      />
                      <span>lbs</span>
                    </div>
                  </div>
                  <div className="bmi-field">
                    <label>Height</label>
                    <div className="bmi-height-row">
                      <div className="bmi-input-wrap">
                        <input
                          type="number" min="3" max="8" placeholder="5"
                          value={feet} onChange={e => setFeet(e.target.value)}
                        />
                        <span>ft</span>
                      </div>
                      <div className="bmi-input-wrap">
                        <input
                          type="number" min="0" max="11" placeholder="10"
                          value={inches} onChange={e => setInches(e.target.value)}
                        />
                        <span>in</span>
                      </div>
                    </div>
                  </div>
                </>
              ) : unit === 'stones' ? (
                <>
                  <div className="bmi-field">
                    <label>Weight</label>
                    <div className="bmi-height-row">
                      <div className="bmi-input-wrap">
                        <input
                          type="number" min="4" max="60" placeholder="12"
                          value={weight} onChange={e => setWeight(e.target.value)}
                        />
                        <span>st</span>
                      </div>
                      <div className="bmi-input-wrap">
                        <input
                          type="number" min="0" max="13" placeholder="0"
                          value={stLbs} onChange={e => setStLbs(e.target.value)}
                        />
                        <span>lbs</span>
                      </div>
                    </div>
                  </div>
                  <div className="bmi-field">
                    <label>Height</label>
                    <div className="bmi-height-row">
                      <div className="bmi-input-wrap">
                        <input
                          type="number" min="3" max="8" placeholder="5"
                          value={stFt} onChange={e => setStFt(e.target.value)}
                        />
                        <span>ft</span>
                      </div>
                      <div className="bmi-input-wrap">
                        <input
                          type="number" min="0" max="11" placeholder="10"
                          value={stIn} onChange={e => setStIn(e.target.value)}
                        />
                        <span>in</span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="bmi-field">
                    <label>Weight</label>
                    <div className="bmi-input-wrap">
                      <input
                        type="number" min="20" max="300" placeholder="e.g. 84"
                        value={kg} onChange={e => setKg(e.target.value)}
                      />
                      <span>kg</span>
                    </div>
                  </div>
                  <div className="bmi-field">
                    <label>Height</label>
                    <div className="bmi-input-wrap">
                      <input
                        type="number" min="100" max="250" placeholder="e.g. 178"
                        value={cm} onChange={e => setCm(e.target.value)}
                      />
                      <span>cm</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            <button className="bmi-calc-btn" onClick={calculate}>
              Calculate BMI
            </button>

            {/* ── Result ── */}
            {hasCalculated && (
              <div className="bmi-result" style={bmi && category ? { borderColor: category.color, background: category.bg } : {}}>
                {bmi ? (
                  <>
                    {/* Gauge */}
                    <div className="bmi-gauge">
                      <svg viewBox="0 0 200 110" className="bmi-gauge__svg">
                        <defs>
                          <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%"   stopColor="#3b82f6"/>
                            <stop offset="30%"  stopColor="#16a34a"/>
                            <stop offset="55%"  stopColor="#d97706"/>
                            <stop offset="75%"  stopColor="#ea580c"/>
                            <stop offset="90%"  stopColor="#dc2626"/>
                            <stop offset="100%" stopColor="#9f1239"/>
                          </linearGradient>
                        </defs>
                        <path d="M 10 100 A 90 90 0 0 1 190 100" fill="none" stroke="#e5e7eb" strokeWidth="18" strokeLinecap="round"/>
                        <path d="M 10 100 A 90 90 0 0 1 190 100" fill="none" stroke="url(#gaugeGrad)" strokeWidth="18" strokeLinecap="round"/>
                        <g transform={`rotate(${gaugeAngle - 90}, 100, 100)`}>
                          <line x1="100" y1="100" x2="100" y2="18" stroke="#0d1f33" strokeWidth="3" strokeLinecap="round"/>
                          <circle cx="100" cy="100" r="6" fill="#0d1f33"/>
                        </g>
                        <text x="100" y="88" textAnchor="middle" fontSize="22" fontWeight="800" fill="#0d1f33">{bmi.toFixed(1)}</text>
                        <text x="100" y="103" textAnchor="middle" fontSize="9" fill="#6b7280">BMI</text>
                        <text x="12" y="110" fontSize="7" fill="#6b7280">10</text>
                        <text x="180" y="110" fontSize="7" fill="#6b7280">50</text>
                      </svg>
                    </div>

                    <div className="bmi-result__label" style={{ color: category!.color }}>
                      {category!.label}
                    </div>
                    <div className="bmi-result__tip">{category!.tip}</div>
                    <a href="/waist-to-height-ratio/" className="bmi-result__link">
                      Also check your Waist-to-Height Ratio →
                    </a>
                    <button className="bmi-result__reset" onClick={reset}>Recalculate</button>
                  </>
                ) : (
                  <p className="bmi-result__error">Please enter valid values to calculate your BMI.</p>
                )}
              </div>
            )}
          </div>

          {/* ── BMI Table ── */}
          <section className="bmi-section">
            <h2>BMI Categories</h2>
            <p>The World Health Organization defines BMI ranges for adults as follows:</p>
            <div className="bmi-table-wrap">
              <table className="bmi-table">
                <thead>
                  <tr><th>BMI Range</th><th>Category</th><th>Risk Level</th></tr>
                </thead>
                <tbody>
                  {BMI_CATEGORIES.map(c => (
                    <tr key={c.label} style={bmi && bmi >= c.min && bmi < c.max ? { background: c.bg, fontWeight: 700 } : {}}>
                      <td>{c.max === 999 ? `≥ ${c.min}` : `${c.min} – ${c.max}`}</td>
                      <td><span className="bmi-table__dot" style={{ background: c.color }}></span>{c.label}</td>
                      <td style={{ color: c.color }}>{['Low', 'Minimal', 'Moderate', 'High', 'Very High', 'Extreme'][BMI_CATEGORIES.indexOf(c)]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ── What is BMI ── */}
          <section className="bmi-section">
            <h2>What Is Body Mass Index?</h2>
            <p>
              Body Mass Index (BMI) is a numerical value calculated from your height and weight. It is widely used as a
              screening tool to categorise adults into weight groups that may correlate with health risk. BMI was
              developed by Belgian statistician Adolphe Quetelet in the 19th century and adopted broadly by health
              organisations in the 1970s.
            </p>
            <p>
              The formula is straightforward: <strong>BMI = weight (kg) ÷ height² (m²)</strong>. In imperial units:
              <strong> BMI = 703 × weight (lbs) ÷ height² (inches²)</strong>.
            </p>
          </section>

          {/* ── Limitations ── */}
          <section className="bmi-section">
            <h2>Limitations of Body Mass Index</h2>
            <p>
              While body mass index is a well-known index for measuring body composition, it is not necessarily the
              best measure for men. It does not take into account an individual&apos;s body type or composition — the
              ratio of muscle mass to fat mass. This causes the ratio to be inaccurate for men with a higher percentage
              of muscle mass and a lower percentage of body fat.
            </p>
            <p>
              For example, a man that loses 10 lbs of fat and gains 10 lbs of muscle will have the exact same BMI but
              will likely be much healthier. Therefore, BMI may not be an accurate predictor of common health problems
              such as diabetes, high blood pressure, and heart disease in certain individuals.
            </p>

            <div className="bmi-callout">
              <div className="bmi-callout__icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>
                </svg>
              </div>
              <div>
                <strong>Better alternative:</strong> Another, potentially more accurate numerical assessment of overall
                health is the <a href="/waist-to-height-ratio/">waist-to-height ratio</a>. The European Congress on
                Obesity recently stated it is the best way to predict a person&apos;s risk of serious health problems.
                Unlike BMI, it is based on waist size — the most dangerous place to carry weight — and takes into
                account an individual&apos;s frame.
              </div>
            </div>
          </section>

          {/* ── FAQ ── */}
          <section className="bmi-section">
            <h2>Frequently Asked Questions</h2>
            <div className="bmi-faq">
              {faqs.map((f, i) => (
                <div key={i} className={`bmi-faq__item${openFaq === i ? ' open' : ''}`}>
                  <button className="bmi-faq__q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                    {f.q}
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
                    </svg>
                  </button>
                  {openFaq === i && <div className="bmi-faq__a">{f.a}</div>}
                </div>
              ))}
            </div>
          </section>

          {/* ── External resource ── */}
          <section className="bmi-section">
            <p>
              <strong>External Resource:</strong>{' '}
              <a href="https://www.nhlbi.nih.gov/health/educational/wecan/healthy-weight-basics/body-mass-index.htm" target="_blank" rel="noopener noreferrer">
                NIH: Body Mass Index
              </a>
            </p>
          </section>

          {/* ── References collapsible ── */}
          <section className="bmi-section">
            <div className="bmi-refs">
              <button className="bmi-refs__toggle" onClick={() => setRefsOpen(r => !r)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"/>
                </svg>
                References &amp; Citations
                <svg className={`bmi-refs__chevron${refsOpen ? ' open' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
                </svg>
              </button>
              {refsOpen && (
                <ol className="bmi-refs__list">
                  {references.map((ref, i) => (
                    <li key={i}>{ref}</li>
                  ))}
                </ol>
              )}
            </div>
          </section>

        </div>
      </div>
    </>
  )
}
