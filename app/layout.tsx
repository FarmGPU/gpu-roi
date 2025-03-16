import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FarmGPU TCO Calculator',
  description: 'Calculate the total cost of ownership for GPU farming',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark h-full">
      <body className={`${inter.className} h-full bg-background dark:bg-gray-900`}>
        <main className="min-h-screen bg-background dark:bg-gray-900">
          {children}
        </main>
      </body>
    </html>
  )
}