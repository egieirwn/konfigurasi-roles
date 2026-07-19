import { api } from './client';
import type { User, PaginatedResponse } from '$lib/types';

export const usersApi = {
  getAll: (params?: Record<string, any>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get<PaginatedResponse<User>>(`/users${query}`);
  },
  getById: (id: string) => api.get<User>(`/users/${id}`),
  create: (data: any) => api.post<User>('/users', data),
  update: (id: string, data: any) => api.patch<User>(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
  getStats: () => api.get('/users/stats'),
};
