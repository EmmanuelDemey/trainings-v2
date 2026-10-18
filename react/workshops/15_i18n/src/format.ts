// TODO 5.1: implement these four with `Intl` — see the README for the expected
//   output of each. No hand-written separators, unit names or month names.

/** `172` → "1.72 m" (en) / "1,72 m" (fr). */
export function formatHeight(cm: number, locale: string): string {
  return `${cm} cm`;
}

/** `1358` → "1,358 kilograms" (en) / "1 358 kilogrammes" (fr). */
export function formatMass(kg: number, locale: string): string {
  return `${kg} kg`;
}

/** "December 20, 2014" (en) / "20 décembre 2014" (fr). */
export function formatDate(iso: string, locale: string): string {
  return iso.slice(0, 10);
}

/** "12 years ago" / "il y a 12 ans", "yesterday" / "hier", relative to `now`. */
export function formatRelative(iso: string, now: Date, locale: string): string {
  return iso.slice(0, 10);
}
