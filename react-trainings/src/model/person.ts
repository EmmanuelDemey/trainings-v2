export interface Person {
	name: string;
	id: string;
	height?: string;
	mass?: string;
	hairColor?: string;
	skinColor?: string;
	eyeColor?: string;
	birthYear?: string;
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
