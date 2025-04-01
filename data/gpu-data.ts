export interface GPU {
  id: string
  name: string
  cardType: "Data Center" | "Consumer" | "Workstation"
  price: number
  communitySpot: number | null
  communityOnDemand: number | null
  secureSpot: number | null
  secureOnDemand: number | null
  powerConsumption: number
  idlePowerConsumption: number
  memory: number
  vcpu: number
}

export const gpuData: GPU[] = [
  // Data Center GPUs
  {
    id: "a100-80gb-pcie",
    name: "NVIDIA A100 80GB PCIe",
    cardType: "Data Center",
    price: 15000,
    communitySpot: 0.820,
    communityOnDemand: 1.640,
    secureSpot: 0.820,
    secureOnDemand: 1.640,
    powerConsumption: 400,
    idlePowerConsumption: 50,
    memory: 117,
    vcpu: 8
  },
  {
    id: "a100-sxm4-80gb",
    name: "NVIDIA A100-SXM4-80GB",
    cardType: "Data Center",
    price: 16000,
    communitySpot: 0.950,
    communityOnDemand: 1.890,
    secureSpot: 0.950,
    secureOnDemand: 1.890,
    powerConsumption: 400,
    idlePowerConsumption: 50,
    memory: 125,
    vcpu: 16
  },
  {
    id: "a40",
    name: "NVIDIA A40",
    cardType: "Data Center",
    price: 4000,
    communitySpot: 0.280,
    communityOnDemand: 0.440,
    secureSpot: 0.280,
    secureOnDemand: 0.440,
    powerConsumption: 300,
    idlePowerConsumption: 30,
    memory: 50,
    vcpu: 9
  },
  {
    id: "h100-80gb-hbm3",
    name: "NVIDIA H100 80GB HBM3",
    cardType: "Data Center",
    price: 28000,
    communitySpot: 1.750,
    communityOnDemand: 2.990,
    secureSpot: 1.750,
    secureOnDemand: 2.990,
    powerConsumption: 700,
    idlePowerConsumption: 60,
    memory: 125,
    vcpu: 16
  },
  {
    id: "h100-nvl",
    name: "NVIDIA H100 NVL",
    cardType: "Data Center",
    price: 29000,
    communitySpot: 1.650,
    communityOnDemand: 2.790,
    secureSpot: 1.650,
    secureOnDemand: 2.790,
    powerConsumption: 700,
    idlePowerConsumption: 60,
    memory: 94,
    vcpu: 16
  },
  {
    id: "h100-pcie",
    name: "NVIDIA H100 PCIe",
    cardType: "Data Center",
    price: 27000,
    communitySpot: 1.250,
    communityOnDemand: 2.390,
    secureSpot: 1.250,
    secureOnDemand: 2.390,
    powerConsumption: 700,
    idlePowerConsumption: 60,
    memory: 188,
    vcpu: 24
  },
  {
    id: "h200",
    name: "NVIDIA H200",
    cardType: "Data Center",
    price: 30000,
    communitySpot: 2.275, // 30% higher than H100 SXM
    communityOnDemand: 3.857, // 30% higher than H100 SXM
    secureSpot: 2.275,
    secureOnDemand: 3.857,
    powerConsumption: 700,
    idlePowerConsumption: 60,
    memory: 188,
    vcpu: 12
  },
  {
    id: "l4",
    name: "NVIDIA L4",
    cardType: "Data Center",
    price: 5000,
    communitySpot: 0.220,
    communityOnDemand: 0.430,
    secureSpot: 0.220,
    secureOnDemand: 0.430,
    powerConsumption: 300,
    idlePowerConsumption: 30,
    memory: 50,
    vcpu: 12
  },
  {
    id: "l40",
    name: "NVIDIA L40",
    cardType: "Data Center",
    price: 7000,
    communitySpot: 0.500,
    communityOnDemand: 0.990,
    secureSpot: 0.500,
    secureOnDemand: 0.990,
    powerConsumption: 300,
    idlePowerConsumption: 30,
    memory: 94,
    vcpu: 8
  },
  {
    id: "l40s",
    name: "NVIDIA L40S",
    cardType: "Data Center",
    price: 8250,
    communitySpot: 0.430,
    communityOnDemand: 0.860,
    secureSpot: 0.430,
    secureOnDemand: 0.860,
    powerConsumption: 300,
    idlePowerConsumption: 30,
    memory: 62,
    vcpu: 16
  },

  // Consumer GPUs
  {
    id: "rtx-3090",
    name: "NVIDIA GeForce RTX 3090",
    cardType: "Consumer",
    price: 2000,
    communitySpot: 0.220,
    communityOnDemand: 0.430,
    secureSpot: 0.220,
    secureOnDemand: 0.430,
    powerConsumption: 350,
    idlePowerConsumption: 25,
    memory: 62,
    vcpu: 16
  },
  {
    id: "rtx-4090",
    name: "NVIDIA GeForce RTX 4090",
    cardType: "Consumer",
    price: 4100,
    communitySpot: 0.350,
    communityOnDemand: 0.690,
    secureSpot: 0.350,
    secureOnDemand: 0.690,
    powerConsumption: 450,
    idlePowerConsumption: 30,
    memory: 41,
    vcpu: 6
  },
  {
    id: "rtx-5090",
    name: "NVIDIA GeForce RTX 5090",
    cardType: "Consumer",
    price: 5000,
    communitySpot: 0.455, // 30% higher than 4090
    communityOnDemand: 0.897, // 30% higher than 4090
    secureSpot: 0.455,
    secureOnDemand: 0.897,
    powerConsumption: 575,
    idlePowerConsumption: 35,
    memory: 46,
    vcpu: 16
  },

  // Workstation GPUs
  {
    id: "rtx-2000-ada",
    name: "NVIDIA RTX 2000 Ada Generation",
    cardType: "Workstation",
    price: 1000,
    communitySpot: 0.140,
    communityOnDemand: 0.280,
    secureSpot: 0.140,
    secureOnDemand: 0.280,
    powerConsumption: 130,
    idlePowerConsumption: 10,
    memory: 31,
    vcpu: 6
  },
  {
    id: "rtx-4000-ada",
    name: "NVIDIA RTX 4000 Ada Generation",
    cardType: "Workstation",
    price: 1500,
    communitySpot: 0.190,
    communityOnDemand: 0.380,
    secureSpot: 0.190,
    secureOnDemand: 0.380,
    powerConsumption: 130,
    idlePowerConsumption: 10,
    memory: 47,
    vcpu: 9
  },
  {
    id: "rtx-6000-ada",
    name: "NVIDIA RTX 6000 Ada Generation",
    cardType: "Workstation",
    price: 7600,
    communitySpot: 0.390,
    communityOnDemand: 0.770,
    secureSpot: 0.390,
    secureOnDemand: 0.770,
    powerConsumption: 300,
    idlePowerConsumption: 25,
    memory: 62,
    vcpu: 16
  },
  {
    id: "rtx-a4000",
    name: "NVIDIA RTX A4000",
    cardType: "Workstation",
    price: 700,
    communitySpot: 0.160,
    communityOnDemand: 0.320,
    secureSpot: 0.160,
    secureOnDemand: 0.320,
    powerConsumption: 140,
    idlePowerConsumption: 15,
    memory: 31,
    vcpu: 5
  },
  {
    id: "rtx-a4500",
    name: "NVIDIA RTX A4500",
    cardType: "Workstation",
    price: 1000,
    communitySpot: 0.180,
    communityOnDemand: 0.340,
    secureSpot: 0.180,
    secureOnDemand: 0.340,
    powerConsumption: 230,
    idlePowerConsumption: 20,
    memory: 31,
    vcpu: 12
  },
  {
    id: "rtx-a5000",
    name: "NVIDIA RTX A5000",
    cardType: "Workstation",
    price: 1200,
    communitySpot: 0.140,
    communityOnDemand: 0.290,
    secureSpot: 0.140,
    secureOnDemand: 0.290,
    powerConsumption: 230,
    idlePowerConsumption: 20,
    memory: 25,
    vcpu: 9
  },
  {
    id: "rtx-a6000",
    name: "NVIDIA RTX A6000",
    cardType: "Workstation",
    price: 2500,
    communitySpot: 0.330,
    communityOnDemand: 0.590,
    secureSpot: 0.330,
    secureOnDemand: 0.590,
    powerConsumption: 300,
    idlePowerConsumption: 28,
    memory: 50,
    vcpu: 8
  }
]

