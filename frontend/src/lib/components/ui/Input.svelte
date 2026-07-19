<script lang="ts">
  import { cn } from '$lib/utils/cn';

  interface Props {
    type?: string;
    placeholder?: string;
    value?: string;
    id?: string;
    name?: string;
    disabled?: boolean;
    required?: boolean;
    class?: string;
    error?: string;
    label?: string;
    oninput?: (e: Event) => void;
    onchange?: (e: Event) => void;
  }

  let {
    type = 'text',
    placeholder = '',
    value = $bindable(''),
    id = '',
    name = '',
    disabled = false,
    required = false,
    class: className = '',
    error = '',
    label = '',
    oninput,
    onchange,
  }: Props = $props();
</script>

<div class="flex flex-col gap-1.5">
  {#if label}
    <label for={id} class="text-sm font-medium text-text-secondary">
      {label}
      {#if required}<span class="text-error">*</span>{/if}
    </label>
  {/if}

  <input
    {type}
    {placeholder}
    bind:value
    {id}
    {name}
    {disabled}
    {required}
    {oninput}
    {onchange}
    class={cn(
      'h-10 w-full rounded-lg border bg-surface-50 px-3 text-sm text-text-primary placeholder:text-text-muted',
      'transition-all duration-200 focus-ring focus:border-brand-500',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      error ? 'border-error' : 'border-border',
      className,
    )}
  />

  {#if error}
    <p class="text-xs text-error">{error}</p>
  {/if}
</div>
