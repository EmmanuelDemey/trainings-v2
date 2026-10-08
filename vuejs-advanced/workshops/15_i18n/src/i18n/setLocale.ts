import type { SupportedLocale } from './supported';

/**
 * The naive version is four lines:
 *
 *   const messages = await import(`../locales/${locale}.json`);
 *   i18n.global.setLocaleMessage(locale, messages.default);
 *   i18n.global.locale.value = locale;
 *
 * TODO 3.1: write the version that ships. Four holes to close:
 *
 *   a) **Re-downloading.** Check `i18n.global.availableLocales` before loading.
 *   b) **The race.** Switch to `de`, then to `en` before `de` resolves, and
 *      German wins — `await import()` has no cancellation. Keep the last
 *      requested locale in a module-level `pending` and bail out when a newer
 *      switch has overtaken you.
 *   c) **`<html lang>`.** Screen readers, hyphenation and CSS `:lang()` all read
 *      that attribute, and nobody sets it for you.
 *   d) **`Accept-Language`.** Update `apiHeaders` from `@/api/client`, or the
 *      backend keeps answering in the old language.
 *
 *   Load with `import.meta.glob('../locales/*.json')`: the set of locales becomes
 *   explicit and statically analysable — one chunk per locale, and an unknown
 *   one fails loudly instead of at fetch time.
 *
 *   Finish with `await nextTick()`, so a caller that awaits you can assert on a
 *   re-rendered DOM.
 */
export async function setLocale(locale: SupportedLocale): Promise<void> {
  void locale;
}
