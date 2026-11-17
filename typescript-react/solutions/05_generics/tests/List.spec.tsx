import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import { List } from '../src/List.tsx';
import { users } from './fixtures.ts';

describe('List', () => {
  test('renders one item per element, with renderItem', () => {
    render(<List items={users} getKey={(user) => user.id} renderItem={(user) => user.name} />);
    expect(screen.getAllByRole('listitem').map((li) => li.textContent)).toEqual(['Ada', 'Alan', 'Grace']);
  });

  test('renders an empty list when there are no items', () => {
    render(<List items={[]} getKey={() => 0} renderItem={() => null} />);
    expect(screen.queryAllByRole('listitem')).toHaveLength(0);
  });
});
