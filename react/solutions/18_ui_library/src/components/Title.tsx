import { styled } from '@mui/material/styles';

/**
 * `styled` gives a component its own CSS, computed from the theme: the colour
 * follows the mode with no `if (dark)` anywhere. Starting from the `h1` tag
 * keeps the heading a heading; the theme's `h1` typography gives it its look.
 */
const StyledTitle = styled('h1')(({ theme }) => ({
  ...theme.typography.h1,
  color: theme.palette.primary.main,
  letterSpacing: '0.02em',
  marginTop: 0,
  // `theme.spacing(3)` is 24px with the default 8px grid.
  marginBottom: theme.spacing(3),
}));

export function Title({ children }: { children: string }) {
  return <StyledTitle>{children}</StyledTitle>;
}
