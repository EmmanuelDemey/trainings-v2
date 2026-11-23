// Writes the pictures of the ReBoot shop, the app of workshops 4 and 5.
//
//   pnpm run generate-assets
//
// They are committed: run it again only to change them. The starter of
// workshop 4 gets what a CMS upload usually is — full-size PNGs, a camera's
// grain included — and a vendor bundle loaded "just in case" — next to what
// they should be: resized pictures, in AVIF and WebP, for the learner to use.
// Its solution and workshop 5 get only the light ones.
import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));

export const PRODUCTS = [
  { slug: 'pixel-7', hue: 205 },
  { slug: 'galaxy-s21', hue: 260 },
  { slug: 'iphone-12', hue: 340 },
  { slug: 'fairphone-4', hue: 140 },
  { slug: 'xperia-10', hue: 25 },
  { slug: 'moto-g84', hue: 180 },
];

const hsl = (h, s, l) => `hsl(${h} ${s}% ${l}%)`;

/** A phone on a gradient, as SVG: the drawing every picture starts from. */
function phoneSvg(width, height, hue) {
  const w = Math.round(height * 0.32);
  const h = Math.round(height * 0.64);
  const x = Math.round((width - w) / 2);
  const y = Math.round((height - h) / 2);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
  <defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="${hsl(hue, 60, 88)}"/><stop offset="1" stop-color="${hsl(hue, 55, 62)}"/>
  </linearGradient></defs>
  <rect width="100%" height="100%" fill="url(#bg)"/>
  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${w * 0.12}" fill="#1d1f24"/>
  <rect x="${x + w * 0.06}" y="${y + w * 0.06}" width="${w * 0.88}" height="${h - w * 0.12}" rx="${w * 0.08}" fill="${hsl(hue, 70, 45)}"/>
  <circle cx="${x + w / 2}" cy="${y + w * 0.14}" r="${w * 0.03}" fill="#1d1f24"/>
</svg>`;
}

/** Random grain, the way a photo carries it: what makes a PNG this heavy. */
function grain(width, height, amount) {
  const pixels = Buffer.alloc(width * height * 3);
  let seed = 42;
  for (let i = 0; i < pixels.length; i++) {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    pixels[i] = 128 + ((seed >> 16) % amount) - amount / 2;
  }
  return sharp(pixels, { raw: { width, height, channels: 3 } }).png().toBuffer();
}

async function picture(width, height, hue) {
  return sharp(Buffer.from(phoneSvg(width, height, hue)))
    .composite([{ input: await grain(width, height, 6), blend: 'overlay' }])
    .toBuffer();
}

async function write(base, dir, name, width, sizes) {
  await mkdir(dir, { recursive: true });
  if (!sizes) {
    await sharp(base).resize(width).png().toFile(join(dir, `${name}.png`));
    return;
  }
  for (const size of sizes) {
    await sharp(base).resize(size).avif({ quality: 50 }).toFile(join(dir, `${name}-${size}.avif`));
    await sharp(base).resize(size).webp({ quality: 70 }).toFile(join(dir, `${name}-${size}.webp`));
  }
}

const heavy = [join(root, 'workshops/04_frugal_page/images')];
const light = ['workshops/04_frugal_page', 'solutions/04_frugal_page', 'workshops/05_budget', 'solutions/05_budget'].map((dir) => join(root, dir, 'images'));

const hero = await picture(1920, 960, 205);
for (const dir of heavy) await write(hero, dir, "hero", 1920);
// Workshop 5: a colleague's promo banner, uploaded as is.
const promo = await picture(1920, 960, 25);
await write(promo, join(root, 'workshops/05_budget/images'), 'promo', 1920);
for (const dir of ['workshops/05_budget', 'solutions/05_budget']) await write(promo, join(root, dir, 'images'), 'promo', 1200, [800, 1200]);
for (const dir of light) await write(hero, dir, 'hero', 1200, [800, 1200]);

for (const { slug, hue } of PRODUCTS) {
  const image = await picture(1000, 1000, hue);
  for (const dir of heavy) await write(image, dir, slug, 1000);
  for (const dir of light) await write(image, dir, slug, 480, [240, 480]);
}
/**
 * A stand-in for the libraries a page ships "just in case": ~250 kB of code,
 * random enough that gzip cannot hide it. The page uses one function of it.
 */
function vendorBundle() {
  let seed = 7;
  const word = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return 'abcdefghijklmnopqrstuvwxyz'[seed % 26] + (seed % 100003).toString(36);
  };
  const lines = ['/* everything.js — a date library, a carousel, an animation engine, analytics, polyfills… */', 'window.Everything = {};'];
  for (let i = 0; i < 2600; i++) {
    lines.push(`Everything.${word()} = function (${word()}, ${word()}) { return ${word()}(${word()}) + "${word()}${word()}"; };`);
  }
  lines.push(
    'Everything.formatPrice = function (cents) {',
    "  return (cents / 100).toFixed(2).replace('.', ',') + ' €';",
    '};',
  );
  return lines.join('\n') + '\n';
}
await mkdir(join(root, 'workshops/04_frugal_page/vendor'), { recursive: true });
await writeFile(join(root, 'workshops/04_frugal_page/vendor/everything.js'), vendorBundle());

console.log('Pictures and vendor bundle written.');
