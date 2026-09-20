import type { App, Plugin } from 'vue';
import { vLazyImg } from './lazyImg';

/**
 * STEP 5 — Package the directives as an app plugin.
 *
 * TODO 5.1: register `vLazyImg` globally under the name `lazy-img`, so
 *   `<img v-lazy-img="...">` works in every component without importing it.
 *
 * TODO 5.2 (bonus): add a second directive, `v-autofocus`, that focuses the
 *   element on mount — but only when a `focus` method exists, so it is safe on
 *   any element.
 */
export const directivesPlugin: Plugin = {
  install(app: App): void {
    void app;
    void vLazyImg;
    // TODO 5.1: app.directive('lazy-img', vLazyImg);
  },
};
