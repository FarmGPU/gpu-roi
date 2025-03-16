"use client"

import { Card } from "flowbite-react"
import {
  HiOutlineCurrencyDollar,
  HiOutlineLightningBolt,
  HiOutlineCloud,
  HiOutlineCog,
  HiOutlineOfficeBuilding,
  HiOutlineUserGroup,
} from "react-icons/hi"

interface CostBreakdownProps {
  initialCost: number
  powerCost: number
  coolingCost: number
  maintenanceCost: number
  rackspaceCost: number
  staffCost: number
  contractDuration: number
  providerPaysOpex?: boolean
}

export function CostBreakdown({
  initialCost,
  powerCost,
  coolingCost,
  maintenanceCost,
  rackspaceCost,
  staffCost,
  contractDuration,
  providerPaysOpex = false,
}: CostBreakdownProps) {
  const operationalCosts = {
    power: powerCost * contractDuration,
    cooling: coolingCost * contractDuration,
    maintenance: maintenanceCost * contractDuration,
    rackspace: rackspaceCost * contractDuration,
    staff: staffCost * contractDuration,
  }

  const totalOperationalCost = Object.values(operationalCosts).reduce((sum, cost) => sum + cost, 0)
  const totalCost = providerPaysOpex ? initialCost : initialCost + totalOperationalCost

  // FarmGPU brand colors for cost items
  const costColors = {
    initialCost: "bg-fgpu-volt",
    power: "bg-fgpu-volt-light",
    cooling: "bg-fgpu-volt-lighter",
    maintenance: "bg-fgpu-volt-dark",
    rackspace: "bg-fgpu-stone-300",
    staff: "bg-fgpu-stone-400",
  }

  // Calculate percentages for the pie chart
  const costItems = [
    { name: "Initial Cost", value: initialCost, color: costColors.initialCost, icon: HiOutlineCurrencyDollar },
    { name: "Power", value: operationalCosts.power, color: costColors.power, icon: HiOutlineLightningBolt },
    { name: "Cooling", value: operationalCosts.cooling, color: costColors.cooling, icon: HiOutlineCloud },
    { name: "Maintenance", value: operationalCosts.maintenance, color: costColors.maintenance, icon: HiOutlineCog },
    {
      name: "Rackspace",
      value: operationalCosts.rackspace,
      color: costColors.rackspace,
      icon: HiOutlineOfficeBuilding,
    },
    { name: "Staff", value: operationalCosts.staff, color: costColors.staff, icon: HiOutlineUserGroup },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="bg-white dark:bg-fgpu-stone-900">
        <h3 className="text-lg font-medium mb-4 flex items-center gap-2 text-fgpu-black dark:text-fgpu-white">
          <HiOutlineCurrencyDollar className="text-fgpu-volt" />
          Cost Breakdown
        </h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm flex items-center gap-1 text-fgpu-stone-600 dark:text-fgpu-gray-300">
                <HiOutlineCurrencyDollar className="text-fgpu-volt" />
                Initial Cost (Owner)
              </span>
              <span className="text-sm font-medium text-fgpu-stone-600 dark:text-fgpu-gray-300">
                ${initialCost.toLocaleString()}
              </span>
            </div>
            <div className="w-full bg-fgpu-stone-200 dark:bg-fgpu-stone-700 rounded-full h-2.5">
              <div
                className={`${costColors.initialCost} h-2.5 rounded-full`}
                style={{ width: providerPaysOpex ? "100%" : `${(initialCost / totalCost) * 100}%` }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm flex items-center gap-1 text-fgpu-stone-600 dark:text-fgpu-gray-300">
                <HiOutlineLightningBolt className="text-fgpu-volt-light" />
                Power Cost {providerPaysOpex ? "(Provider)" : "(Owner)"}
              </span>
              <span className="text-sm font-medium text-fgpu-stone-600 dark:text-fgpu-gray-300">
                ${operationalCosts.power.toLocaleString()}
              </span>
            </div>
            <div className="w-full bg-fgpu-stone-200 dark:bg-fgpu-stone-700 rounded-full h-2.5">
              <div
                className={`${costColors.power} h-2.5 rounded-full`}
                style={{ width: providerPaysOpex ? "0%" : `${(operationalCosts.power / totalCost) * 100}%` }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm flex items-center gap-1 text-fgpu-stone-600 dark:text-fgpu-gray-300">
                <HiOutlineCloud className="text-fgpu-volt-lighter" />
                Cooling Cost {providerPaysOpex ? "(Provider)" : "(Owner)"}
              </span>
              <span className="text-sm font-medium text-fgpu-stone-600 dark:text-fgpu-gray-300">
                ${operationalCosts.cooling.toLocaleString()}
              </span>
            </div>
            <div className="w-full bg-fgpu-stone-200 dark:bg-fgpu-stone-700 rounded-full h-2.5">
              <div
                className={`${costColors.cooling} h-2.5 rounded-full`}
                style={{ width: providerPaysOpex ? "0%" : `${(operationalCosts.cooling / totalCost) * 100}%` }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm flex items-center gap-1 text-fgpu-stone-600 dark:text-fgpu-gray-300">
                <HiOutlineCog className="text-fgpu-volt-dark" />
                Maintenance {providerPaysOpex ? "(Provider)" : "(Owner)"}
              </span>
              <span className="text-sm font-medium text-fgpu-stone-600 dark:text-fgpu-gray-300">
                ${operationalCosts.maintenance.toLocaleString()}
              </span>
            </div>
            <div className="w-full bg-fgpu-stone-200 dark:bg-fgpu-stone-700 rounded-full h-2.5">
              <div
                className={`${costColors.maintenance} h-2.5 rounded-full`}
                style={{ width: providerPaysOpex ? "0%" : `${(operationalCosts.maintenance / totalCost) * 100}%` }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm flex items-center gap-1 text-fgpu-stone-600 dark:text-fgpu-gray-300">
                <HiOutlineOfficeBuilding className="text-fgpu-stone-300" />
                Rackspace {providerPaysOpex ? "(Provider)" : "(Owner)"}
              </span>
              <span className="text-sm font-medium text-fgpu-stone-600 dark:text-fgpu-gray-300">
                ${operationalCosts.rackspace.toLocaleString()}
              </span>
            </div>
            <div className="w-full bg-fgpu-stone-200 dark:bg-fgpu-stone-700 rounded-full h-2.5">
              <div
                className={`${costColors.rackspace} h-2.5 rounded-full`}
                style={{ width: providerPaysOpex ? "0%" : `${(operationalCosts.rackspace / totalCost) * 100}%` }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm flex items-center gap-1 text-fgpu-stone-600 dark:text-fgpu-gray-300">
                <HiOutlineUserGroup className="text-fgpu-stone-400" />
                Staff {providerPaysOpex ? "(Provider)" : "(Owner)"}
              </span>
              <span className="text-sm font-medium text-fgpu-stone-600 dark:text-fgpu-gray-300">
                ${operationalCosts.staff.toLocaleString()}
              </span>
            </div>
            <div className="w-full bg-fgpu-stone-200 dark:bg-fgpu-stone-700 rounded-full h-2.5">
              <div
                className={`${costColors.staff} h-2.5 rounded-full`}
                style={{ width: providerPaysOpex ? "0%" : `${(operationalCosts.staff / totalCost) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="pt-4 border-t border-fgpu-stone-200 dark:border-fgpu-stone-700">
            <div className="flex justify-between mb-1">
              <span className="font-medium flex items-center gap-1 text-fgpu-stone-600 dark:text-fgpu-gray-300">
                <HiOutlineCurrencyDollar />
                Total Cost (TCO)
              </span>
              <span className="font-medium text-fgpu-stone-600 dark:text-fgpu-gray-300">
                ${totalCost.toLocaleString()}
              </span>
            </div>
            {providerPaysOpex && (
              <p className="text-xs text-fgpu-stone-500 dark:text-fgpu-stone-400 italic mt-1">
                Note: In this model, the provider pays for all operational expenses.
              </p>
            )}
          </div>
        </div>
      </Card>

      <Card className="bg-white dark:bg-fgpu-stone-900">
        <h3 className="text-lg font-medium mb-4 flex items-center gap-2 text-fgpu-black dark:text-fgpu-white">
          <HiOutlineCurrencyDollar className="text-fgpu-volt" />
          Cost Distribution
        </h3>
        {providerPaysOpex ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-center mb-4">
              <p className="text-lg font-medium text-fgpu-black dark:text-fgpu-white">100% Initial Cost</p>
              <p className="text-sm text-fgpu-stone-500 dark:text-fgpu-stone-400">${initialCost.toLocaleString()}</p>
            </div>
            <p className="text-sm text-fgpu-stone-500 dark:text-fgpu-stone-400 italic">
              In this model, the owner only pays for the initial GPU cost.
              <br />
              All operational expenses are covered by the provider.
            </p>
          </div>
        ) : (
          <div className="h-80 flex items-center justify-center">
            <div className="relative w-64 h-64">
              {/* Simple pie chart using CSS conic-gradient */}
              <div
                className="w-full h-full rounded-full"
                style={{
                  background: `conic-gradient(
                    ${costColors.initialCost} 0% ${(initialCost / totalCost) * 100}%, 
                    ${costColors.power} ${(initialCost / totalCost) * 100}% ${(initialCost / totalCost) * 100 + (operationalCosts.power / totalCost) * 100}%, 
                    ${costColors.cooling} ${(initialCost / totalCost) * 100 + (operationalCosts.power / totalCost) * 100}% ${(initialCost / totalCost) * 100 + (operationalCosts.power / totalCost) * 100 + (operationalCosts.cooling / totalCost) * 100}%,
                    ${costColors.maintenance} ${(initialCost / totalCost) * 100 + (operationalCosts.power / totalCost) * 100 + (operationalCosts.cooling / totalCost) * 100}% ${(initialCost / totalCost) * 100 + (operationalCosts.power / totalCost) * 100 + (operationalCosts.cooling / totalCost) * 100 + (operationalCosts.maintenance / totalCost) * 100}%,
                    ${costColors.rackspace} ${(initialCost / totalCost) * 100 + (operationalCosts.power / totalCost) * 100 + (operationalCosts.cooling / totalCost) * 100 + (operationalCosts.maintenance / totalCost) * 100}% ${(initialCost / totalCost) * 100 + (operationalCosts.power / totalCost) * 100 + (operationalCosts.cooling / totalCost) * 100 + (operationalCosts.maintenance / totalCost) * 100 + (operationalCosts.rackspace / totalCost) * 100}%,
                    ${costColors.staff} ${(initialCost / totalCost) * 100 + (operationalCosts.power / totalCost) * 100 + (operationalCosts.cooling / totalCost) * 100 + (operationalCosts.maintenance / totalCost) * 100 + (operationalCosts.rackspace / totalCost) * 100}% 100%
                  )`,
                }}
              >
                <div className="absolute inset-0 rounded-full bg-white dark:bg-fgpu-stone-900 m-10"></div>
              </div>

              {/* Legend */}
              <div className="mt-8 grid grid-cols-2 gap-2">
                {costItems.map((item, index) => (
                  <div key={index} className="flex items-center">
                    <div className={`w-3 h-3 rounded-full ${item.color} mr-2`}></div>
                    <span className="text-xs text-fgpu-stone-600 dark:text-fgpu-gray-300">
                      {item.name}: {((item.value / totalCost) * 100).toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}

