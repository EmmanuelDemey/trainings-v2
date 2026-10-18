import { describe, expect, it, vi } from 'vitest';
import { apiUrl } from './config';

describe('apiUrl', () => {
  it('reads its base from the committed .env', () => {
    expect(import.meta.env.VITE_API_BASE_URL).toBe('/api');
    expect(apiUrl('/people')).toBe('/api/people');
  });

  it('follows VITE_API_BASE_URL when another environment sets it', () => {
    vi.stubEnv('VITE_API_BASE_URL', 'https://swapi.example/api');

    expect(apiUrl('/people/1')).toBe('https://swapi.example/api/people/1');
  });

  it('does not double the slash when the base URL ends with one', () => {
    vi.stubEnv('VITE_API_BASE_URL', 'https://swapi.example/api/');

    expect(apiUrl('/people')).toBe('https://swapi.example/api/people');
  });
});
