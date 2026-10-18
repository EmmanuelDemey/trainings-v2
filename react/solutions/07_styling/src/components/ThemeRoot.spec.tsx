import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeRoot } from './ThemeRoot';
import styles from './ThemeRoot.module.css';
import { classOf } from '../tests/classOf';

function rootOf(content: HTMLElement) {
  return content.parentElement!;
}

describe('ThemeRoot', () => {
  it('wraps its children in the root class, tagged with the theme', () => {
    render(
      <ThemeRoot theme="dark">
        <p>Inside</p>
      </ThemeRoot>,
    );

    const root = rootOf(screen.getByText('Inside'));
    expect(root).toHaveClass(classOf(styles, 'root'));
    expect(root).toHaveAttribute('data-theme', 'dark');
  });

  it('gives the dark theme its own custom property values', () => {
    render(
      <>
        <ThemeRoot theme="light">
          <p>Light</p>
        </ThemeRoot>
        <ThemeRoot theme="dark">
          <p>Dark</p>
        </ThemeRoot>
      </>,
    );

    const light = getComputedStyle(rootOf(screen.getByText('Light'))).getPropertyValue('--surface');
    const dark = getComputedStyle(rootOf(screen.getByText('Dark'))).getPropertyValue('--surface');
    expect(light).toBe('#fff');
    expect(dark).toBe('#161b22');
  });

  it('sets the accent colour as an inline custom property', () => {
    render(
      <ThemeRoot theme="light" accent="#ff6b00">
        <p>Inside</p>
      </ThemeRoot>,
    );

    expect(rootOf(screen.getByText('Inside')).style.getPropertyValue('--accent')).toBe('#ff6b00');
  });

  it('leaves the accent unset without an accent prop, so the fallback applies', () => {
    render(
      <ThemeRoot theme="light">
        <p>Inside</p>
      </ThemeRoot>,
    );

    expect(rootOf(screen.getByText('Inside')).style.getPropertyValue('--accent')).toBe('');
  });
});
