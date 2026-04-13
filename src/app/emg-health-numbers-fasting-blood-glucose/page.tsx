import type { Metadata } from 'next'
import GlucoseClient from './GlucoseClient'

export const metadata: Metadata = {
  title: 'Fasting Blood Glucose Checker - Normal, Prediabetes & Diabetes Ranges',
  description: 'Enter your fasting blood sugar reading to instantly check whether you are in the normal range, prediabetic, or diabetic, based on ADA clinical guidelines.',
  alternates: { canonical: 'https://elitemensguide.com/emg-health-numbers-fasting-blood-glucose/' },
}

export default function Page() {
  return <GlucoseClient />
}