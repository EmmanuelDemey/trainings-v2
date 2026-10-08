// What .github/workflows/workshops.yml checks here — see scripts/workshops-ci.mjs.
//
// The workshops are plain HTML with no package.json: scripts/verify.mjs runs
// the suite of every workshop against the solutions (they must pass) and
// against the starters (they must fail — a starter that passes means a
// solution leaked into it).
export default {
  verifyScript: true,
};
