import { describe, expect, it } from 'vitest';
import { safeRedirect } from './guards';

describe('safeRedirect', () => {
  it('keeps a path of this app, with its query string', () => {
    expect(safeRedirect('/people/1?tab=bio')).toBe('/people/1?tab=bio');
  });

  it.each([
    ['an absolute URL', 'https://evil.example/login'],
    ['a protocol-relative URL', '//evil.example'],
    ['a backslash trick', '/\\evil.example'],
    ['a javascript: URL', 'javascript:alert(1)'],
    ['a relative path', 'people'],
  ])('falls back to "/" for %s', (_label, to) => {
    expect(safeRedirect(to)).toBe('/');
  });

  it('falls back when there is nothing to redirect to', () => {
    expect(safeRedirect(null)).toBe('/');
    expect(safeRedirect(null, '/admin')).toBe('/admin');
  });
});
