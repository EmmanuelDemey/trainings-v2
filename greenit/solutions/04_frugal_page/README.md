# TP 4 — Audit and fix a web page: the solution

> The ReBoot home page from grade E to grade A — 9.9 MB to 18 kB — with every feature kept.

## The audit

| # | Finding | Where | Before | Fix | After |
|---|---|---|---|---|---|
| 1 | Banner: a 1920 px PNG | `.hero` | 2,251 kB | AVIF/WebP 800/1200 px, `<picture>`, `srcset` + `sizes`, `width`/`height` | ≈ 2 kB |
| 2 | Product photos: 1000 px PNGs shown at ≈ 240 px, all loaded at once | catalogue, 6 images | ≈ 7,500 kB | AVIF/WebP 240/480 px, `srcset` + `sizes`, `loading="lazy"`, `width`/`height` | ≈ 6 kB |
| 3 | `vendor/everything.js` loaded for one function, `formatPrice` | `<head>` | 205 kB, blocking | `Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })` | 0 |
| 4 | The stock fetched **every second** | `script.js` | 60 requests a minute per open tab | fetched once per visit | 1 request |
| 5 | 400 reviews built in the DOM, hidden | `#reviews` | ≈ 2,800 elements | built on click, 20 of them | 0 until asked |
| 6 | Wrapper `<div>`s around every card | catalogue | 6 levels per card | the `<li>` alone | fewer elements |

## The measure

| | Before | After |
|---|---|---|
| EcoIndex | 33.2 — **E** | 90.9 — **A** |
| DOM | 2,918 elements | 82 |
| Requests | 16 (+ 1 a second) | 12 |
| Size | 9,908 kB | 18 kB |
| GHG per view | 2.34 gCO₂e | 1.18 gCO₂e |

The EcoIndex counts the DOM three times as much as the size: the reviews
(finding 5) cost as many points as the pictures, for a few kilobytes. The
pictures are what the **device and the network** suffer from; the Network
panel shows it, the score less so.

## The fixes, in the code

The pictures — `index.html`:

```html
<picture>
  <source type="image/avif" srcset="images/hero-800.avif 800w, images/hero-1200.avif 1200w" sizes="(min-width: 72rem) 70rem, 100vw" />
  <img src="images/hero-1200.webp" srcset="images/hero-800.webp 800w, images/hero-1200.webp 1200w"
       sizes="(min-width: 72rem) 70rem, 100vw" width="1200" height="600" alt="" class="hero-image" fetchpriority="high" />
</picture>
```

The banner is the first thing seen: **not** lazy, `fetchpriority="high"`. The
product photos are lazy: below the fold on a phone.

The price — `script.js`, no library:

```js
const price = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });
price.format(product.priceCents / 100); // "329,00 €"
```

The stock — once:

```js
fetch('stock.json').then((response) => response.json()).then(({ available }) => { … });
```

The reviews — on demand, in the click handler.

## Checking

```bash
pnpm run verify --tp 04
```
