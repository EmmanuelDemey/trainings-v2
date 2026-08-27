// Renders a workshop quiz twice: as the Netlify form that opens the workshop
// page, and as the correction page the form posts to.
//
// The form is emitted as **raw HTML inside a Markdown page**, which imposes one
// rule on everything below: no blank line anywhere in the output. A blank line
// closes an HTML block in CommonMark, and the rest of the form would be parsed
// as Markdown. `lines()` enforces it rather than trusting each template.

import { fieldName } from '../../scripts/quizzes/index.mjs';

const escapeHtml = (text) =>
  String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');

/** The little Markdown the questions use — `code` and **bold** — as HTML. */
const inline = (text) =>
  escapeHtml(text)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

/** The same text with the Markdown markers dropped — for a radio's value. */
const plain = (text) => String(text).replaceAll('`', '').replaceAll('**', '');

/** Joins template fragments, dropping the blank lines that would end the block. */
const lines = (...fragments) => fragments.flat(Infinity).filter((line) => line !== undefined && line.trim() !== '').join('\n');

/**
 * The quiz that opens a workshop page.
 *
 * Nothing here says which option is right: the answers live on the page the form
 * redirects to. That page is public — this is a warm-up, not an exam.
 */
export function renderQuizForm({ trainingSlug, trainingLabel, workshopSlug, workshopTitle, questions }) {
  const formName = `quiz-${trainingSlug}-${workshopSlug}`;

  return lines(
    `<form class="quiz" name="${formName}" method="POST" action="/${trainingSlug}/${workshopSlug}-answers/" data-netlify="true" data-netlify-honeypot="bot-field">`,
    `<input type="hidden" name="form-name" value="${formName}" />`,
    `<input type="hidden" name="training" value="${escapeHtml(trainingLabel)}" />`,
    `<input type="hidden" name="workshop" value="${escapeHtml(workshopTitle)}" />`,
    '<p class="quiz__honeypot"><label>Leave this field empty <input name="bot-field" tabindex="-1" autocomplete="off" /></label></p>',
    questions.map((question, index) => renderQuestion(question, index)),
    '<p class="quiz__field"><label for="quiz-name">Your name <span class="quiz__hint">(optional)</span></label><input id="quiz-name" type="text" name="name" autocomplete="name" /></p>',
    '<p class="quiz__field"><label for="quiz-notes">Anything from the chapter you would like re-explained? <span class="quiz__hint">(optional)</span></label><textarea id="quiz-notes" name="notes" rows="2"></textarea></p>',
    '<button type="submit" class="quiz__submit">Send my answers and see the correction</button>',
    '</form>',
  );
}

function renderQuestion(question, index) {
  const field = fieldName(question);

  return lines(
    '<fieldset class="quiz__question">',
    `<legend><span class="quiz__number">${index + 1}</span> ${inline(question.prompt)}</legend>`,
    // Blank lines are collapsed: they would close the surrounding HTML block.
    question.code
      ? `<pre class="quiz__code"><code>${escapeHtml(question.code.source.replace(/\n{2,}/g, '\n'))}</code></pre>`
      : undefined,
    question.options.map(
      (option) =>
        `<label class="quiz__option"><input type="radio" name="${field}" value="${escapeHtml(`${option.letter}. ${plain(option.text)}`)}" required /> <span><b>${option.letter}.</b> ${inline(option.text)}</span></label>`,
    ),
    '</fieldset>',
  );
}

/** The correction, as Markdown — the page the form posts to. */
export function renderAnswersBody({ trainingSlug, workshopSlug, workshopLabel, questions }) {
  const body = questions.flatMap((question, index) => [
    `### ${index + 1}. ${question.prompt}`,
    '',
    ...(question.code ? ['```' + question.code.language, question.code.source, '```', ''] : []),
    ...question.options.map(
      (option) =>
        `- ${option.letter === question.answer ? '✅' : '▫️'} **${option.letter}.** ${option.text}`,
    ),
    '',
    `> ${question.explanation}`,
    '',
  ]);

  return [
    'Here is the correction. Compare it with what you sent, then open the workshop.',
    '',
    ...body,
    `[← Back to ${workshopLabel}](/${trainingSlug}/${workshopSlug}/)`,
    '',
  ].join('\n');
}
