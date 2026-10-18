/**
 * A tiny analytics client, in the shape of Google Tag Manager's `dataLayer`:
 * every event is pushed onto a global array that a tag manager would read.
 * The specs read that same array — no mock needed.
 */
export interface AnalyticsEvent {
  event: string;
  personId: string;
}

declare global {
  interface Window {
    dataLayer?: AnalyticsEvent[];
  }
}

export function track(event: string, personId: string): void {
  window.dataLayer ??= [];
  window.dataLayer.push({ event, personId });
}
