import { reactive } from 'vue';

/**
 * Per-component render counters, incremented from `onUpdated`.
 *
 * They are the instrument of this whole workshop: the Timeline tells you *what*
 * re-rendered, these tell you *how many times*. Only `RenderCounters.vue` reads
 * them — a component displaying its own counter would re-render because it just
 * rendered, and Vue would stop with "Maximum recursive updates exceeded".
 */
export const renderStats = reactive<Record<string, number>>({
  App: 0,
  TicketList: 0,
  StatsPanel: 0,
  ClockBadge: 0,
});

export function countRender(name: string): void {
  renderStats[name] = (renderStats[name] ?? 0) + 1;
}

/** Back to zero, so a measurement starts from a known state. */
export function resetRenderStats(): void {
  for (const name of Object.keys(renderStats)) renderStats[name] = 0;
}
