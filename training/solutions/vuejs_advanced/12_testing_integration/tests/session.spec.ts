import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import SessionBadge from '@/components/SessionBadge.vue';
import { useSessionStore } from '@/stores/session';
import { session } from './fixtures';

/**
 * `createTestingPinia` puts the component in front of a store it fully controls:
 * the state is whatever `initialState` says, and every action is **stubbed and
 * spied** — so a spec about a component never has to go near the network.
 *
 * `createSpy: vi.fn` is not optional with Vitest: without it the plugin has no
 * spy factory to build those stubs with.
 */

function pinia(initialState?: Record<string, unknown>) {
  return createTestingPinia({ createSpy: vi.fn, initialState });
}

describe('SessionBadge', () => {
  it('shows the signed-in agent', () => {
    const wrapper = mount(SessionBadge, {
      global: { plugins: [pinia({ session: { session } })] },
    });

    expect(wrapper.get('[data-testid="agent-name"]').text()).toContain('Ada Lovelace');
  });

  it('shows an anonymous badge when there is no session', () => {
    const wrapper = mount(SessionBadge, { global: { plugins: [pinia()] } });

    expect(wrapper.get('[data-testid="anonymous"]').text()).toContain('Not signed in');
    expect(wrapper.find('[data-testid="agent-name"]').exists()).toBe(false);
  });

  it('asks the store to sign out, and does not sign out by itself', async () => {
    const wrapper = mount(SessionBadge, {
      global: { plugins: [pinia({ session: { session } })] },
    });
    const store = useSessionStore();

    await wrapper.get('[data-testid="sign-out"]').trigger('click');

    expect(store.signOut).toHaveBeenCalledOnce();
    // The action was stubbed, so the state did NOT change — the badge is still
    // there. That is the default, and it is what keeps this spec about the
    // component rather than about the store.
    expect(wrapper.find('[data-testid="agent-name"]').exists()).toBe(true);
  });

  it('really signs out when the actions are left alone', async () => {
    const wrapper = mount(SessionBadge, {
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
            stubActions: false,
            initialState: { session: { session } },
          }),
        ],
      },
    });
    const store = useSessionStore();

    await wrapper.get('[data-testid="sign-out"]').trigger('click');

    expect(store.signOut).toHaveBeenCalledOnce();
    expect(wrapper.get('[data-testid="anonymous"]').text()).toContain('Not signed in');
  });
});
