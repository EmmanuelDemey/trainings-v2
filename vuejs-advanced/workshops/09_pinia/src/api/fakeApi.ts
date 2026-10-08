/**
 * Generates a large catalog on demand, so the cost of deep reactivity is
 * actually measurable in the browser.
 */

export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  /** Deliberately nested: `reactive()` has to walk all of this. */
  details: {
    sku: string;
    dimensions: { width: number; height: number; depth: number };
    tags: string[];
  };
}

const NAMES = [
  'Espresso machine', 'Cast-iron pan', 'Chef knife', 'Stand mixer', 'Kettle',
  'Blender', 'Toaster', 'Rice cooker', 'Waffle iron', 'Food processor',
];
const CATEGORIES = ['Coffee', 'Cookware', 'Small appliances'];

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function makeProducts(count: number): Product[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `${NAMES[i % NAMES.length]} #${i + 1}`,
    category: CATEGORIES[i % CATEGORIES.length]!,
    price: 19 + ((i * 13) % 480),
    stock: (i * 7) % 40,
    details: {
      sku: `SKU-${String(i + 1).padStart(6, '0')}`,
      dimensions: { width: 10 + (i % 30), height: 10 + (i % 20), depth: 5 + (i % 15) },
      tags: ['kitchen', CATEGORIES[i % CATEGORIES.length]!.toLowerCase(), `batch-${i % 12}`],
    },
  }));
}

/** Flip to `true` from the console to exercise the error path of `fetchProducts`. */
export const failureSwitch = { products: false };

export async function fetchProducts(count: number): Promise<Product[]> {
  await delay(500);
  if (failureSwitch.products) throw new Error('Catalog service unavailable');
  return makeProducts(count);
}
