import { EmissionCategory } from './emissions';

export type ImpactLevel = 'Low' | 'Medium' | 'High' | 'Very High';
export type EffortLevel = 'Low' | 'Medium' | 'High';
export type RecommendationStatus = 'Not Started' | 'Planned' | 'In Progress' | 'Completed';

export interface Recommendation {
  id: string;
  title: string;
  category: EmissionCategory;
  category_label?: string;
  priority?: number;
  impact_level: ImpactLevel;
  effort_level: EffortLevel;
  status: RecommendationStatus;
  short_description: string;
  rationale: string;
  estimated_annual_savings_t_co2e: number;
  cost_estimate: string;
  payback_period: string;
  rule_key: string;
  assumptions: string[];
  co_benefits: string[];
  timeline: string;
  target_quarter: string;
}
