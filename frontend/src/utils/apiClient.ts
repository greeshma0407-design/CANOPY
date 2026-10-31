/**
 * Typed API Client Stubs for Canopy Stage 2 Backend
 * HTTP/JSON target under /api/v1
 * Backend (Stage 2): Python FastAPI + SQLite / PostgreSQL
 */

import { Campus, ActivityRecord, EmissionFactor, Scenario, Recommendation } from '../types';
import { mockCampus } from '../data/campus';
import { mockActivityRecords } from '../data/activityRecords';
import { mockEmissionFactors } from '../data/emissionFactors';
import { mockScenarios } from '../data/scenarios';
import { mockRecommendations } from '../data/recommendations';

const API_BASE = '/api/v1';

export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
  stage: 'stage1-in-memory' | 'stage2-live';
}

export const canopyApi = {
  // Campus endpoints
  async getCampusProfile(campusId: string = 'campus-mlrit-01'): Promise<ApiResponse<Campus>> {
    // In Stage 1, returns mock in-memory data
    return {
      data: mockCampus,
      status: 200,
      stage: 'stage1-in-memory'
    };
  },

  // Activity record endpoints
  async getActivityRecords(periodId: string): Promise<ApiResponse<ActivityRecord[]>> {
    return {
      data: mockActivityRecords,
      status: 200,
      stage: 'stage1-in-memory'
    };
  },

  async postActivityRecord(record: Partial<ActivityRecord>): Promise<ApiResponse<ActivityRecord>> {
    console.log(`[Stage 1 Stub] POST ${API_BASE}/activity-records`, record);
    return {
      data: record as ActivityRecord,
      status: 201,
      message: 'Created in session cache',
      stage: 'stage1-in-memory'
    };
  },

  // Emission factor endpoints
  async getEmissionFactors(category?: string): Promise<ApiResponse<EmissionFactor[]>> {
    const factors = category
      ? mockEmissionFactors.filter(f => f.category === category)
      : mockEmissionFactors;
    return {
      data: factors,
      status: 200,
      stage: 'stage1-in-memory'
    };
  },

  // Scenario endpoints
  async getScenarios(): Promise<ApiResponse<Scenario[]>> {
    return {
      data: mockScenarios,
      status: 200,
      stage: 'stage1-in-memory'
    };
  },

  // Recommendations endpoints
  async getRecommendations(): Promise<ApiResponse<Recommendation[]>> {
    return {
      data: mockRecommendations,
      status: 200,
      stage: 'stage1-in-memory'
    };
  }
};
