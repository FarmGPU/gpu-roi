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

    // Check for user preference
    const isDarkMode =
      localStorage.getItem("darkMode") === "true" ||
      (!("darkMode" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches)

    if (isDarkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }

    // Check if ApexCharts is already loaded
    if (typeof window !== "undefined" && window.ApexCharts) {
      console.log("ApexCharts already loaded in useEffect")
      setApexChartsLoaded(true)
    }

    // Fallback: Load ApexCharts directly if Script component fails
    const loadApexCharts = () => {
      if (typeof window !== "undefined" && !window.ApexCharts) {
        console.log("Fallback: Loading ApexCharts directly")
        const script = document.createElement("script")
        script.src = "https://cdn.jsdelivr.net/npm/apexcharts"
        script.async = true
        script.onload = () => {
          console.log("ApexCharts loaded via fallback")
          setApexChartsLoaded(true)
        }
        script.onerror = () => {
          console.error("Failed to load ApexCharts via fallback")
        }
        document.body.appendChild(script)
      }
    }

    // Try loading ApexCharts after a delay if not already loaded
    const timer = setTimeout(loadApexCharts, 1000)

    return () => {
      clearTimeout(timer)
    }
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
          base: "bg-white dark:bg-fgpu-stone-800 rounded-lg border border-gray-200 dark:border-fgpu-stone-700 shadow",
        },
      },
    },
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
      {mounted && children}
    </Flowbite>
  )
}

