import type { Metadata } from 'next'
import BPClient from './BPClient'

export const metadata: Metadata = {
  title: 'Blood Pressure Checker for Men - Systolic & Diastolic Ranges',
  description: 'Enter your systolic and diastolic blood pressure readings to see which category you fall into - normal, prehypertension, stage 1, or stage 2 hypertension.',
  alternates: { canonical: 'https://elitemensguide.com/emg-health-numbers-blood-pressure/' },
}

export default function Page() {
  return <BPClient />
}