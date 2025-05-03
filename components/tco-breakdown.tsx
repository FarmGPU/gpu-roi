"use client"

import { useState } from "react"
import { Card, Label, Tooltip } from "flowbite-react"
import { Input } from "@/components/ui/input"
import {
  HiOutlineCurrencyDollar,
  HiOutlineLightningBolt,
  HiOutlineCloud,
  HiOutlineOfficeBuilding,
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
}

export function TCOBreakdown({
  initialCost,
  powerConsumption,
  idlePowerConsumption,
  idlePercentage,
  contractDuration,
}: TCOBreakdownProps) {
  // TCO configuration
  const [powerCost, setPowerCost] = useState(0.24) // per kWh
  const [rackspaceCost, setRackspaceCost] = useState(200) // per month per rack
  const [networkCost, setNetworkCost] = useState(200) // per month per rack
  const [gpusPerRack, setGpusPerRack] = useState(16) // GPUs per rack

  // Calculate weighted power consumption based on idle/active percentages
  const weightedPowerConsumption =
    (idlePercentage / 100) * idlePowerConsumption + ((100 - idlePercentage) / 100) * powerConsumption

  // Calculate costs
  const powerCostPerYear = (weightedPowerConsumption * 24 * 365 * powerCost) / 1000
  const rackspaceCostPerYear = (rackspaceCost * 12) / gpusPerRack
  const networkCostPerYear = (networkCost * 12) / gpusPerRack

  // Calculate hourly and monthly costs per GPU
  const totalAnnualCost = powerCostPerYear + rackspaceCostPerYear + networkCostPerYear
  const costPerHour = totalAnnualCost / (365 * 24)
  const costPerMonth = totalAnnualCost / 12

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-fgpu-stone-800 border-fgpu-stone-700">
          <h5 className="text-lg font-bold tracking-tight text-fgpu-white flex items-center gap-2">
            <HiOutlineCurrencyDollar className="text-fgpu-volt" />
            Provider Cost Configuration
          </h5>
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Label htmlFor="power-cost" className="text-fgpu-gray-300">Power Cost ($/kWh)</Label>
                <Tooltip content="Cost of electricity per kilowatt-hour">
                  <HiInformationCircle className="text-fgpu-gray-400" />
                </Tooltip>
              </div>
              <Input
                id="power-cost"
                type="number"
                value={powerCost}
                onChange={(e) => setPowerCost(Number(e.target.value))}
                min={0}
                step={0.01}
                className="dark:bg-fgpu-stone-700 dark:border-fgpu-stone-600 dark:text-white"
              />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <Label htmlFor="rackspace-cost" className="text-fgpu-gray-300">Rackspace Cost ($/month/rack)</Label>
                <Tooltip content="Monthly cost for rack space in the data center">
                  <HiInformationCircle className="text-fgpu-gray-400" />
                </Tooltip>
              </div>
              <Input
                id="rackspace-cost"
                type="number"
                value={rackspaceCost}
                onChange={(e) => setRackspaceCost(Number(e.target.value))}
                min={0}
                className="dark:bg-fgpu-stone-700 dark:border-fgpu-stone-600 dark:text-white"
              />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <Label htmlFor="network-cost" className="text-fgpu-gray-300">Network Cost ($/month/rack)</Label>
                <Tooltip content="Monthly cost for network bandwidth per rack">
                  <HiInformationCircle className="text-fgpu-gray-400" />
                </Tooltip>
              </div>
              <Input
                id="network-cost"
                type="number"
                value={networkCost}
                onChange={(e) => setNetworkCost(Number(e.target.value))}
                min={0}
                className="dark:bg-fgpu-stone-700 dark:border-fgpu-stone-600 dark:text-white"
              />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <Label htmlFor="gpus-per-rack" className="text-fgpu-gray-300">GPUs per Rack</Label>
                <Tooltip content="Number of GPUs that can be installed in a single rack">
                  <HiInformationCircle className="text-fgpu-gray-400" />
                </Tooltip>
              </div>
              <Input
                id="gpus-per-rack"
                type="number"
                value={gpusPerRack}
                onChange={(e) => setGpusPerRack(Number(e.target.value))}
                min={1}
                className="dark:bg-fgpu-stone-700 dark:border-fgpu-stone-600 dark:text-white"
              />
            </div>
          </div>
        </Card>

        <Card className="bg-fgpu-stone-800 border-fgpu-stone-700">
          <h5 className="text-lg font-bold tracking-tight text-fgpu-white flex items-center gap-2">
            <HiOutlineLightningBolt className="text-fgpu-volt" />
            Cost Summary
          </h5>
          <div className="space-y-6">
            <div className="p-4 bg-fgpu-stone-900 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <HiOutlineClock className="text-fgpu-volt" />
                <span className="text-fgpu-gray-300 font-medium">Cost per GPU per Hour</span>
              </div>
              <div className="text-2xl font-bold text-fgpu-volt">
                ${costPerHour.toFixed(3)}
              </div>
            </div>

            <div className="p-4 bg-fgpu-stone-900 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <HiOutlineCalendar className="text-fgpu-volt" />
                <span className="text-fgpu-gray-300 font-medium">Cost per GPU per Month</span>
              </div>
              <div className="text-2xl font-bold text-fgpu-volt">
                ${costPerMonth.toFixed(2)}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

