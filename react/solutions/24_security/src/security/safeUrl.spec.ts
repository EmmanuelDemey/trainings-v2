import { describe, expect, it } from 'vitest';
import { safeUrl } from './safeUrl';

describe('safeUrl', () => {
  it.each(['https://starwars.fandom.com/wiki/Luke', 'http://example.com', 'mailto:leia@alderaan.org'])(
    'keeps %s',
    (url) => {
      expect(safeUrl(url)).toBe(new URL(url).href);
    },
  );

  it.each([
    'javascript:alert(1)',
    'JaVaScRiPt:alert(1)',
    '  javascript:alert(1)',
    '\tjava\nscript:alert(1)',
    'data:text/html,<script>alert(1)</script>',
    'vbscript:msgbox(1)',
  ])('refuses %j', (url) => {
    expect(safeUrl(url)).toBeUndefined();
  });
});
