import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from './App';
import { people } from './data/people';

describe('App', () => {
  it('shows the title and how many characters there are', () => {
    render(<App />);

    expect(screen.getByRole('heading', { level: 1, name: 'Star Wars people' })).toBeInTheDocument();
    expect(screen.getByText(`${people.length} characters from a galaxy far, far away.`)).toBeInTheDocument();
  });

  it('renders a header and a main side by side, with no wrapper element', () => {
    const { container } = render(<App />);

    const tags = Array.from(container.children, (child) => child.tagName);
    expect(tags).toEqual(['HEADER', 'MAIN']);
  });

  it('ties the search label to its input, so clicking the label focuses it', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByText('Search a character'));

    expect(screen.getByRole('searchbox', { name: 'Search a character' })).toHaveFocus();
  });

  it('lists every character in the table', () => {
    render(<App />);

    expect(screen.getAllByRole('row')).toHaveLength(people.length + 1);
  });
});
