import type { CSSProperties } from 'react';
import { slugify, words, VERSION, type SlugifyOptions } from 'slugify-lite';
import { describe, expectTypeOf, test } from 'vitest';
import { Badge } from '../src/index.ts';

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

describe('the --badge-color custom property', () => {
  test('is in React’s CSSProperties, as an optional string', () => {
    expectTypeOf<CSSProperties['--badge-color']>().toEqualTypeOf<string | undefined>();
  });

  test('is accepted by the style of any element', () => {
    <p style={{ '--badge-color': 'tomato', color: 'var(--badge-color)' }} />;
    <Badge color="tomato">ok</Badge>;
  });

  test('refuses a custom property nobody declared', () => {
    // @ts-expect-error — no module declared '--badge-colour'
    <p style={{ '--badge-colour': 'tomato' }} />;
  });
});

describe('the APP_VERSION global', () => {
  test('is a string', () => {
    expectTypeOf(globalThis.APP_VERSION).toEqualTypeOf<string>();
  });
});
