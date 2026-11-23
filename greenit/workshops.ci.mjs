// What the CI checks in these workshops before each deploy — see scripts/workshops-ci.mjs.
//
// The workshops are plain HTML with no package.json: scripts/verify.mjs measures
// every workshop page in Chromium (Playwright, and the EcoIndex of
// scripts/ecoindex.mjs), against the solutions (they must pass) and against the
// starters (they must fail — a starter that passes means a solution leaked into
// it). Workshops 1, 2, 3 and 6 (a footprint, a self-assessment, an AI feature,
// a roadmap) have nothing to run.
export default {
  verifyScript: true,
};
