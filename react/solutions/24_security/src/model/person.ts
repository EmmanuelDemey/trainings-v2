/** A Star Wars character, as the API returns it. */
export interface Person {
  id: string;
  name: string;
  birthYear: string;
  /** HTML written by the fans — UNTRUSTED: it may carry a script. */
  bio: string;
  /** A link written by the fans — UNTRUSTED too: it may be `javascript:…`. */
  homepage: string;
}
