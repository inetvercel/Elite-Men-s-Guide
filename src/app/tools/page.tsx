import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: "Health & Fitness Tools",
  description: "Free interactive calculators for men's health — BMR, BMI, waist-to-height ratio, blood pressure, testosterone levels, cholesterol, and blood glucose.",
  alternates: { canonical: 'https://elitemensguide.com/tools/' },
}

const TOOLS = [
  {
    href: '/basal-metabolic-rate-bmr-calculator',
    title: 'BMR Calculator',
    desc: 'Calculate your Basal Metabolic Rate and daily calorie needs using the Mifflin-St Jeor equation.',
    cat: 'Nutrition & Fitness',
    icon: '🔥',
  },
  {
    href: '/body-mass-index',
    title: 'BMI Calculator',
    desc: 'Find your Body Mass Index and see where you sit across healthy weight categories.',
    cat: 'Body Composition',
    icon: '⚖️',
  },
  {
    href: '/waist-to-height-ratio',
    title: 'Waist-to-Height Ratio',
    desc: 'A more accurate metabolic risk indicator than BMI — calculate yours instantly.',
    cat: 'Body Composition',
    icon: '📏',
  },
  {
    href: '/emg-health-numbers-blood-pressure',
    title: 'Blood Pressure Checker',
    desc: 'Enter your systolic and diastolic readings and understand what they mean for your health.',
    cat: 'Cardiovascular',
    icon: '❤️',
  },
  {
    href: '/emg-health-numbers-testosterone-levels',
    title: 'Testosterone Levels',
    desc: 'Check whether your testosterone reading falls within the optimal range for your age.',
    cat: 'Hormones',
    icon: '⚡',
  },
  {
    href: '/emg-health-numbers-hdl-cholesterol-and-ldl-cholesterol',
    title: 'Cholesterol Checker',
    desc: 'Understand your HDL and LDL cholesterol numbers and cardiovascular risk.',
    cat: 'Cardiovascular',
    icon: '🩸',
  },
  {
    href: '/emg-health-numbers-fasting-blood-glucose',
    title: 'Fasting Blood Glucose',
    desc: 'Check your fasting glucose reading against clinical ranges for diabetes risk.',
    cat: 'Metabolic Health',
    icon: '🧪',
  },
]

export default function ToolsPage() {
  return (
    <>
      <div className="cat-header">
        <div className="cat-header__inner">
          <div className="cat-header__breadcrumb">
            <Link href="/">Home</Link>
            <span>›</span>
            <span>Tools</span>
          </div>
          <h1 className="cat-header__title">Health & Fitness Tools</h1>
          <p className="cat-header__desc">
            Free interactive calculators built for men — check your key health numbers in seconds.
          </p>
          <div className="cat-header__count">{TOOLS.length} tools</div>
        </div>
      </div>

      <div className="home-content">
        <div className="home-section">
          <div className="post-grid">
            {TOOLS.map((tool) => (
              <article key={tool.href} className="post-card">
                <div className="post-card__img card-img-placeholder tools-card__icon-wrap">
                  <span className="tools-card__icon">{tool.icon}</span>
                </div>
                <div className="post-card__body">
                  <div className="post-card__cat">{tool.cat}</div>
                  <h2 className="post-card__title">
                    <Link href={tool.href}>{tool.title}</Link>
                  </h2>
                  <p className="post-card__excerpt">{tool.desc}</p>
                  <Link href={tool.href} className="tools-card__btn">
                    Open Tool →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
