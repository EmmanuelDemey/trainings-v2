// TODO — Step 2. Query by role first, by text when there is no role. Read
// emitted() for what the card tells its parent.
import { render, screen } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import { describe, expect, test } from 'vitest';
import { BOOKS, type Book } from '../src/books';
import BookCard from '../src/components/BookCard.vue';

const [cleanCode, effectiveJava, , algorithms] = BOOKS as [Book, Book, Book, Book];

describe('BookCard', () => {
  test.todo('shows the title, the author and the price');
  test.todo('emits add with the book when the button is clicked');
  test.todo('disables the button once every copy is in the cart');
  test.todo('says when the book is out of stock');
  test.todo('says nothing about the stock when there is some');
});
