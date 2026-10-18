import i18next, { type i18n } from 'i18next';
import { en } from './en';
import { fr } from './fr';

export const languages = ['en', 'fr'] as const;
export type Language = (typeof languages)[number];

// One namespace, the default `translation`. Inline: no HTTP backend to wait for.
export const resources = {
  en: { translation: en },
  fr: { translation: fr },
} as const;

/**
 * A new i18next instance. A factory rather than the global `i18next`: each spec
 * gets its own instance, so a language switched in one test does not leak into
 * the next.
 */
export function createI18n(lng: Language = 'en'): i18n {
  const instance = i18next.createInstance();

  // TODO 3.2: BEFORE `init` (which fires the first one), listen to
  //   'languageChanged' and copy the language to `document.documentElement.lang`.

  // TODO 1.1: `instance.use(initReactI18next).init({ … })` (`initReactI18next`
  //   from 'react-i18next'), with:
  //   - `resources`, `lng`, `fallbackLng: 'en'`, `supportedLngs: languages`
  //   - `initAsync: false` — the resources are in memory: `t()` must work at once
  //   - `interpolation: { escapeValue: false }` — React escapes already
  //   `init` returns a promise you do not need here: prefix the call with `void`.

  return instance;
}
