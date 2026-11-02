import type { StandardSchemaV1 } from '@standard-schema/spec';

/** One book, as the API sends it. */
export const dune = {
  id: 1,
  isbn: '9780441172719',
  title: 'Dune',
  authors: ['Frank Herbert'],
  publishedAt: '1965-08-01',
  price: 9.99,
  cover: 'https://covers.books.dev/dune.jpg',
};

/** A schema written by hand, with no library: Standard Schema is just an interface. */
export const evenNumber: StandardSchemaV1<unknown, number> = {
  '~standard': {
    version: 1,
    vendor: 'by-hand',
    validate: (value) =>
      typeof value === 'number' && value % 2 === 0 ? { value } : { issues: [{ message: 'Not an even number' }] },
  },
};

/** The same, answering later — as a schema that calls a server would. */
export const slowEvenNumber: StandardSchemaV1<unknown, number> = {
  '~standard': {
    ...evenNumber['~standard'],
    validate: async (value) => evenNumber['~standard'].validate(value),
  },
};
