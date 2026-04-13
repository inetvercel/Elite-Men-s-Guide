import type { Metadata } from 'next'
import WHtRClient from './WHtRClient'

export const metadata: Metadata = {
  title: 'Waist-to-Height Ratio Calculator for Men',
  description: 'Calculate your Waist-to-Height Ratio - a more accurate predictor of cardiovascular and metabolic risk than BMI. Keep your waist below half your height.',
  alternates: { canonical: 'https://elitemensguide.com/waist-to-height-ratio/' },
}

export default function Page() {
  return <WHtRClient />
}