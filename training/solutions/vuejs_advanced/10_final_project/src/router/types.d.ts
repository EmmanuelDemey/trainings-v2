import 'vue-router';

declare module 'vue-router' {
  interface RouteMeta {
    title?: string;
    /** Set on every route the guard must protect. */
    requiresAuth?: boolean;
    /** When set, the user must hold at least one of these roles. */
    roles?: Array<'admin' | 'accountant'>;
  }
}
