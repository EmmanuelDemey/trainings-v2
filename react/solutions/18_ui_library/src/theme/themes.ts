import { createTheme, type Theme } from '@mui/material/styles';

export type ThemeMode = 'light' | 'dark';

/**
 * What both themes share: the typography and the shape. A theme is a plain
 * object — `createTheme` fills in everything you leave out (spacing, shadows,
 * breakpoints, every component's defaults).
 */
const shared = {
  typography: {
    fontFamily: 'system-ui, sans-serif',
    h1: { fontSize: '2rem', fontWeight: 700 },
  },
  shape: { borderRadius: 8 },
};

export const lightTheme = createTheme({
  ...shared,
  palette: {
    mode: 'light',
    primary: { main: '#1976d2' },
    background: { default: '#f5f7fa', paper: '#ffffff' },
  },
});

export const darkTheme = createTheme({
  ...shared,
  palette: {
    // `mode: 'dark'` alone already flips the text colours, the dividers and the
    // hover states of every component; the rest is our brand.
    mode: 'dark',
    primary: { main: '#90caf9' },
    background: { default: '#121212', paper: '#1e1e1e' },
  },
});

export const themes: Record<ThemeMode, Theme> = { light: lightTheme, dark: darkTheme };
