import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PeopleTable } from './PeopleTable';
import { people } from '../data/people';

// In a file of its own on purpose: React prints the missing-key warning only
// ONCE per component. Any earlier render in the same file would swallow it,
// and this test would pass on a table without keys.
describe('PeopleTable keys', () => {
  it('gives every row a key, so React does not warn', () => {
    using consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<PeopleTable people={people} />);

    expect(screen.getAllByRole('row')).toHaveLength(people.length + 1);
    expect(consoleError).not.toHaveBeenCalled();
  });
});
