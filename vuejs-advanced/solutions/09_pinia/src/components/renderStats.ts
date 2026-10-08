import { reactive } from 'vue';

/**
 * Per-component render counters. The point of step 1 is to bring `theme` down to
 * zero re-renders when the catalog changes — watch these numbers, not the code.
 *
 * They are logged to the console rather than rendered. A component that displays
 * its own counter reads the very reactive value its `onUpdated` writes: the first
 * update mutates the counter, the mutation invalidates the template that reads
 * it, that schedules another update, and Vue bails out with "Maximum recursive
 * updates exceeded". The markup is still there in each panel, commented out —
 * uncomment it and the toggle button crashes on the first click.
 */
export const renderStats = reactive<Record<string, number>>({
  ThemePanel: 0,
  CatalogPanel: 0,
  CartPanel: 0,
});

export function countRender(name: keyof typeof renderStats & string): void {
  renderStats[name] = (renderStats[name] ?? 0) + 1;
  console.log(`[renders] ${name}: ${renderStats[name]}`);
}
