// Formatting belongs to the platform: `Intl` knows the decimal separator, the
// digit grouping, the unit names and the month names of every locale.

/** `172` → "1.72 m" (en) / "1,72 m" (fr). */
export function formatHeight(cm: number, locale: string): string {
  return new Intl.NumberFormat(locale, {
    style: 'unit',
    unit: 'meter',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cm / 100);
}

/** `1358` → "1,358 kilograms" (en) / "1 358 kilogrammes" (fr). */
export function formatMass(kg: number, locale: string): string {
  return new Intl.NumberFormat(locale, { style: 'unit', unit: 'kilogram', unitDisplay: 'long' }).format(kg);
}

/** "December 20, 2014" (en) / "20 décembre 2014" (fr). */
export function formatDate(iso: string, locale: string): string {
  // `timeZone: 'UTC'`: the same day for every user, wherever they are.
  return new Intl.DateTimeFormat(locale, { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(iso));
}

const units: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 365 * 24 * 3600],
  ['month', 30 * 24 * 3600],
  ['day', 24 * 3600],
  ['hour', 3600],
  ['minute', 60],
];

/** "12 years ago" / "il y a 12 ans", "yesterday" / "hier", relative to `now`. */
export function formatRelative(iso: string, now: Date, locale: string): string {
  const seconds = (new Date(iso).getTime() - now.getTime()) / 1000;
  const format = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  // `Intl` formats, but does not pick the unit: the largest one that fits.
  for (const [unit, size] of units) {
    if (Math.abs(seconds) >= size) return format.format(Math.round(seconds / size), unit);
  }
  return format.format(Math.round(seconds), 'second');
}
