export interface Campus {
  id: string;
  name: string;
  code: string;
  location: string;
  country: string;
  state: string;
  city?: string;
  institution_name?: string;
  institution_type?: string;
  population: number; // student + faculty + staff
  studentCount: number;
  facultyCount: number;
  staffCount: number;
  builtUpAreaSqM: number;
  campusAreaAcres: number;
  buildingCount?: number;
  building_count?: number;
  timezone: string;
  academicYear: string;
  baselineYear: string;
  description: string;
}

export interface BackendCampusRead {
  id: string;
  name: string;
  institution_name?: string | null;
  institution_type?: string | null;
  code?: string | null;
  location: string;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  population?: number | null;
  timezone: string;
  student_count?: number | null;
  faculty_count?: number | null;
  staff_count?: number | null;
  campus_area_acres?: number | null;
  built_up_area_sq_m?: number | null;
  building_count?: number | null;
  academic_year?: string | null;
  baseline_year?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ReportingPeriod {
  id: string;
  campus_id: string;
  start_date: string;
  end_date: string;
  label: string;
  year?: number;
  status: 'open' | 'closed' | 'archived' | 'locked';
  is_default: boolean;
  records_count?: number;
  completeness_pct?: number;
}
