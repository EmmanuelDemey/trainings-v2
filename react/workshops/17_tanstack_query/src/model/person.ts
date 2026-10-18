/** A Star Wars character, as the API returns it. */
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
  /** How many times the fans liked this character — stored by the server. */
  likes: number;
}
