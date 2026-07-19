<script lang="ts">
  import { onMount } from 'svelte';
  import { currentUser, userRole, userPermissions } from '$lib/stores/auth';
  import { usersApi } from '$lib/api/users.api';
  import { activityLogsApi } from '$lib/api/activity-logs.api';
  import Card from '$lib/components/ui/Card.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import { formatRelativeTime } from '$lib/utils/format';
  import type { ActivityLog } from '$lib/types';

  let user = $state<any>(null);
  let role = $state('');
  let permissions: string[] = $state([]);
  currentUser.subscribe((v) => user = v);
  userRole.subscribe((v) => role = v);
  userPermissions.subscribe((v) => permissions = v);

  let stats = $state<any>(null);
  let recentActivity = $state<ActivityLog[]>([]);
  let loading = $state(true);

  const statCards = $derived([
    { label: 'Total Users', value: stats?.totalUsers ?? '—', icon: '👥', color: 'from-blue-500 to-cyan-500', change: '+12%' },
    { label: 'Active Users', value: stats?.activeUsers ?? '—', icon: '✅', color: 'from-emerald-500 to-green-500', change: '+5%' },
    { label: 'Inactive Users', value: stats?.inactiveUsers ?? '—', icon: '⏸️', color: 'from-amber-500 to-orange-500', change: '-2%' },
    { label: 'Total Roles', value: stats?.usersByRole?.length ?? '—', icon: '🛡️', color: 'from-violet-500 to-purple-500', change: '0%' },
  ]);

  onMount(async () => {
    try {
      if (permissions.includes('users:read')) {
        stats = await usersApi.getStats();
      }
      if (permissions.includes('activity-logs:read')) {
        recentActivity = await activityLogsApi.getRecent(8);
      }
    } catch (e) {
      // Handled by API client
    } finally {
      loading = false;
    }
  });

  const actionColors: Record<string, 'success' | 'error' | 'warning' | 'info'> = {
    CREATE: 'success',
    UPDATE: 'info',
    DELETE: 'error',
    LOGIN: 'success',
    LOGOUT: 'warning',
    REGISTER: 'success',
  };
</script>

<svelte:head>
  <title>Dashboard — RBAC Panel</title>
</svelte:head>

<div class="space-y-6 animate-fade-in">
  <!-- Page Header -->
  <div>
    <h1 class="text-2xl font-bold text-text-primary">Dashboard</h1>
    <p class="text-sm text-text-muted mt-1">Overview of your system at a glance</p>
  </div>

  <!-- Stats Grid -->
  {#if permissions.includes('users:read')}
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {#each statCards as card, i}
        <div class="animate-slide-up" style="animation-delay: {i * 80}ms">
          <Card hover>
            <div class="flex items-start justify-between">
              <div>
                <p class="text-sm text-text-muted">{card.label}</p>
                <p class="text-3xl font-bold text-text-primary mt-1">
                  {#if loading}
                    <span class="skeleton inline-block w-12 h-8"></span>
                  {:else}
                    {card.value}
                  {/if}
                </p>
              </div>
              <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br {card.color} text-white text-xl shadow-lg">
                {card.icon}
              </div>
            </div>
          </Card>
        </div>
      {/each}
    </div>
  {/if}

  <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
    <!-- Users by Role -->
    {#if stats?.usersByRole && permissions.includes('users:read')}
      <Card class="xl:col-span-1">
        <h3 class="text-base font-semibold text-text-primary mb-4">Users by Role</h3>
        <div class="space-y-3">
          {#each stats.usersByRole as item}
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="h-3 w-3 rounded-full bg-gradient-to-br from-brand-400 to-brand-600"></div>
                <span class="text-sm text-text-secondary">{item.role}</span>
              </div>
              <Badge variant="default">{item.count}</Badge>
            </div>
          {/each}
        </div>
      </Card>
    {/if}

    <!-- Recent Activity -->
    {#if permissions.includes('activity-logs:read')}
      <Card class="xl:col-span-2">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-base font-semibold text-text-primary">Recent Activity</h3>
          <a href="/activity-logs" class="text-xs text-brand-400 hover:text-brand-300 transition-colors">View All →</a>
        </div>

        {#if loading}
          <div class="space-y-3">
            {#each Array(5) as _}
              <div class="skeleton h-12 w-full"></div>
            {/each}
          </div>
        {:else if recentActivity.length === 0}
          <p class="text-sm text-text-muted text-center py-8">No recent activity</p>
        {:else}
          <div class="space-y-2">
            {#each recentActivity as log}
              <div class="flex items-center gap-3 rounded-lg border border-border/50 bg-surface-100/50 p-3 hover:bg-surface-100 transition-colors">
                <Badge variant={actionColors[log.action] || 'info'}>
                  {log.action}
                </Badge>
                <div class="flex-1 min-w-0">
                  <p class="text-sm text-text-primary truncate">{log.description}</p>
                  <p class="text-xs text-text-muted">{log.user?.name || 'System'}</p>
                </div>
                <span class="text-xs text-text-muted shrink-0">{formatRelativeTime(log.createdAt)}</span>
              </div>
            {/each}
          </div>
        {/if}
      </Card>
    {/if}
  </div>

  <!-- Quick Info -->
  <Card>
    <div class="flex flex-wrap items-center gap-4">
      <div class="flex items-center gap-2">
        <span class="text-sm text-text-muted">Your Role:</span>
        <Badge variant="default">{role}</Badge>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-sm text-text-muted">Permissions:</span>
        <Badge variant="info">{permissions.length} granted</Badge>
      </div>
    </div>
  </Card>
</div>
