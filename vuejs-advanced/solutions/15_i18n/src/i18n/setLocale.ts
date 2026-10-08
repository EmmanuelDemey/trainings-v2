import { nextTick } from 'vue';
import { i18n } from './index';
import { apiHeaders } from '../api/client';
import type { SupportedLocale } from './supported';

/**
 * `import.meta.glob` makes the set of locales **explicit and statically
 * analysable**: one chunk per locale, and an unknown one fails loudly here
 * rather than as a 404 at fetch time.
 *
 * A dynamic `import()` built from a template literal would work too — as long as
 * the variable stays in the **last path segment**, or Rollup enumerates half the
 * project into separate chunks.
 */
type MessageSchema = typeof import('../locales/fr.json');

const loaders = import.meta.glob<{ default: MessageSchema }>('../locales/*.json');

/**
 * The last locale anybody asked for.
 *
 * `await import()` has no cancellation: switch to `de`, then to `en` before the
 * German catalogue resolves, and German would land last and win. This guard is
 * what makes the newest request the one that counts.
 */
let pending: SupportedLocale | null = null;

export async function setLocale(locale: SupportedLocale): Promise<void> {
  pending = locale;

  // Already loaded? Then there is nothing to download — `availableLocales` is
  // the difference between one request and one per switch.
  if (!i18n.global.availableLocales.includes(locale)) {
    const load = loaders[`../locales/${locale}.json`];
    if (!load) throw new Error(`Unknown locale: ${locale}`);

    const messages = await load();
    if (pending !== locale) return; // a newer switch overtook us — drop this one

    i18n.global.setLocaleMessage(locale, messages.default);
  }

  i18n.global.locale.value = locale;

  // Screen readers, hyphenation and CSS `:lang()` all read this attribute, and
  // nobody sets it for you.
  document.documentElement.setAttribute('lang', locale);

  // …and the backend keeps answering in the old language until this changes.
  apiHeaders['Accept-Language'] = locale;

  await nextTick();
}
