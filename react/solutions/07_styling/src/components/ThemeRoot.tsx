import type { ReactNode } from 'react';
import styles from './ThemeRoot.module.css';

export type Theme = 'light' | 'dark';

type ThemeRootProps = {
  theme: Theme;
  /** Overrides the accent colour of everything inside. */
  accent?: string;
  children: ReactNode;
};

export function ThemeRoot({ theme, accent, children }: ThemeRootProps) {
  return (
    <div
      className={styles.root}
      data-theme={theme}
      // A custom property set inline cascades to every descendant: the Button
      // and the HeightBar pick it up through `var(--accent)`. `undefined`
      // leaves it unset, so the stylesheet's fallback applies.
      style={{ '--accent': accent }}
    >
      {children}
    </div>
  );
}
