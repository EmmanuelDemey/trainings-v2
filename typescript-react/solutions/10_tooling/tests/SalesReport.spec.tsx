import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SalesReport } from '../src/SalesReport.tsx';
import { sales } from './fixtures.ts';

describe('SalesReport', () => {
  test('prints the total in the currency it is given', () => {
    render(<SalesReport sales={sales} currency="GBP" />);
    expect(screen.getByText('Total: 65.00 GBP')).toBeDefined();
  });

  test('keeps the default currency when none is given', () => {
    render(<SalesReport sales={sales} />);
    expect(screen.getByText('Total: 65.00 EUR')).toBeDefined();
  });
});
