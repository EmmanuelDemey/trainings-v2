import type { Book } from '../src/model.ts';

export const dune: Book = {
  id: 'b1',
  title: 'Dune',
  author: 'Frank Herbert',
  genre: 'novel',
  publishedAt: new Date('1965-08-01'),
  tags: ['sf'],
};

export const maus: Book = {
  id: 'b2',
  title: 'Maus',
  author: 'Art Spiegelman',
  genre: 'comic',
  publishedAt: new Date('1986-01-01'),
  summary: 'A survivor tells his son',
  tags: [],
};
