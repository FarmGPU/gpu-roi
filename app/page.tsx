"use client"

import { useState, useEffect } from "react"
import { GpuCalculator } from "@/components/gpu-calculator"
import { GpuComparison } from "@/components/gpu-comparison"
import { HiChip, HiCalculator } from "react-icons/hi"

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
              <a
                href="#comparison"
                className="text-sm font-medium text-fgpu-gray-300 hover:text-fgpu-volt flex items-center gap-2"
              >
                <HiChip className="text-lg" />
                Comparison
              </a>
            </nav>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <section id="calculator" className="mb-12">
          <div className="max-w-3xl mx-auto text-center mb-10">
            <h2 className="text-3xl font-bold mb-4 text-fgpu-white">GPU Investment Calculator</h2>
            <p className="text-fgpu-gray-300">
              Calculate the total cost of ownership, expected revenue, and return on investment for different GPU types
              offered through the FarmGPU platform.
            </p>
          </div>
          <GpuCalculator />
        </section>
        <section id="comparison" className="mb-12">
          <div className="max-w-3xl mx-auto text-center mb-10">
            <h2 className="text-3xl font-bold mb-4 text-fgpu-white">Compare GPU Models</h2>
            <p className="text-fgpu-gray-300">
              Compare up to 3 different GPU models side-by-side to find the best investment opportunity for your needs.
            </p>
          </div>
          <GpuComparison />
        </section>
      </main>
      <footer className="bg-fgpu-stone-800 border-t border-fgpu-stone-700 py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-bold mb-4 flex items-center gap-2 text-fgpu-white">
                <div className="logo-container">
                  <img src="/farmgpu-logo-white.svg" alt="FarmGPU Logo" className="w-5 h-5" />
                  FarmGPU
                </div>
              </h3>
              <p className="text-sm text-fgpu-gray-300">
                The transparent blockchain-based GPU investment platform.
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-4 text-fgpu-white">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-sm text-fgpu-gray-300 hover:text-fgpu-volt"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-fgpu-gray-300 hover:text-fgpu-volt"
                  >
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

