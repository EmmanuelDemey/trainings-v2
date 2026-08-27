// TP 2 - Sketching snippets
// Replace every PREDICT_ME with the value you expect, THEN reload.

console.group('Snippets');

// --- Snippet 1 — primitives are copied by value ---------------------------
let a = 10;
let b = a;
a = 20;
predict('b', b, PREDICT_ME);

// --- Snippet 2 — objects are shared -------------------------------------
const user = { name: 'Ada' };
const admin = user;
admin.name = 'Grace';
predict('user.name', user.name, PREDICT_ME);

// --- Snippet 3 — const protects the wire, not the value ------------------
const scores = [1, 2];
scores.push(3);
predict('scores.length', scores.length, PREDICT_ME);

// --- Snippet 4 — reading what is not there --------------------------------
const config = { theme: 'dark' };
predict('config.language', config.language, PREDICT_ME);
predict('typeof config.language', typeof config.language, PREDICT_ME);

// --- Snippet 5 — equality and types ---------------------------------------
predict("'2' === 2", '2' === 2, PREDICT_ME);
predict('NaN === NaN', NaN === NaN, PREDICT_ME);

// --- Snippet 6 — two objects that look the same ---------------------------
predict('{} === {}', {} === {}, PREDICT_ME);
// TODO: in one sentence, why is the line above what it is?
//   Your answer:

console.groupEnd();
report('predictions correct');

// --- Truthy / falsy --------------------------------------------------------
console.group('Truthy / falsy');

// TODO: return true if `value` is truthy, false otherwise.
//   Constraint: do NOT use Boolean(value) nor !!value — use an `if`.
function isTruthy(value) {
  // your code here
}

[
  [0, false],
  [1, true],
  ['', false],
  ['0', true],
  [' ', true],
  [null, false],
  [undefined, false],
  [NaN, false],
  [[], true],
  [{}, true],
  [-1, true],
  [false, false],
].forEach(([value, expected]) => {
  predict(`isTruthy(${format(value)})`, isTruthy(value), expected);
});

console.groupEnd();
report('classified');
