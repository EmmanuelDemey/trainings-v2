// The environmental budget of a page: a few limits, checked against a measure.
// Read by scripts/measure.mjs, and by the budget file of workshop 5.

const GRADES = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

const LIMITS = {
  maxDom: (page, max) => ({ label: `DOM ${page.dom} elements ≤ ${max}`, over: page.dom - max, unit: ' elements' }),
  maxRequests: (page, max) => ({ label: `requests ${page.requests} ≤ ${max}`, over: page.requests - max, unit: '' }),
  maxSizeKb: (page, max) => ({ label: `size ${Math.round(page.sizeKb)} kB ≤ ${max} kB`, over: Math.round(page.sizeKb - max), unit: ' kB' }),
  minGrade: (page, min) => ({
    label: `EcoIndex ${page.grade} (${page.score}) at least ${min}`,
    over: GRADES.indexOf(page.grade) - GRADES.indexOf(min),
    unit: ' grade(s)',
  }),
};

/** { dom, requests, sizeKb, score, grade }, { maxDom?, maxRequests?, maxSizeKb?, minGrade? } → { ok, lines } */
export function checkBudget(page, budget) {
  const keys = Object.keys(budget);
  if (keys.length === 0) throw new Error('The budget is empty: set at least one of ' + Object.keys(LIMITS).join(', '));
  const unknown = keys.filter((key) => !(key in LIMITS));
  if (unknown.length > 0) throw new Error(`Unknown budget key(s): ${unknown.join(', ')} — expected ${Object.keys(LIMITS).join(', ')}`);

  const lines = keys.map((key) => {
    const { label, over, unit } = LIMITS[key](page, budget[key]);
    return over > 0 ? { ok: false, label, over: `+${over}${unit}` } : { ok: true, label };
  });
  return { ok: lines.every((line) => line.ok), lines };
}
