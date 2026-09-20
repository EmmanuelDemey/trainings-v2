import { describe, it, expect } from 'vitest';
import { mount, shallowMount, flushPromises } from '@vue/test-utils';
import InvoiceList from '@/components/InvoiceList.vue';
import InvoiceChart from '@/components/InvoiceChart.vue';
import { invoices } from './msw';

/**
 * STEP 3 — Stubbing a heavy child.
 *
 * `InvoiceChart` relies on `getBoundingClientRect`, which jsdom always answers
 * with zeros. Rather than testing what it renders, stub it and assert on the
 * PROPS it receives — that is the actual contract between the two components.
 */
describe('InvoiceList — chart integration', () => {
  it('passes the loaded invoices and the currency to the chart', async () => {
    const wrapper = mount(InvoiceList, {
      global: {
        stubs: {
          // A CUSTOM stub, not `true`. `InvoiceChart: true` renders an
          // `<invoice-chart-stub>` with no prop declarations, so
          // `props('currency')` comes back `undefined` and the assertions below
          // would silently pass against nothing.
          InvoiceChart: {
            props: ['invoices', 'currency'],
            template: '<div data-testid="chart-stub" />',
          },
        },
      },
    });

    await flushPromises();

    const chart = wrapper.findComponent(InvoiceChart);
    expect(chart.exists()).toBe(true);
    expect(chart.props('invoices')).toHaveLength(invoices.length);
    expect(chart.props('currency')).toBe('EUR');
  });

  /**
   * The same mount WITHOUT the stub. It does not throw — and that is the
   * problem: jsdom answers every `getBoundingClientRect()` with zeros, so the
   * chart renders bars of width 0 and any assertion on its geometry would be
   * asserting on a fiction.
   *
   * What the stub made us stop testing:
   *  - that the chart renders one bar per invoice
   *  - that the bar heights are proportional to the totals
   *  - that the currency actually appears in the axis labels
   *
   * None of those can be tested honestly in jsdom. They belong in browser mode
   * (`npm run test:browser`, see `tests/InvoiceChart.browser.spec.ts`), where a
   * real layout engine gives real numbers. Every stub is a piece of reality you
   * traded away — the discipline is knowing WHICH piece, and where you test it
   * instead.
   */
  it('mounts without the stub, but can assert nothing about the geometry', async () => {
    const wrapper = mount(InvoiceList);
    await flushPromises();

    const chart = wrapper.findComponent(InvoiceChart);
    expect(chart.exists()).toBe(true);
    expect(chart.element.getBoundingClientRect().width).toBe(0); // jsdom, always
  });

  /**
   * `shallowMount` stubs EVERY child automatically — the chart AND anything else
   * the component renders. Convenient, and blunt: here it also means you are no
   * longer rendering the `<li>` rows, so this same file could not check the row
   * count. Targeted `stubs` say what you gave up; `shallowMount` does not.
   */
  it('shallowMount stubs every child, not just the expensive one', async () => {
    const wrapper = shallowMount(InvoiceList);
    await flushPromises();

    expect(wrapper.findComponent(InvoiceChart).exists()).toBe(true);
    expect(wrapper.html()).toContain('invoice-chart-stub');
  });
});
