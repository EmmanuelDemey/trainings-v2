import { expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DataTable } from '../src/DataTable.tsx';
import { users } from './fixtures.ts';

test('renders one column per key, one row per item', () => {
  render(<DataTable rows={users} columns={['name', 'age']} getRowKey={(user) => user.id} />);
  expect(screen.getAllByRole('columnheader').map((th) => th.textContent)).toEqual(['name', 'age']);
  expect(screen.getAllByRole('cell').map((td) => td.textContent)).toEqual(['Ada', '36', 'Alan', '41', 'Grace', '85']);
});
