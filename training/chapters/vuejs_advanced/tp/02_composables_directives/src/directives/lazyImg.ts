import { reactive } from 'vue';
import type { Directive } from 'vue';

/**
 * STEP 4 — The `v-lazy-img` directive.
 *
 * Usage:
 *   <img v-lazy-img="product.photo" />
 *   <img v-lazy-img.eager="product.photo" />   <!-- 400px root margin -->
 *
 * Requirements:
 *   1. show a lightweight placeholder immediately
 *   2. observe the element with an `IntersectionObserver`
 *   3. swap in the real `src` when it becomes visible, then stop observing
 *   4. fall back to `FALLBACK` if the image fails to load
 *   5. re-observe when the bound value changes (`updated`)
 *   6. disconnect on `unmounted` — a leaked observer keeps the element alive
 *   7. degrade gracefully when `IntersectionObserver` is unavailable
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
  // TODO 4.2: disconnect any observer already attached to this element, then
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
    // TODO 4.1: set the placeholder, and register a one-shot `error` listener
    //   that swaps in `FALLBACK`.
    //     el.src = PLACEHOLDER;
    //     el.addEventListener('error', ..., { once: true });
    //
    // TODO 4.5: if `IntersectionObserver` is not in `window`, assign
    //   `binding.value` directly and return — progressive enhancement.
    //
    // Then call `observe()` with a root margin of '400px' when the `eager`
    // modifier is present, '0px' otherwise.
    void el;
    void binding;
  },

  updated(el, binding) {
    // TODO 4.3: do nothing when `binding.value === binding.oldValue`, otherwise
    //   re-observe with the new URL. Test it with the "Shuffle photos" button.
    void el;
    void binding;
  },

  unmounted(el) {
    // TODO 4.4: disconnect and forget the observer.
    void el;
  },
};

export { PLACEHOLDER, FALLBACK };
