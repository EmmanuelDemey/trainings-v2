// Measures a page the way EcoIndex does, from the terminal.
//
//   pnpm run measure workshops/04_frugal_page            # its index.html
//   pnpm run measure workshops/04_frugal_page --top 5    # and its 5 heaviest files
//   pnpm run measure workshops/05_budget --budget workshops/05_budget/budget.json
//
// The folder is served over http:// and opened in Chromium, the cache
// disabled; the page is scrolled to the bottom, then left alone 3 seconds.
// Sizes are what the local server sends: uncompressed, as a server without gzip.
// With --budget, the run fails when the page goes over one of its limits.
//
// Needs a Chromium: `pnpm exec playwright install chromium`, or point PW_CHROME
// at an existing binary.
import { chromium } from 'playwright-chromium';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { checkBudget } from './budget.mjs';
import { measurePage, serve } from './lib/page.mjs';

const args = process.argv.slice(2);
const readArg = (name) => {
  const index = args.indexOf(name);
  return index === -1 ? undefined : args[index + 1];
};
const folder = args.find((arg, i) => !arg.startsWith('--') && !args[i - 1]?.startsWith('--'));
if (!folder || !existsSync(folder)) {
  console.error('Usage: pnpm run measure <folder> [--page index.html] [--top 5] [--budget budget.json]');
  process.exit(2);
}
const file = readArg('--page') ?? 'index.html';
const top = Number(readArg('--top') ?? 0);
const budgetFile = readArg('--budget');

const server = await serve(resolve(folder));
const browser = await chromium.launch(process.env.PW_CHROME ? { executablePath: process.env.PW_CHROME } : {});
const result = await measurePage(browser, `${server.origin}/${file}`);
await result.page.close();
await browser.close();
server.close();

console.log(`${folder}/${file}\n`);
console.log(`  EcoIndex     ${result.score} / 100   grade ${result.grade}`);
console.log(`  DOM          ${result.dom} elements`);
console.log(`  Requests     ${result.requests}`);
console.log(`  Size         ${result.sizeKb} kB`);
console.log(`  GHG          ${result.ghg} gCO2e per view`);
console.log(`  Water        ${result.water} cl per view`);
if (result.idleRequests.length > 0) {
  console.log(`\n  ! ${result.idleRequests.length} request(s) while the page was left alone: ${[...new Set(result.idleRequests.map((url) => new URL(url).pathname))].join(', ')}`);
}
if (result.errors.length > 0) console.log(`\n  ! JavaScript errors: ${result.errors.join(' | ')}`);
if (top > 0) {
  console.log(`\n  The ${top} heaviest files`);
  for (const { url, bytes } of [...result.resources].sort((a, b) => b.bytes - a.bytes).slice(0, top)) {
    console.log(`    ${String(Math.round(bytes / 1024)).padStart(6)} kB  ${new URL(url).pathname}`);
  }
}

if (budgetFile) {
  const { ok, lines } = checkBudget(result, JSON.parse(await readFile(budgetFile, 'utf8')));
  console.log(`\n  Budget ${budgetFile}`);
  for (const line of lines) console.log(`    ${line.ok ? 'OK' : 'KO'}  ${line.label}${line.ok ? '' : `  (${line.over})`}`);
  process.exit(ok ? 0 : 1);
}
