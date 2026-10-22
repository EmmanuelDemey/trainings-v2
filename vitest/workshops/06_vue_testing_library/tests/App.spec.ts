// TODO — Step 4. The whole shop, driven the way a customer uses it: no prop,
// no event, only what is on the screen.
import { render, screen, within } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import { describe, expect, test } from 'vitest';
import App from '../src/App.vue';

describe('App', () => {
  test.todo('filters the catalog as the customer types');
  test.todo('says when nothing matches');
  test.todo('adds books to the cart, and updates the total');
  test.todo('removes a book from the cart');
  test.todo('checks out, confirms, and empties the cart');
  test.todo('confirms a single book, without coupon');
});
