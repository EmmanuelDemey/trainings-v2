import type { ThemeMode } from './themes';

export const THEME_MODE_KEY = 'theme-mode';

/**
 * The current mode and a toggle. A choice the user made wins, and survives a
 * reload; until they make one, the mode follows the operating system.
 */
export function useThemeMode(): [ThemeMode, () => void] {
  // TODO 2.1: keep the chosen mode in state, initialised (lazily) from
  //           localStorage[THEME_MODE_KEY] — only 'light' or 'dark' count.
  // TODO 2.2: no choice yet → `useMediaQuery('(prefers-color-scheme: dark)')`
  //           (from '@mui/material/useMediaQuery') decides.
  // TODO 2.3: the toggle flips the mode and writes it to localStorage — in a
  //           try/catch: storage can be blocked.
  return ['light', () => {}];
}
