// A shopping cart, decorated. Given: the decorators are yours to write, in
// src/decorators.ts.
import './polyfill.ts';
import { command, jsonString, logged, memoize, min } from './decorators.ts';

export const auditLog: string[] = [];

export interface Line {
  sku: string;
  price: number;
  quantity: number;
}

@jsonString
export class Cart {
  lines: Line[] = [];

  @min(0) accessor discount = 0;

  @command('add')
  @logged((line) => auditLog.push(line))
  add(sku: string, price: number, quantity = 1): number {
    this.lines.push({ sku, price, quantity });
    return this.lines.length;
  }

  @command('total')
  total(): number {
    const gross = this.lines.reduce((sum, line) => sum + line.price * line.quantity, 0);
    return Math.max(0, gross - this.discount);
  }

  @memoize
  shippingTo(country: string): number {
    shippingQuotes.count += 1;
    return country === 'FR' ? 5 : 15;
  }
}

/** How many times a shipping quote was really computed. */
export const shippingQuotes = { count: 0 };
