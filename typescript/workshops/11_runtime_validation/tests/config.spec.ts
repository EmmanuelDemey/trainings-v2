import { describe, expect, test } from 'vitest';
import { ConfigError, loadConfig } from '../src/config.ts';

const API_URL = 'https://api.books.dev';

describe('loadConfig', () => {
  test('fills in the defaults', () => {
    expect(loadConfig({ API_URL })).toEqual({ PORT: 3000, API_URL, LOG_LEVEL: 'info', CACHE: false });
  });

  test('turns strings into numbers and booleans', () => {
    expect(loadConfig({ API_URL, PORT: '8080', LOG_LEVEL: 'debug', CACHE: 'true' })).toEqual({
      PORT: 8080,
      API_URL,
      LOG_LEVEL: 'debug',
      CACHE: true,
    });
  });

  test('keeps only the variables it knows', () => {
    expect(Object.keys(loadConfig({ API_URL, HOME: '/home/me', PATH: '/usr/bin' })).sort()).toEqual([
      'API_URL',
      'CACHE',
      'LOG_LEVEL',
      'PORT',
    ]);
  });

  test.each([
    ['a missing API_URL', {}, /API_URL/],
    ['an http API_URL', { API_URL: 'http://api.books.dev' }, /API_URL/],
    ['a PORT that is not a number', { API_URL, PORT: 'eighty' }, /PORT/],
    ['an unknown LOG_LEVEL', { API_URL, LOG_LEVEL: 'verbose' }, /LOG_LEVEL/],
    ['a CACHE that is not a boolean', { API_URL, CACHE: 'maybe' }, /CACHE/],
  ])('refuses %s', (_label, env, message) => {
    expect(() => loadConfig(env)).toThrow(message);
  });

  test('names every variable that is wrong, not just the first', () => {
    expect(() => loadConfig({ PORT: 'eighty' })).toThrow(/PORT[\s\S]*API_URL|API_URL[\s\S]*PORT/);
  });

  test('throws a ConfigError', () => {
    expect(() => loadConfig({})).toThrow(ConfigError);
  });
});
