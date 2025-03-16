"use client"

import { Card } from "flowbite-react"
import { HiArrowUp, HiArrowDown, HiClock, HiCurrencyDollar, HiChartPie, HiInformationCircle, HiTrendingUp } from "react-icons/hi"

interface FinancialMetricsProps {
  initialCost: number
  totalCost: number
  totalRevenue: number
  roi: number
  paybackMonths: number
  contractDuration: number
  providerPaysOpex?: boolean
}

// Calculate IRR using Newton's method
const calculateIRR = (cashflows: number[], maxIterations = 1000, tolerance = 0.00001): number => {
  let guess = 0.1 // Initial guess of 10%

  for (let i = 0; i < maxIterations; i++) {
    let npv = cashflows[0] // Initial investment (negative)
    let derivativeNPV = 0

    // Calculate NPV and its derivative
    for (let j = 1; j < cashflows.length; j++) {
      const factor = Math.pow(1 + guess, j)
      npv += cashflows[j] / factor
      derivativeNPV -= j * cashflows[j] / (factor * (1 + guess))
    }

    // Newton's method step
    const nextGuess = guess - npv / derivativeNPV

    // Check for convergence
    if (Math.abs(nextGuess - guess) < tolerance) {
      return nextGuess * 100 // Convert to percentage
    }

    guess = nextGuess
  }

  return NaN // Return NaN if no convergence
}

export function FinancialMetrics({
  initialCost,
  totalCost,
  totalRevenue,
  roi,
  paybackMonths,
  contractDuration,
  providerPaysOpex = false,
}: FinancialMetricsProps) {
  const profit = totalRevenue - totalCost
  const isProfitable = profit > 0
  const paybackPercentage = Math.min(((contractDuration * 12) / paybackMonths) * 100, 100)

  // Calculate annual revenue (assuming linear distribution)
  const annualRevenue = totalRevenue / contractDuration
  const annualROI = ((annualRevenue - (totalCost / contractDuration)) / initialCost) * 100

  // Calculate IRR
  const monthlyRevenue = annualRevenue / 12
  const cashflows = [-initialCost]
  for (let i = 0; i < contractDuration * 12; i++) {
    cashflows.push(monthlyRevenue)
  }
  const monthlyIRR = calculateIRR(cashflows)
  const annualIRR = ((1 + monthlyIRR / 100) ** 12 - 1) * 100

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="bg-fgpu-stone-600 border-fgpu-stone-700">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium flex items-center gap-2 text-fgpu-stone-600 dark:text-fgpu-gray-300">
            <HiCurrencyDollar className="text-fgpu-stone-500 dark:text-fgpu-gray-400" />
            Initial Investment
          </h3>
        </div>
        <p className="text-2xl font-bold text-fgpu-black dark:text-fgpu-white">${initialCost.toLocaleString()}</p>
      </Card>

      <Card className="bg-fgpu-stone-600 border-fgpu-stone-700">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium flex items-center gap-2 text-fgpu-stone-600 dark:text-fgpu-gray-300">
            <HiCurrencyDollar className="text-fgpu-stone-500 dark:text-fgpu-gray-400" />
            Annual Revenue
          </h3>
        </div>
        <p className="text-2xl font-bold text-fgpu-black dark:text-fgpu-white">${annualRevenue.toLocaleString()}</p>
      </Card>

      <Card className="bg-fgpu-stone-600 border-fgpu-stone-700">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium flex items-center gap-2 text-fgpu-stone-600 dark:text-fgpu-gray-300">
            <HiChartPie className="text-fgpu-stone-500 dark:text-fgpu-gray-400" />
            Annual ROI
            <button data-tooltip-target="annual-roi-tooltip">
              <HiInformationCircle className="text-gray-400 hover:text-gray-600" />
            </button>
            <div
              id="annual-roi-tooltip"
              role="tooltip"
              className="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-sm opacity-0 tooltip dark:bg-gray-700"
            >
              Annual Return on Investment based on yearly revenue and costs
              <div className="tooltip-arrow" data-popper-arrow></div>
            </div>
          </h3>
        </div>
        <p className={`text-2xl font-bold ${annualROI >= 0 ? "text-fgpu-volt" : "text-fgpu-stone-500"}`}>
          {annualROI.toFixed(1)}%
        </p>
      </Card>

      <Card className="bg-fgpu-stone-600 border-fgpu-stone-700">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium flex items-center gap-2 text-fgpu-stone-600 dark:text-fgpu-gray-300">
            <HiTrendingUp className="text-fgpu-stone-500 dark:text-fgpu-gray-400" />
            IRR (Annual)
            <button data-tooltip-target="irr-tooltip">
              <HiInformationCircle className="text-gray-400 hover:text-gray-600" />
            </button>
            <div
              id="irr-tooltip"
              role="tooltip"
              className="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-sm opacity-0 tooltip dark:bg-gray-700"
            >
              Internal Rate of Return - the discount rate that makes the NPV of all cash flows equal to zero
              <div className="tooltip-arrow" data-popper-arrow></div>
            </div>
          </h3>
        </div>
        <p className={`text-2xl font-bold ${annualIRR >= 0 ? "text-fgpu-volt" : "text-fgpu-stone-500"}`}>
          {!isNaN(annualIRR) ? annualIRR.toFixed(1) : "N/A"}%
        </p>
      </Card>

      <Card className="bg-fgpu-stone-600 border-fgpu-stone-700">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium flex items-center gap-2 text-fgpu-stone-600 dark:text-fgpu-gray-300">
            <HiClock className="text-fgpu-stone-500 dark:text-fgpu-gray-400" />
            Payback Period
          </h3>
        </div>
        <p className="text-2xl font-bold text-fgpu-black dark:text-fgpu-white">{paybackMonths.toFixed(1)} months</p>
        <div className="mt-2">
          <div className="flex justify-between text-xs text-fgpu-stone-500 dark:text-fgpu-gray-400 mb-1">
            <span>0</span>
            <span>{contractDuration * 12} months</span>
          </div>
          <div className="w-full bg-fgpu-stone-200 dark:bg-fgpu-stone-700 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full ${paybackPercentage < 100 ? "bg-fgpu-volt" : "bg-fgpu-volt-light"}`}
              style={{ width: `${paybackPercentage}%` }}
            ></div>
          </div>
        </div>
      </Card>

      {providerPaysOpex && (
        <div className="md:col-span-2 p-3 bg-fgpu-stone-600 rounded-lg text-sm text-fgpu-stone-800 dark:text-fgpu-gray-200">
          <p className="flex items-center gap-2">
            <HiInformationCircle className="text-lg text-fgpu-volt" />
            In this model, the provider (data center) pays for all operational expenses. The owner only pays for the
            initial GPU cost.
          </p>
        </div>
      )}
    </div>
  )
}

