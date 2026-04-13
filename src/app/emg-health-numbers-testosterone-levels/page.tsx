import type { Metadata } from 'next'
import TestoClient from './TestoClient'

export const metadata: Metadata = {
  title: 'Testosterone Levels Checker for Men - Normal, Low & High Ranges',
  description: 'Check your testosterone reading against clinical ranges. Understand whether your total testosterone level is low, normal, or high - and what it means for your health.',
  alternates: { canonical: 'https://elitemensguide.com/emg-health-numbers-testosterone-levels/' },
}

export default function Page() {
  return <TestoClient />
}