import { createTheme, type Theme } from '@mui/material/styles';

export type ThemeMode = 'light' | 'dark';

// TODO 1.1: the shared part — `typography` (fontFamily 'system-ui, sans-serif',
//           h1 of 2rem / 700) and `shape.borderRadius` of 8.
// TODO 1.2: the light palette — mode 'light', primary '#1976d2',
//           background default '#f5f7fa' and paper '#ffffff'.
export const lightTheme = createTheme();

// TODO 1.3: the dark palette — mode 'dark', primary '#90caf9',
//           background default '#121212' and paper '#1e1e1e'.
export const darkTheme = createTheme();

export const themes: Record<ThemeMode, Theme> = { light: lightTheme, dark: darkTheme };
