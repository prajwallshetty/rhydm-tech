export interface ExchangeRules {
  acceptedBrands: string[];
  acceptedCategories: string[];
  depreciationPercent: number;
  maxExchangeValueCents: number;
  conditionMultipliers: Record<string, number>;
  pickupChargesCents: number;
  baseCategoryPricesCents: Record<string, number>;
}

export const DEFAULT_EXCHANGE_RULES: ExchangeRules = {
  acceptedBrands: ["Dell", "HP", "Lenovo", "Apple", "Cisco", "IBM", "Fujitsu", "Acer", "ASUS", "MSI", "Other"],
  acceptedCategories: ["Laptop", "Desktop", "Server", "Networking", "Workstation", "Monitor", "Accessories"],
  depreciationPercent: 15,
  maxExchangeValueCents: 100000, // €1000
  conditionMultipliers: {
    "Excellent": 1.0,
    "Good": 0.8,
    "Fair": 0.6,
    "Damaged": 0.3,
    "Non Working": 0.1,
  },
  pickupChargesCents: 1500, // €15
  baseCategoryPricesCents: {
    "Laptop": 40000,      // €400
    "Desktop": 35000,     // €350
    "Server": 80000,      // €800
    "Networking": 30000,  // €300
    "Workstation": 50000, // €500
    "Monitor": 15000,     // €150
    "Accessories": 5000,  // €50
  }
};

export interface DeviceSpecs {
  deviceType: string;
  brand: string;
  purchaseYear?: number;
  configRam?: string;
  configStorage?: string;
  configCpu?: string;
  condition: string;
  checklist?: {
    screenWorking?: boolean;
    batteryWorking?: boolean;
    keyboardWorking?: boolean;
    charging?: boolean;
    portsWorking?: boolean;
    wifi?: boolean;
    camera?: boolean;
    display?: boolean;
    motherboard?: boolean;
    powerAdapterIncluded?: boolean;
    originalBox?: boolean;
    accessoriesIncluded?: boolean;
  };
}

/**
 * Calculates estimated value of a device based on specifications and business rules.
 */
export function calculateValuation(specs: DeviceSpecs, rules: ExchangeRules = DEFAULT_EXCHANGE_RULES): number {
  // 1. Resolve Category Base Price
  let value = rules.baseCategoryPricesCents[specs.deviceType] || rules.baseCategoryPricesCents["Laptop"];

  // 2. Adjust for Brand Multipliers
  const brandLower = specs.brand.toLowerCase();
  let brandMultiplier = 1.0;
  if (brandLower === "apple") brandMultiplier = 1.25;
  else if (["dell", "hp", "lenovo"].includes(brandLower)) brandMultiplier = 1.0;
  else if (brandLower === "cisco") brandMultiplier = 1.15;
  else if (["asus", "msi", "acer"].includes(brandLower)) brandMultiplier = 0.9;
  else brandMultiplier = 0.8; // default fallback for other/custom brand

  value = Math.round(value * brandMultiplier);

  // 3. Spec Adjustments (RAM)
  const ram = (specs.configRam || "").toLowerCase();
  if (ram.includes("64gb") || ram.includes("128gb")) value += 15000; // +€150
  else if (ram.includes("32gb")) value += 8000; // +€80
  else if (ram.includes("16gb")) value += 3000; // +€30
  else if (ram.includes("8gb")) value += 0;
  else if (ram.includes("4gb")) value -= 2000; // -€20

  // 4. Spec Adjustments (Storage)
  const storage = (specs.configStorage || "").toLowerCase();
  if (storage.includes("2tb") || storage.includes("4tb")) value += 12000; // +€120
  else if (storage.includes("1tb")) value += 6000; // +€60
  else if (storage.includes("512gb")) value += 2000; // +€20
  else if (storage.includes("128gb")) value -= 1500; // -€15

  // 5. Spec Adjustments (CPU Class)
  const cpu = (specs.configCpu || "").toLowerCase();
  if (
    cpu.includes("i9") ||
    cpu.includes("ryzen 9") ||
    cpu.includes("xeon") ||
    cpu.includes("m1 pro") ||
    cpu.includes("m2 pro") ||
    cpu.includes("m3 pro") ||
    cpu.includes("m1 max") ||
    cpu.includes("m2 max") ||
    cpu.includes("m3 max")
  ) {
    value += 12000; // +€120
  } else if (
    cpu.includes("i7") ||
    cpu.includes("ryzen 7") ||
    cpu.includes("m1") ||
    cpu.includes("m2") ||
    cpu.includes("m3")
  ) {
    value += 5000; // +€50
  } else if (cpu.includes("i3") || cpu.includes("celeron") || cpu.includes("pentium") || cpu.includes("ryzen 3")) {
    value -= 4000; // -€40
  }

  // 6. Age Depreciation
  const currentYear = new Date().getFullYear();
  const purchaseYear = specs.purchaseYear || currentYear;
  const age = Math.max(0, currentYear - purchaseYear);
  const depreciationFactor = Math.pow(1 - rules.depreciationPercent / 100, age);
  value = Math.round(value * depreciationFactor);

  // 7. Condition Multiplier
  const conditionMult = rules.conditionMultipliers[specs.condition] !== undefined
    ? rules.conditionMultipliers[specs.condition]
    : 0.5; // default fallback (Good/Fair mix)
  value = Math.round(value * conditionMult);

  // 8. Checklist Deductions
  if (specs.checklist) {
    // Functional deductions (deduct €30 per non-working component)
    const checks = [
      { key: "screenWorking", label: "Screen" },
      { key: "batteryWorking", label: "Battery" },
      { key: "keyboardWorking", label: "Keyboard" },
      { key: "charging", label: "Charging" },
      { key: "portsWorking", label: "Ports" },
      { key: "wifi", label: "WiFi" },
      { key: "camera", label: "Camera" },
      { key: "display", label: "Display" },
      { key: "motherboard", label: "Motherboard" }
    ];

    let deductionCents = 0;
    checks.forEach((chk) => {
      const isWorking = (specs.checklist as any)[chk.key];
      // If checkbox was unchecked (undefined or false), deduct €30
      if (isWorking === false) {
        deductionCents += 3000; // -€30
      }
    });

    // Accessories adjustments
    if (specs.checklist.powerAdapterIncluded === false) {
      deductionCents += 2000; // -€20 if adapter not included
    }
    if (specs.checklist.originalBox === true) {
      value += 1500; // +€15 if box included
    }
    if (specs.checklist.accessoriesIncluded === true) {
      value += 1000; // +€10 if additional accessories included
    }

    value = Math.max(value - deductionCents, 0);
  }

  // 9. Clamp between €10 (minimum recyclable value) and Max Exchange Value
  const minRecycleCents = 1000; // €10
  return Math.min(Math.max(value, minRecycleCents), rules.maxExchangeValueCents);
}
