import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Price } from '../src/Price.tsx';

describe('Price', () => {
  test('renders euros by default', () => {
    render(<Price cents={1250} />);
    expect(screen.getByText('12.50 €')).toBeDefined();
  });

  test('renders dollars and pounds', () => {
    render(
      <>
        <Price cents={1250} currency="USD" />
        <Price cents={5} currency="GBP" />
      </>,
    );
    expect(screen.getByText('$12.50')).toBeDefined();
    expect(screen.getByText('£0.05')).toBeDefined();
  });
});
