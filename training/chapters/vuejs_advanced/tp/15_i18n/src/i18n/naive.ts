/**
 * "We only need a lookup." It works for about a week.
 *
 * TODO 5: delete this file. Every component that imports it switches to
 *   `useI18n()` — or to `$t` / `$n` in the template, which `globalInjection`
 *   already provides.
 *
 * What it cannot do, and why the chapter exists: pick a plural form per language
 * and per number, format a currency for a locale, put a component inside a
 * sentence, ship only the catalogue the user asked for, and re-render when the
 * locale changes.
 */
import fr from '../locales/fr.json';

type Dictionary = Record<string, unknown>;

export function naiveT(key: string): string {
  const value = key.split('.').reduce<unknown>((node, part) => (node as Dictionary)?.[part], fr);
  return typeof value === 'string' ? value : key;
}

export function naiveEuros(amount: number): string {
  return `${amount.toFixed(2)} €`;
}
