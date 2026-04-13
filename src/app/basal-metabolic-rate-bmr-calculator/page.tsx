'use client'

import { useState, useCallback } from 'react'

// ── Activity multipliers (Mifflin-St Jeor / Harris-Benedict) ─────────────────
const ACTIVITY_LEVELS = [
  { label: 'Sedentary',        desc: 'Little or no exercise',              multiplier: 1.2   },
  { label: 'Lightly Active',   desc: 'Light exercise 1–3 days/week',       multiplier: 1.375 },
  { label: 'Moderately Active',desc: 'Moderate exercise 3–5 days/week',    multiplier: 1.55  },
  { label: 'Very Active',      desc: 'Hard exercise 6–7 days/week',        multiplier: 1.725 },
  { label: 'Extra Active',     desc: 'Very hard exercise or physical job',  multiplier: 1.9   },
]

// Mifflin-St Jeor for men (most accurate modern formula)
function calcBMR(weightKg: number, heightCm: number, age: number): number {
  return 10 * weightKg + 6.25 * heightCm - 5 * age + 5
}

function toKg(value: number, unit: 'lbs' | 'kg' | 'st', extra = 0): number {
  if (unit === 'lbs') return value * 0.453592
  if (unit === 'st')  return (value * 14 + extra) * 0.453592
  return value
}

function toCm(feet: number, inches: number, unit: 'imperial' | 'metric', cm = 0): number {
  if (unit === 'metric') return cm
  return feet * 30.48 + inches * 2.54
}

const faqs = [
  {
    q: 'What is Basal Metabolic Rate (BMR)?',
    a: 'BMR is the number of calories your body burns at complete rest — the minimum energy required to keep your heart beating, lungs breathing, and organs functioning. It accounts for roughly 60–75% of your total daily calorie burn.',
  },
  {
    q: 'What formula does this BMR calculator use?',
    a: 'This calculator uses the Mifflin-St Jeor equation (1990), which is widely considered the most accurate formula for estimating resting energy expenditure in healthy adults. The equation for men is: BMR = (10 × weight in kg) + (6.25 × height in cm) − (5 × age) + 5.',
  },
  {
    q: 'What is Total Daily Energy Expenditure (TDEE)?',
    a: 'TDEE is your BMR multiplied by an activity factor. It represents the total calories you burn in a day, including exercise and movement. To maintain your current weight, consume roughly the same number of calories as your TDEE.',
  },
  {
    q: 'How do I use BMR to lose weight?',
    a: 'To lose weight, consume fewer calories than your TDEE. A deficit of 500 kcal/day will result in approximately 1 lb (0.45 kg) of weight loss per week. Never eat below your BMR for sustained periods without medical supervision.',
  },
  {
    q: 'Why does BMR vary between individuals?',
    a: 'BMR varies due to differences in lean body mass, age, hormones (especially thyroid and testosterone), and genetics. Research shows the top 5% of people metabolise energy roughly 30% faster than the bottom 5%, even when lean body mass is identical.',
  },
  {
    q: 'How accurate is the BMR calculator?',
    a: 'The Mifflin-St Jeor formula is accurate within ±10% for most people. It is less accurate for very lean or very obese individuals. Use it as a starting point — adjust calories based on real-world results over 2–4 weeks.',
  },
]

const references = [
  'Mifflin, MD; St Jeor, ST; Hill, LA; Scott, BJ; Daugherty, SA; Koh, YO (1990). "A new predictive equation for resting energy expenditure in healthy individuals". The American Journal of Clinical Nutrition 51 (2): 241–7. PMID 2305711.',
  'Speakman, John R.; Król, Elzbieta; Johnson, Maria S. (2004). "The Functional Significance of Individual Variation in Basal Metabolic Rate". Physiological and Biochemical Zoology 77 (6): 900–915.',
  'Harris JA, Benedict FG (1918). "A Biometric Study of Human Basal Metabolism". Proceedings of the National Academy of Sciences 4 (12): 370–373.',
  'Frankenfield D, Roth-Yousey L, Compher C (2005). "Comparison of predictive equations for resting metabolic rate in healthy nonobese and obese adults". Journal of the American Dietetic Association 105 (5): 775–789.',
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

type WeightUnit = 'lbs' | 'kg' | 'st'
type HeightUnit = 'imperial' | 'metric'

interface Result {
  bmr: number
  tdee: number
  activityLabel: string
  lose05: number
  lose1: number
  gain05: number
}

export default function BMRCalculatorPage() {
  const [weightUnit, setWeightUnit] = useState<WeightUnit>('lbs')
  const [heightUnit, setHeightUnit] = useState<HeightUnit>('imperial')

  // Weight inputs
  const [lbs, setLbs]     = useState('')
  const [kg, setKg]       = useState('')
  const [st, setSt]       = useState('')
  const [stLbs, setStLbs] = useState('')

  // Height inputs
  const [ft, setFt]       = useState('')
  const [inVal, setInVal] = useState('')
  const [cm, setCm]       = useState('')

  const [age, setAge]           = useState('')
  const [activity, setActivity] = useState(1)   // index into ACTIVITY_LEVELS

  const [result, setResult]   = useState<Result | null>(null)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [refsOpen, setRefsOpen] = useState(false)
  const [error, setError]     = useState('')

  const calculate = useCallback(() => {
    setError('')
    const ageNum = parseFloat(age)
    if (!ageNum || ageNum < 15 || ageNum > 100) { setError('Please enter a valid age (15–100).'); return }

    const weightKg = weightUnit === 'lbs'
      ? toKg(parseFloat(lbs) || 0, 'lbs')
      : weightUnit === 'st'
      ? toKg(parseFloat(st) || 0, 'st', parseFloat(stLbs) || 0)
      : toKg(parseFloat(kg) || 0, 'kg')

    const heightCm = heightUnit === 'imperial'
      ? toCm(parseFloat(ft) || 0, parseFloat(inVal) || 0, 'imperial')
      : toCm(0, 0, 'metric', parseFloat(cm) || 0)

    if (weightKg < 20 || weightKg > 300) { setError('Please enter a valid weight.'); return }
    if (heightCm < 100 || heightCm > 250) { setError('Please enter a valid height.'); return }

    const bmr  = calcBMR(weightKg, heightCm, ageNum)
    const mult = ACTIVITY_LEVELS[activity].multiplier
    const tdee = bmr * mult

    setResult({
      bmr:          Math.round(bmr),
      tdee:         Math.round(tdee),
      activityLabel: ACTIVITY_LEVELS[activity].label,
      lose05:       Math.round(tdee - 250),
      lose1:        Math.round(tdee - 500),
      gain05:       Math.round(tdee + 250),
    })
  }, [age, weightUnit, lbs, kg, st, stLbs, heightUnit, ft, inVal, cm, activity])

  const reset = () => {
    setLbs(''); setKg(''); setSt(''); setStLbs('')
    setFt(''); setInVal(''); setCm(''); setAge('')
    setActivity(1); setResult(null); setError('')
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="bmr-page">

        {/* ── Hero ── */}
        <div className="bmr-hero">
          <img
            src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1400&q=80&auto=format&fit=crop"
            alt="Man tracking fitness and metabolism"
            className="bmr-hero__img"
          />
          <div className="bmr-hero__overlay" />
          <div className="bmr-hero__inner">
            <p className="bmr-hero__eyebrow">Health Numbers</p>
            <h1 className="bmr-hero__title">BMR Calculator for Men</h1>
            <p className="bmr-hero__sub">
              Calculate your Basal Metabolic Rate and Total Daily Energy Expenditure — then use the numbers to build your ideal nutrition plan.
            </p>
          </div>
        </div>

        <div className="bmr-body">

          {/* ── Calculator card ── */}
          <div className="bmr-calc-card">

            {/* Unit toggles */}
            <div className="bmr-toggles">
              <div className="bmr-toggle-group">
                <span className="bmr-toggle-label">Weight</span>
                <div className="bmr-toggle">
                  {(['lbs','st','kg'] as WeightUnit[]).map(u => (
                    <button key={u} className={`bmr-toggle-btn${weightUnit === u ? ' active' : ''}`}
                      onClick={() => { setWeightUnit(u); setResult(null) }}>{u}</button>
                  ))}
                </div>
              </div>
              <div className="bmr-toggle-group">
                <span className="bmr-toggle-label">Height</span>
                <div className="bmr-toggle">
                  {(['imperial','metric'] as HeightUnit[]).map(u => (
                    <button key={u} className={`bmr-toggle-btn${heightUnit === u ? ' active' : ''}`}
                      onClick={() => { setHeightUnit(u); setResult(null) }}>{u === 'imperial' ? 'ft / in' : 'cm'}</button>
                  ))}
                </div>
              </div>
            </div>

            {/* Inputs */}
            <div className="bmr-inputs">
              {/* Weight */}
              <div className="bmr-field">
                <label>Weight</label>
                {weightUnit === 'lbs' && (
                  <div className="bmr-input-wrap">
                    <input type="number" min="50" max="700" placeholder="e.g. 185"
                      value={lbs} onChange={e => setLbs(e.target.value)} />
                    <span>lbs</span>
                  </div>
                )}
                {weightUnit === 'kg' && (
                  <div className="bmr-input-wrap">
                    <input type="number" min="20" max="300" placeholder="e.g. 84"
                      value={kg} onChange={e => setKg(e.target.value)} />
                    <span>kg</span>
                  </div>
                )}
                {weightUnit === 'st' && (
                  <div className="bmr-height-row">
                    <div className="bmr-input-wrap">
                      <input type="number" min="4" max="60" placeholder="12"
                        value={st} onChange={e => setSt(e.target.value)} />
                      <span>st</span>
                    </div>
                    <div className="bmr-input-wrap">
                      <input type="number" min="0" max="13" placeholder="0"
                        value={stLbs} onChange={e => setStLbs(e.target.value)} />
                      <span>lbs</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Height */}
              <div className="bmr-field">
                <label>Height</label>
                {heightUnit === 'imperial' ? (
                  <div className="bmr-height-row">
                    <div className="bmr-input-wrap">
                      <input type="number" min="3" max="8" placeholder="5"
                        value={ft} onChange={e => setFt(e.target.value)} />
                      <span>ft</span>
                    </div>
                    <div className="bmr-input-wrap">
                      <input type="number" min="0" max="11" placeholder="10"
                        value={inVal} onChange={e => setInVal(e.target.value)} />
                      <span>in</span>
                    </div>
                  </div>
                ) : (
                  <div className="bmr-input-wrap">
                    <input type="number" min="100" max="250" placeholder="e.g. 178"
                      value={cm} onChange={e => setCm(e.target.value)} />
                    <span>cm</span>
                  </div>
                )}
              </div>

              {/* Age */}
              <div className="bmr-field">
                <label>Age</label>
                <div className="bmr-input-wrap">
                  <input type="number" min="15" max="100" placeholder="e.g. 35"
                    value={age} onChange={e => setAge(e.target.value)} />
                  <span>yrs</span>
                </div>
              </div>

              {/* Activity */}
              <div className="bmr-field bmr-field--full">
                <label>Activity Level</label>
                <div className="bmr-activity-grid">
                  {ACTIVITY_LEVELS.map((a, i) => (
                    <button key={i}
                      className={`bmr-activity-btn${activity === i ? ' active' : ''}`}
                      onClick={() => setActivity(i)}>
                      <span className="bmr-activity-btn__name">{a.label}</span>
                      <span className="bmr-activity-btn__desc">{a.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {error && <p className="bmr-error">{error}</p>}

            <button className="bmr-calc-btn" onClick={calculate}>Calculate BMR &amp; TDEE</button>

            {/* ── Result ── */}
            {result && (
              <div className="bmr-result">
                <div className="bmr-result__grid">
                  <div className="bmr-result__box bmr-result__box--bmr">
                    <div className="bmr-result__num">{result.bmr.toLocaleString()}</div>
                    <div className="bmr-result__unit">kcal / day</div>
                    <div className="bmr-result__lbl">Basal Metabolic Rate</div>
                    <div className="bmr-result__sub">Calories burned at complete rest</div>
                  </div>
                  <div className="bmr-result__box bmr-result__box--tdee">
                    <div className="bmr-result__num">{result.tdee.toLocaleString()}</div>
                    <div className="bmr-result__unit">kcal / day</div>
                    <div className="bmr-result__lbl">Total Daily Expenditure</div>
                    <div className="bmr-result__sub">{result.activityLabel} activity level</div>
                  </div>
                </div>

                <div className="bmr-result__goals">
                  <h3>Daily Calorie Targets</h3>
                  <div className="bmr-goals-grid">
                    <div className="bmr-goal bmr-goal--lose">
                      <span className="bmr-goal__val">{result.lose1.toLocaleString()}</span>
                      <span className="bmr-goal__lbl">Lose ~1 lb/week</span>
                      <span className="bmr-goal__sub">−500 kcal deficit</span>
                    </div>
                    <div className="bmr-goal bmr-goal--lose-half">
                      <span className="bmr-goal__val">{result.lose05.toLocaleString()}</span>
                      <span className="bmr-goal__lbl">Lose ~½ lb/week</span>
                      <span className="bmr-goal__sub">−250 kcal deficit</span>
                    </div>
                    <div className="bmr-goal bmr-goal--maintain">
                      <span className="bmr-goal__val">{result.tdee.toLocaleString()}</span>
                      <span className="bmr-goal__lbl">Maintain Weight</span>
                      <span className="bmr-goal__sub">Eat at TDEE</span>
                    </div>
                    <div className="bmr-goal bmr-goal--gain">
                      <span className="bmr-goal__val">{result.gain05.toLocaleString()}</span>
                      <span className="bmr-goal__lbl">Gain ~½ lb/week</span>
                      <span className="bmr-goal__sub">+250 kcal surplus</span>
                    </div>
                  </div>
                </div>

                <button className="bmr-result__reset" onClick={reset}>Recalculate</button>
              </div>
            )}
          </div>

          {/* ── Content ── */}
          <section className="bmr-section">
            <h2>What Is Basal Metabolic Rate?</h2>
            <p>
              In order to maintain your weight, you must consume the same amount of calories as you expend. To lose
              weight, you must consume fewer calories than you expend. If you want to know how many calories to consume,
              you must first determine how many calories you expend — calories burned during rest plus calories burned
              during activity.
            </p>
            <p>
              Your BMR is the minimum amount of energy needed to keep your body running — heart beating, lungs
              breathing, organs functioning — without any additional activity. The resulting number is in units of
              kcal/day, equivalent to the Calories shown on any food package.
            </p>
            <p>
              For more information on nutrition and calorie counting, see EMG&apos;s{' '}
              <a href="/guiding-principles-nutrition-infographic/">How To Eat Healthy</a>,{' '}
              <a href="/healthy-weight-loss-guidelines/">Healthy Weight Loss</a>, and{' '}
              <a href="/calorie-counting/">Calorie Counting</a> articles.
            </p>
          </section>

          <section className="bmr-section">
            <h2>Total Daily Energy Expenditure (TDEE)</h2>
            <p>
              TDEE estimates your resting caloric expenditure plus calories expended through daily physical activity.
              This provides a more complete picture of your energy expenditure and is the figure you should use to set
              your calorie intake target.
            </p>
            <div className="bmr-callout">
              <div className="bmr-callout__icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>
                </svg>
              </div>
              <div>
                <strong>Important:</strong> Your total energy expenditure is highly dependent on your level of physical
                activity. Entering an activity level above your true level will overestimate your caloric needs and may
                lead to weight gain. Be honest — it&apos;s better to underestimate slightly and adjust upward.
              </div>
            </div>
            <p style={{ marginTop: '1rem' }}>
              Both the BMR and TDEE figures are estimates only. The top 5% of people metabolise energy roughly{' '}
              <strong>30% faster</strong> than those with the lowest 5% BMR — even with identical lean body mass.
              Use your results as a starting point and adjust based on real-world changes over 2–4 weeks.
            </p>
          </section>

          {/* ── Formula ── */}
          <section className="bmr-section">
            <h2>The Mifflin-St Jeor Formula</h2>
            <p>
              This calculator uses the <strong>Mifflin-St Jeor equation</strong> (1990), widely regarded as the most
              accurate formula for healthy adults. Multiple studies have found it outperforms the older
              Harris-Benedict equation.
            </p>
            <div className="bmr-formula">
              <div className="bmr-formula__eq">
                BMR = (10 × weight<sub>kg</sub>) + (6.25 × height<sub>cm</sub>) − (5 × age) + 5
              </div>
              <div className="bmr-formula__note">For men · Result in kcal/day</div>
            </div>
          </section>

          {/* ── FAQ ── */}
          <section className="bmr-section">
            <h2>Frequently Asked Questions</h2>
            <div className="bmr-faq">
              {faqs.map((f, i) => (
                <div key={i} className={`bmr-faq__item${openFaq === i ? ' open' : ''}`}>
                  <button className="bmr-faq__q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                    {f.q}
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
                    </svg>
                  </button>
                  {openFaq === i && <div className="bmr-faq__a">{f.a}</div>}
                </div>
              ))}
            </div>
          </section>

          {/* ── References ── */}
          <section className="bmr-section">
            <div className="bmr-refs">
              <button className="bmr-refs__toggle" onClick={() => setRefsOpen(r => !r)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"/>
                </svg>
                References &amp; Citations
                <svg className={`bmr-refs__chevron${refsOpen ? ' open' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
                </svg>
              </button>
              {refsOpen && (
                <ol className="bmr-refs__list">
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
