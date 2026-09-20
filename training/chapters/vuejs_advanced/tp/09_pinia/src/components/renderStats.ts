import { reactive } from 'vue';

/**
 * Per-component render counters. The point of step 1 is to bring `theme` down to
 * zero re-renders when the catalog changes — watch these numbers, not the code.
 */
export const renderStats = reactive<Record<string, number>>({
  ThemePanel: 0,
  CatalogPanel: 0,
  CartPanel: 0,
});

export function countRender(name: keyof typeof renderStats & string): void {
  renderStats[name] = (renderStats[name] ?? 0) + 1;
}
