<script lang="ts">
  import { goto } from '$app/navigation';
  import { authStore } from '$lib/stores/auth';
  import { authApi } from '$lib/api/auth.api';
  import { toastStore } from '$lib/stores/toast';
  import Button from '$lib/components/ui/Button.svelte';
  import Input from '$lib/components/ui/Input.svelte';

  let email = $state('');
  let password = $state('');
  let loading = $state(false);
  let errors = $state<Record<string, string>>({});

  async function handleLogin(e: Event) {
    e.preventDefault();
    errors = {};

    if (!email) errors.email = 'Email is required';
    if (!password) errors.password = 'Password is required';
    if (Object.keys(errors).length > 0) return;

    loading = true;
    try {
      const result = await authApi.login({ email, password });
      authStore.setAuth(result.user, result.accessToken, result.refreshToken);
      toastStore.success('Welcome back!');
      goto('/dashboard');
    } catch (err: any) {
      // Error is handled by API client toast
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>Login — RBAC Dashboard</title>
</svelte:head>

<div class="animate-slide-up">
  <!-- Logo -->
  <div class="text-center mb-8">
    <div class="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 text-white text-2xl font-bold shadow-xl shadow-brand-500/25 mb-4">
      R
    </div>
    <h1 class="text-2xl font-bold text-text-primary">Welcome Back</h1>
    <p class="text-sm text-text-muted mt-1">Sign in to your RBAC dashboard</p>
  </div>

  <!-- Form -->
  <form onsubmit={handleLogin} class="rounded-2xl border border-border bg-surface-50 p-6 shadow-xl">
    <div class="flex flex-col gap-4">
      <Input
        label="Email"
        type="email"
        placeholder="admin@admin.com"
        bind:value={email}
        error={errors.email}
        required
        id="login-email"
      />

      <Input
        label="Password"
        type="password"
        placeholder="••••••••"
        bind:value={password}
        error={errors.password}
        required
        id="login-password"
      />

      <Button type="submit" loading={loading} class="w-full mt-2">
        Sign In
      </Button>
    </div>

    <div class="mt-6 text-center">
      <p class="text-sm text-text-muted">
        Don't have an account?
        <a href="/register" class="text-brand-400 hover:text-brand-300 font-medium transition-colors">
          Sign Up
        </a>
      </p>
    </div>
  </form>

  <!-- Demo credentials hint -->
  <div class="mt-4 rounded-xl border border-border/50 bg-surface-50/50 p-4 text-center">
    <p class="text-xs text-text-muted">Demo credentials</p>
    <p class="text-xs font-mono text-text-secondary mt-1">admin@admin.com / Admin123!</p>
  </div>
</div>
