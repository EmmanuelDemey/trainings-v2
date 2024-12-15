import { Person } from '@model/person';

// Get array of Person length
export const getLength = (arr: Person[]): number => arr.length;

// Returns only males from array of Person
export const getMales = (arr: Person[]): number =>
	getLength(arr.filter(({ gender }) => gender === 'male'));

// Return array of names from array of Person
export const getNames = (arr: Person[]): string[] =>
	arr.map(({ name }) => name);

// Return array of an attribute from array of Person
export const getAttr =
	(attr: 'name' | 'id') =>
	(arr: Person[]): string[] =>
		arr.map((p) => p[attr]);

// Returns array of keys of the first Person in array
export const checkFirstElementKeys = (arr: Person[]): string[] | null =>
	getLength(arr) === 0 ? null : Object.keys(arr[0]);

// Returns "key: value" for each elements of the last Person in array
export const buildInfosForLastElement = (arr: Person[]): string[] | null => {
	const length = getLength(arr);
	if (length === 0) return null;
	const last = arr[length - 1];
	return Object.entries(last).map(([k, v]) => `${k}: ${v}`);
};

// Calculate the mass average from the array of Person
export const getMassAverage = (arr: Person[]) => {
	const length = getLength(arr);
	if (length === 0) return null;
	const masses = arr.map(({ mass }) => mass);
	if (masses.includes(undefined)) return null;
	return masses.reduce((acc, m) => acc + parseInt(m ?? '0'), 0) / length;
};

// For last Person, keep elements where value is assignable to numeric, and add one to each field
export const addOneForLastElement = (arr: Person[]): Partial<Person> => {
	const length = getLength(arr);
	if (length === 0) return {};
	const last = arr[length - 1];
	return Object.entries(last).reduce((acc, [k, v]) => {
		if (typeof v === 'string' && !isNaN(Number(v))) {
			return { ...acc, [k]: (parseInt(v) + 1).toString() };
		}
		return acc;
	}, {});
};
