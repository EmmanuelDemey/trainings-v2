import { beforeEach, describe, expect, test } from 'vitest';
import { history, on, publish } from '../src/index.ts';
import { banner } from '../src/version.ts';

beforeEach(() => {
  history.length = 0;
});

describe('publish', () => {
  test('slugifies the title, through slugify-lite', () => {
    expect(publish('Hello, Wörld!').slug).toBe('hello-world');
  });

  test('keeps the slug under 40 characters', () => {
    expect(publish('TypeScript modules, declaration files and everything in between').slug).toBe(
      'typescript-modules-declaration-files-and',
    );
  });

  test('emits article:published with the slug and the title', () => {
    const received: unknown[] = [];
    on('article:published', (payload) => received.push(payload));
    publish('Hello, Wörld!');
    expect(received).toEqual([{ slug: 'hello-world', title: 'Hello, Wörld!' }]);
    expect(history).toEqual([{ name: 'article:published', payload: { slug: 'hello-world', title: 'Hello, Wörld!' } }]);
  });
});

describe('banner', () => {
  test('reads the APP_VERSION global', () => {
    globalThis.APP_VERSION = '2.0.0';
    expect(banner()).toBe('blog v2.0.0');
  });
});
