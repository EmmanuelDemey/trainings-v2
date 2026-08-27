// Exports a Slidev deck to PDF, from the deck that was already built.
//
//   node scripts/deck-pdf.mjs --deck vuejs_advanced.md \
//     --dist ../build/slides/vuejs-advanced --base /slides/vuejs-advanced/ \
//     --out ../build/downloads/vuejs-advanced-slides.pdf
//
// Why not `slidev export` — it drives a Vite *dev* server, where every slide is
// a separate dynamic import over HTTP and the print view pulls in the whole deck
// at once. On a large deck that defeats both of its modes:
//
//   --per-slide   repeats that whole-deck load once per slide; Chromium gives up
//                 around the 20th with net::ERR_INSUFFICIENT_RESOURCES.
//   (default)     one navigation, but the viewport it sets is one slide tall per
//                 slide — 560 slides ask Chromium to print a 604800px page and
//                 `Page.printToPDF` answers "Printing failed". Capping that
//                 viewport with `--range` does produce a PDF, but on 560 slides
//                 554 of its pages read "An error occurred on this slide": the
//                 dev server cannot serve that many modules to one page.
//
// The built deck has neither problem — it is bundled, so a slide is a couple of
// requests. So: serve build/slides/<deck>/ ourselves, walk the deck one slide per
// navigation (~300ms each), and merge the one-page PDFs. That is what
// `--per-slide` does, without the dev server that makes it fail.
//
// The JavaScript deck (110 slides) also exports fine through `slidev export`
// without `--per-slide`. This path is used for both, so that adding slides to a
// deck cannot quietly push it over the edge.

import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { stat, mkdir, writeFile } from 'node:fs/promises';
import { dirname, extname, join, normalize, resolve } from 'node:path';
import { load } from '@slidev/parser/fs';
import { chromium } from 'playwright-chromium';
import { PDFDocument } from 'pdf-lib';

const args = process.argv.slice(2);
const flag = (name) => {
  const index = args.indexOf(`--${name}`);
  return index === -1 ? undefined : args[index + 1];
};

const deck = flag('deck');
const distDir = resolve(flag('dist') ?? '');
const base = flag('base') ?? '/';
const outFile = resolve(flag('out') ?? 'deck.pdf');
const executablePath = flag('executable-path') || process.env.SLIDEV_CHROME || undefined;

if (!deck || !flag('dist')) {
  console.error('✖ --deck and --dist are required');
  process.exit(1);
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
};

/** Serves the built deck under `base`, falling back to index.html (SPA routes). */
function serve() {
  const server = createServer(async (request, response) => {
    const path = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    const relative = path.startsWith(base) ? path.slice(base.length) : path.replace(/^\//, '');
    // normalize() first: a `..` in the URL must not escape the deck folder.
    const candidate = join(distDir, normalize(`/${relative}`));
    const file = await stat(candidate).then(
      (info) => (info.isFile() ? candidate : join(distDir, 'index.html')),
      () => join(distDir, 'index.html'),
    );
    response.writeHead(200, { 'Content-Type': MIME[extname(file)] ?? 'application/octet-stream' });
    createReadStream(file).pipe(response);
  });
  return new Promise((ready) => {
    server.listen(0, '127.0.0.1', () => ready({ server, port: server.address().port }));
  });
}

/** The deck's own slide size, from the `@page` rule its print CSS ships. */
async function slideSize(page) {
  const size = await page.evaluate(() =>
    [...document.styleSheets]
      .flatMap((sheet) => {
        try {
          return [...sheet.cssRules];
        } catch {
          return []; // a cross-origin sheet, which the deck does not have
        }
      })
      .map((rule) => rule.cssText.match(/@page\s*{[^}]*size:\s*(\d+)px\s+(\d+)px/))
      .find(Boolean)
      ?.slice(1, 3)
      .map(Number),
  );
  return size ?? [980, 552];
}

const { slides } = await load(process.cwd(), deck);
const total = slides.length;

await mkdir(dirname(outFile), { recursive: true });

const { server, port } = await serve();
const browser = await chromium.launch({ executablePath });
try {
  const page = await browser.newPage({ viewport: { width: 980, height: 552 } });
  const merged = await PDFDocument.create();
  let width = 980;
  let height = 552;

  for (let no = 1; no <= total; no++) {
    await page.goto(`http://127.0.0.1:${port}${base}${no}?print=true`, {
      waitUntil: 'load',
      timeout: 120000,
    });
    const slide = page.locator(`[data-slidev-no="${no}"]`);
    await slide.waitFor({ state: 'visible', timeout: 120000 });

    // A slide whose components failed to load renders this instead of itself.
    // Shipping a deck full of them is worse than shipping no PDF at all.
    if ((await slide.innerText()).includes('An error occurred on this slide')) {
      throw new Error(`slide ${no} of ${deck} failed to render`);
    }

    if (no === 1) {
      [width, height] = await slideSize(page);
      await page.setViewportSize({ width, height });
    }

    const part = await PDFDocument.load(
      await page.pdf({
        width: `${width}px`,
        height: `${height}px`,
        margin: { top: 0, bottom: 0, left: 0, right: 0 },
        // The slide is one page; anything after it would be overflow.
        pageRanges: '1',
        printBackground: true,
        preferCSSPageSize: true,
      }),
    );
    for (const copied of await merged.copyPages(part, part.getPageIndices())) {
      merged.addPage(copied);
    }

    if (no % 50 === 0 || no === total) {
      console.log(`  ${deck}: ${no}/${total} slides`);
    }
  }

  await writeFile(outFile, await merged.save());
  console.log(`✔ ${deck}: ${total} slides → ${outFile}`);
} finally {
  await browser.close();
  server.close();
}
