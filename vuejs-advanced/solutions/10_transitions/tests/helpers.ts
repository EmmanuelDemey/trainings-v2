import { mount, type VueWrapper } from '@vue/test-utils';
import App from '@/App.vue';

export interface MountedApp extends Disposable {
  wrapper: VueWrapper;
}

/**
 * Mounts the board with the real `<Transition>` components rather than the stubs
 * test-utils installs by default — `transition: false` is what lets these specs
 * read the props you gave them, and see the leave hooks fire.
 */
export function mountBoard(): MountedApp {
  const wrapper = mount(App, {
    attachTo: document.body,
    global: { stubs: { transition: false, 'transition-group': false } },
  });

  return { wrapper, [Symbol.dispose]: () => wrapper.unmount() };
}

/** The row whose title matches, whatever position the list put it in. */
export function rowFor(app: MountedApp, title: string) {
  const row = app.wrapper
    .findAll('[data-testid="release-row"]')
    .find((candidate) => candidate.get('[data-testid="release-title"]').text() === title);

  if (!row) throw new Error(`No row titled "${title}"`);
  return row;
}

/**
 * jsdom runs no CSS, so a transition with no measurable duration resolves on the
 * next animation frame. Waiting two of them is "let the transition finish".
 */
export function afterTheFrame(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
}
