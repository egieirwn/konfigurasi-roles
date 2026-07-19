<script lang="ts">
  import { cn } from '$lib/utils/cn';

  type Variant = 'default' | 'destructive' | 'outline' | 'ghost' | 'link';
  type Size = 'sm' | 'md' | 'lg' | 'icon';

  interface Props {
    variant?: Variant;
    size?: Size;
    class?: string;
    disabled?: boolean;
    loading?: boolean;
    type?: 'button' | 'submit' | 'reset';
    onclick?: (e: MouseEvent) => void;
    children?: import('svelte').Snippet;
  }

  let {
    variant = 'default',
    size = 'md',
    class: className = '',
    disabled = false,
    loading = false,
    type = 'button',
    onclick,
    children,
  }: Props = $props();

  const variants: Record<Variant, string> = {
    default: 'bg-brand-500 text-white hover:bg-brand-600 shadow-md shadow-brand-500/20',
    destructive: 'bg-error text-white hover:opacity-90',
    outline: 'border border-border bg-transparent hover:bg-surface-100 text-text-primary',
    ghost: 'bg-transparent hover:bg-surface-100 text-text-primary',
    link: 'bg-transparent underline-offset-4 hover:underline text-brand-400',
  };

  const sizes: Record<Size, string> = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-10 px-4 text-sm',
    lg: 'h-12 px-6 text-base',
    icon: 'h-10 w-10',
  };
</script>

<button
  {type}
  disabled={disabled || loading}
  onclick={onclick}
  class={cn(
    'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 focus-ring cursor-pointer',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'active:scale-[0.98]',
    variants[variant],
    sizes[size],
    className,
  )}
>
  {#if loading}
    <div class="spinner"></div>
  {/if}
  {#if children}
    {@render children()}
  {/if}
</button>
