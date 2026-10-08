import { describe, expect, it } from 'vitest';
import { ZodError } from 'zod';
import { parseSearch } from '../src/schemas/search';

describe('parseSearch', () => {
  it('fills in every default on an empty query', () => {
    expect(parseSearch('')).toEqual({ page: 1, tags: [], sort: 'date' });
  });

  it('turns the page into a number', () => {
    expect(parseSearch('page=3')).toMatchObject({ page: 3 });
  });

  it.each(['page=0', 'page=-1', 'page=abc', 'page=1.5'])('rejects %s', (query) => {
    expect(() => parseSearch(query)).toThrow(ZodError);
  });

  it('trims the free text', () => {
    expect(parseSearch('q=%20%20jazz%20')).toMatchObject({ q: 'jazz' });
  });

  it('rejects a free text under two characters, once trimmed', () => {
    expect(() => parseSearch('q=%20j%20')).toThrow(ZodError);
  });

  it('splits the tags, and drops the blanks', () => {
    expect(parseSearch('tags=soul,%20funk,,')).toMatchObject({ tags: ['soul', 'funk'] });
  });

  it('rejects more than five tags', () => {
    expect(() => parseSearch('tags=a1,b2,c3,d4,e5,f6')).toThrow(ZodError);
  });

  it('keeps a known sort, and falls back to the date on an unknown one', () => {
    expect(parseSearch('sort=price')).toMatchObject({ sort: 'price' });
    expect(parseSearch('sort=hack')).toMatchObject({ sort: 'date' });
  });
});
