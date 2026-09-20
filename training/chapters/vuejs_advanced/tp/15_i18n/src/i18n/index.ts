import { createI18n } from 'vue-i18n';
import fr from '../locales/fr.json';

/**
 * `createI18n()` is a **factory returning a plugin** — exactly the pattern of
 * chapter 4: options resolved once, state owned by the returned object, one
 * instance per app.
 *
 * TODO 1: `fallbackLocale: 'en'`, so a key missing from a catalogue falls back
 *   instead of rendering as itself.
 *
 * TODO 2: `numberFormats` — name the formats here, once, instead of inlining
 *   `Intl` options at every call site:
 *     fr: currency EUR (symbol), percent (max 1 fraction digit), compact short
 *     en: currency USD, percent, compact
 *     de: currency EUR, percent, compact
 *
 * TODO 3: `pluralRules` for `fr`. vue-i18n's default rule is **English grammar,
 *   hard-coded** — with two forms it returns `choice === 1 ? 0 : 1`, so French
 *   renders "0 articles" where it must be "0 article". Write the French rule:
 *   0 and 1 take the singular, everything else the plural.
 *
 * `legacy: false` is not optional: the default is still `true`, and Legacy mode
 * has none of the Composition API surface this workshop uses.
 */
export const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: 'fr',
  messages: { fr },
});
