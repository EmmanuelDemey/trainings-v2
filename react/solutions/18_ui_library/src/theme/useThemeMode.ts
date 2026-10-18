import { useState } from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
import type { ThemeMode } from './themes';

export const THEME_MODE_KEY = 'theme-mode';

/** What the user chose last time — or nothing, when they never chose, or storage is blocked. */
function readStoredMode(): ThemeMode | null {
  try {
    const stored = localStorage.getItem(THEME_MODE_KEY);
    return stored === 'light' || stored === 'dark' ? stored : null;
  } catch {
    return null;
  }
}

/**
 * The current mode and a toggle. A choice the user made wins, and survives a
 * reload; until they make one, the mode follows the operating system.
 */
export function useThemeMode(): [ThemeMode, () => void] {
  // A function given to `useState` runs once, on the first render — not one
  // `localStorage` read per render.
  const [stored, setStored] = useState<ThemeMode | null>(readStoredMode);
  // MUI's hook, safe where `matchMedia` does not exist (jsdom, SSR): it answers false.
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
  const mode: ThemeMode = stored ?? (prefersDark ? 'dark' : 'light');

  const toggle = () => {
    const next: ThemeMode = mode === 'dark' ? 'light' : 'dark';
    setStored(next);
    try {
      localStorage.setItem(THEME_MODE_KEY, next);
    } catch {
      // Private window with storage blocked: the switch still works, it is just not remembered.
    }
  };

  return [mode, toggle];
}
