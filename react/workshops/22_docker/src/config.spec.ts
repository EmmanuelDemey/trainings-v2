import { afterEach, describe, expect, it, vi } from 'vitest';
import { getConfig } from './config';

describe('getConfig', () => {
  afterEach(() => {
    delete window.__ENV__;
    vi.unstubAllEnvs();
  });

  it('uses the build-time VITE_ variables when there is no runtime configuration', () => {
    vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:5173/api');
    vi.stubEnv('VITE_APP_ENVIRONMENT', 'development');

    expect(getConfig()).toEqual({ apiBaseUrl: 'http://localhost:5173/api', environment: 'development' });
  });

  it('prefers the runtime values written into window.__ENV__ by the container', () => {
    vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:5173/api');
    window.__ENV__ = { API_BASE_URL: 'https://swapi.example.com/api', APP_ENVIRONMENT: 'production' };

    expect(getConfig()).toEqual({ apiBaseUrl: 'https://swapi.example.com/api', environment: 'production' });
  });

  it('falls back to the build-time value when a runtime value is empty', () => {
    // What the container writes for a variable it was not given — and what a
    // Kubernetes manifest with `value: ''` produces.
    vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:5173/api');
    window.__ENV__ = { API_BASE_URL: '', APP_ENVIRONMENT: '' };

    expect(getConfig().apiBaseUrl).toBe('http://localhost:5173/api');
  });

  it('drops the trailing slash, so `${apiBaseUrl}/people` never has two', () => {
    window.__ENV__ = { API_BASE_URL: 'https://swapi.example.com/api/' };

    expect(getConfig().apiBaseUrl).toBe('https://swapi.example.com/api');
  });

  it('defaults the environment to "development"', () => {
    vi.stubEnv('VITE_APP_ENVIRONMENT', '');
    window.__ENV__ = { API_BASE_URL: 'https://swapi.example.com/api' };

    expect(getConfig().environment).toBe('development');
  });

  it('fails loudly, naming both variables, when no API base URL is set anywhere', () => {
    vi.stubEnv('VITE_API_BASE_URL', '');

    expect(() => getConfig()).toThrow(/API_BASE_URL.*VITE_API_BASE_URL/);
  });
});
