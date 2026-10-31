export interface ReportSection {
  id: string;
  title: string;
  subtitle?: string;
  type: 'executive_summary' | 'profile' | 'kpis' | 'category_breakdown' | 'methodology' | 'factors' | 'limitations';
  data?: Record<string, unknown> | Array<Record<string, unknown>>;
  text_content?: string;
}

export interface Report {
  id: string;
  campus_id: string;
  campus_name: string;
  reporting_period_id: string;
  period_label: string;
  generated_at: string;
  title: string;
  version: string;
  scope_coverage: string;
  total_emissions_t_co2e: number;
  electricity_t_co2e: number;
  transport_t_co2e: number;
  waste_t_co2e: number;
  per_student_t_co2e: number;
  status: 'draft' | 'final' | 'illustrative';
  author: string;
  disclaimer: string;
  sections: ReportSection[];
}
