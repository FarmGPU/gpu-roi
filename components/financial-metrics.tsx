"use client"

import { Card } from "flowbite-react"
import { HiArrowUp, HiArrowDown, HiClock, HiCurrencyDollar, HiChartPie, HiInformationCircle, HiTrendingUp } from "react-icons/hi"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Area, AreaChart, CartesianGrid, ReferenceLine, XAxis, YAxis } from "recharts"

interface FinancialMetricsProps {
  initialCost: number
  totalCost: number
  totalRevenue: number
  roi: number
  paybackMonths: number
  contractDuration: number
  providerPaysOpex?: boolean
  irr: number | null
}

export function FinancialMetrics({
  initialCost,
  totalCost,
  totalRevenue,
  roi,
  paybackMonths,
  contractDuration,
  providerPaysOpex = false,
  irr,
}: FinancialMetricsProps) {
  const profit = totalRevenue - totalCost
  const isProfitable = profit > 0
  const paybackPercentage = Math.min(((contractDuration * 12) / paybackMonths) * 100, 100)

  // Calculate annual revenue (assuming linear distribution)
  const annualRevenue = totalRevenue / contractDuration
  const annualProfit = annualRevenue - (totalCost / contractDuration);
  const annualROI = initialCost > 0 ? (annualProfit / initialCost) * 100 : 0;

  // Generate data for the cumulative revenue chart
  const monthlyRevenue = annualRevenue / 12
  const chartData = Array.from({ length: contractDuration * 12 + 1 }, (_, i) => {
    const month = i
    const cumulativeRevenue = monthlyRevenue * month
    return {
      month,
      revenue: cumulativeRevenue,
      payback: initialCost,
    }
  })

  return (
    <div className="space-y-4">
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

          <div className="mt-4 pt-4 border-t border-fgpu-stone-700">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium flex items-center gap-2 text-fgpu-stone-600 dark:text-fgpu-gray-300">
                <HiTrendingUp className="text-fgpu-stone-500 dark:text-fgpu-gray-400" />
                IRR
                <button data-tooltip-target="irr-tooltip">
                  <HiInformationCircle className="text-gray-400 hover:text-gray-600" />
                </button>
                <div
                  id="irr-tooltip"
                  role="tooltip"
                  className="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-sm opacity-0 tooltip dark:bg-gray-700"
                >
                  Internal Rate of Return based on initial investment and projected cash flows over the contract duration, including residual value.
                  <div className="tooltip-arrow" data-popper-arrow></div>
                </div>
              </h3>
            </div>
            <p className={`text-2xl font-bold ${irr !== null && irr >= 0 ? "text-fgpu-volt" : "text-fgpu-stone-500"}`}>
              {irr !== null ? `${(irr * 100).toFixed(2)}%` : 'Calculating...'}
            </p>
          </div>
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
      </div>

      <Card className="bg-fgpu-stone-600 border-fgpu-stone-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium flex items-center gap-2 text-fgpu-stone-600 dark:text-fgpu-gray-300">
            <HiTrendingUp className="text-fgpu-stone-500 dark:text-fgpu-gray-400" />
            Cumulative Revenue
          </h3>
        </div>
        <div className="h-[280px] p-4 overflow-hidden">
          <ChartContainer
            className="w-full h-full"
            config={{
              revenue: {
                label: "Cumulative Revenue",
                color: "#88FF00",
              },
              payback: {
                label: "Payback Threshold",
                color: "#9AA38F",
              },
            }}
          >
            <AreaChart data={chartData} margin={{ top: 8, right: 48, left: 48, bottom: 8 }}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#88FF00" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#88FF00" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#34382E" />
              <XAxis
                dataKey="month"
                tickFormatter={(value) => `${value}mo`}
                stroke="#9AA38F"
                tick={{ fill: "#9AA38F" }}
                axisLine={{ stroke: '#34382E' }}
                tickLine={{ stroke: '#34382E' }}
                dy={8}
              />
              <YAxis
                tickFormatter={(value) => `$${value.toLocaleString()}`}
                stroke="#9AA38F"
                tick={{ fill: "#9AA38F" }}
                axisLine={{ stroke: '#34382E' }}
                tickLine={{ stroke: '#34382E' }}
                width={48}
                dx={-8}
              />
              <ChartTooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <ChartTooltipContent
                        active={active}
                        payload={payload}
                        formatter={(value: any) => `$${Number(value).toLocaleString()}`}
                      />
                    )
                  }
                  return null
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#88FF00"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#revenueGradient)"
              />
              <ReferenceLine
                y={initialCost}
                stroke="#9AA38F"
                strokeDasharray="3 3"
                label={{
                  value: "Initial Investment",
                  position: "insideRight",
                  fill: "#9AA38F",
                  offset: 8
                }}
              />
              <ReferenceLine
                x={paybackMonths}
                stroke="#88FF00"
                strokeDasharray="3 3"
                label={{
                  value: "Payback",
                  position: "insideTopRight",
                  fill: "#88FF00",
                  offset: 8
                }}
              />
            </AreaChart>
          </ChartContainer>
        </div>
      </Card>
    </div>
  )
}

