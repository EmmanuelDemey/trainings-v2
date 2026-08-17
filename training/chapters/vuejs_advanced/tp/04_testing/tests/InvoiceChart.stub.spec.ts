import { describe, it, expect } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import InvoiceList from '@/components/InvoiceList.vue';
import InvoiceChart from '@/components/InvoiceChart.vue';

/**
 * STEP 3 (PART 1 — chapter 4) — Stubbing a heavy child.
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
          // TODO 3.1: replace `true` with a custom stub declaring the props, so
          //   you can read them back:
          //     InvoiceChart: { props: ['invoices', 'currency'], template: '<div data-testid="chart-stub" />' }
          InvoiceChart: true,
        },
      },
    });

    await flushPromises();

    // TODO 3.2: get the stub with `wrapper.findComponent(InvoiceChart)` and
    //   assert `props('invoices')` has 3 entries and `props('currency')` is 'EUR'.
    const chart = wrapper.findComponent(InvoiceChart);
    expect(chart.exists()).toBe(true);

    // TODO 3.3: mount the same component WITHOUT the stub and observe what
    //   breaks (or silently reports 0). Write down, in a comment, what the stub
    //   made you stop testing — every stub is a piece of reality you gave up.

    // TODO 3.4 (bonus): compare with `shallowMount`. Which children get stubbed,
    //   and what does that cost you here?
  });
});
