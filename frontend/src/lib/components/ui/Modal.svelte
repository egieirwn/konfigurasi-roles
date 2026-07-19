<script lang="ts">
  import { cn } from '$lib/utils/cn';

  interface Props {
    open?: boolean;
    onclose?: () => void;
    title?: string;
    class?: string;
    children?: import('svelte').Snippet;
    actions?: import('svelte').Snippet;
  }

  let {
    open = $bindable(false),
    onclose,
    title = '',
    class: className = '',
    children,
    actions,
  }: Props = $props();

  function handleBackdrop() {
    open = false;
    onclose?.();
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      open = false;
      onclose?.();
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
  <!-- Backdrop -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in"
    onclick={handleBackdrop}
  >
    <!-- Modal -->
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      class={cn(
        'relative w-full max-w-lg mx-4 rounded-xl border border-border bg-surface-50 shadow-2xl animate-in',
        className,
      )}
      onclick={(e) => e.stopPropagation()}
    >
      {#if title}
        <div class="flex items-center justify-between border-b border-border px-6 py-4">
          <h3 class="text-lg font-semibold text-text-primary">{title}</h3>
          <button
            onclick={() => { open = false; onclose?.(); }}
            class="rounded-lg p-1.5 text-text-muted hover:bg-surface-200 hover:text-text-primary transition-colors cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      {/if}

      <div class="p-6">
        {#if children}
          {@render children()}
        {/if}
      </div>

      {#if actions}
        <div class="flex items-center justify-end gap-3 border-t border-border px-6 py-4">
          {@render actions()}
        </div>
      {/if}
    </div>
  </div>
{/if}
