import { describe, expect, it } from 'vitest';
import InvoicesView from '@/views/InvoicesView.vue';
import PaymentsView from '@/views/PaymentsView.vue';
import { mountView } from './helpers';

/**
 * The safety net. Every spec here is **green before you start**, and has to stay
 * green through the whole refactor — that is the only thing that makes a
 * refactor different from a rewrite.
 *
 * Note what they assert on: what a user sees. Not a file path, not a component
 * name. Moving a file must not move a test.
 */

describe('the invoices view', () => {
  it('lists the invoices with their amount and status', () => {
    using view = mountView(InvoicesView);

    expect(view.wrapper.findAll('[data-testid="row"]')).toHaveLength(4);
    expect(view.wrapper.get('[data-testid="cell-amount"]').text()).toBe('1240.00 €');
    expect(view.wrapper.findAll('[data-testid="badge"]')[0]!.text()).toContain('late');
  });

  it('totals what is on screen', () => {
    using view = mountView(InvoicesView);

    expect(view.wrapper.get('[data-testid="invoices-total"]').text()).toBe('7844.50 €');
  });

  it('filters down to the late ones', async () => {
    using view = mountView(InvoicesView);

    await view.wrapper.get('[data-testid="only-late"]').setValue(true);

    expect(view.wrapper.findAll('[data-testid="row"]')).toHaveLength(1);
    expect(view.wrapper.get('[data-testid="invoices-total"]').text()).toBe('1240.00 €');
  });

  it('sorts by amount, ascending then descending', async () => {
    using view = mountView(InvoicesView);

    await view.wrapper.get('[data-testid="sort-amountCents"]').trigger('click');
    expect(view.wrapper.findAll('[data-testid="cell-amount"]')[0]!.text()).toBe('99.00 €');

    await view.wrapper.get('[data-testid="sort-amountCents"]').trigger('click');
    expect(view.wrapper.findAll('[data-testid="cell-amount"]')[0]!.text()).toBe('6125.00 €');
  });

  it('says so when nothing matches', async () => {
    using view = mountView(InvoicesView);
    const store = view.pinia.state.value.invoices as { invoices: unknown[] };
    store.invoices = [];
    await view.wrapper.vm.$nextTick();

    expect(view.wrapper.get('[data-testid="empty"]').text()).toContain('No invoice');
  });
});

describe('the payments view', () => {
  it('lists the payments with their method', () => {
    using view = mountView(PaymentsView);

    expect(view.wrapper.findAll('[data-testid="row"]')).toHaveLength(3);
    expect(view.wrapper.findAll('[data-testid="badge"]')[0]!.text()).toContain('card');
  });

  it('sorts by amount too', async () => {
    using view = mountView(PaymentsView);

    await view.wrapper.get('[data-testid="sort-amountCents"]').trigger('click');

    expect(view.wrapper.findAll('[data-testid="cell-amount"]')[0]!.text()).toBe('380.50 €');
  });
});
