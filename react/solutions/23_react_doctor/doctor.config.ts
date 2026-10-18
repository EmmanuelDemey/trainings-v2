import { defineConfig } from 'react-doctor/api';

// Read by `npm run doctor` (and by any `npx react-doctor` run from this folder).
// Command-line flags win over this file.
export default defineConfig({
  // A key built from the index is the bug of step 6: once fixed, make sure it
  // never comes back — an error fails `npm run doctor`, whatever `blocking` says.
  rules: {
    'react-doctor/no-array-index-as-key': 'error',
  },
  // Every remaining warning fails the script too: this app is at 100 / 100,
  // keep it there. On a legacy codebase you would start from `'error'` and
  // `--scope changed` instead.
  blocking: 'warning',
  ignore: {
    // The specs and their helpers render on purpose in ways an app would not.
    files: ['src/**/*.spec.tsx', 'src/tests/**'],
  },
});
