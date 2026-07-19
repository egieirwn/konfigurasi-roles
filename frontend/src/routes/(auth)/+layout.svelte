<script lang="ts">
  let { children } = $props();
</script>

<div class="min-h-screen flex items-center justify-center bg-surface-0 relative overflow-hidden">
  <!-- Background decoration -->
  <div class="absolute inset-0 overflow-hidden pointer-events-none">
    <div class="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-brand-500/10 blur-3xl"></div>
    <div class="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-brand-600/10 blur-3xl"></div>
    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-brand-400/5 blur-3xl"></div>
  </div>

  <div class="relative z-10 w-full max-w-md mx-4">
    {@render children()}
  </div>
</div>
