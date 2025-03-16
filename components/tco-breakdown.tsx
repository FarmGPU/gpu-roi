"use client"

import { useState, useEffect, useRef } from "react"
import { Card, TextInput, Label, Tooltip } from "flowbite-react"
import {
  HiOutlineCurrencyDollar,
  HiOutlineLightningBolt,
  HiOutlineCloud,
  HiOutlineCog,
  HiOutlineOfficeBuilding,
  HiOutlineUserGroup,
  HiInformationCircle,
  HiOutlineClock,
  HiOutlineCalendar,
} from "react-icons/hi"

interface TCOBreakdownProps {
  initialCost: number
  powerConsumption: number
  idlePowerConsumption: number
  idlePercentage: number
  contractDuration: number
  providerPaysOpex?: boolean
}

export function TCOBreakdown({
  initialCost,
  powerConsumption,
  idlePowerConsumption,
  idlePercentage,
  contractDuration,
  providerPaysOpex = false,
}: TCOBreakdownProps) {
  // Chart container refs
  const perRackChartRef = useRef<HTMLDivElement>(null)
  const perGpuChartRef = useRef<HTMLDivElement>(null)

  // TCO configuration
  const [powerCost, setPowerCost] = useState(0.12) // per kWh
  const [rackspaceCost, setRackspaceCost] = useState(200) // per month per rack
  const [networkCost, setNetworkCost] = useState(200) // per month per rack
  const [gpusPerRack, setGpusPerRack] = useState(16) // GPUs per rack
  const [coolingFactor, setCoolingFactor] = useState(0) // Cooling is included in rackspace cost
  const [maintenancePercentage, setMaintenancePercentage] = useState(0) // 0% of initial cost by default
  const [staffCostPerRack, setStaffCostPerRack] = useState(0) // annual cost per rack

  // Calculate weighted power consumption based on idle/active percentages
  const weightedPowerConsumption =
    (idlePercentage / 100) * idlePowerConsumption + ((100 - idlePercentage) / 100) * powerConsumption

  // Calculate costs
  const powerCostPerYear = (weightedPowerConsumption * 24 * 365 * powerCost) / 1000
  const rackspaceCostPerYear = (rackspaceCost * 12) / gpusPerRack
  const networkCostPerYear = (networkCost * 12) / gpusPerRack
  const coolingCost = powerCostPerYear * coolingFactor
  const maintenanceCost = initialCost * (maintenancePercentage / 100)
  const staffCost = staffCostPerRack / gpusPerRack

  const operationalCosts = {
    power: powerCostPerYear * contractDuration,
    cooling: coolingCost * contractDuration,
    maintenance: maintenanceCost * contractDuration,
    rackspace: rackspaceCostPerYear * contractDuration,
    network: networkCostPerYear * contractDuration,
    staff: staffCost * contractDuration,
  }

  const totalOperationalCost = Object.values(operationalCosts).reduce((sum, cost) => sum + cost, 0)
  const totalCost = providerPaysOpex ? initialCost : initialCost + totalOperationalCost

  // Calculate OPEX per hour and per month
  const totalAnnualOpex = powerCostPerYear + coolingCost + maintenanceCost + rackspaceCostPerYear + networkCostPerYear + staffCost
  const opexPerHour = totalAnnualOpex / (365 * 24)
  const opexPerMonth = totalAnnualOpex / 12

  // Add a note about who pays for OPEX
  const opexNote = providerPaysOpex
    ? "Note: In this model, the provider (data center) pays for all operational expenses."
    : "Note: In this model, the owner (investor) pays for all operational expenses."

  // Prepare data for charts
  const breakdownData = [
    { name: "Power", value: operationalCosts.power, color: "bg-fgpu-volt-light" },
    { name: "Cooling", value: operationalCosts.cooling, color: "bg-fgpu-volt-lighter" },
    { name: "Maintenance", value: operationalCosts.maintenance, color: "bg-fgpu-volt-dark" },
    { name: "Rackspace", value: operationalCosts.rackspace, color: "bg-fgpu-stone-300" },
    { name: "Network", value: operationalCosts.network, color: "bg-fgpu-stone-500" },
    { name: "Staff", value: operationalCosts.staff, color: "bg-fgpu-stone-400" },
  ]

  // Find the maximum value for scaling
  const maxBreakdownValue = Math.max(...breakdownData.map((item) => item.value))

  // Initialize ApexCharts for TCO breakdown
  useEffect(() => {
    if (typeof window !== "undefined" && window.ApexCharts) {
      // Per Rack Chart
      if (perRackChartRef.current) {
        // Clear any existing chart
        while (perRackChartRef.current.firstChild) {
          perRackChartRef.current.firstChild.remove()
        }

        const perRackTotal = Object.values(operationalCosts).reduce((sum, cost) => sum + cost, 0) * gpusPerRack
        const perRackData = breakdownData.map((item) => item.value * gpusPerRack)
        const perRackLabels = breakdownData.map((item) => item.name)

        const perRackColors = ["#B8FF66", "#CFFF99", "#66CC00", "#747E67", "#67705C"]

        const perRackOptions = {
          series: perRackData,
          colors: perRackColors,
          chart: {
            height: 320,
            width: "100%",
            type: "donut",
            fontFamily:
              "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
          },
          stroke: {
            colors: ["transparent"],
          },
          plotOptions: {
            pie: {
              donut: {
                labels: {
                  show: true,
                  name: {
                    show: true,
                    fontFamily:
                      "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                    offsetY: 20,
                  },
                  total: {
                    showAlways: true,
                    show: true,
                    label: "Total Per Rack",
                    fontFamily:
                      "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                    formatter: (w: { globals: { seriesTotals: number[] } }) => {
                      const sum = w.globals.seriesTotals.reduce((a: number, b: number) => {
                        return a + b
                      }, 0)
                      return "$" + sum.toLocaleString()
                    },
                  },
                  value: {
                    show: true,
                    fontFamily:
                      "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                    offsetY: -20,
                    formatter: (value: number) => "$" + value.toLocaleString(),
                  },
                },
                size: "80%",
              },
            },
          },
          grid: {
            padding: {
              top: -2,
            },
          },
          labels: perRackLabels,
          dataLabels: {
            enabled: false,
          },
          legend: {
            position: "bottom",
            fontFamily:
              "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
          },
          tooltip: {
            enabled: true,
            y: {
              formatter: (val: number) => "$" + val.toFixed(2),
            },
            theme: "dark",
            style: {
              fontSize: "12px",
              fontFamily:
                "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
            },
          },
        }

        try {
          const perRackChart = new window.ApexCharts(perRackChartRef.current, perRackOptions)
          perRackChart.render()
        } catch (error) {
          console.error("Error rendering per rack chart:", error)
        }

        // Per GPU Chart
        if (perGpuChartRef.current) {
          // Clear any existing chart
          while (perGpuChartRef.current.firstChild) {
            perGpuChartRef.current.firstChild.remove()
          }

          const perGpuData = breakdownData.map((item) => item.value)
          const perGpuLabels = breakdownData.map((item) => item.name)

          const perGpuColors = ["#B8FF66", "#CFFF99", "#66CC00", "#747E67", "#67705C"]

          const perGpuOptions = {
            series: perGpuData,
            colors: perGpuColors,
            chart: {
              height: 320,
              width: "100%",
              type: "donut",
              fontFamily:
                "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
            },
            stroke: {
              colors: ["transparent"],
            },
            plotOptions: {
              pie: {
                donut: {
                  labels: {
                    show: true,
                    name: {
                      show: true,
                      fontFamily:
                        "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                      offsetY: 20,
                    },
                    total: {
                      showAlways: true,
                      show: true,
                      label: "Total Per GPU",
                      fontFamily:
                        "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                      formatter: (w: { globals: { seriesTotals: number[] } }) => {
                        const sum = w.globals.seriesTotals.reduce((a: number, b: number) => {
                          return a + b
                        }, 0)
                        return "$" + sum.toLocaleString()
                      },
                    },
                    value: {
                      show: true,
                      fontFamily:
                        "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                      offsetY: -20,
                      formatter: (value: number) => "$" + value.toLocaleString(),
                    },
                  },
                  size: "80%",
                },
              },
            },
            grid: {
              padding: {
                top: -2,
              },
            },
            labels: perGpuLabels,
            dataLabels: {
              enabled: false,
            },
            legend: {
              position: "bottom",
              fontFamily:
                "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
            },
            tooltip: {
              enabled: true,
              y: {
                formatter: (val: number) => "$" + val.toFixed(2),
              },
              theme: "dark",
              style: {
                fontSize: "12px",
                fontFamily:
                  "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
              },
            },
          }

          try {
            const perGpuChart = new window.ApexCharts(perGpuChartRef.current, perGpuOptions)
            perGpuChart.render()
          } catch (error) {
            console.error("Error rendering per GPU chart:", error)
          }
        }
      }
    }
  }, [
    powerCost,
    rackspaceCost,
    gpusPerRack,
    coolingFactor,
    maintenancePercentage,
    staffCostPerRack,
    initialCost,
    powerConsumption,
    idlePowerConsumption,
    idlePercentage,
    contractDuration,
    providerPaysOpex,
  ])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-white dark:bg-fgpu-stone-900">
          <h3 className="text-lg font-medium mb-4 flex items-center gap-2 text-fgpu-black dark:text-fgpu-white">
            <HiOutlineCurrencyDollar className="text-fgpu-volt" />
            Provider Cost Configuration
          </h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <HiOutlineLightningBolt className="text-fgpu-stone-500 dark:text-fgpu-gray-400" />
                <Label
                  htmlFor="power-cost"
                  value="Power Cost ($/kWh)"
                  className="text-fgpu-stone-600 dark:text-fgpu-gray-300"
                />
                <Tooltip content="Average electricity cost per kilowatt-hour">
                  <HiInformationCircle className="text-gray-400" />
                </Tooltip>
              </div>
              <TextInput
                id="power-cost"
                type="number"
                step="0.01"
                min="0.01"
                value={powerCost}
                onChange={(e) => setPowerCost(Number.parseFloat(e.target.value))}
                className="bg-white dark:bg-gray-700 text-fgpu-black dark:text-fgpu-white"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <HiOutlineOfficeBuilding className="text-fgpu-stone-500 dark:text-fgpu-gray-400" />
                <Label
                  htmlFor="rackspace-cost"
                  value="Rackspace Cost ($/month/rack)"
                  className="text-fgpu-stone-600 dark:text-fgpu-gray-300"
                />
                <Tooltip content="Monthly cost for a full rack in the data center">
                  <HiInformationCircle className="text-gray-400" />
                </Tooltip>
              </div>
              <TextInput
                id="rackspace-cost"
                type="number"
                step="100"
                min="0"
                value={rackspaceCost}
                onChange={(e) => setRackspaceCost(Number.parseFloat(e.target.value))}
                className="bg-white dark:bg-gray-700 text-fgpu-black dark:text-fgpu-white"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <HiOutlineOfficeBuilding className="text-fgpu-stone-500 dark:text-fgpu-gray-400" />
                <Label
                  htmlFor="network-cost"
                  value="Network Cost ($/month/rack)"
                  className="text-fgpu-stone-600 dark:text-fgpu-gray-300"
                />
                <Tooltip content="Monthly cost for network infrastructure in the data center">
                  <HiInformationCircle className="text-gray-400" />
                </Tooltip>
              </div>
              <TextInput
                id="network-cost"
                type="number"
                step="100"
                min="0"
                value={networkCost}
                onChange={(e) => setNetworkCost(Number.parseFloat(e.target.value))}
                className="bg-white dark:bg-gray-700 text-fgpu-black dark:text-fgpu-white"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <HiOutlineOfficeBuilding className="text-fgpu-stone-500 dark:text-fgpu-gray-400" />
                <Label
                  htmlFor="gpus-per-rack"
                  value="GPUs per Rack"
                  className="text-fgpu-stone-600 dark:text-fgpu-gray-300"
                />
                <Tooltip content="Number of GPUs that can fit in a single rack">
                  <HiInformationCircle className="text-gray-400" />
                </Tooltip>
              </div>
              <TextInput
                id="gpus-per-rack"
                type="number"
                step="1"
                min="1"
                max="48"
                value={gpusPerRack}
                onChange={(e) => setGpusPerRack(Number.parseInt(e.target.value))}
                className="bg-white dark:bg-gray-700 text-fgpu-black dark:text-fgpu-white"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <HiOutlineCloud className="text-fgpu-stone-500 dark:text-fgpu-gray-400" />
                <Label
                  htmlFor="cooling-factor"
                  value="Cooling Factor (% of power)"
                  className="text-fgpu-stone-600 dark:text-fgpu-gray-300"
                />
                <Tooltip content="Cooling cost as a percentage of power cost (set to 0 as cooling is included in rackspace cost)">
                  <HiInformationCircle className="text-gray-400" />
                </Tooltip>
              </div>
              <TextInput
                id="cooling-factor"
                type="number"
                step="0.05"
                min="0"
                max="1"
                value={coolingFactor}
                onChange={(e) => setCoolingFactor(Number.parseFloat(e.target.value))}
                className="bg-white dark:bg-gray-700 text-fgpu-black dark:text-fgpu-white"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <HiOutlineCog className="text-fgpu-stone-500 dark:text-fgpu-gray-400" />
                <Label
                  htmlFor="maintenance-percentage"
                  value="Maintenance (% of initial cost)"
                  className="text-fgpu-stone-600 dark:text-fgpu-gray-300"
                />
                <Tooltip content="Annual maintenance cost as a percentage of initial GPU cost">
                  <HiInformationCircle className="text-gray-400" />
                </Tooltip>
              </div>
              <TextInput
                id="maintenance-percentage"
                type="number"
                step="1"
                min="0"
                max="20"
                value={maintenancePercentage}
                onChange={(e) => setMaintenancePercentage(Number.parseInt(e.target.value))}
                className="bg-white dark:bg-gray-700 text-fgpu-black dark:text-fgpu-white"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <HiOutlineUserGroup className="text-fgpu-stone-500 dark:text-fgpu-gray-400" />
                <Label
                  htmlFor="staff-cost"
                  value="Staff Cost ($/year/rack)"
                  className="text-fgpu-stone-600 dark:text-fgpu-gray-300"
                />
                <Tooltip content="Annual staff cost per rack">
                  <HiInformationCircle className="text-gray-400" />
                </Tooltip>
              </div>
              <TextInput
                id="staff-cost"
                type="number"
                step="500"
                min="0"
                value={staffCostPerRack}
                onChange={(e) => setStaffCostPerRack(Number.parseInt(e.target.value))}
                className="bg-white dark:bg-gray-700 text-fgpu-black dark:text-fgpu-white"
              />
            </div>
          </div>
        </Card>

        <Card className="bg-white dark:bg-fgpu-stone-900">
          <h3 className="text-lg font-medium mb-4 flex items-center gap-2 text-fgpu-black dark:text-fgpu-white">
            <HiOutlineCurrencyDollar className="text-fgpu-volt" />
            Provider OPEX Metrics
          </h3>

          <div className="grid grid-cols-1 gap-4">
            <div className="p-4 bg-fgpu-gray-100 dark:bg-fgpu-stone-800 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium flex items-center gap-2 text-fgpu-stone-600 dark:text-fgpu-gray-300">
                  <HiOutlineClock className="text-fgpu-volt" />
                  OPEX per GPU per Hour
                </h4>
              </div>
              <p className="text-2xl font-bold text-fgpu-black dark:text-fgpu-white">${opexPerHour.toFixed(3)}</p>
              <p className="text-sm text-fgpu-stone-500 dark:text-fgpu-stone-400">
                Total operational expenses divided by hours in a year
              </p>
            </div>

            <div className="p-4 bg-fgpu-gray-100 dark:bg-fgpu-stone-800 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium flex items-center gap-2 text-fgpu-stone-600 dark:text-fgpu-gray-300">
                  <HiOutlineCalendar className="text-fgpu-volt" />
                  OPEX per GPU per Month
                </h4>
              </div>
              <p className="text-2xl font-bold text-fgpu-black dark:text-fgpu-white">${opexPerMonth.toFixed(2)}</p>
              <p className="text-sm text-fgpu-stone-500 dark:text-fgpu-stone-400">
                Total operational expenses divided by months in a year
              </p>
            </div>

            <div className="p-4 bg-fgpu-gray-100 dark:bg-fgpu-stone-800 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium flex items-center gap-2 text-fgpu-stone-600 dark:text-fgpu-gray-300">
                  <HiOutlineCurrencyDollar className="text-fgpu-volt" />
                  Annual OPEX per GPU
                </h4>
              </div>
              <p className="text-2xl font-bold text-fgpu-black dark:text-fgpu-white">${totalAnnualOpex.toFixed(2)}</p>
              <p className="text-sm text-fgpu-stone-500 dark:text-fgpu-stone-400">
                Total operational expenses per year
              </p>
            </div>

            <div className="p-4 bg-fgpu-gray-100 dark:bg-fgpu-stone-800 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium flex items-center gap-2 text-fgpu-stone-600 dark:text-fgpu-gray-300">
                  <HiOutlineCurrencyDollar className="text-fgpu-volt" />
                  Total OPEX (Contract Duration)
                </h4>
              </div>
              <p className="text-2xl font-bold text-fgpu-black dark:text-fgpu-white">
                ${totalOperationalCost.toFixed(2)}
              </p>
              <p className="text-sm text-fgpu-stone-500 dark:text-fgpu-stone-400">
                Total operational expenses over {contractDuration} {contractDuration === 1 ? "year" : "years"}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-white dark:bg-fgpu-stone-900">
          <h3 className="text-lg font-medium mb-4 text-fgpu-black dark:text-fgpu-white flex items-center gap-2">
            <HiOutlineCurrencyDollar className="text-fgpu-volt" />
            TCO Per Rack Breakdown
          </h3>
          <div className="h-80" ref={perRackChartRef}>
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fgpu-volt mx-auto mb-4"></div>
                <p className="text-fgpu-stone-500 dark:text-fgpu-stone-400">Loading chart...</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="bg-white dark:bg-fgpu-stone-900">
          <h3 className="text-lg font-medium mb-4 text-fgpu-black dark:text-fgpu-white flex items-center gap-2">
            <HiOutlineCurrencyDollar className="text-fgpu-volt" />
            TCO Per GPU Breakdown
          </h3>
          <div className="h-80" ref={perGpuChartRef}>
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fgpu-volt mx-auto mb-4"></div>
                <p className="text-fgpu-stone-500 dark:text-fgpu-stone-400">Loading chart...</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card className="bg-white dark:bg-fgpu-stone-900">
        <h3 className="text-lg font-medium mb-4 text-fgpu-black dark:text-fgpu-white flex items-center gap-2">
          <HiOutlineCurrencyDollar className="text-fgpu-volt" />
          OPEX Breakdown
        </h3>
        <div className="h-80">
          <div className="h-full flex flex-col justify-around">
            {breakdownData.map((item, index) => (
              <div key={index} className="flex items-center mb-2">
                <div className="w-24 text-sm text-fgpu-stone-600 dark:text-fgpu-gray-300">{item.name}</div>
                <div className="flex-1 mx-2">
                  <div className="w-full bg-fgpu-stone-200 dark:bg-fgpu-stone-700 rounded-full h-4">
                    <div
                      className={`${item.color} h-4 rounded-full`}
                      style={{ width: `${(item.value / maxBreakdownValue) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="w-24 text-right text-sm text-fgpu-stone-600 dark:text-fgpu-gray-300">
                  ${item.value.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-white dark:bg-fgpu-stone-900">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium flex items-center gap-2 text-fgpu-stone-600 dark:text-fgpu-gray-300">
              <HiOutlineLightningBolt className="text-fgpu-volt-light" />
              Power Costs
            </h3>
          </div>
          <p className="text-2xl font-bold text-fgpu-black dark:text-fgpu-white">
            ${operationalCosts.power.toLocaleString()}
          </p>
          <p className="text-sm text-fgpu-stone-500 dark:text-fgpu-stone-400">
            ${powerCostPerYear.toLocaleString()} per year
          </p>
        </Card>

        <Card className="bg-white dark:bg-fgpu-stone-900">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium flex items-center gap-2 text-fgpu-stone-600 dark:text-fgpu-gray-300">
              <HiOutlineCloud className="text-fgpu-volt-lighter" />
              Cooling Costs
            </h3>
          </div>
          <p className="text-2xl font-bold text-fgpu-black dark:text-fgpu-white">
            ${operationalCosts.cooling.toLocaleString()}
          </p>
          <p className="text-sm text-fgpu-stone-500 dark:text-fgpu-stone-400">
            ${coolingCost.toLocaleString()} per year
          </p>
        </Card>

        <Card className="bg-white dark:bg-fgpu-stone-900">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium flex items-center gap-2 text-fgpu-stone-600 dark:text-fgpu-gray-300">
              <HiOutlineCog className="text-fgpu-volt-dark" />
              Maintenance Costs
            </h3>
          </div>
          <p className="text-2xl font-bold text-fgpu-black dark:text-fgpu-white">
            ${operationalCosts.maintenance.toLocaleString()}
          </p>
          <p className="text-sm text-fgpu-stone-500 dark:text-fgpu-stone-400">
            ${maintenanceCost.toLocaleString()} per year
          </p>
        </Card>

        <Card className="bg-white dark:bg-fgpu-stone-900">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium flex items-center gap-2 text-fgpu-stone-600 dark:text-fgpu-gray-300">
              <HiOutlineOfficeBuilding className="text-fgpu-stone-300" />
              Rackspace Costs
            </h3>
          </div>
          <p className="text-2xl font-bold text-fgpu-black dark:text-fgpu-white">
            ${operationalCosts.rackspace.toLocaleString()}
          </p>
          <p className="text-sm text-fgpu-stone-500 dark:text-fgpu-stone-400">
            ${rackspaceCostPerYear.toLocaleString()} per year
          </p>
        </Card>

        <Card className="bg-white dark:bg-fgpu-stone-900">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium flex items-center gap-2 text-fgpu-stone-600 dark:text-fgpu-gray-300">
              <HiOutlineOfficeBuilding className="text-fgpu-stone-300" />
              Network Costs
            </h3>
          </div>
          <p className="text-2xl font-bold text-fgpu-black dark:text-fgpu-white">
            ${operationalCosts.network.toLocaleString()}
          </p>
          <p className="text-sm text-fgpu-stone-500 dark:text-fgpu-stone-400">
            ${networkCostPerYear.toLocaleString()} per year
          </p>
        </Card>
      </div>
    </div>
  )
}

