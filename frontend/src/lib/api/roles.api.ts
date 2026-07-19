import { api } from './client';
import type { Role } from '$lib/types';

export const rolesApi = {
  getAll: () => api.get<Role[]>('/roles'),
  getById: (id: string) => api.get<Role>(`/roles/${id}`),
  create: (data: any) => api.post<Role>('/roles', data),
  update: (id: string, data: any) => api.patch<Role>(`/roles/${id}`, data),
  delete: (id: string) => api.delete(`/roles/${id}`),
  assignPermissions: (id: string, permissionIds: string[]) =>
    api.put<Role>(`/roles/${id}/permissions`, { permissionIds }),
};
