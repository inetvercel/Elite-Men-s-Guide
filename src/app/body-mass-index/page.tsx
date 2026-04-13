import type { Metadata } from 'next'
import BMIClient from './BMIClient'

export const metadata: Metadata = {
  title: 'BMI Calculator for Men - Body Mass Index',
  description: 'Calculate your Body Mass Index instantly. Understand what your BMI means, its limitations for muscular men, and how it compares to waist-to-height ratio.',
  alternates: { canonical: 'https://elitemensguide.com/body-mass-index/' },
}

export default function Page() {
  return <BMIClient />
}