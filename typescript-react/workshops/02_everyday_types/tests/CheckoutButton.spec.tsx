import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { CheckoutButton } from '../src/CheckoutButton.tsx';

describe('CheckoutButton', () => {
  test('is disabled while the order is sent, and enabled again even when it fails', async () => {
    let fail = (_error: Error) => {};
    render(<CheckoutButton onCheckout={() => new Promise((_resolve, reject) => (fail = reject))} />);

    await userEvent.click(screen.getByRole('button', { name: 'Checkout' }));
    expect(screen.getByRole<HTMLButtonElement>('button', { name: 'Sending…' }).disabled).toBe(true);

    fail(new Error('Network down'));
    expect((await screen.findByRole<HTMLButtonElement>('button', { name: 'Checkout' })).disabled).toBe(false);
  });
});
