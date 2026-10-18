import type { ThemeMode } from '../theme/themes';

type Props = { mode: ThemeMode; onToggle: () => void };

export function ThemeSwitcher({ mode, onToggle }: Props) {
  const label = mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
  // TODO 2.5: an MUI `IconButton` (color "inherit") inside a `Tooltip` with the
  //           label, showing `LightModeIcon` in dark mode and `DarkModeIcon` in
  //           light mode (from '@mui/icons-material/…'). Keep the `aria-label`.
  return (
    <button type="button" className="switcher" onClick={onToggle} aria-label={label}>
      {mode === 'dark' ? '☀' : '☾'}
    </button>
  );
}
