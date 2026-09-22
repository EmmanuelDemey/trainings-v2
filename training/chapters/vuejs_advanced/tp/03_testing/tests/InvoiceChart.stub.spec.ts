import { describe, it, expect } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import InvoiceList from '@/components/InvoiceList.vue';
import InvoiceChart from '@/components/InvoiceChart.vue';

/**
 * STEP 2 — Stubbing a heavy child.
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
          // TODO 2.1: replace `true` with a custom stub declaring the props, so
          //   you can read them back:
          //     InvoiceChart: { props: ['invoices', 'currency'], template: '<div data-testid="chart-stub" />' }
          InvoiceChart: true,
        },
      },
    });

    await flushPromises();

    // TODO 2.2: get the stub with `wrapper.findComponent(InvoiceChart)` and
    //   assert `props('invoices')` has 3 entries and `props('currency')` is 'EUR'.
    const chart = wrapper.findComponent(InvoiceChart);
    expect(chart.exists()).toBe(true);

  });

  /**
   * GIVEN — the same mount WITHOUT the stub. It does not throw — and that is the
   * problem: jsdom answers every `getBoundingClientRect()` with zeros, so the
   * chart renders bars of width 0 and any assertion on its geometry would be
   * asserting on a fiction.
   *
   * What the stub made us stop testing:
   *  - that the chart renders one bar per invoice
   *  - that the bar heights are proportional to the totals
   *  - that the currency actually appears in the axis labels
   *
   * None of those can be tested honestly in jsdom. They belong in a test that
   * runs in a real browser, where a real layout engine gives real numbers. Every
   * stub is a piece of reality you traded away — the discipline is knowing WHICH
   * piece, and where you test it instead.
   */
  it('mounts without the stub, but can assert nothing about the geometry', async () => {
    const wrapper = mount(InvoiceList);
    await flushPromises();

    const chart = wrapper.findComponent(InvoiceChart);
    expect(chart.exists()).toBe(true);
    expect(chart.element.getBoundingClientRect().width).toBe(0); // jsdom, always
  });

  // TODO 2.3 (bonus): compare with `shallowMount`. Which children get stubbed,
  //   and what does that cost you here?
});
