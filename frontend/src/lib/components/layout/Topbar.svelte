<script lang="ts">
  import { sidebar } from '$lib/stores/sidebar';
  import { authStore, currentUser } from '$lib/stores/auth';
  import { theme } from '$lib/stores/theme';
  import { goto } from '$app/navigation';
  import { getInitials } from '$lib/utils/format';
  import { authApi } from '$lib/api/auth.api';
  import Button from '$lib/components/ui/Button.svelte';

  let user = $state<any>(null);
  currentUser.subscribe((v) => user = v);

  let currentTheme = $state('dark');
  theme.subscribe((v) => currentTheme = v);

  let showDropdown = $state(false);

  async function handleLogout() {
    try {
      await authApi.logout();
    } catch {}
    authStore.logout();
    goto('/login');
  }
</script>

<header class="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-surface-50/80 backdrop-blur-md px-4 lg:px-6">
  <!-- Left side -->
  <div class="flex items-center gap-3">
    <!-- Mobile menu button -->
    <button
      onclick={() => sidebar.toggleMobile()}
      class="lg:hidden rounded-lg p-2 text-text-secondary hover:bg-surface-100 hover:text-text-primary transition-colors cursor-pointer"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="3" y1="12" x2="21" y2="12"></line>
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <line x1="3" y1="18" x2="21" y2="18"></line>
      </svg>
    </button>

    <div class="hidden sm:block">
      <h2 class="text-sm font-medium text-text-muted">Welcome back</h2>
      <p class="text-base font-semibold text-text-primary">{user?.name || 'User'}</p>
    </div>
  </div>

  <!-- Right side -->
  <div class="flex items-center gap-2">
    <!-- Theme toggle -->
    <button
      onclick={() => theme.toggle()}
      class="rounded-lg p-2.5 text-text-secondary hover:bg-surface-100 hover:text-text-primary transition-colors cursor-pointer"
      title="Toggle theme"
    >
      {#if currentTheme === 'dark'}
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>
      {:else}
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>
      {/if}
    </button>

    <!-- User dropdown -->
    <div class="relative">
      <button
        onclick={() => showDropdown = !showDropdown}
        class="flex items-center gap-2 rounded-lg p-1.5 hover:bg-surface-100 transition-colors cursor-pointer"
      >
        <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 text-white text-xs font-bold">
          {user ? getInitials(user.name) : '??'}
        </div>
        <div class="hidden md:block text-left">
          <p class="text-sm font-medium text-text-primary">{user?.name}</p>
          <p class="text-xs text-text-muted">{user?.role?.name}</p>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-text-muted hidden md:block">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      {#if showDropdown}
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div
          class="fixed inset-0 z-40"
          onclick={() => showDropdown = false}
        ></div>
        <div class="absolute right-0 top-full mt-2 z-50 w-56 rounded-xl border border-border bg-surface-50 py-1.5 shadow-xl animate-in">
          <div class="px-3 py-2 border-b border-border mb-1">
            <p class="text-sm font-medium text-text-primary">{user?.name}</p>
            <p class="text-xs text-text-muted">{user?.email}</p>
          </div>
          <a href="/profile" class="flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:bg-surface-100 hover:text-text-primary transition-colors" onclick={() => showDropdown = false}>
            <span>⚙️</span> Profile Settings
          </a>
          <hr class="my-1 border-border" />
          <button
            onclick={handleLogout}
            class="flex w-full items-center gap-2 px-3 py-2 text-sm text-error hover:bg-error/10 transition-colors cursor-pointer"
          >
            <span>🚪</span> Logout
          </button>
        </div>
      {/if}
    </div>
  </div>
</header>
