import { Inter } from 'next/font/google'
import './globals.css'
import type { Metadata } from 'next'
import { TooltipProvider } from '@/components/ui/tooltip'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FarmGPU',
  description: 'Sustainable GPU hosting and AI infrastructure provider',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body suppressHydrationWarning className={`${inter.className} min-h-screen bg-fgpu-black text-fgpu-white`}>
        <TooltipProvider>
          {children}
        </TooltipProvider>
      </body>
    </html>
  )
}