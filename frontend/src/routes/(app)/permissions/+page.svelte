<script lang="ts">
  import { onMount } from 'svelte';
  import { permissionsApi } from '$lib/api/permissions.api';
  import Card from '$lib/components/ui/Card.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import type { Permission } from '$lib/types';

  let grouped = $state<Record<string, Permission[]>>({});
  let loading = $state(true);

  onMount(async () => {
    try { const r = await permissionsApi.getAll(); grouped = r.grouped; } catch {}
    loading = false;
  });
</script>

<svelte:head><title>Permissions — RBAC Panel</title></svelte:head>

<div class="space-y-6 animate-fade-in">
  <div><h1 class="text-2xl font-bold text-text-primary">Permissions</h1><p class="text-sm text-text-muted mt-1">System permissions by module</p></div>

  {#if loading}<div class="grid grid-cols-1 md:grid-cols-2 gap-4">{#each Array(4) as _}<div class="skeleton h-32 rounded-xl"></div>{/each}</div>
  {:else}
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {#each Object.entries(grouped) as [mod, perms]}
        <Card hover>
          <h3 class="text-base font-semibold text-text-primary capitalize mb-3 flex items-center gap-2">
            {mod} <Badge variant="outline">{perms.length}</Badge>
          </h3>
          <div class="space-y-2">
            {#each perms as p}
              <div class="flex items-center justify-between rounded-lg bg-surface-100/50 px-3 py-2">
                <div><p class="text-sm text-text-primary">{p.name}</p><p class="text-xs text-text-muted">{p.description}</p></div>
                <Badge variant="default">{p.action}</Badge>
              </div>
            {/each}
          </div>
        </Card>
      {/each}
    </div>
  {/if}
</div>
