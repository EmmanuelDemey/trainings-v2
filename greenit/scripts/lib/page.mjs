// What scripts/measure.mjs and scripts/verify.mjs share: a static server over a
// folder, and the measure of a page the way EcoIndex takes it.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { ecoIndex } from '../ecoindex.mjs';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.woff2': 'font/woff2',
};

/** Serves `rootDir` over http://127.0.0.1:<random port>. Resolves to { origin, close }. */
export async function serve(rootDir) {
  const server = createServer(async (request, response) => {
    const path = join(rootDir, decodeURIComponent(new URL(request.url, 'http://x').pathname));
    try {
      const body = await readFile(path.endsWith('/') ? join(path, 'index.html') : path);
      response.writeHead(200, { 'Content-Type': MIME[extname(path)] ?? 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      response.end(body);
    } catch {
      response.writeHead(404, { 'Content-Type': 'text/plain' });
      response.end('not found');
    }
  });
  await new Promise((listening) => server.listen(0, '127.0.0.1', listening));
  return { origin: `http://127.0.0.1:${server.address().port}`, close: () => server.close() };
}

/**
 * Opens `url` in a fresh page, scrolls to the bottom as EcoIndex does, waits
 * `idleMs`, and measures it. Resolves to
 * { dom, requests, sizeKb, score, grade, ghg, water, resources, idleRequests, errors, page }.
 * `idleRequests` are the requests sent during the wait: a page at rest sends none.
 * The caller closes `page`.
 */
export async function measurePage(browser, url, { idleMs = 3000 } = {}) {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));

  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
  const urls = new Map();
  const resources = [];
  cdp.on('Network.requestWillBeSent', ({ requestId, request }) => urls.set(requestId, request.url));
  cdp.on('Network.loadingFinished', ({ requestId, encodedDataLength }) =>
    resources.push({ url: urls.get(requestId), bytes: encodedDataLength, at: Date.now() }),
  );

  await page.goto(url, { waitUntil: 'load' });
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(500);
  const settled = Date.now();
  await page.waitForTimeout(idleMs);

  const dom = await page.evaluate(
    () => [...document.getElementsByTagName('*')].filter((element) => !element.closest('svg') || element.tagName === 'svg').length,
  );
  const sizeKb = resources.reduce((total, resource) => total + resource.bytes, 0) / 1024;
  const requests = resources.length;
  return {
    dom,
    requests,
    sizeKb: Math.round(sizeKb * 10) / 10,
    ...ecoIndex({ dom, requests, sizeKb }),
    resources,
    idleRequests: resources.filter((resource) => resource.at > settled).map((resource) => resource.url),
    errors,
    page,
  };
}
