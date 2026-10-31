import { Campus, ReportingPeriod } from '../types';

export const mockCampus: Campus = {
  id: 'campus-mlrit-01',
  name: 'Marri Laxman Reddy Institute of Technology (MLRIT)',
  code: 'MLRIT-HYD',
  location: 'Dundigal, Hyderabad, Telangana',
  country: 'India',
  state: 'Telangana',
  population: 3400,
  studentCount: 3000,
  facultyCount: 240,
  staffCount: 160,
  builtUpAreaSqM: 48500,
  campusAreaAcres: 24.5,
  timezone: 'Asia/Kolkata (IST)',
  academicYear: '2025-2026',
  baselineYear: '2024',
  description: 'Autonomous engineering institution committed to academic excellence, green campus infrastructure, and environmental stewardship in Hyderabad metropolitan area.'
};

export const mockReportingPeriods: ReportingPeriod[] = [
  {
    id: 'period-2025',
    campus_id: 'campus-mlrit-01',
    start_date: '2025-01-01',
    end_date: '2025-12-31',
    label: 'CY 2025 (Current)',
    year: 2025,
    status: 'open',
    is_default: true,
    records_count: 36,
    completeness_pct: 95
  },
  {
    id: 'period-2024',
    campus_id: 'campus-mlrit-01',
    start_date: '2024-01-01',
    end_date: '2024-12-31',
    label: 'CY 2024 (Baseline)',
    year: 2024,
    status: 'closed',
    is_default: false,
    records_count: 36,
    completeness_pct: 100
  },
  {
    id: 'period-2023',
    campus_id: 'campus-mlrit-01',
    start_date: '2023-01-01',
    end_date: '2023-12-31',
    label: 'CY 2023 (Historical)',
    year: 2023,
    status: 'archived',
    is_default: false,
    records_count: 36,
    completeness_pct: 92
  }
];
