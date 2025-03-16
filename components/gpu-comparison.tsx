"use client"

import { useState } from "react"
import { Card, Badge, Select, Button, Tabs } from "flowbite-react"
import { gpuData } from "@/data/gpu-data"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { HiChip, HiX, HiTrash, HiDocumentText, HiChartBar, HiCurrencyDollar, HiShieldCheck } from "react-icons/hi"

export function GpuComparison() {
  const [selectedGpus, setSelectedGpus] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState("specs")
  const [secureMode, setSecureMode] = useState(false)
  const providerPaysOpex = true // Provider pays for operational expenses

  const handleSelectGpu = (gpuId: string) => {
    if (selectedGpus.includes(gpuId)) {
      setSelectedGpus(selectedGpus.filter((id) => id !== gpuId))
    } else if (selectedGpus.length < 3) {
      setSelectedGpus([...selectedGpus, gpuId])
    }
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
  }

  const selectedGpuData = gpuData.filter((gpu) => selectedGpus.includes(gpu.id))

  const performanceData = selectedGpuData.map((gpu) => ({
    name: gpu.name,
    TFLOPS: gpu.performance || 0,
    "Memory (GB)": gpu.memory || 0,
    "Power (W)": gpu.powerConsumption || 0,
  }))

  const financialData = selectedGpuData.map((gpu) => {
    // Get the appropriate rates based on secure mode
    const spotRate = secureMode ? gpu.secureSpot : gpu.communitySpot
    const onDemandRate = secureMode ? gpu.secureOnDemand : gpu.communityOnDemand

    // If rates are not available for the selected mode, use the available ones or default to 0
    const effectiveSpotRate = spotRate ?? (secureMode ? gpu.communitySpot : 0) ?? 0
    const effectiveOnDemandRate = onDemandRate ?? (secureMode ? gpu.communityOnDemand : 0) ?? 0

    // Calculate average hourly rate (50% spot, 50% on-demand)
    const avgHourlyRate = (effectiveSpotRate + effectiveOnDemandRate) / 2

    const hoursPerYear = 365 * 24 * 0.8 // 80% utilization
    const annualRevenue = avgHourlyRate * hoursPerYear

    // ROI calculation based on provider pays OPEX model
    const roi = ((annualRevenue - (providerPaysOpex ? 0 : gpu.price * 0.1)) / gpu.price) * 100

    return {
      name: gpu.name,
      "Initial Cost ($)": gpu.price,
      "Annual Revenue ($)": annualRevenue,
      "ROI (%)": roi,
    }
  })

  // FarmGPU brand colors for charts
  const chartColors = {
    primary: "#88FF00", // Volt
    secondary: "#B8FF66", // Volt light
    tertiary: "#CFFF99", // Volt lighter
    quaternary: "#66CC00", // Volt dark
  }

  return (
    <Card className="w-full bg-fgpu-stone-900 border-fgpu-stone-700">
      <h5 className="text-xl font-bold tracking-tight text-fgpu-white flex items-center gap-2">
        <HiChip className="text-fgpu-volt" />
        GPU Comparison
      </h5>
      <p className="font-normal text-fgpu-gray-300">
        Compare up to 3 different GPU models side-by-side
      </p>

      <div className="mb-6 mt-4">
        <div className="flex flex-wrap gap-2 mb-4">
          {selectedGpus.map((gpuId) => {
            const gpu = gpuData.find((g) => g.id === gpuId)
            return (
              <Badge
                key={gpuId}
                color="success"
                className="px-3 py-1 flex items-center gap-1 bg-fgpu-volt text-fgpu-black"
              >
                <HiChip className="text-xs" />
                {gpu?.name}
                <button
                  className="ml-2 text-fgpu-black hover:text-fgpu-stone-700"
                  onClick={() => handleSelectGpu(gpuId)}
                >
                  <HiX />
                </button>
              </Badge>
            )
          })}
          {selectedGpus.length === 0 && (
            <p className="text-sm text-fgpu-stone-500 dark:text-fgpu-gray-400 flex items-center gap-2">
              <HiChip />
              Select up to 3 GPU models to compare
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-fgpu-stone-600 dark:text-fgpu-gray-300">Hosting Mode:</span>
            <div className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                id="secure-mode-comparison"
                className="sr-only peer"
                checked={secureMode}
                onChange={() => setSecureMode(!secureMode)}
              />
              <div className="w-11 h-6 bg-fgpu-stone-200 dark:bg-fgpu-stone-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-fgpu-volt/30 dark:peer-focus:ring-fgpu-volt/20 rounded-full peer dark:bg-fgpu-stone-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-fgpu-stone-600 peer-checked:bg-fgpu-volt"></div>
              <span className="ms-1 text-sm font-medium text-fgpu-black dark:text-fgpu-white">
                {secureMode ? (
                  <span className="flex items-center gap-1">
                    <HiShieldCheck className="text-fgpu-volt" /> Secure
                  </span>
                ) : (
                  "Community"
                )}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Select
            value=""
            onChange={(e) => handleSelectGpu(e.target.value)}
            disabled={selectedGpus.length >= 3}
            className="bg-fgpu-stone-600 border-fgpu-stone-700 text-fgpu-white"
          >
            <option value="">Add GPU to compare</option>
            <optgroup label="Data Center">
              {gpuData
                .filter((gpu) => gpu.cardType === "Data Center" && !selectedGpus.includes(gpu.id))
                .map((gpu) => (
                  <option key={gpu.id} value={gpu.id}>
                    {gpu.name}
                  </option>
                ))}
            </optgroup>
            <optgroup label="Workstation">
              {gpuData
                .filter((gpu) => gpu.cardType === "Workstation" && !selectedGpus.includes(gpu.id))
                .map((gpu) => (
                  <option key={gpu.id} value={gpu.id}>
                    {gpu.name}
                  </option>
                ))}
            </optgroup>
            <optgroup label="Consumer">
              {gpuData
                .filter((gpu) => gpu.cardType === "Consumer" && !selectedGpus.includes(gpu.id))
                .map((gpu) => (
                  <option key={gpu.id} value={gpu.id}>
                    {gpu.name}
                  </option>
                ))}
            </optgroup>
          </Select>

          {selectedGpus.length > 0 && (
            <Button
              color="light"
              onClick={() => setSelectedGpus([])}
              className="flex items-center gap-2 bg-fgpu-stone-600 hover:bg-fgpu-stone-700 text-fgpu-white"
            >
              <HiTrash />
              Clear All
            </Button>
          )}
        </div>
      </div>

      {selectedGpus.length > 0 && (
        <Tabs>
          <Tabs.Item
            title="Specifications"
            icon={HiDocumentText}
            active={activeTab === "specs"}
            onClick={() => handleTabChange("specs")}
          >
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-fgpu-gray-300 dark:border-fgpu-stone-700">
                    <th className="text-left py-2 text-fgpu-black dark:text-fgpu-white">Specification</th>
                    {selectedGpuData.map((gpu) => (
                      <th key={gpu.id} className="text-left py-2 text-fgpu-black dark:text-fgpu-white">
                        {gpu.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-fgpu-gray-300 dark:border-fgpu-stone-700">
                    <td className="py-2 text-fgpu-stone-600 dark:text-fgpu-gray-300">Card Type</td>
                    {selectedGpuData.map((gpu) => (
                      <td key={gpu.id} className="py-2 text-fgpu-stone-600 dark:text-fgpu-gray-300">
                        {gpu.cardType}
                      </td>
                    ))}
                  </tr>
                  {providerPaysOpex && (
                    <tr className="border-b border-fgpu-gray-300 dark:border-fgpu-stone-700 bg-fgpu-stone-600">
                      <td className="py-2 text-fgpu-volt dark:text-fgpu-volt font-medium">OPEX Model</td>
                      {selectedGpuData.map((gpu) => (
                        <td key={gpu.id} className="py-2 text-fgpu-volt dark:text-fgpu-volt">
                          Provider Pays
                        </td>
                      ))}
                    </tr>
                  )}
                  <tr className="border-b border-fgpu-gray-300 dark:border-fgpu-stone-700">
                    <td className="py-2 text-fgpu-stone-600 dark:text-fgpu-gray-300">Price</td>
                    {selectedGpuData.map((gpu) => (
                      <td key={gpu.id} className="py-2 text-fgpu-stone-600 dark:text-fgpu-gray-300">
                        ${gpu.price.toLocaleString()}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-fgpu-gray-300 dark:border-fgpu-stone-700">
                    <td className="py-2 text-fgpu-stone-600 dark:text-fgpu-gray-300">Performance (TFLOPS)</td>
                    {selectedGpuData.map((gpu) => (
                      <td key={gpu.id} className="py-2 text-fgpu-stone-600 dark:text-fgpu-gray-300">
                        {gpu.performance || "N/A"}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-fgpu-gray-300 dark:border-fgpu-stone-700">
                    <td className="py-2 text-fgpu-stone-600 dark:text-fgpu-gray-300">Memory (GB)</td>
                    {selectedGpuData.map((gpu) => (
                      <td key={gpu.id} className="py-2 text-fgpu-stone-600 dark:text-fgpu-gray-300">
                        {gpu.memory || "N/A"}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-fgpu-gray-300 dark:border-fgpu-stone-700">
                    <td className="py-2 text-fgpu-stone-600 dark:text-fgpu-gray-300">Power Consumption (W)</td>
                    {selectedGpuData.map((gpu) => (
                      <td key={gpu.id} className="py-2 text-fgpu-stone-600 dark:text-fgpu-gray-300">
                        {gpu.powerConsumption || "N/A"}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-fgpu-gray-300 dark:border-fgpu-stone-700">
                    <td className="py-2 text-fgpu-stone-600 dark:text-fgpu-gray-300">Spot Rate ($/hr)</td>
                    {selectedGpuData.map((gpu) => {
                      const rate = secureMode ? (gpu.secureSpot ?? "N/A") : (gpu.communitySpot ?? "N/A")
                      return (
                        <td key={gpu.id} className="py-2 text-fgpu-stone-600 dark:text-fgpu-gray-300">
                          {typeof rate === "number" ? `$${rate.toFixed(2)}` : rate}
                        </td>
                      )
                    })}
                  </tr>
                  <tr className="border-b border-fgpu-gray-300 dark:border-fgpu-stone-700">
                    <td className="py-2 text-fgpu-stone-600 dark:text-fgpu-gray-300">On-Demand Rate ($/hr)</td>
                    {selectedGpuData.map((gpu) => {
                      const rate = secureMode ? (gpu.secureOnDemand ?? "N/A") : (gpu.communityOnDemand ?? "N/A")
                      return (
                        <td key={gpu.id} className="py-2 text-fgpu-stone-600 dark:text-fgpu-gray-300">
                          {typeof rate === "number" ? `$${rate.toFixed(2)}` : rate}
                        </td>
                      )
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </Tabs.Item>

          <Tabs.Item
            title="Performance"
            icon={HiChartBar}
            active={activeTab === "performance"}
            onClick={() => handleTabChange("performance")}
          >
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#5A6250" />
                  <XAxis dataKey="name" stroke="#9AA38F" />
                  <YAxis stroke="#9AA38F" />
                  <Tooltip contentStyle={{ backgroundColor: "#1A1C17", color: "#FAFFF5", borderColor: "#34382E" }} />
                  <Legend />
                  <Bar dataKey="TFLOPS" fill={chartColors.primary} />
                  <Bar dataKey="Memory (GB)" fill={chartColors.secondary} />
                  <Bar dataKey="Power (W)" fill={chartColors.tertiary} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Tabs.Item>

          <Tabs.Item
            title="Financial"
            icon={HiCurrencyDollar}
            active={activeTab === "financial"}
            onClick={() => handleTabChange("financial")}
          >
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={financialData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#5A6250" />
                  <XAxis dataKey="name" stroke="#9AA38F" />
                  <YAxis stroke="#9AA38F" />
                  <Tooltip contentStyle={{ backgroundColor: "#1A1C17", color: "#FAFFF5", borderColor: "#34382E" }} />
                  <Legend />
                  <Bar dataKey="Initial Cost ($)" fill={chartColors.primary} />
                  <Bar dataKey="Annual Revenue ($)" fill={chartColors.secondary} />
                  <Bar dataKey="ROI (%)" fill={chartColors.tertiary} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Tabs.Item>
        </Tabs>
      )}
    </Card>
  )
}

