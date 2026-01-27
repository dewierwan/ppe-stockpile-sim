import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '3M Aura Respirator Stockpile Simulation',
  description: 'Model 3M Aura respirator supply and demand during a pandemic',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
