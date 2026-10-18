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
  // TODO 5.1: tag the root with a `data-theme` attribute.
  // TODO 5.3: when `accent` is given, set it as the `--accent` custom property
  //           in the inline style — then make TypeScript accept `--accent` as
  //           a key of `CSSProperties` (see the README).
  return <div className={styles.root}>{children}</div>;
}
