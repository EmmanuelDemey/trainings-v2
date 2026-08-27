// Renders the workshops of one training into a single printable PDF handbook.
//
//   node scripts/workshops-pdf.mjs \
//     --source chapters/javascript/tp \
//     --title "JavaScript" \
//     --out ../build/downloads/javascript-workshops.pdf
//
// The source of truth stays the READMEs the learners work from; this only
// concatenates them — a cover, a table of contents, then one workshop per page.
//
// It lives in training/ (and not in the repo-root scripts/) so that `marked` and
// `playwright-chromium` resolve from training/node_modules, where they already
// are for the Slidev export.

import { readdir, readFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { marked } from 'marked';
import { chromium } from 'playwright-chromium';

const args = process.argv.slice(2);
const flag = (name) => {
  const index = args.indexOf(`--${name}`);
  return index === -1 ? undefined : args[index + 1];
};

const sourceDir = resolve(flag('source') ?? '');
const title = flag('title') ?? 'Workshops';
const outFile = resolve(flag('out') ?? 'workshops.pdf');
const executablePath = flag('executable-path') || process.env.SLIDEV_CHROME || undefined;

if (!existsSync(sourceDir)) {
  console.error(`✖ ${sourceDir} not found`);
  process.exit(1);
}

const escape = (text) =>
  text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

/** `01_introduction` -> `tp-01-introduction`, the anchor the contents links to. */
const anchorOf = (folder) => `tp-${folder.replaceAll('_', '-').toLowerCase()}`;

/** Strips the leading `# Heading`, which becomes the workshop's own title. */
function split(markdown, fallbackTitle) {
  const lines = markdown.split('\n');
  const headingIndex = lines.findIndex((line) => line.startsWith('# '));
  if (headingIndex === -1 || headingIndex > 4) {
    return { heading: fallbackTitle, body: markdown };
  }
  return {
    heading: lines[headingIndex].slice(2).trim(),
    body: lines.slice(headingIndex + 1).join('\n').replace(/^\n+/, ''),
  };
}

marked.setOptions({ gfm: true, breaks: false, mangle: false, headerIds: false });

const folders = (await readdir(sourceDir, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory() && /^\d/.test(entry.name))
  .map((entry) => entry.name)
  .sort();

const workshops = [];
for (const folder of folders) {
  const readme = join(sourceDir, folder, 'README.md');
  if (!existsSync(readme)) {
    console.warn(`⚠ ${folder} has no README.md — skipped`);
    continue;
  }
  const { heading, body } = split(await readFile(readme, 'utf8'), folder);
  workshops.push({ folder, heading, html: marked.parse(body), anchor: anchorOf(folder) });
}

if (workshops.length === 0) {
  console.error(`✖ no workshop README found under ${sourceDir}`);
  process.exit(1);
}

// The tp/README.md is the introduction of the handbook, minus its own index
// table — the table of contents right below replaces it.
const overviewPath = join(sourceDir, 'README.md');
const overview = existsSync(overviewPath)
  ? split(await readFile(overviewPath, 'utf8'), title).body
  : '';

const contents = workshops
  .map(
    (workshop, position) =>
      `<li><a href="#${workshop.anchor}"><span class="n">${position + 1}</span>` +
      `<span class="t">${escape(workshop.heading)}</span>` +
      `<code>${escape(workshop.folder)}</code></a></li>`,
  )
  .join('\n');

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${escape(title)} — workshops</title>
<style>
  :root { color-scheme: light; }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font: 10.5pt/1.55 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    color: #1b1b1f;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  h1, h2, h3, h4 { line-height: 1.25; break-after: avoid; margin: 1.4em 0 0.5em; }
  h1 { font-size: 19pt; }
  h2 { font-size: 13pt; border-bottom: 1px solid #e3e3e8; padding-bottom: 0.25em; }
  h3 { font-size: 11.5pt; }
  p, ul, ol, table, pre, blockquote { break-inside: avoid; }
  ul, ol { padding-left: 1.4em; }
  li { margin: 0.25em 0; }
  li > ul, li > ol { margin: 0.25em 0; }
  a { color: #1f5fbf; text-decoration: none; }
  code {
    font-family: ui-monospace, "SFMono-Regular", "Cascadia Code", Consolas, monospace;
    font-size: 0.88em;
    background: #f2f2f6;
    border-radius: 3px;
    padding: 0.1em 0.32em;
  }
  pre {
    background: #f7f7fa;
    border: 1px solid #e6e6ec;
    border-left: 3px solid #b9c4d4;
    border-radius: 4px;
    padding: 0.7em 0.9em;
    overflow-wrap: anywhere;
    white-space: pre-wrap;
  }
  pre code { background: none; padding: 0; font-size: 0.85em; }
  blockquote {
    margin: 1em 0;
    padding: 0.1em 1em;
    border-left: 3px solid #b9c4d4;
    color: #4a4a55;
    font-style: italic;
  }
  table { border-collapse: collapse; width: 100%; font-size: 0.92em; margin: 1em 0; }
  th, td { border: 1px solid #e0e0e6; padding: 0.4em 0.6em; text-align: left; vertical-align: top; }
  th { background: #f4f4f8; }
  hr { border: none; border-top: 1px solid #e3e3e8; margin: 1.6em 0; }

  .page { padding: 0 4mm; }
  .cover { break-after: page; padding-top: 55mm; text-align: center; }
  .cover .kicker { text-transform: uppercase; letter-spacing: 0.22em; font-size: 9pt; color: #6b6b78; }
  .cover h1 { font-size: 34pt; margin: 0.35em 0 0.15em; }
  .cover .sub { font-size: 12pt; color: #4a4a55; }
  .cover .meta { margin-top: 14mm; font-size: 9.5pt; color: #6b6b78; }

  .toc { break-after: page; }
  .toc ol { list-style: none; padding: 0; }
  .toc a { display: flex; gap: 0.7em; align-items: baseline; padding: 0.42em 0; border-bottom: 1px dotted #dedee4; color: inherit; }
  .toc .n { width: 1.6em; color: #8a8a96; font-variant-numeric: tabular-nums; }
  .toc .t { flex: 1; }
  .toc code { color: #6b6b78; background: none; }

  .intro h1 { font-size: 16pt; }
  .workshop { break-before: page; }
  .workshop > h1 { margin-top: 0; padding-bottom: 0.3em; border-bottom: 2px solid #1b1b1f; }
  .workshop > .folder {
    margin: 0.4em 0 1.4em;
    font-family: ui-monospace, Consolas, monospace;
    font-size: 9pt;
    color: #6b6b78;
  }
</style>
</head>
<body>
  <section class="cover">
    <div class="kicker">Hands-on workshops</div>
    <h1>${escape(title)}</h1>
    <div class="sub">Workshop handbook — ${workshops.length} autonomous workshops</div>
    <div class="meta">Emmanuel Demey</div>
  </section>

  <section class="page toc">
    <h1>Contents</h1>
    <ol>${contents}</ol>
  </section>

  ${overview ? `<section class="page intro"><h1>About these workshops</h1>${marked.parse(overview)}</section>` : ''}

  ${workshops
    .map(
      (workshop) => `<section class="page workshop" id="${workshop.anchor}">
    <h1>${escape(workshop.heading)}</h1>
    <p class="folder">${escape(workshop.folder)}/</p>
    ${workshop.html}
  </section>`,
    )
    .join('\n')}
</body>
</html>`;

await mkdir(dirname(outFile), { recursive: true });

const browser = await chromium.launch({ executablePath });
try {
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'load' });
  await page.emulateMedia({ media: 'print' });
  await page.pdf({
    path: outFile,
    format: 'A4',
    printBackground: true,
    margin: { top: '16mm', bottom: '18mm', left: '14mm', right: '14mm' },
    displayHeaderFooter: true,
    headerTemplate: '<div></div>',
    footerTemplate: `<div style="width:100%;padding:0 14mm;font:8pt system-ui,sans-serif;color:#8a8a96;display:flex;justify-content:space-between;">
        <span>${escape(title)} — workshops</span>
        <span><span class="pageNumber"></span> / <span class="totalPages"></span></span>
      </div>`,
  });
} finally {
  await browser.close();
}

console.log(`✔ ${title}: ${workshops.length} workshops → ${outFile}`);
