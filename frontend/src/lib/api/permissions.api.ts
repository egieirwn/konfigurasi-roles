import { api } from './client';
import type { Permission } from '$lib/types';

export const permissionsApi = {
  getAll: () => api.get<{ permissions: Permission[]; grouped: Record<string, Permission[]> }>('/permissions'),
};
