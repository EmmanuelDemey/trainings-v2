import i18next, { type i18n } from 'i18next';
import { initReactI18next } from 'react-i18next';
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
 * A new, ready-to-use i18next instance. A factory rather than the global
 * `i18next`: each spec gets its own instance, so a language switched in one
 * test does not leak into the next.
 */
export function createI18n(lng: Language = 'en'): i18n {
  const instance = i18next.createInstance();

  // Registered BEFORE `init`, which fires the first `languageChanged`. The
  // `lang` of the page drives screen-reader pronunciation and hyphenation.
  instance.on('languageChanged', (language) => {
    document.documentElement.lang = language;
  });

  void instance.use(initReactI18next).init({
    resources,
    lng,
    fallbackLng: 'en',
    supportedLngs: languages,
    // The resources are already in memory: initialise synchronously, so that
    // `t()` works on the very next line (and in the first render).
    initAsync: false,
    // React escapes what it renders already; escaping twice shows `&amp;`.
    interpolation: { escapeValue: false },
  });

  return instance;
}
