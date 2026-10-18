export interface Planet {
  name: string;
}

/** A Star Wars character. */
export interface Person {
  id: string;
  name: string;
  /** In centimetres, as a string — SWAPI's raw values. */
  height: string;
  /** In kilograms, as a string. */
  mass: string;
  birthYear: string;
  homeworld: Planet;
}
