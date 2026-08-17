/**
 * Exchange programme configuration.
 *
 * These are **internal reference values** for the Rhydm review team — which
 * brands and categories we accept, the ceiling we will pay, what pickup costs,
 * and rough per-category starting points used as human guidance.
 *
 * There is deliberately no automatic valuation function here. Customers never
 * receive a computed estimate; every offer is decided by a person and recorded
 * on the request from the admin panel (see `updateExchangeStatusAction`).
 */
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
