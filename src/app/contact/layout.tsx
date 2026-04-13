import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Us',
  description: "Get in touch with the Elite Men's Guide team. We welcome questions, feedback, and partnership enquiries.",
  alternates: { canonical: 'https://elitemensguide.com/contact/' },
  openGraph: {
    title: "Contact Us – Elite Men's Guide",
    description: "Get in touch with the Elite Men's Guide team.",
    url: 'https://elitemensguide.com/contact/',
  },
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
