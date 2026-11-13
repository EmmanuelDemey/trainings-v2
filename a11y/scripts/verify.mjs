// Functional check of the accessibility workshops — the CI runs it, so can you.
//
//   pnpm run verify                  # the solutions: every check must pass
//   pnpm run verify --dir workshops  # YOUR work (the starters fail, until done)
//   pnpm run verify --tp 05          # one workshop
//
// Each workshop folder is served over http:// and driven by a real Chromium,
// the way a keyboard or a screen reader user meets it: elements are found by
// their ROLE and ACCESSIBLE NAME, never by a CSS class. Workshop 8 also runs
// axe-core, the engine behind Lighthouse and axe DevTools.
//
// Needs a Chromium: `pnpm exec playwright install chromium`, or point PW_CHROME
// at an existing binary (PW_CHROME=/path/to/chrome pnpm run verify).
import { chromium } from 'playwright-chromium';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2);
const readArg = (name) => {
  const index = args.indexOf(name);
  return index === -1 ? undefined : args[index + 1];
};

const dir = readArg('--dir');
const only = readArg('--tp'); // '05', or any folder-name prefix
const rootDir = dir ? resolve(process.cwd(), dir) : fileURLToPath(new URL('../solutions/', import.meta.url));
const axeSource = createRequire(import.meta.url).resolve('axe-core/axe.min.js');

console.log(`Verifying ${rootDir}${only ? ` (workshop ${only} only)` : ''}\n`);

// --- A static server over the workshops -------------------------------------
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
};
const server = createServer(async (request, response) => {
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
await new Promise((listening) => server.listen(0, '127.0.0.1', listening));
const origin = `http://127.0.0.1:${server.address().port}`;

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

async function open(folder, file = 'index.html') {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(`${origin}/${folder}/${file}`);
  return { page, errors };
}

/** Never throws, never waits: whether the locator matches a visible element. */
const visible = (locator) => locator.first().isVisible().catch(() => false);
const count = (locator) => locator.count().catch(() => 0);
const attr = (locator, name) => locator.first().getAttribute(name, { timeout: 500 }).catch(() => null);
const isFocused = (locator) => locator.first().evaluate((element) => element === document.activeElement, null, { timeout: 500 }).catch(() => false);
const focusInside = (page, selector) => page.evaluate((s) => document.activeElement.closest(s) !== null, selector);

/** What has the focus, as a short description, for the KO messages. */
const focused = (page) =>
  page.evaluate(() => {
    const element = document.activeElement;
    if (!element || element === document.body) return 'nothing (body)';
    return `<${element.tagName.toLowerCase()}> "${(element.textContent ?? '').trim().slice(0, 40)}"`;
  });

/** The outline drawn on the element that has the focus. */
const focusOutline = (page) =>
  page.evaluate(() => {
    const style = getComputedStyle(document.activeElement);
    return { style: style.outlineStyle, width: parseFloat(style.outlineWidth) };
  });

/** A focus indicator of our own: neither none nor the browser's `auto` ring. */
const ownOutline = ({ style, width }) => style !== 'none' && style !== 'auto' && width >= 2;

/** The axe-core violations of the page, as `rule-id (n)` strings. */
async function axeViolations(page) {
  await page.addScriptTag({ path: axeSource });
  const { violations } = await page.evaluate(() => window.axe.run(document));
  return violations.map((violation) => `${violation.id} (${violation.nodes.length})`);
}

// --- Checks shared by several workshops --------------------------------------

/** Workshop 3: a skip link first in the tab order, and a visible focus. */
async function checkFocus(folder) {
  for (const file of ['index.html', 'create.html']) {
    const { page } = await open(folder, file);
    await page.keyboard.press('Tab');
    const first = await page.evaluate(() => {
      const element = document.activeElement;
      return { tag: element.tagName, href: element.getAttribute('href'), text: element.textContent.trim() };
    });
    const isSkipLink = first.tag === 'A' && first.href === '#main';
    ok(`${file}: the first Tab lands on a link to #main`, isSkipLink, await focused(page));
    ok(`${file}: the skip link says where it goes`, isSkipLink && /skip|main content/i.test(first.text), first.text);
    if (isSkipLink) {
      const box = await page.evaluate(() => document.activeElement.getBoundingClientRect().toJSON());
      ok(`${file}: the focused skip link is on screen`, box.top >= 0 && box.height > 0, JSON.stringify(box));
      await page.evaluate(() => document.activeElement.blur());
      const hidden = await page.evaluate(() => {
        const box = document.querySelector('a[href="#main"]').getBoundingClientRect();
        return box.bottom <= 0 || box.right <= 0 || box.width <= 1;
      });
      ok(`${file}: the skip link is out of sight without the focus`, hidden);
      await page.reload();
      await page.keyboard.press('Tab');
      await page.keyboard.press('Enter');
      ok(`${file}: activating it moves the focus to <main>`, await focusInside(page, 'main'), await focused(page));
    }
    await page.close();
  }

  const { page } = await open(folder);
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  const outline = await focusOutline(page);
  ok('a link focused from the keyboard shows our own outline (≥ 2px, not the browser default)', ownOutline(outline), `${await focused(page)} ${JSON.stringify(outline)}`);
  await page.close();
}

/** Workshop 4: landmarks, a current page, and a real data table. */
async function checkSemantics(folder) {
  for (const [file, current] of [
    ['index.html', 'Home'],
    ['create.html', 'Add a person'],
  ]) {
    const { page } = await open(folder, file);
    const nav = page.getByRole('navigation', { name: /main/i });
    ok(`${file}: a navigation landmark named "Main …"`, await visible(nav));
    ok(`${file}: its links are list items`, (await count(nav.getByRole('listitem'))) === 2, String(await count(nav.getByRole('listitem'))));
    const currentLinks = await page.locator('a[aria-current="page"]').allTextContents().catch(() => []);
    ok(`${file}: "${current}" is marked aria-current="page", and only it`, currentLinks.length === 1 && currentLinks[0].trim() === current, currentLinks.join('|'));
    const currentWeight = await page
      .locator('nav a[aria-current="page"]')
      .first()
      .evaluate((link) => getComputedStyle(link).fontWeight, null, { timeout: 500 })
      .catch(() => '400');
    ok(`${file}: the current page is visibly marked too (bold)`, Number(currentWeight) >= 600, currentWeight);
    await page.close();
  }

  const { page } = await open(folder);
  const table = page.getByRole('table', { name: /people/i });
  ok('a table, named by its <caption>', (await visible(table)) && (await count(page.locator('table > caption'))) === 1);
  ok('its column headers have scope="col"', (await count(table.locator('thead th[scope="col"]'))) >= 3, String(await count(table.locator('thead th[scope="col"]'))));
  ok('5 rows of data', (await count(table.locator('tbody tr'))) === 5, String(await count(table.locator('tbody tr'))));
  ok('the cells are cells: "Dupont" is one', await visible(table.getByRole('cell', { name: 'Dupont' })));
  const dates = await table
    .locator('tbody time')
    .evaluateAll((times) => times.map((time) => time.getAttribute('datetime')))
    .catch(() => []);
  ok('birth dates are <time datetime="YYYY-MM-DD">', dates.length === 5 && dates.every((date) => /^\d{4}-\d{2}-\d{2}$/.test(date ?? '')), dates.join(','));
  ok('no grid of <div>s left', (await count(page.locator('.people .row'))) === 0);
  await page.close();
}

/** Workshop 5: labelled fields, grouped, and errors a screen reader announces. */
async function checkForm(folder, { nativeRadios = true } = {}) {
  const { page, errors } = await open(folder, 'create.html');
  const lastName = page.getByLabel(/^last name/i);
  const firstName = page.getByLabel(/^first name/i);
  const submit = page.getByRole('button', { name: /^add/i });
  const hasFields = (await count(lastName)) === 1 && (await count(firstName)) === 1;
  ok('"Last name" and "First name" are labelled fields', hasFields);
  ok('they are required', hasFields && (await attr(lastName, 'required')) !== null && (await attr(firstName, 'required')) !== null);
  ok('they declare their autocomplete purpose', (await attr(lastName, 'autocomplete')) === 'family-name' && (await attr(firstName, 'autocomplete')) === 'given-name');
  ok('a labelled birth date field, type="date"', (await attr(page.getByLabel(/^birth date/i), 'type')) === 'date');
  ok('the identity fields are grouped: fieldset "Identity"', await visible(page.getByRole('group', { name: /identity/i })));
  ok('the parents fields are grouped: fieldset "Parents"', await visible(page.getByRole('group', { name: /parents/i })));
  if (nativeRadios) {
    ok('"Sex" is a group of 2 labelled radios', (await count(page.getByRole('group', { name: /sex/i }).getByRole('radio'))) === 2);
  }
  ok('the submit button is a real button: "Add the person"', (await count(submit)) === 1);

  if (hasFields && (await count(submit)) === 1) {
    await submit.click();
    await page.waitForTimeout(100);
    ok('an empty submit does not leave the page', page.url().endsWith('create.html'), page.url());
    ok('Last name is aria-invalid="true"', (await attr(lastName, 'aria-invalid')) === 'true');
    ok('First name is aria-invalid="true"', (await attr(firstName, 'aria-invalid')) === 'true');
    const description = await lastName.evaluate((input) =>
      (input.getAttribute('aria-describedby') ?? '')
        .split(/\s+/)
        .filter(Boolean)
        .map((id) => document.getElementById(id)?.textContent ?? '')
        .join(' '),
    );
    ok('its error message is tied to it with aria-describedby', /required/i.test(description), description);
    const summary = page.getByRole('alert');
    ok('an error summary, role="alert"', await visible(summary));
    const summaryLinks = await summary
      .getByRole('link')
      .evaluateAll((links) => links.map((link) => link.getAttribute('href')))
      .catch(() => []);
    ok('it links to each field in error', summaryLinks.includes('#last-name') && summaryLinks.includes('#first-name'), summaryLinks.join(','));
    ok('the focus is on the first field in error', await isFocused(lastName), await focused(page));
    const border = await lastName.evaluate((input) => getComputedStyle(input).borderTopWidth);
    ok('a field in error has a thicker border, not just another colour', parseFloat(border) >= 2, border);

    await lastName.fill('Lovelace');
    await submit.click();
    await page.waitForTimeout(100);
    ok('a fixed field loses aria-invalid', (await attr(lastName, 'aria-invalid')) !== 'true');
    ok('the summary only lists what is left', (await count(page.getByRole('alert').getByRole('link'))) === 1);

    await firstName.fill('Ada');
    await submit.click();
    await page.waitForTimeout(100);
    ok('a valid submit removes the summary', (await count(page.getByRole('alert'))) === 0);
    const status = await page.getByRole('status').first().textContent({ timeout: 500 }).catch(() => '');
    ok('and announces the success in a role="status" region', /ada lovelace/i.test(status ?? ''), status ?? '');
  }
  ok('no error in the page', errors.length === 0, errors.join('|'));
  await page.close();
}

/** Workshop 6: a custom radio group, keyboard-operable like a native one. */
async function checkRadioGroup(folder) {
  const { page, errors } = await open(folder, 'create.html');
  const group = page.locator('[role="radiogroup"]');
  const radios = group.locator('[role="radio"]');
  ok('a role="radiogroup"', (await count(group)) === 1);
  ok('named "Sex" through aria-labelledby', (await count(page.getByRole('radiogroup', { name: /sex/i }))) === 1 && (await attr(group, 'aria-labelledby')) !== null);
  ok('2 role="radio", none of them a native <input>', (await count(radios)) === 2 && (await count(page.locator('input[type="radio"]'))) === 0);

  if ((await count(radios)) === 2) {
    const state = async () =>
      (
        await radios.evaluateAll((elements) =>
          elements.map((element) => `${element.getAttribute('aria-checked')}/${element.getAttribute('tabindex')}`),
        )
      ).join(' ');
    ok('at start: nothing checked, the first one alone in the tab order', (await state()) === 'false/0 false/-1', await state());

    // From the field right after the group: a date input holds several tab stops.
    await page.getByLabel(/^parent 1 last name/i).focus();
    await page.keyboard.press('Shift+Tab');
    ok('Shift+Tab into the group lands on its one tab stop', await isFocused(radios.nth(0)), await focused(page));
    await page.keyboard.press(' ');
    ok('Space checks the focused radio', (await state()) === 'true/0 false/-1', await state());
    await page.keyboard.press('ArrowDown');
    ok('ArrowDown moves the check AND the tab stop to the next radio', (await state()) === 'false/-1 true/0', await state());
    ok('the focus followed', await isFocused(radios.nth(1)), await focused(page));
    await page.keyboard.press('ArrowRight');
    ok('ArrowRight on the last one wraps to the first', (await state()) === 'true/0 false/-1', await state());
    await page.keyboard.press('ArrowUp');
    ok('ArrowUp on the first one wraps to the last', (await state()) === 'false/-1 true/0', await state());
    await page.keyboard.press('ArrowLeft');
    ok('ArrowLeft goes back', (await state()) === 'true/0 false/-1', await state());
    await page.keyboard.press('Tab');
    ok('Tab leaves the group: one tab stop for the whole group', !(await focusInside(page, '[role="radiogroup"]')), await focused(page));
    await radios.nth(1).click();
    ok('a click checks too', (await state()) === 'false/-1 true/0', await state());
  }
  ok('no error in the page', errors.length === 0, errors.join('|'));
  await page.close();
}

/** Workshop 7: the details dialog — focus in, focus trapped, focus back. */
async function checkDialog(folder) {
  const { page, errors } = await open(folder);
  const trigger = page.getByRole('button', { name: /^view details.*marie martin/i });
  const dialog = page.getByRole('dialog');
  ok('each row has a button named "View details …<name>"', (await count(page.getByRole('button', { name: /^view details/i }))) === 5 && (await count(trigger)) === 1);
  ok('no dialog shown at start', !(await visible(dialog)));

  if ((await count(trigger)) === 1) {
    await trigger.focus();
    await page.keyboard.press('Enter');
    await page.waitForTimeout(100);
    ok('Enter on the button opens a dialog', await visible(dialog));
    ok('aria-modal="true"', (await attr(dialog, 'aria-modal')) === 'true');
    const name = await page.evaluate(() => {
      const labelledBy = document.querySelector('[role="dialog"]')?.getAttribute('aria-labelledby');
      return labelledBy ? (document.getElementById(labelledBy)?.textContent ?? '') : '';
    });
    ok('named by its heading (aria-labelledby), which names the person', /marie martin/i.test(name), name);
    const details = (await dialog.first().textContent({ timeout: 500 }).catch(() => '')) ?? '';
    ok('it shows the details of that person', /Martin/.test(details) && /1975-03-22/.test(details), details.trim().slice(0, 80));
    ok('the focus moved into the dialog', await focusInside(page, '[role="dialog"]'), await focused(page));
    // Two ways out: the ✕ in the corner and the button at the bottom. The ✕ is
    // a glyph, not a name — axe does not see that, a screen reader user does.
    ok('both close buttons, the ✕ included, are named "Close"', (await count(dialog.getByRole('button', { name: /^close$/i }))) === 2, String(await count(dialog.getByRole('button', { name: /^close$/i }))));

    let trapped = true;
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      trapped &&= await focusInside(page, '[role="dialog"]');
    }
    ok('Tab cycles inside the dialog', trapped, await focused(page));
    trapped = true;
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Shift+Tab');
      trapped &&= await focusInside(page, '[role="dialog"]');
    }
    ok('Shift+Tab too', trapped, await focused(page));
    ok('the page behind is inert while it is open', await page.evaluate(() => document.querySelector('main').closest('[inert]') !== null && document.querySelector('header').closest('[inert]') !== null));

    await page.keyboard.press('Escape');
    await page.waitForTimeout(100);
    ok('Escape closes it', !(await visible(dialog)));
    ok('the focus is back on the button that opened it', await isFocused(trigger), await focused(page));
    ok('the page is no longer inert', await page.evaluate(() => document.querySelector('[inert]') === null));

    await trigger.click();
    await page.waitForTimeout(100);
    await dialog.getByRole('button', { name: /^close$/i }).first().click({ timeout: 500 }).catch(() => {});
    await page.waitForTimeout(100);
    ok('the Close button closes it', !(await visible(dialog)));

    await trigger.click();
    await page.waitForTimeout(100);
    await page.mouse.click(5, 5);
    await page.waitForTimeout(100);
    ok('a click on the overlay closes it', !(await visible(dialog)));
  }
  ok('no error in the page', errors.length === 0, errors.join('|'));
  await page.close();
}

/** Workshop 8: axe-core finds nothing, in every state of the app. */
async function checkAxe(folder) {
  for (const file of ['index.html', 'create.html']) {
    const { page } = await open(folder, file);
    const violations = await axeViolations(page);
    ok(`${file}: no axe violation`, violations.length === 0, violations.join(', '));
    await page.close();
  }
  {
    const { page } = await open(folder, 'create.html');
    await page.getByRole('button', { name: /^add/i }).click({ timeout: 500 }).catch(() => {});
    await page.waitForTimeout(100);
    const violations = await axeViolations(page);
    ok('create.html, form in error: no axe violation', violations.length === 0, violations.join(', '));
    await page.close();
  }
  {
    const { page } = await open(folder);
    await page.getByRole('button', { name: /^view details/i }).first().click({ timeout: 500 }).catch(() => {});
    await page.waitForTimeout(100);
    const violations = await axeViolations(page);
    ok('index.html, dialog open: no axe violation', violations.length === 0, violations.join(', '));
    await page.close();
  }
}

/** Workshop 9: every row of the table is a schema.org Person. */
async function checkMicrodata(folder) {
  const { page } = await open(folder);
  const people = await page.evaluate(() =>
    [...document.querySelectorAll('[itemscope][itemtype="https://schema.org/Person"]')].map((scope) => {
      const prop = (name) => {
        const element = scope.querySelector(`[itemprop="${name}"]`);
        return element?.getAttribute('datetime') ?? element?.textContent.trim() ?? null;
      };
      return { tag: scope.tagName, familyName: prop('familyName'), givenName: prop('givenName'), birthDate: prop('birthDate') };
    }),
  );
  ok('5 itemscope itemtype="https://schema.org/Person"', people.length === 5, String(people.length));
  ok('each one is a row of the table', people.length > 0 && people.every((person) => person.tag === 'TR'));
  const dupont = people.find((person) => person.familyName === 'Dupont');
  ok('familyName, givenName and birthDate on Dupont', dupont?.givenName === 'Jean' && dupont?.birthDate === '1980-05-15', JSON.stringify(dupont));
  ok('every Person has all three', people.length > 0 && people.every((person) => person.familyName && person.givenName && /^\d{4}-\d{2}-\d{2}$/.test(person.birthDate ?? '')));
  await page.close();
}

// --- The workshops -----------------------------------------------------------
// Each one starts from the solution of the previous one. Its check replays the
// checks of the workshops before it: nothing done earlier gets broken.
// Workshops 1 and 2 (a screen reader, a manual audit) have nothing to run.
const form = (folder) => checkForm(folder, { nativeRadios: false });
const WORKSHOPS = [
  ['03_focus', [checkFocus]],
  ['04_semantic_html', [checkFocus, checkSemantics]],
  ['05_forms', [checkFocus, checkSemantics, checkForm]],
  ['06_aria_radio', [checkFocus, checkSemantics, form, checkRadioGroup]],
  ['07_modal', [checkFocus, checkSemantics, form, checkRadioGroup, checkDialog]],
  ['08_automated_audit', [checkFocus, checkDialog, checkAxe]],
  ['09_microdata', [checkSemantics, checkDialog, checkAxe, checkMicrodata]],
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
