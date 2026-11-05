export type EmissionCategory = 'electricity' | 'transport' | 'waste';

export interface EmissionFactor {
  id: string;
  category: EmissionCategory;
  activity_type: string;
  geography: string;
  activity_unit: string;
  factor_value: number; // in kgCO2e per activity_unit
  factor_unit: string;  // e.g. "kgCO2e/kWh", "kgCO2e/p-km"
  source_name: string;
  source_url?: string;
  methodology: string;
  version: string;
  valid_from: string;
  valid_to: string;
  notes: string;
  is_active: boolean;
  is_illustrative: boolean; // Stage 1 explicit label
}

export interface ActivityItem {
  id: string;
  activity_record_id: string;
  activity_type: string;
  quantity: number;
  unit: string;
  subcategory?: string;
  treatment_route?: string;
  mode?: string;
  factor_id?: string | null;
  factor_value?: number | null;
  emissions_kg_co2e: number;
  emissions_t_co2e: number;
  is_illustrative: boolean;
  notes?: string;
}

export interface ActivityRecord {
  id: string;
  campus_id: string;
  reporting_period_id: string;
  month: string;       // e.g. "2025-01"
  month_name: string;  // e.g. "January"
  category: EmissionCategory;
  status: 'draft' | 'verified' | 'final';
  notes?: string;
  data_source: string;
  items: ActivityItem[];
  total_kg_co2e: number;
  total_t_co2e: number;
}

export interface CalculationLine {
  id: string;
  category: EmissionCategory;
  description: string;
  quantity: number;
  unit: string;
  factor_id: string | null;
  factor_value: number | null;   // null means no factor found in DB
  factor_unit: string;
  factor_source: string;
  methodology: string;
  emissions_kg_co2e: number;
  emissions_t_co2e: number;
  is_illustrative: boolean;
  notes?: string;
  assumptions?: string;
  /** 'calculated' | 'missing_factor' | 'backend_offline' */
  status?: string;
}

export interface CalculationResult {
  total_kg_co2e: number;
  total_t_co2e: number;
  lines: CalculationLine[];
  completeness_status: 'complete' | 'partial' | 'unavailable';
  timestamp: string;
  has_unavailable_factors: boolean;
}

export interface CategoryBreakdown {
  category: EmissionCategory;
  label: string;
  emissions_t_co2e: number;
  percentage: number;
  color: string;
  trend_pct: number;
  trend_direction: 'up' | 'down' | 'neutral';
}

export interface MonthlyEmissions {
  month: string;
  month_short: string;
  month_name: string;
  electricity_t_co2e: number;
  transport_t_co2e: number;
  waste_t_co2e: number;
  total_t_co2e: number;
  is_complete: boolean;
}

export interface IntensityMetric {
  metric_name: string;
  value: number;
  unit: string;
  description: string;
  baseline_value: number;
  change_pct: number;
}
