import { describe, expect, it } from 'vitest';
import { darkTheme, lightTheme, themes } from './themes';

describe('step 1 — the two themes', () => {
  it('has a light and a dark theme, by mode', () => {
    expect(themes.light).toBe(lightTheme);
    expect(themes.dark).toBe(darkTheme);
    expect(lightTheme.palette.mode).toBe('light');
    expect(darkTheme.palette.mode).toBe('dark');
  });

  it('gives each mode its own primary colour and background', () => {
    expect(lightTheme.palette.primary.main).toBe('#1976d2');
    expect(darkTheme.palette.primary.main).toBe('#90caf9');
    expect(lightTheme.palette.background.default).toBe('#f5f7fa');
    expect(darkTheme.palette.background.default).toBe('#121212');
  });

  it('lets MUI derive the text colour from the mode', () => {
    // Never set by hand: `mode: 'dark'` is enough for light text on dark paper.
    expect(darkTheme.palette.text.primary).toBe('#fff');
    expect(lightTheme.palette.text.primary).toBe('rgba(0, 0, 0, 0.87)');
  });
});
