<script lang="ts">
  import { toastStore, type Toast } from '$lib/stores/toast';
  import { cn } from '$lib/utils/cn';

  const iconMap = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  };

  const colorMap = {
    success: 'border-success/30 bg-success/10',
    error: 'border-error/30 bg-error/10',
    warning: 'border-warning/30 bg-warning/10',
    info: 'border-info/30 bg-info/10',
  };

  const iconColorMap = {
    success: 'text-success bg-success/20',
    error: 'text-error bg-error/20',
    warning: 'text-warning bg-warning/20',
    info: 'text-info bg-info/20',
  };

  let toasts: Toast[] = $state([]);
  toastStore.subscribe((v) => toasts = v);
</script>

<div class="fixed top-4 right-4 z-[100] flex flex-col gap-3 max-w-sm">
  {#each toasts as toast (toast.id)}
    <div
      class={cn(
        'flex items-start gap-3 rounded-xl border p-4 shadow-lg backdrop-blur-md animate-slide-up',
        colorMap[toast.type],
      )}
    >
      <span class={cn(
        'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold',
        iconColorMap[toast.type],
      )}>
        {iconMap[toast.type]}
      </span>

      <p class="flex-1 text-sm text-text-primary">{toast.message}</p>

      <button
        onclick={() => toastStore.remove(toast.id)}
        class="shrink-0 text-text-muted hover:text-text-primary transition-colors cursor-pointer"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
  {/each}
</div>
