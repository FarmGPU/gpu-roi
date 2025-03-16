"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Flowbite } from "flowbite-react"
import "./globals.css"
import Script from "next/script"

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [mounted, setMounted] = useState(false)
  const [apexChartsLoaded, setApexChartsLoaded] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Force dark mode
    document.documentElement.classList.add("dark")
  }, [])

  // Handle ApexCharts script load
  const handleApexChartsLoad = () => {
    console.log("ApexCharts loaded via Script component")
    setApexChartsLoaded(true)
  }

  // Apply Flowbite theme
  const flowbiteTheme = {
    dark: true,
    theme: {
      button: {
        color: {
          primary: "bg-fgpu-volt hover:bg-fgpu-volt-light text-fgpu-black",
        },
      },
      card: {
        root: {
          base: "bg-fgpu-stone-900 border-fgpu-stone-700 shadow",
        },
      },
      select: {
        field: {
          select: {
            base: "bg-fgpu-stone-600 border-fgpu-stone-700 text-fgpu-white",
            colors: {
              gray: "bg-fgpu-stone-600 border-fgpu-stone-700 text-fgpu-white",
            },
          },
        },
      },
      dropdown: {
        floating: {
          base: "bg-fgpu-stone-600 border-fgpu-stone-700",
          content: "py-1 text-fgpu-white",
          target: "bg-fgpu-stone-600 border-fgpu-stone-700 text-fgpu-white",
        },
      },
      modal: {
        content: {
          base: "bg-fgpu-stone-600 border-fgpu-stone-700",
        },
      },
      sidebar: {
        root: {
          base: "bg-fgpu-stone-600 border-fgpu-stone-700",
        },
      },
      tab: {
        base: "bg-fgpu-stone-600",
        tablist: {
          base: "bg-fgpu-stone-600 border-fgpu-stone-700",
          tabitem: {
            base: "bg-fgpu-stone-600",
          },
        },
      },
      input: {
        field: {
          base: "bg-fgpu-stone-600 border-fgpu-stone-700 text-fgpu-white",
          input: {
            base: "bg-fgpu-stone-600 border-fgpu-stone-700 text-fgpu-white",
            colors: {
              gray: "bg-fgpu-stone-600 border-fgpu-stone-700 text-fgpu-white",
            },
          },
        },
      },
      tooltip: {
        base: "bg-fgpu-stone-600 border-fgpu-stone-700",
        content: "bg-fgpu-stone-600 text-fgpu-white",
      },
    },
  }

  // Only render children after client-side hydration is complete
  if (!mounted) {
    return null
  }

  return (
    <Flowbite theme={flowbiteTheme}>
      {/* Load ApexCharts with high priority */}
      <Script
        src="https://cdn.jsdelivr.net/npm/apexcharts"
        strategy="beforeInteractive"
        onLoad={handleApexChartsLoad}
        onError={() => {
          console.error("Failed to load ApexCharts via Script component")
        }}
      />
      {/* Suppress hydration warnings by only rendering after mount */}
      <div suppressHydrationWarning>
        {children}
      </div>
    </Flowbite>
  )
}

