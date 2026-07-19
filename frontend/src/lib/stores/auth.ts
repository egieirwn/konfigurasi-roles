import { writable, derived } from 'svelte/store';
import type { AuthUser } from '$lib/types';

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const STORAGE_KEY = 'rbac_auth';

function getStoredAuth(): Partial<AuthState> {
  if (typeof window === 'undefined') return {};
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return {};
}

function createAuthStore() {
  const stored = getStoredAuth();

  const { subscribe, set, update } = writable<AuthState>({
    user: stored.user || null,
    accessToken: stored.accessToken || null,
    refreshToken: stored.refreshToken || null,
    isAuthenticated: !!stored.accessToken,
    isLoading: false,
  });

  function persist(state: AuthState) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }));
    }
  }

  return {
    subscribe,

    setAuth(user: AuthUser, accessToken: string, refreshToken: string) {
      const state: AuthState = {
        user,
        accessToken,
        refreshToken,
        isAuthenticated: true,
        isLoading: false,
      };
      set(state);
      persist(state);
    },

    setTokens(accessToken: string, refreshToken: string) {
      update((state) => {
        const newState = { ...state, accessToken, refreshToken };
        persist(newState);
        return newState;
      });
    },

    setUser(user: AuthUser) {
      update((state) => {
        const newState = { ...state, user };
        persist(newState);
        return newState;
      });
    },

    setLoading(isLoading: boolean) {
      update((state) => ({ ...state, isLoading }));
    },

    logout() {
      const state: AuthState = {
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
      };
      set(state);
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY);
      }
    },

    hasPermission(permission: string): boolean {
      const stored = getStoredAuth();
      return stored.user?.permissions?.includes(permission) ?? false;
    },

    hasAnyPermission(permissions: string[]): boolean {
      const stored = getStoredAuth();
      if (!stored.user?.permissions) return false;
      return permissions.some((p) => stored.user!.permissions.includes(p));
    },
  };
}

export const authStore = createAuthStore();

// Derived stores for convenience
export const currentUser = derived(authStore, ($auth) => $auth.user);
export const isAuthenticated = derived(authStore, ($auth) => $auth.isAuthenticated);
export const userPermissions = derived(authStore, ($auth) => $auth.user?.permissions || []);
export const userRole = derived(authStore, ($auth) => $auth.user?.role?.name || '');
