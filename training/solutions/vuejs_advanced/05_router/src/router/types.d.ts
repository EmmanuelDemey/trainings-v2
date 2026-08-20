import 'vue-router';

declare module 'vue-router' {
  /**
   * Typing `meta` is what turns a typo into a compile error. Without it,
   * `to.meta.requiresAuth` is `unknown`, and `to.meta.requiresAuht` is… also
   * `unknown` — falsy, silently, for ever. On a route guard that means an
   * unprotected page nobody notices.
   */
  interface RouteMeta {
    title?: string;
    requiresAuth?: boolean;
    roles?: Array<'admin' | 'user'>;
    transition?: string;
  }
}
