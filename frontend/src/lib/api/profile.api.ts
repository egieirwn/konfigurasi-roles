import { api } from './client';

export const profileApi = {
  get: () => api.get('/profile'),
  update: (data: { name?: string; email?: string }) => api.patch('/profile', data),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.patch('/profile/password', data),
};
