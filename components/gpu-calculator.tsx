"use client"

import { useState, useMemo, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { gpuData, GPU } from "@/data/gpu-data"
import { Slider } from "@/components/ui/slider"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import { HiOutlineQuestionMarkCircle, HiOutlineTrendingUp, HiOutlineCurrencyDollar, HiOutlineClock, HiOutlineFire, HiOutlineAdjustments, HiServer, HiLightningBolt, HiCash } from "react-icons/hi"
import { FinancialMetrics } from "@/components/financial-metrics"
import { TCOBreakdown } from "@/components/tco-breakdown"
import {
  HiChip,
  HiClock,
  HiCurrencyDollar,
  HiRefresh,
  HiInformationCircle,
  HiShieldCheck,
} from "react-icons/hi"

// Helper function to calculate IRR using an iterative approach (Newton-Raphson)
const calculateIRR = (cashFlows: number[], guess = 0.1, maxIterations = 100, tolerance = 1e-6): number | null => {
  let rate = guess;

  for (let i = 0; i < maxIterations; i++) {
    let npv = 0;
    let dNpv = 0; // Derivative of NPV with respect to rate

    cashFlows.forEach((cf, t) => {
      npv += cf / Math.pow(1 + rate, t);
      if (t > 0) {
        dNpv -= (t * cf) / Math.pow(1 + rate, t + 1);
      }
    });

    if (Math.abs(npv) < tolerance) {
      return rate; // Found a satisfactory rate
    }

    if (dNpv === 0) {
        // Avoid division by zero if the derivative is zero
        // This might happen with certain cash flow patterns or if the guess is far off
        // Try a slightly different guess or return null if it persists
        rate += (npv > 0 ? 0.01 : -0.01); // Perturb the rate slightly
        if (i > 5) return null; // Give up after a few attempts
        continue;
    }


    const newRate = rate - npv / dNpv;

     if (isNaN(newRate) || !isFinite(newRate)) {
      // Handle cases where the calculation results in NaN or Infinity
      return null;
    }


    // Basic check to prevent wild jumps, though Newton-Raphson can be sensitive
    if (Math.abs(newRate - rate) < tolerance * Math.abs(newRate)) {
         // If the change is very small relative to the rate, consider it converged
         // This helps prevent issues if NPV itself is large but the derivative is also large
         if (Math.abs(npv) < tolerance * 10) { // Check if NPV is also reasonably small
            return newRate;
         }
         // If NPV is still large despite small rate change, might be stuck or no solution near guess
        // return null; // Or try a different perturbation strategy
    }


    rate = newRate;
  }

  return null; // Failed to converge
};

export function GpuCalculator() {
  const [selectedGpu, setSelectedGpu] = useState(gpuData[0].id)
  const [contractDuration, setContractDuration] = useState(3)
  const [idlePercentage, setIdlePercentage] = useState(5)
  const [spotPercentage, setSpotPercentage] = useState(10)
  const [onDemandPercentage, setOnDemandPercentage] = useState(85)
  const [secureMode, setSecureMode] = useState(true)
  const [platformFeePercentage, setPlatformFeePercentage] = useState(20)
  const [ownerSharePercentage, setOwnerSharePercentage] = useState(() => {
    const gpu = gpuData.find((g) => g.id === selectedGpu) || gpuData[0]
    return gpu.cardType === "Consumer" ? 50 : 70
  })
  const [activeTab, setActiveTab] = useState("overview")
  const [utilization, setUtilization] = useState(100)
  const [hostingCost, setHostingCost] = useState(0.1) // $/hr
  const [rentalRateMultiplier, setRentalRateMultiplier] = useState(1)
  const [advancedMode, setAdvancedMode] = useState(false) // State for advanced mode
  const [residualValues, setResidualValues] = useState({ // State for residual values
    year1: 0.60,
    year2: 0.40,
    year3: 0.25,
  })
  const [rentalType, setRentalType] = useState<"community" | "secure">("secure");
  const [utilizationPercentages, setUtilizationPercentages] = useState({ idle: 10, spot: 30, onDemand: 60 });
  const [revenueSplit, setRevenueSplit] = useState({ platform: 10, owner: 80, provider: 10 });
  const [powerCost, setPowerCost] = useState(0.15); // $/kWh
  const [serverCost, setServerCost] = useState(5000); // Server cost in dollars
  const [gpusPerServer, setGpusPerServer] = useState(8); // Number of GPUs per server

  const gpu = useMemo(() => gpuData.find((g) => g.id === selectedGpu) || gpuData[0], [selectedGpu]);

  // Update owner share when GPU changes
  useEffect(() => {
    setOwnerSharePercentage(gpu.cardType === "Consumer" ? 50 : 70)
  }, [gpu])

  // Calculate weighted hourly rate based on percentages
  const calculateHourlyRate = useMemo(() => {
    // Ensure percentages add up to 100%
    const totalPercentage = utilizationPercentages.idle + utilizationPercentages.spot + utilizationPercentages.onDemand;
    const normalizedIdle = utilizationPercentages.idle / totalPercentage;
    const normalizedSpot = utilizationPercentages.spot / totalPercentage;
    const normalizedOnDemand = utilizationPercentages.onDemand / totalPercentage;

    // Get the appropriate rates based on rental type
    const spotRate = rentalType === 'community' ? gpu.communitySpot : gpu.secureSpot;
    const onDemandRate = rentalType === 'community' ? gpu.communityOnDemand : gpu.secureOnDemand;

    // If rates are not available for the selected mode, use the available ones or default to 0
    const effectiveSpotRate = spotRate ?? (rentalType === 'community' ? gpu.communitySpot : 0) ?? 0
    const effectiveOnDemandRate = onDemandRate ?? (rentalType === 'community' ? gpu.communityOnDemand : 0) ?? 0

    // Calculate weighted average (idle is always $0/hr)
    const weightedRate =
      normalizedIdle * 0 + normalizedSpot * effectiveSpotRate + normalizedOnDemand * effectiveOnDemandRate

    return weightedRate
  }, [gpu, utilizationPercentages, rentalType])

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
  const serverCostPerGpu = serverCost / gpusPerServer;
  const initialCost = gpu.price + serverCostPerGpu;

  // Calculate ROI and Payback
  const profit = totalOwnerRevenue - initialCost // Only consider initial cost when provider pays OPEX
  const roi = initialCost > 0 ? (profit / initialCost) * 100 : 0; // Handle initialCost = 0
  const paybackMonths = ownerRevenue > 0 ? initialCost / (ownerRevenue / 12) : Infinity; // Handle ownerRevenue = 0


  // Check if secure mode is available for this GPU - This is now handled by checking specific rentalType rates
  // const secureAvailable = gpu.secureSpot !== null || gpu.secureOnDemand !== null

  const handleResidualValueChange = (year: keyof typeof residualValues, value: string) => {
    const numericValue = parseFloat(value)
    if (!isNaN(numericValue) && numericValue >= 0 && numericValue <= 1) {
      setResidualValues(prev => ({ ...prev, [year]: numericValue }))
    }
  }

  // Memoize calculations for FinancialMetrics - Renamed and adjusted
  const financialMetrics = useMemo(() => {
    const hoursPerYear = 8760;

    // Determine active rental rates based on selected type
    const spotRate = rentalType === 'community' ? gpu.communitySpot : gpu.secureSpot;
    const onDemandRate = rentalType === 'community' ? gpu.communityOnDemand : gpu.secureOnDemand;

    // Weighted average rental rate based on utilization distribution
    const averageRentalRate =
      ((spotRate ?? 0) * utilizationPercentages.spot / 100 +
       (onDemandRate ?? 0) * utilizationPercentages.onDemand / 100);

    // Ensure averageRentalRate is not NaN if rates are null
     const validAverageRentalRate = isNaN(averageRentalRate) ? 0 : averageRentalRate;


    // Calculate Annual Revenue (considering owner's share)
    const grossAnnualRevenue = validAverageRentalRate * hoursPerYear;
    const ownerAnnualRevenue = grossAnnualRevenue * (revenueSplit.owner / 100);


    // Calculate Annual Power Consumption Cost
    const avgPowerConsumptionWatts =
      (gpu.idlePowerConsumption * utilizationPercentages.idle / 100) +
      (gpu.powerConsumption * (utilizationPercentages.spot + utilizationPercentages.onDemand) / 100);
    const annualKWh = (avgPowerConsumptionWatts * hoursPerYear) / 1000;
    const annualPowerCost = annualKWh * powerCost; // Use powerCost state

    // Calculate Annual Hosting Cost
    const annualHostingCost = hostingCost * hoursPerYear;

    // Calculate Total Annual Costs
    const totalAnnualCosts = annualPowerCost + annualHostingCost;

    // Calculate Annual Profit
    const annualProfit = ownerAnnualRevenue - totalAnnualCosts;

    // Calculate Simple Annual ROI
    const annualROI = gpu.price > 0 ? (annualProfit / gpu.price) : 0;

    // --- IRR Calculation ---
    const cashFlows: number[] = [];
    // Include server cost per GPU in initial investment
    cashFlows.push(-(gpu.price + serverCost / gpusPerServer)); // Year 0: Initial Investment

    // Add annual profit for each year up to contract duration
    for (let i = 1; i <= contractDuration; i++) {
        if (i === contractDuration) {
             // Add residual value in the last year (apply to GPU only, not server)
            cashFlows.push(annualProfit + gpu.price * (residualValues as any)[`year${Math.min(i, 3)}`]);
        } else {
            cashFlows.push(annualProfit);
        }
    }

    const irr = calculateIRR(cashFlows);

    // Calculate Payback Period (Simple) - updated to include server cost per GPU
    const totalInvestment = gpu.price + serverCost / gpusPerServer;
    const paybackYears = annualProfit > 0 ? totalInvestment / annualProfit : Infinity;

    return {
      ownerAnnualRevenue,
      annualPowerCost,
      annualHostingCost,
      totalAnnualCosts,
      annualProfit,
      annualROI,
      paybackYears,
      irr, // Add IRR to returned metrics
    };
  }, [gpu, rentalType, utilizationPercentages, revenueSplit, hostingCost, powerCost, residualValues, contractDuration, serverCost, gpusPerServer]);

  // Handler for GPU select (corrected type)
  const handleGpuChange = (value: string) => {
    setSelectedGpu(value);
  };

  // Handler for contract duration select (corrected type)
  const handleContractDurationChange = (value: string) => {
    setContractDuration(Number.parseInt(value));
  };

  // Handler for rental type select (Type the value parameter explicitly)
  const handleRentalTypeChange = (value: string) => {
    // Use type assertion after check
    if (["community", "secure"].includes(value)) {
        setRentalType(value as typeof rentalType);
    }
  };

  // Define handlers for sliders (example for one set, repeat for others if needed)
  const handleUtilizationChange = (values: number[]) => {
      // Example logic: assumes slider controls [idle, spot] percentages, calculate onDemand
      const idle = values[0] ?? 0;
      const spot = (values[1] ?? 0) - idle;
      const onDemand = Math.max(0, 100 - idle - spot);
      setUtilizationPercentages({ idle, spot, onDemand });
  };

    const handleRevenueSplitChange = (values: number[]) => {
      const platform = values[0] ?? 0;
      const owner = (values[1] ?? 0) - platform;
      const provider = Math.max(0, 100 - platform - owner);
      setRevenueSplit({ platform, owner, provider });
  };


  return (
    <Card className="w-full bg-fgpu-stone-900 border-fgpu-stone-700">
      <div className="p-4">
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
                <Label htmlFor="gpu-select" className="text-fgpu-stone-600 dark:text-fgpu-gray-300">GPU Model</Label>
                <Badge
                  color={gpu.cardType === "Data Center" ? "blue" : gpu.cardType === "Workstation" ? "purple" : "gray"}
                  className="ml-auto"
                >
                  {gpu.cardType}
                </Badge>
              </div>
              <Select onValueChange={handleGpuChange} defaultValue={selectedGpu}>
                <SelectTrigger id="gpu-select">
                    <SelectValue placeholder="Select a GPU" />
                </SelectTrigger>
                <SelectContent>
                  <Label className="px-2 py-1.5 text-sm font-semibold text-gray-500 dark:text-gray-400">Data Center GPUs</Label>
                  {gpuData
                    .filter((gpu) => gpu.cardType === "Data Center")
                    .map((gpu) => (
                      <SelectItem key={gpu.id} value={gpu.id}>
                        {gpu.name} (${gpu.price.toLocaleString()})
                      </SelectItem>
                    ))}
                  <Label className="px-2 py-1.5 text-sm font-semibold text-gray-500 dark:text-gray-400">Consumer GPUs</Label>
                  {gpuData
                    .filter((gpu) => gpu.cardType === "Consumer")
                    .map((gpu) => (
                      <SelectItem key={gpu.id} value={gpu.id}>
                        {gpu.name} (${gpu.price.toLocaleString()})
                      </SelectItem>
                    ))}
                  <Label className="px-2 py-1.5 text-sm font-semibold text-gray-500 dark:text-gray-400">Workstation GPUs</Label>
                  {gpuData
                    .filter((gpu) => gpu.cardType === "Workstation")
                    .map((gpu) => (
                      <SelectItem key={gpu.id} value={gpu.id}>
                        {gpu.name} (${gpu.price.toLocaleString()})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="server-cost" className="text-fgpu-stone-600 dark:text-fgpu-gray-300">
                  Server Cost ($)
                </Label>
                <Input
                  id="server-cost"
                  type="number"
                  min="0"
                  value={serverCost}
                  onChange={(e) => setServerCost(Math.max(0, parseInt(e.target.value) || 0))}
                  className="dark:bg-fgpu-stone-700 dark:border-fgpu-stone-600 dark:text-white"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="gpus-per-server" className="text-fgpu-stone-600 dark:text-fgpu-gray-300">
                  GPUs per Server
                </Label>
                <Input
                  id="gpus-per-server"
                  type="number"
                  min="1"
                  value={gpusPerServer}
                  onChange={(e) => setGpusPerServer(Math.max(1, parseInt(e.target.value) || 1))}
                  className="dark:bg-fgpu-stone-700 dark:border-fgpu-stone-600 dark:text-white"
                />
              </div>
              <div className="col-span-2 text-xs text-fgpu-stone-500 dark:text-fgpu-gray-400 mt-1">
                Total initial investment: ${initialCost.toLocaleString()} per GPU (${gpu.price.toLocaleString()} + ${serverCostPerGpu.toLocaleString()} server cost)
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <HiClock className="text-fgpu-stone-500 dark:text-fgpu-gray-400" />
                <Label
                  htmlFor="contract-duration"
                  className="text-fgpu-stone-600 dark:text-fgpu-gray-300"
                >Contract Duration (Years)</Label>
              </div>
              <Select onValueChange={handleContractDurationChange} defaultValue={contractDuration.toString()}>
                <SelectTrigger id="contract-duration">
                  <SelectValue placeholder="Select Duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 Years</SelectItem>
                  <SelectItem value="3">3 Years</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HiServer className="text-fgpu-stone-500 dark:text-fgpu-gray-400" />
                  <Label
                    htmlFor="rental-type-select"
                    className="text-fgpu-stone-600 dark:text-fgpu-gray-300"
                  >Rental Type</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    onValueChange={handleRentalTypeChange}
                    defaultValue={rentalType}
                  >
                    <SelectTrigger id="rental-type-select">
                      <SelectValue placeholder="Select Rental Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="community">Community</SelectItem>
                      <SelectItem value="secure">Secure</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-4 p-4 bg-fgpu-stone-600 rounded-lg">
              <h3 className="text-sm font-medium text-fgpu-gray-300 flex items-center gap-2">
                <HiLightningBolt className="text-fgpu-stone-500 dark:text-fgpu-gray-400" />
                Usage Distribution
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HiInformationCircle className="text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Set the percentage of time your GPU will be idle, running spot jobs, or on-demand jobs</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
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
                        // Update utilizationPercentages too
                        setUtilizationPercentages({
                          idle: newValue,
                          spot: newSpot,
                          onDemand: remaining - newSpot
                        })
                      } else {
                        // If both are 0, split remaining evenly
                        const newSpot = Math.round(remaining / 2)
                        const newOnDemand = Math.round(remaining / 2)
                        setSpotPercentage(newSpot)
                        setOnDemandPercentage(newOnDemand)
                        // Update utilizationPercentages too
                        setUtilizationPercentages({
                          idle: newValue,
                          spot: newSpot,
                          onDemand: newOnDemand
                        })
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
                      // Update utilizationPercentages too
                      setUtilizationPercentages({
                        idle: idlePercentage,
                        spot: newValue,
                        onDemand: 100 - idlePercentage - newValue
                      })
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
                      // Update utilizationPercentages too
                      setUtilizationPercentages({
                        idle: idlePercentage,
                        spot: 100 - idlePercentage - newValue,
                        onDemand: newValue
                      })
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
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HiInformationCircle className="text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Set how revenue is split between the platform, owner (investor), and provider (data center)</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
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

            {/* Advanced Mode Toggle */}
            <div className="flex items-center space-x-2 mt-4">
              <Switch
                id="advanced-mode"
                checked={advancedMode}
                onCheckedChange={setAdvancedMode}
              />
              <Label htmlFor="advanced-mode">Advanced Mode</Label>
            </div>

            {/* Residual Value Input (Conditional) */}
            {advancedMode && (
                <div className="grid gap-4 mt-4 p-4 border dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                    <h4 className="text-md font-medium mb-2 text-gray-600 dark:text-gray-400">Residual Value (% of Original Price)</h4>
                    <div className="space-y-3">
                        <div className="flex justify-between mb-1">
                            <Label htmlFor="residual-slider" className="text-sm text-gray-600 dark:text-gray-400">
                              Year {contractDuration} Residual
                            </Label>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {Math.round(residualValues[`year${Math.min(contractDuration, 3)}` as keyof typeof residualValues] * 100)}%
                            </span>
                        </div>
                        <Slider
                            id="residual-slider"
                            value={[residualValues[`year${Math.min(contractDuration, 3)}` as keyof typeof residualValues] * 100]}
                            min={0}
                            max={100}
                            step={1}
                            onValueChange={(values) => {
                                const newValue = (values[0] / 100).toString();
                                handleResidualValueChange(`year${Math.min(contractDuration, 3)}` as keyof typeof residualValues, newValue);
                            }}
                            className="w-full"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Estimated resale value after {contractDuration} years
                        </p>
                    </div>
                </div>
            )}
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
                  totalCost={initialCost}
                  totalRevenue={totalOwnerRevenue}
                  roi={roi}
                  paybackMonths={paybackMonths}
                  contractDuration={contractDuration}
                  irr={financialMetrics.irr}
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
      </div>
    </Card>
  )
}

