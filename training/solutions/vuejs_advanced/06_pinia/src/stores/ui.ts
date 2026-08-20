import { acceptHMRUpdate, defineStore } from 'pinia';
import { ref } from 'vue';

/**
 * The UI state, deliberately tiny — and deliberately separate. This is the store
 * whose subscribers must NOT wake up when 30 000 products land.
 */
export const useUiStore = defineStore('ui', () => {
  const theme = ref<'light' | 'dark'>('light');
  const search = ref('');

  function toggleTheme(): void {
    theme.value = theme.value === 'light' ? 'dark' : 'light';
  }

  return { theme, search, toggleTheme };
}, { persist: true });

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useUiStore, import.meta.hot));
}
