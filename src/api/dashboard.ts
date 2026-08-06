import { apiClient } from './client';
import { DashboardData } from '../types';

export function fetchDashboard(): Promise<DashboardData> {
  return apiClient.get<DashboardData>('/dashboard').then((r) => r.data);
}
