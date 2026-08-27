// The theory-recall questions asked at the start of each workshop.
//
// Two sources, one shape:
//
//   - **Advanced Vue.js** — parsed straight out of the deck. Every chapter ends
//     with `# Quiz — Question n / m` slides that already hold the question, four
//     options and the answer with its explanation. Reading them here means the
//     site can never drift from what was taught.
//   - **JavaScript** — the deck has no quiz slides, so the questions live in
//     ./javascript.mjs, written against the chapters they recall.
//
// The answers stay out of `training/chapters/*/tp/` on purpose: that folder is
// the one the learner opens to work in.

import { readFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import JAVASCRIPT_QUESTIONS from './javascript.mjs';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

/**
 * Where each workshop's questions come from, per training slug then per workshop
 * folder. `chapters` are parsed; `questions` are taken as they are.
 *
 * A workshop absent from this map simply gets no quiz — `10_final_project`
 * teaches nothing new, so there is nothing to recall.
 */
export const QUIZ_SOURCES = {
  javascript: Object.fromEntries(
    Object.entries(JAVASCRIPT_QUESTIONS).map(([folder, questions]) => [folder, { questions }]),
  ),
  'vuejs-advanced': {
    '02_advanced_components': { chapters: ['02_advanced_components.md'] },
    '03_composables_directives': { chapters: ['03_composables_directives.md'] },
    // "TP 4 & 8 — Testing" covers both testing chapters, so it asks both quizzes.
    '04_testing': { chapters: ['04_testing_fundamentals.md', '08_testing_integration.md'] },
    '05_router': { chapters: ['05_router.md'] },
    '06_pinia': { chapters: ['06_pinia.md'] },
    '07_forms': { chapters: ['07_forms.md'] },
    '09_production': { chapters: ['09_production.md'] },
  },
};

/** Where a training's chapters live, for the `chapters` entries above. */
const CHAPTER_DIR = {
  javascript: 'training/chapters/javascript',
  'vuejs-advanced': 'training/chapters/vuejs_advanced',
};

/**
 * Pulls the quiz slides out of one chapter.
 *
 * The slides are regular enough to parse, and irregular enough that each of the
 * three parts below earned its own step: a question can be introduced by a code
 * block, an option can wrap onto a second line, and the answer is a blockquote
 * hidden behind a `<v-click>`.
 */
export function parseChapterQuiz(markdown) {
  return markdown
    .split(/^---$/m)
    .filter((slide) => /^# Quiz — Question/m.test(slide))
    .map(parseQuizSlide)
    .filter(Boolean);
}

function parseQuizSlide(slide) {
  const lines = slide.split('\n');
  const firstOption = lines.findIndex((line) => /^- \*\*[A-Z]\.\*\* /.test(line));
  if (firstOption === -1) return null;

  const head = lines.slice(0, firstOption).join('\n');

  // A code block, when the question is "what does this snippet do?".
  const codeMatch = head.match(/```(\w*)\n([\s\S]*?)```/);
  const code = codeMatch ? { language: codeMatch[1] || 'text', source: codeMatch[2].trimEnd() } : undefined;

  // The question itself: the bold paragraph, which may span several lines.
  const promptMatch = head.replace(/```[\s\S]*?```/g, '').match(/\*\*([\s\S]+?)\*\*/);
  if (!promptMatch) return null;
  const prompt = collapse(promptMatch[1]);

  // The options, each possibly wrapped onto a continuation line.
  const options = [];
  for (const line of lines.slice(firstOption)) {
    const start = line.match(/^- \*\*([A-Z])\.\*\* (.*)$/);
    if (start) {
      options.push({ letter: start[1], text: start[2] });
      continue;
    }
    if (line.trim() === '') break;
    if (options.length > 0) options[options.length - 1].text += ` ${line.trim()}`;
  }
  if (options.length < 2) return null;

  // The answer: `> ✅ **C** — because…`, spread over the blockquote's lines.
  const answerBlock = slide
    .split('\n')
    .filter((line) => line.startsWith('> '))
    .map((line) => line.slice(2))
    .join(' ');
  const answerMatch = answerBlock.match(/✅\s*\*\*([A-Z])\*\*\s*[—–-]?\s*([\s\S]*)/);
  if (!answerMatch) return null;

  return {
    prompt,
    code,
    options: options.map((option) => ({ ...option, text: collapse(option.text) })),
    answer: answerMatch[1],
    explanation: collapse(answerMatch[2]),
  };
}

const collapse = (text) => text.replace(/\s+/g, ' ').trim();

/**
 * The questions asked before one workshop, or `undefined` when it has none.
 * Chapter-sourced questions are renumbered across the chapters they come from.
 */
export async function quizFor(trainingSlug, folder) {
  const source = QUIZ_SOURCES[trainingSlug]?.[folder];
  if (!source) return undefined;

  let questions = source.questions ?? [];

  for (const chapter of source.chapters ?? []) {
    const path = resolve(repoRoot, CHAPTER_DIR[trainingSlug], chapter);
    questions = questions.concat(parseChapterQuiz(await readFile(path, 'utf8')));
  }

  if (questions.length === 0) return undefined;
  return questions.map((question, index) => ({ ...question, id: `q${index + 1}` }));
}

/**
 * The name a question's answers are stored under in Netlify.
 *
 * `q3-what-does-the-delay-option` rather than `q3`: the CSV export of a form is
 * read months later, by which time only the header says what was asked.
 */
export function fieldName(question) {
  const slug = question.prompt
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .split('-')
    .slice(0, 7)
    .join('-');
  return `${question.id}-${slug}`.slice(0, 60).replace(/-$/, '');
}
