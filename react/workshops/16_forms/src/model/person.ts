/** A Star Wars character, as the API stores and returns it. */
export interface Person {
  id: string;
  name: string;
  /** In centimetres. */
  height: number;
  hairColor: string;
  gender: string;
  /** In the galactic calendar: `19BBY` is 19 years Before the Battle of Yavin. */
  birthYear: string;
}
