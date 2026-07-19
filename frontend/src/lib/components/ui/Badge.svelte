<script lang="ts">
  import { cn } from '$lib/utils/cn';

  type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'outline';

  interface Props {
    variant?: BadgeVariant;
    class?: string;
    children?: import('svelte').Snippet;
  }

  let { variant = 'default', class: className = '', children }: Props = $props();

  const variants: Record<BadgeVariant, string> = {
    default: 'bg-brand-500/15 text-brand-400 border-brand-500/20',
    success: 'bg-success/15 text-success border-success/20',
    warning: 'bg-warning/15 text-warning border-warning/20',
    error: 'bg-error/15 text-error border-error/20',
    info: 'bg-info/15 text-info border-info/20',
    outline: 'bg-transparent text-text-secondary border-border',
  };
</script>

<span
  class={cn(
    'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium',
    variants[variant],
    className,
  )}
>
  {#if children}
    {@render children()}
  {/if}
</span>
