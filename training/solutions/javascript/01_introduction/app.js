// TP 1 - First steps — solution

// TODO 1 — the very first line of JavaScript everybody writes.
console.log('Hello world!');

// TODO 2 — `document` is provided by the browser, not by the language.
//   Everything the page exposes hangs off it (chapter 5).
console.log('Page title:', document.title);

const languages = [
  { name: 'JavaScript', year: 1995 },
  { name: 'TypeScript', year: 2012 },
  { name: 'Python', year: 1991 },
];

// TODO 3 — console.table renders an array of objects as a real table, with one
//   column per key. The moment you are debugging data rather than control flow,
//   reach for it instead of console.log.
console.table(languages);

// TODO 4 — console.error is not just red: the console attaches a stack trace,
//   so you get the chain of calls that led here for free.
console.error('This is what an error looks like in the console.');

// TODO 5 — the classic beginner error, on purpose.
//   `lenght` is a typo, so `languages.lenght` is undefined (reading a missing
//   property is NOT an error — chapter 2), and calling .toFixed() on undefined
//   IS one: "Cannot read properties of undefined (reading 'toFixed')".
//   Note what the message tells you: the culprit is the value BEFORE the dot.
// console.log(languages.lenght.toFixed(2));

// Going further.
console.group('Going further');
console.warn('console.warn is the yellow one.');
console.count('I have been called');
console.count('I have been called');
console.groupEnd();
