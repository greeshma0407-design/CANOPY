export type UserRole = 'ADMIN' | 'CAMPUS_ADMIN' | 'CAMPUS_MANAGER' | 'DATA_ENTRY_OPERATOR' | 'VIEWER';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  campus_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface LoginPayload {
  email: string;
  password: string;
  remember_me?: boolean;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface UserCreatePayload {
  email: string;
  full_name: string;
  password: string;
  role: UserRole;
  is_active?: boolean;
  campus_id?: string;
}

export interface UserUpdatePayload {
  email?: string;
  full_name?: string;
  role?: UserRole;
  is_active?: boolean;
  password?: string;
  campus_id?: string;
}

export interface CampusOnboardPayload {
  institution_name: string;
  institution_type?: string;
  campus_name: string;
  city?: string;
  state?: string;
  country?: string;
  timezone?: string;
  student_count?: number;
  faculty_count?: number;
  staff_count?: number;
  campus_area_acres?: number;
  built_up_area_sq_m?: number;
  building_count?: number;
  academic_year?: string;
  reporting_period_label?: string;
  reporting_period_start?: string;
  reporting_period_end?: string;
  baseline_year?: string;
  admin_name: string;
  admin_email: string;
  admin_password: string;
}

export interface Invitation {
  id: string;
  campus_id: string;
  email: string;
  role: UserRole;
  token: string;
  expires_at: string;
  is_accepted: boolean;
  created_at: string;
}

export interface InvitationVerifyResponse {
  token: string;
  email: string;
  campus_name: string;
  institution_name?: string;
  role: string;
  is_valid: boolean;
  message?: string;
}

export interface RegisterInvitedPayload {
  token: string;
  full_name: string;
  password: string;
}
