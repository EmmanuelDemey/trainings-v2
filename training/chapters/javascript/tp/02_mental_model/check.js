// Small test helper for this workshop — you do not need to modify it.

const PREDICT_ME = Symbol('predict me');

let passed = 0;
let total = 0;

function predict(label, actual, expected) {
  total++;
  if (expected === PREDICT_ME) {
    console.warn(`⬜ ${label} — no prediction yet`);
    return;
  }
  // Object.is instead of === so that NaN compares equal to NaN here.
  if (Object.is(actual, expected)) {
    passed++;
    console.log(`✅ ${label} → ${format(actual)}`);
  } else {
    console.error(
      `❌ ${label} — you predicted ${format(expected)}, it is ${format(actual)}`,
    );
  }
}

function format(value) {
  if (typeof value === 'string') return `'${value}'`;
  if (typeof value === 'symbol') return String(value);
  if (typeof value === 'object' && value !== null) return JSON.stringify(value);
  return String(value);
}

function report(kind) {
  console.log(`%c${passed}/${total} ${kind}`, 'font-weight: bold');
  passed = 0;
  total = 0;
}
