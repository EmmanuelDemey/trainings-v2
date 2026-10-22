// The whole shop, driven the way a customer uses it: no prop, no event, only
// what is on the screen.
import { render, screen, within } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import { describe, expect, test } from 'vitest';
import App from '../src/App.vue';

describe('App', () => {
  test('filters the catalog as the customer types', async () => {
    const user = userEvent.setup();
    render(App);

    await user.type(screen.getByRole('searchbox', { name: 'Search the catalog' }), 'camus');

    expect(screen.getAllByRole('article')).toHaveLength(1);
    expect(screen.getByRole('heading', { name: "L'Étranger" })).toBeInTheDocument();
  });

  test('says when nothing matches', async () => {
    const user = userEvent.setup();
    render(App);

    await user.type(screen.getByRole('searchbox', { name: 'Search the catalog' }), 'tolkien');

    expect(screen.queryAllByRole('article')).toHaveLength(0);
    expect(screen.getByText('No book matches “tolkien”.')).toBeInTheDocument();
  });

  test('adds books to the cart, and updates the total', async () => {
    const user = userEvent.setup();
    render(App);

    await user.click(screen.getByRole('button', { name: 'Add “Clean Code” to cart' }));
    await user.click(screen.getByRole('button', { name: 'Add “Clean Code” to cart' }));
    await user.click(screen.getByRole('button', { name: 'Add “L\'Étranger” to cart' }));

    const cart = within(screen.getByRole('complementary', { name: 'Cart' }));
    expect(cart.getAllByRole('listitem')).toHaveLength(2);
    expect(cart.getByText('Total:')).toHaveTextContent('€87.70');
  });

  test('removes a book from the cart', async () => {
    const user = userEvent.setup();
    render(App);

    await user.click(screen.getByRole('button', { name: 'Add “Clean Code” to cart' }));
    await user.click(screen.getByRole('button', { name: 'Remove “Clean Code”' }));

    expect(screen.getByText('Your cart is empty.')).toBeInTheDocument();
  });

  test('checks out, confirms, and empties the cart', async () => {
    const user = userEvent.setup();
    render(App);

    await user.click(screen.getByRole('button', { name: 'Add “Clean Code” to cart' }));
    await user.click(screen.getByRole('button', { name: 'Add “L\'Étranger” to cart' }));
    await user.type(screen.getByRole('textbox', { name: 'Coupon' }), 'SAVE10');
    await user.click(screen.getByRole('button', { name: 'Checkout' }));

    expect(screen.getByRole('alert')).toHaveTextContent('Order placed: 2 books, coupon SAVE10.');
    expect(screen.getByText('Your cart is empty.')).toBeInTheDocument();
  });

  test('confirms a single book, without coupon', async () => {
    const user = userEvent.setup();
    render(App);

    await user.click(screen.getByRole('button', { name: 'Add “Clean Code” to cart' }));
    await user.click(screen.getByRole('button', { name: 'Checkout' }));

    expect(screen.getByRole('alert')).toHaveTextContent('Order placed: 1 book.');
  });
});
