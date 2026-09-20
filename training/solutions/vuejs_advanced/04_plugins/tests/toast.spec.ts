import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createApp, defineComponent, h } from 'vue';
import { mount } from '@vue/test-utils';
import { createToast, useToast } from '@/plugins/toast';
import { mountApp, withToast } from './helpers';

/**
 * The executable half of this workshop. Red on the skeleton.
 *
 * These specs drive the plugin the way a consumer does — through the demo app's
 * buttons and through `useToast()` — never through its internals. A plugin whose
 * specs have to reach inside it is a plugin nobody else can adopt.
 */

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('the install contract', () => {
  it('registers ToastHost globally, so a consumer never imports it', () => {
    const app = createApp({ render: () => null });

    app.use(createToast());

    expect(app.component('ToastHost')).toBeTruthy();
  });

  it('exposes notify as the $toast global property', () => {
    const app = createApp({ render: () => null });

    app.use(createToast());

    expect(typeof app.config.globalProperties.$toast).toBe('function');
  });

  it('gives every app its own state — two createToast() are two plugins', () => {
    using first = withToast();
    using second = withToast();

    first.api.notify('only in the first app');

    expect(first.api.toasts.value).toHaveLength(1);
    expect(second.api.toasts.value).toHaveLength(0);
  });

  it('resolves the options once, at creation', () => {
    using ctx = withToast({ position: 'bottom-center' });

    expect(ctx.api.position).toBe('bottom-center');
  });

  it('defaults to the top-right corner', () => {
    using ctx = withToast();

    expect(ctx.api.position).toBe('top-right');
  });
});

describe('useToast() when the plugin was never installed', () => {
  it('throws at the call site, with the missing line in the message', () => {
    const Consumer = defineComponent({
      setup() {
        useToast();
        return () => h('div');
      },
    });

    expect(() => mount(Consumer)).toThrow(/app\.use\(createToast/);
  });
});

describe('notifying', () => {
  it('shows what a consumer asked to show', async () => {
    using app = mountApp();

    await app.wrapper.get('[data-testid="order"]').trigger('click');

    expect(app.wrapper.get('[data-testid="toast"]').text()).toContain('Order #1 confirmed');
  });

  it('can be triggered straight from a template through $toast', async () => {
    using app = mountApp();

    const button = app.wrapper.find('[data-testid="global-toast"]');
    expect(button.exists()).toBe(true);
    await button.trigger('click');

    expect(app.wrapper.get('[data-testid="toast"]').text()).toContain('Settings saved');
  });

  it('keeps at most `max` toasts on screen, dropping the oldest', async () => {
    using app = mountApp({ max: 2 });

    await app.wrapper.get('[data-testid="info"]').trigger('click');
    await app.wrapper.get('[data-testid="order"]').trigger('click');
    await app.wrapper.get('[data-testid="error"]').trigger('click');

    const toasts = app.wrapper.findAll('[data-testid="toast"]');
    expect(toasts).toHaveLength(2);
    expect(app.wrapper.text()).not.toContain('Saving your basket');
  });
});

describe('dismissing', () => {
  it('dismisses a toast on its own after `duration`', async () => {
    using app = mountApp({ duration: 4000 });

    await app.wrapper.get('[data-testid="order"]').trigger('click');

    await vi.advanceTimersByTimeAsync(3999);
    expect(app.wrapper.findAll('[data-testid="toast"]')).toHaveLength(1);

    await vi.advanceTimersByTimeAsync(1);
    expect(app.wrapper.findAll('[data-testid="toast"]')).toHaveLength(0);
  });

  it('expires each toast on its own clock, not by position', async () => {
    using app = mountApp({ duration: 4000, max: 5 });

    await app.wrapper.get('[data-testid="order"]').trigger('click');
    await vi.advanceTimersByTimeAsync(2000);
    await app.wrapper.get('[data-testid="error"]').trigger('click');

    // 4000 ms after the first one, and only 2000 after the second.
    await vi.advanceTimersByTimeAsync(2000);

    expect(app.wrapper.text()).not.toContain('Order #1 confirmed');
    expect(app.wrapper.text()).toContain('Payment declined');
  });

  it('removes the one the user dismissed, and leaves the other alone', async () => {
    using app = mountApp({ max: 5 });

    await app.wrapper.get('[data-testid="order"]').trigger('click');
    await app.wrapper.get('[data-testid="error"]').trigger('click');

    await app.wrapper.findAll('[data-testid="dismiss-toast"]')[0]!.trigger('click');

    expect(app.wrapper.findAll('[data-testid="toast"]')).toHaveLength(1);
    expect(app.wrapper.text()).toContain('Payment declined');
  });

  it('cancels the pending timer of a dismissed toast', async () => {
    using clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');
    using app = mountApp({ duration: 4000 });

    await app.wrapper.get('[data-testid="order"]').trigger('click');
    await app.wrapper.get('[data-testid="dismiss-toast"]').trigger('click');

    expect(clearTimeoutSpy).toHaveBeenCalled();
  });

  it('clears everything, timers included', async () => {
    using app = mountApp({ max: 5 });

    await app.wrapper.get('[data-testid="order"]').trigger('click');
    await app.wrapper.get('[data-testid="error"]').trigger('click');
    await app.wrapper.get('[data-testid="clear"]').trigger('click');

    expect(app.wrapper.findAll('[data-testid="toast"]')).toHaveLength(0);
  });
});
