"use client"

import { useState, useMemo } from "react"
import { Card, Select, Button, Label, Tooltip, Badge } from "flowbite-react"
import { gpuData } from "@/data/gpu-data"
import { FinancialMetrics } from "@/components/financial-metrics"
import { TCOBreakdown } from "@/components/tco-breakdown"
import {
  HiChip,
  HiClock,
  HiCurrencyDollar,
  HiLightningBolt,
  HiRefresh,
  HiInformationCircle,
  HiServer,
  HiShieldCheck,
  HiCash,
} from "react-icons/hi"
import { Slider } from "@/components/ui/slider"

export function GpuCalculator() {
  const [selectedGpu, setSelectedGpu] = useState(gpuData[0].id)
  const [contractDuration, setContractDuration] = useState(3)
  const [idlePercentage, setIdlePercentage] = useState(10)
  const [spotPercentage, setSpotPercentage] = useState(20)
  const [onDemandPercentage, setOnDemandPercentage] = useState(70)
  const [secureMode, setSecureMode] = useState(true)
  const [platformFeePercentage, setPlatformFeePercentage] = useState(20)
  const [ownerSharePercentage, setOwnerSharePercentage] = useState(50)
  const [activeTab, setActiveTab] = useState("overview")

  const gpu = gpuData.find((g) => g.id === selectedGpu) || gpuData[0]

  // Calculate weighted hourly rate based on percentages
  const calculateHourlyRate = useMemo(() => {
    // Ensure percentages add up to 100%
    const totalPercentage = idlePercentage + spotPercentage + onDemandPercentage
    const normalizedIdle = idlePercentage / totalPercentage
    const normalizedSpot = spotPercentage / totalPercentage
    const normalizedOnDemand = onDemandPercentage / totalPercentage

    // Get the appropriate rates based on secure mode
    const spotRate = secureMode ? gpu.secureSpot : gpu.communitySpot
    const onDemandRate = secureMode ? gpu.secureOnDemand : gpu.communityOnDemand

    // If rates are not available for the selected mode, use the available ones or default to 0
    const effectiveSpotRate = spotRate ?? (secureMode ? gpu.communitySpot : 0) ?? 0
    const effectiveOnDemandRate = onDemandRate ?? (secureMode ? gpu.communityOnDemand : 0) ?? 0

    // Calculate weighted average (idle is always $0/hr)
    const weightedRate =
      normalizedIdle * 0 + normalizedSpot * effectiveSpotRate + normalizedOnDemand * effectiveOnDemandRate

    return weightedRate
  }, [gpu, idlePercentage, spotPercentage, onDemandPercentage, secureMode])

  // Calculate Revenue
  const hourlyRate = calculateHourlyRate
  const hoursPerYear = 365 * 24 // We're already accounting for utilization in the hourly rate
  const grossAnnualRevenue = hourlyRate * hoursPerYear
  const platformFee = grossAnnualRevenue * (platformFeePercentage / 100)
  const netAnnualRevenue = grossAnnualRevenue - platformFee
  const ownerRevenue = netAnnualRevenue * (ownerSharePercentage / 100)
  const providerRevenue = netAnnualRevenue * (1 - ownerSharePercentage / 100)

  const totalGrossRevenue = grossAnnualRevenue * contractDuration
  const totalOwnerRevenue = ownerRevenue * contractDuration

  // Calculate TCO
  const initialCost = gpu.price

  // Calculate ROI and Payback
  const profit = totalOwnerRevenue - initialCost // Only consider initial cost when provider pays OPEX
  const roi = (profit / initialCost) * 100
  const paybackMonths = initialCost / (ownerRevenue / 12)

  // Check if secure mode is available for this GPU
  const secureAvailable = gpu.secureSpot !== null || gpu.secureOnDemand !== null

  return (
    <Card className="w-full bg-fgpu-stone-900 border-fgpu-stone-700">
      <h5 className="text-xl font-bold tracking-tight text-fgpu-white flex items-center gap-2">
        <HiChip className="text-fgpu-volt" />
        GPU Investment Calculator
      </h5>
      <p className="font-normal text-fgpu-gray-300">
        Calculate the total cost of ownership, expected revenue, and return on investment
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <HiChip className="text-fgpu-stone-500 dark:text-fgpu-gray-400" />
              <Label htmlFor="gpu-model" value="GPU Model" className="text-fgpu-stone-600 dark:text-fgpu-gray-300" />
              <Badge
                color={gpu.cardType === "Data Center" ? "blue" : gpu.cardType === "Workstation" ? "purple" : "gray"}
                className="ml-auto"
              >
                {gpu.cardType}
              </Badge>
            </div>
            <Select
              id="gpu"
              value={selectedGpu}
              onChange={(e) => setSelectedGpu(e.target.value)}
              className="bg-fgpu-stone-900 text-fgpu-gray-300 border-fgpu-stone-700"
            >
              <option value="" disabled>Select a GPU</option>
              {/* Data Center GPUs */}
              <optgroup label="Data Center GPUs" className="bg-fgpu-stone-900 text-fgpu-gray-300">
                {gpuData
                  .filter((gpu) => gpu.cardType === "Data Center")
                  .map((gpu) => (
                    <option key={gpu.id} value={gpu.id} className="bg-fgpu-stone-900">
                      {gpu.name}
                    </option>
                  ))}
              </optgroup>
              {/* Consumer GPUs */}
              <optgroup label="Consumer GPUs" className="bg-fgpu-stone-900 text-fgpu-gray-300">
                {gpuData
                  .filter((gpu) => gpu.cardType === "Consumer")
                  .map((gpu) => (
                    <option key={gpu.id} value={gpu.id} className="bg-fgpu-stone-900">
                      {gpu.name}
                    </option>
                  ))}
              </optgroup>
              {/* Workstation GPUs */}
              <optgroup label="Workstation GPUs" className="bg-fgpu-stone-900 text-fgpu-gray-300">
                {gpuData
                  .filter((gpu) => gpu.cardType === "Workstation")
                  .map((gpu) => (
                    <option key={gpu.id} value={gpu.id} className="bg-fgpu-stone-900">
                      {gpu.name}
                    </option>
                  ))}
              </optgroup>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <HiClock className="text-fgpu-stone-500 dark:text-fgpu-gray-400" />
              <Label
                htmlFor="contract-duration"
                value="Contract Duration (Years)"
                className="text-fgpu-stone-600 dark:text-fgpu-gray-300"
              />
            </div>
            <Select
              id="contract-duration"
              value={contractDuration}
              onChange={(e) => setContractDuration(Number.parseInt(e.target.value))}
              className="bg-fgpu-stone-900 text-fgpu-gray-300 border-fgpu-stone-700"
            >
              <option value="1">1 Year</option>
              <option value="2">2 Years</option>
              <option value="3">3 Years</option>
              <option value="5">5 Years</option>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HiServer className="text-fgpu-stone-500 dark:text-fgpu-gray-400" />
                <Label
                  htmlFor="secure-mode"
                  value="Hosting Mode"
                  className="text-fgpu-stone-600 dark:text-fgpu-gray-300"
                />
              </div>
              <div className="flex items-center gap-2">
                <Label
                  htmlFor="secure-mode-toggle"
                  value={secureMode ? "Secure" : "Community"}
                  className="text-sm text-fgpu-stone-500 dark:text-fgpu-gray-400"
                />
                <button
                  id="secure-mode-toggle"
                  onClick={() => {
                    if (secureAvailable || !secureMode) {
                      setSecureMode(!secureMode)
                    }
                  }}
                  disabled={!secureAvailable && secureMode}
                  className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-fgpu-volt/30 ${
                    secureMode ? "bg-fgpu-volt" : "bg-fgpu-stone-200 dark:bg-fgpu-stone-700"
                  } ${!secureAvailable && secureMode ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                >
                  <span
                    className={`inline-block w-5 h-5 transform bg-white rounded-full transition-transform ${
                      secureMode ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                  {secureMode && <HiShieldCheck className="absolute right-1 text-white text-xs" />}
                </button>
              </div>
            </div>
            {!secureAvailable && secureMode && (
              <p className="text-xs text-red-500">Secure mode not available for this GPU. Using Community rates.</p>
            )}
          </div>

          <div className="space-y-4 p-4 bg-fgpu-stone-600 rounded-lg">
            <h3 className="text-sm font-medium text-fgpu-gray-300 flex items-center gap-2">
              <HiLightningBolt className="text-fgpu-stone-500 dark:text-fgpu-gray-400" />
              Usage Distribution
              <Tooltip content="Set the percentage of time your GPU will be idle, running spot jobs, or on-demand jobs">
                <HiInformationCircle className="text-gray-400" />
              </Tooltip>
            </h3>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-fgpu-stone-600 dark:text-fgpu-gray-300">Idle</span>
                  <span className="text-sm text-fgpu-stone-500 dark:text-fgpu-gray-400">{idlePercentage}%</span>
                </div>
                <Slider
                  value={[idlePercentage]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={(values) => {
                    const newValue = values[0]
                    setIdlePercentage(newValue)
                    // Adjust other values proportionally to maintain total of 100%
                    const remaining = 100 - newValue
                    const currentTotal = spotPercentage + onDemandPercentage
                    if (currentTotal > 0) {
                      const spotRatio = spotPercentage / currentTotal
                      const newSpot = Math.round(remaining * spotRatio)
                      setSpotPercentage(newSpot)
                      setOnDemandPercentage(remaining - newSpot)
                    } else {
                      // If both are 0, split remaining evenly
                      setSpotPercentage(Math.round(remaining / 2))
                      setOnDemandPercentage(Math.round(remaining / 2))
                    }
                  }}
                  className="w-full"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-fgpu-stone-600 dark:text-fgpu-gray-300">Spot</span>
                  <span className="text-sm text-fgpu-stone-500 dark:text-fgpu-gray-400">{spotPercentage}%</span>
                </div>
                <Slider
                  value={[spotPercentage]}
                  min={0}
                  max={100 - idlePercentage}
                  step={1}
                  onValueChange={(values) => {
                    const newValue = values[0]
                    setSpotPercentage(newValue)
                    setOnDemandPercentage(100 - idlePercentage - newValue)
                  }}
                  className="w-full"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-fgpu-stone-600 dark:text-fgpu-gray-300">On-Demand</span>
                  <span className="text-sm text-fgpu-stone-500 dark:text-fgpu-gray-400">{onDemandPercentage}%</span>
                </div>
                <Slider
                  value={[onDemandPercentage]}
                  min={0}
                  max={100 - idlePercentage}
                  step={1}
                  onValueChange={(values) => {
                    const newValue = values[0]
                    setOnDemandPercentage(newValue)
                    setSpotPercentage(100 - idlePercentage - newValue)
                  }}
                  className="w-full"
                />
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-fgpu-stone-700">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-fgpu-stone-600 dark:text-fgpu-gray-300">
                  Effective Hourly Rate:
                </span>
                <span className="text-sm font-medium text-fgpu-volt">${hourlyRate.toFixed(3)}/hr</span>
              </div>
            </div>
          </div>

          <div className="space-y-4 p-4 bg-fgpu-stone-600 rounded-lg">
            <h3 className="text-sm font-medium text-fgpu-gray-300 flex items-center gap-2">
              <HiCurrencyDollar className="text-fgpu-stone-500 dark:text-fgpu-gray-400" />
              Revenue Sharing
              <Tooltip content="Set how revenue is split between the platform, owner (investor), and provider (data center)">
                <HiInformationCircle className="text-gray-400" />
              </Tooltip>
            </h3>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-fgpu-stone-600 dark:text-fgpu-gray-300">Platform Fee</span>
                  <span className="text-sm text-fgpu-stone-500 dark:text-fgpu-gray-400">{platformFeePercentage}%</span>
                </div>
                <Slider
                  value={[platformFeePercentage]}
                  min={5}
                  max={40}
                  step={1}
                  onValueChange={(values) => setPlatformFeePercentage(values[0])}
                  className="w-full"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-fgpu-stone-600 dark:text-fgpu-gray-300">
                    Owner Share (of remaining)
                  </span>
                  <span className="text-sm text-fgpu-stone-500 dark:text-fgpu-gray-400">{ownerSharePercentage}%</span>
                </div>
                <Slider
                  value={[ownerSharePercentage]}
                  min={10}
                  max={90}
                  step={1}
                  onValueChange={(values) => setOwnerSharePercentage(values[0])}
                  className="w-full"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-fgpu-stone-600 dark:text-fgpu-gray-300">
                    Provider Share (of remaining)
                  </span>
                  <span className="text-sm text-fgpu-stone-500 dark:text-fgpu-gray-400">
                    {100 - ownerSharePercentage}%
                  </span>
                </div>
                <div className="w-full h-2 bg-fgpu-stone-700 rounded-lg">
                  <div
                    className="h-2 bg-fgpu-volt rounded-lg"
                    style={{ width: `${100 - ownerSharePercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-fgpu-stone-700">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-fgpu-stone-600 dark:text-fgpu-gray-300">
                  Annual Owner Revenue:
                </span>
                <span className="text-sm font-medium text-fgpu-volt">${ownerRevenue.toFixed(0)}/year</span>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="mb-4 border-b border-fgpu-gray-300 dark:border-fgpu-stone-700">
            <ul className="flex flex-wrap -mb-px text-sm font-medium text-center" role="tablist">
              <li className="mr-2" role="presentation">
                <button
                  className={`inline-block p-4 border-b-2 rounded-t-lg ${activeTab === "overview" ? "text-fgpu-volt border-fgpu-volt dark:text-fgpu-volt dark:border-fgpu-volt" : "hover:text-fgpu-stone-600 hover:border-fgpu-stone-300 dark:hover:text-fgpu-gray-300"}`}
                  onClick={() => setActiveTab("overview")}
                  type="button"
                  role="tab"
                >
                  <div className="flex items-center">
                    <HiChip className="mr-2" />
                    Overview
                  </div>
                </button>
              </li>
              <li className="mr-2" role="presentation">
                <button
                  className={`inline-block p-4 border-b-2 rounded-t-lg ${activeTab === "tco" ? "text-fgpu-volt border-fgpu-volt dark:text-fgpu-volt dark:border-fgpu-volt" : "hover:text-fgpu-stone-600 hover:border-fgpu-stone-300 dark:hover:text-fgpu-gray-300"}`}
                  onClick={() => setActiveTab("tco")}
                  type="button"
                  role="tab"
                >
                  <div className="flex items-center">
                    <HiCurrencyDollar className="mr-2" />
                    Provider Costs
                  </div>
                </button>
              </li>
            </ul>
          </div>

          <div className="p-4">
            {activeTab === "overview" && (
              <FinancialMetrics
                initialCost={initialCost}
                totalCost={initialCost} // Only initial cost when provider pays OPEX
                totalRevenue={totalOwnerRevenue}
                roi={roi}
                paybackMonths={paybackMonths}
                contractDuration={contractDuration}
              />
            )}

            {activeTab === "tco" && (
              <TCOBreakdown
                initialCost={initialCost}
                powerConsumption={gpu.powerConsumption}
                idlePowerConsumption={gpu.idlePowerConsumption}
                idlePercentage={idlePercentage}
                contractDuration={contractDuration}
              />
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-6">
        <Button
          color="light"
          className="flex items-center gap-2 bg-fgpu-stone-100 hover:bg-fgpu-stone-200 dark:bg-fgpu-stone-700 dark:hover:bg-fgpu-stone-600 text-fgpu-black dark:text-fgpu-white"
        >
          <HiRefresh />
          Reset
        </Button>
      </div>
    </Card>
  )
}

