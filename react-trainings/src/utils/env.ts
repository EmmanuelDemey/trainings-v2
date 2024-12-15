const getEnv = (k: string): string => import.meta.env['VITE_'.concat(k)];

export const API_BASE_URL = getEnv('API_BASE_URL');
