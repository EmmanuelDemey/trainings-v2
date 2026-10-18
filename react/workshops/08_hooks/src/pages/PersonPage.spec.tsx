import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PersonPage } from './PersonPage';

describe('PersonPage', () => {
  beforeEach(() => {
    document.title = 'Star Wars people';
  });

  it('shows the details of the person', () => {
    render(<PersonPage personId="1" onBack={() => {}} />);

    expect(screen.getByRole('heading', { level: 1, name: 'Luke Skywalker' })).toBeInTheDocument();
    expect(screen.getByText('1.72 m')).toBeInTheDocument();
  });

  it('puts the name of the person in the tab title', () => {
    render(<PersonPage personId="1" onBack={() => {}} />);

    expect(document.title).toBe('Luke Skywalker — Star Wars people');
  });

  it('follows the person when the page is given another one', () => {
    const { rerender } = render(<PersonPage personId="1" onBack={() => {}} />);

    rerender(<PersonPage personId="4" onBack={() => {}} />);

    expect(document.title).toBe('Darth Vader — Star Wars people');
  });

  it('puts the previous tab title back when it goes away', () => {
    const { unmount } = render(<PersonPage personId="1" onBack={() => {}} />);

    unmount();

    expect(document.title).toBe('Star Wars people');
  });

  it('calls onBack when the user clicks Home', async () => {
    const user = userEvent.setup();
    const onBack = vi.fn();
    render(<PersonPage personId="1" onBack={onBack} />);

    await user.click(screen.getByRole('button', { name: 'Home' }));

    expect(onBack).toHaveBeenCalledOnce();
  });

  it('says so, and leaves the title alone, for an unknown id', () => {
    render(<PersonPage personId="999" onBack={() => {}} />);

    expect(screen.getByRole('alert')).toHaveTextContent('Character not found.');
    expect(document.title).toBe('Star Wars people');
  });
});
