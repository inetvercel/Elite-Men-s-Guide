import type { Metadata } from 'next'
import BMRClient from './BMRClient'

export const metadata: Metadata = {
  title: 'BMR Calculator for Men - Basal Metabolic Rate & TDEE',
  description: 'Calculate your Basal Metabolic Rate and Total Daily Energy Expenditure using the Mifflin-St Jeor equation. Enter your weight, height, age and activity level for your exact daily calorie needs.',
  alternates: { canonical: 'https://elitemensguide.com/basal-metabolic-rate-bmr-calculator/' },
}

export default function Page() {
  return <BMRClient />
}