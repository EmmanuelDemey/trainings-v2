import { getEnv } from './env';

export const getIDFromUrl = (url: string): string => {
	const withoutPrefix = url.replace(`${getEnv('API_BASE_URL')}/`, '');
	return withoutPrefix.replace('/', '');
};
