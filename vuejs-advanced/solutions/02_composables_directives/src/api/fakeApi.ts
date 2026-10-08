/**
 * In-memory fake API served through a real `fetch`-like interface, so `useFetch`
 * can be written exactly as it would be against a real backend.
 *
 * A Vite plugin is not needed: `installFakeBackend()` patches `window.fetch` for
 * the routes below and lets everything else through.
 */
import { reactive } from 'vue';

export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  photo: string;
}

const NAMES = [
  'Espresso machine', 'Cast-iron pan', 'Chef knife', 'Stand mixer', 'Kettle',
  'Blender', 'Toaster', 'Rice cooker', 'Waffle iron', 'Food processor',
  'Sous-vide stick', 'Pepper mill', 'Salad spinner', 'Mandoline', 'Wok',
  'Dutch oven', 'Grill pan', 'Milk frother', 'Coffee grinder', 'Pasta maker',
];
const CATEGORIES = ['Coffee', 'Cookware', 'Small appliances'];

/**
 * SVG data URLs, so the gallery works fully offline while still going through a
 * real image download decided by the browser.
 */
function photoFor(id: number): string {
  const hue = (id * 37) % 360;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300">
    <rect width="400" height="300" fill="hsl(${hue} 60% 65%)"/>
    <text x="200" y="160" font-size="48" text-anchor="middle" fill="white">#${id}</text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export const products: Product[] = Array.from({ length: 60 }, (_, i) => ({
  id: i + 1,
  name: `${NAMES[i % NAMES.length]} ${Math.floor(i / NAMES.length) + 1}`,
  category: CATEGORIES[i % CATEGORIES.length]!,
  price: 19 + ((i * 13) % 280),
  photo: photoFor(i + 1),
}));

/** Set to `true` from the console to exercise the error branch of `useFetch`. */
export const failureSwitch = { products: false };

/** Logs requests, so students can see aborted requests never resolve. */
export const requestLog = reactive<string[]>([]);

export function installFakeBackend(): void {
  const originalFetch = window.fetch.bind(window);

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;

    if (!url.startsWith('/api/')) return originalFetch(input, init);

    requestLog.push(url);

    // Artificial latency, abortable through the caller's AbortSignal.
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(resolve, 700);
      init?.signal?.addEventListener('abort', () => {
        clearTimeout(timer);
        reject(new DOMException('Aborted', 'AbortError'));
      });
    });

    if (url.startsWith('/api/products')) {
      if (failureSwitch.products) return new Response(null, { status: 500 });

      const query = new URL(url, window.location.origin).searchParams;
      const category = query.get('category');
      const body = category && category !== 'all'
        ? products.filter((p) => p.category === category)
        : products;

      return new Response(JSON.stringify(body), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(null, { status: 404 });
  };
}
