import { reactive } from 'vue';
import type { Directive } from 'vue';

/**
 * STEP 4 — The `v-lazy-img` directive.
 *
 * Usage:
 *   <img v-lazy-img="product.photo" />
 *   <img v-lazy-img.eager="product.photo" />   <!-- 400px root margin -->
 *
 * A directive is the right tool here precisely because the job is DOM-level:
 * setting `src`, attaching an observer, listening for `error`. Anything that
 * has state or a template belongs in a component instead.
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

function stopObserving(el: HTMLImageElement): void {
  observers.get(el)?.disconnect();
  observers.delete(el);
}

function observe(el: HTMLImageElement, src: string, rootMargin: string): void {
  // `updated` can fire while a previous observer is still attached: without
  // this, shuffling the gallery leaks one observer per image per shuffle.
  stopObserving(el);

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;

        el.src = src;
        lazyStats.loaded += 1;

        // Disconnect on the FIRST intersection: the image is loaded, and an
        // observer that keeps firing on every scroll is pure overhead.
        stopObserving(el);
      }
    },
    // `rootMargin` grows the trigger area: '400px' starts the download while the
    // image is still one screen away, so it is decoded by the time it scrolls in.
    { rootMargin },
  );

  observer.observe(el);
  observers.set(el, observer);
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

    observe(el, binding.value, binding.modifiers.eager ? '400px' : '0px');
  },

  updated(el, binding) {
    // `updated` fires on every re-render of the parent, not only when OUR value
    // changed. Without this guard, shuffling re-observes all 60 images and the
    // counter climbs for nothing.
    if (binding.value === binding.oldValue) return;

    if (!('IntersectionObserver' in window)) {
      el.src = binding.value;
      return;
    }

    el.src = PLACEHOLDER;
    observe(el, binding.value, binding.modifiers.eager ? '400px' : '0px');
  },

  unmounted(el) {
    // An observer holds a reference to its target: leak it and the detached
    // <img> — and everything the callback closes over — is never collected.
    stopObserving(el);
  },
};

export { PLACEHOLDER, FALLBACK };
