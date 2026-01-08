import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MindFlow - Психологічна платформа',
  description: 'Професійна платформа для психологічного тестування та аналізу',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="uk">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
