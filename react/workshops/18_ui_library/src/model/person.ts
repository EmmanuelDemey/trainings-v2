/** A Star Wars character. */
export interface Person {
  id: string;
  name: string;
  /** In centimetres. */
  height: number;
  /** In kilograms. */
  mass: number;
  hairColor: string;
  gender: string;
  birthYear: string;
}
