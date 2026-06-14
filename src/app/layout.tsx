import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Valerie Health — Your Menopause Companion',
  description:
    'AI-powered support for perimenopause and menopause. Track symptoms, get personalized insights, and navigate your care with confidence.',
  keywords: 'menopause, perimenopause, women health, symptom tracking, AI health',
  openGraph: {
    title: 'Valerie Health',
    description: 'Your intelligent companion through every stage of menopause.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased">{children}</body>
    </html>
  )
}
