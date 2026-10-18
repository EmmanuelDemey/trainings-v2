import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from './Input';

describe('Input', () => {
  it('is labelled by its label', () => {
    render(<Input label="Name" />);

    expect(screen.getByRole('textbox', { name: 'Name' })).toBeInTheDocument();
  });

  it('gives each instance its own id, so two inputs never share a label', () => {
    render(
      <>
        <Input label="First name" />
        <Input label="Last name" />
      </>,
    );

    expect(screen.getByLabelText('First name')).not.toBe(screen.getByLabelText('Last name'));
  });

  it('passes the native input props through', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Input label="Search" type="search" placeholder="Luke…" maxLength={5} onChange={onChange} />);

    const input = screen.getByRole('searchbox', { name: 'Search' });
    expect(input).toHaveAttribute('placeholder', 'Luke…');
    expect(input).toHaveAttribute('maxlength', '5');

    await user.type(input, 'R2');
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it('describes the input with its hint', () => {
    render(<Input label="Name" hint="As in the films." />);

    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveAccessibleDescription('As in the films.');
  });

  it('renders no hint, and no description, when none is given', () => {
    render(<Input label="Name" />);

    expect(screen.getByRole('textbox', { name: 'Name' })).not.toHaveAttribute('aria-describedby');
  });
});
