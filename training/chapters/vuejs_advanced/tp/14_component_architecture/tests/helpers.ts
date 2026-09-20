import { createPinia, setActivePinia, type Pinia } from 'pinia';
import { mount, type VueWrapper } from '@vue/test-utils';
import type { Component } from 'vue';

export interface Mounted extends Disposable {
  wrapper: VueWrapper;
  pinia: Pinia;
}

export function mountView(view: Component): Mounted {
  const pinia = createPinia();
  setActivePinia(pinia);

  const wrapper = mount(view, { global: { plugins: [pinia] } });

  return { wrapper, pinia, [Symbol.dispose]: () => wrapper.unmount() };
}
