import { render, screen } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import { describe, expect, test } from 'vitest';
import { BOOKS, type Book } from '../src/books';
import BookCard from '../src/components/BookCard.vue';

const [cleanCode, effectiveJava, , algorithms] = BOOKS as [Book, Book, Book, Book];

describe('BookCard', () => {
  test('shows the title, the author and the price', () => {
    render(BookCard, { props: { book: cleanCode, inCart: 0 } });

    expect(screen.getByRole('heading', { name: 'Clean Code' })).toBeInTheDocument();
    expect(screen.getByText('Robert C. Martin')).toBeInTheDocument();
    expect(screen.getByText('€39.90')).toBeInTheDocument();
  });

  test('emits add with the book when the button is clicked', async () => {
    const user = userEvent.setup();
    const { emitted } = render(BookCard, { props: { book: cleanCode, inCart: 0 } });

    await user.click(screen.getByRole('button', { name: 'Add “Clean Code” to cart' }));

    expect(emitted('add')).toEqual([[cleanCode]]);
  });

  test('disables the button once every copy is in the cart', () => {
    render(BookCard, { props: { book: effectiveJava, inCart: 1 } });

    expect(screen.getByRole('button', { name: /add/i })).toBeDisabled();
  });

  test('says when the book is out of stock', () => {
    render(BookCard, { props: { book: algorithms, inCart: 0 } });

    expect(screen.getByRole('status')).toHaveTextContent('Out of stock');
    expect(screen.getByRole('button', { name: /add/i })).toBeDisabled();
  });

  test('says nothing about the stock when there is some', () => {
    render(BookCard, { props: { book: cleanCode, inCart: 0 } });

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});
