import type { ReactElement, ReactNode } from 'react';

// The custom property of the badges, added to React's `CSSProperties`: module
// augmentation — two `interface CSSProperties` declarations merge into one.
declare module 'react' {
  interface CSSProperties {
    '--badge-color'?: string;
  }
}

export interface BadgeProps {
  color: string;
  children: ReactNode;
}

/** A tag, coloured through the `--badge-color` CSS custom property. */
export function Badge({ color, children }: BadgeProps): ReactElement {
  return (
    <span className="badge" style={{ '--badge-color': color }}>
      {children}
    </span>
  );
}
