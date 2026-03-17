import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Out On The Air — OOTA',
  description: 'The soul of OOTA is human-to-human connection through skill and radio craft.',
  openGraph: {
    title: 'Out On The Air — OOTA',
    description: 'Leave the shack. Find the world. Your voice or your fist.',
    url: 'https://outonttheair.com',
    siteName: 'Out On The Air',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
