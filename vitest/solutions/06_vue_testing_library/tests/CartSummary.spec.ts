import { render, screen } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import { describe, expect, test } from 'vitest';
import { BOOKS, type Book } from '../src/books';
import CartSummary from '../src/components/CartSummary.vue';

const [cleanCode, , etranger] = BOOKS as [Book, Book, Book];

describe('CartSummary', () => {
  test('says the cart is empty, and checkout is disabled', () => {
    render(CartSummary, { props: { lines: [] } });

    expect(screen.getByText('Your cart is empty.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Checkout' })).toBeDisabled();
  });

  test('lists the lines and their total', () => {
    render(CartSummary, { props: { lines: [{ book: cleanCode, quantity: 2 }, { book: etranger, quantity: 1 }] } });

    const [first, second] = screen.getAllByRole('listitem');
    expect(first).toHaveTextContent('2 × Clean Code — €79.80');
    expect(second).toHaveTextContent("1 × L'Étranger — €7.90");
    expect(screen.getByText('Total:')).toHaveTextContent('Total: €87.70');
  });

  test('emits remove with the ISBN of the line', async () => {
    const user = userEvent.setup();
    const { emitted } = render(CartSummary, { props: { lines: [{ book: etranger, quantity: 1 }] } });

    await user.click(screen.getByRole('button', { name: 'Remove “L\'Étranger”' }));

    expect(emitted('remove')).toEqual([['9782070360024']]);
  });

  test('emits checkout with the coupon typed, trimmed', async () => {
    const user = userEvent.setup();
    const { emitted } = render(CartSummary, { props: { lines: [{ book: etranger, quantity: 1 }] } });

    await user.type(screen.getByRole('textbox', { name: 'Coupon' }), '  SAVE10 ');
    await user.click(screen.getByRole('button', { name: 'Checkout' }));

    expect(emitted('checkout')).toEqual([['SAVE10']]);
  });

  test('emits checkout with null when no coupon is typed', async () => {
    const user = userEvent.setup();
    const { emitted } = render(CartSummary, { props: { lines: [{ book: etranger, quantity: 1 }] } });

    await user.click(screen.getByRole('button', { name: 'Checkout' }));

    expect(emitted('checkout')).toEqual([[null]]);
  });
});
