import { slugify, words, VERSION, type SlugifyOptions } from 'slugify-lite';
import { describe, expectTypeOf, test } from 'vitest';
import { emit, on, type EventMap } from '../src/index.ts';

describe('slugify-lite.d.ts', () => {
  test('types slugify', () => {
    expectTypeOf(slugify).toEqualTypeOf<(input: string, options?: SlugifyOptions) => string>();
  });

  test('types its options, all optional', () => {
    expectTypeOf<SlugifyOptions>().toEqualTypeOf<{ separator?: string; lowercase?: boolean; maxLength?: number }>();
  });

  test('types words and VERSION', () => {
    expectTypeOf(words).toEqualTypeOf<(input: string) => string[]>();
    expectTypeOf(VERSION).toEqualTypeOf<string>();
  });
});

describe('the article:published event', () => {
  test('is in the EventMap, with its payload', () => {
    expectTypeOf<EventMap['article:published']>().toEqualTypeOf<{ slug: string; title: string }>();
  });

  test('types the payload a listener receives', () => {
    on('article:published', (payload) => {
      expectTypeOf(payload).toEqualTypeOf<{ slug: string; title: string }>();
    });
  });

  test('refuses an event nobody declared', () => {
    // @ts-expect-error — no module declared 'article:deleted'
    emit('article:deleted', { slug: 'x' });
  });
});

describe('the APP_VERSION global', () => {
  test('is a string', () => {
    expectTypeOf(globalThis.APP_VERSION).toEqualTypeOf<string>();
  });
});
