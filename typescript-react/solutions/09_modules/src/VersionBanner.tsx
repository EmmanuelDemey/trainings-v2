import type { ReactElement } from 'react';

/** `blog v2.0.0` — read from the `APP_VERSION` global. */
export function VersionBanner(): ReactElement {
  return <footer>blog v{globalThis.APP_VERSION}</footer>;
}
