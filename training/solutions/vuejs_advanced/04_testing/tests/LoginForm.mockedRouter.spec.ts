import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { useRoute, useRouter } from 'vue-router';
import LoginForm from '@/components/LoginForm.vue';

/**
 * STEP 2 (B) — the same redirect, with the router mocked.
 *
 * This lives in its OWN file for a concrete reason: `vi.mock` is hoisted to the
 * top of the module, above every import and every `const`. It cannot reference
 * a variable declared next to it, and it applies to the whole file — so the
 * real-router tests could not coexist here even if you wanted them to.
 *
 * That constraint is itself an argument for approach (A): the mock reshapes the
 * file around itself.
 */
vi.mock('vue-router', async (importOriginal) => ({
  ...(await importOriginal<typeof import('vue-router')>()),
  useRouter: vi.fn(),
  useRoute: vi.fn(),
}));

describe('LoginForm — with a mocked router', () => {
  const replace = vi.fn();

  beforeEach(() => {
    setActivePinia(createPinia());
    replace.mockClear();

    vi.mocked(useRouter).mockReturnValue({ replace } as unknown as ReturnType<typeof useRouter>);
    vi.mocked(useRoute).mockReturnValue({ query: { redirect: '/admin' } } as unknown as ReturnType<
      typeof useRoute
    >);
  });

  it('calls router.replace with the validated redirect', async () => {
    const wrapper = mount(LoginForm);

    await wrapper.get('[data-testid="email"]').setValue('ada@example.com');
    await wrapper.get('[data-testid="password"]').setValue('secret');
    await wrapper.get('[data-testid="login-form"]').trigger('submit');
    await flushPromises();

    expect(replace).toHaveBeenCalledWith('/admin');
  });

  /**
   * And here is the limit of the approach: this passes because `safeRedirect`
   * happens to be right. Break the regex and the assertion just moves — it
   * checks that `replace` received what the component computed, never that the
   * user ends up somewhere safe. The real-router test does.
   */
  it('proves only that replace was called, not where the user lands', async () => {
    vi.mocked(useRoute).mockReturnValue({
      query: { redirect: 'https://evil.example.com' },
    } as unknown as ReturnType<typeof useRoute>);

    const wrapper = mount(LoginForm);

    await wrapper.get('[data-testid="email"]').setValue('ada@example.com');
    await wrapper.get('[data-testid="password"]').setValue('secret');
    await wrapper.get('[data-testid="login-form"]').trigger('submit');
    await flushPromises();

    expect(replace).toHaveBeenCalledWith('/invoices');
  });
});
