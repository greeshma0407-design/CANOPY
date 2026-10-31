import { EmissionCategory } from './emissions';

export interface ScenarioAssumptions {
  electricity_reduction_pct: number;    // 0-50%
  renewable_energy_share_pct: number;   // 0-100%
  bus_usage_increase_pct: number;       // 0-100%
  car_usage_reduction_pct: number;      // 0-50%
  waste_diversion_rate_pct: number;     // 0-80%
}

export interface ScenarioCategoryDelta {
  category: EmissionCategory;
  label: string;
  baseline_t_co2e: number;
  projected_t_co2e: number;
  reduction_t_co2e: number;
  reduction_pct: number;
  key_lever: string;
}

export interface Scenario {
  id: string;
  campus_id: string;
  name: string;
  description: string;
  created_at: string;
  is_prebuilt: boolean;
  assumptions: ScenarioAssumptions;
  baseline_t_co2e: number;
  projected_t_co2e: number;
  avoided_t_co2e: number;
  avoided_pct: number;
  trees_equivalent: number;
  category_deltas: ScenarioCategoryDelta[];
  disclaimer: string;
}

export interface ScenarioComparison {
  baseline_total: number;
  projected_total: number;
  absolute_reduction: number;
  percent_reduction: number;
  trees_equivalent: number;
  categories: {
    category: string;
    baseline: number;
    projected: number;
    delta: number;
    percent: number;
  }[];
}
