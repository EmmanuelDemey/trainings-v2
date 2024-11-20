export interface Person {
  name: string;
  url: string;
  height?: string;
  mass?: string;
  hair_color?: string;
  skin_color?: string;
  eye_color?: string;
  birth_year?: string;
  gender?: string;
  homeworld?: string;
  films?: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  species?: any[];
  vehicles?: string[];
  starships?: string[];
  created?: string;
  edited?: string;
}
