// The EcoIndex of a page (https://www.ecoindex.fr/comment-ca-marche/): the same
// algorithm as the ecoindex.fr site, the GreenIT-Analysis extension and the
// `ecoindex` Python package. Three numbers in, a score out of 100 and a grade.
//
// Each measure is placed among the pages of the HTTP Archive: its quantile, 0
// to 20. The DOM weighs 3, the requests 2, the size 1.

const QUANTILES = {
  dom: [0, 47, 75, 159, 233, 298, 358, 417, 476, 537, 603, 674, 753, 843, 949, 1076, 1237, 1459, 1801, 2479, 594601],
  requests: [0, 2, 15, 25, 34, 42, 49, 56, 63, 70, 78, 86, 95, 105, 117, 130, 147, 170, 205, 281, 3920],
  sizeKb: [
    0, 1.37, 144.7, 319.53, 479.46, 631.97, 783.38, 937.91, 1098.62, 1265.47, 1448.32, 1648.27, 1876.08, 2142.06,
    2465.37, 2866.31, 3401.59, 4155.73, 5400.08, 8037.54, 223212.26,
  ],
};

const GRADES = [
  ['A', 80],
  ['B', 70],
  ['C', 55],
  ['D', 40],
  ['E', 25],
  ['F', 10],
];

function quantile(quantiles, value) {
  for (let i = 1; i < quantiles.length; i++) {
    if (value < quantiles[i]) return i - 1 + (value - quantiles[i - 1]) / (quantiles[i] - quantiles[i - 1]);
  }
  return quantiles.length - 1;
}

const round = (value, digits) => Math.round(value * 10 ** digits) / 10 ** digits;

/** { dom: elements, requests: count, sizeKb: transferred kB } → { score, grade, ghg (gCO2e), water (cl) } */
export function ecoIndex({ dom, requests, sizeKb }) {
  const weighted = 3 * quantile(QUANTILES.dom, dom) + 2 * quantile(QUANTILES.requests, requests) + quantile(QUANTILES.sizeKb, sizeKb);
  const score = Math.min(100, Math.max(0, 100 - (5 * weighted) / 6));
  const grade = GRADES.find(([, floor]) => score > floor)?.[0] ?? 'G';
  return {
    score: round(score, 1),
    grade,
    ghg: round(2 + (2 * (50 - score)) / 100, 2),
    water: round(3 + (3 * (50 - score)) / 100, 2),
  };
}
