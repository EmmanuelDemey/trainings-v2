export interface Person {
  id: string;
  name: string;
  /** In centimetres. */
  height: number;
  /** In kilograms. */
  mass: number;
  birthYear: string;
  /** When the record was last edited, as an ISO 8601 string (UTC). */
  edited: string;
}
