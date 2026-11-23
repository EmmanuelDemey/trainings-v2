// Functional check of the Green IT workshops — the CI runs it, so can you.
//
//   pnpm run verify                  # the solutions: every check must pass
//   pnpm run verify --dir workshops  # YOUR work (the starters fail, until done)
//   pnpm run verify --tp 04          # one workshop
//
// Each workshop folder is served over http:// and opened in a real Chromium,
// the cache disabled, the way EcoIndex measures a page: scrolled to the bottom,
// then left alone. Workshops 1, 2, 3 and 6 (a footprint, a self-assessment,
// an AI feature, a roadmap) have nothing to run.
//
// Needs a Chromium: `pnpm exec playwright install chromium`, or point PW_CHROME
// at an existing binary (PW_CHROME=/path/to/chrome pnpm run verify).
import { chromium } from 'playwright-chromium';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkBudget } from './budget.mjs';
import { measurePage, serve } from './lib/page.mjs';

const args = process.argv.slice(2);
const readArg = (name) => {
  const index = args.indexOf(name);
  return index === -1 ? undefined : args[index + 1];
};

const dir = readArg('--dir');
const only = readArg('--tp'); // '04', or any folder-name prefix
const rootDir = dir ? resolve(process.cwd(), dir) : fileURLToPath(new URL('../solutions/', import.meta.url));

console.log(`Verifying ${rootDir}${only ? ` (workshop ${only} only)` : ''}\n`);

const server = await serve(rootDir);
const browser = await chromium.launch(process.env.PW_CHROME ? { executablePath: process.env.PW_CHROME } : {});
let pass = 0;
let fail = 0;

const ok = (label, cond, extra = '') => {
  if (cond) {
    pass++;
    console.log('  OK  ' + label);
  } else {
    fail++;
    console.log('  KO  ' + label + (extra ? ' -> ' + extra : ''));
  }
};

const skip = (folder) => (only !== undefined && !folder.startsWith(only)) || !existsSync(join(rootDir, folder));
const kb = (bytes) => `${Math.round(bytes / 1024)} kB`;
const path = (url) => new URL(url).pathname;

/** Workshop 4: the ReBoot home page, frugal — and still doing its job. */
async function checkFrugalPage(folder) {
  const measure = await measurePage(browser, `${server.origin}/${folder}/index.html`);
  const { page, resources } = measure;

  ok(`EcoIndex grade A (score > 80)`, measure.grade === 'A', `${measure.grade} (${measure.score})`);
  ok(`the page weighs less than 300 kB`, measure.sizeKb < 300, `${measure.sizeKb} kB`);
  ok(`at most 15 requests`, measure.requests <= 15, String(measure.requests));
  ok(`fewer than 400 DOM elements`, measure.dom < 400, String(measure.dom));

  const heaviest = [...resources].sort((a, b) => b.bytes - a.bytes)[0];
  ok(`no file over 50 kB`, !heaviest || heaviest.bytes < 50 * 1024, heaviest && `${path(heaviest.url)} ${kb(heaviest.bytes)}`);
  const vendor = resources.filter((resource) => /everything/.test(resource.url));
  ok(`vendor/everything.js is not loaded`, vendor.length === 0);
  ok(`nothing is fetched while the page is left alone`, measure.idleRequests.length === 0, [...new Set(measure.idleRequests.map(path))].join(', '));

  const images = await page.locator('img').evaluateAll((elements) =>
    elements.map((image) => ({
      src: image.currentSrc || image.src,
      width: image.getAttribute('width'),
      height: image.getAttribute('height'),
      loading: image.getAttribute('loading'),
      natural: image.naturalWidth,
      shown: image.getBoundingClientRect().width,
    })),
  );
  ok(`no PNG picture left`, images.every((image) => !/\.png$/.test(image.src)), images.filter((image) => /\.png$/.test(image.src)).map((image) => path(image.src)).join(', '));
  ok(`every <img> declares its width and height (no layout shift)`, images.every((image) => image.width && image.height));
  const oversized = images.filter((image) => image.shown > 0 && image.natural > 2.5 * image.shown);
  ok(`no picture more than 2.5× wider than it is displayed`, oversized.length === 0, oversized.map((image) => `${path(image.src)} ${image.natural}px for ${Math.round(image.shown)}px`).join(', '));
  const products = images.filter((image) => !/hero|promo/.test(image.src));
  ok(`the product pictures are lazy-loaded`, products.length > 0 && products.every((image) => image.loading === 'lazy'));

  ok(`the 6 phones are listed, with their name`, (await page.getByRole('heading', { level: 3 }).count()) === 6);
  const price = await page.getByText(/^329,00\s€$/).count();
  ok(`their price is still formatted: "329,00 €"`, price === 1);
  ok(`the stock is shown`, await page.getByText(/^42 phones in stock$/).isVisible());
  ok(`the reviews are not in the DOM before anyone asks for them`, (await page.locator('#reviews li').count()) === 0, String(await page.locator('#reviews li').count()));
  await page.getByRole('button', { name: /show the reviews/i }).click();
  ok(`"Show the reviews" shows some`, (await page.locator('#reviews li').count()) > 0 && (await page.locator('#reviews').isVisible()));
  ok(`no JavaScript error`, measure.errors.length === 0, measure.errors.join(' | '));
  await page.close();
}

/** Workshop 5: a budget, a CI job that enforces it — and the page within it. */
async function checkBudgetWorkshop(folder) {
  const budgetFile = join(rootDir, folder, 'budget.json');
  ok(`budget.json exists`, existsSync(budgetFile));
  let budget = {};
  try {
    budget = existsSync(budgetFile) ? JSON.parse(await readFile(budgetFile, 'utf8')) : {};
  } catch (error) {
    ok(`budget.json is valid JSON`, false, error.message);
  }
  ok(`it limits the size, the requests and the DOM`, ['maxSizeKb', 'maxRequests', 'maxDom'].every((key) => key in budget), Object.keys(budget).join(', '));
  ok(`its size limit is no more than 500 kB`, budget.maxSizeKb > 0 && budget.maxSizeKb <= 500, String(budget.maxSizeKb));

  const workflow = join(rootDir, folder, '.github/workflows/greenit-budget.yml');
  const yaml = existsSync(workflow) ? await readFile(workflow, 'utf8') : '';
  ok(`a CI workflow, .github/workflows/greenit-budget.yml`, yaml !== '');
  ok(`it runs on pull requests`, /pull_request/.test(yaml));
  ok(`it measures the page against budget.json`, /measure/.test(yaml) && /--budget\s+\S*budget\.json/.test(yaml));

  const measure = await measurePage(browser, `${server.origin}/${folder}/index.html`);
  await measure.page.close();
  if (Object.keys(budget).length > 0) {
    try {
      const { ok: within, lines } = checkBudget(measure, budget);
      ok(`the page is within its budget`, within, lines.filter((line) => !line.ok).map((line) => `${line.label} (${line.over})`).join(', '));
    } catch (error) {
      ok(`the budget is readable by scripts/budget.mjs`, false, error.message);
    }
  }
}

// --- The workshops -----------------------------------------------------------
// Workshop 5 starts from the solution of workshop 4: its check replays it, so
// the new promo banner must not undo what was done there.
const WORKSHOPS = [
  ['04_frugal_page', [checkFrugalPage]],
  ['05_budget', [checkFrugalPage, checkBudgetWorkshop]],
];

for (const [folder, checks] of WORKSHOPS) {
  if (skip(folder)) continue;
  console.log(`Workshop ${folder}`);
  for (const check of checks) await check(folder);
}

await browser.close();
server.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 && pass > 0 ? 0 : 1);
