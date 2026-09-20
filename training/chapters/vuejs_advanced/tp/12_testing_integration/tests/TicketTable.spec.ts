import { describe, expect, it } from 'vitest';
import TicketTable from '@/components/TicketTable.vue';
import { tickets } from './fixtures';
import { mountStandalone } from './helpers';

/**
 * GIVEN, and green. This is the unit level of the app, and it is already done —
 * which is the point of this workshop: everything you write from here sits
 * *above* it, with the router, the store and the network in the picture.
 *
 * Read it once before you start. It is also the contract the specs you are about
 * to write must not duplicate.
 */

describe('TicketTable', () => {
  it('renders one row per ticket', () => {
    const wrapper = mountStandalone(TicketTable, { tickets });

    expect(wrapper.findAll('[data-testid="ticket-row"]')).toHaveLength(3);
    expect(wrapper.text()).toContain('Card declined on renewal');
  });

  it('says so when the queue is empty, instead of rendering a bare header', () => {
    const wrapper = mountStandalone(TicketTable, { tickets: [] });

    expect(wrapper.get('[data-testid="empty"]').text()).toContain('Nothing in the queue');
    expect(wrapper.find('table').exists()).toBe(false);
  });

  it('asks its parent to close a ticket, and never closes one itself', async () => {
    const wrapper = mountStandalone(TicketTable, { tickets });

    await wrapper.findAll('[data-testid="close-ticket"]')[0]!.trigger('click');

    expect(wrapper.emitted('close')).toEqual([[1]]);
  });

  it('cannot close what is already closed', () => {
    const wrapper = mountStandalone(TicketTable, {
      tickets: [{ ...tickets[0]!, status: 'closed' }],
    });

    expect(wrapper.get('[data-testid="close-ticket"]').attributes('disabled')).toBeDefined();
  });
});
