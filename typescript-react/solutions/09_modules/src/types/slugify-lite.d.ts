// The types of slugify-lite — written by hand: the package ships none. An
// ambient module: it describes a module by its name, wherever it lives.

declare module 'slugify-lite' {
  export interface SlugifyOptions {
    /** Between two words. Default: `'-'`. */
    separator?: string;
    /** Default: `true`. */
    lowercase?: boolean;
    /** The slug is cut at a word boundary. Default: no limit. */
    maxLength?: number;
  }

  /** The version of the package. */
  export const VERSION: string;

  /** The words of a text, accents removed. */
  export function words(input: string): string[];

  /** A URL-safe version of a text. */
  export function slugify(input: string, options?: SlugifyOptions): string;
}
