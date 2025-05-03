"use client"

import { Card } from "flowbite-react"
import { HiArrowUp, HiArrowDown, HiClock, HiCurrencyDollar, HiChartPie, HiInformationCircle, HiTrendingUp } from "react-icons/hi"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Area, AreaChart, CartesianGrid, ReferenceLine, XAxis, YAxis } from "recharts"
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"

interface FinancialMetricsProps {
  initialCost: number
  totalCost: number
  totalRevenue: number
  roi: number
  paybackMonths: number
  contractDuration: number
  providerPaysOpex?: boolean
  irr: number | null
  residualValue: number
  yearlyRevenue?: number[]
  monthlyRevenue?: number[]
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
  residualValue,
  yearlyRevenue,
  monthlyRevenue,
}: FinancialMetricsProps) {
  const profit = totalRevenue - totalCost
  const isProfitable = profit > 0
  const paybackPercentage = Math.min(((contractDuration * 12) / paybackMonths) * 100, 100)
  // Calculate annual revenue for display and chart fallback
  const annualRevenue = totalRevenue / contractDuration

  // Generate data for the cumulative revenue chart
  const monthlyRevenueFallback = annualRevenue / 12
  let chartData;

  if (monthlyRevenue && monthlyRevenue.length > 0) {
    // Use actual monthly revenue data if available
    chartData = [];
    let cumulativeRevenue = 0;

    // Add initial point at month 0
    chartData.push({
      month: 0,
      revenue: 0,
      payback: initialCost,
    });

    // Add points for each month based on decay-adjusted monthly data
    for (let month = 0; month < monthlyRevenue.length; month++) {
      cumulativeRevenue += monthlyRevenue[month];

      chartData.push({
        month: month + 1,
        revenue: cumulativeRevenue,
        payback: initialCost,
      });
    }
  } else if (yearlyRevenue && yearlyRevenue.length > 0) {
    // Use yearly revenue data if available
    chartData = [];
    let cumulativeRevenue = 0;

    // Add initial point at month 0
    chartData.push({
      month: 0,
      revenue: 0,
      payback: initialCost,
    });

    // Add monthly points based on yearly data
    for (let year = 0; year < contractDuration; year++) {
      const yearlyRevenueAmount = yearlyRevenue[year] || 0;
      const monthlyRevenueForYear = yearlyRevenueAmount / 12;

      for (let month = 1; month <= 12; month++) {
        const currentMonth = year * 12 + month;
        cumulativeRevenue += monthlyRevenueForYear;

        chartData.push({
          month: currentMonth,
          revenue: cumulativeRevenue,
          payback: initialCost,
        });
      }
    }
  } else {
    // Fallback to linear distribution if no data available
    chartData = Array.from({ length: contractDuration * 12 + 1 }, (_, i) => {
      const month = i
      const cumulativeRevenue = monthlyRevenueFallback * month
      return {
        month,
        revenue: cumulativeRevenue,
        payback: initialCost,
      }
    });
  }

  // Use the exact payback month from the calculator
  const exactPaybackMonth = paybackMonths;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-fgpu-stone-800 border-fgpu-stone-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold tracking-tight text-fgpu-white flex items-center gap-2">
              <HiCurrencyDollar className="text-fgpu-volt" />
              Initial Investment
            </h3>
          </div>
          <p className="text-2xl font-bold text-fgpu-white">${initialCost.toLocaleString()}</p>
        </Card>

        <Card className="bg-fgpu-stone-800 border-fgpu-stone-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold tracking-tight text-fgpu-white flex items-center gap-2">
              <HiCurrencyDollar className="text-fgpu-volt" />
              Annual Revenue
            </h3>
          </div>
          <p className="text-2xl font-bold text-fgpu-white">${annualRevenue.toLocaleString()}</p>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-fgpu-stone-800 border-fgpu-stone-700">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold tracking-tight text-fgpu-white flex items-center gap-2">
                <HiChartPie className="text-fgpu-volt" />
                Total ROI
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        className="text-fgpu-gray-400 hover:text-fgpu-volt transition-colors"
                        onClick={(e) => e.preventDefault()}
                      >
                        <HiInformationCircle className="h-5 w-5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          {yearlyRevenue?.map((rev, idx) => (
                            <p key={idx} className="text-sm text-white">
                              Year {idx + 1}: ${rev.toLocaleString()}
                            </p>
                          ))}
                          <p className="text-sm text-white">
                            Residual Impact: ${residualValue.toLocaleString()}
                          </p>
                        </div>
                        <button
                          className="text-fgpu-gray-400 hover:text-fgpu-volt"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                        >
                          ×
                        </button>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </h3>
            </div>
            <p className={`text-2xl font-bold ${roi >= 0 ? "text-fgpu-volt" : "text-fgpu-stone-500"}`}>
              {roi.toFixed(1)}%
            </p>
          </Card>

          <Card className="bg-fgpu-stone-800 border-fgpu-stone-700">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold tracking-tight text-fgpu-white flex items-center gap-2">
                <HiTrendingUp className="text-fgpu-volt" />
                IRR
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HiInformationCircle className="text-fgpu-gray-400 cursor-pointer" />
                    </TooltipTrigger>
                    <TooltipContent className="w-64">
                      <p className="text-sm text-white">
                        Internal Rate of Return based on initial investment and projected cash flows over the contract duration, including residual value.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </h3>
            </div>
            <p className={`text-2xl font-bold ${irr !== null && irr >= 0 ? "text-fgpu-volt" : "text-fgpu-stone-500"}`}>
              {irr === null
                ? 'Calculating...'
                : irr === -1
                ? 'Never recovers'
                : `${(irr * 100).toFixed(1)}%`
              }
            </p>
          </Card>
        </div>

        <Card className="bg-fgpu-stone-800 border-fgpu-stone-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold tracking-tight text-fgpu-white flex items-center gap-2">
              <HiClock className="text-fgpu-volt" />
              Payback Period
            </h3>
          </div>
          <p className="text-2xl font-bold text-fgpu-white">{paybackMonths.toFixed(1)} months</p>
          <div className="mt-2">
            <div className="flex justify-between text-xs text-fgpu-gray-400 mb-1">
              <span>0</span>
              <span>{contractDuration * 12} months</span>
            </div>
            <div className="w-full bg-fgpu-stone-900 rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full ${paybackPercentage < 100 ? "bg-fgpu-volt" : "bg-fgpu-volt-light"}`}
                style={{ width: `${(paybackMonths / (contractDuration * 12)) * 100}%` }}
              ></div>
            </div>
          </div>
        </Card>
      </div>

      <Card className="bg-fgpu-stone-800 border-fgpu-stone-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold tracking-tight text-fgpu-white flex items-center gap-2">
            <HiTrendingUp className="text-fgpu-volt" />
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
                x={exactPaybackMonth}
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

