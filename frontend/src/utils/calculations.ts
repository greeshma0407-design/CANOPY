import { EmissionCategory, ScenarioAssumptions, ScenarioCategoryDelta } from '../types';

/**
 * Core formula: emissions_kg_co2e = activity_quantity × emission_factor_kg_co2e_per_activity_unit
 * Convert to tCO2e by dividing by 1,000.
 */
export function calculateEmissions(
  quantity: number,
  factorValueKgPerUnit: number
): { kgCO2e: number; tCO2e: number } {
  if (isNaN(quantity) || isNaN(factorValueKgPerUnit) || quantity < 0) {
    return { kgCO2e: 0, tCO2e: 0 };
  }
  const kgCO2e = quantity * factorValueKgPerUnit;
  const tCO2e = kgCO2e / 1000;
  return {
    kgCO2e: Math.round(kgCO2e * 100) / 100,
    tCO2e: Math.round(tCO2e * 1000) / 1000
  };
}

/**
 * Trees equivalent: An average mature tree in a tropical/sub-tropical climate
 * sequesters approximately 22 kg of CO2 per year (0.022 tCO2e/year).
 */
export function calculateTreesEquivalent(avoided_tCO2e: number): number {
  if (avoided_tCO2e <= 0) return 0;
  return Math.round((avoided_tCO2e * 1000) / 22);
}

/**
 * Calculates scenario projections from baseline category totals and user-controlled assumptions.
 */
export function calculateScenarioProjection(
  baseline: {
    electricity_t_co2e: number;
    transport_t_co2e: number;
    waste_t_co2e: number;
  },
  assumptions: ScenarioAssumptions
): {
  baseline_total: number;
  projected_total: number;
  avoided_total: number;
  avoided_pct: number;
  trees_equivalent: number;
  category_deltas: ScenarioCategoryDelta[];
} {
  const {
    electricity_reduction_pct,
    renewable_energy_share_pct,
    bus_usage_increase_pct,
    car_usage_reduction_pct,
    waste_diversion_rate_pct
  } = assumptions;

  // 1. Electricity calculation:
  // Base electricity reduction through energy efficiency:
  const elecAfterEfficiency = baseline.electricity_t_co2e * (1 - electricity_reduction_pct / 100);
  // Renewable share replaces grid electricity with 0-emission factor (Scope 2 market-based):
  const elecProjected = Math.max(0, elecAfterEfficiency * (1 - renewable_energy_share_pct / 100));
  const elecAvoided = Math.max(0, baseline.electricity_t_co2e - elecProjected);

  // 2. Transport calculation:
  // Shifting from private cars to buses / active transit:
  // Baseline transport is ~60% bus, ~25% car, ~15% 2-wheelers.
  // Car reduction cuts ~25% portion by car_usage_reduction_pct.
  // Bus increase: shifting passengers to buses has ~50% lower emissions per p-km.
  const carAvoided = (baseline.transport_t_co2e * 0.25) * (car_usage_reduction_pct / 100);
  const busShiftEfficiencyAvoided = (baseline.transport_t_co2e * 0.15) * (bus_usage_increase_pct / 200);
  const transAvoided = Math.min(baseline.transport_t_co2e * 0.65, carAvoided + busShiftEfficiencyAvoided);
  const transProjected = Math.max(0, baseline.transport_t_co2e - transAvoided);

  // 3. Waste calculation:
  // Diverting waste from landfill (0.58 t/t) to composting (0.10 t/t) saves 0.48 t/t (~82.7% reduction on diverted fraction):
  const wasteAvoided = (baseline.waste_t_co2e * (waste_diversion_rate_pct / 100)) * (0.48 / 0.58);
  const wasteProjected = Math.max(0, baseline.waste_t_co2e - wasteAvoided);

  const baseline_total = baseline.electricity_t_co2e + baseline.transport_t_co2e + baseline.waste_t_co2e;
  const projected_total = Math.round((elecProjected + transProjected + wasteProjected) * 10) / 10;
  const avoided_total = Math.round((baseline_total - projected_total) * 10) / 10;
  const avoided_pct = baseline_total > 0 ? Math.round((avoided_total / baseline_total) * 1000) / 10 : 0;
  const trees_equivalent = calculateTreesEquivalent(avoided_total);

  const category_deltas: ScenarioCategoryDelta[] = [
    {
      category: 'electricity',
      label: 'Electricity (Scope 2)',
      baseline_t_co2e: baseline.electricity_t_co2e,
      projected_t_co2e: Math.round(elecProjected * 10) / 10,
      reduction_t_co2e: Math.round(elecAvoided * 10) / 10,
      reduction_pct: baseline.electricity_t_co2e > 0 ? Math.round((elecAvoided / baseline.electricity_t_co2e) * 1000) / 10 : 0,
      key_lever: `${electricity_reduction_pct}% efficiency + ${renewable_energy_share_pct}% renewable energy`
    },
    {
      category: 'transport',
      label: 'Transportation (Scope 3)',
      baseline_t_co2e: baseline.transport_t_co2e,
      projected_t_co2e: Math.round(transProjected * 10) / 10,
      reduction_t_co2e: Math.round(transAvoided * 10) / 10,
      reduction_pct: baseline.transport_t_co2e > 0 ? Math.round((transAvoided / baseline.transport_t_co2e) * 1000) / 10 : 0,
      key_lever: `${bus_usage_increase_pct}% transit boost & ${car_usage_reduction_pct}% car trips reduced`
    },
    {
      category: 'waste',
      label: 'Waste & Landfill (Scope 3)',
      baseline_t_co2e: baseline.waste_t_co2e,
      projected_t_co2e: Math.round(wasteProjected * 10) / 10,
      reduction_t_co2e: Math.round(wasteAvoided * 10) / 10,
      reduction_pct: baseline.waste_t_co2e > 0 ? Math.round((wasteAvoided / baseline.waste_t_co2e) * 1000) / 10 : 0,
      key_lever: `${waste_diversion_rate_pct}% organic waste diverted to composting`
    }
  ];

  return {
    baseline_total,
    projected_total,
    avoided_total,
    avoided_pct,
    trees_equivalent,
    category_deltas
  };
}

export function formatTCO2e(val: number, decimals: number = 1): string {
  if (isNaN(val)) return '0.0 tCO2e';
  return `${val.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })} tCO2e`;
}

export function formatKgCO2e(val: number, decimals: number = 0): string {
  if (isNaN(val)) return '0 kgCO2e';
  return `${val.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })} kgCO2e`;
}
