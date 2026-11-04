/// <reference types="vite/client" />
/**
 * CANOPY Typed API Client
 * Real HTTP connection to FastAPI backend under /api/v1
 */
import {
  User,
  LoginPayload,
  TokenResponse,
  UserCreatePayload,
  UserUpdatePayload,
  CampusOnboardPayload,
  Invitation,
  InvitationVerifyResponse,
  RegisterInvitedPayload,
  BackendCampusRead,
  ReportingPeriod,
} from '../types';

const BACKEND_BASE = (import.meta as any).env?.VITE_API_URL || 'http://127.0.0.1:8000';
const API_BASE = `${BACKEND_BASE}/api/v1`;

export interface ApiError {
  status: number;
  message: string;
  detail?: any;
}

export interface HealthResponse {
  status: string;
  service: string;
  methodology_version: string;
}

export interface AnalyticsSummaryResponse {
  campus_id: string;
  reporting_period_id: string;
  total_kg_co2e: number;
  total_tco2e: number;
  completeness_status: 'complete' | 'partial' | 'no_data';
  categories: Record<string, number>;
  warnings: string[];
}

export interface AnalyticsTrendEntry {
  period_id: string;
  label: string;
  start_date: string;
  end_date: string;
  total_kg_co2e: number;
  total_tco2e: number;
  completeness_status: string;
  categories: Record<string, number>;
}

export interface PreviewItemInput {
  activity_type: string;
  quantity: number;
  unit: string;
  category: string;
  subcategory?: string;
}

export interface CalculationPreviewRequest {
  items: PreviewItemInput[];
  reference_date?: string;
}

export interface CalculationLineResult {
  activity_type: string;
  category: string;
  quantity: number;
  unit: string;
  factor_id?: string | null;
  factor_value?: number | null;
  emissions_kg_co2e?: number | null;
  emissions_tco2e?: number | null;
  status: 'calculated' | 'missing_factor';
  notes?: string | null;
}

export interface CalculationPreviewResponse {
  lines: CalculationLineResult[];
  total_kg_co2e: number;
  total_tco2e: number;
  completeness_status: 'complete' | 'partial' | 'no_data';
  warnings: string[];
  methodology_version: string;
}

export interface ActivityItemCreate {
  activity_type: string;
  quantity: number;
  unit: string;
  subcategory?: string;
  metadata_json?: Record<string, unknown>;
  factor_id?: string;
}

export interface ActivityRecordCreate {
  campus_id: string;
  reporting_period_id: string;
  category: 'electricity' | 'transport' | 'waste';
  status?: string;
  notes?: string;
  data_source?: string;
  items: ActivityItemCreate[];
}

export interface ActivityItemRead {
  id: string;
  activity_record_id: string;
  activity_type: string;
  quantity: number;
  unit: string;
  subcategory?: string;
  metadata_json?: string;
  factor_id?: string;
}

export interface ActivityRecordRead {
  id: string;
  campus_id: string;
  reporting_period_id: string;
  category: string;
  status: string;
  notes?: string;
  data_source?: string;
  created_at: string;
  updated_at: string;
  activity_items: ActivityItemRead[];
}

export interface ScenarioItemCreate {
  category: string;
  activity_type: string;
  quantity: number;
  unit: string;
  factor_id?: string;
  subcategory?: string;
}

export interface ScenarioCreate {
  campus_id: string;
  name: string;
  description?: string;
  items: ScenarioItemCreate[];
}

export interface ScenarioItemRead {
  id: string;
  scenario_id: string;
  category: string;
  activity_type: string;
  quantity: number;
  unit: string;
  factor_id?: string;
  subcategory?: string;
}

export interface ScenarioRead {
  id: string;
  campus_id: string;
  name: string;
  description?: string;
  status: string;
  items: ScenarioItemRead[];
}

export interface ScenarioCompareRequest {
  scenario_a_id: string;
  scenario_b_id: string;
  geography?: string;
  reference_date?: string;
}

export interface ScenarioDelta {
  category: string;
  activity_type: string;
  scenario_a_kg?: number | null;
  scenario_b_kg?: number | null;
  delta_kg?: number | null;
}

export interface ScenarioCompareResponse {
  scenario_a_id: string;
  scenario_b_id: string;
  scenario_a_total_kg_co2e: number;
  scenario_b_total_kg_co2e: number;
  delta_kg_co2e: number;
  delta_tco2e: number;
  completeness_status: string;
  warnings: string[];
  lines: ScenarioDelta[];
}

export interface RecommendationRead {
  id: string;
  title: string;
  category: string;
  short_description: string;
  rationale?: string;
  effort_level: string;
  impact_level: string;
  priority: number;
  rule_key: string;
  assumptions?: string | string[];
  co_benefits?: string | string[];
  estimated_annual_savings_tco2e?: number;
  cost_estimate?: string;
  payback_period?: string;
  target_quarter?: string;
  timeline?: string;
  status: string;
  is_active: boolean;
}

export interface ReportCreate {
  campus_id: string;
  reporting_period_id: string;
  title: string;
  format?: string;
}

export interface ReportRead {
  id: string;
  campus_id: string;
  reporting_period_id: string;
  title: string;
  format: string;
  status: string;
  file_path?: string;
  created_at: string;
}

// In-memory token holder + localStorage sync
let authToken: string | null = typeof window !== 'undefined' ? localStorage.getItem('canopy_token') : null;

export function setAuthToken(token: string | null) {
  authToken = token;
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('canopy_token', token);
    } else {
      localStorage.removeItem('canopy_token');
    }
  }
}

export function getAuthToken(): string | null {
  if (!authToken && typeof window !== 'undefined') {
    authToken = localStorage.getItem('canopy_token');
  }
  return authToken;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const token = getAuthToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> || {}),
  };

  try {
    const response = await fetch(url, {
      credentials: 'include', // sends/receives HttpOnly cookies
      ...options,
      headers,
    });

    if (!response.ok) {
      let detail: unknown = 'Request failed';
      try {
        const errJson = await response.json();
        detail = errJson.detail || errJson.message || errJson;
      } catch {
        detail = await response.text();
      }
      const err: ApiError = {
        status: response.status,
        message: typeof detail === 'string' ? detail : `HTTP Error ${response.status}`,
        detail,
      };
      throw err;
    }

    return await response.json() as T;
  } catch (error: unknown) {
    if ((error as ApiError).status) {
      throw error;
    }
    // Network or server unreachable
    const err: ApiError = {
      status: 0,
      message: error instanceof Error ? error.message : 'Network error or backend unreachable',
      detail: error,
    };
    throw err;
  }
}

export const canopyApi = {
  // Base URL info
  getBaseUrl(): string {
    return API_BASE;
  },

  // Health check
  async healthCheck(): Promise<HealthResponse> {
    return request<HealthResponse>('/health');
  },

  // Analytics
  async getSummary(
    campusId: string = 'campus-mlrit-01',
    periodId: string = 'period-cy2025-01',
    geography: string = 'IN-Telangana'
  ): Promise<AnalyticsSummaryResponse> {
    const params = new URLSearchParams({
      campus_id: campusId,
      period_id: periodId,
      geography,
    });
    return request<AnalyticsSummaryResponse>(`/analytics/summary?${params.toString()}`);
  },

  async getTrends(
    campusId: string = 'campus-mlrit-01',
    geography: string = 'IN-Telangana'
  ): Promise<AnalyticsTrendEntry[]> {
    const params = new URLSearchParams({
      campus_id: campusId,
      geography,
    });
    return request<AnalyticsTrendEntry[]>(`/analytics/trends?${params.toString()}`);
  },

  // Calculations Preview
  async previewCalculation(
    payload: CalculationPreviewRequest,
    geography: string = 'IN-Telangana'
  ): Promise<CalculationPreviewResponse> {
    const params = new URLSearchParams({ geography });
    return request<CalculationPreviewResponse>(`/calculations/preview?${params.toString()}`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // Activity Records
  async getRecords(
    campusId?: string,
    periodId?: string,
    category?: string
  ): Promise<ActivityRecordRead[]> {
    const params = new URLSearchParams();
    if (campusId) params.append('campus_id', campusId);
    if (periodId) params.append('period_id', periodId);
    if (category) params.append('category', category);
    const query = params.toString() ? `?${params.toString()}` : '';
    return request<ActivityRecordRead[]>(`/records${query}`);
  },

  async getRecordById(recordId: string): Promise<ActivityRecordRead> {
    return request<ActivityRecordRead>(`/records/${recordId}`);
  },

  async createRecord(payload: ActivityRecordCreate): Promise<ActivityRecordRead> {
    return request<ActivityRecordRead>('/records', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // Scenarios
  async getScenarios(campusId?: string): Promise<ScenarioRead[]> {
    const params = new URLSearchParams();
    if (campusId) params.append('campus_id', campusId);
    const query = params.toString() ? `?${params.toString()}` : '';
    return request<ScenarioRead[]>(`/scenarios${query}`);
  },

  async getScenarioById(scenarioId: string): Promise<ScenarioRead> {
    return request<ScenarioRead>(`/scenarios/${scenarioId}`);
  },

  async createScenario(payload: ScenarioCreate): Promise<ScenarioRead> {
    return request<ScenarioRead>('/scenarios', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async compareScenarios(payload: ScenarioCompareRequest): Promise<ScenarioCompareResponse> {
    return request<ScenarioCompareResponse>('/scenarios/compare', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // Recommendations
  async getRecommendations(
    category?: string,
    status?: string,
    isActive?: boolean
  ): Promise<RecommendationRead[]> {
    const params = new URLSearchParams();
    if (category && category !== 'all') params.append('category', category);
    if (status && status !== 'all') params.append('status', status);
    if (isActive !== undefined) params.append('is_active', String(isActive));
    const query = params.toString() ? `?${params.toString()}` : '';
    return request<RecommendationRead[]>(`/recommendations${query}`);
  },

  // Reports
  async createReport(payload: ReportCreate): Promise<ReportRead> {
    return request<ReportRead>('/reports', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getReport(reportId: string): Promise<ReportRead> {
    return request<ReportRead>(`/reports/${reportId}`);
  },

  async downloadReportCsv(reportId: string): Promise<string> {
    const url = `${API_BASE}/reports/${reportId}/download`;
    const token = getAuthToken();
    const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await fetch(url, { credentials: 'include', headers });
    if (!res.ok) {
      throw new Error(`Download failed with status ${res.status}`);
    }
    return res.text();
  },

  // Authentication
  async login(payload: LoginPayload): Promise<TokenResponse> {
    const res = await request<TokenResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (res && res.access_token) {
      setAuthToken(res.access_token);
    }
    return res;
  },

  async getMe(): Promise<User> {
    return request<User>('/auth/me');
  },

  async logout(): Promise<{ message: string }> {
    try {
      const res = await request<{ message: string }>('/auth/logout', {
        method: 'POST',
      });
      return res;
    } finally {
      setAuthToken(null);
    }
  },

  // User Management (Admin only)
  async getUsers(): Promise<User[]> {
    return request<User[]>('/users');
  },

  async createUser(payload: UserCreatePayload): Promise<User> {
    return request<User>('/users', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateUser(userId: string, payload: UserUpdatePayload): Promise<User> {
    return request<User>(`/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  async deleteUser(userId: string): Promise<{ message: string; id: string }> {
    return request<{ message: string; id: string }>(`/users/${userId}`, {
      method: 'DELETE',
    });
  },

  // Campus Onboarding & Profile
  async onboardCampus(payload: CampusOnboardPayload): Promise<{ access_token: string; user: User; campus: BackendCampusRead }> {
    const res = await request<{ access_token: string; user: User; campus: BackendCampusRead }>('/campuses/onboard', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (res && res.access_token) {
      setAuthToken(res.access_token);
    }
    return res;
  },

  async getMyCampus(): Promise<BackendCampusRead> {
    return request<BackendCampusRead>('/campuses/me');
  },

  async updateMyCampus(payload: Partial<BackendCampusRead>): Promise<BackendCampusRead> {
    return request<BackendCampusRead>('/campuses/me', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  async getMyCampusPeriods(): Promise<ReportingPeriod[]> {
    return request<ReportingPeriod[]>('/campuses/me/periods');
  },

  async createCampusPeriod(payload: { start_date: string; end_date: string; label: string; status?: string }): Promise<ReportingPeriod> {
    return request<ReportingPeriod>('/campuses/me/periods', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // Invitations
  async createInvitation(payload: { email: string; role: string }): Promise<Invitation> {
    return request<Invitation>('/invitations', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getInvitations(): Promise<Invitation[]> {
    return request<Invitation[]>('/invitations');
  },

  async revokeInvitation(invitationId: string): Promise<void> {
    await request<void>(`/invitations/${invitationId}`, {
      method: 'DELETE',
    });
  },

  async verifyInvitation(token: string): Promise<InvitationVerifyResponse> {
    return request<InvitationVerifyResponse>(`/invitations/verify/${token}`);
  },

  async registerInvited(payload: RegisterInvitedPayload): Promise<TokenResponse> {
    const res = await request<TokenResponse>('/auth/register-invited', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (res && res.access_token) {
      setAuthToken(res.access_token);
    }
    return res;
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    return request<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },
};
