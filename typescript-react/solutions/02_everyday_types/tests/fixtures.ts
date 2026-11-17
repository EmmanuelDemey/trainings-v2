import type { Product } from '../src/cart.ts';

export const milk: Product = { id: 'milk', name: 'Milk', price: 129, tags: ['dairy'] };
export const coffee: Product = { id: 'coffee', name: 'Coffee beans', price: 1250, tags: ['hot', 'bio'], discount: 20 };
export const tea: Product = { id: 'tea', name: 'Green tea', price: 499, tags: [] };

export const catalog: readonly Product[] = [milk, coffee, tea];
