import { writable } from 'svelte/store';

function createThemeStore() {
  const stored = typeof window !== 'undefined' ? localStorage.getItem('theme') : null;
  const initial = stored || 'dark';

  const { subscribe, set } = writable<'light' | 'dark'>(initial as any);

  function applyTheme(theme: 'light' | 'dark') {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', theme === 'dark');
    }
  }

  // Apply initial theme
  if (typeof window !== 'undefined') {
    applyTheme(initial as any);
  }

  return {
    subscribe,
    toggle() {
      let newTheme: 'light' | 'dark';
      subscribe((current) => {
        newTheme = current === 'dark' ? 'light' : 'dark';
      })();
      set(newTheme!);
      applyTheme(newTheme!);
      if (typeof window !== 'undefined') {
        localStorage.setItem('theme', newTheme!);
      }
    },
    set(theme: 'light' | 'dark') {
      set(theme);
      applyTheme(theme);
      if (typeof window !== 'undefined') {
        localStorage.setItem('theme', theme);
      }
    },
  };
}

export const theme = createThemeStore();
