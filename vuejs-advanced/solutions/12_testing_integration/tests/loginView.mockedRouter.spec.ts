import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia } from 'pinia';
import LoginView from '@/views/LoginView.vue';
import { flushPromises } from './helpers';

/**
 * The same view with the router **mocked**.
 *
 * `LoginView` only ever calls `useRouter().push()` and reads `route.query`, so
 * two stubs replace the whole router. It is faster and it says exactly what the
 * component does — and it is blind to everything the real one covers: the guard
 * never runs, a wrong route name is never caught, and a redirect loop would pass
 * happily. Keep this style for a component that merely *navigates*; keep the
 * real router whenever the navigation itself is the behaviour.
 *
 * `vi.mock` is hoisted to the top of the module, which is why this spec has a
 * file to itself.
 */
const push = vi.fn();

vi.mock('vue-router', () => ({
  useRouter: () => ({ push }),
  useRoute: () => ({ query: { redirect: '/tickets/2' } }),
}));

describe('LoginView, with a mocked router', () => {
  it('pushes to the redirect target once the store accepts the credentials', async () => {
    const wrapper = mount(LoginView, { global: { plugins: [createPinia()] } });

    await wrapper.get('[data-testid="email"]').setValue('ada@acme.dev');
    await wrapper.get('[data-testid="password"]').setValue('secret');
    await wrapper.get('[data-testid="login-form"]').trigger('submit');
    await flushPromises();

    expect(push).toHaveBeenCalledWith('/tickets/2');
  });
});
