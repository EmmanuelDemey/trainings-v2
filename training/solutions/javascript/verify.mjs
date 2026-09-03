// Functional check of the JavaScript workshops.
//
//   pnpm run verify:javascript                                # the solutions
//   pnpm run verify:javascript --dir chapters/javascript/tp  # YOUR work
//   pnpm run verify:javascript --tp 08                       # one workshop
//
// Needs a Chromium: `pnpm exec playwright install chromium`, or point PW_CHROME
// at an existing binary (PW_CHROME=/path/to/chrome pnpm run verify:javascript).
import { chromium } from 'playwright-chromium';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { extname, join, resolve } from 'node:path';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const args = process.argv.slice(2);
const readArg = (name) => {
  const index = args.indexOf(name);
  return index === -1 ? undefined : args[index + 1];
};

const dir = readArg('--dir');
const only = readArg('--tp'); // '08', or any folder-name prefix
const base = dir
  ? pathToFileURL(resolve(process.cwd(), dir)).href.replace(/\/$/, '')
  : new URL('.', import.meta.url).href.replace(/\/$/, '');

console.log(`Verifying ${base}${only ? ` (workshop ${only} only)` : ''}\n`);

const browser = await chromium.launch(
  process.env.PW_CHROME ? { executablePath: process.env.PW_CHROME } : {},
);
let pass = 0, fail = 0;

const ok = (label, cond, extra = '') => {
  if (cond) { pass++; console.log('  OK  ' + label); }
  else { fail++; console.log('  KO  ' + label + (extra ? ' -> ' + extra : '')); }
};

const skip = (folder) => only !== undefined && !folder.startsWith(only);

async function open(folder, viewport) {
  const page = await browser.newPage(viewport ? { viewport } : {});
  const logs = [];
  page.on('console', (m) => logs.push(m.text()));
  page.on('pageerror', (e) => logs.push('PAGEERROR ' + e.message));
  await page.goto(`${base}/${folder}/index.html`);
  return { page, logs };
}

// --- the optional workshops ------------------------------------------------
// 12, 13 and 14 need a real origin: fetch, ES modules and localStorage are all
// refused on file://. They also only exist when their module is switched on
// (`pnpm run modules fetch on`) — off, the folder is named `_12_fetch`.
const rootDir = dir ? resolve(process.cwd(), dir) : fileURLToPath(new URL('.', import.meta.url));
const present = (folder) => existsSync(join(rootDir, folder));

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
};

let server;
let origin;

/** A one-file static server over the workshops, started on first use. */
async function httpOrigin() {
  if (origin) return origin;
  server = createServer(async (request, response) => {
    const path = join(rootDir, decodeURIComponent(new URL(request.url, 'http://x').pathname));
    try {
      const body = await readFile(path);
      response.writeHead(200, { 'Content-Type': MIME[extname(path)] ?? 'application/octet-stream' });
      response.end(body);
    } catch {
      response.writeHead(404, { 'Content-Type': 'text/plain' });
      response.end('not found');
    }
  });
  await new Promise((resolveListening) => server.listen(0, '127.0.0.1', resolveListening));
  origin = `http://127.0.0.1:${server.address().port}`;
  return origin;
}

/** Text of the first match, or '' — never waits, unlike page.textContent. */
const textOf = (page, selector) =>
  page.evaluate((s) => document.querySelector(s)?.textContent ?? '', selector);

async function openHttp(folder) {
  const page = await browser.newPage();
  const logs = [];
  page.on('console', (m) => logs.push(m.text()));
  page.on('pageerror', (e) => logs.push('PAGEERROR ' + e.message));
  await page.goto(`${await httpOrigin()}/${folder}/index.html`);
  return { page, logs };
}

// --- TP2 -------------------------------------------------------------------
// --- TP1 -------------------------------------------------------------------
if (!skip('01_introduction')) {
  console.log('TP1 introduction');
  const { page, logs } = await open('01_introduction');
  await page.waitForTimeout(200);
  ok('logs a greeting', logs.some((l) => /hello/i.test(l)));
  ok('logs the page title', logs.some((l) => l.includes('First steps')));
  ok('uses console.error', logs.some((l) => l.includes('error looks like')));
  await page.close();
}

if (!skip('02_mental_model')) {
  console.log('TP2 mental model');
  const { page, logs } = await open('02_mental_model');
  await page.waitForTimeout(200);
  ok('8/8 predictions', logs.some((l) => l.includes('8/8')), logs.join('|').slice(0, 200));
  ok('12/12 classified', logs.some((l) => l.includes('12/12')));
  await page.close();
}

// --- TP3 -------------------------------------------------------------------
if (!skip('03_syntax')) {
  console.log('TP3 syntax');
  const { page, logs } = await open('03_syntax');
  await page.waitForTimeout(200);
  ok('29/29 tests passing', logs.some((l) => l.includes('29/29')), logs.filter(l=>l.startsWith('❌')).join('|'));
  await page.close();
}

// --- TP4 -------------------------------------------------------------------
if (!skip('04_window')) {
  console.log('TP4 window');
  const { page } = await open('04_window', { width: 1000, height: 700 });
  ok('viewport shown', (await page.textContent('#viewport')).includes('1000 x'));
  ok('url shown', (await page.textContent('#url')).includes('index.html'));
  ok('language shown', (await page.textContent('#language')).length > 1);
  await page.waitForTimeout(2300);
  ok('delayed message fired', (await page.textContent('#delayed')).includes('2 seconds'));
  ok('cancelled timeout never fired', (await page.textContent('#cancelled')).includes('must never change'));
  const c = await page.textContent('#countdown');
  ok('countdown ticked', Number(c) < 10 && Number(c) > 5, c);
  await page.waitForTimeout(8200);
  ok('countdown reached Liftoff and stopped', (await page.textContent('#countdown')) === 'Liftoff!');
  await page.waitForTimeout(1200);
  ok('countdown stays at Liftoff (interval cleared)', (await page.textContent('#countdown')) === 'Liftoff!');
  await page.close();
}

// --- TP5 -------------------------------------------------------------------
if (!skip('05_dom')) {
  console.log('TP5 dom');
  const { page } = await open('05_dom');
  ok('title changed', (await page.textContent('h1')) === 'My store');
  ok('4 products rendered', (await page.locator('#products li').count()) === 4);
  ok('summary computed', (await page.textContent('#summary')).includes('4 product(s), total 46.00'), await page.textContent('#summary'));
  ok('panel hidden at start', await page.locator('#panel').isHidden());
  await page.click('#toggle');
  ok('panel shown after click', await page.locator('#panel').isVisible());
  await page.click('#products li:first-child button');
  ok('3 products left', (await page.locator('#products li').count()) === 3);
  ok('summary updated', (await page.textContent('#summary')).includes('3 product(s), total 34.00'), await page.textContent('#summary'));
  ok('link href set', (await page.getAttribute('#doc-link', 'href')) === 'https://developer.mozilla.org');
  await page.close();
}

// --- TP6 -------------------------------------------------------------------
if (!skip('06_events')) {
  console.log('TP6 events');
  const { page } = await open('06_events');
  ok('minus disabled at 0', await page.locator('#decrement').isDisabled());
  await page.click('#increment'); await page.click('#increment');
  ok('count = 2', (await page.textContent('#count')) === '2');
  ok('minus enabled', await page.locator('#decrement').isEnabled());
  await page.click('#decrement'); await page.click('#decrement');
  ok('back to 0 and disabled', (await page.textContent('#count')) === '0' && await page.locator('#decrement').isDisabled());
  await page.fill('#bio', 'hello');
  ok('char counter', (await page.textContent('#bio-counter')) === '5 / 100');
  await page.fill('#bio', 'x'.repeat(101));
  ok('counter error class', await page.locator('#bio-counter.error').count() === 1);
  const urlBefore = page.url();
  await page.click('#signup button[type=submit]');
  ok('no reload on invalid submit', page.url() === urlBefore);
  ok('name error', (await page.textContent('#name-error')) === 'Name is required');
  ok('email error', (await page.textContent('#email-error')) === 'Invalid email');
  await page.fill('#name', 'Ada'); await page.fill('#email', 'ada@x.io');
  await page.click('#signup button[type=submit]');
  ok('success message', (await page.textContent('#signup-success')).includes('Welcome Ada'));
  ok('form reset', (await page.inputValue('#name')) === '');
  await page.fill('#todo-input', 'buy milk');
  await page.click('#todo-form button[type=submit]');
  ok('1 task', (await page.locator('#todo-list li').count()) === 1);
  ok('input cleared', (await page.inputValue('#todo-input')) === '');
  await page.click('#todo-list li span');
  ok('task done class', (await page.locator('#todo-list li span.done').count()) === 1);
  await page.click('#todo-form button[type=submit]');
  ok('empty task refused', (await page.textContent('#todo-error')).includes('cannot be empty'));
  await page.fill('#todo-input', 'zzz');
  await page.keyboard.press('Escape');
  ok('Escape clears input', (await page.inputValue('#todo-input')) === '');
  await page.fill('#todo-input', 'second task');
  await page.click('#todo-form button[type=submit]');
  await page.click('#todo-list li:last-child button');
  ok('delegation works on a task added later', (await page.locator('#todo-list li').count()) === 1);
  await page.click('#todo-list li button');
  ok('task deleted', (await page.locator('#todo-list li').count()) === 0);
  await page.close();
}

// --- TP7 -------------------------------------------------------------------
if (!skip('07_responsive')) {
  console.log('TP7 responsive');
  const { page } = await open('07_responsive', { width: 500, height: 700 });
  ok('mobile mode', (await page.textContent('#mode')) === 'mobile');
  ok('body.mobile', await page.locator('body.mobile').count() === 1);
  ok('burger visible', await page.locator('#burger').isVisible());
  ok('menu hidden', await page.locator('#menu').isHidden());
  await page.click('#burger');
  ok('menu opened', await page.locator('#menu').isVisible());
  ok('aria-expanded true', (await page.getAttribute('#burger', 'aria-expanded')) === 'true');
  await page.setViewportSize({ width: 1000, height: 700 });
  await page.waitForTimeout(150);
  ok('desktop mode', (await page.textContent('#mode')) === 'desktop');
  await page.setViewportSize({ width: 500, height: 700 });
  await page.waitForTimeout(150);
  ok('menu did NOT reopen by itself', await page.locator('#menu').isHidden());
  ok('resize counter climbed', Number(await page.textContent('#resize-count')) >= 2);
  ok('media counter is small', Number(await page.textContent('#media-count')) === 2, await page.textContent('#media-count'));
  await page.close();
}

// --- TP8 -------------------------------------------------------------------
if (!skip('08_countdown')) {
  console.log('TP8 countdown');
  const { page } = await open('08_countdown');
  await page.fill('#duration', '3');
  await page.click('#start');
  await page.click('#start'); // double start must not speed it up
  ok('start disabled while running', await page.locator('#start').isDisabled());
  await page.waitForTimeout(2200);
  const t = await page.textContent('#display');
  ok('ticks one per second', t === '00:01', t);
  ok('danger class under 10s', await page.locator('#display.danger').count() === 1);
  await page.waitForTimeout(1500);
  ok("shows Time's up", (await page.textContent('#message')).includes("Time's up"));
  ok('display at 00:00', (await page.textContent('#display')) === '00:00');
  await page.waitForTimeout(1200);
  ok('does not go negative', (await page.textContent('#display')) === '00:00');
  await page.fill('#duration', '0');
  await page.click('#start');
  ok('refuses 0', (await page.textContent('#form-error')).includes('greater than 0'));
  await page.fill('#duration', '30');
  await page.click('#start');
  await page.waitForTimeout(1100);
  await page.click('#pause');
  const paused = await page.textContent('#display');
  await page.waitForTimeout(1200);
  ok('pause freezes the clock', (await page.textContent('#display')) === paused, paused);
  await page.click('#pause');
  await page.waitForTimeout(1100);
  ok('resume restarts it', (await page.textContent('#display')) !== paused);
  await page.click('#reset');
  ok('reset', (await page.textContent('#display')) === '00:00' && (await page.textContent('#message')) === '');
  await page.close();
}

// --- TP9 -------------------------------------------------------------------
if (!skip('09_password_generator')) {
  console.log('TP9 password');
  const { page } = await open('09_password_generator');
  await page.click('#generate');
  const p1 = await page.textContent('#password');
  ok('length 16', p1.length === 16, p1);
  ok('copy enabled', await page.locator('#copy').isEnabled());
  await page.click('#generate');
  ok('two draws differ', (await page.textContent('#password')) !== p1);
  ok('entropy shown', (await page.textContent('#entropy')).includes('bits'));
  // only digits
  await page.uncheck('#lowercase'); await page.uncheck('#uppercase'); await page.uncheck('#symbols');
  await page.check('#digits');
  await page.click('#generate');
  ok('digits only', /^\d{16}$/.test(await page.textContent('#password')), await page.textContent('#password'));
  // all classes guaranteed, 20 draws at length 8
  await page.check('#lowercase'); await page.check('#uppercase'); await page.check('#symbols');
  await page.fill('#length', '8');
  let allGood = true;
  for (let i = 0; i < 20; i++) {
    await page.click('#generate');
    const p = await page.textContent('#password');
    if (!(/[a-z]/.test(p) && /[A-Z]/.test(p) && /\d/.test(p) && /[^a-zA-Z0-9]/.test(p) && p.length === 8)) { allGood = false; break; }
  }
  ok('20 draws all contain every selected class', allGood);
  await page.uncheck('#lowercase'); await page.uncheck('#uppercase'); await page.uncheck('#symbols'); await page.uncheck('#digits');
  await page.click('#generate');
  ok('refuses empty alphabet', (await page.textContent('#options-error')).includes('at least one'));
  await page.close();
}

// --- TP10 ------------------------------------------------------------------
if (!skip('10_staff_directory')) {
  console.log('TP10 directory');
  const { page } = await open('10_staff_directory');
  ok('12 cards', (await page.locator('.card').count()) === 12);
  ok('sorted by name, Ada first', (await page.textContent('.card:first-child h3')) === 'Ada Lovelace');
  await page.fill('#search', 'dev');
  ok('filters on role', (await page.locator('.card').count()) === 4, String(await page.locator('.card').count()));
  await page.selectOption('#sort', 'role');
  ok('search survives the sort', (await page.locator('.card').count()) === 4);
  await page.fill('#search', 'zzz');
  ok('empty state', (await page.textContent('#empty')).includes('No result'));
  ok('no card', (await page.locator('.card').count()) === 0);
  await page.click('#reset');
  ok('reset restores 12', (await page.locator('.card').count()) === 12);
  ok('reset clears the field', (await page.inputValue('#search')) === '');
  // accent collation
  await page.fill('#search', 'e');
  const names = await page.locator('.card h3').allTextContents();
  ok('Élodie sorted next to Emma, not last', names.indexOf('Élodie Martin') < names.indexOf('Zoé Bernard'), names.join(','));
  await page.close();
}

// --- TP11 ------------------------------------------------------------------
if (!skip('11_social_network')) {
  console.log('TP11 social');
  const { page } = await open('11_social_network');
  ok('empty feed message', (await page.textContent('#empty-feed')).includes('Nothing here yet'));
  ok('publish disabled when empty', await page.locator('#publish').isDisabled());
  await page.fill('#author', 'Ada');
  await page.fill('#text', 'first message');
  ok('counter', (await page.textContent('#counter')) === '13 / 280');
  await page.click('#publish');
  await page.fill('#text', 'second message');
  await page.click('#publish');
  ok('2 messages', (await page.locator('.message').count()) === 2);
  ok('newest first', (await page.textContent('.message:first-child .text')) === 'second message');
  ok('author kept', (await page.inputValue('#author')) === 'Ada');
  ok('text cleared', (await page.inputValue('#text')) === '');
  ok('initials', (await page.textContent('.message:first-child .avatar')) === 'A');
  await page.click('.message:nth-child(2) .actions button:first-child');
  await page.click('.message:nth-child(2) .actions button:first-child');
  ok('likes only on the liked message', (await page.textContent('.message:nth-child(2) .actions button:first-child')).includes('2'));
  ok('other message untouched', (await page.textContent('.message:first-child .actions button:first-child')).includes('0'));
  await page.click('.message:first-child .actions button:last-child');
  ok('deleted the right one', (await page.locator('.message').count()) === 1 && (await page.textContent('.message .text')) === 'first message');
  ok('like count survived the re-render', (await page.textContent('.message .actions button:first-child')).includes('2'));
  const xss = '<img src=x onerror="window.__pwned=1">';
  await page.fill('#text', xss);
  await page.click('#publish');
  ok('XSS payload displayed as text', (await page.textContent('.message:first-child .text')) === xss);
  ok('no script executed', (await page.evaluate(() => window.__pwned)) === undefined);
  await page.fill('#text', 'x'.repeat(281));
  ok('publish disabled past 280', await page.locator('#publish').isDisabled());
  await page.fill('#text', '');
  await page.close();
}

// --- TP12 (optional module: fetch) -----------------------------------------
if (!skip('12_fetch') && present('12_fetch')) {
  console.log('TP12 fetch');
  const { page, logs } = await openHttp('12_fetch');
  await page.waitForTimeout(600);
  ok('4 products rendered', (await page.locator('#products li').count()) === 4);
  ok('prices formatted', /12[.,]00/.test(await textOf(page, '#products li:first-child')));
  ok('summary totals', (await textOf(page, '#summary')).includes('46'), await textOf(page, '#summary'));
  ok('loading hidden once done', await page.locator('#loading').isHidden());
  ok('no error on the happy path', await page.locator('#error').isHidden());
  ok('the first request was logged', logs.some((l) => /Response|status/i.test(l)));
  await page.click('#load-missing');
  await page.waitForTimeout(400);
  ok('a missing file shows a readable error', (await textOf(page, '#error')).length > 3, await textOf(page, '#error'));
  ok('the error is visible in the page', await page.locator('#error').isVisible());
  await page.click('#reload');
  await page.waitForTimeout(400);
  ok('reloading clears the error', await page.locator('#error').isHidden());
  ok('and brings the products back', (await page.locator('#products li').count()) === 4);
  await page.fill('#search', 'mug');
  await page.waitForTimeout(500);
  ok('search filters the list', (await page.locator('#products li').count()) === 1, String(await page.locator('#products li').count()));
  await page.close();
}

// --- TP13 (optional module: ES modules) ------------------------------------
if (!skip('13_es_modules') && present('13_es_modules')) {
  console.log('TP13 es modules');
  const { page } = await openHttp('13_es_modules');
  await page.waitForTimeout(300);
  const loaded = () => page.evaluate(() =>
    performance.getEntriesByType('resource').map((entry) => entry.name));
  const files = await loaded();
  ok('format.js is imported', files.some((n) => n.endsWith('/format.js')), files.join(','));
  ok('store.js is imported', files.some((n) => n.endsWith('/store.js')));
  ok('cart-item.js is imported', files.some((n) => n.endsWith('/cart-item.js')));
  ok('stats.js is not loaded yet', !files.some((n) => n.endsWith('/stats.js')));
  ok('nothing leaked into window', await page.evaluate(() => typeof window.plural === 'undefined'));
  ok('2 items rendered', (await page.locator('#items li').count()) === 2);
  ok('total formatted', /20[.,]50/.test(await textOf(page, '#total')), await textOf(page, '#total'));
  await page.fill('#name', 'Sticker');
  await page.fill('#price', '1.5');
  await page.click('#add-form button[type=submit]');
  ok('adding renders a third item', (await page.locator('#items li').count()) === 3);
  ok('total recomputed', /22[.,]00/.test(await textOf(page, '#total')), await textOf(page, '#total'));
  if ((await page.locator('#items li').count()) > 0) {
    await page.click('#items li:first-child button:last-child');
  }
  ok('removing works', (await page.locator('#items li').count()) === 2);
  await page.click('#stats');
  await page.waitForTimeout(300);
  ok('the dynamic import ran', (await textOf(page, '#stats-output')).includes('average'), await textOf(page, '#stats-output'));
  ok('stats.js was downloaded on the click', (await loaded()).some((n) => n.endsWith('/stats.js')));
  await page.close();
}

// --- TP14 (optional module: storage) ---------------------------------------
if (!skip('14_storage') && present('14_storage')) {
  console.log('TP14 storage');
  const { page } = await openHttp('14_storage');
  await page.fill('#task', 'buy milk');
  await page.click('#add-form button[type=submit]');
  ok('the task is rendered', (await page.locator('#todos li').count()) === 1);
  const stored = await page.evaluate(() => localStorage.getItem('trainings.todos.v1'));
  ok('it was written as JSON', /^\[.*"buy milk".*\]$/.test(stored ?? ''), String(stored));
  await page.fill('#draft', 'an unsent note');
  await page.waitForTimeout(100);
  await page.reload();
  await page.waitForTimeout(200);
  ok('it survived the reload', (await textOf(page, '#todos li span')) === 'buy milk');
  ok('the draft came back from sessionStorage', (await page.inputValue('#draft')) === 'an unsent note');
  if ((await page.locator('#todos li').count()) > 0) {
    await page.click('#todos li button:nth-child(2)');
  }
  await page.reload();
  await page.waitForTimeout(200);
  ok('the done flag is persisted too', await page.evaluate(() => {
    try {
      return JSON.parse(localStorage.getItem('trainings.todos.v1'))[0].done === true;
    } catch {
      return false;
    }
  }));
  await page.click('#clear');
  ok('clearing empties the list', (await page.locator('#todos li').count()) === 0);
  ok('and removes the key', await page.evaluate(() =>
    localStorage.getItem('trainings.todos.v1') === null));
  await page.reload();
  await page.waitForTimeout(200);
  ok('still empty after a reload', (await page.locator('#todos li').count()) === 0);
  await page.close();
}

await browser.close();
server?.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
