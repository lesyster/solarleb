// ============================================================================
// EDIT THIS: External AI webhook URL for generating solar plans.
// The "Get a Plan" form POSTs the form data here as JSON and expects a JSON
// response with: recommended_system_kw, recommended_battery, estimated_cost_low,
// estimated_cost_high, estimated_savings, payback_period, explanation_text.
// If empty or the request fails, a local heuristic fallback is used so the
// app still works end-to-end during development.
// ============================================================================
export const WEBHOOK_URL = "https://stout-mandate-estrogen.ngrok-free.dev/webhook/SolarLeb";

export type PlanInput = {
  city: string;
  monthly_bill: number;
  generator_hours: number;
  property_type: string;
  monthly_kwh?: number | null;
};

export type PlanResult = {
  system_size_kw: number;
  battery_capacity_kwh: number;
  battery_chemistry: string;
  panel_cost: number;
  battery_cost: number;
  installation_labor_cost: number;
  total_installation_cost: number;
  monthly_savings: number;
  payback_years: number;
  payback_months: number;
  recommended_panel_type: string;
  recommended_panel_reason: string;
  recommended_battery_type: string;
  recommended_battery_reason: string;
  summary: string;
};


// Local heuristic — used as a fallback if WEBHOOK_URL is empty or fails.
function localEstimate(input: PlanInput): PlanResult {
  // Estimate monthly kWh from bill if not provided (Lebanon avg blended rate ~$0.20/kWh + generator).
  const kwh = input.monthly_kwh && input.monthly_kwh > 0
    ? input.monthly_kwh
    : Math.max(150, Math.round(input.monthly_bill / 0.22));

  const dailyKwh = kwh / 30;
  const sunHours = input.city === "Bekaa" || input.city === "South Lebanon" ? 5.5 : 5.0;
  const systemKw = Math.max(1.5, Math.round((dailyKwh / sunHours) * 1.15 * 10) / 10);

  // Battery sized for evening use ~ 40-60% of daily consumption
  const batteryKwh = Math.max(2.4, Math.round(dailyKwh * 0.5 * 10) / 10);
  const batteryChemistry = "LiFePO₄";

  // Cost model (Lebanon market, 2024-2025)
  const panelCost = Math.round(systemKw * 1000);
  const batteryCost = Math.round(batteryKwh * 500);
  const laborCost = Math.round(systemKw * 150 + 200);
  const totalCost = panelCost + batteryCost + laborCost;

  // Savings vs current bill + generator diesel usage
  const dieselMonthly = input.generator_hours * 30 * 1.2;
  const currentMonthly = input.monthly_bill + dieselMonthly;
  const monthlySavings = Math.round(currentMonthly * 0.85);

  const paybackMonthsTotal = monthlySavings > 0
    ? Math.round(totalCost / monthlySavings)
    : 120;
  const paybackYears = Math.floor(paybackMonthsTotal / 12);
  const paybackMonths = paybackMonthsTotal % 12;

  const panelType = "Monocrystalline";
  const panelReason =
    `Monocrystalline panels deliver ~20-22% efficiency in Lebanon's high heat and produce more energy per m² than polycrystalline, which matters on limited rooftops.`;
  const batteryReason =
    `LiFePO₄ handles 40°C summers and daily deep cycling far better than lead-acid, with ~10x the cycle life and no ventilation requirements.`;

  const summary =
    `Based on your ${input.property_type.toLowerCase()} in ${input.city} with a $${input.monthly_bill} monthly bill ` +
    `and ${input.generator_hours} generator hours per day, a ${systemKw} kW ${panelType.toLowerCase()} array paired with a ${batteryKwh} kWh ${batteryChemistry} battery ` +
    `will cover ~85% of your annual energy needs at ${sunHours} peak sun hours. ` +
    `Expected monthly savings: $${monthlySavings.toLocaleString()} vs your current grid + generator combo.`;

  return {
    system_size_kw: systemKw,
    battery_capacity_kwh: batteryKwh,
    battery_chemistry: batteryChemistry,
    panel_cost: panelCost,
    battery_cost: batteryCost,
    installation_labor_cost: laborCost,
    total_installation_cost: totalCost,
    monthly_savings: monthlySavings,
    payback_years: paybackYears,
    payback_months: paybackMonths,
    recommended_panel_type: panelType,
    recommended_panel_reason: panelReason,
    recommended_battery_type: `${batteryChemistry} (Lithium Iron Phosphate)`,
    recommended_battery_reason: batteryReason,
    summary,
  };
}


export async function generatePlan(input: PlanInput): Promise<PlanResult> {
  if (WEBHOOK_URL) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      try {
        const res = await fetch(WEBHOOK_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify(input),
          signal: controller.signal,
        });
        if (res.ok) {
          const data = await res.json();
          if (data && typeof data.system_size_kw === "number") {
            return data as PlanResult;
          }
        }
      } finally {
        clearTimeout(timeoutId);
      }
    } catch (err) {
      console.warn("[SolarLeb] webhook failed, using local estimate", err);
    }
  }
  return localEstimate(input);
}

export const LEBANON_CITIES = [
  "Beirut",
  "Tripoli",
  "Sidon",
  "Bekaa",
  "Mount Lebanon",
  "South Lebanon",
  "North Lebanon",
  "Other",
];

export const PROPERTY_TYPES = ["Apartment", "House", "Small Business"];
