export type Gender = 'male' | 'female' | 'n/a';

export interface Person {
  id: string;
  name: string;
  /** In centimetres. */
  height: number;
  /** In kilograms — `null` when nobody knows. */
  mass: number | null;
  hairColor: string;
  skinColor: string;
  eyeColor: string;
  birthYear: string;
  gender: Gender;
}
