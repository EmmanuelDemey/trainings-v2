import { describe, expect, it } from 'vitest';
import { h } from 'vue';
import { mount } from '@vue/test-utils';
import DataTable from '@/ui/DataTable.vue';
import InvoicesView from '@/views/InvoicesView.vue';
import PaymentsView from '@/views/PaymentsView.vue';
import { mountView } from './helpers';

/**
 * The one table.
 *
 * The sorting and the empty state were **true** duplication: the same markup
 * with the same reason to change. What is left — how a row looks — is
 * **shape-only** duplication between two features that do not change together,
 * and it stays duplicated on purpose.
 */

describe('ui/DataTable', () => {
  it('renders whatever rows it is given, through the slot its caller gave it', () => {
    interface Row {
      id: number;
      name: string;
    }
    const rows: Row[] = [
      { id: 1, name: 'anything' },
      { id: 2, name: 'at all' },
    ];

    const wrapper = mount(DataTable, {
      props: { rows, columns: [{ key: 'name', label: 'Name' }] },
      slots: {
        // The scope type is the table's own `{ id: number }` constraint: it has
        // no idea what a row of YOUR domain looks like, which is the point.
        row: ({ row }: { row: { id: number } }) =>
          h('td', { 'data-testid': 'cell' }, (row as Row).name),
      },
    });

    expect(wrapper.findAll('[data-testid="cell"]').map((cell) => cell.text())).toEqual([
      'anything',
      'at all',
    ]);
  });

  it('offers a toolbar and an empty state to its caller', () => {
    const wrapper = mount(DataTable, {
      props: { rows: [], columns: [{ key: 'name', label: 'Name' }] },
      slots: {
        toolbar: () => h('span', { 'data-testid': 'toolbar' }, 'filters go here'),
        empty: () => h('p', { 'data-testid': 'empty' }, 'Nothing here'),
      },
    });

    expect(wrapper.find('[data-testid="toolbar"]').exists()).toBe(true);
    expect(wrapper.get('[data-testid="empty"]').text()).toBe('Nothing here');
  });

  it('sorts by a sortable column, ascending then descending', async () => {
    interface Row {
      id: number;
      score: number;
    }
    const rows: Row[] = [
      { id: 1, score: 30 },
      { id: 2, score: 10 },
      { id: 3, score: 20 },
    ];

    const wrapper = mount(DataTable, {
      props: { rows, columns: [{ key: 'score', label: 'Score', sortable: true }] },
      slots: {
        row: ({ row }: { row: { id: number } }) =>
          h('td', { 'data-testid': 'cell' }, String((row as Row).score)),
      },
    });

    await wrapper.get('[data-testid="sort-score"]').trigger('click');
    expect(wrapper.findAll('[data-testid="cell"]').map((c) => c.text())).toEqual(['10', '20', '30']);

    await wrapper.get('[data-testid="sort-score"]').trigger('click');
    expect(wrapper.findAll('[data-testid="cell"]').map((c) => c.text())).toEqual(['30', '20', '10']);
  });
});

describe('both features go through it', () => {
  it('is what the invoices view renders', () => {
    using view = mountView(InvoicesView);

    expect(view.wrapper.findComponent(DataTable).exists()).toBe(true);
  });

  it('is what the payments view renders', () => {
    using view = mountView(PaymentsView);

    expect(view.wrapper.findComponent(DataTable).exists()).toBe(true);
  });
});
