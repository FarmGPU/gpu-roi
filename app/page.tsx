"use client"

import { useState, useEffect } from "react"
import { GpuCalculator } from "@/components/gpu-calculator"
import { HiChip, HiCalculator } from "react-icons/hi"
import { TooltipProvider } from "@/components/ui/tooltip"

export default function Home() {
  const [mounted, setMounted] = useState(false)

  // Force dark mode
  useEffect(() => {
    setMounted(true)
    document.documentElement.classList.add("dark")
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-fgpu-black text-fgpu-white">
      <header className="bg-fgpu-stone-800 border-b border-fgpu-stone-700 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* FarmGPU Logo */}
              <div className="logo-container">
                <img src="/farmgpu-logo-white.svg" alt="FarmGPU Logo" className="logo-svg" />
                <h1 className="text-2xl font-bold">FarmGPU</h1>
              </div>
            </div>
            <nav className="hidden md:flex gap-6">
              <a
                href="#calculator"
                className="text-sm font-medium text-fgpu-gray-300 hover:text-fgpu-volt flex items-center gap-2"
              >
                <HiCalculator className="text-lg" />
                Calculator
              </a>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-8 py-8">
        <section id="calculator" className="mb-12">
          <TooltipProvider>
            <GpuCalculator />
          </TooltipProvider>
        </section>
      </main>
    </div>
  )
}

