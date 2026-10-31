export interface Campus {
  id: string;
  name: string;
  code: string;
  location: string;
  country: string;
  state: string;
  population: number; // student + faculty + staff
  studentCount: number;
  facultyCount: number;
  staffCount: number;
  builtUpAreaSqM: number;
  campusAreaAcres: number;
  timezone: string;
  academicYear: string;
  baselineYear: string;
  description: string;
}

export interface ReportingPeriod {
  id: string;
  campus_id: string;
  start_date: string;
  end_date: string;
  label: string;
  year: number;
  status: 'open' | 'closed' | 'archived';
  is_default: boolean;
  records_count: number;
  completeness_pct: number;
}
