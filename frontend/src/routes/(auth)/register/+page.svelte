<script lang="ts">
  import { goto } from '$app/navigation';
  import { authStore } from '$lib/stores/auth';
  import { authApi } from '$lib/api/auth.api';
  import { toastStore } from '$lib/stores/toast';
  import Button from '$lib/components/ui/Button.svelte';
  import Input from '$lib/components/ui/Input.svelte';

  let name = $state('');
  let email = $state('');
  let password = $state('');
  let loading = $state(false);
  let errors = $state<Record<string, string>>({});

  async function handleRegister(e: Event) {
    e.preventDefault();
    errors = {};

    if (!name || name.length < 2) errors.name = 'Name must be at least 2 characters';
    if (!email) errors.email = 'Email is required';
    if (!password || password.length < 8) errors.password = 'Password must be at least 8 characters';
    if (password && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(password)) {
      errors.password = 'Password must contain uppercase, lowercase, number and special character';
    }
    if (Object.keys(errors).length > 0) return;

    loading = true;
    try {
      const result = await authApi.register({ name, email, password });
      authStore.setAuth(result.user, result.accessToken, result.refreshToken);
      toastStore.success('Account created successfully!');
      goto('/dashboard');
    } catch (err: any) {
      // Error handled by API client
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>Register — RBAC Dashboard</title>
</svelte:head>

<div class="animate-slide-up">
  <div class="text-center mb-8">
    <div class="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 text-white text-2xl font-bold shadow-xl shadow-brand-500/25 mb-4">
      R
    </div>
    <h1 class="text-2xl font-bold text-text-primary">Create Account</h1>
    <p class="text-sm text-text-muted mt-1">Join the RBAC dashboard</p>
  </div>

  <form onsubmit={handleRegister} class="rounded-2xl border border-border bg-surface-50 p-6 shadow-xl">
    <div class="flex flex-col gap-4">
      <Input
        label="Full Name"
        placeholder="John Doe"
        bind:value={name}
        error={errors.name}
        required
        id="register-name"
      />

      <Input
        label="Email"
        type="email"
        placeholder="john@example.com"
        bind:value={email}
        error={errors.email}
        required
        id="register-email"
      />

      <Input
        label="Password"
        type="password"
        placeholder="Min. 8 characters"
        bind:value={password}
        error={errors.password}
        required
        id="register-password"
      />

      <p class="text-xs text-text-muted -mt-2">
        Must contain uppercase, lowercase, number, and special character
      </p>

      <Button type="submit" loading={loading} class="w-full mt-2">
        Create Account
      </Button>
    </div>

    <div class="mt-6 text-center">
      <p class="text-sm text-text-muted">
        Already have an account?
        <a href="/login" class="text-brand-400 hover:text-brand-300 font-medium transition-colors">
          Sign In
        </a>
      </p>
    </div>
  </form>
</div>
