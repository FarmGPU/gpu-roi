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
import { HiOutlineQuestionMarkCircle, HiOutlineTrendingUp, HiOutlineCurrencyDollar, HiOutlineClock, HiOutlineFire, HiOutlineAdjustments, HiServer, HiLightningBolt, HiCash, HiClipboard, HiChip, HiClock, HiCurrencyDollar, HiRefresh, HiInformationCircle, HiShieldCheck } from "react-icons/hi"
import { FinancialMetrics } from "@/components/financial-metrics"
import { TCOBreakdown } from "@/components/tco-breakdown"

// Helper function to calculate IRR using an iterative approach (Newton-Raphson)
const calculateIRR = (cashFlows: number[], guess = 0.1, maxIterations = 100, tolerance = 1e-6): number | null => {
  // If there are no cash flows or all cash flows are 0, IRR is not defined
  if (!cashFlows || cashFlows.length < 2) return null;

  // Check if all values after the initial investment are non-positive
  // This would indicate an investment that never recovers (negative IRR)
  let hasPositive = false;
  for (let i = 1; i < cashFlows.length; i++) {
    if (cashFlows[i] > 0) {
      hasPositive = true;
      break;
    }
  }
  if (!hasPositive) return -1; // Return -100% since investment never recovers

  // Use multiple starting points to increase chances of convergence
  const guesses = [0.05, 0.1, 0.15, 0.2, 0.25, 0.3];

  for (const initialGuess of guesses) {
    let rate = initialGuess;
    let iterations = 0;

    while (iterations < maxIterations) {
      let npv = 0;
      let dNpv = 0; // Derivative of NPV with respect to rate

      // Calculate NPV and its derivative
      for (let t = 0; t < cashFlows.length; t++) {
        const cf = cashFlows[t];
        const discountFactor = Math.pow(1 + rate, t);

        npv += cf / discountFactor;

        if (t > 0) {
          dNpv -= (t * cf) / Math.pow(1 + rate, t + 1);
        }
      }

      // If NPV is close enough to zero, we found the IRR
      if (Math.abs(npv) < tolerance) {
        return rate;
      }

      // Avoid division by zero
      if (Math.abs(dNpv) < 1e-10) {
        break; // Try next initial guess
      }

      // Use Newton-Raphson step to get next approximation
      const newRate = rate - npv / dNpv;

      // Check for NaN or Infinity which would indicate failure
      if (isNaN(newRate) || !isFinite(newRate) || newRate < -1) {
        break; // Try next initial guess
      }

      // Check for convergence
      if (Math.abs(newRate - rate) < tolerance) {
        // Additional check to ensure the solution is valid
        if (Math.abs(npv) < tolerance * 10) {
          return newRate;
        }
      }

      // Prepare for next iteration
      rate = newRate;
      iterations++;
    }
  }

  // If we tried all initial guesses and none converged, give up
  return null;
};

// Add this new component before the GpuCalculator component
function GpuStats({ gpu, rentalType }: { gpu: GPU, rentalType: "community" | "secure" }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-6">
        {/* Performance Stats */}
        <div className="p-4 bg-fgpu-stone-800 border border-fgpu-stone-700 rounded-lg">
          <h3 className="text-lg font-bold tracking-tight text-fgpu-white flex items-center gap-2 mb-4">
            <HiLightningBolt className="text-fgpu-volt" />
            Performance
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-fgpu-gray-400">FP32 TFLOPS</p>
              <p className="text-lg font-semibold text-fgpu-white">{gpu.fp32Tflops.toFixed(2)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-fgpu-gray-400">CUDA Cores</p>
              <p className="text-lg font-semibold text-fgpu-white">{gpu.cudaCores.toLocaleString()}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-fgpu-gray-400">Boost Clock</p>
              <p className="text-lg font-semibold text-fgpu-white">{gpu.boostClock} GHz</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-fgpu-gray-400">Base Clock</p>
              <p className="text-lg font-semibold text-fgpu-white">{gpu.baseClock} GHz</p>
            </div>
          </div>
        </div>

        {/* Memory Stats */}
        <div className="p-4 bg-fgpu-stone-800 border border-fgpu-stone-700 rounded-lg">
          <h3 className="text-lg font-bold tracking-tight text-fgpu-white flex items-center gap-2 mb-4">
            <HiChip className="text-fgpu-volt" />
            Memory
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-fgpu-gray-400">Memory Size</p>
              <p className="text-lg font-semibold text-fgpu-white">{gpu.memory} GB</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-fgpu-gray-400">Memory Type</p>
              <p className="text-lg font-semibold text-fgpu-white">{gpu.memoryConfig}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-fgpu-gray-400">Memory Bandwidth</p>
              <p className="text-lg font-semibold text-fgpu-white">{gpu.memoryBandwidth} GB/s</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-fgpu-gray-400">PCIe Version</p>
              <p className="text-lg font-semibold text-fgpu-white">{gpu.pcie}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Power Stats */}
        <div className="p-4 bg-fgpu-stone-800 border border-fgpu-stone-700 rounded-lg">
          <h3 className="text-lg font-bold tracking-tight text-fgpu-white flex items-center gap-2 mb-4">
            <HiServer className="text-fgpu-volt" />
            Power & Efficiency
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-fgpu-gray-400">Power Consumption</p>
              <p className="text-lg font-semibold text-fgpu-white">{gpu.powerConsumption}W</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-fgpu-gray-400">Idle Power</p>
              <p className="text-lg font-semibold text-fgpu-white">{gpu.idlePowerConsumption}W</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-fgpu-gray-400">TFLOPS/Watt</p>
              <p className="text-lg font-semibold text-fgpu-white">{gpu.tflopsPerWatt.toFixed(4)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-fgpu-gray-400">TFLOPS/$</p>
              <p className="text-lg font-semibold text-fgpu-white">{gpu.tflopsPerDollar.toFixed(4)}</p>
            </div>
          </div>
        </div>

        {/* Pricing Stats */}
        <div className="p-4 bg-fgpu-stone-800 border border-fgpu-stone-700 rounded-lg">
          <h3 className="text-lg font-bold tracking-tight text-fgpu-white flex items-center gap-2 mb-4">
            <HiCurrencyDollar className="text-fgpu-volt" />
            {rentalType === "community" ? "Community" : "Secure"} Pricing
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-fgpu-gray-400">Purchase Price</p>
              <p className="text-lg font-semibold text-fgpu-white">${gpu.price.toLocaleString()}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-fgpu-gray-400">Card Type</p>
              <p className="text-lg font-semibold text-fgpu-white">{gpu.cardType}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-fgpu-gray-400">Spot Rate</p>
              <p className="text-lg font-semibold text-fgpu-white">
                ${(rentalType === "community" ? gpu.communitySpot : gpu.secureSpot)?.toFixed(2) ?? "N/A"}/hr
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-fgpu-gray-400">On-Demand Rate</p>
              <p className="text-lg font-semibold text-fgpu-white">
                ${(rentalType === "community" ? gpu.communityOnDemand : gpu.secureOnDemand)?.toFixed(2) ?? "N/A"}/hr
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

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
  const [priceDecayRate, setPriceDecayRate] = useState(20) // 20% price decay per year by default
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

  // Get hourly rate directly from GPU data without decay
  const baseSpotRate = rentalType === 'community' ? gpu.communitySpot : gpu.secureSpot;
  const baseOnDemandRate = rentalType === 'community' ? gpu.communityOnDemand : gpu.secureOnDemand;

  // Calculate the base hourly rate from GPU data (without decay)
  const baseHourlyRate = useMemo(() => {
    // Ensure percentages add up to 100%
    const totalPercentage = utilizationPercentages.idle + utilizationPercentages.spot + utilizationPercentages.onDemand;
    const normalizedIdle = utilizationPercentages.idle / totalPercentage;
    const normalizedSpot = utilizationPercentages.spot / totalPercentage;
    const normalizedOnDemand = utilizationPercentages.onDemand / totalPercentage;

    // Calculate weighted average (idle is always $0/hr)
    const effectiveSpotRate = baseSpotRate ?? 0;
    const effectiveOnDemandRate = baseOnDemandRate ?? 0;

    return normalizedIdle * 0 + normalizedSpot * effectiveSpotRate + normalizedOnDemand * effectiveOnDemandRate;
  }, [baseSpotRate, baseOnDemandRate, utilizationPercentages]);

  // Get the average hourly rate with decay for financial calculations
  const effectiveHourlyRate = baseHourlyRate;

  // Calculate TCO
  const serverCostPerGpu = serverCost / gpusPerServer;
  const initialCost = gpu.price + serverCostPerGpu;

  // Additional state for the residual value handler
  const handleResidualValueChange = (year: keyof typeof residualValues, value: string) => {
    const numericValue = parseFloat(value)
    if (!isNaN(numericValue) && numericValue >= 0 && numericValue <= 1) {
      setResidualValues(prev => ({ ...prev, [year]: numericValue }))
    }
  }

  // Memoize calculations for FinancialMetrics - Renamed and adjusted
  const financialMetrics = useMemo(() => {
    const hoursPerYear = 8760;
    const hoursPerMonth = hoursPerYear / 12;

    // Determine active rental rates based on selected type
    const spotRate = rentalType === 'community' ? gpu.communitySpot : gpu.secureSpot;
    const onDemandRate = rentalType === 'community' ? gpu.communityOnDemand : gpu.secureOnDemand;

    // Calculate revenue for each month considering linear price decay
    let totalOwnerRevenue = 0;
    const yearlyOwnerRevenue = Array(contractDuration).fill(0);
    const monthlyOwnerRevenue = Array(contractDuration * 12).fill(0);
    const monthlyCumulativeRevenue = Array(contractDuration * 12).fill(0);

    // Initial investment (Year 0)
    const totalInvestment = gpu.price + serverCost / gpusPerServer;

    // Calculate the monthly decay factor
    const monthlyDecayRate = priceDecayRate / 100 / 12; // Convert percentage to decimal and divide by 12 months

    // Initial rates for month 0
    let currentSpotRate = spotRate ?? 0;
    let currentOnDemandRate = onDemandRate ?? 0;

    // Calculate costs (assuming these don't change month over month)
    const avgPowerConsumptionWatts =
      (gpu.idlePowerConsumption * utilizationPercentages.idle / 100) +
      (gpu.powerConsumption * (utilizationPercentages.spot + utilizationPercentages.onDemand) / 100);
    const monthlyKWh = (avgPowerConsumptionWatts * hoursPerMonth) / 1000;
    const monthlyPowerCost = monthlyKWh * powerCost;
    const monthlyHostingCost = hostingCost * hoursPerMonth;
    const totalMonthlyCosts = monthlyPowerCost + monthlyHostingCost;

    // Find exact payback period
    let paybackMonth = contractDuration * 12; // Default to end of contract
    let cumulativeRevenue = 0;

    // Calculate for each month
    for (let month = 0; month < contractDuration * 12; month++) {
      const year = Math.floor(month / 12);

      // Apply decay for this month
      if (month > 0) {
        currentSpotRate = currentSpotRate * (1 - monthlyDecayRate);
        currentOnDemandRate = currentOnDemandRate * (1 - monthlyDecayRate);
      }

      // Weighted average rental rate for this month
      const monthlyAverageRentalRate =
        (currentSpotRate * utilizationPercentages.spot / 100 +
         currentOnDemandRate * utilizationPercentages.onDemand / 100);

      // Calculate gross revenue for this month
      const monthlyGrossRevenue = monthlyAverageRentalRate * hoursPerMonth;

      // Apply platform fee
      const platformFeeAmount = monthlyGrossRevenue * (platformFeePercentage / 100);
      const monthlyNetRevenue = monthlyGrossRevenue - platformFeeAmount;

      // Calculate owner's share of the remaining revenue
      const monthlyOwnerRevenueAmount = monthlyNetRevenue * (ownerSharePercentage / 100);

      // Calculate profit for this month (revenue - costs)
      const monthlyProfit = monthlyOwnerRevenueAmount - totalMonthlyCosts;

      // Add to cumulative revenue (not profit) for payback calculation
      cumulativeRevenue += monthlyOwnerRevenueAmount;

      // Check if we've reached payback based on revenue
      if (cumulativeRevenue >= totalInvestment && paybackMonth === contractDuration * 12) {
        // We've reached payback this month - to match the graph
        paybackMonth = month + 1;

        // If we want more precision (for exact point of intersection)
        if (month > 0) {
          // Calculate how far into the month we reached payback
          const prevCumulativeRevenue = cumulativeRevenue - monthlyOwnerRevenueAmount;
          const fractionOfMonth = (totalInvestment - prevCumulativeRevenue) / monthlyOwnerRevenueAmount;
          paybackMonth = month + fractionOfMonth;
        }
      }

      // Store monthly revenue
      monthlyOwnerRevenue[month] = monthlyOwnerRevenueAmount;

      // Store cumulative revenue for reference
      monthlyCumulativeRevenue[month] = cumulativeRevenue;

      // Add to yearly total
      yearlyOwnerRevenue[year] += monthlyOwnerRevenueAmount;
      totalOwnerRevenue += monthlyOwnerRevenueAmount;
    }

    // More accurate payback calculation based on actual monthly data
    const paybackYears = paybackMonth / 12;

    // Calculate residual value for financial metrics
    const residualValueKey = `year${Math.min(contractDuration, 3)}` as keyof typeof residualValues;
    const residualGpuValue = gpu.price * residualValues[residualValueKey];

    // Calculate server residual value
    const serverDepreciationPerYear = 0.18; // 18% per year
    const serverResidualPct = Math.max(0.1, 1 - (contractDuration * serverDepreciationPerYear));
    const residualServerValue = (serverCost / gpusPerServer) * serverResidualPct;

    // Total residual value
    const totalResidualValue = residualGpuValue + residualServerValue;

    // Calculate traditional ROI: ignore OPEX since provider covers operating costs
    const totalReturn = totalOwnerRevenue + totalResidualValue - totalInvestment;
    const totalROI = (totalReturn / totalInvestment) * 100;

    // Build monthly cash flows: initial investment and monthly revenues, adding residual in the final month
    const monthlyCashFlows: number[] = [-totalInvestment];
    for (let month = 0; month < contractDuration * 12; month++) {
      const cashFlow = monthlyOwnerRevenue[month];
      monthlyCashFlows.push(
        month === contractDuration * 12 - 1
          ? cashFlow + totalResidualValue
          : cashFlow
      );
    }
    // Calculate IRR on monthly cash flows and annualize
    const monthlyIrr = calculateIRR(monthlyCashFlows);
    const annualIrr = monthlyIrr !== null && monthlyIrr > -1
      ? Math.pow(1 + monthlyIrr, 12) - 1
      : (monthlyIrr === -1 ? -1 : null);

    return {
      ownerAnnualRevenue: totalOwnerRevenue / contractDuration,
      annualPowerCost: monthlyPowerCost * 12,
      annualHostingCost: monthlyHostingCost * 12,
      totalAnnualCosts: totalMonthlyCosts * 12,
      annualProfit: totalOwnerRevenue / contractDuration - totalMonthlyCosts * 12,
      totalROI: totalROI, // Total ROI percentage for the entire contract period
      totalResidualValue,
      paybackYears,
      paybackMonth,
      irr: annualIrr,
      yearlyRevenue: yearlyOwnerRevenue,
      monthlyRevenue: monthlyOwnerRevenue,
      monthlyCumulativeRevenue
    };
  }, [gpu, rentalType, utilizationPercentages, revenueSplit, hostingCost, powerCost, residualValues, contractDuration, serverCost, gpusPerServer, priceDecayRate, platformFeePercentage, ownerSharePercentage]);

  // Calculate revenue values based on financialMetrics to include price decay
  // (this is already the owner's revenue after platform fee and revenue split)
  const ownerRevenue = financialMetrics.ownerAnnualRevenue;

  // For display purposes, recalculate the gross annual revenue before splits
  const grossAnnualRevenue = ownerRevenue / ((100 - platformFeePercentage) / 100) / (ownerSharePercentage / 100);

  // Rest of the calculations based on the correct owner revenue
  const totalOwnerRevenue = advancedMode && financialMetrics.yearlyRevenue
    ? financialMetrics.yearlyRevenue.reduce((sum, val) => sum + val, 0)
    : ownerRevenue * contractDuration;

  // Calculate ROI and Payback using financialMetrics which includes price decay
  const roi = financialMetrics.totalROI;
  const paybackMonths = financialMetrics.paybackMonth;

  // Check if secure mode is available for this GPU - This is now handled by checking specific rentalType rates
  // const secureAvailable = gpu.secureSpot !== null || gpu.secureOnDemand !== null

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
        <HiClipboard className="text-fgpu-volt" />
        GPU Cloud Revenue Model
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

            <div className="space-y-4 p-4 bg-fgpu-stone-800 border border-fgpu-stone-700 rounded-lg">
              <h3 className="text-lg font-bold tracking-tight text-fgpu-white flex items-center gap-2">
                <HiLightningBolt className="text-fgpu-volt" />
              Usage Distribution
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HiInformationCircle className="text-fgpu-gray-400" />
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
                    <span className="text-fgpu-gray-300">Idle</span>
                    <span className="text-fgpu-gray-400">{idlePercentage}%</span>
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
                    <span className="text-fgpu-gray-300">Spot</span>
                    <span className="text-fgpu-gray-400">{spotPercentage}%</span>
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
                    <span className="text-fgpu-gray-300">On-Demand</span>
                    <span className="text-fgpu-gray-400">{onDemandPercentage}%</span>
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
                  <span className="text-fgpu-gray-300 font-medium">
                  Effective Hourly Rate:
                </span>
                  <span className="text-fgpu-volt font-medium">${baseHourlyRate.toFixed(3)}/hr</span>
              </div>
            </div>
          </div>

            <div className="space-y-4 p-4 bg-fgpu-stone-800 border border-fgpu-stone-700 rounded-lg">
              <h3 className="text-lg font-bold tracking-tight text-fgpu-white flex items-center gap-2">
                <HiCurrencyDollar className="text-fgpu-volt" />
              Revenue Sharing
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HiInformationCircle className="text-fgpu-gray-400" />
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
                    <span className="text-fgpu-gray-300">Platform Fee</span>
                    <span className="text-fgpu-gray-400">{platformFeePercentage}%</span>
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
                    <span className="text-fgpu-gray-300">
                    Owner Share (of remaining)
                  </span>
                    <span className="text-fgpu-gray-400">{ownerSharePercentage}%</span>
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
                    <span className="text-fgpu-gray-300">
                    Provider Share (of remaining)
                  </span>
                    <span className="text-fgpu-gray-400">
                    {100 - ownerSharePercentage}%
                  </span>
                </div>
                  <div className="w-full h-2 bg-fgpu-stone-900 rounded-lg">
                  <div
                    className="h-2 bg-fgpu-volt rounded-lg"
                    style={{ width: `${100 - ownerSharePercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-fgpu-stone-700">
              <div className="flex justify-between">
                  <span className="text-fgpu-gray-300 font-medium">
                  Annual Owner Revenue:
                </span>
                  <span className="text-fgpu-volt font-medium">${ownerRevenue.toFixed(0)}/year</span>
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

            {/* Advanced Settings (Conditional) */}
            {advancedMode && (
              <div className="grid gap-6 mt-4">
                {/* Residual Value Input */}
                <div className="grid gap-4 p-4 bg-fgpu-stone-800 border-fgpu-stone-700 border rounded-lg">
                  <h4 className="text-lg font-bold tracking-tight text-fgpu-white flex items-center gap-2">
                    <HiCurrencyDollar className="text-fgpu-volt" />
                    Residual Value
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between mb-1">
                      <Label htmlFor="residual-slider" className="text-fgpu-gray-300">
                        Year {contractDuration} Residual
                      </Label>
                      <span className="text-fgpu-gray-400">
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
                    <p className="text-xs text-fgpu-gray-400 mt-1">
                      Estimated resale value after {contractDuration} years
                    </p>
          </div>
                </div>

                {/* Price Decay Input */}
                <div className="grid gap-4 p-4 bg-fgpu-stone-800 border-fgpu-stone-700 border rounded-lg">
                  <h4 className="text-lg font-bold tracking-tight text-fgpu-white flex items-center gap-2">
                    <HiOutlineTrendingUp className="text-fgpu-volt" />
                    Price Decay
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between mb-1">
                      <Label htmlFor="price-decay-slider" className="text-fgpu-gray-300">
                        Annual Price Reduction Rate
                      </Label>
                      <span className="text-fgpu-gray-400">
                        {priceDecayRate}%
                      </span>
                    </div>
                    <Slider
                      id="price-decay-slider"
                      value={[priceDecayRate]}
                      min={0}
                      max={50}
                      step={1}
                      onValueChange={(values) => setPriceDecayRate(values[0])}
                      className="w-full"
                    />
                    <p className="text-xs text-fgpu-gray-400 mt-1">
                      Rental rates will decline by this percentage each year (reflecting market competition)
                    </p>
                  </div>
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
              <li className="mr-2" role="presentation">
                <button
                  className={`inline-block p-4 border-b-2 rounded-t-lg ${activeTab === "stats" ? "text-fgpu-volt border-fgpu-volt dark:text-fgpu-volt dark:border-fgpu-volt" : "hover:text-fgpu-stone-600 hover:border-fgpu-stone-300 dark:hover:text-fgpu-gray-300"}`}
                  onClick={() => setActiveTab("stats")}
                  type="button"
                  role="tab"
                >
                  <div className="flex items-center">
                    <HiServer className="mr-2" />
                    GPU Stats
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
                yearlyRevenue={financialMetrics.yearlyRevenue}
                monthlyRevenue={financialMetrics.monthlyRevenue}
                residualValue={financialMetrics.totalResidualValue}
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

            {activeTab === "stats" && (
              <GpuStats gpu={gpu} rentalType={rentalType} />
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

