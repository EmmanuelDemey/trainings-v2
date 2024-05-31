import { expect, test } from 'vitest';
import { getIDFromUrl } from './url';
import { getEnv } from './env';

test('extract url id', () => {
	expect(getIDFromUrl(`${getEnv('API_BASE_URL')}/5`)).toBe('5');
});
