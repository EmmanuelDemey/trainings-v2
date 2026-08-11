import 'vue-router';

declare module 'vue-router' {
  /**
   * TODO 1.1: type the `meta` fields you are going to use. Without this,
   * `to.meta.requiresAuth` is `unknown` and a typo goes unnoticed.
   *
   *   requiresAuth?: boolean;
   *   roles?: Array<'admin' | 'user'>;
   *   transition?: string;
   */
  interface RouteMeta {
    title?: string;
  }
}
