import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import type { ThemeMode } from '../theme/themes';

type Props = { mode: ThemeMode; onToggle: () => void };

export function ThemeSwitcher({ mode, onToggle }: Props) {
  // An icon is not a name: the label says what a click DOES, for screen readers
  // and for the tooltip alike.
  const label = mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
  return (
    <Tooltip title={label}>
      <IconButton onClick={onToggle} color="inherit" aria-label={label}>
        {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
      </IconButton>
    </Tooltip>
  );
}
