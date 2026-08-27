// Turns the workshop READMEs into Starlight pages.
//
// The source of truth stays where the learners work — training/chapters/*/tp/.
// This script copies each README.md into src/content/docs/<training>/, adding the
// frontmatter Starlight needs (title, description, sidebar order, edit link).
//
// Generated pages are NOT committed: run `npm run sync` (or `npm run dev` /
// `npm run build`, which both run it first).

import { readdir, readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { TRAININGS, REPO_URL, BRANCH } from '../../scripts/trainings.mjs';

const siteRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = resolve(siteRoot, '..');
const outRoot = join(siteRoot, 'src/content/docs');

/** `01_introduction` -> `01-introduction` */
const toSlug = (name) => name.replaceAll('_', '-').toLowerCase();

/** `01_introduction` -> 1, so the sidebar keeps the workshop order. */
const orderOf = (name) => {
  const match = name.match(/^(\d+)/);
  return match ? Number(match[1]) : 999;
};

/**
 * Splits a README into the frontmatter we need and the body Starlight renders.
 * - the leading `# Heading` becomes the page title (Starlight renders its own h1,
 *   keeping this one would show it twice)
 * - the blockquote right below it becomes the description, and stays in the body
 */
function parse(markdown, fallbackTitle) {
  const lines = markdown.split('\n');
  let title = fallbackTitle;
  let start = 0;

  const headingIndex = lines.findIndex((line) => line.startsWith('# '));
  if (headingIndex !== -1 && headingIndex < 5) {
    title = lines[headingIndex].slice(2).trim();
    start = headingIndex + 1;
  }

  const body = lines.slice(start).join('\n').replace(/^\n+/, '');

  // First blockquote or first paragraph, flattened into a one-line description.
  const description = (body.match(/^>[^\n]*(?:\n>[^\n]*)*/m)?.[0] ?? body.split('\n\n')[0] ?? '')
    .replaceAll(/^>\s?/gm, '')
    .replaceAll(/[*`_]/g, '')
    .replaceAll(/\s+/g, ' ')
    .trim();

  return { title, description: truncate(description, 155), body };
}

/** Cuts on a word boundary — a description sliced mid-word reads as a bug. */
function truncate(text, max) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  return `${cut.slice(0, cut.lastIndexOf(' '))}…`;
}

/** `TP 3 — Functions and arrays` -> `3. Functions and arrays`, for the sidebar. */
function shortLabel(title) {
  const match = title.match(/^TP\s*(\d+)\s*[—–-]\s*(.+)$/);
  return match ? `${Number(match[1])}. ${match[2]}` : title;

}

const yaml = (value) => JSON.stringify(value); // valid YAML double-quoted scalar

function page({ title, description, order, label, sourcePath, body, note }) {
  return `---
title: ${yaml(title)}
description: ${yaml(description)}
sidebar:
  order: ${order}
  label: ${yaml(label)}
editUrl: ${yaml(`${REPO_URL}/edit/${BRANCH}/${sourcePath}`)}
---

${note}

${body}
`;
}

let written = 0;

for (const training of TRAININGS) {
  const sourceDir = join(repoRoot, training.workshops);
  if (!existsSync(sourceDir)) {
    console.warn(`⚠ ${training.workshops} not found — skipped`);
    continue;
  }

  const outDir = join(outRoot, training.slug);
  await rm(outDir, { recursive: true, force: true });
  await mkdir(outDir, { recursive: true });

  // 1. The overview page, from the tp/README.md of the training.
  const overviewPath = join(sourceDir, 'README.md');
  if (existsSync(overviewPath)) {
    const raw = await readFile(overviewPath, 'utf8');
    const { title, description, body } = parse(raw, `${training.label} workshops`);
    await writeFile(
      join(outDir, 'index.md'),
      page({
        title,
        description,
        order: 0,
        label: 'Overview',
        sourcePath: `${training.workshops}/README.md`,
        body,
        note: [
          ':::note[Where the code lives]',
          `The workshops themselves are in \`${training.workshops}/\` —`,
          `[browse them on GitHub](${REPO_URL}/tree/${BRANCH}/${training.workshops}).`,
          'This site only publishes the instructions.',
          ':::',
          '',
          `**Slides:** [the ${training.label} deck](/slides/${training.slug}/) is served next to this site.`,
        ].join('\n'),
      }),
    );
    written++;
  }

  // 2. One page per workshop folder.
  const entries = await readdir(sourceDir, { withFileTypes: true });
  const folders = entries
    .filter((entry) => entry.isDirectory() && /^\d/.test(entry.name))
    .map((entry) => entry.name)
    .sort();

  for (const folder of folders) {
    const readmePath = join(sourceDir, folder, 'README.md');
    if (!existsSync(readmePath)) {
      console.warn(`⚠ ${training.workshops}/${folder} has no README.md — skipped`);
      continue;
    }

    const raw = await readFile(readmePath, 'utf8');
    const { title, description, body } = parse(raw, folder);
    const sourcePath = `${training.workshops}/${folder}`;

    await writeFile(
      join(outDir, `${toSlug(folder)}.md`),
      page({
        title,
        description,
        order: orderOf(folder),
        label: shortLabel(title),
        sourcePath: `${sourcePath}/README.md`,
        body,
        note: [
          ':::note[Where to work]',
          `Open \`${sourcePath}/\` —`,
          `[browse the folder on GitHub](${REPO_URL}/tree/${BRANCH}/${sourcePath}).`,
          ':::',
        ].join('\n'),
      }),
    );
    written++;
  }

  console.log(`✔ ${training.label}: ${folders.length} workshops`);
}

console.log(`${written} pages written to src/content/docs/`);
