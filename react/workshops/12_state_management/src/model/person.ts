/** A Star Wars character, as the API returns it. */
export interface Person {
  id: string;
  name: string;
  /** In centimetres, as a string — the API keeps SWAPI's raw values ("unknown" included). */
  height: string;
  /** In kilograms, as a string. */
  mass: string;
  hairColor: string;
  skinColor: string;
  eyeColor: string;
  birthYear: string;
  gender: string;
}
