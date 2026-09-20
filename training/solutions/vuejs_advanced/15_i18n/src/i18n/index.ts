import { createI18n } from 'vue-i18n';
import fr from '../locales/fr.json';

/**
 * vue-i18n's default plural rule is **English grammar, hard-coded**:
 *
 *   choicesLength === 2 ? (choice === 1 ? 0 : 1) : Math.min(choice, 2)
 *
 * It is not CLDR and not `Intl.PluralRules`. For French that makes "0 articles"
 * where the language wants "0 article" — and nothing warns you. Two forms and a
 * `Math.min` cannot express Slavic grammar either; Russian, Polish and Arabic
 * each need their own rule here.
 */
function frenchPlural(choice: number, choicesLength: number): number {
  const count = Math.abs(choice);

  if (choicesLength === 2) return count <= 1 ? 0 : 1;

  // zero | singular | plural
  if (count === 0) return 0;
  return count <= 1 ? 1 : 2;
}

/**
 * `createI18n()` is a **factory returning a plugin** — exactly the pattern of
 * chapter 4: options resolved once, state owned by the returned object, one
 * instance per app.
 *
 * The number formats are named **here**, once. Inlining `Intl` options at every
 * call site is how an app ends up with three different currency renderings and
 * no single place to change when finance asks for four decimals.
 *
 * `legacy: false` is not optional: the default is still `true`, and Legacy mode
 * has none of the Composition API surface this workshop uses.
 */
export const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: 'fr',
  fallbackLocale: 'en',
  messages: { fr },
  pluralRules: {
    fr: frenchPlural,
  },
  numberFormats: {
    fr: {
      currency: { style: 'currency', currency: 'EUR', currencyDisplay: 'symbol' },
      percent: { style: 'percent', maximumFractionDigits: 1 },
      compact: { notation: 'compact', compactDisplay: 'short' },
    },
    en: {
      currency: { style: 'currency', currency: 'USD' },
      percent: { style: 'percent', maximumFractionDigits: 1 },
      compact: { notation: 'compact', compactDisplay: 'short' },
    },
    de: {
      currency: { style: 'currency', currency: 'EUR' },
      percent: { style: 'percent', maximumFractionDigits: 1 },
      compact: { notation: 'compact', compactDisplay: 'short' },
    },
  },
});
