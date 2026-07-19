import { api } from './client';
import type { ActivityLog, PaginatedResponse } from '$lib/types';

export const activityLogsApi = {
  getAll: (params?: Record<string, any>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get<PaginatedResponse<ActivityLog>>(`/activity-logs${query}`);
  },
  getRecent: (limit: number = 10) =>
    api.get<ActivityLog[]>(`/activity-logs/recent?limit=${limit}`),
};
