import type { ReactElement, ReactNode } from 'react';

// TODO 2: add the '--badge-color' custom property to React's `CSSProperties` —
// by module augmentation of 'react' — and set it in the `style` of the badge.

export interface BadgeProps {
  color: string;
  children: ReactNode;
}

/** A tag, coloured through the `--badge-color` CSS custom property. */
export function Badge({ color, children }: BadgeProps): ReactElement {
  return <span className="badge">{children}</span>;
}
