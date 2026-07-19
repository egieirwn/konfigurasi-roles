<script lang="ts">
  import { cn } from '$lib/utils/cn';

  interface Props {
    class?: string;
    hover?: boolean;
    children?: import('svelte').Snippet;
  }

  let { class: className = '', hover = false, children }: Props = $props();
</script>

<div
  class={cn(
    'rounded-xl border border-border bg-surface-50 p-6 transition-all duration-200',
    hover && 'hover:border-border-hover hover:shadow-lg hover:shadow-brand-500/5',
    className,
  )}
>
  {#if children}
    {@render children()}
  {/if}
</div>
