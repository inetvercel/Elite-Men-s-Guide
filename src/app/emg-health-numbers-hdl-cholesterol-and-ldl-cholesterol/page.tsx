import type { Metadata } from 'next'
import CholesterolClient from './CholesterolClient'

export const metadata: Metadata = {
  title: 'HDL & LDL Cholesterol Checker for Men',
  description: 'Check your HDL and LDL cholesterol readings against AHA guidelines. Understand your cardiovascular risk and what your numbers mean for long-term heart health.',
  alternates: { canonical: 'https://elitemensguide.com/emg-health-numbers-hdl-cholesterol-and-ldl-cholesterol/' },
}

export default function Page() {
  return <CholesterolClient />
}