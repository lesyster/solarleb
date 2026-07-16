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
  recommended_system_kw: number;
  recommended_battery: string;
  estimated_cost_low: number;
  estimated_cost_high: number;
  estimated_savings: number;
  payback_period: string;
  explanation_text: string;
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
  const battery = `${batteryKwh} kWh LiFePO₄`;

  // Cost ranges for Lebanon market (2024-2025)
  const costPerKwLow = 900;
  const costPerKwHigh = 1300;
  const batteryCost = batteryKwh * 450;
  const estLow = Math.round(systemKw * costPerKwLow + batteryCost);
  const estHigh = Math.round(systemKw * costPerKwHigh + batteryCost * 1.2);

  // Savings vs current bill + generator diesel usage
  const dieselMonthly = input.generator_hours * 30 * 1.2; // ~1.2 USD/hour small gen
  const currentMonthly = input.monthly_bill + dieselMonthly;
  const monthlySavings = Math.round(currentMonthly * 0.85);

  const paybackMonths = monthlySavings > 0
    ? Math.round(((estLow + estHigh) / 2) / monthlySavings)
    : 120;
  const y = Math.floor(paybackMonths / 12);
  const m = paybackMonths % 12;
  const payback = y > 0 ? `${y} year${y > 1 ? "s" : ""}${m ? ` ${m} months` : ""}` : `${m} months`;

  const explanation =
    `Based on your ${input.property_type.toLowerCase()} in ${input.city} with a $${input.monthly_bill} monthly electricity bill ` +
    `and ${input.generator_hours} generator hours per day, a ${systemKw} kW solar array paired with a ${battery} battery ` +
    `will cover roughly 85% of your energy needs year-round. Lebanon's sunny climate (${sunHours} peak sun hours in your region) ` +
    `makes this system highly efficient, and modern LiFePO₄ batteries handle heat and dust better than older lead-acid options. ` +
    `Expect to save around $${monthlySavings.toLocaleString()} per month versus your current grid + generator combo, ` +
    `with the system paying itself off in ${payback}.`;

  return {
    recommended_system_kw: systemKw,
    recommended_battery: battery,
    estimated_cost_low: estLow,
    estimated_cost_high: estHigh,
    estimated_savings: monthlySavings,
    payback_period: payback,
    explanation_text: explanation,
  };
}

export async function generatePlan(input: PlanInput): Promise<PlanResult> {
  if (WEBHOOK_URL) {
    try {
      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (res.ok) {
        const data = await res.json();
        if (data && typeof data.recommended_system_kw === "number") {
          return data as PlanResult;
        }
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
