// ============================================================================
// External AI webhook URL for generating solar plans.
// The "Get a Plan" form POSTs the form data here as JSON and expects a JSON
// response matching PlanResult (component-based schema with real product names).
// If the webhook is empty or fails, a local heuristic fallback is used so the
// app still works end-to-end during development.
// ============================================================================
export const WEBHOOK_URL = "https://stout-mandate-estrogen.ngrok-free.dev/webhook/SolarLeb";

export type PlanInput = {
  city: string;
  monthly_bill: number;
  generator_hours: number;
  property_type: string;
  amps_needed: number;
  voltage_layout: "24V" | "48V";
};

export type PlanResult = {
  system_size_kw: number;
  amps_needed: number;
  voltage_layout: string;

  panel_brand: string;
  panel_watt_each: number;
  num_panels: number;
  panel_unit_price: number;
  panel_total_cost: number;

  battery_brand: string;
  battery_ah_each: number;
  num_battery_units: number;
  battery_unit_price: number;
  battery_total_cost: number;

  inverter_name: string;
  inverter_total_cost: number;

  installation_misc_cost: number;
  total_installation_cost: number;

  monthly_savings: number;
  payback_years: number;
  payback_months: number;
  summary: string;
};


// Local heuristic fallback — used if WEBHOOK_URL is empty or fails.
function localEstimate(input: PlanInput): PlanResult {
  const kwh = Math.max(150, Math.round(input.monthly_bill / 0.22));
  const dailyKwh = kwh / 30;
  const sunHours = input.city === "Bekaa" || input.city === "South Lebanon" ? 5.5 : 5.0;
  const systemKw = Math.max(1.5, Math.round((dailyKwh / sunHours) * 1.15 * 10) / 10);

  const panelWatt = 550;
  const numPanels = Math.max(2, Math.ceil((systemKw * 1000) / panelWatt));
  const panelUnitPrice = 110;
  const panelTotal = numPanels * panelUnitPrice;

  const batteryAh = 200;
  const numBatteries = input.voltage_layout === "48V" ? 4 : 2;
  const batteryUnitPrice = 650;
  const batteryTotal = numBatteries * batteryUnitPrice;

  const inverterKw = Math.max(3, Math.ceil(systemKw));
  const inverterName = `Deye ${inverterKw}kW ${input.voltage_layout} Hybrid Inverter`;
  const inverterCost = inverterKw * 350;

  const miscCost = Math.round(systemKw * 120 + 200);
  const totalCost = panelTotal + batteryTotal + inverterCost + miscCost;

  const dieselMonthly = input.generator_hours * 30 * 1.2;
  const currentMonthly = input.monthly_bill + dieselMonthly;
  const monthlySavings = Math.round(currentMonthly * 0.85);

  const paybackMonthsTotal = monthlySavings > 0 ? Math.round(totalCost / monthlySavings) : 120;
  const paybackYears = Math.floor(paybackMonthsTotal / 12);
  const paybackMonths = paybackMonthsTotal % 12;

  const summary =
    `For your ${input.property_type.toLowerCase()} in ${input.city}, we recommend ${numPanels} Jinko ${panelWatt}W panels ` +
    `paired with ${numBatteries} Pylontech ${batteryAh}Ah lithium batteries on a ${input.voltage_layout} setup, driven by a ${inverterName}. ` +
    `This covers roughly ${input.amps_needed}A of demand and saves an estimated $${monthlySavings.toLocaleString()} per month versus your current grid + generator combo.`;

  return {
    system_size_kw: systemKw,
    amps_needed: input.amps_needed,
    voltage_layout: input.voltage_layout,
    panel_brand: "Jinko",
    panel_watt_each: panelWatt,
    num_panels: numPanels,
    panel_unit_price: panelUnitPrice,
    panel_total_cost: panelTotal,
    battery_brand: "Pylontech",
    battery_ah_each: batteryAh,
    num_battery_units: numBatteries,
    battery_unit_price: batteryUnitPrice,
    battery_total_cost: batteryTotal,
    inverter_name: inverterName,
    inverter_total_cost: inverterCost,
    installation_misc_cost: miscCost,
    total_installation_cost: totalCost,
    monthly_savings: monthlySavings,
    payback_years: paybackYears,
    payback_months: paybackMonths,
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
