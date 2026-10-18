import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { darkTheme, lightTheme } from '../theme/themes';
import { Title } from './Title';

describe('step 4 — the styled title', () => {
  it('is a level-1 heading', () => {
    render(
      <ThemeProvider theme={lightTheme}>
        <Title>Star Wars people</Title>
      </ThemeProvider>,
    );

    expect(screen.getByRole('heading', { level: 1, name: 'Star Wars people' })).toBeInTheDocument();
  });

  it.each([
    ['light', lightTheme],
    ['dark', darkTheme],
  ])('takes the primary colour of the %s theme', (_mode, theme) => {
    render(
      <ThemeProvider theme={theme}>
        <Title>Star Wars people</Title>
      </ThemeProvider>,
    );

    expect(screen.getByRole('heading', { level: 1 })).toHaveStyle({ color: theme.palette.primary.main });
  });
});
