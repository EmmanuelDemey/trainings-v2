import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import { orderId, userId } from '../src/brand.ts';
import { Field } from '../src/Field.tsx';
import { get } from '../src/get.ts';
import { UserLink } from '../src/UserLink.tsx';
import { ada } from './fixtures.ts';

describe('userId', () => {
  test('accepts a user id', () => {
    expect(userId('u_ada')).toBe('u_ada');
  });

  test('refuses anything else', () => {
    expect(() => userId('o_42')).toThrow('Not a user id: o_42');
  });
});

describe('orderId', () => {
  test('accepts an order id', () => {
    expect(orderId('o_42')).toBe('o_42');
  });

  test('refuses anything else', () => {
    expect(() => orderId('u_ada')).toThrow('Not an order id: u_ada');
  });
});

describe('UserLink', () => {
  test('links to the page of the user', () => {
    render(<UserLink id={userId('u_ada')}>Ada</UserLink>);
    expect(screen.getByRole('link', { name: 'Ada' }).getAttribute('href')).toBe('/users/u_ada');
  });
});

describe('get', () => {
  test('reads a top-level key', () => {
    expect(get(ada, 'name')).toBe('Ada');
  });

  test('reads a nested key', () => {
    expect(get(ada, 'address.geo.lat')).toBe(51.5);
  });
});

describe('Field', () => {
  test('renders the value at its path', () => {
    render(<Field values={ada} name="address.city" />);
    expect(screen.getByRole('status').textContent).toBe('London');
  });
});
