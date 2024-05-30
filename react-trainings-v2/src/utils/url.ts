export const getIDFromUrl = (url: string): string => {
	const withoutPrefix = url.replace('https://swapi.dev/api/people/', '');
	return withoutPrefix.replace('/', '');
};
