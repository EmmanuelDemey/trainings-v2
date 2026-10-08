import { beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, h, nextTick, ref } from 'vue';
import { mount } from '@vue/test-utils';
import ErrorBoundary from '@/components/ErrorBoundary.vue';
import { createOpsApp } from '@/createOpsApp';
import { installWindowNet } from '@/observability/windowNet';
import { capture, reports, resetReports } from '@/observability/reporter';
import { dispatchUnhandledRejection, dispatchWindowError, mountConsole } from './helpers';

beforeEach(() => {
  resetReports();
});

/** A component that blows up in its render function, on demand. */
const Bomb = defineComponent({
  props: { broken: { type: Boolean, default: true } },
  setup: (props) => () => {
    if (props.broken) throw new Error('boom');
    return h('p', { 'data-testid': 'bomb' }, 'fine');
  },
});

describe('the boundary', () => {
  it('swaps the failing subtree for a fallback', async () => {
    const wrapper = mount(ErrorBoundary, {
      props: { label: 'Totals' },
      slots: { default: () => h(Bomb) },
    });
    // The hook records the error during the child's render; the swap is the
    // boundary's own next render.
    await nextTick();

    expect(wrapper.get('[data-testid="boundary-fallback"]').text()).toContain('boom');
    expect(wrapper.find('[data-testid="bomb"]').exists()).toBe(false);
  });

  it('keeps the phase Vue named, which a minified stack trace never gives you', () => {
    mount(ErrorBoundary, { props: { label: 'Totals' }, slots: { default: () => h(Bomb) } });

    expect(reports).toHaveLength(1);
    expect(reports[0]!.source).toBe('boundary');
    expect(reports[0]!.info).toContain('render');
  });

  it('stops the walk, so nothing above it sees the error', () => {
    const outer = vi.fn();

    mount(ErrorBoundary, {
      props: { label: 'Totals' },
      slots: { default: () => h(Bomb) },
      global: { config: { errorHandler: outer } },
    });

    expect(outer).not.toHaveBeenCalled();
  });

  it('gives the subtree a second chance on retry', async () => {
    const broken = ref(true);
    const wrapper = mount(ErrorBoundary, {
      props: { label: 'Totals' },
      slots: { default: () => h(Bomb, { broken: broken.value }) },
    });
    await nextTick();
    expect(wrapper.find('[data-testid="boundary-fallback"]').exists()).toBe(true);

    // Whatever made it fail is fixed — the retry has to be able to succeed.
    broken.value = false;
    await wrapper.get('[data-testid="retry"]').trigger('click');
    await nextTick();

    expect(wrapper.find('[data-testid="boundary-fallback"]').exists()).toBe(false);
    expect(wrapper.get('[data-testid="bomb"]').text()).toBe('fine');
  });
});

describe('a component never catches itself', () => {
  it('lets its own render error climb straight past its own hook', async () => {
    using app = mountConsole();

    await app.wrapper.get('[data-testid="break-self"]').trigger('click');
    await nextTick();

    // Its own `onErrorCaptured` would have reported `self:…`. It never runs:
    // Vue starts the walk at `instance.parent`.
    expect(reports.some((report) => report.info.startsWith('self:'))).toBe(false);
    expect(reports).not.toHaveLength(0);
  });

  it('is caught by the boundary wrapping it', async () => {
    using app = mountConsole();

    await app.wrapper.get('[data-testid="break-self"]').trigger('click');
    await nextTick();

    expect(app.wrapper.find('[data-testid="boundary-fallback"]').exists()).toBe(true);
    expect(reports.at(-1)!.source).toBe('boundary');
  });
});

describe('one boundary per panel', () => {
  it('degrades only the panel that failed', async () => {
    using app = mountConsole();

    await app.wrapper.get('[data-testid="break-totals"]').trigger('click');
    await nextTick();

    expect(app.wrapper.find('[data-testid="totals"]').exists()).toBe(false);
    // The neighbour is untouched, and so is the log.
    expect(app.wrapper.get('[data-testid="self-healing"]').text()).toContain('All good');
    expect(app.wrapper.find('[data-testid="report-count"]').exists()).toBe(true);
  });
});

describe('the last-resort net', () => {
  it('is wired on the app', () => {
    expect(typeof createOpsApp().config.errorHandler).toBe('function');
  });

  it('reports what no boundary stopped, with the phase Vue named', () => {
    const app = createOpsApp();

    app.config.errorHandler!(new Error('from the root'), null, 'scheduler flush');

    expect(reports.at(-1)).toMatchObject({
      message: 'from the root',
      info: 'scheduler flush',
      source: 'app',
    });
  });
});

describe('what Vue never sees', () => {
  it('catches a throw from a timer through the window net', () => {
    const uninstall = installWindowNet();

    dispatchWindowError('thrown from a timer');
    uninstall();

    expect(reports.at(-1)).toMatchObject({ message: 'thrown from a timer', source: 'window' });
  });

  it('catches a promise nobody awaited', () => {
    const uninstall = installWindowNet();

    dispatchUnhandledRejection(new Error('nobody awaited me'));
    uninstall();

    expect(reports.at(-1)).toMatchObject({
      message: 'nobody awaited me',
      source: 'unhandledrejection',
    });
  });

  it('stops listening once uninstalled', () => {
    using removeListener = vi.spyOn(window, 'removeEventListener');

    installWindowNet()();

    // Both channels have to go. Asserting on `removeEventListener` rather than
    // dispatching another `ErrorEvent` is deliberate: an `error` event with no
    // listener left is reported by jsdom as an uncaught exception, which fails
    // the run even though every assertion passed.
    expect(removeListener).toHaveBeenCalledWith('error', expect.any(Function));
    expect(removeListener).toHaveBeenCalledWith('unhandledrejection', expect.any(Function));

    dispatchUnhandledRejection(new Error('after the net is gone'));
    expect(reports).toHaveLength(0);
  });
});

describe('the reporter', () => {
  it('survives an error that is not an Error', () => {
    capture('a bare string', { info: 'event handler', source: 'app' });
    capture(undefined, { info: 'event handler', source: 'app' });

    expect(reports.map((r) => r.message)).toEqual(['a bare string', 'undefined']);
  });
});
