import { reactive } from 'vue';
import type { Directive } from 'vue';

/**
 * STEP 3 — The `v-lazy-img` directive.
 *
 * Usage:
 *   <img v-lazy-img="product.photo" />
 *   <img v-lazy-img.eager="product.photo" />   <!-- 400px root margin -->
 *
 * Requirements:
 *   1. show a lightweight placeholder immediately              (done for you)
 *   2. fall back to `FALLBACK` if the image fails to load       (done for you)
 *   3. degrade gracefully when `IntersectionObserver` is unavailable (done for you)
 *   4. observe the element with an `IntersectionObserver`
 *   5. swap in the real `src` when it becomes visible, then stop observing
 *   6. re-observe when the bound value changes (`updated`)
 *   7. disconnect on `unmounted` — a leaked observer keeps the element alive
 */

const PLACEHOLDER =
  'data:image/svg+xml;charset=utf-8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300">' +
      '<rect width="400" height="300" fill="#e5e7eb"/></svg>',
  );

const FALLBACK =
  'data:image/svg+xml;charset=utf-8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300">' +
      '<rect width="400" height="300" fill="#fee2e2"/>' +
      '<text x="200" y="160" font-size="28" text-anchor="middle" fill="#dc2626">broken</text></svg>',
  );

/**
 * One observer per element. A `WeakMap` keeps the entry collectable once the
 * element itself is gone, even if `unmounted` never ran.
 */
const observers = new WeakMap<HTMLImageElement, IntersectionObserver>();

/** Counts loaded images, displayed by the panel — reactive so the UI follows. */
export const lazyStats = reactive({ loaded: 0 });

function observe(el: HTMLImageElement, src: string, rootMargin: string): void {
  // TODO 3.2: disconnect any observer already attached to this element, then
  //   create a new `IntersectionObserver` with `{ rootMargin }`.
  //   When the entry intersects:
  //     - set `el.src = src`
  //     - increment `lazyStats.loaded`
  //     - `observer.disconnect()` and delete the WeakMap entry
  //   Finally, call `observer.observe(el)` and store it in `observers`.
  void el;
  void src;
  void rootMargin;
}

export const vLazyImg: Directive<HTMLImageElement, string> = {
  mounted(el, binding) {
    el.src = PLACEHOLDER;

    // `{ once: true }` — the listener removes itself, so a broken FALLBACK
    // cannot loop, and there is nothing left to clean up in `unmounted`.
    el.addEventListener(
      'error',
      () => {
        el.src = FALLBACK;
      },
      { once: true },
    );

    // Progressive enhancement: no IntersectionObserver (old browser, jsdom in a
    // unit test, a bot) means every image loads eagerly. Degraded, never broken.
    if (!('IntersectionObserver' in window)) {
      el.src = binding.value;
      return;
    }

    // TODO 3.1: call `observe()` with a root margin of '400px' when the `eager`
    //   modifier is present, '0px' otherwise.
  },

  updated(el, binding) {
    // TODO 3.3: do nothing when `binding.value === binding.oldValue`. Otherwise
    //   degrade like `mounted` does when there is no `IntersectionObserver`, or
    //   put the placeholder back and re-observe with the new URL. Test it with
    //   the "Shuffle photos" button.
    void el;
    void binding;
  },

  unmounted(el) {
    // TODO 3.4: disconnect and forget the observer.
    void el;
  },
};

export { PLACEHOLDER, FALLBACK };
