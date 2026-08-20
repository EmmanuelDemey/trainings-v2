import type { App, Directive, Plugin } from 'vue';
import { vLazyImg } from './lazyImg';

/**
 * Focuses the element on mount.
 *
 * The `focus` check keeps it safe on any element: bind it to a `<div>` by
 * mistake and it does nothing, instead of throwing at runtime.
 */
export const vAutofocus: Directive<HTMLElement> = {
  mounted(el) {
    if (typeof el.focus === 'function') el.focus();
  },
};

/**
 * STEP 5 — The directives, packaged as an app plugin.
 *
 * Registering here rather than importing `vLazyImg` in every component is the
 * trade-off a plugin makes: one line in `main.ts` buys global availability, and
 * costs you the ability to see, from a component file, where `v-lazy-img` comes
 * from. Worth it for a handful of app-wide primitives; not worth it for a
 * directive two components use.
 *
 * Note the kebab-case name: `app.directive('lazy-img', …)` is what makes
 * `v-lazy-img` resolve in a template.
 */
export const directivesPlugin: Plugin = {
  install(app: App): void {
    app.directive('lazy-img', vLazyImg);
    app.directive('autofocus', vAutofocus);
  },
};
