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
import { quizFor } from '../../scripts/quizzes/index.mjs';
import { renderQuizForm, renderAnswersBody } from './quiz-render.mjs';

const siteRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = resolve(siteRoot, '..');
const outRoot = join(siteRoot, 'src/content/docs');
// scripts/build-all.mjs fills this before building the site, so the Resources
// pages can only offer links to files that were actually produced.
const downloadsDir = join(repoRoot, 'build/downloads');
const downloadable = (file) => existsSync(join(downloadsDir, file));

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

  // 1. One page per workshop. The meta is kept so that the overview can link to
  //    them without re-reading anything.
  const entries = await readdir(sourceDir, { withFileTypes: true });
  const folders = entries
    .filter((entry) => entry.isDirectory() && /^\d/.test(entry.name))
    .map((entry) => entry.name)
    .sort();

  const workshops = [];

  for (const folder of folders) {
    const readmePath = join(sourceDir, folder, 'README.md');
    if (!existsSync(readmePath)) {
      console.warn(`⚠ ${training.workshops}/${folder} has no README.md — skipped`);
      continue;
    }

    const raw = await readFile(readmePath, 'utf8');
    const { title, description, body } = parse(raw, folder);
    const sourcePath = `${training.workshops}/${folder}`;
    const href = `/${training.slug}/${toSlug(folder)}/`;

    // The theory questions that open the workshop. A workshop without any — the
    // Vue final project teaches nothing new — simply keeps its README as it is.
    const questions = await quizFor(training.slug, folder);
    const quiz = questions
      ? [
          '## Before you start — check the theory',
          '',
          `A few questions on ${training.label} theory this workshop builds on. Send them`,
          'and the correction opens, with the reasoning behind each answer.',
          '',
          renderQuizForm({
            trainingSlug: training.slug,
            trainingLabel: training.label,
            workshopSlug: toSlug(folder),
            workshopTitle: title,
            questions,
          }),
          '',
          '## The workshop',
          '',
        ].join('\n')
      : '';

    await writeFile(
      join(outDir, `${toSlug(folder)}.md`),
      page({
        title,
        description,
        order: orderOf(folder),
        label: shortLabel(title),
        sourcePath: `${sourcePath}/README.md`,
        body: quiz + body,
        note: [
          ':::note[Where to work]',
          `Open \`${sourcePath}/\` —`,
          `[browse the folder on GitHub](${REPO_URL}/tree/${BRANCH}/${sourcePath}).`,
          ':::',
        ].join('\n'),
      }),
    );
    written++;

    // Where the quiz posts to. Hidden from the menu and from the search index —
    // it is reached by sending the form, not by browsing.
    if (questions) {
      await writeFile(
        join(outDir, `${toSlug(folder)}-answers.md`),
        [
          '---',
          `title: ${yaml(`Answers — ${shortLabel(title)}`)}`,
          `description: ${yaml(`The correction of the theory questions of ${title}.`)}`,
          'sidebar:',
          '  hidden: true',
          'pagefind: false',
          '---',
          '',
          renderAnswersBody({
            trainingSlug: training.slug,
            workshopSlug: toSlug(folder),
            workshopLabel: title,
            questions,
          }),
        ].join('\n'),
      );
      written++;
    }

    workshops.push({ href, label: shortLabel(title), title, description });
  }

  // 2. The overview: an index of links to those pages, then whatever the
  //    training's own tp/README.md says. Without the index the overview reads as
  //    "every workshop dumped on one page", which is exactly what it is not.
  const overviewPath = join(sourceDir, 'README.md');
  const overviewRaw = existsSync(overviewPath) ? await readFile(overviewPath, 'utf8') : '';
  const overview = parse(overviewRaw, `${training.label} workshops`);

  const index = [
    '## The workshops',
    '',
    '| # | Workshop | |',
    '|---|----------|---|',
    ...workshops.map((workshop, position) => {
      const name = workshop.label.replace(/^\d+\.\s*/, '');
      return `| ${position + 1} | [${name}](${workshop.href}) | ${workshop.description} |`;
    }),
    '',
    `[Resources — the deck, the workshop handbook and the solutions](/${training.slug}/resources/)`,
  ].join('\n');

  await writeFile(
    join(outDir, 'index.md'),
    page({
      title: overview.title,
      description: overview.description,
      order: 0,
      label: 'Overview',
      sourcePath: `${training.workshops}/README.md`,
      body: overviewRaw ? `${index}\n\n## About these workshops\n\n${overview.body}` : index,
      note: [
        ':::note[Where the code lives]',
        `The workshops themselves are in \`${training.workshops}/\` —`,
        `[browse them on GitHub](${REPO_URL}/tree/${BRANCH}/${training.workshops}).`,
        'This site publishes the instructions; the code stays in the repository.',
        ':::',
      ].join('\n'),
    }),
  );
  written++;

  // 3. Resources: everything downloadable, produced by scripts/build-all.mjs.
  //    A link is only rendered if the file is there — the PDF export of a very
  //    large deck can legitimately fail without taking the deploy down.
  const pdf = `${training.slug}-slides.pdf`;
  const handbook = `${training.slug}-workshops.pdf`;
  const zipFile = `${training.slug}-solutions.zip`;

  await writeFile(
    join(outDir, 'resources.md'),
    [
      '---',
      `title: ${yaml('Resources')}`,
      `description: ${yaml(`The ${training.label} deck, the ${workshops.length} workshops as a printable handbook, and the worked solutions.`)}`,
      'sidebar:',
      '  order: 999',
      '  label: "Resources"',
      '---',
      '',
      '## Slides',
      '',
      `- **[Read the deck online](/slides/${training.slug}/)** — press <kbd>f</kbd> for fullscreen, <kbd>o</kbd> for the slide overview.`,
      downloadable(pdf)
        ? `- **[Download the slides (PDF)](/downloads/${pdf})** — the same deck, printable, for taking notes offline.`
        : `- _No PDF export of this deck was produced by this build. To make one: \`npm run dev -- ${training.deck}\` in \`training/\`, open the **/export/** page it prints, and let the browser save it._`,
      '',
      '## Workshops',
      '',
      `- **[Read them online](/${training.slug}/)** — the same instructions as below, one page per workshop.`,
      downloadable(handbook)
        ? `- **[Download the handbook (PDF)](/downloads/${handbook})** — the ${workshops.length} workshops in one printable booklet: cover, contents, then one workshop per page.`
        : '- _The workshop handbook was not produced by this build._',
      '',
      '## Solutions',
      '',
      downloadable(zipFile)
        ? `- **[Download the solutions (ZIP)](/downloads/${zipFile})** — a complete, runnable answer for each of the ${workshops.length} workshops.`
        : '- _The solutions archive was not produced by this build._',
      '',
      ':::caution[Not before you have tried]',
      'The workshops are written so that the starters fail in instructive ways. A',
      'learner who reads the answer first never sees the problem the answer is for.',
      'Open the archive **after** the correction, to compare it with what you wrote.',
      ':::',
      '',
      '## Feedback',
      '',
      `- **[Tell me what you thought](/${training.slug}/feedback/)** — two minutes, at the end of the training. The next session is built on it.`,
      '',
      '## Elsewhere',
      '',
      `- [The whole repository on GitHub](${REPO_URL})`,
      `- [The workshop folders](${REPO_URL}/tree/${BRANCH}/${training.workshops})`,
      '',
    ].join('\n'),
  );
  written++;

  // 4. Feedback: a Netlify form, one per training so the answers arrive in two
  //    separate lists. The markup lives in a component — this page only places
  //    it, and the form is only collected from a production deploy.
  await writeFile(
    join(outDir, 'feedback.mdx'),
    [
      '---',
      `title: ${yaml('Feedback')}`,
      `description: ${yaml(`Tell me what worked and what did not in the ${training.label} training — it is what the next session is built on.`)}`,
      'sidebar:',
      // After Resources (999), which is the last workshop page.
      '  order: 1000',
      '  label: "Feedback"',
      '---',
      '',
      "import FeedbackForm from '../../../components/FeedbackForm.astro';",
      '',
      'Two minutes at the end of the training, and the next one is better for it.',
      'Nothing here is required except the rating, and you can stay anonymous —',
      'the name and the email are only there if you want an answer.',
      '',
      `<FeedbackForm slug=${yaml(training.slug)} label=${yaml(training.label)} />`,
      '',
    ].join('\n'),
  );
  written++;

  //    Where the form posts to. Hidden from the menu and from the search index:
  //    it is only ever reached by submitting the form.
  await writeFile(
    join(outDir, 'feedback-thanks.md'),
    [
      '---',
      `title: ${yaml('Thank you')}`,
      `description: ${yaml(`Your feedback on the ${training.label} training was sent.`)}`,
      'sidebar:',
      '  hidden: true',
      'pagefind: false',
      '---',
      '',
      'It landed. Thank you — this is what the next session gets built on.',
      '',
      `- [Back to the ${training.label} workshops](/${training.slug}/)`,
      `- [Resources — the deck, the handbook and the solutions](/${training.slug}/resources/)`,
      '',
    ].join('\n'),
  );
  written++;

  console.log(`✔ ${training.label}: ${folders.length} workshops`);
}

console.log(`${written} pages written to src/content/docs/`);
