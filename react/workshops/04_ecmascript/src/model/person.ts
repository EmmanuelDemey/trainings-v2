export type Gender = 'male' | 'female' | 'hermaphrodite' | 'n/a' | 'none';

export type Person = {
  id: string;
  name: string;
  height?: string;
  mass?: string;
  hairColor?: string;
  skinColor?: string;
  eyeColor?: string;
  birthYear?: string;
  gender?: Gender;
  films: string[];
};
