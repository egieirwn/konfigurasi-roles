import { api } from './client';
import type { LoginRequest, RegisterRequest, LoginResponse, AuthUser } from '$lib/types';

export const authApi = {
  login: (data: LoginRequest) => api.post<LoginResponse>('/auth/login', data),
  register: (data: RegisterRequest) => api.post<LoginResponse>('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  refresh: (refreshToken: string) => api.post('/auth/refresh', { refreshToken }),
  getMe: () => api.get<AuthUser>('/auth/me'),
};
