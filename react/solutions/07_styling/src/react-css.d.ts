import 'react';

// React's `CSSProperties` knows `width` or `color`, not `--accent`. Teach it
// that any `--*` key is a valid custom property, instead of casting at each
// call site.
declare module 'react' {
  interface CSSProperties {
    [customProperty: `--${string}`]: string | number | undefined;
  }
}
