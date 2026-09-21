import 'pinia';

declare module 'pinia' {
  /**
   * TODO 3.4: declare the custom `persist` option so `defineStore(..., { persist: true })`
   * type-checks and `options.persist` is not `unknown` inside the plugin.
   *
   *   export interface DefineStoreOptionsBase<S, Store> {
   *     persist?: boolean;
   *   }
   *
   * TODO 4.3 (bonus): declare the properties your logger plugin adds to every
   * store, e.g.
   *
   *   export interface PiniaCustomProperties {
   *     $actionLog: Array<{ name: string; durationMs: number }>;
   *   }
   */
}
