export const getEnv = (k: string): string => import.meta.env['VITE_'.concat(k)];
