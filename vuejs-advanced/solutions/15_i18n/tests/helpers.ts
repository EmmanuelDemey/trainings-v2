import { mount, type VueWrapper } from '@vue/test-utils';
import App from '@/App.vue';
import { i18n } from '@/i18n';
import { apiHeaders } from '@/api/client';
import { setLocale } from '@/i18n/setLocale';

export interface MountedApp extends Disposable {
  wrapper: VueWrapper;
}

export function mountShop(): MountedApp {
  const wrapper = mount(App, { global: { plugins: [i18n] } });
  return { wrapper, [Symbol.dispose]: () => wrapper.unmount() };
}

/**
 * The i18n instance is a module singleton — one per app, and this file imports
 * the app's. Put it back where it started so the specs stay independent of the
 * order they run in.
 */
export async function resetLocale(): Promise<void> {
  await setLocale('fr');
  document.documentElement.lang = 'fr';
  apiHeaders['Accept-Language'] = 'fr';
}

/**
 * `Intl` separates thousands with a narrow no-break space in French, and a
 * spec asserting on the exact code point is a spec that breaks with the next
 * ICU update. Compare on the digits and the symbol.
 */
export function normalizeSpaces(value: string): string {
  return value.replace(/[  \s]/g, ' ');
}
