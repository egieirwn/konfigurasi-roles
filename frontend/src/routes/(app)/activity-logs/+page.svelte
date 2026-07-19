<script lang="ts">
  import { onMount } from 'svelte';
  import { activityLogsApi } from '$lib/api/activity-logs.api';
  import Card from '$lib/components/ui/Card.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Input from '$lib/components/ui/Input.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import { formatDateTime } from '$lib/utils/format';
  import type { ActivityLog } from '$lib/types';

  let logs = $state<ActivityLog[]>([]);
  let loading = $state(true);
  let search = $state('');
  let pg = $state(1);
  let totalPages = $state(1);
  let total = $state(0);
  let moduleFilter = $state('');

  const actionColors: Record<string, 'success'|'error'|'warning'|'info'> = {
    CREATE:'success', UPDATE:'info', DELETE:'error', LOGIN:'success', LOGOUT:'warning', REGISTER:'success'
  };

  async function load() {
    loading = true;
    try {
      const p: Record<string,string> = { page: String(pg), limit: '15' };
      if (search) p.search = search;
      if (moduleFilter) p.module = moduleFilter;
      const r = await activityLogsApi.getAll(p);
      logs = r.data; totalPages = r.meta.totalPages; total = r.meta.total;
    } catch {} loading = false;
  }

  onMount(load);
</script>

<svelte:head><title>Activity Logs — RBAC Panel</title></svelte:head>

<div class="space-y-6 animate-fade-in">
  <div><h1 class="text-2xl font-bold text-text-primary">Activity Logs</h1><p class="text-sm text-text-muted mt-1">{total} total entries</p></div>

  <Card class="!p-4">
    <form onsubmit={(e)=>{e.preventDefault();pg=1;load();}} class="flex flex-wrap gap-3">
      <div class="flex-1 min-w-48"><Input placeholder="Search..." bind:value={search} id="log-search" /></div>
      <select bind:value={moduleFilter} onchange={()=>{pg=1;load();}} class="h-10 rounded-lg border border-border bg-surface-50 px-3 text-sm text-text-primary">
        <option value="">All Modules</option>
        <option value="auth">Auth</option><option value="users">Users</option><option value="roles">Roles</option><option value="profile">Profile</option>
      </select>
      <Button type="submit" variant="outline">Search</Button>
    </form>
  </Card>

  <Card class="!p-0 overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead><tr class="border-b border-border bg-surface-100/50">
          <th class="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase">Action</th>
          <th class="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase">Module</th>
          <th class="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase">Description</th>
          <th class="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase">User</th>
          <th class="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase">Time</th>
        </tr></thead>
        <tbody>
          {#if loading}{#each Array(5) as _}<tr class="border-b border-border/50"><td class="px-4 py-3" colspan="5"><div class="skeleton h-8 w-full"></div></td></tr>{/each}
          {:else if logs.length===0}<tr><td colspan="5" class="px-4 py-12 text-center text-sm text-text-muted">No logs found</td></tr>
          {:else}{#each logs as log}
            <tr class="border-b border-border/50 hover:bg-surface-100/50 transition-colors">
              <td class="px-4 py-3"><Badge variant={actionColors[log.action]||'info'}>{log.action}</Badge></td>
              <td class="px-4 py-3"><span class="text-sm text-text-secondary capitalize">{log.module}</span></td>
              <td class="px-4 py-3"><span class="text-sm text-text-primary">{log.description}</span></td>
              <td class="px-4 py-3"><span class="text-sm text-text-muted">{log.user?.name||'System'}</span></td>
              <td class="px-4 py-3"><span class="text-xs text-text-muted">{formatDateTime(log.createdAt)}</span></td>
            </tr>
          {/each}{/if}
        </tbody>
      </table>
    </div>
    {#if totalPages > 1}<div class="flex items-center justify-between border-t border-border px-4 py-3"><p class="text-sm text-text-muted">Page {pg}/{totalPages}</p><div class="flex gap-2"><Button size="sm" variant="outline" disabled={pg<=1} onclick={()=>{pg--;load();}}>Prev</Button><Button size="sm" variant="outline" disabled={pg>=totalPages} onclick={()=>{pg++;load();}}>Next</Button></div></div>{/if}
  </Card>
</div>
