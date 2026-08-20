import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-vue';
import { page } from '@vitest/browser/context';
import InvoiceChart from '@/components/InvoiceChart.vue';
import { invoices } from './fixtures';

/**
 * DEMO (chapter 8) — Vitest browser mode.
 *
 * `InvoiceChart` is the component step 3 of part 1 told you to STUB, because it
 * measures itself with `getBoundingClientRect()` and draws itself with CSS —
 * two things jsdom does not do. Here the very same component runs in a real
 * browser, driven by the very same Vitest, and none of that has to be stubbed.
 *
 * Run it with `npm run test:browser` (add `:headed` to watch it happen).
 */
describe('InvoiceChart — in a real browser', () => {
  const total = invoices.reduce((n, i) => n + i.total, 0);

  it('measures a real width, where jsdom always reported 0', async () => {
    render(InvoiceChart, { props: { invoices, currency: 'EUR' } });

    const chart = page.getByTestId('invoice-chart');
    await expect.element(chart).toBeVisible();

    // The component set its own width from document.body.getBoundingClientRect()
    // inside onMounted(). In jsdom that width is 0 and the chart is invisible.
    expect(chart.element().getBoundingClientRect().width).toBeGreaterThan(0);
  });

  it('sizes every bar in proportion to its invoice', async () => {
    render(InvoiceChart, { props: { invoices, currency: 'EUR' } });
    await expect.element(page.getByTestId('invoice-chart')).toBeVisible();

    const heights = [...document.querySelectorAll('.bar')].map(
      (bar) => bar.getBoundingClientRect().height,
    );

    expect(heights).toHaveLength(invoices.length);
    // .chart is 80px high and each bar a percentage of it — the browser resolves
    // that percentage, jsdom does not.
    expect(heights[0]).toBeCloseTo((invoices[0].total / total) * 80, 0);
    // The smallest invoice is clamped by `min-height: 3px`: a rule you can only
    // observe once something actually applies the stylesheet.
    expect(heights[1]).toBeCloseTo(3, 0);
    expect(heights[2]).toBeGreaterThan(heights[0]);
  });

  it('paints the bars with the accent colour from the CSS custom property', async () => {
    render(InvoiceChart, { props: { invoices, currency: 'EUR' } });
    await expect.element(page.getByTestId('invoice-chart')).toBeVisible();

    const bar = document.querySelector('.bar') as HTMLElement;

    // background: var(--accent), declared on :root in src/style.css.
    expect(getComputedStyle(bar).backgroundColor).toBe('rgb(66, 184, 131)');
    // `border-radius: 3px 3px 0 0` — a scoped style, resolved for real.
    expect(getComputedStyle(bar).borderTopLeftRadius).toBe('3px');
  });

  it('renders the formatted total next to the bars', async () => {
    render(InvoiceChart, { props: { invoices, currency: 'EUR' } });

    // A locator RETRIES until the timeout, unlike `wrapper.text()`, which reads
    // the DOM once — no `flushPromises()` and no `await nextTick()` here.
    await expect.element(page.getByText(`${total.toFixed(2)} EUR`)).toBeVisible();
  });
});
