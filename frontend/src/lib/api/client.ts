import { PUBLIC_API_URL } from '$env/static/public';
import { authStore } from '$lib/stores/auth';
import { addToast } from '$lib/stores/toast';
import type { ApiResponse } from '$lib/types';
import { goto } from '$app/navigation';

let accessToken: string | null = null;
let refreshToken: string | null = null;
let isRefreshing = false;
let failedQueue: Array<{ resolve: Function; reject: Function }> = [];

// Subscribe to auth store to keep tokens in sync
authStore.subscribe((state) => {
  accessToken = state.accessToken;
  refreshToken = state.refreshToken;
});

function processQueue(error: Error | null, token: string | null = null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  failedQueue = [];
}

async function refreshAccessToken(): Promise<string> {
  if (!refreshToken) throw new Error('No refresh token');

  const response = await fetch(`${PUBLIC_API_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    throw new Error('Token refresh failed');
  }

  const result: ApiResponse = await response.json();
  const { accessToken: newAccessToken, refreshToken: newRefreshToken } = result.data;

  authStore.setTokens(newAccessToken, newRefreshToken);
  return newAccessToken;
}

export async function apiClient<T = any>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${PUBLIC_API_URL}${endpoint}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  let response: Response;

  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (err) {
    // Network error — backend not reachable
    const message = 'Cannot connect to server. Make sure the backend is running on ' + PUBLIC_API_URL;
    addToast(message, 'error', 6000);
    throw new Error(message);
  }

  // Handle 401 — try refresh
  if (response.status === 401 && refreshToken) {
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const newToken = await refreshAccessToken();
        isRefreshing = false;
        processQueue(null, newToken);

        // Retry original request
        headers['Authorization'] = `Bearer ${newToken}`;
        response = await fetch(url, { ...options, headers });
      } catch (err) {
        isRefreshing = false;
        processQueue(err as Error);
        authStore.logout();
        goto('/login');
        throw err;
      }
    } else {
      // Queue this request until refresh completes
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: async (token: string) => {
            headers['Authorization'] = `Bearer ${token}`;
            try {
              const retryResponse = await fetch(url, { ...options, headers });
              const retryData = await retryResponse.json();
              resolve(retryData.data ?? retryData);
            } catch (e) {
              reject(e);
            }
          },
          reject,
        });
      });
    }
  }

  let result: ApiResponse<T>;
  try {
    result = await response.json();
  } catch {
    const message = 'Invalid response from server';
    addToast(message, 'error');
    throw new Error(message);
  }

  if (!response.ok || !result.success) {
    let errorMessage = result.message || 'An error occurred';
    // Show detailed validation errors
    if (result.errors && Array.isArray(result.errors)) {
      errorMessage = result.errors.join(', ');
    }
    addToast(errorMessage, 'error', 6000);
    throw new Error(errorMessage);
  }

  return result.data;
}

// Convenience methods
export const api = {
  get: <T = any>(endpoint: string) => apiClient<T>(endpoint),

  post: <T = any>(endpoint: string, data?: any) =>
    apiClient<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),

  patch: <T = any>(endpoint: string, data?: any) =>
    apiClient<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    }),

  put: <T = any>(endpoint: string, data?: any) =>
    apiClient<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: <T = any>(endpoint: string) =>
    apiClient<T>(endpoint, { method: 'DELETE' }),
};
