import { reactive } from 'vue';

/**
 * Stands in for Sentry. Everything this workshop wires ends up here, which is
 * what makes "did that error get reported?" a question you can answer — in a
 * spec, and on screen in the incident log.
 */

export type ReportSource =
  | 'boundary'
  | 'app'
  | 'window'
  | 'unhandledrejection'
  | 'async-component';

export interface Report {
  message: string;
  /** Vue's own phase string: 'render function', 'setup function', … */
  info: string;
  source: ReportSource;
  at: number;
}

export const reports = reactive<Report[]>([]);

/** An error really can be anything — a string, `undefined`, a DOM exception. */
export function messageOf(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return String(error);
}

export function capture(error: unknown, context: { info: string; source: ReportSource }): void {
  reports.push({
    message: messageOf(error),
    info: context.info,
    source: context.source,
    at: Date.now(),
  });
}

export function resetReports(): void {
  reports.splice(0, reports.length);
}
