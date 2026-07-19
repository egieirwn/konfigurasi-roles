<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { authStore } from '$lib/stores/auth';
  import { sidebar } from '$lib/stores/sidebar';
  import Sidebar from '$lib/components/layout/Sidebar.svelte';
  import Topbar from '$lib/components/layout/Topbar.svelte';
  import { cn } from '$lib/utils/cn';

  let { children } = $props();

  let isAuthenticated = $state(false);
  let isLoading = $state(true);
  let sidebarOpen = $state(true);

  authStore.subscribe((state) => {
    isAuthenticated = state.isAuthenticated;
  });

  sidebar.subscribe((state) => {
    sidebarOpen = state.isOpen;
  });

  onMount(() => {
    if (!isAuthenticated) {
      goto('/login');
      return;
    }
    isLoading = false;
  });
</script>

{#if isLoading}
  <div class="flex h-screen items-center justify-center bg-surface-0">
    <div class="flex flex-col items-center gap-4">
      <div class="spinner !w-8 !h-8"></div>
      <p class="text-sm text-text-muted">Loading...</p>
    </div>
  </div>
{:else}
  <div class="min-h-screen bg-surface-0">
    <Sidebar />

    <div class={cn(
      'transition-all duration-300',
      'lg:ml-64',
      !sidebarOpen && 'lg:!ml-20',
    )}>
      <Topbar />

      <main class="p-4 lg:p-6">
        {@render children()}
      </main>
    </div>
  </div>
{/if}
