import 'pinia';
import type { actionLog } from './logger';

declare module 'pinia' {
  /**
   * The custom option, declared once here and understood everywhere:
   * `defineStore(..., { persist: true })` type-checks, and `options.persist` is
   * typed inside the plugin instead of `unknown`.
   */
  export interface DefineStoreOptionsBase<S, Store> {
    persist?: boolean | { paths: string[] };
  }

  /** Properties the logger plugin adds to EVERY store. */
  export interface PiniaCustomProperties {
    $actionLog: typeof actionLog;
  }
}
