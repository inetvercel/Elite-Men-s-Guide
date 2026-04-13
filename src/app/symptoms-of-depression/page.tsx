'use client'

import { useState } from 'react'

const references = [
  {
    category: 'Foundational Clinical Studies',
    items: [
      { label: 'JAMA Psychiatry — Martin et al.: Gender Differences in Unipolar Depression', url: 'https://jamanetwork.com/journals/jamapsychiatry/fullarticle/1733742' },
      { label: 'The Lancet — Global Commission on Depression', url: 'https://www.thelancet.com/journals/lancet/article/PIIS0140-6736(21)02141-3/fulltext' },
      { label: 'Frontiers in Psychology (2026) — Analysis of Male Depressive Symptoms', url: 'https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2026.1725181/full' },
    ],
  },
  {
    category: 'Official Health Guidelines',
    items: [
      { label: 'National Institute of Mental Health (NIMH) — Men and Mental Health', url: 'https://www.nimh.nih.gov/health/topics/men-and-mental-health' },
      { label: 'American Psychological Association (APA) — Practice Guidelines for Boys and Men', url: 'https://www.apa.org/about/policy/boys-men-practice-guidelines.pdf' },
    ],
  },
  {
    category: 'Screening Tools & Neurobiology',
    items: [
      { label: 'BMJ Open — Male Depression Risk Scale Validation', url: 'https://bmjopen.bmj.com/content/12/3/e053650' },
      { label: 'NCBI/PubMed — Neurobiological Sex Differences in Depression', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10102695/' },
      { label: 'Psychiatria Polska — Gotland Male Depression Scale (PDF)', url: 'https://www.psychiatriapolska.pl/pdf-173042-126466?filename=126466.pdf' },
    ],
  },
]

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What are the first symptoms of depression in men?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The initial symptoms of depression in men are not always the commonly described symptoms of low mood, anhedonia, and sadness. Frequently, the first symptoms include tiredness, headache, GI issues, and weight loss or gain. Men may also become irritable or easily distracted rather than overtly sad.',
      },
    },
    {
      '@type': 'Question',
      name: 'Why is depression underdiagnosed in men?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Men frequently manifest depressive symptoms through behavioral externalization — anger, irritability, risk-taking, and substance use — rather than internalizing sadness. Standard diagnostic tools like the PHQ-9 were not designed with these male-specific presentations in mind, leading to widespread underdiagnosis.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the Male Depressive Syndrome?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The Male Depressive Syndrome refers to a pattern of depression in men characterized by irritability, anger, hostility, and externalizing behaviors rather than overt sadness. It is a clinical concept developed to capture presentations that standard depression scales often miss.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the Gotland Male Depression Scale?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The Gotland Male Depression Scale (GMDS) is a clinical screening tool specifically designed to assess male-typical depressive symptoms, including low stress tolerance, outwardly directed aggression, hyperactivity, and post-episode burnout feelings.',
      },
    },
    {
      '@type': 'Question',
      name: 'Why is male suicide risk higher despite lower reported depression rates?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'This is referred to clinically as the "Silent Paradox." Men are less likely to report or seek help for depression, yet die by suicide at significantly higher rates than women. This underscores the importance of recognizing behavioral warning signs — such as increased irritability, social withdrawal, or substance use — even in the absence of reported sadness.',
      },
    },
  ],
}

export default function SymptomsOfDepressionPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [refsOpen, setRefsOpen] = useState(false)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="dep-page">

        {/* ── Hero ── */}
        <div className="dep-hero">
          <div className="dep-hero__inner">
            <p className="dep-hero__eyebrow">Mental Health</p>
            <h1 className="dep-hero__title">Symptoms of Depression in Men</h1>
            <p className="dep-hero__sub">
              How depression actually presents in men — and why it is so frequently missed.
            </p>
          </div>
        </div>

        <div className="dep-body">

          {/* ── Intro ── */}
          <section className="dep-section">
            <p className="dep-lead">
              The initial symptoms of depression are not always the commonly described symptoms of low mood, anhedonia, and other forms of sadness. Frequently, the first symptoms of depression include <strong>tiredness, headache, GI issues, and weight loss or gain</strong>. People with depression may also become irritable or easily distracted rather than overtly sad.
            </p>
            <p>
              Depression can present in a variety of ways. If you have noticed unexplained mood changes or other changes concerning for depression, please contact your primary care provider for more information and to see if you need an evaluation.
            </p>
          </section>

          {/* ── Clinical Divider ── */}
          <div className="dep-divider">
            <span>Clinical Presentation in Men</span>
          </div>

          {/* ── Clinical Context ── */}
          <section className="dep-section">
            <p>
              While the core diagnostic criteria for Major Depressive Disorder (MDD) remain the same across genders, clinical research indicates that men frequently manifest symptoms in ways that <strong>do not align with traditional "low mood" archetypes</strong>. This often leads to underdiagnosis and "masked" depression.
            </p>
            <p>
              According to the National Institute of Mental Health (NIMH, 2025) and contemporary longitudinal studies, male depression often presents through <strong>behavioral externalization</strong> rather than internalizing sadness.
            </p>
          </section>

          {/* ── Section 1 ── */}
          <section className="dep-section">
            <div className="dep-section__num">1</div>
            <h2>Externalizing Symptoms: Anger and Irritability</h2>
            <p>
              Men are statistically more likely to report symptoms of <strong>irritability, anger, and hostility</strong> rather than overt sadness. This is often referred to in clinical literature as the <em>"Male Depressive Syndrome."</em>
            </p>
            <div className="dep-cards">
              <div className="dep-card">
                <div className="dep-card__title">Affective Dysregulation</div>
                <p>Sudden outbursts of anger, a "short fuse," or persistent irritability are common indicators. In a clinical setting, this is often misattributed to stress or personality traits rather than a mood disorder.</p>
              </div>
              <div className="dep-card">
                <div className="dep-card__title">Risk-Taking Behavior</div>
                <p>Men may engage in "escapist" behaviors to numb emotional pain. This includes reckless driving, unsafe sexual encounters, or high-stakes gambling <em>(Journal of Men's Health, 2025)</em>.</p>
              </div>
            </div>
          </section>

          {/* ── Section 2 ── */}
          <section className="dep-section">
            <div className="dep-section__num">2</div>
            <h2>Somatic Presentation: The "Silent" Physical Toll</h2>
            <p>
              Men often seek medical help for the <strong>physical manifestations</strong> of depression rather than the emotional ones. This "somatic" focus can mask the underlying psychiatric cause.
            </p>
            <div className="dep-cards">
              <div className="dep-card">
                <div className="dep-card__title">Chronic Pain</div>
                <p>Persistent headaches, digestive issues, and back pain that do not respond to standard treatments are frequently linked to clinical depression in men.</p>
              </div>
              <div className="dep-card">
                <div className="dep-card__title">Cardiovascular & Sleep Impact</div>
                <p>High cortisol levels associated with untreated depression in men are linked to increased risks of hypertension. Sleep disturbances often manifest as early morning awakening or an inability to stay asleep <em>(Harvard Health Publishing, 2026)</em>.</p>
              </div>
            </div>
          </section>

          {/* ── Section 3 ── */}
          <section className="dep-section">
            <div className="dep-section__num">3</div>
            <h2>Cognitive and Social Indicators</h2>
            <p>
              Societal expectations regarding masculinity — such as the "provider" role — can shift how cognitive symptoms are expressed.
            </p>
            <div className="dep-cards">
              <div className="dep-card">
                <div className="dep-card__title">Loss of Control</div>
                <p>Men often describe depression as a loss of control over their lives or an "inability to get things done." This can manifest as an obsessive focus on work (workaholism) or, conversely, a complete inability to perform professional duties.</p>
              </div>
              <div className="dep-card">
                <div className="dep-card__title">Substance Misuse</div>
                <p>Research suggests that men are significantly more likely than women to use alcohol or drugs as a form of "self-medication" for depressive symptoms <em>(JAMA Psychiatry, 2024)</em>.</p>
              </div>
            </div>
          </section>

          {/* ── Section 4 ── */}
          <section className="dep-section">
            <div className="dep-section__num">4</div>
            <h2>The Gotland Male Depression Scale (GMDS)</h2>
            <p>
              Because traditional tools like the PHQ-9 can miss male-specific symptoms, many clinicians now utilise the <strong>Gotland Male Depression Scale</strong>. This tool specifically assesses:
            </p>
            <ul className="dep-list">
              <li>Low stress tolerance</li>
              <li>Outwardly directed aggression</li>
              <li>Hyperactivity or "restless" behavior</li>
              <li>Post-episode "burnout" feelings</li>
            </ul>
          </section>

          {/* ── Silent Paradox callout ── */}
          <div className="dep-callout">
            <div className="dep-callout__icon">⚠</div>
            <div>
              <strong>Clinical Observation: The Silent Paradox</strong>
              <p>In men, the risk of suicide is significantly higher despite lower rates of reported depression. This "Silent Paradox" highlights the necessity of looking for behavioral changes — such as social withdrawal or increased irritability — even in the absence of reported sadness <em>(The Lancet Psychiatry, 2026)</em>.</p>
            </div>
          </div>

          {/* ── FAQ ── */}
          <section className="dep-section">
            <h2>Frequently Asked Questions</h2>
            <div className="dep-faq">
              {faqSchema.mainEntity.map((f, i) => (
                <div key={i} className={`dep-faq__item${openFaq === i ? ' open' : ''}`}>
                  <button className="dep-faq__q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                    {f.name}
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
                    </svg>
                  </button>
                  {openFaq === i && <div className="dep-faq__a">{f.acceptedAnswer.text}</div>}
                </div>
              ))}
            </div>
          </section>

          {/* ── References ── */}
          <section className="dep-section">
            <div className="dep-refs">
              <button className="dep-refs__toggle" onClick={() => setRefsOpen(r => !r)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"/>
                </svg>
                References &amp; Citations
                <svg className={`dep-refs__chevron${refsOpen ? ' open' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
                </svg>
              </button>
              {refsOpen && (
                <div className="dep-refs__body">
                  {references.map((group, gi) => (
                    <div key={gi} className="dep-refs__group">
                      <div className="dep-refs__group-title">{group.category}</div>
                      <ol className="dep-refs__list">
                        {group.items.map((item, ii) => (
                          <li key={ii}>
                            <a href={item.url} target="_blank" rel="noopener noreferrer">{item.label}</a>
                          </li>
                        ))}
                      </ol>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

        </div>
      </div>
    </>
  )
}
