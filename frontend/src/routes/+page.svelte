<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { authStore } from '$lib/stores/auth';

  onMount(() => {
    const unsub = authStore.subscribe((state) => {
      if (state.isAuthenticated) {
        goto('/dashboard');
      } else {
        goto('/login');
      }
    });
    unsub();
  });
</script>

<div class="flex h-screen items-center justify-center">
  <div class="spinner"></div>
</div>
