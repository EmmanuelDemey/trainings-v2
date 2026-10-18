import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ErrorMessage } from './ErrorMessage';
import { Loader } from './Loader';

describe('Loader', () => {
  it('announces "Loading…" as a status by default', () => {
    render(<Loader />);

    expect(screen.getByRole('status')).toHaveTextContent('Loading…');
  });

  it('shows a custom label', () => {
    render(<Loader label="Loading the characters…" />);

    expect(screen.getByRole('status')).toHaveTextContent('Loading the characters…');
  });
});

describe('ErrorMessage', () => {
  it('shows the message in an alert', () => {
    render(<ErrorMessage message="Request failed with status 500" />);

    expect(screen.getByRole('alert')).toHaveTextContent('Request failed with status 500');
  });

  it('has no Retry button when there is nothing to retry', () => {
    render(<ErrorMessage message="Boom" />);

    expect(screen.queryByRole('button', { name: 'Retry' })).not.toBeInTheDocument();
  });

  it('calls onRetry when Retry is clicked', async () => {
    const onRetry = vi.fn();
    render(<ErrorMessage message="Boom" onRetry={onRetry} />);

    await userEvent.click(screen.getByRole('button', { name: 'Retry' }));

    expect(onRetry).toHaveBeenCalledOnce();
  });
});
