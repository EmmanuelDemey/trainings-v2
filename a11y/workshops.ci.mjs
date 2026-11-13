// What the CI checks in these workshops before each deploy — see scripts/workshops-ci.mjs.
//
// The workshops are plain HTML with no package.json: scripts/verify.mjs drives
// every workshop in Chromium (Playwright, plus axe-core for workshop 8), against
// the solutions (they must pass) and against the starters (they must fail — a
// starter that passes means a solution leaked into it). Workshops 1 and 2 (a
// screen reader, a manual audit) have nothing to run.
export default {
  verifyScript: true,
};
