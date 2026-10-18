import 'i18next';
import type { en } from './en';

// Types `t()` from the English catalogue: `t('titel')` is a compile error
// ("Did you mean 'title'?"), and the editor completes the keys.
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: { translation: typeof en };
  }
}
