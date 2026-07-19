<script lang="ts">
  import { page } from '$app/state';
  import { sidebar } from '$lib/stores/sidebar';
  import { authStore, userPermissions } from '$lib/stores/auth';
  import { cn } from '$lib/utils/cn';

  let sidebarState = $state({ isOpen: true, isMobileOpen: false });
  sidebar.subscribe((v) => sidebarState = v);

  let permissions: string[] = $state([]);
  userPermissions.subscribe((v) => permissions = v);

  interface NavItem {
    label: string;
    href: string;
    icon: string;
    permission?: string;
  }

  const navItems: NavItem[] = [
    { label: 'Dashboard', href: '/dashboard', icon: '◫' },
    { label: 'Users', href: '/users', icon: '👤', permission: 'users:read' },
    { label: 'Roles', href: '/roles', icon: '🛡️', permission: 'roles:read' },
    { label: 'Permissions', href: '/permissions', icon: '🔑', permission: 'permissions:read' },
    { label: 'Activity Logs', href: '/activity-logs', icon: '📋', permission: 'activity-logs:read' },
    { label: 'Profile', href: '/profile', icon: '⚙️' },
  ];

  function isActive(href: string): boolean {
    return page.url.pathname === href || page.url.pathname.startsWith(href + '/');
  }

  function hasPermission(permission?: string): boolean {
    if (!permission) return true;
    return permissions.includes(permission);
  }
</script>

<!-- Desktop Sidebar -->
<aside
  class={cn(
    'fixed top-0 left-0 z-40 h-screen border-r border-border bg-surface-50 transition-all duration-300 ease-in-out',
    'hidden lg:flex flex-col',
    sidebarState.isOpen ? 'w-64' : 'w-20',
  )}
>
  <!-- Logo -->
  <div class="flex h-16 items-center gap-3 border-b border-border px-4">
    <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 text-white font-bold text-lg shadow-lg shadow-brand-500/25">
      R
    </div>
    {#if sidebarState.isOpen}
      <div class="animate-fade-in">
        <h1 class="text-base font-bold text-text-primary">RBAC Panel</h1>
        <p class="text-[10px] text-text-muted">Admin Dashboard</p>
      </div>
    {/if}
  </div>

  <!-- Navigation -->
  <nav class="flex-1 overflow-y-auto px-3 py-4">
    <ul class="flex flex-col gap-1">
      {#each navItems as item}
        {#if hasPermission(item.permission)}
          <li>
            <a
              href={item.href}
              class={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                isActive(item.href)
                  ? 'bg-brand-500/15 text-brand-400 shadow-sm'
                  : 'text-text-secondary hover:bg-surface-100 hover:text-text-primary',
                !sidebarState.isOpen && 'justify-center px-0',
              )}
            >
              <span class="text-lg shrink-0 w-6 text-center">{item.icon}</span>
              {#if sidebarState.isOpen}
                <span class="animate-fade-in">{item.label}</span>
              {/if}
            </a>
          </li>
        {/if}
      {/each}
    </ul>
  </nav>

  <!-- Collapse button -->
  <div class="border-t border-border p-3">
    <button
      onclick={() => sidebar.toggle()}
      class="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm text-text-muted hover:bg-surface-100 hover:text-text-primary transition-colors cursor-pointer"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
        class={cn('transition-transform duration-300', !sidebarState.isOpen && 'rotate-180')}
      >
        <polyline points="15 18 9 12 15 6"></polyline>
      </svg>
      {#if sidebarState.isOpen}
        <span class="animate-fade-in">Collapse</span>
      {/if}
    </button>
  </div>
</aside>

<!-- Mobile Sidebar Overlay -->
{#if sidebarState.isMobileOpen}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden animate-fade-in"
    onclick={() => sidebar.closeMobile()}
  >
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <aside
      class="h-full w-64 border-r border-border bg-surface-50 animate-in flex flex-col"
      onclick={(e) => e.stopPropagation()}
    >
      <div class="flex h-16 items-center gap-3 border-b border-border px-4">
        <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 text-white font-bold text-lg">
          R
        </div>
        <div>
          <h1 class="text-base font-bold text-text-primary">RBAC Panel</h1>
          <p class="text-[10px] text-text-muted">Admin Dashboard</p>
        </div>
      </div>

      <nav class="flex-1 overflow-y-auto px-3 py-4">
        <ul class="flex flex-col gap-1">
          {#each navItems as item}
            {#if hasPermission(item.permission)}
              <li>
                <a
                  href={item.href}
                  onclick={() => sidebar.closeMobile()}
                  class={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                    isActive(item.href)
                      ? 'bg-brand-500/15 text-brand-400'
                      : 'text-text-secondary hover:bg-surface-100 hover:text-text-primary',
                  )}
                >
                  <span class="text-lg w-6 text-center">{item.icon}</span>
                  <span>{item.label}</span>
                </a>
              </li>
            {/if}
          {/each}
        </ul>
      </nav>
    </aside>
  </div>
{/if}
